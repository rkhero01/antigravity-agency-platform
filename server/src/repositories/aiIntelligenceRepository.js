/**
 * AI Intelligence Entities Repository (Insights, Recommendations, Anomalies)
 * Task 28 — Step 2: AI Read API Foundation
 */

import { BaseRepository } from './baseRepository.js';

export class AIIntelligenceRepository {
  constructor() {
    this.insightsRepo = new BaseRepository('AIInsight');
    this.recommendationsRepo = new BaseRepository('AIRecommendation');
    this.anomaliesRepo = new BaseRepository('AIAnomaly');
    this.seedDefaultIntelligence();
  }

  seedDefaultIntelligence() {
    const demoAgencyId = 'agency-demo-001';

    const insights = [
      {
        id: 'ins-1',
        agencyId: demoAgencyId,
        clientId: 'c1',
        title: 'Meta Lookalike ROAS Outperforming Search by +42%',
        category: 'Media Efficiency',
        impact: '+₹240,000 monthly projected revenue',
        confidence: 0.96,
        status: 'ACTIVE',
      },
      {
        id: 'ins-2',
        agencyId: demoAgencyId,
        clientId: 'c2',
        title: 'WhatsApp Automation Reply Rate Peaked at 78.4%',
        category: 'Customer Engagement',
        impact: 'SLA dropped to 42 seconds',
        confidence: 0.94,
        status: 'ACTIVE',
      },
    ];

    const recommendations = [
      {
        id: 'rec-1',
        agencyId: demoAgencyId,
        clientId: 'c1',
        title: 'Scale Daily Budget by +25% on Meta High-ROAS Sets',
        priority: 'P0',
        actionType: 'SCALE_CAMPAIGN_BUDGET',
        expectedGain: '+₹380,000 revenue',
        status: 'ACTIVE',
      },
      {
        id: 'rec-2',
        agencyId: demoAgencyId,
        clientId: 'c2',
        title: 'Activate Automated Inventory Re-order Broadcast Flow',
        priority: 'P1',
        actionType: 'ACTIVATE_AUTOMATION',
        expectedGain: '+18% repurchase rate',
        status: 'ACTIVE',
      },
    ];

    const anomalies = [
      {
        id: 'anom-1',
        agencyId: demoAgencyId,
        clientId: 'c1',
        metric: 'CPL Surge on Weekend Google Search',
        variance: '+34.5% above baseline',
        severity: 'MEDIUM',
        status: 'ACTIVE',
      },
    ];

    for (const ins of insights) this.insightsRepo.inMemoryStore.set(ins.id, { ...ins, createdAt: new Date() });
    for (const rec of recommendations) this.recommendationsRepo.inMemoryStore.set(rec.id, { ...rec, createdAt: new Date() });
    for (const anom of anomalies) this.anomaliesRepo.inMemoryStore.set(anom.id, { ...anom, createdAt: new Date() });
  }

  async getInsights(filters = {}, agencyId = null) {
    return this.insightsRepo.findMany(filters, agencyId);
  }

  async getRecommendations(filters = {}, agencyId = null) {
    return this.recommendationsRepo.findMany(filters, agencyId);
  }

  async getAnomalies(filters = {}, agencyId = null) {
    return this.anomaliesRepo.findMany(filters, agencyId);
  }
}

export const aiIntelligenceRepository = new AIIntelligenceRepository();
export default aiIntelligenceRepository;
