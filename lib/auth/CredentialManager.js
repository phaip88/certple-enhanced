/**
 * CredentialManager - Manages user credentials
 * Handles credential storage, validation, and updates
 */

import { hashPassword, generateSalt } from './crypto.js';

const STORAGE_KEY = 'certple-credentials';

export class CredentialManager {
  /**
   * Validate credential format
   * @param {string} username - Username to validate
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with valid flag and error message
   */
  validateFormat(username, password) {
    if (!username || username.length < 3 || username.length > 20) {
      return {
        valid: false,
        error: '用户名必须为 3-20 个字符'
      };
    }
    
    if (!password || password.length < 6) {
      return {
        valid: false,
        error: '密码必须至少 6 个字符'
      };
    }
    
    return { valid: true };
  }

  /**
   * Set user credentials
   * @param {string} username - Username (3-20 characters)
   * @param {string} password - Password (minimum 6 characters)
   * @returns {Promise<Object>} Result with success flag and error message if any
   */
  async setCredentials(username, password) {
    // Validate input format
    const validation = this.validateFormat(username, password);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      // Generate salt and hash password
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      
      // Create credentials object
      const credentials = {
        username,
        passwordHash,
        salt,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Store to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to set credentials:', error);
      return { success: false, error: '设置凭证失败' };
    }
  }

  /**
   * Verify user credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<boolean>} True if credentials match
   */
  async verifyCredentials(username, password) {
    try {
      const stored = this.getStoredCredentials();
      if (!stored) {
        return false;
      }
      
      // Check username match
      if (stored.username !== username) {
        return false;
      }
      
      // Hash provided password with stored salt
      const passwordHash = await hashPassword(password, stored.salt);
      
      // Compare hashes
      return passwordHash === stored.passwordHash;
    } catch (error) {
      console.error('Failed to verify credentials:', error);
      return false;
    }
  }

  /**
   * Check if credentials are already set
   * @returns {boolean} True if credentials exist
   */
  hasCredentials() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null && stored !== '';
    } catch (error) {
      console.error('Failed to check credentials:', error);
      return false;
    }
  }

  /**
   * Update credentials
   * @param {string} oldPassword - Old password for verification
   * @param {string} newUsername - New username
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result with success flag and error message if any
   */
  async updateCredentials(oldPassword, newUsername, newPassword) {
    try {
      const stored = this.getStoredCredentials();
      if (!stored) {
        return { success: false, error: '未找到现有凭证' };
      }
      
      // Verify old password
      const oldPasswordHash = await hashPassword(oldPassword, stored.salt);
      if (oldPasswordHash !== stored.passwordHash) {
        return { success: false, error: '旧密码错误' };
      }
      
      // Set new credentials
      return await this.setCredentials(newUsername, newPassword);
    } catch (error) {
      console.error('Failed to update credentials:', error);
      return { success: false, error: '更新凭证失败' };
    }
  }

  /**
   * Get stored credentials (internal use)
   * @returns {Object|null} Credentials object or null
   */
  getStoredCredentials() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null;
      }
      
      const parsed = JSON.parse(data);
      
      // Validate data structure
      if (!parsed.username || !parsed.passwordHash || !parsed.salt) {
        console.error('Invalid credentials data structure');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to read credentials:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  /**
   * Clear credentials (for testing or reset)
   */
  clearCredentials() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }
}
