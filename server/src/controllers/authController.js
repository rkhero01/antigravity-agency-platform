/**
 * Authentication Controller
 * Task 28 — Step 1: Authentication Endpoints
 */

import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login(email, password);
    return sendSuccess(res, result, {}, 200);
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  return sendSuccess(res, { message: 'Logged out successfully from session' });
}

export async function me(req, res, next) {
  try {
    const profile = await authService.getCurrentUser(req.user.userId, req.user.agencyId);
    return sendSuccess(res, { user: profile });
  } catch (err) {
    next(err);
  }
}

export const authController = {
  login,
  logout,
  me,
};

export default authController;
