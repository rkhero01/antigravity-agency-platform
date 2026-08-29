/**
 * Webhook Controller
 * Task 28 — Step 1: Webhook Ingestion & Signature Verification
 */

import { webhookVerifier } from '../webhooks/webhookVerifier.js';
import { webhookDeduplicator } from '../webhooks/webhookDeduplicator.js';
import { webhookNormalizer } from '../webhooks/webhookNormalizer.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ValidationError, AuthenticationError } from '../utils/errors.js';

export async function handleMetaWebhook(req, res, next) {
  try {
    const signature = req.header('x-hub-signature-256');
    const timestamp = req.header('x-webhook-timestamp') || Math.floor(Date.now() / 1000);
    const agencyId = req.query.agencyId || 'agency-demo-001';

    // 1. Timestamp Replay Drift Check
    const timeCheck = webhookVerifier.verifyTimestamp(timestamp);
    if (!timeCheck.isValid) {
      throw new ValidationError(timeCheck.reason);
    }

    // 2. Signature Verification (Simulated with secret or real)
    const webhookSecret = process.env.META_WA_WEBHOOK_SECRET || 'demo-webhook-secret-2026';
    if (signature) {
      const sigCheck = webhookVerifier.verifyMetaSignature(req.body, signature, webhookSecret);
      if (!sigCheck.isValid) {
        throw new AuthenticationError(`Invalid webhook signature: ${sigCheck.reason}`);
      }
    }

    // 3. Normalize Event
    const normalized = webhookNormalizer.normalizeWhatsAppWebhook(req.body);

    // 4. Deduplicate Event
    const dedupResult = await webhookDeduplicator.processEvent(
      agencyId,
      'META_WHATSAPP',
      normalized.eventId,
      normalized.eventType,
      normalized
    );

    if (dedupResult.isDuplicate) {
      return sendSuccess(res, {
        status: 'IGNORED_DUPLICATE',
        eventId: normalized.eventId,
        message: 'Duplicate webhook event already processed.',
      });
    }

    return sendSuccess(res, {
      status: 'PROCESSED_SANDBOX',
      eventId: normalized.eventId,
      eventType: normalized.eventType,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleCRMWebhook(req, res, next) {
  try {
    const agencyId = req.query.agencyId || 'agency-demo-001';
    const normalized = webhookNormalizer.normalizeCRMWebhook(req.body);

    const dedupResult = await webhookDeduplicator.processEvent(
      agencyId,
      'CRM_GATEWAY',
      normalized.eventId,
      normalized.eventType,
      normalized
    );

    if (dedupResult.isDuplicate) {
      return sendSuccess(res, {
        status: 'IGNORED_DUPLICATE',
        eventId: normalized.eventId,
        message: 'Duplicate CRM event already processed.',
      });
    }

    return sendSuccess(res, {
      status: 'PROCESSED_SANDBOX',
      eventId: normalized.eventId,
    });
  } catch (err) {
    next(err);
  }
}

export const webhookController = {
  handleMetaWebhook,
  handleCRMWebhook,
};

export default webhookController;
