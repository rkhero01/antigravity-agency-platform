/**
 * OAuth Discovery Session Store
 * Task 12: Secure Short-Lived Server-Side Discovery Sessions for Account Selection
 */

import crypto from 'crypto';
import { ValidationError, AuthorizationError } from '../../../utils/errors.js';

const DISCOVERY_TTL_MS = 10 * 60 * 1000; // 10 minutes

class OAuthDiscoveryStore {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Creates a discovery session holding encrypted tokens and discovered accounts
   */
  createSession({ agencyId, clientId = null, userId, provider, tokenResult, discoveredAccounts = [] }) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');
    if (!userId) throw new AuthorizationError('User ID is required.');
    if (!provider) throw new ValidationError('Provider is required.');

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();

    const sessionRecord = {
      token,
      agencyId,
      clientId,
      userId,
      provider: provider.toUpperCase(),
      tokenResult,
      discoveredAccounts,
      createdAt: now,
      expiresAt: now + DISCOVERY_TTL_MS,
    };

    this.sessions.set(token, sessionRecord);
    this.cleanupExpired();

    return token;
  }

  /**
   * Validates and consumes discovery session
   */
  validateAndConsumeSession(token, agencyId, expectedProvider = null) {
    if (!token || typeof token !== 'string') {
      throw new ValidationError('Invalid or missing discovery token.');
    }

    const session = this.sessions.get(token);
    if (!session) {
      throw new ValidationError('Discovery session is invalid or has expired. Please initiate OAuth connection again.');
    }

    // Enforce tenant isolation
    if (session.agencyId !== agencyId) {
      throw new AuthorizationError('Unauthorized: Discovery session belongs to a different agency workspace.');
    }

    // Immediately consume to prevent replay
    this.sessions.delete(token);

    if (Date.now() > session.expiresAt) {
      throw new ValidationError('Discovery session has expired. Please initiate OAuth connection again.');
    }

    if (expectedProvider && session.provider !== expectedProvider.toUpperCase()) {
      throw new ValidationError(`Discovery provider mismatch. Expected "${expectedProvider}", got "${session.provider}".`);
    }

    return session;
  }

  /**
   * Clean expired sessions
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [token, rec] of this.sessions.entries()) {
      if (now > rec.expiresAt) {
        this.sessions.delete(token);
      }
    }
  }
}

export const oauthDiscoveryStore = new OAuthDiscoveryStore();
export default oauthDiscoveryStore;
