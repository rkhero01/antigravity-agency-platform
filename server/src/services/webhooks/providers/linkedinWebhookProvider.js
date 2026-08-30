/**
 * LinkedIn Webhook Provider Adapter
 * Task 13 — Phase 1: Real Signature Checking & Scope Classification
 */

import crypto from 'crypto';
import { BaseWebhookProvider } from './baseWebhookProvider.js';

export class LinkedInWebhookProvider extends BaseWebhookProvider {
  constructor() {
    super('LINKEDIN');
  }

  isConfigured() {
    return Boolean(process.env.LINKEDIN_CLIENT_SECRET && process.env.LINKEDIN_CLIENT_ID);
  }

  /**
   * Verify LinkedIn webhook challenge / verification
   */
  async verifyWebhook(query, headers = {}) {
    const challenge = query.challenge || query.validationToken;
    if (challenge) {
      return {
        isValid: true,
        status: 'VERIFIED',
        challenge,
      };
    }

    return {
      isValid: false,
      status: 'UNSUPPORTED_CAPABILITY',
      reason: 'LinkedIn webhook verification requires active developer webhook subscription approval.',
    };
  }

  /**
   * Verify LinkedIn payload HMAC-SHA256 signature (X-LI-Signature)
   */
  verifySignature(rawBody, signatureHeader, secretOverride = null) {
    const secret = secretOverride || process.env.LINKEDIN_CLIENT_SECRET;
    if (!secret) {
      return {
        isValid: false,
        status: 'CONFIGURATION_REQUIRED',
        reason: 'LINKEDIN_CLIENT_SECRET is not configured in server environment.',
      };
    }

    if (!signatureHeader) {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: 'Missing X-LI-Signature header on LinkedIn webhook request.',
      };
    }

    const payloadString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const expectedHash = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

    try {
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(signatureHeader.replace(/^sha256=/, ''), 'hex'),
        Buffer.from(expectedHash, 'hex')
      );
      return {
        isValid: isMatch,
        status: isMatch ? 'VERIFIED' : 'VERIFICATION_FAILED',
        reason: isMatch ? 'Signature valid' : 'Signature hash mismatch',
      };
    } catch (e) {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: 'Malformed signature header format.',
      };
    }
  }

  normalizeEvent(rawPayload) {
    return {
      provider: 'LINKEDIN',
      eventId: rawPayload?.id ? `LINKEDIN-EVT-${rawPayload.id}` : `LINKEDIN-EVT-${Date.now()}`,
      eventType: rawPayload?.type || rawPayload?.eventType || 'LINKEDIN_EVENT',
      platformAccountId: rawPayload?.organizationId || rawPayload?.actor || null,
      timestamp: rawPayload?.timestamp || new Date().toISOString(),
      payload: rawPayload,
    };
  }

  async processEvent(normalizedEvent, context = {}) {
    return {
      status: 'UNSUPPORTED_CAPABILITY',
      capability: 'LINKEDIN_WEBHOOK_PROCESSING',
      message: 'LinkedIn Lead Sync / Webhook API requires partner program approval for live production ingestion.',
    };
  }

  async subscribe(context = {}) {
    if (!this.isConfigured()) {
      return {
        status: 'CONFIGURATION_REQUIRED',
        message: 'LinkedIn developer application credentials not configured.',
      };
    }

    return {
      status: 'UNSUPPORTED_CAPABILITY',
      capability: 'DEVELOPER_WEBHOOK_SUBSCRIPTION',
      message: 'LinkedIn developer webhook subscriptions require partner approval.',
    };
  }
}

export const linkedinWebhookProvider = new LinkedInWebhookProvider();
export default linkedinWebhookProvider;
