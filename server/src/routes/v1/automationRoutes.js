/**
 * Automation REST API Routes
 * Task 14 — Phase 5: Multi-Tenant Scoped Automation Endpoints
 */

import { Router } from 'express';
import { automationController } from '../../controllers/automationController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const automationRoutes = Router();

automationRoutes.use(requireAuthentication);
automationRoutes.use(tenantScopeMiddleware);

// Execution History Endpoints (Must be mounted before /:id routes)
automationRoutes.get('/executions', automationController.listExecutions);
automationRoutes.get('/executions/:id', automationController.getExecutionById);
automationRoutes.post('/executions/:id/retry', automationController.retryAutomationExecution);

// Rule Management Endpoints
automationRoutes.get('/', automationController.listAutomations);
automationRoutes.get('/:id', automationController.getAutomationById);
automationRoutes.post('/', automationController.createAutomation);
automationRoutes.patch('/:id', automationController.updateAutomation);
automationRoutes.patch('/:id/enable', automationController.enableAutomation);
automationRoutes.patch('/:id/disable', automationController.disableAutomation);
automationRoutes.post('/:id/test', automationController.testAutomationAction);
automationRoutes.delete('/:id', automationController.deleteAutomation);

export default automationRoutes;
