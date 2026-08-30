/**
 * Content & Publishing Service
 * Task 8 & 18: Business Logic, Content Command Center, Editorial Pipeline & RBAC
 */

import { contentRepository } from '../repositories/contentRepository.js';
import { auditService, AUDIT_ACTIONS } from './auditService.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class ContentService {
  async listContent(agencyId, filters = {}) {
    return await contentRepository.list(agencyId, filters);
  }

  async getContentById(id, agencyId) {
    const item = await contentRepository.findById(id, agencyId);
    if (!item) {
      throw new NotFoundError(`Content item "${id}" not found.`);
    }
    return item;
  }

  async createContent(data, agencyId, user) {
    const created = await contentRepository.create(data, agencyId);

    const isIdea = Boolean(data.contentIdea && (data.contentIdea.topic || data.contentIdea.title));
    const auditAction = isIdea ? 'CONTENT_IDEA_CREATED' : AUDIT_ACTIONS.CREATE;

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: created.clientId,
      action: auditAction,
      entityType: 'CONTENT_ITEM',
      entityId: created.id,
      after: created,
    });

    return created;
  }

  async updateContent(id, updates, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);
    const updated = await contentRepository.update(id, updates, agencyId);

    let auditAction = AUDIT_ACTIONS.UPDATE;
    if (updates.contentIdea !== undefined) {
      auditAction = 'CONTENT_IDEA_UPDATED';
    } else if (updates.contentBrief !== undefined) {
      auditAction = 'CONTENT_BRIEF_UPDATED';
    } else if (updates.seo !== undefined) {
      auditAction = 'CONTENT_SEO_UPDATED';
    }

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: auditAction,
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async saveBrief(id, briefData, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);

    const hadPriorBrief = Boolean(existing.contentBrief && Object.keys(existing.contentBrief).length > 0);
    const auditAction = hadPriorBrief ? 'CONTENT_BRIEF_UPDATED' : 'CONTENT_BRIEF_CREATED';

    // Auto-advance editorial status to BRIEF_READY if still in IDEA/RESEARCHING
    const existingIdea = existing.contentIdea || {};
    const updates = { contentBrief: briefData };
    if (!existingIdea.status || existingIdea.status === 'IDEA' || existingIdea.status === 'RESEARCHING') {
      updates.contentIdea = {
        ...existingIdea,
        status: 'BRIEF_READY',
      };
    }

    const updated = await contentRepository.update(id, updates, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: auditAction,
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async saveSeoMetadata(id, seoData, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);
    const updated = await contentRepository.update(id, { seo: seoData }, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'CONTENT_SEO_UPDATED',
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async submitForReview(id, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);

    const existingIdea = existing.contentIdea || {};
    const updates = {
      status: 'PENDING_APPROVAL',
      contentIdea: {
        ...existingIdea,
        status: 'READY_FOR_REVIEW',
      },
    };

    const updated = await contentRepository.update(id, updates, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'CONTENT_SUBMITTED_FOR_REVIEW',
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async scheduleContent(id, scheduledAt, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);
    const updated = await contentRepository.schedule(id, scheduledAt, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async approveContent(id, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);

    // Idempotent check
    if (existing.status === 'APPROVED' && existing.contentIdea?.status === 'APPROVED') {
      return existing;
    }

    const existingIdea = existing.contentIdea || {};
    const approverName = user.name || user.email || 'Approved';

    const updated = await contentRepository.update(
      id,
      {
        status: 'APPROVED',
        approvedBy: approverName,
        rejectionReason: null,
        contentIdea: {
          ...existingIdea,
          status: 'APPROVED',
        },
      },
      agencyId
    );

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'CONTENT_APPROVED',
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async rejectContent(id, reason, agencyId, user) {
    if (!reason || typeof reason !== 'string' || reason.trim().length < 2) {
      throw new ValidationError('A descriptive rejection reason is required (min 2 characters).');
    }

    const existing = await this.getContentById(id, agencyId);
    const existingIdea = existing.contentIdea || {};

    const updated = await contentRepository.update(
      id,
      {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
        contentIdea: {
          ...existingIdea,
          status: 'REJECTED',
        },
      },
      agencyId
    );

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'CONTENT_REJECTED',
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async archiveContent(id, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);

    const existingIdea = existing.contentIdea || {};
    const updated = await contentRepository.update(
      id,
      {
        status: 'ARCHIVED',
        deletedAt: new Date(),
        contentIdea: {
          ...existingIdea,
          status: 'ARCHIVED',
        },
      },
      agencyId
    );

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'CONTENT_ARCHIVED',
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: updated,
    });

    return {
      message: `Content item "${existing.title}" archived successfully.`,
      content: updated,
    };
  }

  async getCalendar(agencyId, filters = {}) {
    return await contentRepository.getCalendar(agencyId, filters);
  }

  calculateContentKPIs(contentList = []) {
    const total = contentList.length;
    const draft = contentList.filter((p) => (p.status || '').toUpperCase() === 'DRAFT').length;
    const inReview = contentList.filter(
      (p) => (p.status || '').toUpperCase() === 'PENDING_APPROVAL' || (p.status || '').toUpperCase() === 'IN REVIEW'
    ).length;
    const approved = contentList.filter((p) => (p.status || '').toUpperCase() === 'APPROVED').length;
    const scheduled = contentList.filter((p) => (p.status || '').toUpperCase() === 'SCHEDULED').length;
    const published = contentList.filter((p) => (p.status || '').toUpperCase() === 'PUBLISHED').length;
    const rejected = contentList.filter((p) => (p.status || '').toUpperCase() === 'REJECTED').length;

    const upcomingScheduled = contentList
      .filter((p) => (p.status || '').toUpperCase() === 'SCHEDULED' && p.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 5);

    return {
      total,
      draft,
      inReview,
      approved,
      scheduled,
      published,
      rejected,
      upcomingScheduled,
    };
  }
}

export const contentService = new ContentService();
export default contentService;

