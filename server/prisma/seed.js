/**
 * Production-Safe Database Seed Script
 * Task 28 — Step 6: Seed Safety & Production Guard
 */

import { hashPassword } from '../src/auth/passwordUtils.js';

export async function getSeedData() {
  const defaultPasswordHash = hashPassword('AntigravityDemo2026!');

  const agencies = [
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

  const users = [
    {
      id: 'usr-owner-001',
      agencyId: 'agency-demo-001',
      email: 'owner@antigravity.agency',
      passwordHash: defaultPasswordHash,
      name: 'Agency Principal / Owner',
      role: 'OWNER',
      status: 'ACTIVE',
    },
    {
      id: 'usr-admin-001',
      agencyId: 'agency-demo-001',
      email: 'admin@antigravity.agency',
      passwordHash: defaultPasswordHash,
      name: 'Agency Operations Director',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      id: 'usr-operator-001',
      agencyId: 'agency-demo-001',
      email: 'operator@antigravity.agency',
      passwordHash: defaultPasswordHash,
      name: 'Growth & Media Operator',
      role: 'OPERATOR',
      status: 'ACTIVE',
    },
  ];

  const teamMembers = [
    {
      id: 'team-1',
      agencyId: 'agency-demo-001',
      name: 'Aarav Sharma',
      email: 'aarav@antigravity.agency',
      role: 'ADMIN',
      department: 'Operations & Paid Media',
      shiftHours: '09:00 - 18:00',
      status: 'ACTIVE',
    },
    {
      id: 'team-2',
      agencyId: 'agency-demo-001',
      name: 'Diya Patel',
      email: 'diya@antigravity.agency',
      role: 'MANAGER',
      department: 'Client Success & CRM',
      shiftHours: '10:00 - 19:00',
      status: 'ACTIVE',
    },
    {
      id: 'team-3',
      agencyId: 'agency-demo-001',
      name: 'Rohan Gupta',
      email: 'rohan@antigravity.agency',
      role: 'OPERATOR',
      department: 'WhatsApp & Engagement SLA',
      shiftHours: '13:00 - 22:00',
      status: 'ACTIVE',
    },
    {
      id: 'team-4',
      agencyId: 'agency-demo-001',
      name: 'Sneha Iyer',
      email: 'sneha@antigravity.agency',
      role: 'ANALYST',
      department: 'SEO & Organic Growth',
      shiftHours: '09:00 - 18:00',
      status: 'ACTIVE',
    },
  ];

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

  return { agencies, users, teamMembers, clients };
}

export async function runSeed(prismaClient = null, options = {}) {
  const isProd = process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
  if (isProd && !process.env.ALLOW_PRODUCTION_SEED) {
    console.warn('[SEED GUARD] Seed execution blocked in production environment. Set ALLOW_PRODUCTION_SEED=true to override.');
    return { success: false, reason: 'PRODUCTION_GUARD_BLOCKED' };
  }

  const data = await getSeedData();

  if (!prismaClient) {
    console.log('[SEED] Running in-memory seed verification...');
    console.log(`[SEED] Generated ${data.agencies.length} agencies, ${data.users.length} users, ${data.clients.length} clients.`);
    return { success: true, count: data };
  }

  // When live PostgreSQL Prisma client is provided:
  for (const agency of data.agencies) {
    await prismaClient.agency.upsert({ where: { id: agency.id }, update: agency, create: agency });
  }
  for (const user of data.users) {
    await prismaClient.user.upsert({ where: { email: user.email }, update: user, create: user });
  }
  for (const member of data.teamMembers) {
    await prismaClient.teamMember.upsert({ where: { id: member.id }, update: member, create: member });
  }
  for (const client of data.clients) {
    await prismaClient.client.upsert({ where: { id: client.id }, update: client, create: client });
  }

  console.log('[SEED] PostgreSQL database seeded successfully.');
  return { success: true };
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed();
}

export default {
  getSeedData,
  runSeed,
};
