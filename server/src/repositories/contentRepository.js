/**
 * Content & Publishing Repository with Tenant Isolation & Enrichment
 * Task 8: Multi-Tenant Content Pipeline & Editorial Calendar
 */

import { BaseRepository } from './baseRepository.js';
import { clientRepository } from './clientRepository.js';
import { socialAccountRepository } from './socialAccountRepository.js';
import { campaignRepository } from './campaignRepository.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors.js';

export const ALLOWED_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
];

export const ALLOWED_PLATFORMS = [
  'INSTAGRAM',
  'FACEBOOK',
  'LINKEDIN',
  'TWITTER',
  'YOUTUBE',
  'META',
];

export const ALLOWED_FORMATS = [
  'CAROUSEL',
  'REELS',
  'IMAGE',
  'VIDEO',
  'THREAD',
  'ARTICLE',
  'STORY',
];

export class ContentRepository extends BaseRepository {
  constructor() {
    super('ContentItem');
    this.seedDefaultPosts();
  }

  seedDefaultPosts() {
    const demoAgencyId = 'agency-demo-001';
    const samplePosts = [
      {
        id: 'post-1',
        agencyId: demoAgencyId,
        clientId: 'c1',
        socialAccountId: null,
        campaignId: null,
        title: 'High-Intensity Summer Challenge Launch',
        caption: 'Unleash your full athletic potential this summer with Apex Elite strength conditioning. ⚡ Limited cohort slots open now!',
        format: 'CAROUSEL',
        platform: 'INSTAGRAM',
        mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 86400000 * 2),
        publishedAt: null,
        author: 'Alex Morgan (Lead Strategist)',
        approvedBy: 'Diya Patel',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
      },
      {
        id: 'post-2',
        agencyId: demoAgencyId,
        clientId: 'c2',
        socialAccountId: null,
        campaignId: null,
        title: 'Farm-to-Table Cold-Pressed Matcha Drop',
        caption: '100% organic ceremonial grade matcha, harvested at peak vitality. Available across all gourmet retail doors starting today! 🍃',
        format: 'REELS',
        platform: 'INSTAGRAM',
        mediaUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80',
        status: 'PUBLISHED',
        scheduledAt: new Date(Date.now() - 86400000 * 3),
        publishedAt: new Date(Date.now() - 86400000 * 3),
        author: 'Rohan Gupta (Creative Producer)',
        approvedBy: 'Diya Patel',
        likesCount: 342,
        commentsCount: 28,
        sharesCount: 15,
      },
      {
        id: 'post-3',
        agencyId: demoAgencyId,
        clientId: 'c3',
        socialAccountId: null,
        campaignId: null,
        title: 'B2B Enterprise Kubernetes Architecture Whitepaper',
        caption: 'How hybrid cloud orchestration cuts latency by 64% while maintaining strict data sovereignty. Download the free executive brief. 🚀',
        format: 'ARTICLE',
        platform: 'LINKEDIN',
        mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        status: 'APPROVED',
        scheduledAt: new Date(Date.now() + 86400000 * 5),
        publishedAt: null,
        author: 'Aarav Sharma (Head of Content)',
        approvedBy: 'Alex Morgan',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
      },
    ];

    for (const p of samplePosts) {
      this.inMemoryStore.set(p.id, {
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  /**
   * List all content items with multi-tenant filters
   */
  async list(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    const {
      clientId,
      socialAccountId,
      campaignId,
      platform,
      format,
      status,
      search,
    } = filters;

    const all = await this.findMany({ agencyId });
    let filtered = all.filter((p) => !p.deletedAt);

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((p) => p.clientId === clientId);
    }

    if (socialAccountId && socialAccountId !== 'all') {
      filtered = filtered.filter((p) => p.socialAccountId === socialAccountId);
    }

    if (campaignId && campaignId !== 'all') {
      filtered = filtered.filter((p) => p.campaignId === campaignId);
    }

    if (platform && platform !== 'all') {
      const pUpper = platform.toUpperCase();
      filtered = filtered.filter((p) => (p.platform || '').toUpperCase() === pUpper);
    }

    if (format && format !== 'all' && format !== 'All Formats') {
      const fUpper = format.toUpperCase();
      filtered = filtered.filter((p) => (p.format || '').toUpperCase() === fUpper);
    }

    if (status && status !== 'all') {
      const sUpper = status.toUpperCase();
      filtered = filtered.filter((p) => (p.status || '').toUpperCase() === sUpper);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const title = (p.title || '').toLowerCase();
        const caption = (p.caption || '').toLowerCase();
        const author = (p.author || '').toLowerCase();
        return title.includes(q) || caption.includes(q) || author.includes(q);
      });
    }

    // Attach client, social account, and campaign details
    const [clients, socialAccounts, campaigns] = await Promise.all([
      clientRepository.findMany({ agencyId }),
      socialAccountRepository.findMany({ agencyId }),
      campaignRepository.findMany({ agencyId }),
    ]);

    const clientMap = new Map(clients.map((c) => [c.id, c.clientName]));
    const socialMap = new Map(socialAccounts.map((sa) => [sa.id, sa.accountName]));
    const campaignMap = new Map(campaigns.map((camp) => [camp.id, camp.name]));

    return filtered.map((item) => ({
      ...item,
      clientName: clientMap.get(item.clientId) || 'Assigned Client',
      socialAccountName: item.socialAccountId ? socialMap.get(item.socialAccountId) || null : null,
      campaignName: item.campaignId ? campaignMap.get(item.campaignId) || null : null,
    }));
  }

  /**
   * Find single content item scoped to agency
   */
  async findById(id, agencyId = null) {
    if (!id) return null;
    const item = await super.findById(id, agencyId);
    if (!item || item.deletedAt) return null;

    if (agencyId) {
      if (item.clientId) {
        const client = await clientRepository.findById(item.clientId, agencyId);
        item.clientName = client?.clientName || 'Assigned Client';
      }
      if (item.socialAccountId) {
        const sa = await socialAccountRepository.findById(item.socialAccountId, agencyId);
        item.socialAccountName = sa?.accountName || null;
      }
      if (item.campaignId) {
        const camp = await campaignRepository.findById(item.campaignId, agencyId);
        item.campaignName = camp?.name || null;
      }
    }

    return item;
  }

  /**
   * Create content item with tenant verification
   */
  async create(data, agencyId) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
      throw new ValidationError('Content title is required (min 2 characters).');
    }

    if (!data.clientId) {
      throw new ValidationError('Client association (clientId) is required.');
    }

    // Verify client belongs to authenticated agency
    const client = await clientRepository.findById(data.clientId, agencyId);
    if (!client) {
      throw new NotFoundError(`Client "${data.clientId}" not found in this agency.`);
    }

    // Verify social account if provided
    if (data.socialAccountId) {
      const sa = await socialAccountRepository.findById(data.socialAccountId, agencyId);
      if (!sa) {
        throw new NotFoundError(`Social account "${data.socialAccountId}" not found in this agency.`);
      }
    }

    // Verify campaign if provided
    if (data.campaignId) {
      const camp = await campaignRepository.findById(data.campaignId, agencyId);
      if (!camp) {
        throw new NotFoundError(`Campaign "${data.campaignId}" not found in this agency.`);
      }
    }

    const platform = data.platform && ALLOWED_PLATFORMS.includes(data.platform.toUpperCase())
      ? data.platform.toUpperCase()
      : 'INSTAGRAM';

    const format = data.format && ALLOWED_FORMATS.includes(data.format.toUpperCase())
      ? data.format.toUpperCase()
      : 'CAROUSEL';

    const status = data.status && ALLOWED_STATUSES.includes(data.status.toUpperCase())
      ? data.status.toUpperCase()
      : (data.scheduledAt ? 'SCHEDULED' : 'DRAFT');

    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

    const payload = {
      agencyId,
      clientId: data.clientId,
      socialAccountId: data.socialAccountId || null,
      campaignId: data.campaignId || null,
      title: data.title.trim(),
      caption: data.caption ? String(data.caption).trim() : '',
      format,
      platform,
      mediaUrl: data.mediaUrl || data.mediaPreview || null,
      status,
      scheduledAt,
      publishedAt: null,
      author: data.author ? String(data.author).trim() : 'Alex Morgan (You)',
      approvedBy: null,
      rejectionReason: null,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      metadataJson: data.metadataJson ? JSON.stringify(data.metadataJson) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const created = await super.create(payload, agencyId);
    created.clientName = client.clientName;
    return created;
  }

  /**
   * Update content item fields
   */
  async update(id, updates, agencyId) {
    if (!id || !agencyId) throw new ValidationError('Content ID and agency ID are required');

    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Content item "${id}" not found.`);
    }

    const safeUpdates = {};

    if (updates.title !== undefined) {
      const title = String(updates.title).trim();
      if (title.length < 2) throw new ValidationError('Content title must be at least 2 characters.');
      safeUpdates.title = title;
    }

    if (updates.caption !== undefined) {
      safeUpdates.caption = String(updates.caption).trim();
    }

    if (updates.format !== undefined) {
      const fUpper = updates.format.toUpperCase();
      if (!ALLOWED_FORMATS.includes(fUpper)) {
        throw new ValidationError(`Invalid format "${updates.format}". Supported: ${ALLOWED_FORMATS.join(', ')}`);
      }
      safeUpdates.format = fUpper;
    }

    if (updates.platform !== undefined) {
      const pUpper = updates.platform.toUpperCase();
      if (!ALLOWED_PLATFORMS.includes(pUpper)) {
        throw new ValidationError(`Invalid platform "${updates.platform}". Supported: ${ALLOWED_PLATFORMS.join(', ')}`);
      }
      safeUpdates.platform = pUpper;
    }

    if (updates.mediaUrl !== undefined || updates.mediaPreview !== undefined) {
      safeUpdates.mediaUrl = updates.mediaUrl || updates.mediaPreview || null;
    }

    if (updates.status !== undefined) {
      const sUpper = updates.status.toUpperCase();
      if (!ALLOWED_STATUSES.includes(sUpper)) {
        throw new ValidationError(`Invalid status "${updates.status}". Supported: ${ALLOWED_STATUSES.join(', ')}`);
      }
      safeUpdates.status = sUpper;
      if (sUpper === 'PUBLISHED' && !existing.publishedAt) {
        safeUpdates.publishedAt = new Date();
      }
    }

    if (updates.scheduledAt !== undefined) {
      safeUpdates.scheduledAt = updates.scheduledAt ? new Date(updates.scheduledAt) : null;
      if (safeUpdates.scheduledAt && (!updates.status || updates.status === 'DRAFT')) {
        safeUpdates.status = 'SCHEDULED';
      }
    }

    if (updates.approvedBy !== undefined) {
      safeUpdates.approvedBy = updates.approvedBy;
    }

    if (updates.rejectionReason !== undefined) {
      safeUpdates.rejectionReason = updates.rejectionReason;
    }

    if (updates.socialAccountId !== undefined) {
      if (updates.socialAccountId) {
        const sa = await socialAccountRepository.findById(updates.socialAccountId, agencyId);
        if (!sa) throw new NotFoundError(`Social account "${updates.socialAccountId}" not found.`);
        safeUpdates.socialAccountId = updates.socialAccountId;
      } else {
        safeUpdates.socialAccountId = null;
      }
    }

    if (updates.campaignId !== undefined) {
      if (updates.campaignId) {
        const camp = await campaignRepository.findById(updates.campaignId, agencyId);
        if (!camp) throw new NotFoundError(`Campaign "${updates.campaignId}" not found.`);
        safeUpdates.campaignId = updates.campaignId;
      } else {
        safeUpdates.campaignId = null;
      }
    }

    return await super.update(id, safeUpdates, agencyId);
  }

  /**
   * Schedule content
   */
  async schedule(id, scheduledAt, agencyId) {
    if (!scheduledAt) throw new ValidationError('Scheduled date/time is required.');
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) throw new ValidationError('Invalid scheduled date/time format.');

    return await this.update(id, { scheduledAt: date, status: 'SCHEDULED' }, agencyId);
  }

  /**
   * Approve content
   */
  async approve(id, approverName, agencyId) {
    return await this.update(
      id,
      {
        status: 'APPROVED',
        approvedBy: approverName || 'Approved',
        rejectionReason: null,
      },
      agencyId
    );
  }

  /**
   * Reject content
   */
  async reject(id, reason, agencyId) {
    return await this.update(
      id,
      {
        status: 'REJECTED',
        rejectionReason: reason || 'Revision required',
      },
      agencyId
    );
  }

  /**
   * Archive / soft-delete content
   */
  async archive(id, agencyId) {
    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Content item "${id}" not found.`);
    }

    return await super.update(
      id,
      {
        status: 'ARCHIVED',
        deletedAt: new Date(),
      },
      agencyId
    );
  }

  /**
   * Calendar query for a date window
   */
  async getCalendar(agencyId, filters = {}) {
    const items = await this.list(agencyId, filters);
    return items.filter((item) => item.scheduledAt || item.publishedAt || item.createdAt);
  }
}

export const contentRepository = new ContentRepository();
export default contentRepository;
