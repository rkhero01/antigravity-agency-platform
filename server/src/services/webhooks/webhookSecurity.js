/**
 * Webhook Security Utilities
 * Task 13 — Phase 2: Timing-Safe Verification & Replay Protection
 */

import crypto from 'crypto';

const MAX_TIMESTAMP_DRIFT_SEC = 300; // 5 minutes

export function timingSafeCompare(a, b) {
  if (!a || !b) return false;
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

export function verifyTimestampDrift(timestampInSeconds) {
  if (!timestampInSeconds) return { isValid: true };
  const currentSec = Math.floor(Date.now() / 1000);
  const diff = Math.abs(currentSec - Number(timestampInSeconds));

  if (isNaN(diff) || diff > MAX_TIMESTAMP_DRIFT_SEC) {
    return {
      isValid: false,
      driftSec: diff,
      reason: `Webhook timestamp drift (${diff}s) exceeds maximum allowed ${MAX_TIMESTAMP_DRIFT_SEC}s replay window.`,
    };
  }

  return { isValid: true, driftSec: diff };
}

export const webhookSecurity = {
  timingSafeCompare,
  verifyTimestampDrift,
};

export default webhookSecurity;
