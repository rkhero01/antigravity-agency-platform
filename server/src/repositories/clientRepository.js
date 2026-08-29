/**
 * Client Repository with Tenant Isolation
 * Task 28 — Step 1: Client Data Access Layer
 */

import { BaseRepository } from './baseRepository.js';

export class ClientRepository extends BaseRepository {
  constructor() {
    super('Client');
    this.seedDefaultClients();
  }

  seedDefaultClients() {
    const clients = [
      {
        id: 'c1',
        agencyId: 'agency-demo-001',
        clientName: 'Apex Fitness Club',
        industry: 'Health & Fitness',
        monthlyRetainer: 25000,
        tier: 'ENTERPRISE',
        healthScore: 92,
        primaryContact: 'Rohit Sharma',
        contactEmail: 'rohit@apexfitness.com',
        status: 'ACTIVE',
      },
      {
        id: 'c2',
        agencyId: 'agency-demo-001',
        clientName: 'Verde Organics',
        industry: 'D2C Sustainable Foods',
        monthlyRetainer: 30000,
        tier: 'GROWTH',
        healthScore: 88,
        primaryContact: 'Priya Nair',
        contactEmail: 'priya@verdeorganics.com',
        status: 'ACTIVE',
      },
      {
        id: 'c3',
        agencyId: 'agency-demo-001',
        clientName: 'NovaTech SaaS',
        industry: 'B2B Cloud Software',
        monthlyRetainer: 45000,
        tier: 'ENTERPRISE',
        healthScore: 95,
        primaryContact: 'Ankit Mehta',
        contactEmail: 'ankit@novatech.io',
        status: 'ACTIVE',
      },
      {
        id: 'c4',
        agencyId: 'agency-demo-001',
        clientName: 'Luminary Legal',
        industry: 'Corporate Law Firm',
        monthlyRetainer: 20000,
        tier: 'STANDARD',
        healthScore: 85,
        primaryContact: 'Sunita Rao',
        contactEmail: 'sunita@luminarylegal.com',
        status: 'ACTIVE',
      },
      {
        id: 'c5',
        agencyId: 'agency-demo-001',
        clientName: 'Bharat Ayurveda',
        industry: 'Wellness & D2C Health',
        monthlyRetainer: 28000,
        tier: 'GROWTH',
        healthScore: 91,
        primaryContact: 'Vikram Joshi',
        contactEmail: 'vikram@bharatayurveda.in',
        status: 'ACTIVE',
      },
      {
        id: 'c6',
        agencyId: 'agency-demo-001',
        clientName: 'Zeta Coffee',
        industry: 'Artisanal Beverage Chain',
        monthlyRetainer: 18000,
        tier: 'STANDARD',
        healthScore: 84,
        primaryContact: 'Neha Verma',
        contactEmail: 'neha@zetacoffee.com',
        status: 'ACTIVE',
      },
      {
        id: 'c7',
        agencyId: 'agency-demo-001',
        clientName: 'Aetheria Cloud',
        industry: 'Enterprise DevOps Infrastructure',
        monthlyRetainer: 50000,
        tier: 'ENTERPRISE',
        healthScore: 96,
        primaryContact: 'Kavita Menon',
        contactEmail: 'kavita@aetheriacloud.com',
        status: 'ACTIVE',
      },
      // Isolated tenant client to verify tenant boundaries
      {
        id: 'c-isolated-99',
        agencyId: 'agency-demo-002',
        clientName: 'Isolated Competitor Client Corp',
        industry: 'FinTech',
        monthlyRetainer: 75000,
        tier: 'ENTERPRISE',
        healthScore: 99,
        primaryContact: 'Secret Agent',
        contactEmail: 'secret@isolated.com',
        status: 'ACTIVE',
      },
    ];

    for (const c of clients) {
      this.inMemoryStore.set(c.id, {
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }
}

export const clientRepository = new ClientRepository();
export default clientRepository;
