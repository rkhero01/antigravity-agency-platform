/**
 * AI Action Routes
 * Task 28 — Step 1: AI Action Execution & Rollback Routes
 */

import { Router } from 'express';
import { aiActionController } from '../../controllers/aiActionController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const actionRoutes = Router();

actionRoutes.use(requireAuthentication);
actionRoutes.use(tenantScopeMiddleware);

actionRoutes.post('/:actionId/execute', aiActionController.executeAction);
actionRoutes.post('/:actionId/rollback', aiActionController.rollbackAction);

export default actionRoutes;
