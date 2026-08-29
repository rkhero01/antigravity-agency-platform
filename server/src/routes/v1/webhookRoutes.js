/**
 * Webhook Ingestion Routes
 * Task 28 — Step 1: External Provider Webhook Endpoints
 */

import { Router } from 'express';
import { webhookController } from '../../controllers/webhookController.js';

export const webhookRoutes = Router();

webhookRoutes.post('/meta', webhookController.handleMetaWebhook);
webhookRoutes.post('/crm', webhookController.handleCRMWebhook);

export default webhookRoutes;
