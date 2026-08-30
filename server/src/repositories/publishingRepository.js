/**
 * Publishing Queue & Jobs Repository
 * Task 9: Multi-Tenant Publishing Job Persistence & State Tracking
 */

import { BaseRepository } from './baseRepository.js';
import { contentRepository } from './contentRepository.js';
import { socialAccountRepository } from './socialAccountRepository.js';
import { clientRepository } from './clientRepository.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors.js';

export const PUBLISHING_STATES = [
  'QUEUED',
  'PUBLISHING',
  'PUBLISHED',
  'FAILED',
  'CANCELLED',
];

export class PublishingRepository extends BaseRepository {
  constructor() {
    super('PublishingJob');
  }

  /**
   * List all publishing jobs for an agency with optional filters
   */
  async list(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    const { contentItemId, socialAccountId, platform, status } = filters;
    const all = await this.findMany({ agencyId });
    let filtered = all.filter((j) => !j.deletedAt);

    if (contentItemId && contentItemId !== 'all') {
      filtered = filtered.filter((j) => j.contentItemId === contentItemId);
    }

    if (socialAccountId && socialAccountId !== 'all') {
      filtered = filtered.filter((j) => j.socialAccountId === socialAccountId);
    }

    if (platform && platform !== 'all') {
      const pUpper = platform.toUpperCase();
      filtered = filtered.filter((j) => (j.platform || '').toUpperCase() === pUpper);
    }

    if (status && status !== 'all') {
      const sUpper = status.toUpperCase();
      filtered = filtered.filter((j) => (j.status || '').toUpperCase() === sUpper);
    }

    // Enrich with content and social account titles
    const [contentList, socialAccounts, clients] = await Promise.all([
      contentRepository.findMany({ agencyId }),
      socialAccountRepository.findMany({ agencyId }),
      clientRepository.findMany({ agencyId }),
    ]);

    const contentMap = new Map(contentList.map((c) => [c.id, c]));
    const socialMap = new Map(socialAccounts.map((sa) => [sa.id, sa.accountName]));
    const clientMap = new Map(clients.map((c) => [c.id, c.clientName]));

    return filtered.map((job) => {
      const content = contentMap.get(job.contentItemId);
      return {
        ...job,
        contentTitle: content?.title || 'Untitled Post',
        clientId: content?.clientId || null,
        clientName: content ? clientMap.get(content.clientId) || 'Assigned Client' : 'Assigned Client',
        socialAccountName: socialMap.get(job.socialAccountId) || 'Linked Channel',
      };
    });
  }

  /**
   * Find single job by ID scoped to agency
   */
  async findById(id, agencyId = null) {
    if (!id) return null;
    const job = await super.findById(id, agencyId);
    if (!job || job.deletedAt) return null;

    if (agencyId) {
      const content = await contentRepository.findById(job.contentItemId, agencyId);
      job.contentTitle = content?.title || 'Untitled Post';
      job.clientId = content?.clientId || null;
      if (content?.clientId) {
        const client = await clientRepository.findById(content.clientId, agencyId);
        job.clientName = client?.clientName || 'Assigned Client';
      }
      const sa = await socialAccountRepository.findById(job.socialAccountId, agencyId);
      job.socialAccountName = sa?.accountName || 'Linked Channel';
    }

    return job;
  }

  /**
   * Create new publishing job in QUEUED state
   */
  async create(data, agencyId) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    if (!data.contentItemId) {
      throw new ValidationError('Content item association (contentItemId) is required.');
    }

    if (!data.socialAccountId) {
      throw new ValidationError('Social account channel association (socialAccountId) is required.');
    }

    // Verify content item belongs to agency
    const content = await contentRepository.findById(data.contentItemId, agencyId);
    if (!content) {
      throw new NotFoundError(`Content item "${data.contentItemId}" not found in this agency.`);
    }

    // Verify social account belongs to agency
    const socialAccount = await socialAccountRepository.findById(data.socialAccountId, agencyId);
    if (!socialAccount) {
      throw new NotFoundError(`Social account "${data.socialAccountId}" not found in this agency.`);
    }

    const platform = (data.platform || socialAccount.platform || content.platform || 'INSTAGRAM').toUpperCase();
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : (content.scheduledAt || new Date());

    const payload = {
      agencyId,
      contentItemId: data.contentItemId,
      socialAccountId: data.socialAccountId,
      platform,
      status: 'QUEUED',
      externalPostId: null,
      externalPostUrl: null,
      scheduledAt,
      publishedAt: null,
      retryCount: 0,
      maxRetries: data.maxRetries || 3,
      lastError: null,
      lastAttemptAt: null,
      metadataJson: data.metadataJson ? JSON.stringify(data.metadataJson) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const created = await super.create(payload, agencyId);
    created.contentTitle = content.title;
    created.socialAccountName = socialAccount.accountName;
    return created;
  }

  /**
   * Update publishing job status, error, and timestamps
   */
  async update(id, updates, agencyId) {
    if (!id || !agencyId) throw new ValidationError('Job ID and agency ID are required');

    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Publishing job "${id}" not found.`);
    }

    const safeUpdates = {};

    if (updates.status !== undefined) {
      const sUpper = updates.status.toUpperCase();
      if (!PUBLISHING_STATES.includes(sUpper)) {
        throw new ValidationError(`Invalid publishing status "${updates.status}". Supported: ${PUBLISHING_STATES.join(', ')}`);
      }
      safeUpdates.status = sUpper;
    }

    if (updates.externalPostId !== undefined) safeUpdates.externalPostId = updates.externalPostId;
    if (updates.externalPostUrl !== undefined) safeUpdates.externalPostUrl = updates.externalPostUrl;
    if (updates.publishedAt !== undefined) safeUpdates.publishedAt = updates.publishedAt;
    if (updates.retryCount !== undefined) safeUpdates.retryCount = updates.retryCount;
    if (updates.lastError !== undefined) safeUpdates.lastError = updates.lastError;
    if (updates.lastAttemptAt !== undefined) safeUpdates.lastAttemptAt = updates.lastAttemptAt;

    return await super.update(id, safeUpdates, agencyId);
  }

  /**
   * Soft delete / cancel job
   */
  async cancel(id, agencyId) {
    return await this.update(id, { status: 'CANCELLED' }, agencyId);
  }
}

export const publishingRepository = new PublishingRepository();
export default publishingRepository;
