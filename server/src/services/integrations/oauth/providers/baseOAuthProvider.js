/**
 * Base Platform OAuth Provider Interface
 * Task 12: Account Discovery & Identity Verification
 */

import { ValidationError } from '../../../../utils/errors.js';

export class BaseOAuthProvider {
  constructor(name) {
    this.name = name.toUpperCase();
  }

  isConfigured() {
    throw new Error(`isConfigured() must be implemented by ${this.name}`);
  }

  getAuthorizationUrl({ state, redirectUri }) {
    throw new Error(`getAuthorizationUrl() must be implemented by ${this.name}`);
  }

  async exchangeCode({ code, redirectUri }) {
    throw new Error(`exchangeCode() must be implemented by ${this.name}`);
  }

  async refreshToken({ refreshToken }) {
    throw new Error(`refreshToken() must be implemented by ${this.name}`);
  }

  async revoke({ accessToken }) {
    return { success: true };
  }

  async getAccountProfile({ accessToken }) {
    throw new Error(`getAccountProfile() must be implemented by ${this.name}`);
  }

  /**
   * Discovers all available accounts, pages, channels, and identities
   */
  async discoverAccounts({ accessToken }) {
    const profile = await this.getAccountProfile({ accessToken });
    return profile ? [profile] : [];
  }

  ensureConfigured() {
    if (!this.isConfigured()) {
      throw new ValidationError(
        `OAuth credentials for "${this.name}" are not configured in server environment. Set up client ID and secret first.`
      );
    }
  }
}

export default BaseOAuthProvider;
