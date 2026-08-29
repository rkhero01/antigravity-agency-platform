/**
 * WhatsApp Template Repository
 * Task 28 — Step 3: WhatsApp Pre-approved Template Store
 */

import { BaseRepository } from './baseRepository.js';

export class WhatsAppTemplateRepository extends BaseRepository {
  constructor() {
    super('WhatsAppTemplate');
    this.seedDefaultTemplates();
  }

  seedDefaultTemplates() {
    const demoAgencyId = 'agency-demo-001';
    const templates = [
      {
        id: 'tmpl-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        name: 'welcome_apex_membership_v1',
        category: 'MARKETING',
        language: 'en',
        body: 'Hello {{1}}, welcome to {{2}}! Your personalized fitness coach {{3}} is ready to design your workout plan. Reply 1 to begin.',
        variables: '["customer_name", "club_name", "coach_name"]',
        status: 'APPROVED',
      },
      {
        id: 'tmpl-102',
        agencyId: demoAgencyId,
        clientId: 'c2',
        name: 'order_status_update_v1',
        category: 'UTILITY',
        language: 'en',
        body: 'Hi {{1}}, your order #{{2}} from {{3}} has been dispatched! Track your fresh delivery here: {{4}}',
        variables: '["customer_name", "order_id", "brand_name", "tracking_link"]',
        status: 'APPROVED',
      },
      {
        id: 'tmpl-103',
        agencyId: demoAgencyId,
        clientId: 'c3',
        name: 'saas_trial_activation_otp',
        category: 'AUTHENTICATION',
        language: 'en',
        body: 'Your NovaTech Cloud security code is {{1}}. Valid for 10 minutes. Do not share this code.',
        variables: '["otp_code"]',
        status: 'APPROVED',
      },
      {
        id: 'tmpl-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        name: 'isolated_secret_template',
        category: 'MARKETING',
        language: 'en',
        body: 'Confidential message {{1}}',
        variables: '["token"]',
        status: 'APPROVED',
      },
    ];

    for (const t of templates) {
      this.inMemoryStore.set(t.id, {
        ...t,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }
}

export const whatsappTemplateRepository = new WhatsAppTemplateRepository();
export default whatsappTemplateRepository;
