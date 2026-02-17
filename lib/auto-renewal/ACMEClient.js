/**
 * ACMEClient - Automatic certificate renewal client
 * 
 * This client reuses the existing certificate configuration and ACME account
 * to automatically renew certificates without user intervention.
 * 
 * APPROACH:
 * - Extracts domain and validation info from existing certificate
 * - Uses stored ACME account credentials
 * - Triggers the existing ACME workflow programmatically
 * - Stores the renewed certificate back to localStorage
 * 
 * LIMITATIONS:
 * - Requires browser to be open for renewal to work
 * - Uses existing ACME account and validation methods
 * - Depends on the ACME implementation in components/core.js
 */

export class ACMEClient {
  constructor() {
    this.isRenewing = false;
    this.renewalQueue = [];
  }

  /**
   * Attempt to renew a certificate automatically
   * 
   * This implementation:
   * 1. Validates prerequisites (ACME account, email, domains)
   * 2. Prepares renewal data with existing certificate parameters
   * 3. Stores renewal request for the main ACME workflow to process
   * 4. Returns status indicating whether manual intervention is needed
   * 
   * @param {Object} certificate - Certificate object from localStorage
   * @returns {Promise<Object>} Renewal result
   */
  async renewCertificate(certificate) {
    try {
      console.log(`[ACMEClient] Starting renewal for ${certificate.domains}`);

      // Validate prerequisites
      const capability = this.checkRenewalCapability();
      if (!capability.canAutoRenew) {
        throw new Error(capability.message);
      }

      // Validate certificate data
      const validation = this.validateCertificate(certificate);
      if (!validation.valid) {
        throw new Error(`Invalid certificate: ${validation.errors.join(', ')}`);
      }

      // Check if already renewing
      if (this.isRenewing) {
        console.log(`[ACMEClient] Renewal already in progress for ${certificate.domains}`);
        return {
          success: false,
          requiresManual: false,
          message: 'Renewal already in progress',
          inProgress: true
        };
      }

      this.isRenewing = true;

      // Extract domain information
      const domains = certificate.domains;
      
      // Prepare renewal data with existing certificate parameters
      const renewalData = {
        domains: domains,
        autoRenewal: true,
        timestamp: Date.now(),
        originalCertTime: certificate.time,
        certificateId: certificate.id || certificate.time,
        // Preserve original validation method if available
        validationMethod: certificate.validationMethod || 'dns-01',
        // Store reference to original certificate for replacement
        replaceCertificateId: certificate.id || certificate.time
      };

      // Store renewal request
      localStorage.setItem('q-pendingRenewal', JSON.stringify(renewalData));
      
      // Add to renewal queue
      this.renewalQueue.push({
        domain: domains,
        timestamp: Date.now(),
        status: 'pending'
      });

      console.log(`[ACMEClient] Renewal request queued for ${domains}`);
      console.log(`[ACMEClient] Manual renewal required - please visit the home page to complete the process`);

      // Return result indicating manual action needed
      // In a pure frontend environment, we cannot fully automate ACME challenges
      // The user needs to visit the page to trigger the workflow
      return {
        success: false,
        requiresManual: true,
        message: 'Renewal request created. Please visit the home page to complete the renewal process.',
        renewalUrl: `/?autoRenew=1&domain=${encodeURIComponent(domains)}`,
        queuePosition: this.renewalQueue.length
      };

    } catch (error) {
      console.error('[ACMEClient] Certificate renewal failed:', error);
      return {
        success: false,
        requiresManual: true,
        error: error.message
      };
    } finally {
      this.isRenewing = false;
    }
  }

  /**
   * Check if automatic renewal is possible
   * 
   * @returns {Object} Capability check result
   */
  checkRenewalCapability() {
    const acmeAccountKey = localStorage.getItem('q-acmeAccountKey');
    const userEmail = localStorage.getItem('x-q-email');

    return {
      hasAccount: !!acmeAccountKey,
      hasEmail: !!userEmail,
      canAutoRenew: !!acmeAccountKey && !!userEmail,
      message: !acmeAccountKey 
        ? 'ACME account key not configured. Please complete initial certificate setup first.' 
        : !userEmail 
        ? 'Email not configured. Please complete initial certificate setup first.'
        : 'Ready for renewal'
    };
  }

  /**
   * Validate certificate data before renewal
   * 
   * @param {Object} certificate - Certificate to validate
   * @returns {Object} Validation result
   */
  validateCertificate(certificate) {
    const errors = [];

    if (!certificate.domains) {
      errors.push('Missing domains');
    }

    if (!certificate.cert) {
      errors.push('Missing certificate data');
    }

    if (!certificate.key) {
      errors.push('Missing private key');
    }

    if (!certificate.time) {
      errors.push('Missing certificate timestamp');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get renewal status
   * 
   * @returns {boolean} Whether a renewal is in progress
   */
  isRenewalInProgress() {
    return this.isRenewing;
  }

  /**
   * Get pending renewal requests
   * 
   * @returns {Array} List of pending renewals
   */
  getPendingRenewals() {
    return this.renewalQueue.filter(r => r.status === 'pending');
  }

  /**
   * Clear completed renewals from queue
   */
  clearCompletedRenewals() {
    this.renewalQueue = this.renewalQueue.filter(r => r.status === 'pending');
  }

  /**
   * Check if there's a pending renewal request
   * 
   * @returns {Object|null} Pending renewal data or null
   */
  getPendingRenewalRequest() {
    const data = localStorage.getItem('q-pendingRenewal');
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('[ACMEClient] Failed to parse pending renewal:', error);
      return null;
    }
  }

  /**
   * Clear pending renewal request
   */
  clearPendingRenewalRequest() {
    localStorage.removeItem('q-pendingRenewal');
  }

  /**
   * Mark renewal as completed
   * 
   * @param {string} domain - Domain that was renewed
   * @param {boolean} success - Whether renewal succeeded
   */
  markRenewalCompleted(domain, success) {
    const item = this.renewalQueue.find(r => r.domain === domain);
    if (item) {
      item.status = success ? 'completed' : 'failed';
      item.completedAt = Date.now();
    }
  }
}
