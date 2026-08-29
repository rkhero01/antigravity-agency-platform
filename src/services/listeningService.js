import { initialMockMentions, initialMockAlerts } from '../data/mockListening.js';
import { mockClients } from '../data/mockClients.js';

let mentionsState = JSON.parse(JSON.stringify(initialMockMentions));
let alertsState = JSON.parse(JSON.stringify(initialMockAlerts));

export const listeningService = {
  /**
   * Get all mentions with filtering
   */
  async getMentions(filters = {}) {
    const { clientId, platform, sentiment, search } = filters;

    let filtered = [...mentionsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((m) => m.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter(
        (m) => m.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    if (sentiment && sentiment !== 'all') {
      filtered = filtered.filter(
        (m) => m.sentiment.toLowerCase() === sentiment.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.text.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q) ||
          m.topic.toLowerCase().includes(q) ||
          m.clientName.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get PR Crisis Alerts
   */
  async getAlerts(clientId = 'all') {
    let filtered = [...alertsState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((a) => a.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId) {
    alertsState = alertsState.map((a) =>
      a.id === alertId ? { ...a, status: 'Resolved' } : a
    );
    return Promise.resolve(true);
  },

  /**
   * Add Tracked Keyword / Mention
   */
  async addMention(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const newMention = {
      id: `men-${Date.now()}`,
      author: data.author || '@IndustryObserver',
      platform: data.platform || 'Twitter',
      platformIcon: data.platform || 'Twitter',
      sourceUrl: 'https://twitter.com/IndustryObserver/status/live',
      clientId: client.id,
      clientName: client.name,
      text: data.text,
      sentiment: data.sentiment || 'Positive',
      sentimentScore: data.sentimentScore || 90,
      reach: data.reach || '25K Impressions',
      timestamp: 'Just now',
      topic: data.topic || 'Brand Chatter',
    };

    mentionsState = [newMention, ...mentionsState];
    return Promise.resolve(newMention);
  },

  /**
   * AI Crisis Mitigation Response Generator
   */
  async generateAICrisisResponse(alert) {
    const title = alert ? alert.title : 'Brand Feedback Escalation';
    const client = alert ? alert.clientName : 'Our Brand';

    return Promise.resolve({
      crisisTopic: title,
      publicStatement: `At ${client}, we hold our customer experience and product standards to the highest degree. We are actively addressing recent feedback regarding "${title}" and have implemented immediate operational measures to ensure excellence.`,
      socialReplyMacro: `Hi there! Thank you so much for bringing this to our attention. Our leadership team is already implementing immediate improvements to address this. Please DM us so we can take care of you directly!`,
      internalEscalationSteps: [
        '1. Notify Account Director & Client Operations Lead within 30 minutes.',
        '2. Deploy social response macro across flagged Reddit & X threads.',
        '3. Monitor sentiment velocity in Social Listening Dashboard for 48 hours.',
      ],
    });
  },

  /**
   * Calculate listening summary metrics
   */
  calculateListeningMetrics(mentionsList) {
    const total = mentionsList.length;
    const positiveCount = mentionsList.filter((m) => m.sentiment === 'Positive').length;
    const rate = total > 0 ? Math.round((positiveCount / total) * 100) : 84;

    return {
      totalMentions: '18,420 Mentions',
      positiveSentiment: `${rate}% Positive`,
      npsScore: '+68 Net Promoter',
      activeAlerts: '0 Critical / 2 Monitored',
      mediaReach: '4.2M Audience Reach',
    };
  },
};

export default listeningService;
