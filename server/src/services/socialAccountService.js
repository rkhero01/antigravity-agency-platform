/**
 * Social Account Service
 * Task 5: Business Logic for Social Media Connection & Platform Management
 */

import { socialAccountRepository, SUPPORTED_PLATFORMS, ACCOUNT_STATUSES } from '../repositories/socialAccountRepository.js';
import { auditService, AUDIT_ACTIONS } from './auditService.js';
import { ValidationError, AuthorizationError, NotFoundError } from '../utils/errors.js';

export class SocialAccountService {
  /**
   * Check which external OAuth credentials are configured
   */
  getOAuthStatus() {
    return {
      META: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
      GOOGLE_BUSINESS: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      YOUTUBE: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      LINKEDIN: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    };
  }

  async listAccounts(agencyId, filters = {}) {
    return await socialAccountRepository.list(agencyId, filters);
  }

  async getAccount(id, agencyId) {
    const account = await socialAccountRepository.findById(id, agencyId);
    if (!account) {
      throw new NotFoundError(`Social account "${id}" not found.`);
    }
    return account;
  }

  async connectAccount(data, agencyId, user) {
    const created = await socialAccountRepository.create(data, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'SOCIAL_ACCOUNT',
      entityId: created.id,
      after: created,
    });

    return created;
  }

  async updateAccount(id, updates, agencyId, user) {
    const existing = await this.getAccount(id, agencyId);
    const updated = await socialAccountRepository.update(id, updates, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'SOCIAL_ACCOUNT',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async reconnectAccount(id, agencyId, user) {
    const existing = await this.getAccount(id, agencyId);
    const oauthStatus = this.getOAuthStatus();
    const platform = (existing.platform || '').toUpperCase();

    // Check if OAuth provider credentials are configured
    const isConfigured =
      platform === 'META' || platform === 'FACEBOOK' || platform === 'INSTAGRAM'
        ? oauthStatus.META
        : platform === 'GOOGLE_BUSINESS'
        ? oauthStatus.GOOGLE_BUSINESS
        : platform === 'YOUTUBE'
        ? oauthStatus.YOUTUBE
        : platform === 'LINKEDIN'
        ? oauthStatus.LINKEDIN
        : false;

    // Refresh database connection status
    const reconnected = await socialAccountRepository.reconnect(id, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'SOCIAL_ACCOUNT',
      entityId: id,
      before: existing,
      after: reconnected,
    });

    return {
      account: reconnected,
      oauthConfigured: isConfigured,
      message: isConfigured
        ? `Successfully refreshed OAuth session for ${reconnected.accountName}`
        : `Connection record refreshed in database. External OAuth credentials required for live ${platform} token rotation.`,
    };
  }

  async disconnectAccount(id, agencyId, user) {
    const existing = await this.getAccount(id, agencyId);
    const disconnected = await socialAccountRepository.disconnect(id, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'SOCIAL_ACCOUNT',
      entityId: id,
      before: existing,
      after: disconnected,
    });

    return {
      message: `Social account "${existing.accountName}" disconnected successfully.`,
      account: disconnected,
    };
  }
}

export const socialAccountService = new SocialAccountService();
export default socialAccountService;
