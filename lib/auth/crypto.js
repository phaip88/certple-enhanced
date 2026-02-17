/**
 * Crypto utilities for password hashing and session token generation
 * Uses Web Crypto API for secure cryptographic operations
 */

/**
 * Generate a cryptographically secure random salt
 * @returns {string} Hex-encoded salt
 */
export function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a password using PBKDF2
 * @param {string} password - Plain text password
 * @param {string} salt - Hex-encoded salt
 * @returns {Promise<string>} Hex-encoded password hash
 */
export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);
  
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a cryptographically secure session token
 * @returns {string} Hex-encoded session token
 */
export function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
