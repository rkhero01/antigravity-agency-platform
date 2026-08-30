/**
 * X / Twitter Account Activity Webhook Provider
 * Task 13 — Phase 1: Real CRC Challenge Verification & X Signature Checking
 */

import crypto from 'crypto';
import { BaseWebhookProvider } from './baseWebhookProvider.js';

export class TwitterWebhookProvider extends BaseWebhookProvider {
  constructor() {
    super('TWITTER');
  }

  isConfigured() {
    return Boolean(process.env.TWITTER_CLIENT_SECRET || process.env.TWITTER_CONSUMER_SECRET);
  }

  getSecret() {
    return (
      process.env.TWITTER_CONSUMER_SECRET ||
      process.env.TWITTER_CLIENT_SECRET ||
      'twitter-demo-secret-2026'
    );
  }

  /**
   * Verify X / Twitter CRC challenge (GET ?crc_token=...)
   */
  async verifyWebhook(query, headers = {}) {
    const crcToken = query.crc_token;
    if (!crcToken) {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: 'Missing crc_token parameter on X webhook challenge.',
      };
    }

    const secret = this.getSecret();
    const hmac = crypto.createHmac('sha256', secret).update(crcToken).digest('base64');

    return {
      isValid: true,
      status: 'VERIFIED',
      response_token: `sha256=${hmac}`,
    };
  }

  /**
   * Verify X payload HMAC-SHA256 signature (x-twitter-webhooks-signature)
   */
  verifySignature(rawBody, signatureHeader, secretOverride = null) {
    const secret = secretOverride || this.getSecret();
    if (!signatureHeader) {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: 'Missing x-twitter-webhooks-signature header on request.',
      };
    }

    const parts = signatureHeader.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: 'Invalid X signature format (expected sha256=...).',
      };
    }

    const signature = parts[1];
    const payloadString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const expectedBase64 = crypto.createHmac('sha256', secret).update(payloadString).digest('base64');

    try {
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedBase64)
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
        reason: 'Malformed signature length or base64 format.',
      };
    }
  }

  normalizeEvent(rawPayload) {
    const userId = rawPayload?.for_user_id;

    if (rawPayload?.tweet_create_events?.length > 0) {
      const tweet = rawPayload.tweet_create_events[0];
      return {
        provider: 'TWITTER',
        eventId: `X-TWEET-${tweet.id_str || tweet.id}`,
        eventType: 'TWEET_CREATE',
        platformAccountId: userId ? String(userId) : null,
        timestamp: tweet.created_at ? new Date(tweet.created_at).toISOString() : new Date().toISOString(),
        payload: {
          tweetId: tweet.id_str || tweet.id,
          text: tweet.text || '',
          user: tweet.user?.screen_name || null,
        },
      };
    }

    return {
      provider: 'TWITTER',
      eventId: `X-EVT-${Date.now()}`,
      eventType: 'X_EVENT',
      platformAccountId: userId ? String(userId) : null,
      timestamp: new Date().toISOString(),
      payload: rawPayload,
    };
  }

  async processEvent(normalizedEvent, context = {}) {
    return {
      success: true,
      status: 'PROCESSED_SANDBOX',
      eventId: normalizedEvent.eventId,
      eventType: normalizedEvent.eventType,
    };
  }
}

export const twitterWebhookProvider = new TwitterWebhookProvider();
export default twitterWebhookProvider;
