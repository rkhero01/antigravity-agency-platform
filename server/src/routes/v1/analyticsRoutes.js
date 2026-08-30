/**
 * Analytics & Performance Routes
 * Task 10: Performance Tracking & Report Export REST Endpoints
 */

import { Router } from 'express';
import { analyticsController } from '../../controllers/analyticsController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuthentication);
analyticsRoutes.use(tenantScopeMiddleware);

analyticsRoutes.get('/overview', analyticsController.getOverview);
analyticsRoutes.get('/campaigns', analyticsController.getCampaigns);
analyticsRoutes.get('/leads', analyticsController.getLeads);
analyticsRoutes.get('/content', analyticsController.getContent);
analyticsRoutes.get('/clients', analyticsController.getClients);
analyticsRoutes.get('/export', analyticsController.exportReport);

export default analyticsRoutes;
