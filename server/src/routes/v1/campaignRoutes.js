/**
 * Paid Media Campaign Routes
 * Task 28 — Step 2: Campaign Routes
 */

import { Router } from 'express';
import { campaignController } from '../../controllers/campaignController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const campaignRoutes = Router();

campaignRoutes.use(requireAuthentication);
campaignRoutes.use(tenantScopeMiddleware);

campaignRoutes.get('/', campaignController.listCampaigns);
campaignRoutes.get('/:campaignId', campaignController.getCampaignById);
campaignRoutes.post('/', campaignController.createCampaign);
campaignRoutes.patch('/:campaignId', campaignController.updateCampaign);

export default campaignRoutes;
