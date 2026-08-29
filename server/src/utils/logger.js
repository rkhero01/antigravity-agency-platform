/**
 * Structured Logger with Secret Redaction
 * Task 28 — Step 1: Observability & Logging Foundation
 */

import { redactSecrets } from './redaction.js';

export const logger = {
  info(message, meta = {}) {
    const entry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      meta: redactSecrets(meta),
    };
    console.log(JSON.stringify(entry));
    return entry;
  },

  warn(message, meta = {}) {
    const entry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      meta: redactSecrets(meta),
    };
    console.warn(JSON.stringify(entry));
    return entry;
  },

  error(message, meta = {}) {
    const entry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      meta: redactSecrets(meta),
    };
    console.error(JSON.stringify(entry));
    return entry;
  },

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'demo') {
      const entry = {
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        meta: redactSecrets(meta),
      };
      console.log(JSON.stringify(entry));
      return entry;
    }
  },
};

export default logger;
