/**
 * Content & Publishing Repository with Tenant Isolation & Enrichment
 * Task 8: Multi-Tenant Content Pipeline & Editorial Calendar
 */

import { BaseRepository } from './baseRepository.js';
import { clientRepository } from './clientRepository.js';
import { socialAccountRepository } from './socialAccountRepository.js';
import { campaignRepository } from './campaignRepository.js';
import { seoKeywordRepository } from './seoKeywordRepository.js';
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

export const CONTENT_IDEA_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const CONTENT_IDEA_STATUSES = [
  'IDEA',
  'RESEARCHING',
  'BRIEF_READY',
  'IN_PRODUCTION',
  'READY_FOR_REVIEW',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
];

export const SEO_SEARCH_INTENTS = [
  'INFORMATIONAL',
  'COMMERCIAL',
  'TRANSACTIONAL',
  'NAVIGATIONAL',
];

/**
 * Validates and merges metadataJson safely
 */
export function normalizeAndValidateMetadata(rawMetadata = {}, incoming = {}) {
  let existing = {};
  if (typeof rawMetadata === 'string') {
    try {
      existing = JSON.parse(rawMetadata) || {};
    } catch {
      existing = {};
    }
  } else if (rawMetadata && typeof rawMetadata === 'object') {
    existing = { ...rawMetadata };
  }

  const merged = { ...existing };

  if (incoming.contentIdea !== undefined) {
    if (incoming.contentIdea === null) {
      delete merged.contentIdea;
    } else if (typeof incoming.contentIdea !== 'object' || Array.isArray(incoming.contentIdea)) {
      throw new ValidationError('contentIdea must be a valid object.');
    } else {
      const idea = incoming.contentIdea;
      const prevIdea = merged.contentIdea || {};

      let priority = (idea.priority || prevIdea.priority || 'MEDIUM').toUpperCase();
      if (!CONTENT_IDEA_PRIORITIES.includes(priority)) {
        throw new ValidationError(
          `Invalid idea priority "${idea.priority}". Supported: ${CONTENT_IDEA_PRIORITIES.join(', ')}`
        );
      }

      let status = (idea.status || prevIdea.status || 'IDEA').toUpperCase();
      if (!CONTENT_IDEA_STATUSES.includes(status)) {
        throw new ValidationError(
          `Invalid idea status "${idea.status}". Supported: ${CONTENT_IDEA_STATUSES.join(', ')}`
        );
      }

      if (prevIdea.status && prevIdea.status !== status) {
        validateEditorialLifecycleTransition(prevIdea.status, status);
      }

      merged.contentIdea = {
        ...prevIdea,
        topic: idea.topic !== undefined ? String(idea.topic).trim() : (prevIdea.topic || ''),
        angle: idea.angle !== undefined ? String(idea.angle).trim() : (prevIdea.angle || ''),
        targetAudience: idea.targetAudience !== undefined ? String(idea.targetAudience).trim() : (prevIdea.targetAudience || ''),
        objective: idea.objective !== undefined ? String(idea.objective).trim() : (prevIdea.objective || ''),
        priority,
        status,
      };
    }
  }

  if (incoming.contentBrief !== undefined) {
    if (incoming.contentBrief === null) {
      delete merged.contentBrief;
    } else if (typeof incoming.contentBrief !== 'object' || Array.isArray(incoming.contentBrief)) {
      throw new ValidationError('contentBrief must be a valid object.');
    } else {
      const brief = incoming.contentBrief;
      const prevBrief = merged.contentBrief || {};

      merged.contentBrief = {
        ...prevBrief,
        objective: brief.objective !== undefined ? String(brief.objective).trim() : (prevBrief.objective || ''),
        targetAudience: brief.targetAudience !== undefined ? String(brief.targetAudience).trim() : (prevBrief.targetAudience || ''),
        contentAngle: brief.contentAngle !== undefined ? String(brief.contentAngle).trim() : (prevBrief.contentAngle || ''),
        hook: brief.hook !== undefined ? String(brief.hook).trim() : (prevBrief.hook || ''),
        cta: brief.cta !== undefined ? String(brief.cta).trim() : (prevBrief.cta || ''),
        tone: brief.tone !== undefined ? String(brief.tone).trim() : (prevBrief.tone || ''),
        outline: Array.isArray(brief.outline) ? brief.outline : (prevBrief.outline || []),
        keyPoints: Array.isArray(brief.keyPoints) ? brief.keyPoints : (prevBrief.keyPoints || []),
        competitorReferences: Array.isArray(brief.competitorReferences) ? brief.competitorReferences : (prevBrief.competitorReferences || []),
      };
    }
  }

  if (incoming.seo !== undefined) {
    if (incoming.seo === null) {
      delete merged.seo;
    } else if (typeof incoming.seo !== 'object' || Array.isArray(incoming.seo)) {
      throw new ValidationError('seo metadata must be a valid object.');
    } else {
      const seo = incoming.seo;
      const prevSeo = merged.seo || {};

      let searchIntent = (seo.searchIntent || prevSeo.searchIntent || 'INFORMATIONAL').toUpperCase();
      if (!SEO_SEARCH_INTENTS.includes(searchIntent)) {
        throw new ValidationError(
          `Invalid search intent "${seo.searchIntent}". Supported: ${SEO_SEARCH_INTENTS.join(', ')}`
        );
      }

      merged.seo = {
        ...prevSeo,
        primaryKeyword: seo.primaryKeyword !== undefined ? String(seo.primaryKeyword).trim() : (prevSeo.primaryKeyword || ''),
        secondaryKeywords: Array.isArray(seo.secondaryKeywords) ? seo.secondaryKeywords : (prevSeo.secondaryKeywords || []),
        searchIntent,
        seoTitle: seo.seoTitle !== undefined ? String(seo.seoTitle).trim() : (prevSeo.seoTitle || ''),
        metaDescription: seo.metaDescription !== undefined ? String(seo.metaDescription).trim() : (prevSeo.metaDescription || ''),
        slug: seo.slug !== undefined ? String(seo.slug).trim() : (prevSeo.slug || ''),
        targetRank: seo.targetRank !== undefined ? (seo.targetRank !== null ? Number(seo.targetRank) : null) : (prevSeo.targetRank !== undefined ? prevSeo.targetRank : null),
        keywordId: seo.keywordId !== undefined ? (seo.keywordId || null) : (prevSeo.keywordId || null),
        internalLinks: Array.isArray(seo.internalLinks) ? seo.internalLinks : (prevSeo.internalLinks || []),
      };
    }
  }

  return merged;
}

/**
 * Validates editorial workflow transitions
 */
export function validateEditorialLifecycleTransition(currentStatus, targetStatus) {
  if (!currentStatus || currentStatus === targetStatus) return;

  const validTransitions = {
    IDEA: ['RESEARCHING', 'BRIEF_READY', 'IN_PRODUCTION', 'READY_FOR_REVIEW', 'APPROVED', 'ARCHIVED'],
    RESEARCHING: ['BRIEF_READY', 'IN_PRODUCTION', 'READY_FOR_REVIEW', 'APPROVED', 'ARCHIVED'],
    BRIEF_READY: ['IN_PRODUCTION', 'READY_FOR_REVIEW', 'APPROVED', 'ARCHIVED'],
    IN_PRODUCTION: ['READY_FOR_REVIEW', 'APPROVED', 'ARCHIVED'],
    READY_FOR_REVIEW: ['APPROVED', 'REJECTED', 'IN_PRODUCTION', 'ARCHIVED'],
    APPROVED: ['SCHEDULED', 'PUBLISHED', 'IN_PRODUCTION', 'REJECTED', 'ARCHIVED'],
    SCHEDULED: ['PUBLISHED', 'IN_PRODUCTION', 'APPROVED', 'REJECTED', 'ARCHIVED'],
    REJECTED: ['IN_PRODUCTION', 'READY_FOR_REVIEW', 'APPROVED', 'ARCHIVED'],
    PUBLISHED: ['ARCHIVED'],
    ARCHIVED: ['IDEA', 'DRAFT'],
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new ValidationError(
      `Invalid content lifecycle transition from "${currentStatus}" to "${targetStatus}". Allowed next stages: ${allowed.join(', ')}`
    );
  }
}

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
      editorialStatus,
      searchIntent,
      primaryKeyword,
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

    if (editorialStatus && editorialStatus !== 'all') {
      const esUpper = editorialStatus.toUpperCase();
      filtered = filtered.filter((p) => {
        let meta = {};
        try {
          meta = p.metadataJson ? (typeof p.metadataJson === 'string' ? JSON.parse(p.metadataJson) : p.metadataJson) : {};
        } catch {
          meta = {};
        }
        return (meta.contentIdea?.status || '').toUpperCase() === esUpper;
      });
    }

    if (searchIntent && searchIntent !== 'all') {
      const siUpper = searchIntent.toUpperCase();
      filtered = filtered.filter((p) => {
        let meta = {};
        try {
          meta = p.metadataJson ? (typeof p.metadataJson === 'string' ? JSON.parse(p.metadataJson) : p.metadataJson) : {};
        } catch {
          meta = {};
        }
        return (meta.seo?.searchIntent || '').toUpperCase() === siUpper;
      });
    }

    if (primaryKeyword && primaryKeyword.trim()) {
      const kwQuery = primaryKeyword.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        let meta = {};
        try {
          meta = p.metadataJson ? (typeof p.metadataJson === 'string' ? JSON.parse(p.metadataJson) : p.metadataJson) : {};
        } catch {
          meta = {};
        }
        return (meta.seo?.primaryKeyword || '').toLowerCase().includes(kwQuery);
      });
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const title = (p.title || '').toLowerCase();
        const caption = (p.caption || '').toLowerCase();
        const author = (p.author || '').toLowerCase();
        let topic = '';
        let kw = '';
        try {
          const meta = p.metadataJson ? (typeof p.metadataJson === 'string' ? JSON.parse(p.metadataJson) : p.metadataJson) : {};
          topic = (meta.contentIdea?.topic || '').toLowerCase();
          kw = (meta.seo?.primaryKeyword || '').toLowerCase();
        } catch {}
        return title.includes(q) || caption.includes(q) || author.includes(q) || topic.includes(q) || kw.includes(q);
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

    return filtered.map((item) => {
      let meta = {};
      try {
        meta = item.metadataJson ? (typeof item.metadataJson === 'string' ? JSON.parse(item.metadataJson) : item.metadataJson) : {};
      } catch {
        meta = {};
      }
      return {
        ...item,
        metadata: meta,
        contentIdea: meta.contentIdea || null,
        contentBrief: meta.contentBrief || null,
        seo: meta.seo || null,
        clientName: clientMap.get(item.clientId) || 'Assigned Client',
        socialAccountName: item.socialAccountId ? socialMap.get(item.socialAccountId) || null : null,
        campaignName: item.campaignId ? campaignMap.get(item.campaignId) || null : null,
      };
    });
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

    let meta = {};
    try {
      meta = item.metadataJson ? (typeof item.metadataJson === 'string' ? JSON.parse(item.metadataJson) : item.metadataJson) : {};
    } catch {
      meta = {};
    }

    item.metadata = meta;
    item.contentIdea = meta.contentIdea || null;
    item.contentBrief = meta.contentBrief || null;
    item.seo = meta.seo || null;

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

    // Verify SEO keyword if provided
    const kwId = data.seo?.keywordId || data.metadataJson?.seo?.keywordId;
    if (kwId) {
      const kw = await seoKeywordRepository.findById(kwId, agencyId);
      if (!kw) {
        throw new NotFoundError(`SEO keyword "${kwId}" not found in this agency.`);
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

    const mergedMeta = normalizeAndValidateMetadata(data.metadataJson || {}, {
      contentIdea: data.contentIdea,
      contentBrief: data.contentBrief,
      seo: data.seo,
    });

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
      metadataJson: Object.keys(mergedMeta).length > 0 ? JSON.stringify(mergedMeta) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const created = await super.create(payload, agencyId);
    created.clientName = client.clientName;
    created.metadata = mergedMeta;
    created.contentIdea = mergedMeta.contentIdea || null;
    created.contentBrief = mergedMeta.contentBrief || null;
    created.seo = mergedMeta.seo || null;
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

    if (updates.deletedAt !== undefined) {
      safeUpdates.deletedAt = updates.deletedAt ? new Date(updates.deletedAt) : null;
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

    // Verify SEO keyword if updated
    if (updates.seo?.keywordId) {
      const kw = await seoKeywordRepository.findById(updates.seo.keywordId, agencyId);
      if (!kw) {
        throw new NotFoundError(`SEO keyword "${updates.seo.keywordId}" not found in this agency.`);
      }
    }

    // Merge metadata safely
    if (
      updates.contentIdea !== undefined ||
      updates.contentBrief !== undefined ||
      updates.seo !== undefined ||
      updates.metadataJson !== undefined
    ) {
      const rawIncomingMeta = typeof updates.metadataJson === 'object' && updates.metadataJson !== null
        ? updates.metadataJson
        : {};

      const mergedMeta = normalizeAndValidateMetadata(existing.metadataJson || {}, {
        contentIdea: updates.contentIdea,
        contentBrief: updates.contentBrief,
        seo: updates.seo,
        ...rawIncomingMeta,
      });

      safeUpdates.metadataJson = JSON.stringify(mergedMeta);
    }

    const result = await super.update(id, safeUpdates, agencyId);
    if (result) {
      let meta = {};
      try {
        meta = result.metadataJson ? (typeof result.metadataJson === 'string' ? JSON.parse(result.metadataJson) : result.metadataJson) : {};
      } catch {
        meta = {};
      }
      result.metadata = meta;
      result.contentIdea = meta.contentIdea || null;
      result.contentBrief = meta.contentBrief || null;
      result.seo = meta.seo || null;
      if (existing.clientName) result.clientName = existing.clientName;
      if (existing.socialAccountName) result.socialAccountName = existing.socialAccountName;
      if (existing.campaignName) result.campaignName = existing.campaignName;
    }
    return result;
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
