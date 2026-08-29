/**
 * Team Member Repository
 * Task 28 — Step 2: Team Member CRUD & Tenant Scoping
 */

import { BaseRepository } from './baseRepository.js';

export class TeamMemberRepository extends BaseRepository {
  constructor() {
    super('TeamMember');
    this.seedDefaultTeam();
  }

  seedDefaultTeam() {
    const demoAgencyId = 'agency-demo-001';
    const team = [
      {
        id: 'team-1',
        agencyId: demoAgencyId,
        name: 'Aarav Sharma',
        email: 'aarav@antigravity.agency',
        role: 'ADMIN',
        department: 'Operations & Paid Media',
        shiftHours: '09:00 - 18:00',
        status: 'ACTIVE',
      },
      {
        id: 'team-2',
        agencyId: demoAgencyId,
        name: 'Diya Patel',
        email: 'diya@antigravity.agency',
        role: 'MANAGER',
        department: 'Client Success & CRM',
        shiftHours: '10:00 - 19:00',
        status: 'ACTIVE',
      },
      {
        id: 'team-3',
        agencyId: demoAgencyId,
        name: 'Rohan Gupta',
        email: 'rohan@antigravity.agency',
        role: 'OPERATOR',
        department: 'WhatsApp & Engagement SLA',
        shiftHours: '13:00 - 22:00',
        status: 'ACTIVE',
      },
      {
        id: 'team-4',
        agencyId: demoAgencyId,
        name: 'Sneha Iyer',
        email: 'sneha@antigravity.agency',
        role: 'ANALYST',
        department: 'SEO & Organic Growth',
        shiftHours: '09:00 - 18:00',
        status: 'ACTIVE',
      },
      {
        id: 'team-isolated-99',
        agencyId: 'agency-demo-002',
        name: 'Isolated Agent',
        email: 'isolated@nexusgrowth.com',
        role: 'OPERATOR',
        department: 'FinTech Growth',
        shiftHours: '09:00 - 18:00',
        status: 'ACTIVE',
      },
    ];

    for (const t of team) {
      this.inMemoryStore.set(t.id, {
        ...t,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }
}

export const teamMemberRepository = new TeamMemberRepository();
export default teamMemberRepository;
