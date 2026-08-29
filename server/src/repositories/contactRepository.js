/**
 * Contact Repository with Client & Agency Scoping
 * Task 28 — Step 2: Client Contacts Data Access Layer
 */

import { BaseRepository } from './baseRepository.js';

export class ContactRepository extends BaseRepository {
  constructor() {
    super('Contact');
    this.seedDefaultContacts();
  }

  seedDefaultContacts() {
    const demoAgencyId = 'agency-demo-001';
    const contacts = [
      {
        id: 'contact-1',
        agencyId: demoAgencyId,
        clientId: 'c1',
        name: 'Rohit Sharma',
        phone: '+91 98765 43210',
        email: 'rohit@apexfitness.com',
        source: 'WEBSITE',
        status: 'ACTIVE',
      },
      {
        id: 'contact-2',
        agencyId: demoAgencyId,
        clientId: 'c2',
        name: 'Priya Nair',
        phone: '+91 98765 43211',
        email: 'priya@verdeorganics.com',
        source: 'INSTAGRAM_DM',
        status: 'ACTIVE',
      },
      {
        id: 'contact-3',
        agencyId: demoAgencyId,
        clientId: 'c3',
        name: 'Ankit Mehta',
        phone: '+91 98765 43212',
        email: 'ankit@novatech.io',
        source: 'LINKEDIN',
        status: 'ACTIVE',
      },
      {
        id: 'contact-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        name: 'Secret Contact',
        phone: '+91 98765 99999',
        email: 'secret@isolated.com',
        source: 'REFERRAL',
        status: 'ACTIVE',
      },
    ];

    for (const c of contacts) {
      this.inMemoryStore.set(c.id, {
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  async findByClientId(clientId, agencyId = null) {
    return this.findMany({ clientId }, agencyId);
  }
}

export const contactRepository = new ContactRepository();
export default contactRepository;
