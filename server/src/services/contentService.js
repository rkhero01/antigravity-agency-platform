/**
 * Content & Publishing Service
 * Task 8: Business Logic, RBAC & Editorial Pipeline Orchestration
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

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: created.clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'CONTENT_ITEM',
      entityId: created.id,
      after: created,
    });

    return created;
  }

  async updateContent(id, updates, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);
    const updated = await contentRepository.update(id, updates, agencyId);

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
    const updated = await contentRepository.approve(id, user.name || 'Approved', agencyId);

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

  async rejectContent(id, reason, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);
    const updated = await contentRepository.reject(id, reason, agencyId);

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

  async archiveContent(id, agencyId, user) {
    const existing = await this.getContentById(id, agencyId);
    const archived = await contentRepository.archive(id, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'CONTENT_ITEM',
      entityId: id,
      before: existing,
      after: archived,
    });

    return {
      message: `Content item "${existing.title}" archived successfully.`,
      content: archived,
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
