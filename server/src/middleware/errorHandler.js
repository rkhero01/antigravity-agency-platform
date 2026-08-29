/**
 * Centralized Error Handling Middleware
 * Task 28 — Step 1: Standardized Error Gateway
 */

import { AppError, ERROR_CODES } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export function errorHandlerMiddleware(err, req, res, next) {
  const requestId = req.id || `REQ-${Date.now()}`;

  // Log error with structured logger
  logger.error(err.message || 'Unhandled server error', {
    code: err.code || ERROR_CODES.INTERNAL_ERROR,
    statusCode: err.statusCode || 500,
    requestId,
    url: req.originalUrl,
    method: req.method,
  });

  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  // Handle generic / unexpected exceptions
  return sendError(
    res,
    ERROR_CODES.INTERNAL_ERROR,
    'Internal server error',
    500
  );
}

export default errorHandlerMiddleware;
