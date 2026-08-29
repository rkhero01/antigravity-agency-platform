/**
 * Password Hashing & Verification Primitives
 * Task 28 — Step 1: Secure Auth Primitives
 */

import crypto from 'crypto';

/**
 * Hash a password using scrypt with unique salt
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against stored hash
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (e) {
    return false;
  }
}

export const passwordUtils = {
  hashPassword,
  verifyPassword,
};

export default passwordUtils;
