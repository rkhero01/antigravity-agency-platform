import {
  initialMockCRMOverview,
  initialMockLeads,
  initialMockFollowUps,
  initialMockActivities,
  initialMockSources,
} from '../data/mockCRM.js';
import { mockClients } from '../data/mockClients.js';

let leadsState = JSON.parse(JSON.stringify(initialMockLeads));
let followUpsState = JSON.parse(JSON.stringify(initialMockFollowUps));
let activitiesState = JSON.parse(JSON.stringify(initialMockActivities));
let sourcesState = JSON.parse(JSON.stringify(initialMockSources));

export const crmService = {
  /**
   * Get CRM Overview KPI metrics
   */
  async getCRMOverview(clientId = 'all') {
    if (clientId === 'all') {
      const won = leadsState.filter((l) => l.status === 'Won');
      const wonRev = won.reduce((acc, l) => acc + (l.value || 0), 0);
      const pipeVal = leadsState
        .filter((l) => l.status !== 'Won' && l.status !== 'Lost')
        .reduce((acc, l) => acc + (l.value || 0), 0);

      return Promise.resolve({
        totalLeads: `${leadsState.length}`,
        totalLeadsMoM: '+24.5% vs Last Mo',
        newLeadsToday: `${leadsState.filter((l) => l.status === 'New Lead').length} Leads`,
        newLeadsMoM: '+12 Inbound Today',
        qualifiedLeads: `${leadsState.filter((l) => l.status === 'Qualified' || l.status === 'Proposal / Offer').length} Leads`,
        qualifiedMoM: '48.2% Qualification Rate',
        followUpsDue: `${followUpsState.filter((f) => f.statusCategory === 'Due Today').length} Due Today`,
        followUpsMoM: '2 Overdue Priority',
        wonLeads: `${won.length} Deals`,
        wonLeadsMoM: '+34 Deals Won',
        conversionRate: '16.8%',
        conversionMoM: '+3.2% Conversion Lift',
        pipelineValue: `$${pipeVal.toLocaleString()}`,
        pipelineMoM: '+18.2% Active Pipeline',
        revenueWon: `$${wonRev.toLocaleString()}`,
        revenueMoM: '+$148,000 Won Revenue',
      });
    }

    const clientLeads = leadsState.filter((l) => l.clientId === clientId);
    const clientWon = clientLeads.filter((l) => l.status === 'Won');
    const wonRev = clientWon.reduce((acc, l) => acc + (l.value || 0), 0);
    const pipeVal = clientLeads
      .filter((l) => l.status !== 'Won' && l.status !== 'Lost')
      .reduce((acc, l) => acc + (l.value || 0), 0);

    return Promise.resolve({
      totalLeads: `${clientLeads.length}`,
      totalLeadsMoM: '+18.2% MoM',
      newLeadsToday: `${clientLeads.filter((l) => l.status === 'New Lead').length} Leads`,
      newLeadsMoM: '+4 Today',
      qualifiedLeads: `${clientLeads.filter((l) => l.status === 'Qualified').length} Leads`,
      qualifiedMoM: '44.5% Qual Rate',
      followUpsDue: `${followUpsState.filter((f) => f.clientId === clientId).length} Due`,
      followUpsMoM: 'All Active',
      wonLeads: `${clientWon.length} Deals`,
      wonLeadsMoM: '+8 Closed Won',
      conversionRate: '15.4%',
      conversionMoM: '+2.1% Lift',
      pipelineValue: `$${pipeVal.toLocaleString()}`,
      pipelineMoM: 'High Intent',
      revenueWon: `$${wonRev.toLocaleString()}`,
      revenueMoM: '+$42,000 Won',
    });
  },

  /**
   * Get Leads with multi-filtering
   */
  async getLeads(filters = {}) {
    const {
      clientId = 'all',
      source = 'all',
      status = 'all',
      staff = 'all',
      priority = 'all',
      search = '',
    } = filters;

    let filtered = [...leadsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((l) => l.clientId === clientId);
    }

    if (source && source !== 'all') {
      filtered = filtered.filter((l) => l.source.toLowerCase() === source.toLowerCase());
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((l) => l.status.toLowerCase() === status.toLowerCase());
    }

    if (staff && staff !== 'all') {
      filtered = filtered.filter((l) => l.assignedStaff.toLowerCase() === staff.toLowerCase());
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter((l) => l.priority.toLowerCase() === priority.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.clientName.toLowerCase().includes(q) ||
          l.campaign.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Add a new lead
   */
  async addLead(leadData) {
    const client = mockClients.find((c) => c.id === leadData.clientId) || mockClients[0];
    const score = this.calculateLeadScore(leadData);

    const newLead = {
      id: `lead-${Date.now()}`,
      name: leadData.name,
      company: leadData.company || `${leadData.name} Co`,
      phone: leadData.phone || '+1 (512) 555-0199',
      email: leadData.email,
      source: leadData.source || 'Website',
      campaign: leadData.campaign || `${client.name} Inbound Acquisition`,
      clientId: client.id,
      clientName: client.name,
      status: leadData.status || 'New Lead',
      leadScore: score.score,
      scoreCategory: score.category,
      scoreReasons: score.reasons,
      assignedStaff: leadData.assignedStaff || 'Elena Rostova',
      lastActivity: 'Lead created in CRM (Just now)',
      nextFollowUp: leadData.nextFollowUp || 'Tomorrow at 10:00 AM',
      value: parseInt(leadData.value || '5000', 10),
      priority: leadData.priority || (score.score >= 80 ? 'High' : 'Medium'),
      createdDate: 'Today',
      notes: leadData.notes || 'Inbound prospect captured.',
    };

    leadsState = [newLead, ...leadsState];

    // Log Activity
    activitiesState.unshift({
      id: `act-${Date.now()}`,
      leadId: newLead.id,
      leadName: newLead.name,
      type: 'Lead Captured',
      icon: 'UserPlus',
      staff: newLead.assignedStaff,
      timestamp: 'Just now',
      details: `Lead ${newLead.name} (${newLead.company}) added to ${newLead.status}.`,
    });

    return Promise.resolve(newLead);
  },

  /**
   * Update lead details
   */
  async updateLead(id, updates) {
    leadsState = leadsState.map((l) => (l.id === id ? { ...l, ...updates } : l));
    return Promise.resolve(true);
  },

  /**
   * Delete lead
   */
  async deleteLead(id) {
    leadsState = leadsState.filter((l) => l.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Reassign lead staff
   */
  async assignLead(id, staffName) {
    leadsState = leadsState.map((l) => {
      if (l.id === id) {
        activitiesState.unshift({
          id: `act-${Date.now()}`,
          leadId: l.id,
          leadName: l.name,
          type: 'Staff Assigned',
          icon: 'UserCheck',
          staff: staffName,
          timestamp: 'Just now',
          details: `Reassigned lead to ${staffName}.`,
        });
        return { ...l, assignedStaff: staffName };
      }
      return l;
    });
    return Promise.resolve(true);
  },

  /**
   * Update lead stage/status (e.g. Kanban Drag & Drop)
   */
  async updateLeadStatus(id, newStatus) {
    leadsState = leadsState.map((l) => {
      if (l.id === id) {
        activitiesState.unshift({
          id: `act-${Date.now()}`,
          leadId: l.id,
          leadName: l.name,
          type: 'Status Change',
          icon: 'RefreshCw',
          staff: l.assignedStaff,
          timestamp: 'Just now',
          details: `Moved ${l.name} from "${l.status}" → "${newStatus}".`,
        });
        return {
          ...l,
          status: newStatus,
          lastActivity: `Moved to ${newStatus} (Just now)`,
        };
      }
      return l;
    });
    return Promise.resolve(true);
  },

  /**
   * Get single lead details
   */
  async getLeadDetails(id) {
    const lead = leadsState.find((l) => l.id === id) || leadsState[0];
    return Promise.resolve(lead);
  },

  /**
   * AI-based Lead Scoring Calculator
   */
  calculateLeadScore(leadData) {
    let score = 50;
    const reasons = [];

    if (leadData.source === 'Google Ads' || leadData.source === 'WhatsApp') {
      score += 15;
      reasons.push('High intent inbound acquisition channel');
    }
    if (parseInt(leadData.value || '0', 10) >= 10000) {
      score += 20;
      reasons.push('High enterprise contract potential (> $10,000)');
    }
    if (leadData.priority === 'High') {
      score += 10;
      reasons.push('High urgency priority assigned by account executive');
    }
    if (leadData.email && !leadData.email.includes('gmail.com') && !leadData.email.includes('yahoo.com')) {
      score += 10;
      reasons.push('Corporate business domain email provided');
    }

    const finalScore = Math.min(99, Math.max(25, score));
    const category = finalScore >= 90 ? 'VIP' : finalScore >= 80 ? 'Hot' : finalScore >= 60 ? 'Warm' : 'Cold';

    return {
      score: finalScore,
      category,
      reasons: reasons.length ? reasons : ['Standard marketing campaign engagement'],
    };
  },

  /**
   * Get follow-ups
   */
  async getFollowUps(clientId = 'all') {
    let filtered = [...followUpsState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((f) => f.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Mark follow-up complete
   */
  async completeFollowUp(id) {
    followUpsState = followUpsState.filter((f) => f.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Reschedule follow-up
   */
  async rescheduleFollowUp(id, newDate) {
    followUpsState = followUpsState.map((f) =>
      f.id === id ? { ...f, dateTime: newDate, statusCategory: 'Upcoming' } : f
    );
    return Promise.resolve(true);
  },

  /**
   * Get activity timeline
   */
  async getActivities(clientId = 'all') {
    return Promise.resolve(activitiesState);
  },

  /**
   * Get source attribution analytics
   */
  async getSourceAnalytics(clientId = 'all') {
    return Promise.resolve(sourcesState);
  },

  /**
   * AI Sales Assistant & Lead Quality Synthesizer
   */
  async generateAILeadAnalysis(lead) {
    return Promise.resolve({
      leadName: lead.name,
      company: lead.company,
      leadQuality: lead.leadScore >= 80 ? 'Exceptional (Tier 1 High-Value Lead)' : 'Moderate (Standard Commercial Opportunity)',
      buyingIntent: `${lead.leadScore}% High Probability Intent`,
      recommendedAction: `Schedule a 20-minute executive discovery call focusing on ${lead.clientName} premium tier benefits.`,
      suggestedResponse: `Hi ${lead.name}, thanks for reaching out regarding ${lead.clientName}. I'd love to share our private executive walkthrough and tailor our proposal specifically for ${lead.company}. Are you open for a quick 10-minute sync tomorrow at 10 AM?`,
      objectionPreventions: [
        'Emphasize guaranteed SLA and priority VIP scheduling.',
        'Offer flexible quarterly invoicing with upfront annual incentive.',
      ],
      closingStrategy: 'Introduce limited-quantity VIP pass allocation to create positive purchasing momentum.',
      probabilityOfConversion: `${Math.min(95, lead.leadScore + 5)}%`,
    });
  },

  /**
   * Bulk CSV Lead Importer Simulation
   */
  async importLeads(rawLeads) {
    const createdList = rawLeads.map((item, idx) => ({
      id: `lead-imp-${Date.now()}-${idx}`,
      name: item.name || `Imported Contact ${idx + 1}`,
      company: item.company || 'Corporate Client',
      phone: item.phone || '+1 (512) 555-0199',
      email: item.email || `contact${idx}@imported.com`,
      source: item.source || 'Website',
      campaign: 'CSV Batch Ingestion',
      clientId: item.clientId || 'c1',
      clientName: 'Apex Fitness Club',
      status: 'New Lead',
      leadScore: 75,
      scoreCategory: 'Warm',
      scoreReasons: ['Batch imported from external CSV list'],
      assignedStaff: 'Elena Rostova',
      lastActivity: 'Imported via CSV (Just now)',
      nextFollowUp: 'Tomorrow at 09:00 AM',
      value: 4500,
      priority: 'Medium',
      createdDate: 'Today',
      notes: 'Imported lead record.',
    }));

    leadsState = [...createdList, ...leadsState];
    return Promise.resolve({
      importedCount: createdList.length,
      skippedDuplicates: 0,
    });
  },

  /**
   * Generate Executive CRM & Pipeline Report
   */
  async generateCRMReport(clientId = 'all', dateRange = 'Last 30 Days') {
    const overview = await this.getCRMOverview(clientId);
    return Promise.resolve({
      title: 'Executive Sales CRM & Pipeline Performance Audit',
      dateRange,
      overview,
      highlights: [
        'Total active pipeline expanded by +18.2% MoM reaching $1.84M in deal potential.',
        'Meta Ads & WhatsApp channels demonstrated highest conversion velocity (24.6% close rate on WhatsApp).',
        'Lead qualification rate improved to 48.2% supported by automated AI lead scoring.',
        'Sales team logged 140+ client discovery calls and proposals across Q3 growth blitz.',
      ],
    });
  },
};

export default crmService;
