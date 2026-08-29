/**
 * Social Account Routes
 * Task 5: Social Platform Connection Routes
 */

import { Router } from 'express';
import { socialAccountController } from '../../controllers/socialAccountController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const socialAccountRoutes = Router();

socialAccountRoutes.use(requireAuthentication);
socialAccountRoutes.use(tenantScopeMiddleware);

socialAccountRoutes.get('/', socialAccountController.listSocialAccounts);
socialAccountRoutes.get('/oauth-status', socialAccountController.getOAuthStatus);
socialAccountRoutes.get('/:id', socialAccountController.getSocialAccount);
socialAccountRoutes.post('/connect', socialAccountController.connectSocialAccount);
socialAccountRoutes.patch('/:id', socialAccountController.updateSocialAccount);
socialAccountRoutes.post('/:id/reconnect', socialAccountController.reconnectSocialAccount);
socialAccountRoutes.delete('/:id', socialAccountController.disconnectSocialAccount);

export default socialAccountRoutes;
