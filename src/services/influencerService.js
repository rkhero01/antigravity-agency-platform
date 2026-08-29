import { initialMockInfluencers } from '../data/mockInfluencers.js';
import { mockClients } from '../data/mockClients.js';

let influencerState = JSON.parse(JSON.stringify(initialMockInfluencers));

export const influencerService = {
  /**
   * Get all creators with filters
   */
  async getInfluencers(filters = {}) {
    const { clientId, platform, stage, niche, search } = filters;

    let filtered = [...influencerState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((inf) => inf.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter(
        (inf) => inf.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    if (stage && stage !== 'all') {
      filtered = filtered.filter(
        (inf) => inf.stage.toLowerCase() === stage.toLowerCase()
      );
    }

    if (niche && niche !== 'all') {
      filtered = filtered.filter((inf) =>
        inf.niche.toLowerCase().includes(niche.toLowerCase())
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (inf) =>
          inf.name.toLowerCase().includes(q) ||
          inf.handle.toLowerCase().includes(q) ||
          inf.clientName.toLowerCase().includes(q) ||
          inf.campaign.toLowerCase().includes(q) ||
          inf.promoCode.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single creator by ID
   */
  async getInfluencerById(id) {
    const inf = influencerState.find((i) => i.id === id);
    return Promise.resolve(inf || null);
  },

  /**
   * Add new creator to roster
   */
  async addInfluencer(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const newInf = {
      id: `inf-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      name: data.name,
      handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}`,
      platform: data.platform || 'Instagram',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      niche: data.niche || 'Lifestyle & Social Media',
      tier: data.tier || 'Micro (35K)',
      followers: data.followers || '35.0K',
      engagementRate: data.engagementRate || '6.2%',
      rate: data.rate || '$650 / Reel',
      campaign: data.campaign || 'Q3 Brand Growth Campaign',
      stage: 'Outreach Sent',
      promoCode: data.promoCode || `${data.name.slice(0, 4).toUpperCase()}15`,
      attributedSales: 'Pending First Drop',
      roi: '5.0x (Target)',
      deliverables: data.deliverables || '1 Sponsored Reel + 2 Stories',
    };

    influencerState = [newInf, ...influencerState];
    return Promise.resolve(newInf);
  },

  /**
   * Update collaboration stage
   */
  async updateStage(id, newStage) {
    influencerState = influencerState.map((inf) =>
      inf.id === id ? { ...inf, stage: newStage } : inf
    );
    const updated = influencerState.find((inf) => inf.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Generate AI Outreach Pitch for creator
   */
  async generatePitch(influencerId, customAngle = '') {
    const inf = influencerState.find((i) => i.id === influencerId);
    if (!inf) return Promise.resolve('');

    const pitch = `Hi ${inf.name}!\n\nWe love your recent content on ${inf.niche}—especially your authentic engagement and community voice! We are reaching out on behalf of ${inf.clientName} regarding our upcoming campaign "${inf.campaign}".\n\nWe would love to partner with you for ${inf.deliverables}. We can offer a dedicated product package, your standard fee of ${inf.rate}, plus an affiliate rev-share with code "${inf.promoCode}".\n\n${customAngle ? `${customAngle}\n\n` : ''}Let us know if you'd be open to reviewing the brief! We'd love to collaborate.\n\nBest,\nPulseAI Creator Partnerships Team`;

    return Promise.resolve(pitch);
  },

  /**
   * Delete creator
   */
  async deleteInfluencer(id) {
    influencerState = influencerState.filter((inf) => inf.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Calculate summary metrics
   */
  calculateInfluencerMetrics(influencerList) {
    const total = influencerList.length;
    const publishedCount = influencerList.filter(
      (i) => i.stage === 'Published & Paid'
    ).length;
    const reviewCount = influencerList.filter(
      (i) => i.stage === 'Content Draft Review'
    ).length;
    const outreachCount = influencerList.filter(
      (i) => i.stage === 'Outreach Sent' || i.stage === 'Contract Signed'
    ).length;

    return {
      total,
      publishedCount,
      reviewCount,
      outreachCount,
      totalSalesGenerated: '$54,200',
      avgRoi: '8.4x Yield',
    };
  },
};

export default influencerService;
