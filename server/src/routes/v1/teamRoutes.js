/**
 * Team Management Routes
 * Task 28 — Step 2: Team CRUD Routes
 */

import { Router } from 'express';
import { teamController } from '../../controllers/teamController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const teamRoutes = Router();

teamRoutes.use(requireAuthentication);
teamRoutes.use(tenantScopeMiddleware);

teamRoutes.get('/', teamController.listTeam);
teamRoutes.post('/', teamController.createMember);
teamRoutes.patch('/:memberId', teamController.updateMember);
teamRoutes.delete('/:memberId', teamController.deleteMember);

export default teamRoutes;
