/**
 * ConfigManager - Manages auto-renewal configuration
 * Handles global and per-certificate renewal settings
 */

const STORAGE_KEY = 'certple-auto-renewal-config';

export class ConfigManager {
  /**
   * Get auto-renewal configuration
   * @returns {Object} Configuration object
   */
  getAutoRenewalConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        return this.getDefaultConfig();
      }

      const config = JSON.parse(data);
      
      // Validate and merge with defaults
      return {
        ...this.getDefaultConfig(),
        ...config
      };
    } catch (error) {
      console.error('Failed to read auto-renewal config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   * @returns {Object} Default config
   */
  getDefaultConfig() {
    return {
      enabled: false, // Global switch (disabled by default for safety)
      threshold: 30, // Days before expiration
      checkInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      certSettings: {} // Per-certificate settings
    };
  }

  /**
   * Save auto-renewal configuration
   * @param {Object} config - Configuration object
   * @returns {boolean} Success status
   */
  saveAutoRenewalConfig(config) {
    try {
      // Validate config
      if (typeof config.enabled !== 'boolean') {
        throw new Error('Invalid enabled value');
      }

      if (config.threshold < 1 || config.threshold > 60) {
        throw new Error('Threshold must be between 1 and 60 days');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Failed to save auto-renewal config:', error);
      return false;
    }
  }

  /**
   * Check if auto-renewal is globally enabled
   * @returns {boolean}
   */
  isGloballyEnabled() {
    const config = this.getAutoRenewalConfig();
    return config.enabled === true;
  }

  /**
   * Check if auto-renewal is enabled for a specific certificate
   * @param {string} domain - Domain name
   * @returns {boolean}
   */
  isCertAutoRenewalEnabled(domain) {
    const config = this.getAutoRenewalConfig();
    
    // Check global switch first
    if (!config.enabled) {
      return false;
    }

    // Check per-certificate setting
    const certSetting = config.certSettings[domain];
    if (certSetting && certSetting.enabled === false) {
      return false;
    }

    return true;
  }

  /**
   * Set auto-renewal for a specific certificate
   * @param {string} domain - Domain name
   * @param {boolean} enabled - Enable/disable
   */
  setCertAutoRenewal(domain, enabled) {
    try {
      const config = this.getAutoRenewalConfig();
      
      if (!config.certSettings) {
        config.certSettings = {};
      }

      config.certSettings[domain] = {
        enabled,
        lastCheck: Date.now()
      };

      this.saveAutoRenewalConfig(config);
    } catch (error) {
      console.error('Failed to set cert auto-renewal:', error);
    }
  }

  /**
   * Update last check time for a certificate
   * @param {string} domain - Domain name
   */
  updateLastCheck(domain) {
    try {
      const config = this.getAutoRenewalConfig();
      
      if (!config.certSettings) {
        config.certSettings = {};
      }

      if (!config.certSettings[domain]) {
        config.certSettings[domain] = { enabled: true };
      }

      config.certSettings[domain].lastCheck = Date.now();
      this.saveAutoRenewalConfig(config);
    } catch (error) {
      console.error('Failed to update last check:', error);
    }
  }

  /**
   * Update last renewal time for a certificate
   * @param {string} domain - Domain name
   */
  updateLastRenewal(domain) {
    try {
      const config = this.getAutoRenewalConfig();
      
      if (!config.certSettings) {
        config.certSettings = {};
      }

      if (!config.certSettings[domain]) {
        config.certSettings[domain] = { enabled: true };
      }

      config.certSettings[domain].lastRenewal = Date.now();
      this.saveAutoRenewalConfig(config);
    } catch (error) {
      console.error('Failed to update last renewal:', error);
    }
  }
}
