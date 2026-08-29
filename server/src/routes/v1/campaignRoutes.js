/**
 * Paid Media Campaign Routes
 * Task 6: Campaign Endpoints with Full CRUD & Soft Deletion
 */

import { Router } from 'express';
import { campaignController } from '../../controllers/campaignController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const campaignRoutes = Router();

campaignRoutes.use(requireAuthentication);
campaignRoutes.use(tenantScopeMiddleware);

campaignRoutes.get('/', campaignController.listCampaigns);
campaignRoutes.get('/:id', campaignController.getCampaignById);
campaignRoutes.post('/', campaignController.createCampaign);
campaignRoutes.patch('/:id', campaignController.updateCampaign);
campaignRoutes.delete('/:id', campaignController.archiveCampaign);

export default campaignRoutes;
