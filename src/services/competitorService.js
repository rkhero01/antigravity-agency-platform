import {
  initialMockCompetitors,
  initialMockCompetitorContent,
  initialMockCompetitorAds,
  initialMockGapAnalyses,
} from '../data/mockCompetitors.js';
import { mockClients } from '../data/mockClients.js';

let competitorsState = JSON.parse(JSON.stringify(initialMockCompetitors));
let contentState = JSON.parse(JSON.stringify(initialMockCompetitorContent));
let adsState = JSON.parse(JSON.stringify(initialMockCompetitorAds));

export const competitorService = {
  /**
   * Get all tracked competitors with filtering
   */
  async getCompetitors(filters = {}) {
    const { clientId, platform, search } = filters;

    let filtered = [...competitorsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter(
        (c) => c.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.strengths.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single competitor by ID
   */
  async getCompetitorById(id) {
    const comp = competitorsState.find((c) => c.id === id);
    return Promise.resolve(comp || null);
  },

  /**
   * Add new competitor brand to track
   */
  async addCompetitor(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const newComp = {
      id: `comp-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      name: data.name,
      handle: data.handle.startsWith('@') ? data.handle : `@${data.handle}`,
      platform: data.platform || 'Instagram',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
      followers: data.followers || '250.0K',
      postingFrequency: data.postingFrequency || '5.0 posts / week',
      engagementRate: data.engagementRate || '4.1%',
      estimatedAdSpend: data.estimatedAdSpend || '$8,500 / mo',
      shareOfVoice: data.shareOfVoice || '25%',
      strengths: data.strengths || 'Active community posting schedule',
      weaknesses: data.weaknesses || 'Slower customer response times',
    };

    competitorsState = [newComp, ...competitorsState];
    return Promise.resolve(newComp);
  },

  /**
   * Delete tracked competitor
   */
  async deleteCompetitor(id) {
    competitorsState = competitorsState.filter((c) => c.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Get viral competitor content radar
   */
  async getContentRadar(clientId = 'all') {
    let filtered = [...contentState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Get active competitor ad creatives
   */
  async getCompetitorAds(clientId = 'all') {
    let filtered = [...adsState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((a) => a.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Get AI Gap & Vulnerability Analysis
   */
  async getGapAnalysis(clientId = 'c1') {
    const analysis = initialMockGapAnalyses[clientId] || initialMockGapAnalyses.c1;
    return Promise.resolve(analysis);
  },

  /**
   * Calculate summary metrics
   */
  calculateCompetitorMetrics(competitorsList) {
    const total = competitorsList.length;
    return {
      total,
      shareOfVoice: '34.2% Market Lead',
      engagementAdvantage: '+2.4% vs Rival Avg',
      viralBreakouts: '12 Posts Tracked',
      gapOpportunities: '4 Actionable Briefs',
    };
  },
};

export default competitorService;
