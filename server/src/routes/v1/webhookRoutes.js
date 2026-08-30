/**
 * Webhook Ingestion & Management Routes
 * Task 13 — Phase 2: Public Ingestion & Authenticated Subscription Management
 */

import { Router } from 'express';
import { webhookController } from '../../controllers/webhookController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const webhookRoutes = Router();

// Public Webhook Ingestion Endpoints (Verified via signatures/verify tokens)
webhookRoutes.get('/meta', webhookController.handleMetaGetVerification);
webhookRoutes.post('/meta', webhookController.handleMetaWebhook);
webhookRoutes.post('/crm', webhookController.handleCRMWebhook);

// Authenticated Tenant Webhook Management Routes
webhookRoutes.use(requireAuthentication);
webhookRoutes.use(tenantScopeMiddleware);

webhookRoutes.get('/status', webhookController.getWebhookStatus);
webhookRoutes.get('/subscriptions', webhookController.listSubscriptions);
webhookRoutes.post('/:provider/subscribe', webhookController.createSubscription);
webhookRoutes.delete('/subscriptions/:id', webhookController.deleteSubscription);

export default webhookRoutes;
