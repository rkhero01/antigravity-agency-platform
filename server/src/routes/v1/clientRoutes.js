/**
 * Client Management Routes
 * Task 28 — Step 2: Client CRUD Routes
 */

import { Router } from 'express';
import { clientController } from '../../controllers/clientController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const clientRoutes = Router();

clientRoutes.use(requireAuthentication);
clientRoutes.use(tenantScopeMiddleware);

clientRoutes.get('/', clientController.listClients);
clientRoutes.get('/:clientId', clientController.getClientById);
clientRoutes.post('/', clientController.createClient);
clientRoutes.patch('/:clientId', clientController.updateClient);
clientRoutes.delete('/:clientId', clientController.deleteClient);

export default clientRoutes;
