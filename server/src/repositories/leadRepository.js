/**
 * Lead Repository with Multi-Tenant Scoping & Client/Campaign Enrichment
 * Task 7: CRM Lead CRUD & Multi-Tenant Pipeline
 */

import { BaseRepository } from './baseRepository.js';
import { clientRepository } from './clientRepository.js';
import { campaignRepository } from './campaignRepository.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors.js';

export const ALLOWED_STAGES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'WON',
  'LOST',
];

export const ALLOWED_SOURCES = [
  'DIRECT',
  'META_ADS',
  'GOOGLE_SEARCH',
  'ORGANIC_SEARCH',
  'WHATSAPP',
  'LINKEDIN',
  'REFERRAL',
  'OTHER',
];

export class LeadRepository extends BaseRepository {
  constructor() {
    super('Lead');
  }

  /**
   * List all leads for an agency with optional filters
   */
  async list(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    const { clientId, campaignId, stage, source, owner, search } = filters;
    const all = await this.findMany({ agencyId });

    let filtered = all.filter((l) => !l.deletedAt);

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((l) => l.clientId === clientId);
    }

    if (campaignId && campaignId !== 'all') {
      filtered = filtered.filter((l) => l.campaignId === campaignId);
    }

    if (stage && stage !== 'all') {
      const stageUpper = stage.toUpperCase();
      filtered = filtered.filter((l) => (l.stage || '').toUpperCase() === stageUpper);
    }

    if (source && source !== 'all') {
      const sourceUpper = source.toUpperCase();
      filtered = filtered.filter((l) => (l.source || '').toUpperCase() === sourceUpper);
    }

    if (owner && owner !== 'all') {
      const ownerLower = owner.toLowerCase().trim();
      filtered = filtered.filter((l) => (l.owner || '').toLowerCase().includes(ownerLower));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((l) => {
        const name = (l.name || '').toLowerCase();
        const company = (l.company || '').toLowerCase();
        const email = (l.email || '').toLowerCase();
        const phone = (l.phone || '').toLowerCase();
        return name.includes(q) || company.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    // Attach client details
    const clients = await clientRepository.findMany({ agencyId });
    const clientMap = new Map(clients.map((c) => [c.id, c.clientName]));

    // Attach campaign details
    const campaigns = await campaignRepository.findMany({ agencyId });
    const campaignMap = new Map(campaigns.map((camp) => [camp.id, camp.name]));

    return filtered.map((l) => ({
      ...l,
      clientName: clientMap.get(l.clientId) || 'Assigned Client',
      campaignName: l.campaignId ? campaignMap.get(l.campaignId) || null : null,
    }));
  }

  /**
   * Find single lead scoped to agency
   */
  async findById(id, agencyId = null) {
    if (!id) return null;
    const lead = await super.findById(id, agencyId);
    if (!lead || lead.deletedAt) return null;

    if (agencyId) {
      if (lead.clientId) {
        const client = await clientRepository.findById(lead.clientId, agencyId);
        lead.clientName = client?.clientName || 'Assigned Client';
      }
      if (lead.campaignId) {
        const campaign = await campaignRepository.findById(lead.campaignId, agencyId);
        lead.campaignName = campaign?.name || null;
      }
    }

    return lead;
  }

  /**
   * Create lead with tenant validation
   */
  async create(data, agencyId) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      throw new ValidationError('Lead name is required (min 2 characters).');
    }

    if (!data.clientId) {
      throw new ValidationError('Client association (clientId) is required.');
    }

    // Verify client belongs to authenticated agency
    const client = await clientRepository.findById(data.clientId, agencyId);
    if (!client) {
      throw new NotFoundError(`Client "${data.clientId}" not found in this agency.`);
    }

    // Verify campaign belongs to authenticated agency if provided
    if (data.campaignId) {
      const campaign = await campaignRepository.findById(data.campaignId, agencyId);
      if (!campaign) {
        throw new NotFoundError(`Campaign "${data.campaignId}" not found in this agency.`);
      }
    }

    const stage = data.stage && ALLOWED_STAGES.includes(data.stage.toUpperCase())
      ? data.stage.toUpperCase()
      : 'NEW';

    const source = data.source ? String(data.source).trim().toUpperCase() : 'DIRECT';

    const payload = {
      agencyId,
      clientId: data.clientId,
      campaignId: data.campaignId || null,
      name: data.name.trim(),
      company: data.company ? String(data.company).trim() : null,
      email: data.email ? String(data.email).trim().toLowerCase() : null,
      phone: data.phone ? String(data.phone).trim() : null,
      source,
      stage,
      score: data.score !== undefined ? Math.max(0, Math.min(100, parseInt(data.score, 10) || 50)) : 50,
      value: data.value !== undefined ? Math.max(0, Number(data.value) || 0) : 0,
      owner: data.owner ? String(data.owner).trim() : null,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const created = await super.create(payload, agencyId);
    created.clientName = client.clientName;
    return created;
  }

  /**
   * Update lead fields
   */
  async update(id, updates, agencyId) {
    if (!id || !agencyId) throw new ValidationError('Lead ID and agency ID are required');

    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Lead "${id}" not found.`);
    }

    const safeUpdates = {};

    if (updates.name !== undefined) {
      const name = String(updates.name).trim();
      if (name.length < 2) throw new ValidationError('Lead name must be at least 2 characters.');
      safeUpdates.name = name;
    }

    if (updates.company !== undefined) {
      safeUpdates.company = updates.company ? String(updates.company).trim() : null;
    }

    if (updates.email !== undefined) {
      safeUpdates.email = updates.email ? String(updates.email).trim().toLowerCase() : null;
    }

    if (updates.phone !== undefined) {
      safeUpdates.phone = updates.phone ? String(updates.phone).trim() : null;
    }

    if (updates.source !== undefined) {
      safeUpdates.source = String(updates.source).trim().toUpperCase();
    }

    if (updates.stage !== undefined) {
      const stageUpper = updates.stage.toUpperCase();
      if (!ALLOWED_STAGES.includes(stageUpper)) {
        throw new ValidationError(`Invalid stage "${updates.stage}". Supported: ${ALLOWED_STAGES.join(', ')}`);
      }
      safeUpdates.stage = stageUpper;
    }

    if (updates.score !== undefined) {
      safeUpdates.score = Math.max(0, Math.min(100, parseInt(updates.score, 10) || 50));
    }

    if (updates.value !== undefined) {
      safeUpdates.value = Math.max(0, Number(updates.value) || 0);
    }

    if (updates.owner !== undefined) {
      safeUpdates.owner = updates.owner ? String(updates.owner).trim() : null;
    }

    if (updates.clientId !== undefined) {
      const client = await clientRepository.findById(updates.clientId, agencyId);
      if (!client) throw new NotFoundError(`Client "${updates.clientId}" not found.`);
      safeUpdates.clientId = updates.clientId;
    }

    if (updates.campaignId !== undefined) {
      if (updates.campaignId) {
        const campaign = await campaignRepository.findById(updates.campaignId, agencyId);
        if (!campaign) throw new NotFoundError(`Campaign "${updates.campaignId}" not found.`);
        safeUpdates.campaignId = updates.campaignId;
      } else {
        safeUpdates.campaignId = null;
      }
    }

    if (updates.status !== undefined) {
      safeUpdates.status = ['ACTIVE', 'ARCHIVED'].includes(updates.status.toUpperCase())
        ? updates.status.toUpperCase()
        : 'ACTIVE';
    }

    return await super.update(id, safeUpdates, agencyId);
  }

  /**
   * Archive / soft delete lead
   */
  async archive(id, agencyId) {
    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Lead "${id}" not found.`);
    }

    return await super.update(
      id,
      {
        status: 'ARCHIVED',
        deletedAt: new Date(),
      },
      agencyId
    );
  }
}

export const leadRepository = new LeadRepository();
export default leadRepository;
