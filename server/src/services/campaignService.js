/**
 * Campaign Service
 * Task 6: Business Rules for Paid Media Campaigns & Audit Logging
 */

import { campaignRepository } from '../repositories/campaignRepository.js';
import { auditService, AUDIT_ACTIONS } from './auditService.js';
import { NotFoundError } from '../utils/errors.js';

export class CampaignService {
  async listCampaigns(agencyId, filters = {}) {
    return await campaignRepository.list(agencyId, filters);
  }

  async getCampaign(id, agencyId) {
    const campaign = await campaignRepository.findById(id, agencyId);
    if (!campaign) {
      throw new NotFoundError(`Campaign "${id}" not found.`);
    }
    return campaign;
  }

  async createCampaign(data, agencyId, user) {
    const created = await campaignRepository.create(data, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: created.clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'CAMPAIGN',
      entityId: created.id,
      after: created,
    });

    return created;
  }

  async updateCampaign(id, updates, agencyId, user) {
    const existing = await this.getCampaign(id, agencyId);
    const updated = await campaignRepository.update(id, updates, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'CAMPAIGN',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async archiveCampaign(id, agencyId, user) {
    const existing = await this.getCampaign(id, agencyId);
    const archived = await campaignRepository.archive(id, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'CAMPAIGN',
      entityId: id,
      before: existing,
      after: archived,
    });

    return {
      message: `Campaign "${existing.name}" archived successfully.`,
      campaign: archived,
    };
  }

  calculateCampaignKPIs(campaignsList = []) {
    const total = campaignsList.length;
    const active = campaignsList.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length;
    const totalSpend = campaignsList.reduce((acc, c) => acc + (Number(c.totalSpend) || 0), 0);
    const totalRevenue = campaignsList.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
    const totalConversions = campaignsList.reduce((acc, c) => acc + (Number(c.conversions) || 0), 0);
    const totalDailyBudget = campaignsList.reduce((acc, c) => acc + (Number(c.dailyBudget) || 0), 0);

    const roas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;

    return {
      total,
      active,
      totalSpend,
      totalRevenue,
      totalConversions,
      totalDailyBudget,
      roas,
    };
  }
}

export const campaignService = new CampaignService();
export default campaignService;
