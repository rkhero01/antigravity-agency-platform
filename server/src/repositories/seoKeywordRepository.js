/**
 * SEO Keyword Repository with Safe Rank Change Calculation
 * Task 28 — Step 3: SEO Keyword Store & SERP Tracker
 */

import { BaseRepository } from './baseRepository.js';
import { safeNum } from '../utils/metrics.js';

export class SEOKeywordRepository extends BaseRepository {
  constructor() {
    super('SEOKeyword');
    this.seedDefaultKeywords();
  }

  seedDefaultKeywords() {
    const demoAgencyId = 'agency-demo-001';
    const keywords = [
      {
        id: 'kw-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        keyword: 'best luxury gym south delhi',
        searchVolume: 4200,
        difficulty: 48,
        currentRank: 4,
        previousRank: 9,
        targetRank: 1,
        url: 'https://apexfitness.com/south-delhi',
        searchIntent: 'COMMERCIAL',
        status: 'IMPROVING',
        notes: 'Targeting page 1 #1 spot by next quarter.',
      },
      {
        id: 'kw-102',
        agencyId: demoAgencyId,
        clientId: 'c1',
        keyword: 'personal trainer for weight loss',
        searchVolume: 12500,
        difficulty: 64,
        currentRank: 14,
        previousRank: 12,
        targetRank: 5,
        url: 'https://apexfitness.com/personal-training',
        searchIntent: 'TRANSACTIONAL',
        status: 'DECLINING',
        notes: 'Need fresh blog content refresh.',
      },
      {
        id: 'kw-201',
        agencyId: demoAgencyId,
        clientId: 'c2',
        keyword: 'organic snacks subscription india',
        searchVolume: 8900,
        difficulty: 52,
        currentRank: 2,
        previousRank: 6,
        targetRank: 1,
        url: 'https://verdeorganics.com/subscriptions',
        searchIntent: 'TRANSACTIONAL',
        status: 'IMPROVING',
        notes: 'High conversion commercial page.',
      },
      {
        id: 'kw-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        keyword: 'secret fintech trading algorithms',
        searchVolume: 1000,
        difficulty: 70,
        currentRank: 1,
        previousRank: 1,
        targetRank: 1,
        status: 'ACHIEVED',
      },
    ];

    for (const k of keywords) {
      const prev = safeNum(k.previousRank, 100);
      const curr = safeNum(k.currentRank, 100);
      const rankChange = prev - curr; // Positive means rank improved

      this.inMemoryStore.set(k.id, {
        ...k,
        rankChange,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  computeRankChange(item) {
    const prev = safeNum(item.previousRank, 100);
    const curr = safeNum(item.currentRank, 100);
    return prev - curr;
  }
}

export const seoKeywordRepository = new SEOKeywordRepository();
export default seoKeywordRepository;
