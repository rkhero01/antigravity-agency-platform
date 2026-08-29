/**
 * Request ID Middleware
 * Task 28 — Step 1: Request Correlation Tracking
 */

import crypto from 'crypto';

export function requestIdMiddleware(req, res, next) {
  const incomingId = req.header('X-Request-ID') || req.header('x-request-id');
  const requestId = incomingId && incomingId.length < 128 ? incomingId : `REQ-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

export default requestIdMiddleware;
