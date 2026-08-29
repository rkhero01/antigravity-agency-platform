/**
 * SEO Task Repository
 * Task 28 — Step 3: SEO Optimization Sprint & Task Store
 */

import { BaseRepository } from './baseRepository.js';

export class SEOTaskRepository extends BaseRepository {
  constructor() {
    super('SEOTask');
    this.seedDefaultTasks();
  }

  seedDefaultTasks() {
    const demoAgencyId = 'agency-demo-001';
    const tasks = [
      {
        id: 'task-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        keywordId: 'kw-101',
        title: 'Optimize Schema Markup for Local Branches',
        description: 'Implement LocalBusiness JSON-LD markup on location landing pages.',
        assignedTo: 'Sneha Iyer',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
        completion: 60,
        notes: 'Testing on staging environment before deployment.',
      },
      {
        id: 'task-102',
        agencyId: demoAgencyId,
        clientId: 'c2',
        keywordId: 'kw-201',
        title: 'Publish High-Protein Snack Guide 2026',
        description: '1500-word comprehensive pillar article with internal anchor linking.',
        assignedTo: 'Sneha Iyer',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'TODO',
        completion: 0,
        notes: 'Brief approved by client editorial team.',
      },
      {
        id: 'task-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        title: 'Isolated SEO Audit',
        assignedTo: 'Isolated Operator',
        priority: 'CRITICAL',
        status: 'TODO',
        completion: 0,
      },
    ];

    for (const t of tasks) {
      this.inMemoryStore.set(t.id, {
        ...t,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }
}

export const seoTaskRepository = new SEOTaskRepository();
export default seoTaskRepository;
