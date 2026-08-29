/**
 * Health Check, Liveness & Readiness Routes
 * Task 28 — Step 6: Operational Observability Routes
 */

import { Router } from 'express';
import { healthController } from '../../controllers/healthController.js';

export const healthRoutes = Router();

healthRoutes.get('/', healthController.getHealth);
healthRoutes.get('/live', healthController.getLiveness);
healthRoutes.get('/ready', healthController.getReadiness);
healthRoutes.get('/database', healthController.getDatabaseHealth);
healthRoutes.get('/providers', healthController.getProvidersHealth);

export default healthRoutes;
