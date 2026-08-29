import {
  initialMockWhatsAppConversations,
  initialMockWhatsAppCampaigns,
  initialMockWhatsAppTemplates,
  initialMockWhatsAppAutomationFlows,
  initialMockWhatsAppFollowUps,
  initialMockWhatsAppAnalytics,
  initialMockWhatsAppTeamMembers,
  initialMockWhatsAppTags,
  initialMockWhatsAppClients,
} from '../data/mockWhatsApp.js';
import { crmService } from './crmService.js';

// In-memory mutable states initialized with clones
let conversationsState = JSON.parse(JSON.stringify(initialMockWhatsAppConversations));
let campaignsState = JSON.parse(JSON.stringify(initialMockWhatsAppCampaigns));
let templatesState = JSON.parse(JSON.stringify(initialMockWhatsAppTemplates));
let automationFlowsState = JSON.parse(JSON.stringify(initialMockWhatsAppAutomationFlows));
let followUpsState = JSON.parse(JSON.stringify(initialMockWhatsAppFollowUps));
let teamMembersState = JSON.parse(JSON.stringify(initialMockWhatsAppTeamMembers));
let tagsState = JSON.parse(JSON.stringify(initialMockWhatsAppTags));
let clientsState = JSON.parse(JSON.stringify(initialMockWhatsAppClients));
let analyticsState = JSON.parse(JSON.stringify(initialMockWhatsAppAnalytics));

// Helper: safe percentage calculator
const safePercentage = (num, denom, decimals = 1) => {
  if (!denom || denom === 0) return '0.0%';
  const val = (num / denom) * 100;
  return `${val.toFixed(decimals)}%`;
};

// Helper: safe ROAS calculator
const safeRoas = (revenue, spend, decimals = 1) => {
  if (!spend || spend === 0) return 'N/A';
  const val = revenue / spend;
  return `${val.toFixed(decimals)}x`;
};

export const whatsappService = {
  // --------------------------------------------------------------------------
  // 1. OVERVIEW & ANALYTICS
  // --------------------------------------------------------------------------
  /**
   * Get WhatsApp performance overview and analytics
   */
  async getWhatsAppOverview(filters = {}) {
    const { clientId = 'all' } = filters;

    let targetConvs = [...conversationsState];
    let targetCamps = [...campaignsState];

    if (clientId && clientId !== 'all') {
      targetConvs = targetConvs.filter((c) => c.clientId === clientId);
      targetCamps = targetCamps.filter((c) => c.clientId === clientId);
    }

    const openCount = targetConvs.filter((c) => c.status === 'Open' || c.status === 'Pending').length;
    const resolvedCount = targetConvs.filter((c) => c.status === 'Resolved').length;
    const wonConvs = targetConvs.filter((c) => c.leadStage === 'Won');
    const totalWonRevenue = wonConvs.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const campaignRevenue = targetCamps.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const totalRecipients = targetCamps.reduce((acc, c) => acc + (c.recipients || 0), 0);
    const totalDelivered = targetCamps.reduce((acc, c) => acc + (c.delivered || 0), 0);
    const totalRead = targetCamps.reduce((acc, c) => acc + (c.read || 0), 0);
    const totalReplied = targetCamps.reduce((acc, c) => acc + (c.replied || 0), 0);
    const totalConversions = targetCamps.reduce((acc, c) => acc + (c.conversions || 0), 0);

    const clientBreakdown = clientsState.map((cl) => {
      const clConvs = conversationsState.filter((c) => c.clientId === cl.id);
      const clWonRev = clConvs
        .filter((c) => c.leadStage === 'Won')
        .reduce((acc, c) => acc + (c.revenue || 0), 0);

      return {
        clientId: cl.id,
        clientName: cl.name,
        industry: cl.industry,
        conversations: clConvs.length,
        open: clConvs.filter((c) => c.status === 'Open').length,
        revenue: clWonRev,
      };
    });

    const campaignPerformanceSummary = {
      totalCampaigns: targetCamps.length,
      activeCampaigns: targetCamps.filter((c) => c.status === 'Running').length,
      totalRecipients,
      totalDelivered,
      totalRead,
      totalReplied,
      totalConversions,
      totalRevenue: campaignRevenue,
      averageDeliveryRate: safePercentage(totalDelivered, totalRecipients),
      averageReadRate: safePercentage(totalRead, totalDelivered),
      averageReplyRate: safePercentage(totalReplied, totalDelivered),
      averageConversionRate: safePercentage(totalConversions, totalReplied),
    };

    const teamPerformanceSummary = await this.getTeamPerformance(clientId);

    return Promise.resolve({
      activeConversations: openCount || analyticsState.activeConversations,
      activeConversationsMoM: analyticsState.activeConversationsMoM,
      resolvedConversations: resolvedCount,
      messagesSent: analyticsState.messagesSent,
      messagesSentMoM: analyticsState.messagesSentMoM,
      messagesReceived: analyticsState.messagesReceived,
      messagesReceivedMoM: analyticsState.messagesReceivedMoM,
      replyRate: analyticsState.replyRate,
      replyRateMoM: analyticsState.replyRateMoM,
      deliveryRate: analyticsState.deliveryRate,
      deliveryRateMoM: analyticsState.deliveryRateMoM,
      readRate: analyticsState.readRate,
      readRateMoM: analyticsState.readRateMoM,
      leadsGenerated: targetConvs.length,
      leadsGeneratedMoM: analyticsState.leadsGeneratedMoM,
      conversions: wonConvs.length + totalConversions,
      conversionsMoM: analyticsState.conversionsMoM,
      revenueAttributed: totalWonRevenue + campaignRevenue || analyticsState.revenueAttributed,
      revenueAttributedMoM: analyticsState.revenueAttributedMoM,
      pendingFollowUps: targetConvs.filter((c) => c.tags?.includes('Follow-up')).length || analyticsState.pendingFollowUps,
      aiAssistedReplies: analyticsState.aiAssistedReplies,
      averageResponseTime: analyticsState.averageResponseTime,
      averageResponseTimeMoM: analyticsState.averageResponseTimeMoM,
      channelBreakdown: analyticsState.channelBreakdown,
      hourlyTrafficPeak: analyticsState.hourlyTrafficPeak,
      clientBreakdown,
      campaignPerformanceSummary,
      teamPerformanceSummary,
    });
  },

  // --------------------------------------------------------------------------
  // 2. CONVERSATIONS
  // --------------------------------------------------------------------------
  /**
   * Get all conversations with multi-filtering and search
   */
  async getConversations(filters = {}) {
    const {
      clientId = 'all',
      status = 'all',
      leadStage = 'all',
      sentiment = 'all',
      assignedTo = 'all',
      isPriority = 'all',
      tag = 'all',
      source = 'all',
      search = '',
    } = filters;

    let filtered = [...conversationsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    if (leadStage && leadStage !== 'all') {
      filtered = filtered.filter((c) => c.leadStage.toLowerCase() === leadStage.toLowerCase());
    }

    if (sentiment && sentiment !== 'all') {
      filtered = filtered.filter((c) => c.sentiment.toLowerCase() === sentiment.toLowerCase());
    }

    if (assignedTo && assignedTo !== 'all') {
      filtered = filtered.filter(
        (c) =>
          c.assignedTo.toLowerCase() === assignedTo.toLowerCase() ||
          c.assignedTo.toLowerCase().includes(assignedTo.toLowerCase())
      );
    }

    if (isPriority !== 'all' && isPriority !== undefined) {
      const priorityBool = isPriority === true || isPriority === 'true';
      filtered = filtered.filter((c) => Boolean(c.isPriority) === priorityBool);
    }

    if (tag && tag !== 'all') {
      filtered = filtered.filter((c) => c.tags && c.tags.includes(tag));
    }

    if (source && source !== 'all') {
      filtered = filtered.filter((c) => c.source.toLowerCase() === source.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.contactName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.campaign.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single conversation by ID
   */
  async getConversationById(id) {
    if (!id) return Promise.resolve(null);
    const conv = conversationsState.find((c) => c.id === id);
    return Promise.resolve(conv ? JSON.parse(JSON.stringify(conv)) : null);
  },

  /**
   * Add a new conversation
   */
  async addConversation(conversation) {
    const client = clientsState.find((c) => c.id === conversation.clientId) || clientsState[0];
    const newConv = {
      id: conversation.id || `wa-conv-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      contactName: conversation.contactName || 'New Contact',
      phone: conversation.phone || '+91 98000 00000',
      avatar: conversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      lastMessage: conversation.lastMessage || 'Conversation initiated via WhatsApp',
      lastMessageTime: 'Just now',
      unreadCount: conversation.unreadCount !== undefined ? conversation.unreadCount : 1,
      status: conversation.status || 'Open',
      assignedTo: conversation.assignedTo || 'Rajesh Sharma',
      leadStage: conversation.leadStage || 'New Lead',
      leadScore: conversation.leadScore !== undefined ? conversation.leadScore : 70,
      sentiment: conversation.sentiment || 'Neutral',
      tags: conversation.tags || ['Hot Lead'],
      source: conversation.source || 'Website',
      campaign: conversation.campaign || 'Direct Inbound WhatsApp',
      revenue: parseInt(conversation.revenue || '0', 10),
      messagesCount: conversation.messagesCount || 1,
      responseTime: conversation.responseTime || '1.0m',
      isPriority: Boolean(conversation.isPriority),
    };

    conversationsState.unshift(newConv);
    return Promise.resolve(newConv);
  },

  /**
   * Update conversation details
   */
  async updateConversation(id, updates) {
    if (!id) return Promise.resolve(null);
    let updatedRecord = null;
    conversationsState = conversationsState.map((c) => {
      if (c.id === id) {
        updatedRecord = { ...c, ...updates };
        return updatedRecord;
      }
      return c;
    });
    return Promise.resolve(updatedRecord);
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id) {
    if (!id) return Promise.resolve(false);
    const initialLen = conversationsState.length;
    conversationsState = conversationsState.filter((c) => c.id !== id);
    return Promise.resolve(conversationsState.length < initialLen);
  },

  /**
   * Assign conversation to team member
   */
  async assignConversation(id, teamMemberNameOrId) {
    const member = teamMembersState.find(
      (m) => m.id === teamMemberNameOrId || m.name.toLowerCase() === teamMemberNameOrId.toLowerCase()
    );
    const assignedName = member ? member.name : teamMemberNameOrId;
    return this.updateConversation(id, { assignedTo: assignedName });
  },

  /**
   * Update conversation status (Open, Pending, Resolved)
   */
  async updateConversationStatus(id, status) {
    return this.updateConversation(id, { status });
  },

  /**
   * Update lead stage (New Lead, Contacted, Qualified, Proposal, Negotiation, Won, Lost)
   */
  async updateLeadStage(id, stage) {
    return this.updateConversation(id, { leadStage: stage });
  },

  /**
   * Toggle conversation priority
   */
  async togglePriority(id) {
    const target = conversationsState.find((c) => c.id === id);
    if (!target) return Promise.resolve(null);
    return this.updateConversation(id, { isPriority: !target.isPriority });
  },

  // --------------------------------------------------------------------------
  // 3. MESSAGES
  // --------------------------------------------------------------------------
  /**
   * Send text message in conversation
   */
  async sendMessage(conversationId, messageText) {
    const target = conversationsState.find((c) => c.id === conversationId);
    if (!target) return Promise.resolve(null);

    const updated = {
      ...target,
      lastMessage: messageText,
      lastMessageTime: 'Just now',
      messagesCount: (target.messagesCount || 0) + 1,
      unreadCount: 0,
      status: target.status === 'Resolved' ? 'Open' : target.status,
    };

    conversationsState = conversationsState.map((c) => (c.id === conversationId ? updated : c));
    return Promise.resolve(updated);
  },

  /**
   * Send templated WhatsApp message with dynamic variable interpolation and fallback protection
   */
  async sendTemplateMessage(conversationId, templateId, variables = {}) {
    const target = conversationsState.find((c) => c.id === conversationId);
    const template = templatesState.find((t) => t.id === templateId || t.name === templateId);

    if (!target || !template) return Promise.resolve(null);

    let interpolatedText = template.content || '';

    // Replace structured variables
    if (template.variables && Array.isArray(template.variables)) {
      template.variables.forEach((v, idx) => {
        const val =
          variables[`var_${idx + 1}`] ||
          variables[v] ||
          variables[`{{${idx + 1}}}`] ||
          (idx === 0 ? target.contactName : idx === 1 ? target.clientName : `[${v}]`);
        interpolatedText = interpolatedText.split(`{{${idx + 1}}}`).join(val);
      });
    }

    // Direct key replacements if passed
    Object.keys(variables).forEach((key, index) => {
      const placeholder = `{{${index + 1}}}`;
      const namedPlaceholder = `{{${key}}}`;
      if (variables[key]) {
        interpolatedText = interpolatedText
          .split(placeholder)
          .join(variables[key])
          .split(namedPlaceholder)
          .join(variables[key]);
      }
    });

    // Fallback replacement for contactName
    if (interpolatedText.includes('{{1}}')) {
      interpolatedText = interpolatedText.split('{{1}}').join(target.contactName);
    }
    // Clean any residual raw tokens safely
    interpolatedText = interpolatedText.replace(/\{\{\d+\}\}/g, 'Valued Customer');

    // Increment template usage count
    templatesState = templatesState.map((t) =>
      t.id === template.id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
    );

    return this.sendMessage(conversationId, {
      text: `[Template: ${template.name}] ${interpolatedText}`,
      sender: 'agent',
    });
  },

  /**
   * Mark conversation as read (reset unreadCount to 0)
   */
  async markConversationRead(id) {
    return this.updateConversation(id, { unreadCount: 0 });
  },

  // --------------------------------------------------------------------------
  // 4. CAMPAIGNS
  // --------------------------------------------------------------------------
  /**
   * Get all broadcast & automated WhatsApp campaigns
   */
  async getCampaigns(filters = {}) {
    const { clientId = 'all', status = 'all', type = 'all', search = '' } = filters;

    let filtered = [...campaignsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((c) => c.type.toLowerCase() === type.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.audience.toLowerCase().includes(q) ||
          c.templateName.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get campaign by ID
   */
  async getCampaignById(id) {
    if (!id) return Promise.resolve(null);
    const camp = campaignsState.find((c) => c.id === id);
    return Promise.resolve(camp ? JSON.parse(JSON.stringify(camp)) : null);
  },

  /**
   * Create a new campaign
   */
  async createCampaign(campaign) {
    const client = clientsState.find((c) => c.id === campaign.clientId) || clientsState[0];
    const newCamp = {
      id: campaign.id || `wa-camp-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      name: campaign.name || 'New WhatsApp Broadcast',
      type: campaign.type || 'Promotional',
      status: campaign.status || 'Draft',
      audience: campaign.audience || 'Target Audience Segment',
      recipients: parseInt(campaign.recipients || '1000', 10),
      delivered: 0,
      read: 0,
      replied: 0,
      conversions: 0,
      revenue: 0,
      spend: parseInt(campaign.spend || '1500', 10),
      startDate: campaign.startDate || 'Aug 28, 2026',
      scheduledDate: campaign.scheduledDate || 'Immediate',
      templateName: campaign.templateName || 'diwali_vip_membership_offer',
    };

    campaignsState.unshift(newCamp);
    return Promise.resolve(newCamp);
  },

  /**
   * Update campaign details
   */
  async updateCampaign(id, updates) {
    if (!id) return Promise.resolve(null);
    let updatedRecord = null;
    campaignsState = campaignsState.map((c) => {
      if (c.id === id) {
        updatedRecord = { ...c, ...updates };
        return updatedRecord;
      }
      return c;
    });
    return Promise.resolve(updatedRecord);
  },

  /**
   * Delete campaign
   */
  async deleteCampaign(id) {
    if (!id) return Promise.resolve(false);
    const initialLen = campaignsState.length;
    campaignsState = campaignsState.filter((c) => c.id !== id);
    return Promise.resolve(campaignsState.length < initialLen);
  },

  /**
   * Update campaign status (Draft, Scheduled, Running, Completed, Paused)
   */
  async updateCampaignStatus(id, status) {
    return this.updateCampaign(id, { status });
  },

  /**
   * Calculate campaign delivery, read, reply, conversion rates, and ROAS
   */
  calculateCampaignMetrics(campaign) {
    if (!campaign) {
      return {
        deliveryRate: '0.0%',
        readRate: '0.0%',
        replyRate: '0.0%',
        conversionRate: '0.0%',
        revenue: 0,
        spend: 0,
        roas: 'N/A',
      };
    }

    const { recipients = 0, delivered = 0, read = 0, replied = 0, conversions = 0, revenue = 0, spend = 0 } = campaign;

    return {
      deliveryRate: safePercentage(delivered, recipients),
      readRate: safePercentage(read, delivered),
      replyRate: safePercentage(replied, delivered),
      conversionRate: safePercentage(conversions, replied),
      revenue,
      spend,
      roas: safeRoas(revenue, spend),
    };
  },

  // --------------------------------------------------------------------------
  // 5. MESSAGE TEMPLATES
  // --------------------------------------------------------------------------
  /**
   * Get all message templates with multi-filtering
   */
  async getTemplates(filters = {}) {
    const { clientId = 'all', category = 'all', language = 'all', status = 'all', search = '' } = filters;

    let filtered = [...templatesState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((t) => t.clientId === clientId);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (language && language !== 'all') {
      filtered = filtered.filter((t) => t.language.toLowerCase().includes(language.toLowerCase()));
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    if (!id) return Promise.resolve(null);
    const tmpl = templatesState.find((t) => t.id === id);
    return Promise.resolve(tmpl ? JSON.parse(JSON.stringify(tmpl)) : null);
  },

  /**
   * Create a new message template
   */
  async createTemplate(template) {
    const client = clientsState.find((c) => c.id === template.clientId) || clientsState[0];
    const newTmpl = {
      id: template.id || `wa-tmpl-${Date.now()}`,
      clientId: client.id,
      name: template.name || `template_${Date.now()}`,
      category: template.category || 'Marketing',
      language: template.language || 'Hinglish',
      content: template.content || 'Hi {{1}}, thank you for reaching out to us!',
      variables: template.variables || ['Customer_Name'],
      usageCount: 0,
      deliveryRate: '100%',
      replyRate: '0.0%',
      status: template.status || 'Approved',
      createdAt: 'Today',
    };

    templatesState.unshift(newTmpl);
    return Promise.resolve(newTmpl);
  },

  /**
   * Update message template
   */
  async updateTemplate(id, updates) {
    if (!id) return Promise.resolve(null);
    let updatedRecord = null;
    templatesState = templatesState.map((t) => {
      if (t.id === id) {
        updatedRecord = { ...t, ...updates };
        return updatedRecord;
      }
      return t;
    });
    return Promise.resolve(updatedRecord);
  },

  /**
   * Delete message template
   */
  async deleteTemplate(id) {
    if (!id) return Promise.resolve(false);
    const initialLen = templatesState.length;
    templatesState = templatesState.filter((t) => t.id !== id);
    return Promise.resolve(templatesState.length < initialLen);
  },

  /**
   * Calculate template performance metrics
   */
  calculateTemplateMetrics(template) {
    if (!template) {
      return { deliveryRate: '0.0%', replyRate: '0.0%', usageCount: 0 };
    }
    return {
      deliveryRate: template.deliveryRate || '99.0%',
      replyRate: template.replyRate || '25.0%',
      usageCount: template.usageCount || 0,
    };
  },

  // --------------------------------------------------------------------------
  // 6. AUTOMATION FLOWS
  // --------------------------------------------------------------------------
  /**
   * Get all automation flows
   */
  async getAutomationFlows(filters = {}) {
    const { clientId = 'all', status = 'all', search = '' } = filters;

    let filtered = [...automationFlowsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((f) => f.clientId === clientId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((f) => f.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.trigger.toLowerCase().includes(q) ||
          f.steps.some((s) => s.toLowerCase().includes(q))
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get automation flow by ID
   */
  async getAutomationFlowById(id) {
    if (!id) return Promise.resolve(null);
    const flow = automationFlowsState.find((f) => f.id === id);
    return Promise.resolve(flow ? JSON.parse(JSON.stringify(flow)) : null);
  },

  /**
   * Create automation flow
   */
  async createAutomationFlow(flow) {
    const client = clientsState.find((c) => c.id === flow.clientId) || clientsState[0];
    const newFlow = {
      id: flow.id || `wa-flow-${Date.now()}`,
      clientId: client.id,
      name: flow.name || 'New WhatsApp Journey Flow',
      trigger: flow.trigger || 'Inbound Webhook Event',
      status: flow.status || 'Active',
      steps: flow.steps || ['Trigger: Event received', 'Action: Send WhatsApp response'],
      enrolled: 0,
      completed: 0,
      conversionRate: '0.0%',
      revenue: 0,
      lastRun: 'Just now',
      createdAt: 'Today',
    };

    automationFlowsState.unshift(newFlow);
    return Promise.resolve(newFlow);
  },

  /**
   * Update automation flow
   */
  async updateAutomationFlow(id, updates) {
    if (!id) return Promise.resolve(null);
    let updatedRecord = null;
    automationFlowsState = automationFlowsState.map((f) => {
      if (f.id === id) {
        updatedRecord = { ...f, ...updates };
        return updatedRecord;
      }
      return f;
    });
    return Promise.resolve(updatedRecord);
  },

  /**
   * Delete automation flow
   */
  async deleteAutomationFlow(id) {
    if (!id) return Promise.resolve(false);
    const initialLen = automationFlowsState.length;
    automationFlowsState = automationFlowsState.filter((f) => f.id !== id);
    return Promise.resolve(automationFlowsState.length < initialLen);
  },

  /**
   * Toggle automation flow active/paused state
   */
  async toggleAutomationFlow(id) {
    const target = automationFlowsState.find((f) => f.id === id);
    if (!target) return Promise.resolve(null);
    const newStatus = target.status === 'Active' ? 'Paused' : 'Active';
    return this.updateAutomationFlow(id, { status: newStatus });
  },

  /**
   * Calculate automation flow metrics
   */
  calculateAutomationMetrics(flow) {
    if (!flow) {
      return {
        enrolled: 0,
        completed: 0,
        completionRate: '0.0%',
        conversionRate: '0.0%',
        revenue: 0,
      };
    }

    const { enrolled = 0, completed = 0, conversionRate = '0.0%', revenue = 0 } = flow;

    return {
      enrolled,
      completed,
      completionRate: safePercentage(completed, enrolled),
      conversionRate,
      revenue,
    };
  },

  // --------------------------------------------------------------------------
  // 7. TEAM
  // --------------------------------------------------------------------------
  /**
   * Get all team members
   */
  async getTeamMembers(clientId = null) {
    return Promise.resolve(teamMembersState);
  },

  /**
   * Get team member by ID
   */
  async getTeamMemberById(id) {
    if (!id) return Promise.resolve(null);
    const member = teamMembersState.find((m) => m.id === id);
    return Promise.resolve(member ? JSON.parse(JSON.stringify(member)) : null);
  },

  /**
   * Get team workload, operator online statuses, and response performance summary
   */
  async getTeamPerformance(clientId = null) {
    const totalActive = teamMembersState.reduce((acc, m) => acc + (m.activeConversations || 0), 0);
    const totalResolved = teamMembersState.reduce((acc, m) => acc + (m.resolvedConversations || 0), 0);

    const membersWithWorkload = teamMembersState.map((m) => {
      const workloadPct = totalActive > 0 ? ((m.activeConversations / totalActive) * 100).toFixed(1) : '0.0';
      const isOnline = m.name !== 'Vikram Joshi';
      const status = m.name === 'Vikram Joshi' ? 'Busy' : 'Online';

      return {
        ...m,
        workloadPercentage: `${workloadPct}%`,
        status,
        isOnline,
        pendingFollowUps: Math.round(m.activeConversations * 0.35),
      };
    });

    // Determine optimal suggested assignee with lowest active load
    const suggestedAssignee = [...membersWithWorkload]
      .filter((m) => m.status === 'Online')
      .sort((a, b) => a.activeConversations - b.activeConversations)[0] || membersWithWorkload[0];

    return Promise.resolve({
      totalTeamMembers: teamMembersState.length,
      totalActiveConversations: totalActive,
      totalResolvedConversations: totalResolved,
      avgResponseTime: '45s',
      suggestedAssignee,
      members: membersWithWorkload,
    });
  },

  /**
   * Auto-assign conversation based on team capacity and response velocity
   */
  async autoAssignConversation(conversationId) {
    const teamPerf = await this.getTeamPerformance();
    const optimalAssignee = teamPerf.suggestedAssignee;

    if (optimalAssignee) {
      return this.assignConversation(conversationId, optimalAssignee.name);
    }
    return Promise.resolve(null);
  },

  /**
   * Assign conversation to current user ("Assign to me")
   */
  async assignConversationToMe(conversationId, currentUserName = 'Elena Rostova') {
    return this.assignConversation(conversationId, currentUserName);
  },

  /**
   * Synchronize WhatsApp Conversation into CRM Pipeline with Duplicate Prevention
   */
  async syncConversationToCRM(conversationId) {
    const conv = conversationsState.find((c) => c.id === conversationId);
    if (!conv) return Promise.resolve(null);

    // Prepare CRM Lead Payload
    const crmLeadData = {
      name: conv.contactName,
      company: `${conv.contactName} (${conv.clientName})`,
      phone: conv.phone,
      email: `${conv.contactName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      source: conv.source || 'WhatsApp Inbound',
      campaign: conv.campaign || 'WhatsApp Direct Broadcast',
      clientId: conv.clientId,
      status: conv.leadStage || 'New Lead',
      leadScore: conv.leadScore || 80,
      assignedStaff: conv.assignedTo || 'Elena Rostova',
      value: conv.revenue || 15000,
      priority: conv.isPriority ? 'High' : conv.leadScore >= 80 ? 'High' : 'Medium',
      notes: `Captured via WhatsApp Marketing Center. Last message snippet: "${conv.lastMessage}"`,
    };

    let syncedLead = null;
    try {
      // Check if existing lead exists in CRM by leadId or phone
      const existingLeads = await crmService.getLeads({ search: conv.phone });
      const match =
        (conv.crmSync?.leadId && existingLeads.find((l) => l.id === conv.crmSync.leadId)) ||
        existingLeads.find((l) => l.phone === conv.phone);

      if (match) {
        await crmService.updateLead(match.id, {
          status: conv.leadStage || match.status,
          leadScore: conv.leadScore || match.leadScore,
          assignedStaff: conv.assignedTo || match.assignedStaff,
          value: conv.revenue || match.value,
          notes: `Updated via WhatsApp Marketing Center. Last message: "${conv.lastMessage}"`,
          lastActivity: 'Synchronized from WhatsApp conversation (Just now)',
        });
        syncedLead = {
          ...match,
          status: conv.leadStage || match.status,
          assignedStaff: conv.assignedTo || match.assignedStaff,
        };
      } else {
        syncedLead = await crmService.addLead(crmLeadData);
      }
    } catch (e) {
      syncedLead = { id: `crm-lead-${Date.now()}`, ...crmLeadData };
    }

    // Update conversation with CRM Sync status flag
    const updatedConv = {
      ...conv,
      crmSync: {
        synced: true,
        leadId: syncedLead?.id || `lead-${Date.now()}`,
        syncedAt: 'Just now',
      },
    };

    conversationsState = conversationsState.map((c) => (c.id === conversationId ? updatedConv : c));
    return Promise.resolve({
      conversation: updatedConv,
      crmLead: syncedLead,
    });
  },

  // --------------------------------------------------------------------------
  // 8. FOLLOW-UPS & TASK COMMAND CENTER
  // --------------------------------------------------------------------------
  /**
   * Get all follow-ups with multi-criteria filtering
   */
  async getFollowUps(filters = {}) {
    const {
      clientId = 'all',
      assignedStaff = 'all',
      status = 'all',
      priority = 'all',
      type = 'all',
      leadStage = 'all',
      search = '',
    } = filters;

    let filtered = [...followUpsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((f) => f.clientId === clientId);
    }

    if (assignedStaff && assignedStaff !== 'all') {
      filtered = filtered.filter((f) => f.assignedStaff.toLowerCase() === assignedStaff.toLowerCase());
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((f) => f.status.toLowerCase() === status.toLowerCase());
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter((f) => f.priority.toLowerCase() === priority.toLowerCase());
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((f) => f.type.toLowerCase() === type.toLowerCase());
    }

    if (leadStage && leadStage !== 'all') {
      filtered = filtered.filter((f) => f.leadStage.toLowerCase() === leadStage.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (f) =>
          f.customerName.toLowerCase().includes(q) ||
          f.phone.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q) ||
          f.clientName.toLowerCase().includes(q) ||
          f.assignedStaff.toLowerCase().includes(q) ||
          f.reason.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get follow-up by ID
   */
  async getFollowUpById(id) {
    if (!id) return Promise.resolve(null);
    const item = followUpsState.find((f) => f.id === id);
    return Promise.resolve(item ? JSON.parse(JSON.stringify(item)) : null);
  },

  /**
   * Create a new follow-up task
   */
  async createFollowUp(followUpData) {
    const client = clientsState.find((c) => c.id === followUpData.clientId) || clientsState[0];
    const newFollowUp = {
      id: followUpData.id || `wa-fu-${Date.now()}`,
      conversationId: followUpData.conversationId || `wa-conv-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      customerName: followUpData.customerName || 'Inbound Prospect',
      phone: followUpData.phone || '+91 98000 11223',
      email: followUpData.email || 'contact@example.com',
      avatar: followUpData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      assignedStaff: followUpData.assignedStaff || 'Rajesh Sharma',
      type: followUpData.type || 'WhatsApp',
      priority: followUpData.priority || 'High',
      status: followUpData.status || 'Due Today',
      dueDate: followUpData.dueDate || 'Today at 05:00 PM',
      dueDateTimeRaw: followUpData.dueDateTimeRaw || new Date().toISOString(),
      overdueDuration: followUpData.status === 'Overdue' ? '12 hours overdue' : null,
      reason: followUpData.reason || 'Strategic client consultation and demo briefing',
      dealValue: parseInt(followUpData.dealValue || '25000', 10),
      leadStage: followUpData.leadStage || 'Qualified',
      leadScore: parseInt(followUpData.leadScore || '88', 10),
      sentiment: followUpData.sentiment || 'Positive',
      lastInteraction: followUpData.lastInteraction || 'Captured from WhatsApp conversation',
      timeline: [
        {
          timestamp: 'Just now',
          event: 'Follow-up Created',
          staff: followUpData.assignedStaff || 'System',
          note: followUpData.reason || 'Created follow-up task',
        },
      ],
    };

    followUpsState.unshift(newFollowUp);

    // Sync with corresponding conversation if exists
    if (newFollowUp.conversationId) {
      this.scheduleFollowUp(newFollowUp.conversationId, {
        followUpDate: newFollowUp.dueDate,
        followUpTime: '',
        reason: newFollowUp.reason,
        reminderStatus: newFollowUp.status,
      });
    }

    return Promise.resolve(newFollowUp);
  },

  /**
   * Update follow-up task
   */
  async updateFollowUp(id, updates) {
    if (!id) return Promise.resolve(null);
    let updatedRecord = null;
    followUpsState = followUpsState.map((f) => {
      if (f.id === id) {
        updatedRecord = {
          ...f,
          ...updates,
          timeline: [
            {
              timestamp: 'Just now',
              event: 'Task Updated',
              staff: updates.assignedStaff || f.assignedStaff,
              note: updates.reason ? `Updated: ${updates.reason}` : 'Parameters modified',
            },
            ...(f.timeline || []),
          ],
        };
        return updatedRecord;
      }
      return f;
    });
    return Promise.resolve(updatedRecord);
  },

  /**
   * Delete follow-up task
   */
  async deleteFollowUp(id) {
    if (!id) return Promise.resolve(false);
    const initialLen = followUpsState.length;
    followUpsState = followUpsState.filter((f) => f.id !== id);
    return Promise.resolve(followUpsState.length < initialLen);
  },

  /**
   * Mark follow-up as Completed and synchronize with CRM
   */
  async completeFollowUp(idOrConversationId) {
    let completedItem = null;

    // Check if ID matches followUp ID
    const directFollowUp = followUpsState.find((f) => f.id === idOrConversationId);
    const convFollowUp = followUpsState.find((f) => f.conversationId === idOrConversationId);
    const targetId = directFollowUp?.id || convFollowUp?.id;

    if (targetId) {
      followUpsState = followUpsState.map((f) => {
        if (f.id === targetId) {
          completedItem = {
            ...f,
            status: 'Completed',
            overdueDuration: null,
            timeline: [
              {
                timestamp: 'Just now',
                event: 'Follow-up Completed',
                staff: f.assignedStaff,
                note: `Completed: ${f.reason}`,
              },
              ...(f.timeline || []),
            ],
          };
          return completedItem;
        }
        return f;
      });
    }

    // Also update conversation if matching
    const matchingConv = conversationsState.find(
      (c) => c.id === idOrConversationId || (completedItem && c.id === completedItem.conversationId)
    );

    if (matchingConv) {
      conversationsState = conversationsState.map((c) =>
        c.id === matchingConv.id
          ? {
              ...c,
              followUpStatus: 'Completed',
              lastMessage: `[Follow-up Completed]: ${completedItem?.reason || 'Consultation done'}`,
            }
          : c
      );
    }

    return Promise.resolve(completedItem || { status: 'Completed' });
  },

  /**
   * Reschedule follow-up task with new date, time, and reason
   */
  async rescheduleFollowUp(id, rescheduleData) {
    const { dueDate, reason } = rescheduleData;
    let rescheduled = null;

    followUpsState = followUpsState.map((f) => {
      if (f.id === id) {
        rescheduled = {
          ...f,
          dueDate: dueDate || f.dueDate,
          reason: reason || f.reason,
          status: 'Upcoming',
          overdueDuration: null,
          timeline: [
            {
              timestamp: 'Just now',
              event: 'Follow-up Rescheduled',
              staff: f.assignedStaff,
              note: `Rescheduled to ${dueDate}. Note: ${reason || 'Updated agenda'}`,
            },
            ...(f.timeline || []),
          ],
        };
        return rescheduled;
      }
      return f;
    });

    return Promise.resolve(rescheduled);
  },

  /**
   * Reassign follow-up to another operator
   */
  async assignFollowUp(id, staffName) {
    let assigned = null;
    followUpsState = followUpsState.map((f) => {
      if (f.id === id) {
        assigned = {
          ...f,
          assignedStaff: staffName,
          timeline: [
            {
              timestamp: 'Just now',
              event: 'Reassigned Operator',
              staff: staffName,
              note: `Reassigned to ${staffName}`,
            },
            ...(f.timeline || []),
          ],
        };
        return assigned;
      }
      return f;
    });
    return Promise.resolve(assigned);
  },

  /**
   * Calculate aggregate KPI metrics for Follow-ups Command Center
   */
  async getFollowUpMetrics(filters = {}) {
    const followUps = await this.getFollowUps(filters);

    const total = followUps.length;
    const overdue = followUps.filter((f) => f.status === 'Overdue');
    const dueToday = followUps.filter((f) => f.status === 'Due Today');
    const dueTomorrow = followUps.filter((f) => f.status === 'Due Tomorrow');
    const upcoming = followUps.filter((f) => f.status === 'Upcoming');
    const completed = followUps.filter((f) => f.status === 'Completed');
    const vipOrHigh = followUps.filter((f) => f.priority === 'VIP' || f.priority === 'High');

    const revenueAtRisk = [...overdue, ...dueToday].reduce((acc, f) => acc + (f.dealValue || 0), 0);
    const completionRate = total > 0 ? safePercentage(completed.length, total) : '0.0%';

    return Promise.resolve({
      total,
      overdueCount: overdue.length,
      dueTodayCount: dueToday.length,
      dueTomorrowCount: dueTomorrow.length,
      upcomingCount: upcoming.length,
      completedTodayCount: completed.length,
      completionRate,
      revenueAtRisk,
      highPriorityCount: vipOrHigh.length,
    });
  },

  /**
   * Generate AI Smart Follow-up Recommendations
   */
  async getFollowUpSuggestions(filters = {}) {
    const suggestions = [
      {
        id: 'sug-1',
        customerName: 'Rohit Sharma (Apex Fitness Club)',
        phone: '+91 98201 44556',
        dealValue: 45000,
        recommendedAction: 'WhatsApp direct broadcast with 15% VIP code',
        recommendedTime: 'Today at 06:30 PM',
        recommendedChannel: 'WhatsApp',
        priority: 'VIP',
        reason: 'High-intent lead, proposal viewed, unreplied for 18 hours. Optimal conversion window is evening peak.',
      },
      {
        id: 'sug-2',
        customerName: 'Vikram Malhotra (NovaTech SaaS)',
        phone: '+91 99200 55112',
        dealValue: 320000,
        recommendedAction: 'Executive consultative call with Enterprise Solutions Architect',
        recommendedTime: 'Tomorrow at 11:00 AM',
        recommendedChannel: 'Phone Call',
        priority: 'VIP',
        reason: 'Enterprise deal (50 developer seats). Technical CTO questions require live architecture briefing.',
      },
      {
        id: 'sug-3',
        customerName: 'Dr. Ramesh Gupta (Bharat Ayurveda Health)',
        phone: '+91 98111 22334',
        dealValue: 120000,
        recommendedAction: 'Send B2B Wholesale Tier 2 pricing sheet via WhatsApp Document',
        recommendedTime: 'Today at 04:00 PM',
        recommendedChannel: 'WhatsApp Document',
        priority: 'High',
        reason: 'Requested wholesale tier pricing for 500 units inventory purchase.',
      },
    ];

    return Promise.resolve(suggestions);
  },

  /**
   * Auto-balance pending follow-ups across available online staff
   */
  async autoBalanceFollowUps() {
    const onlineStaff = teamMembersState.filter((m) => m.name !== 'Vikram Joshi');
    let staffIdx = 0;

    followUpsState = followUpsState.map((f) => {
      if (f.status === 'Overdue' || f.status === 'Due Today') {
        const assigned = onlineStaff[staffIdx % onlineStaff.length].name;
        staffIdx++;
        return {
          ...f,
          assignedStaff: assigned,
          timeline: [
            {
              timestamp: 'Just now',
              event: 'Auto-Balanced',
              staff: assigned,
              note: `Workload balanced to ${assigned}`,
            },
            ...(f.timeline || []),
          ],
        };
      }
      return f;
    });

    return Promise.resolve(true);
  },

  // --------------------------------------------------------------------------
  // 8. TAGS
  // --------------------------------------------------------------------------
  /**
   * Get WhatsApp tags/taxonomy
   */
  async getWhatsAppTags(clientId = null) {
    return Promise.resolve(tagsState);
  },

  /**
   * Get conversations labeled with specific tag
   */
  async getConversationsByTag(tagIdOrLabel) {
    const targetTag = tagsState.find((t) => t.id === tagIdOrLabel || t.label.toLowerCase() === tagIdOrLabel.toLowerCase());
    const label = targetTag ? targetTag.label : tagIdOrLabel;
    const filtered = conversationsState.filter((c) => c.tags && c.tags.includes(label));
    return Promise.resolve(filtered);
  },

  // --------------------------------------------------------------------------
  // 9. SEARCH ACROSS WHATSAPP MODULE
  // --------------------------------------------------------------------------
  /**
   * Universal search across conversations, campaigns, templates, and flows
   */
  async searchWhatsApp(query, filters = {}) {
    if (!query || !query.trim()) {
      return Promise.resolve({
        conversations: conversationsState.slice(0, 10),
        campaigns: campaignsState.slice(0, 5),
        templates: templatesState.slice(0, 5),
        automationFlows: automationFlowsState.slice(0, 5),
      });
    }

    const q = query.toLowerCase().trim();

    const matchedConversations = conversationsState.filter(
      (c) =>
        c.contactName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.campaign.toLowerCase().includes(q) ||
        c.assignedTo.toLowerCase().includes(q) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
    );

    const matchedCampaigns = campaignsState.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.audience.toLowerCase().includes(q) ||
        c.templateName.toLowerCase().includes(q)
    );

    const matchedTemplates = templatesState.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    const matchedFlows = automationFlowsState.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.trigger.toLowerCase().includes(q) ||
        f.steps.some((s) => s.toLowerCase().includes(q))
    );

    return Promise.resolve({
      conversations: matchedConversations,
      campaigns: matchedCampaigns,
      templates: matchedTemplates,
      automationFlows: matchedFlows,
    });
  },

  // --------------------------------------------------------------------------
  // 10. AI ASSISTANT DATA SUPPORT
  // --------------------------------------------------------------------------
  /**
   * AI Sales & Support Reply Generator
   */
  async generateAIReply(conversationId, options = {}) {
    const { tone = 'Friendly' } = options;
    const conversation = conversationsState.find((c) => c.id === conversationId) || conversationsState[0];

    const toneReplies = {
      Professional: `Namaste ${conversation.contactName}, thank you for your query regarding ${conversation.clientName}. We have shared our comprehensive product brochure and pricing schedule. Would you be available for a brief 10-minute briefing tomorrow at 11 AM?`,
      Friendly: `Hey ${conversation.contactName}! 😊 Great to connect with you. I'd love to help you get started with ${conversation.clientName}. Would you like me to reserve a trial pass or share our exclusive festive discount code?`,
      Persuasive: `Hi ${conversation.contactName}! 🚀 For a limited time, ${conversation.clientName} is offering an upfront 15% incentive on annual packages. Should I send over the priority reservation link before slots fill up?`,
      Concise: `Hi ${conversation.contactName}. Yes, slots are open. Direct booking link: https://${conversation.clientId}.app/pass. Let us know if you need any assistance!`,
      Empathetic: `Hello ${conversation.contactName}, I completely understand your concern regarding timeline and pricing. We can easily customize a flexible billing plan for you. Would you like to review the adjusted options?`,
    };

    return Promise.resolve({
      suggestedReply: toneReplies[tone] || toneReplies.Friendly,
      tone,
      intent: `${conversation.leadStage} - ${conversation.sentiment} Sentiment`,
      confidence: '94.8%',
      suggestedNextAction: `Send WhatsApp payment link or calendar booking confirmation for ${conversation.clientName}.`,
      objectionHandling: 'Emphasize verified customer reviews, money-back guarantee, and direct dedicated account manager support.',
      followUpTime: 'Within 2 hours',
    });
  },

  /**
   * AI Conversation Executive Summary & Lead Scoring Breakdown
   */
  async generateAIConversationSummary(conversationId) {
    const conversation = conversationsState.find((c) => c.id === conversationId) || conversationsState[0];

    return Promise.resolve({
      summary: `Customer ${conversation.contactName} engaged via ${conversation.source} inquiring about ${conversation.campaign}. Current lead status is ${conversation.leadStage} with estimated deal size of ₹${(conversation.revenue || 0).toLocaleString()}.`,
      customerIntent: `${conversation.leadScore >= 85 ? 'High Buying Intent' : 'Discovery / Exploratory Evaluation'}`,
      sentiment: conversation.sentiment,
      objections: conversation.sentiment === 'Negative' ? ['Delivery transit time / product condition'] : ['Price sensitivity or custom SLA requirement'],
      recommendedAction: `Proceed with ${conversation.leadStage === 'Won' ? 'VIP onboarding sequence' : 'scheduled follow-up call & payment link'}`,
      leadQuality: conversation.leadScore >= 90 ? 'VIP Platinum Tier' : conversation.leadScore >= 80 ? 'Hot Sales Opportunity' : 'Warm Nurture Lead',
      score: conversation.leadScore,
    });
  },

  // --------------------------------------------------------------------------
  // 11. BROADCAST ESTIMATOR
  // --------------------------------------------------------------------------
  /**
   * Estimate audience delivery, reads, replies, conversions, and revenue
   */
  // --------------------------------------------------------------------------
  // 12. ANALYTICS & REPORTING INTELLIGENCE
  // --------------------------------------------------------------------------
  /**
   * Get overall Executive KPI metrics with previous period comparison
   */
  async getWhatsAppAnalytics(filters = {}) {
    const { clientId = 'all', timeframe = '30d' } = filters;

    let targetConvs = [...conversationsState];
    let targetCamps = [...campaignsState];
    let targetFollowUps = [...followUpsState];

    if (clientId && clientId !== 'all') {
      targetConvs = targetConvs.filter((c) => c.clientId === clientId);
      targetCamps = targetCamps.filter((c) => c.clientId === clientId);
      targetFollowUps = targetFollowUps.filter((f) => f.clientId === clientId);
    }

    const wonConvs = targetConvs.filter((c) => c.leadStage === 'Won');
    const wonRevenue = wonConvs.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const campaignRevenue = targetCamps.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const totalRevenue = wonRevenue + campaignRevenue;

    const totalCampaignSpend = targetCamps.reduce((acc, c) => acc + (c.spend || 0), 0);
    const blendedRoas = totalCampaignSpend > 0 ? (totalRevenue / totalCampaignSpend).toFixed(1) + 'x' : '4.8x';

    const totalRecipients = targetCamps.reduce((acc, c) => acc + (c.recipients || 0), 0) || 12450;
    const totalDelivered = targetCamps.reduce((acc, c) => acc + (c.delivered || 0), 0) || 12380;
    const totalRead = targetCamps.reduce((acc, c) => acc + (c.read || 0), 0) || 10980;
    const totalReplied = targetCamps.reduce((acc, c) => acc + (c.replied || 0), 0) || 3540;
    const totalConversions = targetCamps.reduce((acc, c) => acc + (c.conversions || 0), 0) || 860;

    const completedFollowUps = targetFollowUps.filter((f) => f.status === 'Completed').length;
    const totalFollowUps = targetFollowUps.length || 12;
    const followUpRate = totalFollowUps > 0 ? ((completedFollowUps / totalFollowUps) * 100).toFixed(1) + '%' : '92.5%';

    return Promise.resolve({
      messagesSent: {
        value: '48,650',
        prevValue: '41,150',
        change: '+18.2%',
        isPositive: true,
        metric: 'Total Sent',
      },
      messagesReceived: {
        value: '36,820',
        prevValue: '30,050',
        change: '+22.5%',
        isPositive: true,
        metric: 'Inbound Replies',
      },
      deliveryRate: {
        value: safePercentage(totalDelivered, totalRecipients) || '99.4%',
        prevValue: '98.8%',
        change: '+0.6%',
        isPositive: true,
        metric: 'Meta Cloud API',
      },
      readRate: {
        value: safePercentage(totalRead, totalDelivered) || '88.9%',
        prevValue: '85.8%',
        change: '+3.1%',
        isPositive: true,
        metric: 'Open Velocity',
      },
      replyRate: {
        value: '75.6%',
        prevValue: '70.8%',
        change: '+4.8%',
        isPositive: true,
        metric: 'Engagement',
      },
      newLeads: {
        value: `${targetConvs.length * 15 || 1240}`,
        prevValue: '930',
        change: '+33.3%',
        isPositive: true,
        metric: 'Inbound Capture',
      },
      conversionRate: {
        value: '33.7%',
        prevValue: '28.5%',
        change: '+5.2%',
        isPositive: true,
        metric: 'Lead-to-Sale',
      },
      revenue: {
        value: `₹${(totalRevenue || 3684000).toLocaleString()}`,
        prevValue: '₹2,844,000',
        change: '+29.5%',
        isPositive: true,
        metric: 'Attributed Sales',
      },
      roas: {
        value: blendedRoas,
        prevValue: '3.9x',
        change: '+0.9x',
        isPositive: true,
        metric: 'Blended Return',
      },
      avgResponseTime: {
        value: '45s',
        prevValue: '1.2m',
        change: '-27s faster',
        isPositive: true,
        metric: 'First Response SLA',
      },
      activeConversations: {
        value: `${targetConvs.filter((c) => c.status === 'Open').length * 4 || 142}`,
        prevValue: '110',
        change: '+29.0%',
        isPositive: true,
        metric: 'Live Threads',
      },
      followUpsCompleted: {
        value: followUpRate,
        prevValue: '84.0%',
        change: '+8.5%',
        isPositive: true,
        metric: 'SLA Adherence',
      },
    });
  },

  /**
   * Get Message Volume Time-Series Data
   */
  async getMessageVolumeAnalytics(filters = {}) {
    const { timeframe = '30d', interval = 'daily' } = filters;

    const dailyData = [
      { date: 'Aug 15', sent: 1250, received: 980, delivered: 1240, read: 1110 },
      { date: 'Aug 16', sent: 1420, received: 1120, delivered: 1410, read: 1280 },
      { date: 'Aug 17', sent: 1680, received: 1340, delivered: 1670, read: 1490 },
      { date: 'Aug 18', sent: 1890, received: 1450, delivered: 1880, read: 1680 },
      { date: 'Aug 19', sent: 1540, received: 1210, delivered: 1530, read: 1390 },
      { date: 'Aug 20', sent: 1720, received: 1380, delivered: 1710, read: 1550 },
      { date: 'Aug 21', sent: 2150, received: 1720, delivered: 2130, read: 1940 },
      { date: 'Aug 22', sent: 2480, received: 1980, delivered: 2460, read: 2210 },
      { date: 'Aug 23', sent: 2200, received: 1790, delivered: 2180, read: 1980 },
      { date: 'Aug 24', sent: 2650, received: 2140, delivered: 2630, read: 2390 },
      { date: 'Aug 25', sent: 2890, received: 2310, delivered: 2870, read: 2610 },
      { date: 'Aug 26', sent: 3100, received: 2490, delivered: 3080, read: 2790 },
      { date: 'Aug 27', sent: 2950, received: 2380, delivered: 2930, read: 2670 },
      { date: 'Aug 28', sent: 3420, received: 2780, delivered: 3400, read: 3090 },
    ];

    const weeklyData = [
      { date: 'Week 31 (Jul 28 - Aug 03)', sent: 8900, received: 6950, delivered: 8850, read: 7920 },
      { date: 'Week 32 (Aug 04 - Aug 10)', sent: 11400, received: 8890, delivered: 11320, read: 10180 },
      { date: 'Week 33 (Aug 11 - Aug 17)', sent: 13600, received: 10540, delivered: 13510, read: 12150 },
      { date: 'Week 34 (Aug 18 - Aug 24)', sent: 14750, received: 11440, delivered: 14660, read: 13180 },
    ];

    return Promise.resolve({
      series: interval === 'weekly' ? weeklyData : dailyData,
      summary: {
        totalSent: '48,650',
        totalReceived: '36,820',
        avgDeliveryRate: '99.4%',
        avgReadRate: '88.9%',
      },
    });
  },

  /**
   * Get Conversation Breakdown, Response SLAs, and Lead Stages
   */
  async getConversationAnalytics(filters = {}) {
    const total = conversationsState.length;
    const open = conversationsState.filter((c) => c.status === 'Open').length;
    const pending = conversationsState.filter((c) => c.status === 'Pending').length;
    const resolved = conversationsState.filter((c) => c.status === 'Resolved').length;

    const positive = conversationsState.filter((c) => c.sentiment === 'Positive').length;
    const neutral = conversationsState.filter((c) => c.sentiment === 'Neutral').length;
    const negative = conversationsState.filter((c) => c.sentiment === 'Negative').length;

    const stages = {
      'New Lead': conversationsState.filter((c) => c.leadStage === 'New Lead').length,
      Contacted: conversationsState.filter((c) => c.leadStage === 'Contacted').length,
      Qualified: conversationsState.filter((c) => c.leadStage === 'Qualified').length,
      Proposal: conversationsState.filter((c) => c.leadStage === 'Proposal').length,
      Negotiation: conversationsState.filter((c) => c.leadStage === 'Negotiation').length,
      Won: conversationsState.filter((c) => c.leadStage === 'Won').length,
      Lost: conversationsState.filter((c) => c.leadStage === 'Lost').length,
    };

    return Promise.resolve({
      totalConversations: total,
      open,
      pending,
      resolved,
      avgFirstResponseTime: '45s',
      avgResolutionTime: '18m',
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '72.5%',
      sentiment: {
        positive,
        neutral,
        negative,
        positivePct: total > 0 ? ((positive / total) * 100).toFixed(1) + '%' : '75.0%',
      },
      stages,
    });
  },

  /**
   * Get 8-Stage Conversion Funnel Analytics
   */
  async getConversionFunnelAnalytics(filters = {}) {
    const funnelSteps = [
      { step: '1. Messages / Contacts', count: 12450, conversionRate: '100%', dropOff: '0%', revenue: '₹0' },
      { step: '2. Engaged & Read', count: 11068, conversionRate: '88.9%', dropOff: '11.1%', revenue: '₹0' },
      { step: '3. Customer Replied', count: 8366, conversionRate: '75.6%', dropOff: '24.4%', revenue: '₹0' },
      { step: '4. Qualified Leads', count: 4032, conversionRate: '48.2%', dropOff: '51.8%', revenue: '₹0' },
      { step: '5. Proposal / Slot Booked', count: 2376, conversionRate: '58.9%', dropOff: '41.1%', revenue: '₹840,000' },
      { step: '6. Negotiation / Review', count: 1548, conversionRate: '65.1%', dropOff: '34.9%', revenue: '₹1,650,000' },
      { step: '7. Deals Won / Purchased', count: 1032, conversionRate: '66.7%', dropOff: '33.3%', revenue: '₹3,684,000' },
    ];

    return Promise.resolve({
      steps: funnelSteps,
      overallConversionRate: '8.3%',
      blendedLeadToWonRate: '25.6%',
      attributedRevenue: '₹3,684,000',
    });
  },

  /**
   * Get Comparative Campaign Analytics with Rankings
   */
  async getCampaignAnalytics(filters = {}) {
    const list = campaignsState.map((c) => {
      const metrics = this.calculateCampaignMetrics(c);
      return {
        ...c,
        ...metrics,
      };
    });

    const bestByRoas = [...list].sort((a, b) => parseFloat(b.roas) - parseFloat(a.roas))[0];
    const bestByRevenue = [...list].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];
    const bestByReply = [...list].sort((a, b) => parseFloat(b.replyRate) - parseFloat(a.replyRate))[0];

    return Promise.resolve({
      campaigns: list,
      bestByRoas,
      bestByRevenue,
      bestByReply,
    });
  },

  /**
   * Get Template Performance Ranking & Review
   */
  async getTemplateAnalytics(filters = {}) {
    const tmpls = templatesState.map((t) => {
      const m = this.calculateTemplateMetrics(t);
      return {
        ...t,
        ...m,
      };
    });

    const mostUsed = [...tmpls].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0];
    const highestReply = [...tmpls].sort((a, b) => parseFloat(b.replyRate) - parseFloat(a.replyRate))[0];
    const highestDelivery = [...tmpls].sort((a, b) => parseFloat(b.deliveryRate) - parseFloat(a.deliveryRate))[0];

    return Promise.resolve({
      templates: tmpls,
      mostUsed,
      highestReply,
      highestDelivery,
    });
  },

  /**
   * Get Automation Flows Performance & Revenue Lift
   */
  async getAutomationAnalytics(filters = {}) {
    const flows = automationFlowsState.map((f) => {
      const m = this.calculateAutomationMetrics(f);
      const revPerContact = f.enrolled > 0 ? Math.round((f.revenue || 0) / f.enrolled) : 0;
      return {
        ...f,
        ...m,
        revenuePerContact: `₹${revPerContact}`,
      };
    });

    const highestRevenue = [...flows].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];
    const highestConversion = [...flows].sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate))[0];

    return Promise.resolve({
      flows,
      highestRevenue,
      highestConversion,
    });
  },

  /**
   * Get Operator Leaderboard & Team Analytics
   */
  async getTeamAnalytics(filters = {}) {
    const perf = await this.getTeamPerformance();
    const members = perf.members.map((m) => {
      return {
        ...m,
        wonLeads: Math.round((m.resolvedConversations || 10) * 0.28),
        revenueGenerated: (m.resolvedConversations || 10) * 3500,
      };
    });

    const topPerformer = [...members].sort((a, b) => b.resolvedConversations - a.resolvedConversations)[0];
    const fastestResponder = [...members].sort((a, b) => parseInt(a.avgResponseTime) - parseInt(b.avgResponseTime))[0];
    const highestRevenue = [...members].sort((a, b) => b.revenueGenerated - a.revenueGenerated)[0];

    return Promise.resolve({
      members,
      topPerformer,
      fastestResponder,
      highestRevenue,
    });
  },

  /**
   * Get Client Workspace Comparison Analytics
   */
  async getClientAnalytics(filters = {}) {
    const clientsData = clientsState.map((cl) => {
      const convs = conversationsState.filter((c) => c.clientId === cl.id);
      const wonConvs = convs.filter((c) => c.leadStage === 'Won');
      const rev = wonConvs.reduce((acc, c) => acc + (c.revenue || 0), 0) || 450000;
      const spend = 45000;
      const roas = (rev / spend).toFixed(1) + 'x';

      return {
        clientId: cl.id,
        clientName: cl.name,
        industry: cl.industry,
        conversations: convs.length * 12 || 140,
        messages: convs.length * 140 || 4800,
        leads: convs.length * 8 || 120,
        qualified: convs.length * 4 || 65,
        conversions: wonConvs.length * 4 || 32,
        revenue: rev,
        spend,
        roas,
        replyRate: '76.4%',
        avgResponse: '42s',
      };
    });

    return Promise.resolve(clientsData);
  },

  /**
   * Get Multi-Channel Source Attribution Ranking
   */
  async getSourceAnalytics(filters = {}) {
    const sources = [
      { source: 'Meta Click-to-WhatsApp Ads', leads: 540, qualified: 280, conversionRate: '34.5%', cpl: '₹140', revenue: 1480000, roas: '5.2x', share: '43.5%', color: '#22c55e' },
      { source: 'Website WhatsApp Widget', leads: 280, qualified: 160, conversionRate: '32.1%', cpl: '₹0 (Owned)', revenue: 840000, roas: 'N/A', share: '22.6%', color: '#3b82f6' },
      { source: 'Instagram Direct & Bio Links', leads: 210, qualified: 110, conversionRate: '28.6%', cpl: '₹185', revenue: 580000, roas: '4.4x', share: '16.9%', color: '#ec4899' },
      { source: 'Google Search Ads Inbound', leads: 130, qualified: 75, conversionRate: '38.2%', cpl: '₹310', revenue: 490000, roas: '3.8x', share: '10.5%', color: '#f59e0b' },
      { source: 'Referrals & Organic Broadcast', leads: 80, qualified: 52, conversionRate: '46.0%', cpl: '₹0 (Organic)', revenue: 294000, roas: 'N/A', share: '6.5%', color: '#a855f7' },
    ];

    return Promise.resolve(sources);
  },

  /**
   * Get 24-Hour x 7-Day Activity Heatmap Grid
   */
  async getHourlyHeatmapAnalytics(filters = {}) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['09 AM', '11 AM', '01 PM', '03 PM', '05 PM', '07 PM', '09 PM', '11 PM'];

    const heatmapGrid = days.map((day) => {
      return {
        day,
        values: hours.map((hr, idx) => {
          let base = 20;
          if (hr === '05 PM' || hr === '07 PM' || hr === '09 PM') base = 85;
          else if (hr === '11 AM' || hr === '03 PM') base = 55;
          const noise = Math.floor(Math.sin(idx + day.length) * 12);
          return Math.max(15, Math.min(100, base + noise));
        }),
      };
    });

    return Promise.resolve({
      hours,
      days,
      grid: heatmapGrid,
      peakWindow: '06:00 PM – 09:30 PM (IST)',
      peakDay: 'Friday & Saturday Evening',
      bestConversionVelocity: 'Within 45 seconds of initial inbound prompt',
    });
  },

  /**
   * Get AI Insights and Prioritized Next Actions
   */
  async getAIInsights(filters = {}) {
    return Promise.resolve({
      keyObservations: [
        'WhatsApp reply rate increased +4.8% (75.6%) driven by festive template campaigns with personalized variable tokens.',
        'Meta Click-to-WhatsApp ads generate the highest attributed revenue (₹1,480,000) with a 5.2x ROAS.',
        'First response time improved from 1.2m to 45s following auto-assignment load balancing.',
        'Peak conversational traffic consistently hits between 06:00 PM and 09:30 PM across e-commerce and wellness clients.',
      ],
      recommendedActions: [
        {
          priority: 'P0 Critical',
          badge: 'urgent',
          title: 'Scale Meta Ads Click-to-WhatsApp Budget for High-ROAS Campaigns',
          description: 'Festive Flash Glow Drop and VIP Trial campaigns are performing at 5.2x ROAS with under 45s response SLAs. Increase daily ad spend by 25%.',
        },
        {
          priority: 'P1 High',
          badge: 'high',
          title: 'Review Underperforming Message Template (payment_link_instant_upi)',
          description: 'While delivery is 99.5%, reply drop-off after payment link dispatch is 46%. Incorporate a 2-hour automated reminder nudge.',
        },
        {
          priority: 'P2 Medium',
          badge: 'medium',
          title: 'Schedule Additional Operator Shifts between 6 PM – 9 PM',
          description: 'Over 48% of total daily inbound inquiries arrive in the evening window. Add 1 dedicated evening shift to prevent SLA degradation.',
        },
        {
          priority: 'P3 Low',
          badge: 'low',
          title: 'Re-engage 380 Inactive Wholesale Consultation Contacts',
          description: 'Trigger the "Inactive Customer 45-day" customer journey flow to recover an estimated ₹270,000 in dormant pipeline value.',
        },
      ],
    });
  },

  /**
   * Get Anomaly Detection Events
   */
  async getAnomalies(filters = {}) {
    return Promise.resolve([
      {
        id: 'anom-1',
        severity: 'Warning',
        metric: 'Evening SLA Latency',
        current: '1.4m',
        expected: '< 45s',
        change: '+85% spike',
        recommendedAction: 'Trigger auto-balance or enable AI Co-pilot instant reply assistant.',
      },
      {
        id: 'anom-2',
        severity: 'Success',
        metric: 'Campaign ROAS Velocity',
        current: '5.2x',
        expected: '3.8x',
        change: '+36.8% lift',
        recommendedAction: 'Scale budget allocation on Verde Organics and Apex Club ad creatives.',
      },
    ]);
  },

  /**
   * Export CSV of WhatsApp Analytics Data
   */
  async exportWhatsAppAnalyticsCSV(filters = {}) {
    const analytics = await this.getWhatsAppAnalytics(filters);
    const clients = await this.getClientAnalytics(filters);

    let csvContent = 'Metric,Value,Previous Period,Change\n';
    Object.entries(analytics).forEach(([key, val]) => {
      csvContent += `${val.metric || key},"${val.value}","${val.prevValue}","${val.change}"\n`;
    });

    csvContent += '\nClient Workspace,Conversations,Messages,Leads,Revenue,Spend,ROAS,Reply Rate\n';
    clients.forEach((c) => {
      csvContent += `"${c.clientName}",${c.conversations},${c.messages},${c.leads},"${c.revenue}","${c.spend}","${c.roas}","${c.replyRate}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `whatsapp_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return Promise.resolve(true);
  },

  /**
   * Generate Full Comprehensive Executive WhatsApp Report
   */
  async generateWhatsAppReport(filters = {}) {
    const kpis = await this.getWhatsAppAnalytics(filters);
    const funnel = await this.getConversionFunnelAnalytics(filters);
    const campaigns = await this.getCampaignAnalytics(filters);
    const sources = await this.getSourceAnalytics(filters);
    const insights = await this.getAIInsights(filters);
    const client = clientsState.find((c) => c.id === filters.clientId) || { name: 'All Agency Workspaces' };

    return Promise.resolve({
      reportId: `WA-REP-${Date.now()}`,
      generatedDate: 'Aug 28, 2026',
      clientName: client.name,
      timeframe: filters.timeframe || 'Last 30 Days',
      kpis,
      funnel,
      topCampaigns: campaigns.campaigns.slice(0, 5),
      sources,
      insights,
    });
  },
};

export default whatsappService;
