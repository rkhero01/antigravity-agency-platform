/**
 * CRM Lead Management Routes
 * Task 28 — Step 2: Lead Pipeline Routes
 */

import { Router } from 'express';
import { leadController } from '../../controllers/leadController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const leadRoutes = Router();

leadRoutes.use(requireAuthentication);
leadRoutes.use(tenantScopeMiddleware);

leadRoutes.get('/', leadController.listLeads);
leadRoutes.get('/:leadId', leadController.getLeadById);
leadRoutes.post('/', leadController.createLead);
leadRoutes.patch('/:leadId', leadController.updateLead);
leadRoutes.delete('/:leadId', leadController.deleteLead);

export default leadRoutes;
