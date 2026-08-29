/**
 * User Repository with Secure Password Hashing
 * Task 28 — Step 1: User & Authentication Repository
 */

import { BaseRepository } from './baseRepository.js';
import { hashPassword } from '../auth/passwordUtils.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('User');
    this.seedDefaultUsers();
  }

  seedDefaultUsers() {
    const defaultPasswordHash = hashPassword('AntigravityDemo2026!');
    const demoAgencyId = 'agency-demo-001';

    const users = [
      {
        id: 'usr-owner-001',
        agencyId: demoAgencyId,
        email: 'owner@antigravity.agency',
        passwordHash: defaultPasswordHash,
        name: 'Agency Principal / Owner',
        role: 'OWNER',
        status: 'ACTIVE',
      },
      {
        id: 'usr-admin-001',
        agencyId: demoAgencyId,
        email: 'admin@antigravity.agency',
        passwordHash: defaultPasswordHash,
        name: 'Agency Operations Director',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      {
        id: 'usr-operator-001',
        agencyId: demoAgencyId,
        email: 'operator@antigravity.agency',
        passwordHash: defaultPasswordHash,
        name: 'Growth & Media Operator',
        role: 'OPERATOR',
        status: 'ACTIVE',
      },
    ];

    for (const u of users) {
      this.inMemoryStore.set(u.id, {
        ...u,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const items = Array.from(this.inMemoryStore.values());
    const user = items.find((u) => u.email.toLowerCase() === cleanEmail && !u.deletedAt);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }
}

export const userRepository = new UserRepository();
export default userRepository;
