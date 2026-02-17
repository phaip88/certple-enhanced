/**
 * SessionManager - Manages user sessions
 * Handles session creation, validation, and renewal
 */

import { generateSessionToken } from './crypto.js';

const STORAGE_KEY = 'certple-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class SessionManager {
  /**
   * Create a new session
   * @param {string} username - Username
   * @returns {string} Session token
   */
  createSession(username) {
    try {
      const token = generateSessionToken();
      const now = Date.now();
      
      const session = {
        token,
        username,
        createdAt: now,
        expiresAt: now + SESSION_DURATION,
        lastAccessAt: now
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      
      return token;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Validate current session
   * @returns {boolean} True if session is valid
   */
  validateSession() {
    try {
      const session = this.getSession();
      if (!session) {
        return false;
      }
      
      const now = Date.now();
      
      // Check if session is expired
      if (now > session.expiresAt) {
        this.destroySession();
        return false;
      }
      
      // Auto-renew session on access
      this.renewSession();
      
      return true;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }

  /**
   * Get current user from session
   * @returns {string|null} Username or null if no valid session
   */
  getCurrentUser() {
    try {
      const session = this.getSession();
      if (!session) {
        return null;
      }
      
      const now = Date.now();
      if (now > session.expiresAt) {
        this.destroySession();
        return null;
      }
      
      return session.username;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Destroy current session
   */
  destroySession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to destroy session:', error);
    }
  }

  /**
   * Renew session expiration time
   */
  renewSession() {
    try {
      const session = this.getSession();
      if (!session) {
        return;
      }
      
      const now = Date.now();
      session.lastAccessAt = now;
      session.expiresAt = now + SESSION_DURATION;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to renew session:', error);
    }
  }

  /**
   * Get session data (internal use)
   * @returns {Object|null} Session object or null
   */
  getSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null;
      }
      
      const parsed = JSON.parse(data);
      
      // Validate data structure
      if (!parsed.token || !parsed.username || !parsed.expiresAt) {
        console.error('Invalid session data structure');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to read session:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  /**
   * Check if user is logged in
   * @returns {boolean} True if user has valid session
   */
  isLoggedIn() {
    return this.validateSession();
  }
}
