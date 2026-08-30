/**
 * Production Webhook Ingestion & Subscription Management Service
 * Task 13 — Phase 2: Ingestion Pipeline, Replay Protection, Tenant Scoping & Lead Sync
 */

import { getWebhookProvider, getAllWebhookStatus } from './providers/index.js';
import { metaWebhookProvider } from './providers/metaWebhookProvider.js';
import { webhookSecurity } from './webhookSecurity.js';
import { socialAccountRepository } from '../../repositories/socialAccountRepository.js';
import { auditService } from '../auditService.js';
import { ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '../../utils/errors.js';

// Tenant-scoped webhook subscription in-memory registry
let subscriptionStore = [];

export class WebhookService {
  /**
   * Get configuration status for all webhook providers
   */
  getWebhookStatus() {
    return getAllWebhookStatus();
  }

  /**
   * Verify GET webhook challenge request from Meta
   */
  async verifyMetaWebhook(query) {
    return await metaWebhookProvider.verifyWebhook(query);
  }

  /**
   * Process incoming Meta webhook event with signature and replay validation
   */
  async processMetaWebhook({ signature, timestamp, rawBody, payload, expectedAgencyId = null }) {
    // 1. Replay Drift Verification
    if (timestamp) {
      const timeCheck = webhookSecurity.verifyTimestampDrift(timestamp);
      if (!timeCheck.isValid) {
        throw new ValidationError(timeCheck.reason);
      }
    }

    // 2. Signature Verification
    if (!signature) {
      throw new AuthenticationError('Missing X-Hub-Signature-256 header.');
    }

    const sigCheck = metaWebhookProvider.verifySignature(rawBody || payload, signature);
    if (!sigCheck.isValid) {
      throw new AuthenticationError(`Invalid Meta webhook signature: ${sigCheck.reason}`);
    }

    // 3. Normalize Event
    const normalized = metaWebhookProvider.normalizeEvent(payload);

    // 4. Execute Processor with Tenant Resolution & Deduplication
    const result = await metaWebhookProvider.processEvent(normalized, { expectedAgencyId });
    return result;
  }

  /**
   * List active webhook subscriptions for an agency
   */
  async listSubscriptions(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');
    let subs = subscriptionStore.filter((s) => s.agencyId === agencyId && !s.deletedAt);

    if (filters.provider && filters.provider !== 'all') {
      subs = subs.filter((s) => s.provider === filters.provider.toUpperCase());
    }
    if (filters.socialAccountId && filters.socialAccountId !== 'all') {
      subs = subs.filter((s) => s.socialAccountId === filters.socialAccountId);
    }

    return subs;
  }

  /**
   * Create or register a webhook subscription for a connected channel
   */
  async createSubscription({ provider, socialAccountId, events = ['messages', 'feed', 'leadgen'], agencyId, user }) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');
    if (!user) throw new AuthorizationError('Authenticated user is required.');
    if (!socialAccountId) throw new ValidationError('Social account ID is required.');

    // 1. Validate tenant ownership of SocialAccount
    const account = await socialAccountRepository.findById(socialAccountId, agencyId);
    if (!account) {
      throw new NotFoundError(`Social account "${socialAccountId}" not found in this agency.`);
    }

    const providerName = (provider || account.platform || '').toUpperCase();
    const providerAdapter = getWebhookProvider(providerName);

    // 2. Capability & Configuration check
    if (providerName === 'GOOGLE' || providerName === 'GOOGLE_BUSINESS' || providerName === 'YOUTUBE') {
      return {
        success: false,
        status: 'UNSUPPORTED_CAPABILITY',
        provider: providerName,
        message: 'Google Business Profile and YouTube do not support direct HTTP webhook subscriptions. Use scheduled sync or Google Cloud Pub/Sub topics.',
      };
    }

    if (providerName === 'LINKEDIN') {
      return {
        success: false,
        status: 'UNSUPPORTED_CAPABILITY',
        provider: providerName,
        message: 'LinkedIn Webhook subscriptions require approved partner program permissions.',
      };
    }

    if (!providerAdapter.isConfigured()) {
      return {
        success: false,
        status: 'CONFIGURATION_REQUIRED',
        provider: providerName,
        message: `Webhook credentials for ${providerName} are not configured in environment variables.`,
      };
    }

    // 3. Create Subscription Record
    const subscription = {
      id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      agencyId,
      clientId: account.clientId || null,
      socialAccountId: account.id,
      platformAccountId: account.platformAccountId,
      provider: providerName,
      events: Array.isArray(events) ? events : [events],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    subscriptionStore.unshift(subscription);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: account.clientId,
      action: 'WEBHOOK_SUBSCRIPTION_CREATED',
      entityType: 'WEBHOOK_SUBSCRIPTION',
      entityId: subscription.id,
      metadata: { provider: providerName, events: subscription.events, socialAccountId: account.id },
    });

    return {
      success: true,
      status: 'ACTIVE',
      subscription,
    };
  }

  /**
   * Delete or unsubscribe a webhook subscription
   */
  async deleteSubscription(subscriptionId, agencyId, user) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');
    const existing = subscriptionStore.find((s) => s.id === subscriptionId && s.agencyId === agencyId && !s.deletedAt);

    if (!existing) {
      throw new NotFoundError(`Webhook subscription "${subscriptionId}" not found.`);
    }

    existing.deletedAt = new Date().toISOString();
    existing.status = 'DISCONNECTED';

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'WEBHOOK_SUBSCRIPTION_DELETED',
      entityType: 'WEBHOOK_SUBSCRIPTION',
      entityId: subscriptionId,
    });

    return {
      success: true,
      message: `Webhook subscription "${subscriptionId}" disconnected successfully.`,
      subscription: existing,
    };
  }
}

export const webhookService = new WebhookService();
export default webhookService;
