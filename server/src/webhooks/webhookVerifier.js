/**
 * Webhook Signature & Replay Verifier
 * Task 28 — Step 1: Webhook Security Foundation
 */

import crypto from 'crypto';

const MAX_TIMESTAMP_DRIFT_SEC = 300; // 5 minutes

export function verifyMetaSignature(rawPayload, signatureHeader, secret) {
  if (!signatureHeader || !secret) {
    return { isValid: false, reason: 'Missing signature header or secret key' };
  }

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    return { isValid: false, reason: 'Invalid signature format (expected sha256=...)' };
  }

  const signature = parts[1];
  const payloadString = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
  const expectedHash = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

  try {
    const isValid = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedHash, 'hex'));
    return { isValid, reason: isValid ? 'Signature valid' : 'Signature hash mismatch' };
  } catch (e) {
    return { isValid: false, reason: 'Malformed signature hex length' };
  }
}

export function verifyTimestamp(timestampInSeconds) {
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

export const webhookVerifier = {
  verifyMetaSignature,
  verifyTimestamp,
};

export default webhookVerifier;
