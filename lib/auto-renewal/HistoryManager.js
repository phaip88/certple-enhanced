/**
 * HistoryManager - Manages renewal history records
 * Tracks renewal attempts, successes, and failures
 */

const STORAGE_KEY = 'certple-renewal-history';
const MAX_RECORDS = 10;

export class HistoryManager {
  /**
   * Record a renewal event
   * @param {string} domain - Domain name
   * @param {string} status - Status: 'success', 'failure', or 'in_progress'
   * @param {string} error - Error message (optional)
   * @param {number} oldExpiry - Old certificate expiry timestamp (optional)
   * @param {number} newExpiry - New certificate expiry timestamp (optional)
   */
  recordRenewal(domain, status, error = null, oldExpiry = null, newExpiry = null) {
    try {
      const history = this.getHistory();
      
      const record = {
        id: this.generateId(),
        domain,
        timestamp: Date.now(),
        status,
        error,
        oldExpiry,
        newExpiry
      };

      history.records.unshift(record); // Add to beginning
      
      // Keep only MAX_RECORDS
      if (history.records.length > MAX_RECORDS) {
        history.records = history.records.slice(0, MAX_RECORDS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to record renewal:', error);
    }
  }

  /**
   * Get all renewal history
   * @returns {Object} History object with records array
   */
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        return { records: [] };
      }

      const history = JSON.parse(data);
      
      // Validate structure
      if (!history.records || !Array.isArray(history.records)) {
        return { records: [] };
      }

      return history;
    } catch (error) {
      console.error('Failed to read renewal history:', error);
      return { records: [] };
    }
  }

  /**
   * Get renewal history for a specific domain
   * @param {string} domain - Domain name
   * @returns {Array<Object>} Array of history records
   */
  getDomainHistory(domain) {
    const history = this.getHistory();
    return history.records.filter(record => record.domain === domain);
  }

  /**
   * Get the last renewal record for a domain
   * @param {string} domain - Domain name
   * @returns {Object|null} Last renewal record or null
   */
  getLastRenewal(domain) {
    const domainHistory = this.getDomainHistory(domain);
    return domainHistory.length > 0 ? domainHistory[0] : null;
  }

  /**
   * Clean up old records (keep only MAX_RECORDS)
   */
  cleanupOldRecords() {
    try {
      const history = this.getHistory();
      
      if (history.records.length > MAX_RECORDS) {
        history.records = history.records.slice(0, MAX_RECORDS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
    }
  }

  /**
   * Clear all history
   */
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  /**
   * Generate a unique ID for a record
   * @returns {string} Unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get renewal statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const history = this.getHistory();
    
    const stats = {
      total: history.records.length,
      success: 0,
      failure: 0,
      inProgress: 0
    };

    for (const record of history.records) {
      if (record.status === 'success') {
        stats.success++;
      } else if (record.status === 'failure') {
        stats.failure++;
      } else if (record.status === 'in_progress') {
        stats.inProgress++;
      }
    }

    return stats;
  }
}
