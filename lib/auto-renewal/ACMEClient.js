/**
 * ACMEClient - Fully automatic certificate renewal client
 * 
 * This client implements automatic certificate renewal by leveraging:
 * 1. Let's Encrypt's 30-day authorization cache
 * 2. Existing ACME implementation in window.ACME (from core.js)
 * 3. Stored ACME account and certificate configuration
 * 
 * HOW IT WORKS:
 * - Reuses existing ACME account and certificate private key
 * - Creates new ACME order for the same domains
 * - Let's Encrypt automatically reuses valid authorizations (if within 30 days)
 * - If authorizations are cached: completes renewal automatically
 * - If authorizations expired: returns manual verification required
 * 
 * KEY INSIGHT:
 * Let's Encrypt caches domain authorizations for 30 days. If you renew within
 * 30 days of the last validation, no new DNS/HTTP verification is needed.
 * This enables true zero-touch automatic renewal.
 * 
 * REQUIREMENTS:
 * - Browser must be open for scheduler to run
 * - Renew within 30 days of previous validation (default threshold: 30 days)
 * - Same ACME account and domains as original certificate
 * - window.ACME object must be available (loaded from core.js)
 */

export class ACMEClient {
  constructor() {
    this.isRenewing = false;
    this.renewalQueue = [];
  }

  /**
   * Attempt to renew a certificate automatically
   * 
   * This method orchestrates the complete ACME renewal workflow:
   * 1. Validates prerequisites
   * 2. Loads ACME directory
   * 3. Creates ACME account session
   * 4. Creates new order
   * 5. Checks if authorizations are cached
   * 6. If cached: finalizes order and downloads certificate
   * 7. If not cached: returns manual verification required
   * 
   * @param {Object} certificate - Certificate object from localStorage
   * @returns {Promise<Object>} Renewal result
   */
  async renewCertificate(certificate) {
    try {
      console.log(`[ACMEClient] Starting automatic renewal for ${certificate.domains}`);

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
        console.log(`[ACMEClient] Renewal already in progress`);
        return {
          success: false,
          requiresManual: false,
          message: 'Renewal already in progress',
          inProgress: true
        };
      }

      this.isRenewing = true;

      try {
        // Check if window.ACME is available
        if (typeof window === 'undefined' || !window.ACME) {
          throw new Error('ACME client not available. Please ensure core.js is loaded.');
        }

        const ACME = window.ACME;
        const X509 = window.X509;

        if (!X509) {
          throw new Error('X509 utilities not available. Please ensure core.js is loaded.');
        }

        // Step 1: Load configuration
        console.log('[ACMEClient] Step 1: Loading configuration...');
        const config = await this.loadConfiguration(certificate, X509);

        // Step 2: Initialize ACME directory
        console.log('[ACMEClient] Step 2: Loading ACME directory...');
        ACME.URL = config.acmeURL;
        
        const directoryLoaded = await new Promise((resolve, reject) => {
          ACME.Directory(
            () => resolve(true),
            (err) => reject(new Error(`Failed to load ACME directory: ${err}`))
          );
        });

        if (!directoryLoaded) {
          throw new Error('Failed to load ACME directory');
        }

        // Step 3: Setup ACME account
        console.log('[ACMEClient] Step 3: Setting up ACME account...');
        ACME.StepData = {
          config: config,
          termsURL: ACME.DirData.meta?.termsOfService,
          needEAB: !!ACME.DirData.meta?.externalAccountRequired
        };

        const accountCreated = await new Promise((resolve, reject) => {
          ACME.StepAccount(
            () => resolve(true),
            (err) => reject(new Error(`ACME account error: ${err}`))
          );
        });

        if (!accountCreated) {
          throw new Error('Failed to create/verify ACME account');
        }

        console.log('[ACMEClient] ACME account verified:', ACME.StepData.account.url);

        // Step 4: Create new order
        console.log('[ACMEClient] Step 4: Creating new order...');
        const orderCreated = await new Promise((resolve, reject) => {
          ACME.StepOrder(
            (progress) => console.log(`[ACMEClient] ${progress}`),
            () => resolve(true),
            (err) => reject(new Error(`Order creation failed: ${err}`))
          );
        });

        if (!orderCreated) {
          throw new Error('Failed to create order');
        }

        console.log('[ACMEClient] Order created:', ACME.StepData.order.orderUrl);

        // Step 5: Check authorization status
        console.log('[ACMEClient] Step 5: Checking authorizations...');
        const authStatus = this.checkAuthorizationStatus(ACME.StepData.auths);

        if (!authStatus.allValid) {
          // Authorizations not cached - manual verification required
          console.log('[ACMEClient] Authorizations not cached or expired');
          console.log('[ACMEClient] Pending authorizations:', authStatus.pendingDomains);
          
          return {
            success: false,
            requiresManual: true,
            message: 'Authorization cache expired (>30 days since last validation). Manual domain verification required.',
            authorizationsNeeded: authStatus.pendingDomains,
            renewalUrl: `/?autoRenew=1&domain=${encodeURIComponent(certificate.domains)}`,
            hint: 'Please complete domain verification through the web interface, or wait until within 30 days of last validation.'
          };
        }

        console.log('[ACMEClient] ✓ All authorizations are valid (cached)!');

        // Step 6: Finalize order
        console.log('[ACMEClient] Step 6: Finalizing order...');
        const orderFinalized = await new Promise((resolve, reject) => {
          ACME.StepFinalizeOrder(
            (progress) => console.log(`[ACMEClient] ${progress}`),
            () => resolve(true),
            (err) => reject(new Error(`Order finalization failed: ${err}`))
          );
        });

        if (!orderFinalized) {
          throw new Error('Failed to finalize order');
        }

        // Step 7: Get certificate PEM
        const newCertPEM = ACME.StepData.order.downloadPEM;
        if (!newCertPEM) {
          throw new Error('Certificate download failed - no PEM data');
        }

        console.log('[ACMEClient] ✓ Certificate downloaded successfully!');

        // Step 8: Store new certificate
        console.log('[ACMEClient] Step 8: Storing new certificate...');
        this.storeCertificate(certificate, newCertPEM, config.privateKey.pem);

        console.log('[ACMEClient] ✓✓✓ Automatic renewal completed successfully! ✓✓✓');

        return {
          success: true,
          requiresManual: false,
          message: 'Certificate renewed automatically using cached authorizations',
          certificate: {
            domains: certificate.domains,
            cert: newCertPEM,
            key: config.privateKey.pem,
            time: Date.now()
          }
        };

      } catch (error) {
        console.error('[ACMEClient] Renewal failed:', error);

        // Check if it's an authorization issue
        if (error.message.includes('authorization') || 
            error.message.includes('pending') ||
            error.message.includes('invalid')) {
          return {
            success: false,
            requiresManual: true,
            message: 'Authorization verification required. Authorizations may have expired.',
            error: error.message,
            renewalUrl: `/?autoRenew=1&domain=${encodeURIComponent(certificate.domains)}`
          };
        }

        throw error;
      }

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
   * Load configuration from localStorage and certificate
   */
  async loadConfiguration(certificate, X509) {
    // Load ACME account key
    const accountKeyPEM = localStorage.getItem('q-acmeAccountKey');
    if (!accountKeyPEM) {
      throw new Error('ACME account key not found. Please complete initial certificate setup.');
    }

    // Load email
    const email = localStorage.getItem('x-q-email');
    if (!email) {
      throw new Error('Email not configured. Please complete initial certificate setup.');
    }

    // Load ACME URL (default to Let's Encrypt)
    const acmeURL = localStorage.getItem('q-acmeURL') || 'https://acme-v02.api.letsencrypt.org/directory';

    // Parse account key
    const accountKey = await new Promise((resolve, reject) => {
      X509.KeyParse(accountKeyPEM, resolve, reject, 1);
    });

    // Parse or reuse certificate private key
    let privateKey;
    if (certificate.key) {
      privateKey = await new Promise((resolve, reject) => {
        X509.KeyParse(certificate.key, resolve, reject, 1);
      });
    } else {
      throw new Error('Certificate private key not found');
    }

    // Parse domains (handle both string and array formats)
    let domains;
    if (typeof certificate.domains === 'string') {
      domains = certificate.domains.split(',').map(d => d.trim());
    } else if (Array.isArray(certificate.domains)) {
      domains = certificate.domains;
    } else {
      throw new Error('Invalid domains format');
    }

    return {
      domains: domains,
      privateKey: privateKey,
      accountKey: accountKey,
      email: email,
      acmeURL: acmeURL,
      eabKid: '',
      eabKey: ''
    };
  }

  /**
   * Check if all authorizations are valid (cached by Let's Encrypt)
   */
  checkAuthorizationStatus(auths) {
    const pendingDomains = [];
    let allValid = true;

    for (const domain in auths) {
      const auth = auths[domain];
      
      // Check if authorization is valid
      if (auth.status !== 'valid') {
        allValid = false;
        pendingDomains.push(domain);
        console.log(`[ACMEClient] Authorization for ${domain}: ${auth.status}`);
      } else {
        console.log(`[ACMEClient] Authorization for ${domain}: valid (cached)`);
      }
    }

    return {
      allValid: allValid,
      pendingDomains: pendingDomains
    };
  }

  /**
   * Store renewed certificate in localStorage
   */
  storeCertificate(oldCert, newCertPEM, privateKeyPEM) {
    // Get existing certificates
    const certsJSON = localStorage.getItem('q-certs');
    if (!certsJSON) {
      throw new Error('Certificate storage not found');
    }

    const certs = JSON.parse(certsJSON);

    // Find and update the certificate
    const certIndex = certs.findIndex(c =>
      c.domains === oldCert.domains || c.time === oldCert.time
    );

    if (certIndex === -1) {
      throw new Error('Original certificate not found in storage');
    }

    // Update certificate data
    certs[certIndex] = {
      ...certs[certIndex],
      cert: newCertPEM,
      key: privateKeyPEM,
      time: Date.now(),
      renewalStatus: 'success',
      lastRenewalSuccess: Date.now(),
      autoRenewed: true
    };

    // Save back to localStorage
    localStorage.setItem('q-certs', JSON.stringify(certs));

    console.log('[ACMEClient] Certificate stored successfully');
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
