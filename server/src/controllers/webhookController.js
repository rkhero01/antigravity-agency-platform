/**
 * Webhook Ingestion & Subscription Controller
 * Task 13 — Phase 2: Meta Verification, Ingestion Pipeline & Subscription Management
 */

import { webhookService } from '../services/webhooks/webhookService.js';
import { webhookDeduplicator } from '../webhooks/webhookDeduplicator.js';
import { webhookNormalizer } from '../webhooks/webhookNormalizer.js';
import { sendSuccess } from '../utils/response.js';
import { ValidationError, AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkWebhookMutationPermission(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage webhook subscriptions.');
  }
}

/**
 * Public Meta GET Webhook Verification Handler
 */
export async function handleMetaGetVerification(req, res, next) {
  try {
    const result = await webhookService.verifyMetaWebhook(req.query);
    if (result.isValid) {
      return res.status(200).send(result.challenge);
    }
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: result.reason || 'Verification token mismatch',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public Meta POST Webhook Ingestion Handler
 */
export async function handleMetaWebhook(req, res, next) {
  try {
    const signature = req.header('x-hub-signature-256');
    const timestamp = req.header('x-webhook-timestamp');
    const expectedAgencyId = req.query.agencyId || null;

    const result = await webhookService.processMetaWebhook({
      signature,
      timestamp,
      rawBody: req.body,
      payload: req.body,
      expectedAgencyId,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * Public CRM Webhook Ingestion Handler
 */
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

/**
 * Authenticated Webhook Provider Status
 */
export async function getWebhookStatus(req, res, next) {
  try {
    const status = webhookService.getWebhookStatus();
    return sendSuccess(res, { providers: status });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticated Tenant Webhook Subscriptions
 */
export async function listSubscriptions(req, res, next) {
  try {
    const subscriptions = await webhookService.listSubscriptions(req.agencyId, req.query);
    return sendSuccess(res, { subscriptions });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticated Create Webhook Subscription
 */
export async function createSubscription(req, res, next) {
  try {
    checkWebhookMutationPermission(req.user.role);
    const { provider } = req.params;
    const result = await webhookService.createSubscription({
      ...req.body,
      provider,
      agencyId: req.agencyId,
      user: req.user,
    });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticated Delete Webhook Subscription
 */
export async function deleteSubscription(req, res, next) {
  try {
    checkWebhookMutationPermission(req.user.role);
    const { id } = req.params;
    const result = await webhookService.deleteSubscription(id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export const webhookController = {
  handleMetaGetVerification,
  handleMetaWebhook,
  handleCRMWebhook,
  getWebhookStatus,
  listSubscriptions,
  createSubscription,
  deleteSubscription,
};

export default webhookController;
