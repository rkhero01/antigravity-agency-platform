/**
 * OAuth State Security & CSRF Protection Store
 * Task 11: Single-Use State Tokens with Strict Multi-Tenant Association & Expiration
 */

import crypto from 'crypto';
import { ValidationError, AuthorizationError } from '../../../utils/errors.js';

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

class OAuthStateStore {
  constructor() {
    this.states = new Map();
  }

  /**
   * Generates and stores a cryptographically secure, single-use state token
   */
  createState({ agencyId, clientId = null, userId, provider, redirectUri = null }) {
    if (!agencyId) throw new AuthorizationError('Tenant agency ID is required to generate OAuth state.');
    if (!userId) throw new AuthorizationError('Authenticated user ID is required to generate OAuth state.');
    if (!provider) throw new ValidationError('Integration provider name is required.');

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();

    const stateRecord = {
      token,
      agencyId,
      clientId,
      userId,
      provider: provider.toUpperCase(),
      redirectUri,
      createdAt: now,
      expiresAt: now + STATE_TTL_MS,
    };

    this.states.set(token, stateRecord);
    this.cleanupExpired();

    return token;
  }

  /**
   * Validates and immediately consumes (deletes) a state token
   */
  validateAndConsumeState(token, expectedProvider = null) {
    if (!token || typeof token !== 'string') {
      throw new ValidationError('Invalid or missing OAuth state token.');
    }

    const stateRecord = this.states.get(token);
    if (!stateRecord) {
      throw new ValidationError('OAuth state token is invalid or has already been consumed.');
    }

    // Immediately consume to prevent replay attacks
    this.states.delete(token);

    if (Date.now() > stateRecord.expiresAt) {
      throw new ValidationError('OAuth state token has expired. Please initiate the connection flow again.');
    }

    if (expectedProvider && stateRecord.provider !== expectedProvider.toUpperCase()) {
      throw new ValidationError(`OAuth state provider mismatch. Expected "${expectedProvider}", got "${stateRecord.provider}".`);
    }

    return stateRecord;
  }

  /**
   * Cleans up expired states to prevent memory bloat
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [token, rec] of this.states.entries()) {
      if (now > rec.expiresAt) {
        this.states.delete(token);
      }
    }
  }
}

export const oauthStateStore = new OAuthStateStore();
export default oauthStateStore;
