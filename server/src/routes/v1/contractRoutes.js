/**
 * Agency Contracts & Invoices / Billing Routes
 * Task 28 — Step 3: Contracts & Billing Routes Subsystem
 */

import { Router } from 'express';
import { contractController } from '../../controllers/contractController.js';
import { invoiceController } from '../../controllers/invoiceController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const contractRoutes = Router();

contractRoutes.use(requireAuthentication);
contractRoutes.use(tenantScopeMiddleware);

// 1. Invoices / Billing Routes (Mounted before /:contractId to avoid param collision)
contractRoutes.get('/invoices', invoiceController.listInvoices);
contractRoutes.get('/invoices/:invoiceId', invoiceController.getInvoiceById);
contractRoutes.post('/invoices', invoiceController.createInvoice);
contractRoutes.patch('/invoices/:invoiceId', invoiceController.updateInvoice);
contractRoutes.delete('/invoices/:invoiceId', invoiceController.deleteInvoice);

// 2. Contracts Lifecycle Routes
contractRoutes.get('/', contractController.listContracts);
contractRoutes.get('/:contractId', contractController.getContractById);
contractRoutes.post('/', contractController.createContract);
contractRoutes.patch('/:contractId', contractController.updateContract);
contractRoutes.delete('/:contractId', contractController.deleteContract);

export default contractRoutes;
