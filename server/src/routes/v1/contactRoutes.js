/**
 * Client Contact Management Routes
 * Task 28 — Step 2: Contact Routes
 */

import { Router } from 'express';
import { contactController } from '../../controllers/contactController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const contactRoutes = Router();

contactRoutes.use(requireAuthentication);
contactRoutes.use(tenantScopeMiddleware);

contactRoutes.get('/', contactController.listContacts);
contactRoutes.get('/:contactId', contactController.getContactById);
contactRoutes.post('/', contactController.createContact);
contactRoutes.patch('/:contactId', contactController.updateContact);
contactRoutes.delete('/:contactId', contactController.deleteContact);

export default contactRoutes;
