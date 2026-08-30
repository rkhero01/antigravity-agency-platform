/**
 * CRM Lead Management Routes
 * Task 7: Lead Pipeline Routes with Full CRUD & Soft Deletion
 */

import { Router } from 'express';
import { leadController } from '../../controllers/leadController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const leadRoutes = Router();

leadRoutes.use(requireAuthentication);
leadRoutes.use(tenantScopeMiddleware);

leadRoutes.get('/', leadController.listLeads);
leadRoutes.get('/:id', leadController.getLeadById);
leadRoutes.post('/', leadController.createLead);
leadRoutes.patch('/:id', leadController.updateLead);
leadRoutes.delete('/:id', leadController.deleteLead);

export default leadRoutes;
