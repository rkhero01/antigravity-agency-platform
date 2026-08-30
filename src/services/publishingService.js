/**
 * Production Social Publishing & Queue Service Layer
 * Task 9: Real-Mode Safety Gate & Dispatch Interface
 */

import { apiClient } from './api/apiClient.js';

export function normalizeJob(dbRecord) {
  if (!dbRecord) return null;

  return {
    id: dbRecord.id,
    agencyId: dbRecord.agencyId,
    contentItemId: dbRecord.contentItemId,
    contentTitle: dbRecord.contentTitle || 'Untitled Post',
    clientId: dbRecord.clientId,
    clientName: dbRecord.clientName || 'Assigned Client',
    socialAccountId: dbRecord.socialAccountId,
    socialAccountName: dbRecord.socialAccountName || 'Linked Channel',
    platform: (dbRecord.platform || 'INSTAGRAM').toUpperCase(),
    status: (dbRecord.status || 'QUEUED').toUpperCase(),
    externalPostId: dbRecord.externalPostId || null,
    externalPostUrl: dbRecord.externalPostUrl || null,
    scheduledAt: dbRecord.scheduledAt,
    publishedAt: dbRecord.publishedAt,
    retryCount: Number(dbRecord.retryCount) || 0,
    maxRetries: Number(dbRecord.maxRetries) || 3,
    lastError: dbRecord.lastError || null,
    lastAttemptAt: dbRecord.lastAttemptAt,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  };
}

export const publishingService = {
  /**
   * Fetch list of publishing jobs
   */
  async getJobs(filters = {}) {
    const response = await apiClient.publishing.list(filters);
    const rawList = Array.isArray(response.data?.jobs)
      ? response.data.jobs
      : Array.isArray(response.data)
      ? response.data
      : [];
    return rawList.map(normalizeJob);
  },

  /**
   * Fetch active queue
   */
  async getQueue() {
    const response = await apiClient.publishing.getQueue();
    const rawList = Array.isArray(response.data?.queue)
      ? response.data.queue
      : Array.isArray(response.data)
      ? response.data
      : [];
    return rawList.map(normalizeJob);
  },

  /**
   * Fetch failed jobs
   */
  async getFailedJobs() {
    const response = await apiClient.publishing.getFailed();
    const rawList = Array.isArray(response.data?.failed)
      ? response.data.failed
      : Array.isArray(response.data)
      ? response.data
      : [];
    return rawList.map(normalizeJob);
  },

  /**
   * Queue content item for publishing
   */
  async queuePublish(data) {
    const response = await apiClient.publishing.queue({
      contentItemId: data.contentItemId,
      socialAccountId: data.socialAccountId,
      platform: data.platform,
      scheduledAt: data.scheduledAt || null,
    });
    const raw = response.data?.job || response.data;
    return normalizeJob(raw);
  },

  /**
   * Dispatch immediate publish
   */
  async publishNow(jobId) {
    const response = await apiClient.publishing.publishNow(jobId);
    return response.data;
  },

  /**
   * Retry failed publishing job
   */
  async retryJob(jobId) {
    const response = await apiClient.publishing.retry(jobId);
    return response.data;
  },

  /**
   * Cancel queued publishing job
   */
  async cancelJob(jobId) {
    const response = await apiClient.publishing.cancel(jobId);
    return response.data;
  },
};

export default publishingService;
