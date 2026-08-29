import { initialMockEmailCampaigns, initialMockAutomations } from '../data/mockEmailMarketing.js';
import { mockClients } from '../data/mockClients.js';

let campaignsState = JSON.parse(JSON.stringify(initialMockEmailCampaigns));
let automationsState = JSON.parse(JSON.stringify(initialMockAutomations));

export const emailMarketingService = {
  /**
   * Get all campaigns with filtering
   */
  async getCampaigns(filters = {}) {
    const { clientId, type, status, search } = filters;

    let filtered = [...campaignsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((c) =>
        type === 'Email' ? c.type.includes('Email') : c.type.includes('SMS')
      );
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
          c.subject.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.segment.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get all automated lifecycle flows
   */
  async getAutomations(clientId = 'all') {
    let filtered = [...automationsState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((a) => a.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Toggle flow status (Active <-> Paused)
   */
  async toggleAutomationStatus(id) {
    automationsState = automationsState.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: a.status === 'Active' ? 'Paused' : 'Active',
        };
      }
      return a;
    });
    return Promise.resolve(true);
  },

  /**
   * Create new Email Broadcast or SMS Blast
   */
  async createCampaign(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const newCamp = {
      id: `em-${Date.now()}`,
      title: data.title,
      type: data.type || 'Email Broadcast',
      clientId: client.id,
      clientName: client.name,
      status: data.status || 'Draft',
      subject: data.subject || `${client.name} Exclusive Announcement`,
      previewText: data.previewText || 'Open to discover this week\'s exclusive brand update.',
      sendDate: data.sendDate || 'Scheduled for Next Tuesday at 09:00 AM',
      segment: data.segment || 'All Active Subscribers (12,500 contacts)',
      recipients: parseInt(data.recipients || '12500', 10),
      openRate: 0,
      clickRate: 0,
      revenue: '$0 (Draft)',
      bodySnippet: data.bodySnippet || 'Thank you for being a valued subscriber. Discover our latest collection and special perks inside.',
    };

    campaignsState = [newCamp, ...campaignsState];
    return Promise.resolve(newCamp);
  },

  /**
   * Delete campaign
   */
  async deleteCampaign(id) {
    campaignsState = campaignsState.filter((c) => c.id !== id);
    return Promise.resolve(true);
  },

  /**
   * AI Email & SMS Copy Synthesizer
   */
  async generateAIEmailCopy(promptData) {
    const client = mockClients.find((c) => c.id === promptData.clientId) || mockClients[0];
    const objective = promptData.objective || 'Flash Sale Promotion';

    return Promise.resolve({
      subjectLineOptions: [
        `🔥 Exclusive 48-Hour VIP Access: ${client.name} ${objective}`,
        `Don't miss out: Fresh releases & member-only perks inside 👀`,
        `Your personal invitation from ${client.name} ✨`,
      ],
      previewTextOptions: [
        'Claim your exclusive 20% discount before public release.',
        'Limited-quantity restock available for the next 48 hours.',
      ],
      smsMessageCopy: `${client.name} VIP: Our ${objective} is now live! Use code VIP20 at checkout for early access: ${client.name.toLowerCase().replace(/\s+/g, '')}.com/vip Reply STOP to opt out.`,
      spamScore: '0.2 / 10 (Very Low Spam Risk - Excellent Inbox Delivery)',
    });
  },

  /**
   * Calculate summary KPI metrics
   */
  calculateEmailMetrics(campaignsList) {
    return {
      subscribers: '142,500 Contacts',
      avgOpenRate: '42.8% Open Rate',
      avgCtr: '6.4% CTR',
      attributedRevenue: '$348,200 Revenue',
      unsubscribeRate: '0.12% Low Churn',
    };
  },
};

export default emailMarketingService;
