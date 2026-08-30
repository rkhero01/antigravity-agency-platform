/**
 * Social Publishing & Automation Routes
 * Task 9: Publishing Queue & Platform Dispatch REST Endpoints
 */

import { Router } from 'express';
import { publishingController } from '../../controllers/publishingController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const publishingRoutes = Router();

publishingRoutes.use(requireAuthentication);
publishingRoutes.use(tenantScopeMiddleware);

publishingRoutes.get('/', publishingController.listJobs);
publishingRoutes.get('/queue', publishingController.getQueue);
publishingRoutes.get('/failed', publishingController.getFailed);
publishingRoutes.get('/jobs/:id', publishingController.getJobById);
publishingRoutes.post('/queue', publishingController.queueJob);
publishingRoutes.post('/jobs/:id/publish-now', publishingController.publishNow);
publishingRoutes.post('/jobs/:id/retry', publishingController.retryJob);
publishingRoutes.post('/jobs/:id/cancel', publishingController.cancelJob);

export default publishingRoutes;
