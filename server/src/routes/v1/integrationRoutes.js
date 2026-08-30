/**
 * Platform Integrations & OAuth Routes
 * Task 12: REST Endpoints for External OAuth Connection, Multi-Page Discovery & Selection
 */

import { Router } from 'express';
import { integrationController } from '../../controllers/integrationController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const integrationRoutes = Router();

integrationRoutes.use(requireAuthentication);
integrationRoutes.use(tenantScopeMiddleware);

integrationRoutes.get('/status', integrationController.getProviderStatus);
integrationRoutes.get('/:provider/connect', integrationController.initiateConnect);
integrationRoutes.get('/:provider/callback', integrationController.handleCallback);
integrationRoutes.post('/:provider/select-account', integrationController.selectAccount);
integrationRoutes.post('/:id/sync', integrationController.syncAccount);
integrationRoutes.post('/:id/reconnect', integrationController.reconnectAccount);
integrationRoutes.delete('/:id', integrationController.disconnectAccount);

export default integrationRoutes;
