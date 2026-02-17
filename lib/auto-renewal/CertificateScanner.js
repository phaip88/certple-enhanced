/**
 * CertificateScanner - Scans and detects expiring certificates
 * Analyzes certificate expiration dates and identifies certificates that need renewal
 */

const STORAGE_KEY = 'q-manageDataPairs';

export class CertificateScanner {
  /**
   * Scan all certificates from storage
   * @returns {Array<Object>} Array of certificate objects
   */
  scanCertificates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const certificates = JSON.parse(data);
      
      // Validate and parse each certificate
      return certificates.map((cert, index) => {
        return {
          id: index,
          domains: cert.domains || '',
          cert: cert.cert || '',
          key: cert.key || '',
          time: cert.time || new Date().toISOString(),
          autoRenewal: cert.autoRenewal !== undefined ? cert.autoRenewal : true,
          renewalStatus: cert.renewalStatus || 'idle',
          lastRenewalAttempt: cert.lastRenewalAttempt || null
        };
      });
    } catch (error) {
      console.error('Failed to scan certificates:', error);
      return [];
    }
  }

  /**
   * Detect certificates that are expiring soon
   * @param {number} threshold - Days before expiration to trigger renewal (default: 30)
   * @returns {Array<Object>} Certificates that need renewal
   */
  detectExpiringCertificates(threshold = 30) {
    const certificates = this.scanCertificates();
    const now = new Date();
    const expiringCerts = [];

    for (const cert of certificates) {
      const status = this.getCertificateStatus(cert, threshold);
      
      if (status === 'needs_renewal' || status === 'expired') {
        expiringCerts.push({
          ...cert,
          status,
          daysUntilExpiry: this.getDaysUntilExpiry(cert)
        });
      }
    }

    return expiringCerts;
  }

  /**
   * Check if a certificate is expired
   * @param {Object} cert - Certificate object
   * @returns {boolean} True if expired
   */
  isExpired(cert) {
    const expiryDate = this.getExpiryDate(cert);
    return new Date() > expiryDate;
  }

  /**
   * Get certificate expiry date
   * Let's Encrypt certificates are valid for 90 days
   * @param {Object} cert - Certificate object
   * @returns {Date} Expiry date
   */
  getExpiryDate(cert) {
    const issueDate = new Date(cert.time);
    const expiryDate = new Date(issueDate);
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days validity
    return expiryDate;
  }

  /**
   * Get days until certificate expiry
   * @param {Object} cert - Certificate object
   * @returns {number} Days until expiry (negative if expired)
   */
  getDaysUntilExpiry(cert) {
    const now = new Date();
    const expiryDate = this.getExpiryDate(cert);
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get certificate status
   * @param {Object} cert - Certificate object
   * @param {number} threshold - Renewal threshold in days
   * @returns {string} Status: 'valid', 'needs_renewal', or 'expired'
   */
  getCertificateStatus(cert, threshold = 30) {
    const daysUntilExpiry = this.getDaysUntilExpiry(cert);
    
    if (daysUntilExpiry <= 0) {
      return 'expired';
    } else if (daysUntilExpiry <= threshold) {
      return 'needs_renewal';
    } else {
      return 'valid';
    }
  }

  /**
   * Update certificate in storage
   * @param {number} id - Certificate ID (index)
   * @param {Object} updates - Fields to update
   */
  updateCertificate(id, updates) {
    try {
      const certificates = this.scanCertificates();
      
      if (id >= 0 && id < certificates.length) {
        certificates[id] = { ...certificates[id], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
      }
    } catch (error) {
      console.error('Failed to update certificate:', error);
    }
  }
}
