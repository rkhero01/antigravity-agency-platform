/**
 * WhatsApp Automation Sequence Repository
 * Task 28 — Step 3: WhatsApp Automation Store
 */

import { BaseRepository } from './baseRepository.js';

export class WhatsAppAutomationRepository extends BaseRepository {
  constructor() {
    super('WhatsAppAutomation');
    this.seedDefaultAutomations();
  }

  seedDefaultAutomations() {
    const demoAgencyId = 'agency-demo-001';
    const automations = [
      {
        id: 'auto-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        name: 'New Gym Lead Instant Welcome & Coach Match',
        description: 'Auto-replies within 60s when a new fitness lead submits a Meta form.',
        triggerType: 'LEAD_CREATED',
        actionType: 'SEND_TEMPLATE',
        status: 'ACTIVE',
        delayMinutes: 1,
        steps: JSON.stringify([
          { order: 1, action: 'send_template', templateId: 'tmpl-101' },
          { order: 2, action: 'assign_agent', agentId: 'team-3' },
        ]),
      },
      {
        id: 'auto-102',
        agencyId: demoAgencyId,
        clientId: 'c2',
        name: 'D2C Abandoned Checkout Recovery Flow',
        description: 'Sends dynamic cart link 30m post abandonment.',
        triggerType: 'CART_ABANDONED',
        actionType: 'SEND_TEMPLATE',
        status: 'ACTIVE',
        delayMinutes: 30,
        steps: JSON.stringify([
          { order: 1, action: 'send_template', templateId: 'tmpl-102' },
        ]),
      },
      {
        id: 'auto-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        name: 'Isolated Automation',
        triggerType: 'STATUS_CHANGE',
        actionType: 'ADD_TAG',
        status: 'ACTIVE',
      },
    ];

    for (const a of automations) {
      this.inMemoryStore.set(a.id, {
        ...a,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }
}

export const whatsappAutomationRepository = new WhatsAppAutomationRepository();
export default whatsappAutomationRepository;
