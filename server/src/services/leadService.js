/**
 * Lead Service
 * Task 7: Business Logic & KPI Aggregations for CRM Leads
 */

import { leadRepository } from '../repositories/leadRepository.js';
import { auditService, AUDIT_ACTIONS } from './auditService.js';
import { NotFoundError } from '../utils/errors.js';

export class LeadService {
  async listLeads(agencyId, filters = {}) {
    return await leadRepository.list(agencyId, filters);
  }

  async getLead(id, agencyId) {
    const lead = await leadRepository.findById(id, agencyId);
    if (!lead) {
      throw new NotFoundError(`Lead "${id}" not found.`);
    }
    return lead;
  }

  async createLead(data, agencyId, user) {
    const created = await leadRepository.create(data, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: created.clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'LEAD',
      entityId: created.id,
      after: created,
    });

    return created;
  }

  async updateLead(id, updates, agencyId, user) {
    const existing = await this.getLead(id, agencyId);
    const updated = await leadRepository.update(id, updates, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'LEAD',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async archiveLead(id, agencyId, user) {
    const existing = await this.getLead(id, agencyId);
    const archived = await leadRepository.archive(id, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'LEAD',
      entityId: id,
      before: existing,
      after: archived,
    });

    return {
      message: `Lead "${existing.name}" archived successfully.`,
      lead: archived,
    };
  }

  calculateLeadKPIs(leadsList = []) {
    const total = leadsList.length;
    const newLeads = leadsList.filter((l) => (l.stage || '').toUpperCase() === 'NEW').length;
    const contacted = leadsList.filter((l) => (l.stage || '').toUpperCase() === 'CONTACTED').length;
    const qualified = leadsList.filter((l) => (l.stage || '').toUpperCase() === 'QUALIFIED').length;
    const proposalSent = leadsList.filter((l) => (l.stage || '').toUpperCase() === 'PROPOSAL_SENT').length;
    const won = leadsList.filter((l) => (l.stage || '').toUpperCase() === 'WON');
    const wonCount = won.length;
    const lost = leadsList.filter((l) => (l.stage || '').toUpperCase() === 'LOST').length;

    const wonRevenue = won.reduce((acc, l) => acc + (Number(l.value) || 0), 0);
    const pipelineValue = leadsList
      .filter((l) => {
        const s = (l.stage || '').toUpperCase();
        return s !== 'WON' && s !== 'LOST';
      })
      .reduce((acc, l) => acc + (Number(l.value) || 0), 0);

    const conversionRate = total > 0 ? Number(((wonCount / total) * 100).toFixed(1)) : 0;

    // Source breakdown
    const sourceBreakdown = {};
    for (const l of leadsList) {
      const src = l.source || 'DIRECT';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    }

    return {
      total,
      newLeads,
      contacted,
      qualified,
      proposalSent,
      won: wonCount,
      lost,
      pipelineValue,
      wonRevenue,
      conversionRate: `${conversionRate}%`,
      sourceBreakdown,
    };
  }
}

export const leadService = new LeadService();
export default leadService;
