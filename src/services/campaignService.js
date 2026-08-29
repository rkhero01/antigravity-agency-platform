import { initialMockCampaigns } from '../data/mockCampaigns.js';
import { mockClients } from '../data/mockClients.js';

let campaignsState = JSON.parse(JSON.stringify(initialMockCampaigns));

export const campaignService = {
  /**
   * Get all campaigns with filtering
   */
  async getCampaigns(filters = {}) {
    const { clientId, status, search } = filters;

    let filtered = [...campaignsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(
        (c) => c.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.primaryGoal.toLowerCase().includes(q) ||
          c.audiencePersona.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single campaign by ID
   */
  async getCampaignById(id) {
    const camp = campaignsState.find((c) => c.id === id);
    return Promise.resolve(camp || null);
  },

  /**
   * Create new campaign brief
   */
  async createCampaign(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const newCamp = {
      id: `cmp-${Date.now()}`,
      title: data.title,
      clientId: client.id,
      clientName: client.name,
      status: data.status || 'Strategy & Concept',
      budget: data.budget ? (data.budget.startsWith('$') ? data.budget : `$${data.budget}`) : '$25,000',
      targetRevenue: data.targetRevenue ? (data.targetRevenue.startsWith('$') ? data.targetRevenue : `$${data.targetRevenue}`) : '$125,000',
      projectedRoas: data.projectedRoas || '5.0x',
      startDate: data.startDate || 'Oct 01, 2026',
      endDate: data.endDate || 'Nov 15, 2026',
      primaryGoal: data.primaryGoal || 'Omnichannel Conversion & Brand Elevation',
      audiencePersona: data.audiencePersona || 'Target customer demographic (25-45)',
      valueProposition: data.valueProposition || 'Compelling brand value hook and core message.',
      channelSplit: [
        { channel: 'Meta Ads', percentage: 40, color: '#ec4899' },
        { channel: 'TikTok Ads', percentage: 30, color: '#06b6d4' },
        { channel: 'Influencers', percentage: 20, color: '#a855f7' },
        { channel: 'Email Retargeting', percentage: 10, color: '#10b981' },
      ],
      moodboard: {
        palette: ['#0f172a', '#6366f1', '#06b6d4', '#10b981'],
        images: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80',
        ],
        aesthetic: data.aesthetic || 'Premium dark aesthetic with high contrast accents',
      },
      deliverables: {
        total: 10,
        completed: 1,
        percentage: 10,
      },
    };

    campaignsState = [newCamp, ...campaignsState];
    return Promise.resolve(newCamp);
  },

  /**
   * Update campaign lifecycle status
   */
  async updateCampaignStatus(id, newStatus) {
    const idx = campaignsState.findIndex((c) => c.id === id);
    if (idx !== -1) {
      campaignsState[idx].status = newStatus;
      return Promise.resolve(campaignsState[idx]);
    }
    return Promise.resolve(null);
  },

  /**
   * Delete campaign
   */
  async deleteCampaign(id) {
    campaignsState = campaignsState.filter((c) => c.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Generate AI Campaign Launch Roadmap
   */
  async generateAICampaignRoadmap(clientId, themePrompt = 'Q4 Holiday Blitz') {
    const client = mockClients.find((c) => c.id === clientId) || mockClients[0];
    return Promise.resolve({
      roadmapTitle: `${client.name} — 30-Day Multi-Channel Growth Roadmap`,
      weeks: [
        {
          week: 'Week 1: Teaser & VIP List Building',
          focus: 'Build anticipation with behind-the-scenes reels and early access opt-in landing page.',
          deliverables: '3 Instagram Reels, 1 Meta Lead Ad, 1 VIP Announcement Email',
        },
        {
          week: 'Week 2: Official Launch & Influencer Wave',
          focus: 'Synchronized multi-creator unboxing and high-intent paid conversion campaigns.',
          deliverables: '6 TikTok Spark Ads, 5 Creator Posts, 1 Press Release',
        },
        {
          week: 'Week 3: Social Proof & Objection Crusher',
          focus: 'Showcase early customer reviews, comparison graphs, and dermatologist/trainer testimonials.',
          deliverables: '4 Carousel Ads, 2 UGC Testimonial Videos, 1 Mid-Campaign Flash Offer',
        },
        {
          week: 'Week 4: Scarcity & Final Push',
          focus: 'Last-chance countdown messaging and cart recovery blitz.',
          deliverables: '2 Urgency Reels, 1 VIP Final Notice SMS/Email, Post-Mortem Analytics Audit',
        },
      ],
    });
  },

  /**
   * Calculate summary KPI metrics
   */
  calculateCampaignMetrics(campaignsList) {
    const active = campaignsList.filter((c) => c.status !== 'Completed').length;
    return {
      activeCount: `${active} Campaigns`,
      totalBudget: '$145,000 Budget',
      targetRevenue: '$890,000 Pipeline',
      projectedRoas: '5.8x Projected ROAS',
      deliverablesPacing: '94.2% On Track',
    };
  },
};

export default campaignService;
