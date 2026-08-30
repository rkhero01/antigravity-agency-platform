/**
 * Content Management & Publishing Routes
 * Task 8: Content Routes with Calendar, Scheduling & Approvals
 */

import { Router } from 'express';
import { contentController } from '../../controllers/contentController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const contentRoutes = Router();

contentRoutes.use(requireAuthentication);
contentRoutes.use(tenantScopeMiddleware);

contentRoutes.get('/', contentController.listContent);
contentRoutes.get('/calendar', contentController.getCalendar);
contentRoutes.get('/:id', contentController.getContentById);
contentRoutes.post('/', contentController.createContent);
contentRoutes.patch('/:id', contentController.updateContent);
contentRoutes.post('/:id/brief', contentController.saveBrief);
contentRoutes.post('/:id/seo', contentController.saveSeoMetadata);
contentRoutes.post('/:id/submit-review', contentController.submitReview);
contentRoutes.post('/:id/schedule', contentController.scheduleContent);
contentRoutes.post('/:id/approve', contentController.approveContent);
contentRoutes.post('/:id/reject', contentController.rejectContent);
contentRoutes.post('/:id/archive', contentController.archiveContent);
contentRoutes.delete('/:id', contentController.deleteContent);

export default contentRoutes;
