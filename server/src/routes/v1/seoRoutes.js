/**
 * SEO Keywords & Optimization Tasks Routes
 * Task 28 — Step 3: SEO Routes Subsystem
 */

import { Router } from 'express';
import { seoKeywordController } from '../../controllers/seoKeywordController.js';
import { seoTaskController } from '../../controllers/seoTaskController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const seoRoutes = Router();

seoRoutes.use(requireAuthentication);
seoRoutes.use(tenantScopeMiddleware);

// Keywords
seoRoutes.get('/keywords', seoKeywordController.listKeywords);
seoRoutes.get('/keywords/:keywordId', seoKeywordController.getKeywordById);
seoRoutes.post('/keywords', seoKeywordController.createKeyword);
seoRoutes.patch('/keywords/:keywordId', seoKeywordController.updateKeyword);
seoRoutes.delete('/keywords/:keywordId', seoKeywordController.deleteKeyword);

// Tasks
seoRoutes.get('/tasks', seoTaskController.listTasks);
seoRoutes.get('/tasks/:taskId', seoTaskController.getTaskById);
seoRoutes.post('/tasks', seoTaskController.createTask);
seoRoutes.patch('/tasks/:taskId', seoTaskController.updateTask);
seoRoutes.delete('/tasks/:taskId', seoTaskController.deleteTask);

export default seoRoutes;
