/**
 * OAuth Token Envelope Encryption Utility
 * Task 11: AES-256-GCM Authenticated Encryption for OAuth Tokens & Secrets
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a 32-byte encryption key from environment or fallback deterministic salt
 */
function getMasterKey() {
  const secret = process.env.OAUTH_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || 'antigravity-secure-oauth-master-key-2026';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypt plaintext token or credentials object
 * Returns serialized format: iv:authTag:ciphertext (base64)
 */
export function encryptToken(tokenString) {
  if (!tokenString) return null;
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(String(tokenString), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt serialized token string
 */
export function decryptToken(encryptedPayload) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') return null;

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    // If not in encrypted format (e.g. legacy token during migration), return safely or null
    return null;
  }

  try {
    const [ivHex, authTagHex, cipherTextHex] = parts;
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherTextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[TOKEN_DECRYPTION_ERROR]: Failed to decrypt OAuth token payload:', err.message);
    return null;
  }
}

/**
 * Helper to safely sanitize sensitive credentials from objects before API output
 */
export function sanitizeAccountCredentials(account) {
  if (!account) return null;
  const sanitized = { ...account };
  delete sanitized.accessToken;
  delete sanitized.refreshToken;
  delete sanitized.encryptedAccessToken;
  delete sanitized.encryptedRefreshToken;
  delete sanitized.clientSecret;
  delete sanitized.appSecret;
  return sanitized;
}

export default {
  encryptToken,
  decryptToken,
  sanitizeAccountCredentials,
};
