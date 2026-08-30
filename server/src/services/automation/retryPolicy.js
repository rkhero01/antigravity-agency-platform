/**
 * Automation Retry Policy Engine
 * Task 14 — Phase 6 (Task 6 Phase 3): Production Retry Classification & Bounded Exponential Backoff
 */

export const RETRY_CATEGORIES = {
  RATE_LIMITED: 'RATE_LIMITED',
  TEMPORARY_FAILURE: 'TEMPORARY_FAILURE',
  NEEDS_REAUTH: 'NEEDS_REAUTH',
  FAILED: 'FAILED',
  CONFIGURATION_REQUIRED: 'CONFIGURATION_REQUIRED',
  DUPLICATE: 'DUPLICATE',
  SUCCESS: 'SUCCESS',
};

export const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
  jitter: true,
};

/**
 * Classify failure into standardized retry categories
 */
export function classifyFailure(httpStatus, error = null, result = null) {
  if (result?.status === 'SUCCESS' || (httpStatus >= 200 && httpStatus < 300)) {
    return RETRY_CATEGORIES.SUCCESS;
  }

  if (result?.status === 'DUPLICATE') {
    return RETRY_CATEGORIES.DUPLICATE;
  }

  if (result?.status === 'CONFIGURATION_REQUIRED') {
    return RETRY_CATEGORIES.CONFIGURATION_REQUIRED;
  }

  if (httpStatus === 429 || result?.status === 'RATE_LIMITED') {
    return RETRY_CATEGORIES.RATE_LIMITED;
  }

  if (httpStatus === 401 || httpStatus === 403 || result?.status === 'NEEDS_REAUTH') {
    return RETRY_CATEGORIES.NEEDS_REAUTH;
  }

  if (
    httpStatus === 408 ||
    (httpStatus >= 500 && httpStatus <= 599) ||
    error?.name === 'TimeoutError' ||
    error?.code === 'ECONNRESET' ||
    error?.code === 'ETIMEDOUT' ||
    /timeout|network error|socket hang up/i.test(String(error?.message || ''))
  ) {
    return RETRY_CATEGORIES.TEMPORARY_FAILURE;
  }

  if (httpStatus >= 400 && httpStatus <= 499) {
    return RETRY_CATEGORIES.FAILED;
  }

  return RETRY_CATEGORIES.FAILED;
}

/**
 * Determine if a failure category is eligible for automatic retry
 */
export function isRetryable(category) {
  return category === RETRY_CATEGORIES.RATE_LIMITED || category === RETRY_CATEGORIES.TEMPORARY_FAILURE;
}

/**
 * Calculate bounded exponential backoff delay with jitter
 */
export function calculateBackoff(attempt = 1, options = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  const { baseDelayMs, maxDelayMs, retryAfter, jitter } = config;

  if (retryAfter && typeof retryAfter === 'number' && retryAfter > 0) {
    // If retryAfter is in seconds (< 10000), convert to ms
    const retryAfterMs = retryAfter < 10000 ? retryAfter * 1000 : retryAfter;
    return Math.min(retryAfterMs, maxDelayMs);
  }

  // Exponential backoff formula: base * 2^(attempt - 1)
  const exponential = baseDelayMs * Math.pow(2, Math.max(0, attempt - 1));
  const capped = Math.min(exponential, maxDelayMs);

  if (jitter) {
    // Add ±15% deterministic/randomized jitter
    const randomFactor = 0.85 + Math.random() * 0.3;
    return Math.round(capped * randomFactor);
  }

  return capped;
}

export const retryPolicy = {
  RETRY_CATEGORIES,
  DEFAULT_RETRY_CONFIG,
  classifyFailure,
  isRetryable,
  calculateBackoff,
};

export default retryPolicy;
