/**
 * Production CRM & Lead Management Service Layer
 * Task 7: Database-Connected Multi-Tenant CRM Lead Pipeline
 */

import { apiClient } from './api/apiClient.js';

export const CRM_STAGES = [
  { value: 'NEW', label: 'New Inbound Lead', color: '#6366f1', badgeVariant: 'primary' },
  { value: 'CONTACTED', label: 'Contacted / Discovery', color: '#06b6d4', badgeVariant: 'info' },
  { value: 'QUALIFIED', label: 'Sales Qualified (SQL)', color: '#3b82f6', badgeVariant: 'secondary' },
  { value: 'PROPOSAL_SENT', label: 'Proposal / Offer Sent', color: '#f59e0b', badgeVariant: 'warning' },
  { value: 'WON', label: 'Closed & Won Deal', color: '#10b981', badgeVariant: 'success' },
  { value: 'LOST', label: 'Disqualified / Lost', color: '#ef4444', badgeVariant: 'danger' },
];

export const CRM_SOURCES = [
  { value: 'DIRECT', label: 'Direct / Organic Inbound' },
  { value: 'META_ADS', label: 'Meta Ads (FB & IG)' },
  { value: 'GOOGLE_SEARCH', label: 'Google Search Ads' },
  { value: 'ORGANIC_SEARCH', label: 'SEO & Organic Search' },
  { value: 'WHATSAPP', label: 'WhatsApp Inbound' },
  { value: 'LINKEDIN', label: 'LinkedIn Outreach' },
  { value: 'REFERRAL', label: 'Client Referral' },
  { value: 'OTHER', label: 'Other Channel' },
];

/**
 * Normalizes PostgreSQL Lead record into UI model
 */
export function normalizeLead(dbRecord) {
  if (!dbRecord) return null;

  const rawStage = (dbRecord.stage || 'NEW').toUpperCase();
  const stageInfo = CRM_STAGES.find((s) => s.value === rawStage) || CRM_STAGES[0];

  const val = Number(dbRecord.value) || 0;
  const score = parseInt(dbRecord.score, 10) || 50;

  return {
    id: dbRecord.id,
    agencyId: dbRecord.agencyId,
    clientId: dbRecord.clientId,
    clientName: dbRecord.clientName || 'Assigned Client',
    campaignId: dbRecord.campaignId || null,
    campaignName: dbRecord.campaignName || null,
    name: dbRecord.name || 'Unnamed Lead',
    company: dbRecord.company || 'Private Account',
    email: dbRecord.email || 'Not provided',
    phone: dbRecord.phone || 'Not provided',
    source: (dbRecord.source || 'DIRECT').toUpperCase(),
    stage: rawStage,
    status: stageInfo.label,
    statusVariant: stageInfo.badgeVariant,
    score,
    value: val,
    dealValue: `$${val.toLocaleString()}`,
    owner: dbRecord.owner || 'Unassigned',
    assignedTo: dbRecord.owner || 'Unassigned',
    statusRaw: dbRecord.status || 'ACTIVE',
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  };
}

/**
 * Maps form input to backend payload
 */
export function toDbLeadPayload(formData = {}) {
  return {
    clientId: formData.clientId,
    campaignId: formData.campaignId || null,
    name: String(formData.name || '').trim(),
    company: formData.company ? String(formData.company).trim() : null,
    email: formData.email ? String(formData.email).trim().toLowerCase() : null,
    phone: formData.phone ? String(formData.phone).trim() : null,
    source: (formData.source || 'DIRECT').toUpperCase(),
    stage: (formData.stage || formData.status || 'NEW').toUpperCase(),
    score: formData.score !== undefined ? parseInt(formData.score, 10) : 50,
    value: formData.value !== undefined ? Number(formData.value) : 0,
    owner: formData.owner || formData.assignedTo || null,
  };
}

export const crmService = {
  /**
   * Fetch all leads from live API
   */
  async getLeads(filters = {}) {
    const params = {};
    if (filters.clientId && filters.clientId !== 'all') params.clientId = filters.clientId;
    if (filters.campaignId && filters.campaignId !== 'all') params.campaignId = filters.campaignId;
    if (filters.stage && filters.stage !== 'all') params.stage = filters.stage;
    if (filters.status && filters.status !== 'all') params.stage = filters.status;
    if (filters.source && filters.source !== 'all') params.source = filters.source;
    if (filters.owner && filters.owner !== 'all') params.owner = filters.owner;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    const response = await apiClient.leads.list(params);
    const rawList = Array.isArray(response.data?.leads)
      ? response.data.leads
      : Array.isArray(response.data)
      ? response.data
      : [];

    return rawList.map(normalizeLead);
  },

  /**
   * Get single lead by ID
   */
  async getLeadById(id) {
    if (!id) return null;
    const response = await apiClient.leads.get(id);
    const raw = response.data?.lead || response.data;
    return normalizeLead(raw);
  },

  /**
   * Create a new lead
   */
  async createLead(data) {
    const payload = toDbLeadPayload(data);
    const response = await apiClient.leads.create(payload);
    const raw = response.data?.lead || response.data;
    return normalizeLead(raw);
  },

  /**
   * Update lead fields
   */
  async updateLead(id, updates) {
    if (!id) throw new Error('Lead ID is required');
    const payload = toDbLeadPayload(updates);
    const response = await apiClient.leads.update(id, payload);
    const raw = response.data?.lead || response.data;
    return normalizeLead(raw);
  },

  /**
   * Update lead stage/status specifically
   */
  async updateLeadStatus(id, newStatus) {
    return await this.updateLead(id, { stage: newStatus });
  },

  /**
   * Archive / soft-delete lead
   */
  async deleteLead(id) {
    if (!id) throw new Error('Lead ID is required');
    const response = await apiClient.leads.delete(id);
    return response.data;
  },

  /**
   * Calculate live CRM overview KPIs from database records
   */
  async getCRMOverview(clientId = 'all') {
    const leads = await this.getLeads(clientId === 'all' ? {} : { clientId });

    const total = leads.length;
    const newLeads = leads.filter((l) => l.stage === 'NEW').length;
    const qualified = leads.filter((l) => l.stage === 'QUALIFIED' || l.stage === 'PROPOSAL_SENT').length;
    const won = leads.filter((l) => l.stage === 'WON');
    const wonCount = won.length;
    const wonRev = won.reduce((acc, l) => acc + (l.value || 0), 0);
    const pipeVal = leads
      .filter((l) => l.stage !== 'WON' && l.stage !== 'LOST')
      .reduce((acc, l) => acc + (l.value || 0), 0);

    const conversionRate = total > 0 ? ((wonCount / total) * 100).toFixed(1) : '0.0';

    return {
      totalLeads: `${total}`,
      totalLeadsMoM: `${total} Total Pipeline Records`,
      newLeadsToday: `${newLeads} Leads`,
      newLeadsMoM: `${newLeads} Awaiting First Touch`,
      qualifiedLeads: `${qualified} Leads`,
      qualifiedMoM: `${total > 0 ? ((qualified / total) * 100).toFixed(1) : 0}% Qualification Rate`,
      wonLeads: `${wonCount} Deals`,
      wonLeadsMoM: `${wonCount} Closed Won`,
      conversionRate: `${conversionRate}%`,
      conversionMoM: `${conversionRate}% Conversion Rate`,
      pipelineValue: `$${pipeVal.toLocaleString()}`,
      pipelineMoM: `$${pipeVal.toLocaleString()} Active Pipeline`,
      revenueWon: `$${wonRev.toLocaleString()}`,
      revenueMoM: `$${wonRev.toLocaleString()} Won Revenue`,
    };
  },

  /**
   * Calculate KPI metrics map
   */
  calculateLeadKPIs(leadsList = []) {
    const total = leadsList.length;
    const newLeads = leadsList.filter((l) => l.stage === 'NEW').length;
    const qualified = leadsList.filter((l) => l.stage === 'QUALIFIED' || l.stage === 'PROPOSAL_SENT').length;
    const won = leadsList.filter((l) => l.stage === 'WON');
    const wonCount = won.length;
    const lost = leadsList.filter((l) => l.stage === 'LOST').length;

    const wonRevenue = won.reduce((acc, l) => acc + (l.value || 0), 0);
    const pipelineValue = leadsList
      .filter((l) => l.stage !== 'WON' && l.stage !== 'LOST')
      .reduce((acc, l) => acc + (l.value || 0), 0);

    const conversionRate = total > 0 ? ((wonCount / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      newLeads,
      qualified,
      won: wonCount,
      lost,
      pipelineValue,
      wonRevenue,
      conversionRate: `${conversionRate}%`,
    };
  },
};

export const leadsService = crmService;
export default crmService;
