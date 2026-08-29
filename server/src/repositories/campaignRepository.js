/**
 * Campaign Repository with Performance Metrics
 * Task 28 — Step 2: Paid Media Campaigns Data Access Layer
 */

import { BaseRepository } from './baseRepository.js';
import { metricsUtils } from '../utils/metrics.js';

export class CampaignRepository extends BaseRepository {
  constructor() {
    super('Campaign');
    this.seedDefaultCampaigns();
  }

  seedDefaultCampaigns() {
    const demoAgencyId = 'agency-demo-001';
    const campaigns = [
      {
        id: 'camp-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        platform: 'META',
        name: 'Apex New Year Fitness Surge',
        status: 'ACTIVE',
        objective: 'LEAD_GENERATION',
        dailyBudget: 2500,
        totalSpend: 75000,
        impressions: 142000,
        clicks: 4820,
        conversions: 342,
        revenue: 890000,
      },
      {
        id: 'camp-102',
        agencyId: demoAgencyId,
        clientId: 'c1',
        platform: 'GOOGLE',
        name: 'Apex High-Intent Gym Search',
        status: 'ACTIVE',
        objective: 'CONVERSIONS',
        dailyBudget: 1800,
        totalSpend: 54000,
        impressions: 68000,
        clicks: 2950,
        conversions: 215,
        revenue: 560000,
      },
      {
        id: 'camp-201',
        agencyId: demoAgencyId,
        clientId: 'c2',
        platform: 'META',
        name: 'Verde Organic Snacks Retargeting',
        status: 'ACTIVE',
        objective: 'CATALOG_SALES',
        dailyBudget: 3200,
        totalSpend: 96000,
        impressions: 210000,
        clicks: 7400,
        conversions: 620,
        revenue: 1240000,
      },
      {
        id: 'camp-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        platform: 'GOOGLE',
        name: 'Isolated FinTech Campaign',
        status: 'ACTIVE',
        objective: 'ACQUISITION',
        dailyBudget: 5000,
        totalSpend: 150000,
        impressions: 300000,
        clicks: 12000,
        conversions: 850,
        revenue: 2500000,
      },
    ];

    for (const c of campaigns) {
      // Calculate derived performance metrics safely
      const ctr = metricsUtils.calculateCTR(c.clicks, c.impressions);
      const cpc = metricsUtils.calculateCPC(c.totalSpend, c.clicks);
      const cpa = metricsUtils.calculateCPA(c.totalSpend, c.conversions);
      const roas = metricsUtils.calculateROAS(c.revenue, c.totalSpend);

      this.inMemoryStore.set(c.id, {
        ...c,
        metrics: { ctr, cpc, cpa, roas },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  async findByClientId(clientId, agencyId = null) {
    return this.findMany({ clientId }, agencyId);
  }
}

export const campaignRepository = new CampaignRepository();
export default campaignRepository;
