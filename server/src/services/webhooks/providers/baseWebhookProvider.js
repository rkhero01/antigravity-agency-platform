/**
 * Base Webhook Provider Interface
 * Task 13 — Phase 1: Webhook Architecture & Provider Adapters
 */

import { ValidationError } from '../../../utils/errors.js';

export class BaseWebhookProvider {
  constructor(name) {
    this.name = name.toUpperCase();
  }

  isConfigured() {
    return false;
  }

  /**
   * Verify incoming webhook verification request (e.g. GET challenge / CRC)
   */
  async verifyWebhook(query, headers = {}) {
    return {
      isValid: false,
      status: 'UNSUPPORTED_CAPABILITY',
      reason: `Webhook verification not supported for ${this.name}`,
    };
  }

  /**
   * Verify webhook payload signature (e.g. HMAC-SHA256)
   */
  verifySignature(rawBody, signature, secret) {
    return {
      isValid: false,
      status: 'UNSUPPORTED_CAPABILITY',
      reason: `Signature verification not supported for ${this.name}`,
    };
  }

  /**
   * Normalize raw incoming provider payload to standard structure
   */
  normalizeEvent(rawPayload) {
    return {
      provider: this.name,
      eventId: null,
      eventType: 'UNKNOWN',
      platformAccountId: null,
      timestamp: new Date().toISOString(),
      payload: rawPayload,
    };
  }

  /**
   * Process a normalized event
   */
  async processEvent(normalizedEvent, context = {}) {
    return {
      status: 'UNSUPPORTED_CAPABILITY',
      message: `Event processing not supported for ${this.name}`,
    };
  }

  /**
   * Subscribe an asset/page to webhook events
   */
  async subscribe(context = {}) {
    return {
      status: 'UNSUPPORTED_CAPABILITY',
      message: `Webhook subscriptions not supported for ${this.name}`,
    };
  }

  /**
   * Unsubscribe from webhook events
   */
  async unsubscribe(context = {}) {
    return {
      status: 'UNSUPPORTED_CAPABILITY',
      message: `Webhook unsubscriptions not supported for ${this.name}`,
    };
  }
}

export default BaseWebhookProvider;
