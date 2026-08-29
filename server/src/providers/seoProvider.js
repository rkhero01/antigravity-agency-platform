/**
 * SEO Provider Boundary
 * Task 28 — Step 3: SEO Crawler / SERP Provider Abstraction
 */

import { ExecutionBlockedError } from '../utils/errors.js';
import { env } from '../config/env.js';

export class SEOProviderBoundary {
  async fetchLiveSERPRank(keyword, url, mode = 'DEMO') {
    if (mode === 'REAL' || env.isProduction) {
      throw new ExecutionBlockedError(
        'Production SEO Provider execution blocked: External SERP crawler APIs are not configured. SERP tracking operates in DEMO mode only.'
      );
    }

    return {
      success: true,
      mode: 'DEMO',
      keyword,
      url,
      simulatedRank: Math.floor(Math.random() * 15) + 1,
      checkedAt: new Date().toISOString(),
    };
  }
}

export const seoProvider = new SEOProviderBoundary();
export default seoProvider;
