import { initialMockConversations } from '../data/mockInbox.js';

let inboxState = JSON.parse(JSON.stringify(initialMockConversations));

export const inboxService = {
  /**
   * Get all conversations with filters
   */
  async getConversations(filters = {}) {
    const { clientId, platform, sentiment, status, search } = filters;

    let filtered = [...inboxState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter(
        (c) => c.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    if (sentiment && sentiment !== 'all') {
      filtered = filtered.filter(
        (c) => c.sentiment.toLowerCase() === sentiment.toLowerCase()
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
          c.customer.name.toLowerCase().includes(q) ||
          c.customer.handle.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single conversation
   */
  async getConversationById(id) {
    const conv = inboxState.find((c) => c.id === id);
    return Promise.resolve(conv || null);
  },

  /**
   * Send response message to thread
   */
  async sendReply(convId, text) {
    inboxState = inboxState.map((conv) => {
      if (conv.id === convId) {
        const newMsg = {
          id: `m-${Date.now()}`,
          sender: 'agency',
          text,
          timestamp: 'Just now (Sent)',
        };
        return {
          ...conv,
          unread: false,
          status: 'Resolved',
          lastMessage: text,
          lastMessageTime: 'Just now',
          messages: [...conv.messages, newMsg],
        };
      }
      return conv;
    });

    const updated = inboxState.find((c) => c.id === convId);
    return Promise.resolve(updated);
  },

  /**
   * Generate AI response draft
   */
  async generateAIReply(convId, tone = 'Helpful & Professional') {
    const conv = inboxState.find((c) => c.id === convId);
    if (!conv) return Promise.resolve('');

    const draft = `Hello ${conv.customer.name}! Thank you for reaching out to ${conv.clientName}. We appreciate your inquiry and are committed to delivering the best experience. Please let us know if you need further details or assistance!`;
    return Promise.resolve(draft);
  },

  /**
   * Update conversation status
   */
  async updateStatus(convId, newStatus) {
    inboxState = inboxState.map((c) => (c.id === convId ? { ...c, status: newStatus } : c));
    const updated = inboxState.find((c) => c.id === convId);
    return Promise.resolve(updated);
  },

  /**
   * Assign staff member
   */
  async assignStaff(convId, staffName) {
    inboxState = inboxState.map((c) => (c.id === convId ? { ...c, assignedTo: staffName } : c));
    const updated = inboxState.find((c) => c.id === convId);
    return Promise.resolve(updated);
  },

  /**
   * Compute inbox health and response metrics
   */
  calculateInboxMetrics(conversations) {
    const total = conversations.length;
    const openCount = conversations.filter((c) => c.status === 'Open').length;
    const urgentCount = conversations.filter(
      (c) => c.priority === 'Urgent' || c.sentiment === 'Urgent Issue'
    ).length;
    const leadsCount = conversations.filter(
      (c) => c.sentiment === 'Lead Opportunity'
    ).length;
    const resolvedCount = conversations.filter(
      (c) => c.status === 'Resolved'
    ).length;

    return {
      total,
      openCount,
      urgentCount,
      leadsCount,
      resolvedCount,
      avgResponseTime: '4.2 Mins',
    };
  },
};

export default inboxService;
