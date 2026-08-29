/**
 * Environment Configuration & Secret Sanitization Layer
 * Task 27 — Step 6: Real API Readiness & Environment Hardening
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

// Safely read environment variables across Vite frontend and Node test runtimes
function getEnvVar(key, fallback = '') {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore in non-Vite environments
  }

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore in browser environments
  }

  return fallback;
}

export const ENV_CONFIG = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://antigravity-agency-platform.onrender.com/api/v1'),
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development'),
  EXECUTION_MODE: getEnvVar('VITE_AI_EXECUTION_MODE', 'DEMO').toUpperCase(), // 'DEMO' | 'REAL'
  IS_DEMO: getEnvVar('VITE_AI_EXECUTION_MODE', 'DEMO').toUpperCase() !== 'REAL',
  IS_PRODUCTION: getEnvVar('VITE_APP_ENV', 'development') === 'production',
};

/**
 * Secret Redaction Utility
 * Sanitizes objects, URLs, and strings so API tokens or sensitive headers are never logged.
 */
export function redactSecrets(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return data
      .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]')
      .replace(/key=[A-Za-z0-9_-]+/gi, 'key=[REDACTED]')
      .replace(/token=[A-Za-z0-9_-]+/gi, 'token=[REDACTED]')
      .replace(/secret=[A-Za-z0-9_-]+/gi, 'secret=[REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSecrets(item));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    const sensitiveKeys = [
      'authorization',
      'auth',
      'token',
      'accesstoken',
      'access_token',
      'refreshtoken',
      'refresh_token',
      'secret',
      'apikey',
      'api_key',
      'password',
      'webhook_secret',
    ];

    for (const [k, v] of Object.entries(data)) {
      const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = redactSecrets(v);
      }
    }
    return sanitized;
  }

  return data;
}

export const envConfig = {
  ...ENV_CONFIG,
  getEnvVar,
  redactSecrets,
};

export default envConfig;
