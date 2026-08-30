/**
 * Social Publishing & Queue Orchestration Service
 * Task 9: Real-Mode Safety Gate, Queue Processing & Platform Dispatch
 */

import { publishingRepository } from '../repositories/publishingRepository.js';
import { contentRepository } from '../repositories/contentRepository.js';
import { socialAccountRepository } from '../repositories/socialAccountRepository.js';
import { getPublishingAdapter } from './publishing/providers/adapters.js';
import { auditService, AUDIT_ACTIONS } from './auditService.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors.js';

export class PublishingService {
  /**
   * Queue a content item for social publishing
   */
  async queuePublishJob(data, agencyId, user) {
    const job = await publishingRepository.create(data, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: job.clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'PUBLISHING_JOB',
      entityId: job.id,
      after: job,
    });

    return job;
  }

  /**
   * Execute publishing job via platform adapter
   */
  async executePublishJob(jobId, agencyId, user) {
    const job = await publishingRepository.findById(jobId, agencyId);
    if (!job) {
      throw new NotFoundError(`Publishing job "${jobId}" not found.`);
    }

    if (job.status === 'PUBLISHED') {
      throw new ValidationError('Job is already published.');
    }

    // Set to PUBLISHING state
    await publishingRepository.update(
      jobId,
      {
        status: 'PUBLISHING',
        lastAttemptAt: new Date(),
      },
      agencyId
    );

    const [contentItem, socialAccount] = await Promise.all([
      contentRepository.findById(job.contentItemId, agencyId),
      socialAccountRepository.findById(job.socialAccountId, agencyId),
    ]);

    const adapter = getPublishingAdapter(job.platform);
    const publishResult = await adapter.publish({ contentItem, socialAccount });

    let updatedJob;
    if (publishResult.success) {
      updatedJob = await publishingRepository.update(
        jobId,
        {
          status: 'PUBLISHED',
          externalPostId: publishResult.externalPostId,
          externalPostUrl: publishResult.externalPostUrl,
          publishedAt: publishResult.publishedAt || new Date(),
          lastError: null,
        },
        agencyId
      );

      // Also update ContentItem status to PUBLISHED
      await contentRepository.update(
        job.contentItemId,
        {
          status: 'PUBLISHED',
          publishedAt: publishResult.publishedAt || new Date(),
        },
        agencyId
      );
    } else {
      const newRetryCount = (job.retryCount || 0) + 1;
      updatedJob = await publishingRepository.update(
        jobId,
        {
          status: 'FAILED',
          lastError: publishResult.error || 'Publishing failed.',
          retryCount: newRetryCount,
        },
        agencyId
      );
    }

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: job.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'PUBLISHING_JOB',
      entityId: jobId,
      before: job,
      after: updatedJob,
    });

    return {
      job: updatedJob,
      result: publishResult,
    };
  }

  /**
   * Retry a failed publishing job
   */
  async retryPublishJob(jobId, agencyId, user) {
    const job = await publishingRepository.findById(jobId, agencyId);
    if (!job) {
      throw new NotFoundError(`Publishing job "${jobId}" not found.`);
    }

    if (job.retryCount >= job.maxRetries) {
      throw new ValidationError(`Maximum retries (${job.maxRetries}) exceeded for this job.`);
    }

    // Reset status to QUEUED
    await publishingRepository.update(jobId, { status: 'QUEUED' }, agencyId);

    // Attempt immediate execution
    return await this.executePublishJob(jobId, agencyId, user);
  }

  /**
   * Cancel a publishing job
   */
  async cancelPublishJob(jobId, agencyId, user) {
    const job = await publishingRepository.findById(jobId, agencyId);
    if (!job) {
      throw new NotFoundError(`Publishing job "${jobId}" not found.`);
    }

    const cancelled = await publishingRepository.cancel(jobId, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: job.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'PUBLISHING_JOB',
      entityId: jobId,
      before: job,
      after: cancelled,
    });

    return {
      message: `Publishing job for "${job.contentTitle}" cancelled successfully.`,
      job: cancelled,
    };
  }

  /**
   * List jobs with filters
   */
  async listJobs(agencyId, filters = {}) {
    return await publishingRepository.list(agencyId, filters);
  }

  /**
   * Get single job by ID
   */
  async getJobById(jobId, agencyId) {
    const job = await publishingRepository.findById(jobId, agencyId);
    if (!job) {
      throw new NotFoundError(`Publishing job "${jobId}" not found.`);
    }
    return job;
  }

  /**
   * Calculate summary metrics from list of jobs
   */
  calculatePublishingKPIs(jobsList = []) {
    const total = jobsList.length;
    const queued = jobsList.filter((j) => j.status === 'QUEUED').length;
    const publishing = jobsList.filter((j) => j.status === 'PUBLISHING').length;
    const published = jobsList.filter((j) => j.status === 'PUBLISHED').length;
    const failed = jobsList.filter((j) => j.status === 'FAILED').length;
    const cancelled = jobsList.filter((j) => j.status === 'CANCELLED').length;

    return {
      total,
      queued,
      publishing,
      published,
      failed,
      cancelled,
    };
  }
}

export const publishingService = new PublishingService();
export default publishingService;
