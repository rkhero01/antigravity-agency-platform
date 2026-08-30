/**
 * SEO Keywords, Tasks, Rank Tracking & Site Audit Routes
 * Task 28 — Step 3: SEO Routes Subsystem
 * Task 17 — Live Multi-Tenant SERP Tracking, Crawling & Audit Pipeline
 */

import { Router } from 'express';
import { seoKeywordController } from '../../controllers/seoKeywordController.js';
import { seoTaskController } from '../../controllers/seoTaskController.js';
import { seoRankController } from '../../controllers/seoRankController.js';
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

// Live Rank Tracking & SERP
seoRoutes.post('/rank-check', seoRankController.checkRank);
seoRoutes.post('/rank-check/:keywordId', seoRankController.checkRank);
seoRoutes.get('/rank-history/:keywordId', seoRankController.getRankHistory);

// Site Audit & Crawler
seoRoutes.post('/site-audit', seoRankController.runSiteAudit);
seoRoutes.get('/site-audit/history', seoRankController.getAuditHistory);

// Provider Health & Status
seoRoutes.get('/providers/status', seoRankController.getProvidersStatus);

export default seoRoutes;
