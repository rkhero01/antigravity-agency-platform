/**
 * Standardized API Response Helpers
 * Task 28 — Step 1: Standardized API Gateway Envelope
 */

import { redactSecrets } from './redaction.js';

export function sendSuccess(res, data = {}, meta = {}, statusCode = 200) {
  const requestId = res.req?.id || res.getHeader('X-Request-ID') || `REQ-${Date.now()}`;
  res.setHeader('X-Request-ID', requestId);

  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
      ...meta,
    },
  });
}

export function sendError(res, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred', statusCode = 500, details = {}) {
  const requestId = res.req?.id || res.getHeader('X-Request-ID') || `REQ-${Date.now()}`;
  res.setHeader('X-Request-ID', requestId);

  const errorBody = {
    code,
    message,
    requestId,
  };

  // Only include sanitized details if non-empty and in non-production
  if (details && Object.keys(details).length > 0) {
    errorBody.details = redactSecrets(details);
  }

  return res.status(statusCode).json({
    success: false,
    error: errorBody,
  });
}

export const responseUtils = {
  sendSuccess,
  sendError,
};

export default responseUtils;
