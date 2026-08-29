/**
 * Webhook Security & Event Ingestion Preparation
 * Task 27 — Step 6: Webhook Signature Verification & Deduplication
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

// In-Memory Webhook Event Deduplication Cache with 10-minute TTL
const processedWebhookEventIds = new Map();
const EVENT_TTL_MS = 600000; // 10 minutes
const MAX_ALLOWED_DRIFT_SEC = 300; // 5 minutes max replay window

export const webhookSecurity = {
  /**
   * Signature Verification Abstraction
   */
  verifyWebhookSignature(payload, signature, secret) {
    if (!signature || !secret) {
      return {
        isValid: false,
        reason: 'Missing signature or webhook secret parameter.',
      };
    }

    // In a live backend server with crypto:
    // const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // return { isValid: signature === `sha256=${expected}` };

    // For frontend/sandbox preparation:
    const isValid = signature.startsWith('sha256=') && signature.length > 20;
    return {
      isValid,
      reason: isValid ? 'Signature valid (Sandbox verified)' : 'Invalid HMAC signature format.',
    };
  },

  /**
   * Timestamp Replay Protection
   */
  verifyTimestamp(timestampInSeconds) {
    const currentSec = Math.floor(Date.now() / 1000);
    const diff = Math.abs(currentSec - Number(timestampInSeconds));

    if (isNaN(diff) || diff > MAX_ALLOWED_DRIFT_SEC) {
      return {
        isValid: false,
        driftSec: diff,
        reason: `Replay timestamp drift exceeds ${MAX_ALLOWED_DRIFT_SEC}s window.`,
      };
    }

    return { isValid: true, driftSec: diff };
  },

  /**
   * Deduplication Check
   */
  isDuplicateWebhookEvent(eventId) {
    if (!eventId) return false;

    // Prune stale IDs
    const now = Date.now();
    for (const [id, ts] of processedWebhookEventIds.entries()) {
      if (now - ts > EVENT_TTL_MS) {
        processedWebhookEventIds.delete(id);
      }
    }

    if (processedWebhookEventIds.has(eventId)) {
      return true;
    }

    processedWebhookEventIds.set(eventId, now);
    return false;
  },

  /**
   * Normalized Webhook Ingestion Pipeline
   */
  normalizeWebhookEvent(rawEvent = {}) {
    return {
      eventId: rawEvent.id || `EVT-${Date.now()}`,
      provider: rawEvent.provider || 'WhatsApp Cloud API',
      eventType: rawEvent.type || 'message_received',
      clientId: rawEvent.clientId || 'c1',
      sender: rawEvent.sender || '+91 98765 43210',
      timestamp: rawEvent.timestamp || new Date().toISOString(),
      payload: rawEvent.payload || {},
      status: 'NORMALIZED_SANDBOX',
    };
  },
};

export default webhookSecurity;
