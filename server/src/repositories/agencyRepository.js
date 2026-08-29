/**
 * Agency Repository
 * Task 28 — Step 1: Multi-Tenant Agency Repository
 */

import { BaseRepository } from './baseRepository.js';

export class AgencyRepository extends BaseRepository {
  constructor() {
    super('Agency');
    this.seedDefaultAgencies();
  }

  seedDefaultAgencies() {
    const defaultAgencies = [
      {
        id: 'agency-demo-001',
        name: 'Antigravity Agency Global',
        domain: 'antigravity.agency',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
      },
      {
        id: 'agency-demo-002',
        name: 'Nexus Growth Partners (Isolated Tenant)',
        domain: 'nexusgrowth.com',
        plan: 'PRO',
        status: 'ACTIVE',
      },
    ];

    for (const a of defaultAgencies) {
      this.inMemoryStore.set(a.id, {
        ...a,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }
}

export const agencyRepository = new AgencyRepository();
export default agencyRepository;
