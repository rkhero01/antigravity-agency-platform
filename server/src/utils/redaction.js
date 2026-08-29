/**
 * Deep Recursive Secret Redaction Utility
 * Task 28 — Step 1: Security Foundation
 */

const SENSITIVE_KEYS = new Set([
  'authorization',
  'auth',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'secret',
  'jwt_secret',
  'jwtsecret',
  'session_secret',
  'sessionsecret',
  'apikey',
  'api_key',
  'password',
  'password_hash',
  'passwordhash',
  'database_url',
  'databaseurl',
  'webhook_secret',
  'webhooksecret',
]);

export function redactSecrets(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return data
      .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]')
      .replace(/postgres(?:ql)?:\/\/[^@\s]+@[^\s/]+/gi, 'postgres://[REDACTED]@[HOST]')
      .replace(/key=[A-Za-z0-9_-]+/gi, 'key=[REDACTED]')
      .replace(/token=[A-Za-z0-9_-]+/gi, 'token=[REDACTED]')
      .replace(/secret=[A-Za-z0-9_-]+/gi, 'secret=[REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSecrets(item));
  }

  if (typeof data === 'object' && !(data instanceof Date) && !(data instanceof RegExp)) {
    const sanitized = {};
    for (const [k, v] of Object.entries(data)) {
      const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (SENSITIVE_KEYS.has(normalizedKey) || Array.from(SENSITIVE_KEYS).some((s) => normalizedKey.includes(s))) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = redactSecrets(v);
      }
    }
    return sanitized;
  }

  return data;
}

export default redactSecrets;
