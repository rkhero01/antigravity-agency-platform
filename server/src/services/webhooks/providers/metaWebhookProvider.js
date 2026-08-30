/**
 * Meta (Facebook Pages, Instagram, Lead Ads, WhatsApp) Webhook Provider
 * Task 13 — Phase 3: Real Meta Leadgen -> CRM Pipeline Integration
 */

import crypto from 'crypto';
import { BaseWebhookProvider } from './baseWebhookProvider.js';
import { webhookVerifier } from '../../../webhooks/webhookVerifier.js';
import { webhookDeduplicator } from '../../../webhooks/webhookDeduplicator.js';
import { socialAccountRepository } from '../../../repositories/socialAccountRepository.js';
import { leadRepository } from '../../../repositories/leadRepository.js';
import { campaignRepository } from '../../../repositories/campaignRepository.js';
import { integrationService } from '../../integrations/integrationService.js';
import { auditService } from '../../auditService.js';
import { automationDispatcher } from '../../automationDispatcher.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../../../utils/errors.js';

export class MetaWebhookProvider extends BaseWebhookProvider {
  constructor() {
    super('META');
  }

  isConfigured() {
    return Boolean(
      (process.env.META_APP_SECRET || process.env.META_WA_WEBHOOK_SECRET) &&
      (process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.META_WA_WEBHOOK_SECRET)
    );
  }

  getVerifyToken() {
    return (
      process.env.META_WEBHOOK_VERIFY_TOKEN ||
      process.env.META_WA_WEBHOOK_SECRET ||
      'antigravity_meta_verify_2026'
    );
  }

  getAppSecret() {
    return (
      process.env.META_APP_SECRET ||
      process.env.META_WA_WEBHOOK_SECRET ||
      'demo-webhook-secret-2026'
    );
  }

  /**
   * Verify GET webhook challenge request from Meta
   */
  async verifyWebhook(query = {}) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (!mode || !token) {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: 'Missing hub.mode or hub.verify_token parameter.',
      };
    }

    if (mode !== 'subscribe') {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: `Unsupported hub.mode: "${mode}". Expected "subscribe".`,
      };
    }

    const expectedToken = this.getVerifyToken();
    try {
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(expectedToken)
      );

      if (!isMatch) {
        return {
          isValid: false,
          status: 'VERIFICATION_FAILED',
          reason: 'Verification token mismatch.',
        };
      }

      return {
        isValid: true,
        status: 'VERIFIED',
        challenge: challenge || 'OK',
      };
    } catch (e) {
      return {
        isValid: false,
        status: 'VERIFICATION_FAILED',
        reason: 'Malformed verification token length or character encoding.',
      };
    }
  }

  /**
   * Verify POST HMAC-SHA256 signature using Meta App Secret
   */
  verifySignature(rawBody, signatureHeader, secretOverride = null) {
    const secret = secretOverride || this.getAppSecret();
    return webhookVerifier.verifyMetaSignature(rawBody, signatureHeader, secret);
  }

  /**
   * Normalize raw incoming Meta webhook payload to internal event model
   */
  normalizeEvent(rawPayload) {
    const entry = rawPayload?.entry?.[0];
    const change = entry?.changes?.[0];
    const changeValue = change?.value;
    const field = change?.field;

    // 1. Leadgen Event
    if (field === 'leadgen') {
      const pageId = entry?.id;
      const leadgenId = changeValue?.leadgen_id;
      return {
        provider: 'META',
        eventId: leadgenId ? `META-LEAD-${leadgenId}` : `META-EVT-${Date.now()}`,
        eventType: 'LEADGEN',
        platformAccountId: pageId ? String(pageId) : null,
        timestamp: changeValue?.created_time
          ? new Date(Number(changeValue.created_time) * 1000).toISOString()
          : new Date().toISOString(),
        payload: {
          pageId,
          leadgenId,
          formId: changeValue?.form_id || null,
          adId: changeValue?.ad_id || null,
          adgroupId: changeValue?.adgroup_id || null,
          campaignId: changeValue?.campaign_id || null,
        },
      };
    }

    // 2. Page Feed or Comments Event
    if (field === 'feed' || field === 'comments') {
      const pageId = entry?.id;
      const item = changeValue?.item;
      const verb = changeValue?.verb || 'add';
      const eventId = changeValue?.post_id || changeValue?.comment_id || `FEED-${Date.now()}`;

      return {
        provider: 'META',
        eventId: `META-PAGE-${eventId}`,
        eventType: field === 'comments' ? 'PAGE_COMMENT' : 'PAGE_FEED',
        platformAccountId: pageId ? String(pageId) : null,
        timestamp: entry?.time
          ? new Date(Number(entry.time) * 1000).toISOString()
          : new Date().toISOString(),
        payload: {
          pageId,
          item,
          verb,
          postId: changeValue?.post_id || null,
          commentId: changeValue?.comment_id || null,
          message: changeValue?.message || null,
        },
      };
    }

    // 3. WhatsApp Message Event
    if (changeValue?.messages || changeValue?.contacts) {
      const message = changeValue?.messages?.[0];
      const contact = changeValue?.contacts?.[0];
      return {
        provider: 'META',
        eventId: message?.id ? `META-WA-${message.id}` : `META-WA-${Date.now()}`,
        eventType: 'WHATSAPP_MESSAGE',
        platformAccountId: entry?.id ? String(entry.id) : null,
        timestamp: message?.timestamp
          ? new Date(Number(message.timestamp) * 1000).toISOString()
          : new Date().toISOString(),
        payload: {
          phoneNumberId: entry?.id || null,
          senderWaId: contact?.wa_id || message?.from || null,
          senderName: contact?.profile?.name || null,
          text: message?.text?.body || '',
          type: message?.type || 'text',
        },
      };
    }

    // 4. Default / Generic Meta Event
    return {
      provider: 'META',
      eventId: `META-EVT-${entry?.id || 'GENERIC'}-${Date.now()}`,
      eventType: field ? `META_${field.toUpperCase()}` : 'META_GENERIC',
      platformAccountId: entry?.id ? String(entry.id) : null,
      timestamp: entry?.time
        ? new Date(Number(entry.time) * 1000).toISOString()
        : new Date().toISOString(),
      payload: rawPayload,
    };
  }

  /**
   * Resolve SocialAccount and verify tenant ownership strictly
   */
  async resolveTenantAccount(platformAccountId, expectedAgencyId = null) {
    if (!platformAccountId) {
      throw new ValidationError('Missing platform account ID for tenant resolution.');
    }

    // Search active social accounts matching platformAccountId
    const allAccounts = await socialAccountRepository.findMany({});
    const account = allAccounts.find(
      (a) =>
        !a.deletedAt &&
        a.platformAccountId === String(platformAccountId) &&
        ['META', 'FACEBOOK', 'INSTAGRAM'].includes((a.platform || '').toUpperCase())
    );

    if (!account) {
      throw new NotFoundError(
        `No active SocialAccount found for platform account ID: "${platformAccountId}".`
      );
    }

    // Enforce tenant boundary
    if (expectedAgencyId && account.agencyId !== expectedAgencyId) {
      throw new AuthorizationError(
        `Cross-tenant violation: SocialAccount "${platformAccountId}" belongs to agency "${account.agencyId}", not "${expectedAgencyId}".`
      );
    }

    return account;
  }

  /**
   * Process a normalized Meta webhook event with deduplication and tenant isolation
   */
  async processEvent(normalizedEvent, context = {}) {
    const { expectedAgencyId = null } = context;

    // 1. Resolve tenant ownership
    const account = await this.resolveTenantAccount(
      normalizedEvent.platformAccountId,
      expectedAgencyId
    );

    const agencyId = account.agencyId;
    const clientId = account.clientId;

    // 2. Deduplicate using existing WebhookEvent PostgreSQL store
    const dedup = await webhookDeduplicator.processEvent(
      agencyId,
      'META',
      normalizedEvent.eventId,
      normalizedEvent.eventType,
      normalizedEvent.payload
    );

    if (dedup.isDuplicate) {
      await auditService.log({
        actorId: 'WEBHOOK_META',
        agencyId,
        clientId,
        action: 'META_LEAD_DUPLICATE',
        entityType: 'WEBHOOK_EVENT',
        entityId: normalizedEvent.eventId,
        metadata: { eventId: normalizedEvent.eventId, eventType: normalizedEvent.eventType },
      });

      return {
        success: true,
        duplicate: true,
        eventId: normalizedEvent.eventId,
        message: 'Duplicate Meta webhook event already processed.',
      };
    }

    // 3. Handle Leadgen Event
    if (normalizedEvent.eventType === 'LEADGEN') {
      const leadgenId = normalizedEvent.payload.leadgenId;

      await auditService.log({
        actorId: 'WEBHOOK_META',
        agencyId,
        clientId,
        action: 'META_LEAD_RECEIVED',
        entityType: 'LEAD',
        entityId: leadgenId,
        metadata: { leadgenId, formId: normalizedEvent.payload.formId, pageId: normalizedEvent.platformAccountId },
      });

      // Check if page access token is available for Graph API lead retrieval
      const accessToken = await integrationService.getValidAccessToken(account.id, agencyId);

      if (!accessToken) {
        await auditService.log({
          actorId: 'WEBHOOK_META',
          agencyId,
          clientId,
          action: 'META_LEAD_FAILED',
          entityType: 'LEAD',
          entityId: leadgenId,
          metadata: { reason: 'CONFIGURATION_REQUIRED', message: 'Active decrypted page token missing.' },
        });

        return {
          success: false,
          status: 'CONFIGURATION_REQUIRED',
          eventId: normalizedEvent.eventId,
          message: `Active decrypted access token not available for Meta Page "${account.accountName}". Cannot retrieve lead from Graph API.`,
        };
      }

      // Fetch lead details from Meta Graph API
      let leadData = null;
      try {
        const leadUrl = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${encodeURIComponent(accessToken)}`;
        const res = await fetch(leadUrl);
        const json = await res.json();
        if (!json.error) {
          leadData = json;
        }
      } catch (e) {
        console.warn(`[META_LEAD_FETCH_NOTICE] Graph API lead fetch failed for ${leadgenId}:`, e.message);
      }

      if (leadData) {
        const fieldData = leadData.field_data || [];
        const fieldMap = {};
        for (const f of fieldData) {
          fieldMap[f.name] = f.values?.[0];
        }

        const fullName = fieldMap.full_name || fieldMap.first_name || 'Meta Lead';
        const email = fieldMap.email || null;
        const phone = fieldMap.phone_number || null;
        const company = fieldMap.company_name || null;

        // Resolve real campaign attribution if existing matching campaign exists in this agency
        let resolvedCampaignId = null;
        if (normalizedEvent.payload.campaignId) {
          const campaigns = await campaignRepository.findMany({ agencyId });
          const matchingCampaign = campaigns.find(
            (c) => !c.deletedAt && (c.externalCampaignId === String(normalizedEvent.payload.campaignId) || c.id === String(normalizedEvent.payload.campaignId))
          );
          if (matchingCampaign) {
            resolvedCampaignId = matchingCampaign.id;
          }
        }

        const newLead = await leadRepository.create(
          {
            agencyId,
            clientId: clientId || 'c1',
            campaignId: resolvedCampaignId,
            name: fullName,
            email,
            phone,
            company,
            source: 'META_ADS',
            stage: 'NEW',
            score: phone && email ? 75 : 50,
            value: 0,
            owner: 'Meta Lead Ads Ingestion',
          },
          agencyId
        );

        await auditService.log({
          actorId: 'WEBHOOK_META',
          agencyId,
          clientId,
          action: 'META_LEAD_CREATED',
          entityType: 'LEAD',
          entityId: newLead.id,
          metadata: {
            leadgenId,
            formId: normalizedEvent.payload.formId,
            campaignId: resolvedCampaignId,
            source: 'META_ADS',
          },
        });

        // Trigger tenant-scoped automation workflows
        try {
          await automationDispatcher.dispatchLeadCreated({
            eventType: 'LEAD_CREATED',
            eventId: normalizedEvent.eventId,
            leadId: newLead.id,
            agencyId,
            clientId: clientId || 'c1',
            campaignId: resolvedCampaignId,
            source: 'META_ADS',
            createdAt: new Date().toISOString(),
          });
        } catch (autoErr) {
          console.warn('[AUTOMATION_DISPATCH_NOTICE] Workflow dispatch notice:', autoErr.message);
        }

        return {
          success: true,
          status: 'PROCESSED',
          eventId: normalizedEvent.eventId,
          leadId: newLead.id,
        };
      }

      return {
        success: true,
        status: 'PROCESSED_WEBHOOK_RECORDED',
        eventId: normalizedEvent.eventId,
      };
    }

    // 4. Record Audit Log for feed/comment events
    await auditService.log({
      actorId: 'WEBHOOK_META',
      agencyId,
      clientId,
      action: 'WEBHOOK_EVENT_PROCESSED',
      entityType: 'SOCIAL_ACCOUNT',
      entityId: account.id,
      metadata: { eventType: normalizedEvent.eventType, eventId: normalizedEvent.eventId },
    });

    return {
      success: true,
      status: 'PROCESSED',
      eventId: normalizedEvent.eventId,
      eventType: normalizedEvent.eventType,
    };
  }
}

export const metaWebhookProvider = new MetaWebhookProvider();
export default metaWebhookProvider;
