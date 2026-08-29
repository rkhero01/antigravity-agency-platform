/**
 * Agency Routes
 * Task 28 — Step 2: Agency Profile & Settings Routes
 */

import { Router } from 'express';
import { agencyController } from '../../controllers/agencyController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const agencyRoutes = Router();

agencyRoutes.use(requireAuthentication);
agencyRoutes.use(tenantScopeMiddleware);

agencyRoutes.get('/', agencyController.getAgency);
agencyRoutes.patch('/', agencyController.patchAgency);

export default agencyRoutes;
