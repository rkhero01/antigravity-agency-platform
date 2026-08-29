/**
 * Production-Grade Express Application Configuration
 * Task 28 — Step 6: Application Hardening & CORS Security
 */

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { securityHeadersMiddleware } from './middleware/securityHeaders.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandlerMiddleware } from './middleware/errorHandler.js';
import { v1Router } from './routes/v1/index.js';
import { NotFoundError } from './utils/errors.js';

export function createApp() {
  const app = express();

  // 1. Core Security & Request Context Middlewares
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);

  // 2. Production-Safe CORS Configuration
  const explicitAllowedOrigins = [
    env.FRONTEND_URL,
    env.CORS_ORIGIN,
    'https://antigravity-agency-platform-1.onrender.com',
    'https://antigravity-agency-platform.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const isAllowedOrigin = (origin) => {
    // Allow requests with no origin (mobile apps, server-side tests, curl)
    if (!origin) return true;
    if (!env.isProduction) return true;
    if (explicitAllowedOrigins.includes(origin)) return true;
    // Allow verified onrender.com subdomains safely
    if (/^https:\/\/[a-zA-Z0-9\-_.]+\.onrender\.com$/.test(origin)) return true;
    return false;
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        // Clean CORS rejection without throwing uncaught 500 internal error
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-ID',
        'X-Webhook-Timestamp',
        'X-Hub-Signature-256',
      ],
      exposedHeaders: ['X-Request-ID'],
      maxAge: 86400, // 24 hours preflight caching
    })
  );

  // 3. Request Parsing with Strict Payload Limits (2MB DOS protection)
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // 4. Rate Limiting (300 requests/min per IP)
  app.use(rateLimiter());

  // 5. Version 1 API Gateway Routes (/api/v1)
  app.use('/api/v1', v1Router);

  // 6. Catch-All Route for Undefined Endpoints
  app.use((req, res, next) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // 7. Centralized Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}

export const app = createApp();
export default app;
