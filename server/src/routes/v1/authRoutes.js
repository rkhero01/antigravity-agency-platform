/**
 * Authentication Routes
 * Task 28 — Step 1: Authentication Gateway Routes
 */

import { Router } from 'express';
import { authController } from '../../controllers/authController.js';
import { requireAuthentication } from '../../middleware/auth.js';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.get('/me', requireAuthentication, authController.me);

export default authRoutes;
