/**
 * AI Intelligence Read-Only Routes
 * Task 28 — Step 2: AI Read Routes
 */

import { Router } from 'express';
import { aiController } from '../../controllers/aiController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const aiRoutes = Router();

aiRoutes.use(requireAuthentication);
aiRoutes.use(tenantScopeMiddleware);

aiRoutes.get('/insights', aiController.getInsights);
aiRoutes.get('/recommendations', aiController.getRecommendations);
aiRoutes.get('/anomalies', aiController.getAnomalies);

export default aiRoutes;
