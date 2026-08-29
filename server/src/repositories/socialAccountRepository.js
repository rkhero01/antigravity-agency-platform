/**
 * Social Account Repository
 * Task 5: Real Multi-Tenant Social Accounts & Platform Connection Management
 */

import { BaseRepository } from './baseRepository.js';
import { clientRepository } from './clientRepository.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors.js';

export const SUPPORTED_PLATFORMS = [
  'META',
  'FACEBOOK',
  'INSTAGRAM',
  'GOOGLE_BUSINESS',
  'YOUTUBE',
  'LINKEDIN',
];

export const ACCOUNT_STATUSES = [
  'ACTIVE',
  'NEEDS_REAUTH',
  'DISCONNECTED',
  'ERROR',
];

export class SocialAccountRepository extends BaseRepository {
  constructor() {
    super('SocialAccount');
  }

  /**
   * List all social accounts for a tenant with optional filtering
   */
  async list(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    const { clientId, platform, status, search } = filters;
    const all = await this.findMany({ agencyId });

    let filtered = all.filter((acc) => !acc.deletedAt);

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((acc) => acc.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      const pUpper = platform.toUpperCase();
      filtered = filtered.filter((acc) => {
        const itemPlatform = (acc.platform || '').toUpperCase();
        if (pUpper === 'META') {
          return itemPlatform === 'META' || itemPlatform === 'FACEBOOK' || itemPlatform === 'INSTAGRAM';
        }
        return itemPlatform === pUpper;
      });
    }

    if (status && status !== 'all') {
      const sUpper = status.toUpperCase();
      filtered = filtered.filter((acc) => (acc.status || '').toUpperCase() === sUpper);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((acc) => {
        const name = (acc.accountName || '').toLowerCase();
        const handle = (acc.handle || '').toLowerCase();
        const plt = (acc.platform || '').toLowerCase();
        return name.includes(q) || handle.includes(q) || plt.includes(q);
      });
    }

    // Attach client details for convenience
    const clients = await clientRepository.findMany({ agencyId });
    const clientMap = new Map(clients.map((c) => [c.id, c.clientName]));

    return filtered.map((acc) => ({
      ...acc,
      clientName: acc.clientId ? clientMap.get(acc.clientId) || 'Unassigned Client' : 'Agency Workspace',
    }));
  }

  /**
   * Find single social account scoped to agency
   */
  async findById(id, agencyId) {
    if (!id || !agencyId) return null;
    const account = await super.findById(id, agencyId);
    if (!account || account.deletedAt) return null;

    if (account.clientId) {
      const client = await clientRepository.findById(account.clientId, agencyId);
      account.clientName = client?.clientName || 'Unassigned Client';
    } else {
      account.clientName = 'Agency Workspace';
    }

    return account;
  }

  /**
   * Create a new social account connection record
   */
  async create(data, agencyId) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    const platform = (data.platform || '').toUpperCase();
    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      throw new ValidationError(`Invalid platform "${data.platform}". Supported: ${SUPPORTED_PLATFORMS.join(', ')}`);
    }

    if (!data.accountName || typeof data.accountName !== 'string' || data.accountName.trim().length < 2) {
      throw new ValidationError('Account name is required (min 2 characters).');
    }

    // Validate client association
    if (data.clientId) {
      const client = await clientRepository.findById(data.clientId, agencyId);
      if (!client) {
        throw new NotFoundError(`Client "${data.clientId}" not found in this agency.`);
      }
    }

    const payload = {
      agencyId,
      clientId: data.clientId || null,
      platform,
      accountName: data.accountName.trim(),
      handle: data.handle ? String(data.handle).trim() : null,
      platformAccountId: data.platformAccountId ? String(data.platformAccountId).trim() : `ext-${Date.now()}`,
      status: data.status && ACCOUNT_STATUSES.includes(data.status.toUpperCase()) ? data.status.toUpperCase() : 'ACTIVE',
      tokenExpiresAt: data.tokenExpiresAt ? new Date(data.tokenExpiresAt) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // default 60 days
      scopes: Array.isArray(data.scopes) ? data.scopes.join(',') : (data.scopes || 'read_insights,manage_pages'),
      metadataJson: typeof data.metadata === 'object' ? JSON.stringify(data.metadata) : (data.metadataJson || '{}'),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    return await super.create(payload, agencyId);
  }

  /**
   * Update social account fields
   */
  async update(id, updates, agencyId) {
    if (!id || !agencyId) throw new ValidationError('Account ID and agency ID are required');

    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Social account "${id}" not found.`);
    }

    const safeUpdates = {};
    if (updates.accountName !== undefined) {
      const name = String(updates.accountName).trim();
      if (name.length < 2) throw new ValidationError('Account name must be at least 2 characters.');
      safeUpdates.accountName = name;
    }

    if (updates.handle !== undefined) {
      safeUpdates.handle = String(updates.handle).trim() || null;
    }

    if (updates.platformAccountId !== undefined) {
      safeUpdates.platformAccountId = String(updates.platformAccountId).trim() || null;
    }

    if (updates.platform !== undefined) {
      const pUpper = updates.platform.toUpperCase();
      if (!SUPPORTED_PLATFORMS.includes(pUpper)) {
        throw new ValidationError(`Invalid platform "${updates.platform}".`);
      }
      safeUpdates.platform = pUpper;
    }

    if (updates.status !== undefined) {
      const sUpper = updates.status.toUpperCase();
      if (!ACCOUNT_STATUSES.includes(sUpper)) {
        throw new ValidationError(`Invalid status "${updates.status}".`);
      }
      safeUpdates.status = sUpper;
    }

    if (updates.clientId !== undefined) {
      if (updates.clientId) {
        const client = await clientRepository.findById(updates.clientId, agencyId);
        if (!client) throw new NotFoundError(`Client "${updates.clientId}" not found.`);
        safeUpdates.clientId = updates.clientId;
      } else {
        safeUpdates.clientId = null;
      }
    }

    if (updates.tokenExpiresAt !== undefined) {
      safeUpdates.tokenExpiresAt = updates.tokenExpiresAt ? new Date(updates.tokenExpiresAt) : null;
    }

    if (updates.scopes !== undefined) {
      safeUpdates.scopes = Array.isArray(updates.scopes) ? updates.scopes.join(',') : String(updates.scopes);
    }

    return await super.update(id, safeUpdates, agencyId);
  }

  /**
   * Disconnect / soft delete a social account
   */
  async disconnect(id, agencyId) {
    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Social account "${id}" not found.`);
    }

    return await super.update(
      id,
      {
        status: 'DISCONNECTED',
        deletedAt: new Date(),
      },
      agencyId
    );
  }

  /**
   * Reconnect / refresh credentials
   */
  async reconnect(id, agencyId) {
    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Social account "${id}" not found.`);
    }

    return await super.update(
      id,
      {
        status: 'ACTIVE',
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 days
        deletedAt: null,
      },
      agencyId
    );
  }
}

export const socialAccountRepository = new SocialAccountRepository();
export default socialAccountRepository;
