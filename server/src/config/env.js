/**
 * Production Environment Configuration & Validation Manager
 * Task 28 — Step 6: Production Environment Validation & Fail-Safe Configuration
 */

import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = (process.env.NODE_ENV || 'development').trim();
const APP_ENV = (process.env.APP_ENV || (NODE_ENV === 'production' ? 'production' : 'demo')).trim().toLowerCase();
const PORT = parseInt(process.env.PORT || '5000', 10);
const DATABASE_URL = (process.env.DATABASE_URL || '').trim();
const JWT_SECRET = (process.env.JWT_SECRET || 'demo-jwt-secret-antigravity-sandbox-only-2026!').trim();
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d').trim();
const WEBHOOK_SECRET = (process.env.WEBHOOK_SECRET || 'demo-webhook-hmac-secret-key-2026!').trim();
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim();
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173').trim();
const API_BASE_URL = (process.env.API_BASE_URL || '/api/v1').trim();

// Optional external provider keys (strictly for production credentials check)
const META_WA_PHONE_NUMBER_ID = (process.env.META_WA_PHONE_NUMBER_ID || '').trim();
const META_WA_ACCESS_TOKEN = (process.env.META_WA_ACCESS_TOKEN || '').trim();
const GOOGLE_ADS_CLIENT_ID = (process.env.GOOGLE_ADS_CLIENT_ID || '').trim();
const PAYMENT_GATEWAY_API_KEY = (process.env.PAYMENT_GATEWAY_API_KEY || '').trim();

const isProduction = APP_ENV === 'production' || NODE_ENV === 'production';
const isDemo = APP_ENV === 'demo' || (!isProduction && (!DATABASE_URL || DATABASE_URL.length === 0));
const isDatabaseConfigured = Boolean(DATABASE_URL && DATABASE_URL.length > 0 && !DATABASE_URL.includes('placeholder'));

/**
 * Validates production environment constraints.
 * Fails fast with clear, non-secret diagnostic messages if production variables are missing or insecure.
 */
export function validateEnvironment(targetEnv = isProduction ? 'production' : 'demo') {
  const errors = [];

  // Validate Port
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    errors.push('PORT must be a valid positive integer between 1 and 65535.');
  }

  // Validate Production Constraints
  if (targetEnv === 'production') {
    if (!DATABASE_URL || DATABASE_URL.length === 0) {
      errors.push('DATABASE_URL is required in production mode (PostgreSQL connection string missing).');
    } else if (!DATABASE_URL.startsWith('postgres://') && !DATABASE_URL.startsWith('postgresql://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string starting with postgres:// or postgresql://.');
    }

    if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.includes('demo') || JWT_SECRET.includes('sandbox')) {
      errors.push('JWT_SECRET must be a cryptographically strong secret with at least 32 characters in production.');
    }

    if (!WEBHOOK_SECRET || WEBHOOK_SECRET.length < 16 || WEBHOOK_SECRET.includes('demo')) {
      errors.push('WEBHOOK_SECRET must be configured with a secure high-entropy key in production.');
    }
  }

  if (errors.length > 0) {
    const message = `[FATAL CONFIGURATION ERROR] Environment validation failed for ${targetEnv} mode:\n- ${errors.join('\n- ')}`;
    return {
      valid: false,
      errors,
      message,
    };
  }

  return {
    valid: true,
    errors: [],
    message: `Environment configuration validated successfully for ${targetEnv} mode.`,
  };
}

/**
 * Returns safe environment summary for diagnostics and observability (zero secrets).
 */
export function getSafeEnvironmentSummary() {
  return {
    environment: isProduction ? 'production' : 'demo/development',
    nodeEnv: NODE_ENV,
    appEnv: APP_ENV,
    port: PORT,
    databaseConfigured: isDatabaseConfigured,
    jwtConfigured: Boolean(JWT_SECRET && JWT_SECRET.length >= 16),
    webhookConfigured: Boolean(WEBHOOK_SECRET && WEBHOOK_SECRET.length >= 16),
    providersConfigured: Boolean(META_WA_ACCESS_TOKEN || GOOGLE_ADS_CLIENT_ID || PAYMENT_GATEWAY_API_KEY),
    frontendUrl: FRONTEND_URL,
    corsOrigin: CORS_ORIGIN,
    apiBaseUrl: API_BASE_URL,
    isProduction,
    isDemo,
  };
}

export const env = {
  NODE_ENV,
  APP_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  WEBHOOK_SECRET,
  FRONTEND_URL,
  CORS_ORIGIN,
  API_BASE_URL,
  isProduction,
  isDemo,
  isDatabaseConfigured,
  validateEnvironment,
  getSafeEnvironmentSummary,
};

export default env;
