/**
 * WhatsApp Marketing, Inbox & Automation Routes
 * Task 28 — Step 3: WhatsApp Routes Subsystem
 */

import { Router } from 'express';
import { conversationController } from '../../controllers/conversationController.js';
import { whatsappTemplateController } from '../../controllers/whatsappTemplateController.js';
import { whatsappAutomationController } from '../../controllers/whatsappAutomationController.js';
import { followUpController } from '../../controllers/followUpController.js';
import { requireAuthentication } from '../../middleware/auth.js';
import { tenantScopeMiddleware } from '../../middleware/tenantScope.js';

export const whatsappRoutes = Router();

whatsappRoutes.use(requireAuthentication);
whatsappRoutes.use(tenantScopeMiddleware);

// 1. Conversations & Inbox
whatsappRoutes.get('/conversations', conversationController.listConversations);
whatsappRoutes.get('/conversations/:conversationId', conversationController.getConversationById);
whatsappRoutes.post('/conversations', conversationController.createConversation);
whatsappRoutes.patch('/conversations/:conversationId', conversationController.updateConversation);
whatsappRoutes.delete('/conversations/:conversationId', conversationController.deleteConversation);
whatsappRoutes.post('/conversations/:conversationId/messages', conversationController.addMessage);

// 2. Templates
whatsappRoutes.get('/templates', whatsappTemplateController.listTemplates);
whatsappRoutes.get('/templates/:templateId', whatsappTemplateController.getTemplateById);
whatsappRoutes.post('/templates', whatsappTemplateController.createTemplate);
whatsappRoutes.patch('/templates/:templateId', whatsappTemplateController.updateTemplate);
whatsappRoutes.delete('/templates/:templateId', whatsappTemplateController.deleteTemplate);

// 3. Automations
whatsappRoutes.get('/automations', whatsappAutomationController.listAutomations);
whatsappRoutes.get('/automations/:automationId', whatsappAutomationController.getAutomationById);
whatsappRoutes.post('/automations', whatsappAutomationController.createAutomation);
whatsappRoutes.patch('/automations/:automationId', whatsappAutomationController.updateAutomation);
whatsappRoutes.delete('/automations/:automationId', whatsappAutomationController.deleteAutomation);

// 4. Follow-ups
whatsappRoutes.get('/follow-ups', followUpController.listFollowUps);
whatsappRoutes.get('/follow-ups/:followUpId', followUpController.getFollowUpById);
whatsappRoutes.post('/follow-ups', followUpController.createFollowUp);
whatsappRoutes.patch('/follow-ups/:followUpId', followUpController.updateFollowUp);
whatsappRoutes.delete('/follow-ups/:followUpId', followUpController.deleteFollowUp);

export default whatsappRoutes;
