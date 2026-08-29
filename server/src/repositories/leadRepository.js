/**
 * Lead Repository with Client & Agency Scoping
 * Task 28 — Step 2: CRM Lead CRUD & Multi-Tenant Pipeline
 */

import { BaseRepository } from './baseRepository.js';

export class LeadRepository extends BaseRepository {
  constructor() {
    super('Lead');
    this.seedDefaultLeads();
  }

  seedDefaultLeads() {
    const demoAgencyId = 'agency-demo-001';
    const leads = [
      {
        id: 'lead-1',
        agencyId: demoAgencyId,
        clientId: 'c1',
        name: 'Karan Mehra',
        company: 'Gold Fit Gyms',
        email: 'karan@goldfit.in',
        phone: '+91 98111 22334',
        source: 'META_ADS',
        stage: 'QUALIFIED',
        owner: 'Diya Patel',
        value: 120000,
        status: 'ACTIVE',
      },
      {
        id: 'lead-2',
        agencyId: demoAgencyId,
        clientId: 'c1',
        name: 'Siddharth Rao',
        company: 'Pulse Fitness',
        email: 'sid@pulsefitness.com',
        phone: '+91 98222 33445',
        source: 'WHATSAPP',
        stage: 'PROPOSAL_SENT',
        owner: 'Diya Patel',
        value: 85000,
        status: 'ACTIVE',
      },
      {
        id: 'lead-3',
        agencyId: demoAgencyId,
        clientId: 'c2',
        name: 'Anita Desai',
        company: 'Green Pantry D2C',
        email: 'anita@greenpantry.com',
        phone: '+91 98333 44556',
        source: 'ORGANIC_SEARCH',
        stage: 'NEW',
        owner: 'Rohan Gupta',
        value: 45000,
        status: 'ACTIVE',
      },
      {
        id: 'lead-4',
        agencyId: demoAgencyId,
        clientId: 'c3',
        name: 'Deepak Varma',
        company: 'CloudScale Systems',
        email: 'deepak@cloudscale.io',
        phone: '+91 98444 55667',
        source: 'GOOGLE_SEARCH',
        stage: 'WON',
        owner: 'Aarav Sharma',
        value: 350000,
        status: 'ACTIVE',
      },
      {
        id: 'lead-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        name: 'Secret Lead',
        company: 'Nexus Target',
        email: 'secret@nexustarget.com',
        phone: '+91 99999 00000',
        source: 'DIRECT',
        stage: 'QUALIFIED',
        owner: 'Isolated Agent',
        value: 500000,
        status: 'ACTIVE',
      },
    ];

    for (const l of leads) {
      this.inMemoryStore.set(l.id, {
        ...l,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  async findByClientId(clientId, agencyId = null) {
    const items = await this.findMany({ clientId }, agencyId);
    return items;
  }
}

export const leadRepository = new LeadRepository();
export default leadRepository;
