/**
 * Unified Version 1 API Gateway Router
 * Task 28 — Step 3: Complete Agency Platform API Gateway
 */

import { Router } from 'express';
import { healthRoutes } from './healthRoutes.js';
import { authRoutes } from './authRoutes.js';
import { agencyRoutes } from './agencyRoutes.js';
import { clientRoutes } from './clientRoutes.js';
import { teamRoutes } from './teamRoutes.js';
import { leadRoutes } from './leadRoutes.js';
import { contactRoutes } from './contactRoutes.js';
import { campaignRoutes } from './campaignRoutes.js';
import { whatsappRoutes } from './whatsappRoutes.js';
import { seoRoutes } from './seoRoutes.js';
import { contractRoutes } from './contractRoutes.js';
import { aiRoutes } from './aiRoutes.js';
import { actionRoutes } from './actionRoutes.js';
import { webhookRoutes } from './webhookRoutes.js';
import { socialAccountRoutes } from './socialAccountRoutes.js';
import { contentRoutes } from './contentRoutes.js';
import { publishingRoutes } from './publishingRoutes.js';
import { analyticsRoutes } from './analyticsRoutes.js';
import { integrationRoutes } from './integrationRoutes.js';

export const v1Router = Router();

// Active API Subsystems
v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/agency', agencyRoutes);
v1Router.use('/clients', clientRoutes);
v1Router.use('/team', teamRoutes);
v1Router.use('/leads', leadRoutes);
v1Router.use('/contacts', contactRoutes);
v1Router.use('/campaigns', campaignRoutes);
v1Router.use('/whatsapp', whatsappRoutes);
v1Router.use('/seo', seoRoutes);
v1Router.use('/contracts', contractRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/actions', actionRoutes);
v1Router.use('/webhooks', webhookRoutes);
v1Router.use('/social-accounts', socialAccountRoutes);
v1Router.use('/content', contentRoutes);
v1Router.use('/publishing', publishingRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/integrations', integrationRoutes);

export default v1Router;
