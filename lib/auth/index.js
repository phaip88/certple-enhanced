/**
 * Authentication Module
 * Exports all authentication-related classes and utilities
 */

export { CredentialManager } from './CredentialManager.js';
export { SessionManager } from './SessionManager.js';
export { RouteGuard } from './RouteGuard.js';
export { hashPassword, generateSalt, generateSessionToken } from './crypto.js';
