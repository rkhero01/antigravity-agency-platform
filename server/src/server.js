/**
 * Production-Grade Server Entry Point & Process Lifecycle Manager
 * Task 28 — Step 6: Server Startup & Graceful Shutdown Hardening
 */

import { app } from './app.js';
import { env, validateEnvironment } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

let serverInstance = null;
let isShuttingDown = false;

export async function startServer(port = env.PORT) {
  try {
    // 1. Validate Environment Configuration
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
      logger.error('Environment validation failed during startup', { errors: envValidation.errors });
      if (env.isProduction) {
        throw new Error(envValidation.message);
      }
    } else {
      logger.info('Environment configuration validated.', { mode: env.isProduction ? 'PRODUCTION' : 'DEMO/DEV' });
    }

    // 2. Initialize Database Connection (PostgreSQL or Demo Sandbox)
    await connectDatabase();

    // 3. Start HTTP Server
    return new Promise((resolve, reject) => {
      serverInstance = app.listen(port, () => {
        logger.info(`Antigravity Backend Server listening on port ${port}`, {
          port,
          env: env.APP_ENV,
          mode: env.isProduction ? 'PRODUCTION' : 'DEMO / SANDBOX',
        });
        resolve(serverInstance);
      });

      serverInstance.on('error', (err) => {
        logger.error('HTTP server listen error', { error: err.message });
        reject(err);
      });
    });
  } catch (err) {
    logger.error('Fatal startup error during server initialization', { error: err.message });
    if (env.isProduction) {
      process.exit(1);
    }
    throw err;
  }
}

export async function stopServer() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('Graceful shutdown sequence initiated...');

  // 1. Close HTTP Server
  if (serverInstance) {
    await new Promise((resolve) => {
      serverInstance.close((err) => {
        if (err) logger.error('Error closing HTTP server', { error: err.message });
        else logger.info('HTTP server closed.');
        resolve();
      });
    });
  }

  // 2. Disconnect Database
  await disconnectDatabase();

  logger.info('Graceful shutdown completed successfully.');
}

// Handle Termination Signals
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received.');
  await stopServer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received.');
  await stopServer();
  process.exit(0);
});

// Auto-start if executed directly as main script
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export default {
  startServer,
  stopServer,
};
