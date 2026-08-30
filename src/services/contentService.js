/**
 * Production Content Management & Publishing Service Layer
 * Task 8: Database-Connected Multi-Tenant Content Pipeline & Editorial Calendar
 */

import { apiClient } from './api/apiClient.js';

export const CONTENT_STATUSES = [
  { value: 'DRAFT', label: 'Draft', badgeVariant: 'secondary' },
  { value: 'PENDING_APPROVAL', label: 'In Review', badgeVariant: 'warning' },
  { value: 'APPROVED', label: 'Approved', badgeVariant: 'info' },
  { value: 'SCHEDULED', label: 'Scheduled', badgeVariant: 'primary' },
  { value: 'PUBLISHED', label: 'Published', badgeVariant: 'success' },
  { value: 'REJECTED', label: 'Rejected', badgeVariant: 'danger' },
];

export const CONTENT_PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'X / Twitter' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'META', label: 'Meta (Cross-post)' },
];

export const CONTENT_FORMATS = [
  { value: 'CAROUSEL', label: 'Carousel' },
  { value: 'REELS', label: 'Reels / Shorts' },
  { value: 'IMAGE', label: 'Single Image' },
  { value: 'VIDEO', label: 'Video Post' },
  { value: 'THREAD', label: 'Thread' },
  { value: 'ARTICLE', label: 'Article / Newsletter' },
  { value: 'STORY', label: 'Story' },
];

/**
 * Normalizes PostgreSQL ContentItem into frontend Post model
 */
export function normalizePost(dbRecord) {
  if (!dbRecord) return null;

  const rawStatus = (dbRecord.status || 'DRAFT').toUpperCase();
  const statusInfo = CONTENT_STATUSES.find((s) => s.value === rawStatus) || {
    value: rawStatus,
    label: rawStatus,
    badgeVariant: 'secondary',
  };

  const rawFormat = (dbRecord.format || 'CAROUSEL').toUpperCase();
  const formatInfo = CONTENT_FORMATS.find((f) => f.value === rawFormat) || {
    value: rawFormat,
    label: rawFormat,
  };

  const rawPlatform = (dbRecord.platform || 'INSTAGRAM').toUpperCase();
  const platformInfo = CONTENT_PLATFORMS.find((p) => p.value === rawPlatform) || {
    value: rawPlatform,
    label: rawPlatform,
  };

  let formattedScheduledTime = '';
  if (dbRecord.scheduledAt) {
    const d = new Date(dbRecord.scheduledAt);
    formattedScheduledTime = `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  let formattedScheduledDate = '';
  if (dbRecord.scheduledAt) {
    const d = new Date(dbRecord.scheduledAt);
    formattedScheduledDate = d.toISOString().split('T')[0];
  }

  return {
    id: dbRecord.id,
    agencyId: dbRecord.agencyId,
    clientId: dbRecord.clientId,
    clientName: dbRecord.clientName || 'Assigned Client',
    socialAccountId: dbRecord.socialAccountId || null,
    socialAccountName: dbRecord.socialAccountName || null,
    campaignId: dbRecord.campaignId || null,
    campaignName: dbRecord.campaignName || null,
    title: dbRecord.title || 'Untitled Post',
    caption: dbRecord.caption || '',
    type: formatInfo.label,
    format: rawFormat,
    platform: platformInfo.label,
    platformRaw: rawPlatform,
    mediaPreview: dbRecord.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    mediaUrl: dbRecord.mediaUrl || null,
    status: statusInfo.label,
    statusRaw: rawStatus,
    statusVariant: statusInfo.badgeVariant,
    scheduledAt: dbRecord.scheduledAt,
    scheduledDate: formattedScheduledDate,
    scheduledTime: formattedScheduledTime,
    publishedAt: dbRecord.publishedAt,
    author: dbRecord.author || 'Alex Morgan (You)',
    approvedBy: dbRecord.approvedBy || null,
    rejectionReason: dbRecord.rejectionReason || null,
    likesCount: Number(dbRecord.likesCount) || 0,
    commentsCount: Number(dbRecord.commentsCount) || 0,
    sharesCount: Number(dbRecord.sharesCount) || 0,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  };
}

/**
 * Maps form input to backend payload
 */
export function toDbPostPayload(formData = {}) {
  return {
    clientId: formData.clientId,
    socialAccountId: formData.socialAccountId || null,
    campaignId: formData.campaignId || null,
    title: String(formData.title || '').trim(),
    caption: formData.caption ? String(formData.caption).trim() : '',
    format: (formData.format || formData.type || 'CAROUSEL').toUpperCase(),
    platform: (formData.platform || 'INSTAGRAM').toUpperCase(),
    mediaUrl: formData.mediaUrl || formData.mediaPreview || null,
    status: (formData.status || formData.statusRaw || 'DRAFT').toUpperCase(),
    scheduledAt: formData.scheduledAt || (formData.scheduledDate ? `${formData.scheduledDate}T${formData.scheduledTime || '12:00'}:00.000Z` : null),
    author: formData.author ? String(formData.author).trim() : 'Alex Morgan (You)',
  };
}

export const contentService = {
  /**
   * Fetch all posts from live API
   */
  async getPosts(filters = {}) {
    const params = {};
    if (typeof filters === 'string') {
      if (filters !== 'all') params.clientId = filters;
    } else if (filters && typeof filters === 'object') {
      if (filters.clientId && filters.clientId !== 'all') params.clientId = filters.clientId;
      if (filters.socialAccountId && filters.socialAccountId !== 'all') params.socialAccountId = filters.socialAccountId;
      if (filters.campaignId && filters.campaignId !== 'all') params.campaignId = filters.campaignId;
      if (filters.platform && filters.platform !== 'all') params.platform = filters.platform;
      if (filters.format && filters.format !== 'all' && filters.format !== 'All Formats') params.format = filters.format;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();
    }

    const response = await apiClient.content.list(params);
    const rawList = Array.isArray(response.data?.content)
      ? response.data.content
      : Array.isArray(response.data)
      ? response.data
      : [];

    return rawList.map(normalizePost);
  },

  /**
   * Get single post by ID
   */
  async getPostById(id) {
    if (!id) return null;
    const response = await apiClient.content.get(id);
    const raw = response.data?.content || response.data;
    return normalizePost(raw);
  },

  /**
   * Create new content item
   */
  async createPost(postData) {
    const payload = toDbPostPayload(postData);
    const response = await apiClient.content.create(payload);
    const raw = response.data?.content || response.data;
    return normalizePost(raw);
  },

  /**
   * Update content item fields
   */
  async updatePost(id, updates) {
    if (!id) throw new Error('Post ID is required');
    const payload = toDbPostPayload(updates);
    const response = await apiClient.content.update(id, payload);
    const raw = response.data?.content || response.data;
    return normalizePost(raw);
  },

  /**
   * Update post status specifically
   */
  async updatePostStatus(postId, newStatus) {
    const statusMap = {
      'Draft': 'DRAFT',
      'In Review': 'PENDING_APPROVAL',
      'Approved': 'APPROVED',
      'Scheduled': 'SCHEDULED',
      'Published': 'PUBLISHED',
      'Rejected': 'REJECTED',
    };
    const s = statusMap[newStatus] || newStatus.toUpperCase();
    return await this.updatePost(postId, { status: s });
  },

  /**
   * Schedule post
   */
  async schedulePost(postId, scheduledAt) {
    const response = await apiClient.content.schedule(postId, { scheduledAt });
    const raw = response.data?.content || response.data;
    return normalizePost(raw);
  },

  /**
   * Approve post
   */
  async approvePost(postId) {
    const response = await apiClient.content.approve(postId);
    const raw = response.data?.content || response.data;
    return normalizePost(raw);
  },

  /**
   * Reject post
   */
  async rejectPost(postId, reason) {
    const response = await apiClient.content.reject(postId, { reason });
    const raw = response.data?.content || response.data;
    return normalizePost(raw);
  },

  /**
   * Archive / delete post
   */
  async deletePost(postId) {
    if (!postId) throw new Error('Post ID is required');
    const response = await apiClient.content.delete(postId);
    return response.data;
  },

  /**
   * Fetch calendar events
   */
  async getCalendar(filters = {}) {
    const response = await apiClient.content.calendar(filters);
    const rawList = Array.isArray(response.data?.events)
      ? response.data.events
      : Array.isArray(response.data)
      ? response.data
      : [];
    return rawList.map(normalizePost);
  },

  /**
   * Compute stage counters
   */
  calculateStageCounts(posts = []) {
    return {
      total: posts.length,
      scheduled: posts.filter((p) => (p.statusRaw || '').toUpperCase() === 'SCHEDULED' || p.status === 'Scheduled').length,
      approved: posts.filter((p) => (p.statusRaw || '').toUpperCase() === 'APPROVED' || p.status === 'Approved').length,
      inReview: posts.filter(
        (p) =>
          (p.statusRaw || '').toUpperCase() === 'PENDING_APPROVAL' ||
          (p.statusRaw || '').toUpperCase() === 'IN REVIEW' ||
          p.status === 'In Review'
      ).length,
      draft: posts.filter((p) => (p.statusRaw || '').toUpperCase() === 'DRAFT' || p.status === 'Draft').length,
      published: posts.filter((p) => (p.statusRaw || '').toUpperCase() === 'PUBLISHED' || p.status === 'Published').length,
      rejected: posts.filter((p) => (p.statusRaw || '').toUpperCase() === 'REJECTED' || p.status === 'Rejected').length,
    };
  },
};

export default contentService;
