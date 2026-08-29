/**
 * AI Action Controller
 * Task 28 — Step 1: AI Action Execution & Rollback Endpoints
 */

import { aiActionService } from '../services/aiActionService.js';
import { sendSuccess } from '../utils/response.js';

export async function executeAction(req, res, next) {
  try {
    const { actionId } = req.params;
    const { mode, operatorName } = req.body || {};

    const result = await aiActionService.executeAction(actionId, req.user, {
      mode: mode || 'DEMO',
      operatorName: operatorName || req.user.name,
      requestId: req.id,
    });

    return sendSuccess(res, result, {}, 200);
  } catch (err) {
    next(err);
  }
}

export async function rollbackAction(req, res, next) {
  try {
    const { actionId } = req.params;
    const { reason } = req.body || {};

    const result = await aiActionService.rollbackAction(actionId, req.user, {
      reason,
      requestId: req.id,
    });

    return sendSuccess(res, result, {}, 200);
  } catch (err) {
    next(err);
  }
}

export const aiActionController = {
  executeAction,
  rollbackAction,
};

export default aiActionController;
