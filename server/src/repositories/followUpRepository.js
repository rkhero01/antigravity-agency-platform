/**
 * Scheduled Follow-Up Repository
 * Task 28 — Step 3: Follow-Up State & Schedule Store
 */

import { BaseRepository } from './baseRepository.js';

export class FollowUpRepository extends BaseRepository {
  constructor() {
    super('FollowUp');
    this.seedDefaultFollowUps();
  }

  seedDefaultFollowUps() {
    const demoAgencyId = 'agency-demo-001';
    const followUps = [
      {
        id: 'flw-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        leadId: 'lead-1',
        contactId: 'contact-1',
        conversationId: 'conv-101',
        assignedTo: 'Diya Patel',
        contactPhone: '+91 98765 43210',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        note: 'Follow up regarding customized corporate fitness pricing tier.',
        channel: 'WHATSAPP',
        status: 'PENDING',
        priority: 'HIGH',
      },
      {
        id: 'flw-102',
        agencyId: demoAgencyId,
        clientId: 'c2',
        leadId: 'lead-3',
        contactId: 'contact-2',
        assignedTo: 'Rohan Gupta',
        contactPhone: '+91 98765 43211',
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        note: 'Confirm wholesale sample delivery reception.',
        channel: 'CALL',
        status: 'PENDING',
        priority: 'MEDIUM',
      },
      {
        id: 'flw-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        assignedTo: 'Isolated Operator',
        scheduledAt: new Date(),
        note: 'Confidential follow up',
        channel: 'EMAIL',
        status: 'PENDING',
        priority: 'HIGH',
      },
    ];

    for (const f of followUps) {
      this.inMemoryStore.set(f.id, {
        ...f,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }
}

export const followUpRepository = new FollowUpRepository();
export default followUpRepository;
