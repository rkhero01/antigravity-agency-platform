/**
 * Google (YouTube & Google Business Profile) Webhook & Notification Adapter
 * Task 13 — Phase 1: Explicit Capability Classification & Safe Notification Handling
 */

import { BaseWebhookProvider } from './baseWebhookProvider.js';

export class GoogleWebhookProvider extends BaseWebhookProvider {
  constructor() {
    super('GOOGLE');
  }

  isConfigured() {
    return Boolean(process.env.GOOGLE_PUBSUB_TOPIC && process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Google does not use standard GET hub.challenge verification for direct webhooks.
   */
  async verifyWebhook(query, headers = {}) {
    return {
      isValid: false,
      status: 'UNSUPPORTED_CAPABILITY',
      capability: 'DIRECT_HTTP_VERIFICATION',
      reason: 'Google APIs (YouTube / Business Profile) do not support direct GET hub.challenge verification. Real-time event notifications require Google Cloud Pub/Sub topics or WebSub hubs.',
    };
  }

  /**
   * Verify Pub/Sub token or OIDC JWT token if configured
   */
  verifySignature(rawBody, signature, secret) {
    if (!this.isConfigured()) {
      return {
        isValid: false,
        status: 'CONFIGURATION_REQUIRED',
        reason: 'Google Cloud Pub/Sub verification secret is not configured in server environment.',
      };
    }

    return {
      isValid: false,
      status: 'UNSUPPORTED_CAPABILITY',
      reason: 'Direct HMAC signature verification is not used by Google Pub/Sub. Google uses Bearer token / OIDC verification headers.',
    };
  }

  normalizeEvent(rawPayload) {
    const message = rawPayload?.message;
    const dataString = message?.data ? Buffer.from(message.data, 'base64').toString('utf8') : null;
    let parsedData = null;
    try {
      parsedData = dataString ? JSON.parse(dataString) : null;
    } catch (e) {
      parsedData = dataString;
    }

    return {
      provider: 'GOOGLE',
      eventId: message?.messageId ? `GOOGLE-MSG-${message.messageId}` : `GOOGLE-EVT-${Date.now()}`,
      eventType: rawPayload?.subscription ? 'PUBSUB_NOTIFICATION' : 'GOOGLE_NOTIFICATION',
      platformAccountId: null,
      timestamp: message?.publishTime || new Date().toISOString(),
      payload: {
        messageId: message?.messageId || null,
        attributes: message?.attributes || {},
        data: parsedData,
      },
    };
  }

  async processEvent(normalizedEvent, context = {}) {
    return {
      status: 'UNSUPPORTED_CAPABILITY',
      capability: 'DIRECT_WEBHOOK_PROCESSING',
      message: 'Direct HTTP webhook processing for Google is unsupported. Scheduled synchronization via GET /api/v1/integrations/:id/sync is recommended.',
    };
  }

  async subscribe(context = {}) {
    return {
      status: 'UNSUPPORTED_CAPABILITY',
      capability: 'DIRECT_HTTP_SUBSCRIPTION',
      message: 'Google APIs require Google Cloud Pub/Sub topic subscription or WebSub registration.',
    };
  }
}

export const googleWebhookProvider = new GoogleWebhookProvider();
export default googleWebhookProvider;
