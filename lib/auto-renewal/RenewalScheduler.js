/**
 * RenewalScheduler - Schedules and executes certificate renewal tasks
 * Runs periodic checks and triggers renewal for expiring certificates
 */

import { CertificateScanner } from './CertificateScanner.js';
import { ConfigManager } from './ConfigManager.js';
import { HistoryManager } from './HistoryManager.js';
import { TelegramNotifier } from './TelegramNotifier.js';
import { ACMEClient } from './ACMEClient.js';

export class RenewalScheduler {
  constructor() {
    this.scanner = new CertificateScanner();
    this.configManager = new ConfigManager();
    this.historyManager = new HistoryManager();
    this.telegramNotifier = new TelegramNotifier();
    this.acmeClient = new ACMEClient();
    this.intervalId = null;
    this.isRunning = false;
    this.notifiedDomains = new Set(); // 记录已通知的域名，避免重复通知
  }

  /**
   * Start the renewal scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('Renewal scheduler is already running');
      return;
    }

    console.log('Starting renewal scheduler...');
    this.isRunning = true;

    // Run initial check
    this.checkAndRenew();

    // Set up periodic checks
    const config = this.configManager.getAutoRenewalConfig();
    this.intervalId = setInterval(() => {
      this.checkAndRenew();
    }, config.checkInterval);
  }

  /**
   * Stop the renewal scheduler
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping renewal scheduler...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
  }

  /**
   * Check certificates and trigger renewal if needed
   */
  async checkAndRenew() {
    try {
      console.log('Running certificate expiry check...');

      // Check if auto-renewal is globally enabled
      if (!this.configManager.isGloballyEnabled()) {
        console.log('Auto-renewal is disabled globally');
        return;
      }

      const config = this.configManager.getAutoRenewalConfig();
      const expiringCerts = this.scanner.detectExpiringCertificates(config.threshold);

      console.log(`Found ${expiringCerts.length} certificate(s) needing renewal`);

      for (const cert of expiringCerts) {
        // Check if auto-renewal is enabled for this certificate
        if (!this.configManager.isCertAutoRenewalEnabled(cert.domains)) {
          console.log(`Auto-renewal disabled for ${cert.domains}`);
          continue;
        }

        // Send expiring notification (only once per domain)
        if (!this.notifiedDomains.has(cert.domains) && !cert.isExpired) {
          await this.telegramNotifier.notifyExpiring(cert.domains, cert.daysUntilExpiry);
          this.notifiedDomains.add(cert.domains);
        }

        // Check if already in progress
        if (cert.renewalStatus === 'in_progress') {
          console.log(`Renewal already in progress for ${cert.domains}`);
          continue;
        }

        // Create and execute renewal job
        const job = this.createRenewalJob(cert);
        await this.executeRenewalJob(job);
      }
    } catch (error) {
      console.error('Error in checkAndRenew:', error);
    }
  }

  /**
   * Create a renewal job
   * @param {Object} cert - Certificate object
   * @returns {Object} Renewal job
   */
  createRenewalJob(cert) {
    return {
      id: `renewal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      domain: cert.domains,
      status: 'pending',
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      error: null,
      originalCert: cert,
      newCert: null
    };
  }

  /**
   * Execute a renewal job
   * @param {Object} job - Renewal job
   */
  async executeRenewalJob(job) {
    try {
      console.log(`Starting renewal job for ${job.domain}`);
      
      job.status = 'in_progress';
      job.startedAt = Date.now();

      // Update certificate status
      this.scanner.updateCertificate(job.originalCert.id, {
        renewalStatus: 'in_progress',
        lastRenewalAttempt: Date.now()
      });

      // Record history
      this.historyManager.recordRenewal(
        job.domain,
        'in_progress',
        null,
        this.scanner.getExpiryDate(job.originalCert).getTime()
      );

      // Attempt automatic renewal using ACMEClient
      console.log(`[RenewalScheduler] Attempting automatic renewal for ${job.domain}`);
      const renewalResult = await this.acmeClient.renewCertificate(job.originalCert);

      if (renewalResult.success) {
        // Renewal succeeded
        console.log(`[RenewalScheduler] Renewal succeeded for ${job.domain}`);
        
        job.status = 'completed';
        job.completedAt = Date.now();
        job.newCert = renewalResult.certificate;

        this.scanner.updateCertificate(job.originalCert.id, {
          renewalStatus: 'success',
          lastRenewalSuccess: Date.now()
        });

        this.historyManager.recordRenewal(
          job.domain,
          'success',
          null,
          this.scanner.getExpiryDate(job.originalCert).getTime()
        );

        // Clear notification flag on success
        this.notifiedDomains.delete(job.domain);

        // Note: We don't send success notifications per user requirement
        // "正常情况不要通知" - normal situations should not notify

      } else if (renewalResult.requiresManual) {
        // Manual intervention required
        console.log(`[RenewalScheduler] Manual renewal required for ${job.domain}`);
        console.log(`[RenewalScheduler] Reason: ${renewalResult.message}`);
        console.log(`[RenewalScheduler] Renewal URL: ${renewalResult.renewalUrl}`);

        job.status = 'manual_required';
        job.completedAt = Date.now();
        job.error = renewalResult.message;
        job.renewalUrl = renewalResult.renewalUrl;

        this.scanner.updateCertificate(job.originalCert.id, {
          renewalStatus: 'manual_required',
          renewalUrl: renewalResult.renewalUrl
        });

        this.historyManager.recordRenewal(
          job.domain,
          'manual_required',
          renewalResult.message,
          this.scanner.getExpiryDate(job.originalCert).getTime()
        );

        // Send notification for manual action needed
        await this.telegramNotifier.notifyRenewalFailure(
          job.domain, 
          `Manual renewal required: ${renewalResult.message}\nPlease visit: ${renewalResult.renewalUrl}`
        );

      } else {
        // Renewal failed
        const errorMsg = renewalResult.error || 'Unknown error occurred';
        console.error(`[RenewalScheduler] Renewal failed for ${job.domain}: ${errorMsg}`);

        job.status = 'failure';
        job.completedAt = Date.now();
        job.error = errorMsg;

        this.scanner.updateCertificate(job.originalCert.id, {
          renewalStatus: 'failure'
        });

        this.historyManager.recordRenewal(
          job.domain,
          'failure',
          errorMsg,
          this.scanner.getExpiryDate(job.originalCert).getTime()
        );

        // Send failure notification
        await this.telegramNotifier.notifyRenewalFailure(job.domain, errorMsg);
      }

      // Update config
      this.configManager.updateLastCheck(job.domain);

    } catch (error) {
      console.error(`Renewal job failed for ${job.domain}:`, error);
      
      job.status = 'failure';
      job.completedAt = Date.now();
      job.error = error.message;

      this.scanner.updateCertificate(job.originalCert.id, {
        renewalStatus: 'failure'
      });

      this.historyManager.recordRenewal(
        job.domain,
        'failure',
        error.message,
        this.scanner.getExpiryDate(job.originalCert).getTime()
      );

      // Send failure notification
      await this.telegramNotifier.notifyRenewalFailure(job.domain, error.message);
    }
  }

  /**
   * Get scheduler status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.configManager.getAutoRenewalConfig(),
      statistics: this.historyManager.getStatistics()
    };
  }
}
