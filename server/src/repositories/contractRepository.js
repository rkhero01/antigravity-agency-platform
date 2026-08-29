/**
 * Agency Client Contract Repository
 * Task 28 — Step 3: Contract Lifecycle Store
 */

import { BaseRepository } from './baseRepository.js';

export class ContractRepository extends BaseRepository {
  constructor() {
    super('Contract');
    this.seedDefaultContracts();
  }

  seedDefaultContracts() {
    const demoAgencyId = 'agency-demo-001';
    const contracts = [
      {
        id: 'cnt-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        contractNumber: 'AGY-2026-APX-01',
        title: 'Apex Fitness Enterprise Growth Retainer',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        value: 300000,
        billingCycle: 'MONTHLY',
        status: 'ACTIVE',
        renewalDate: new Date('2026-12-01'),
        notes: 'Includes full SEO, Paid Media, and WhatsApp Automation SLA.',
      },
      {
        id: 'cnt-102',
        agencyId: demoAgencyId,
        clientId: 'c2',
        contractNumber: 'AGY-2026-VRD-02',
        title: 'Verde Organics Performance Marketing Agreement',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-08-31'),
        value: 180000,
        billingCycle: 'MONTHLY',
        status: 'ACTIVE',
        renewalDate: new Date('2026-08-01'),
        notes: 'Includes 5% revenue-share upside on Meta Ads over ₹1M spend.',
      },
      {
        id: 'cnt-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        contractNumber: 'NXS-2026-ISO-99',
        title: 'Isolated Tenant Agreement',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        value: 900000,
        billingCycle: 'YEARLY',
        status: 'ACTIVE',
      },
    ];

    for (const c of contracts) {
      this.inMemoryStore.set(c.id, {
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  async findByContractNumber(contractNumber, agencyId = null) {
    const items = Array.from(this.inMemoryStore.values());
    const c = items.find((item) => item.contractNumber === contractNumber && !item.deletedAt);
    if (!c) return null;
    if (agencyId && c.agencyId !== agencyId) return null;
    return JSON.parse(JSON.stringify(c));
  }
}

export const contractRepository = new ContractRepository();
export default contractRepository;
