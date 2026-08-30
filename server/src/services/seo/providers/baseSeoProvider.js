/**
 * Base SEO Provider Abstract Class
 * Task 17 — Production SEO Rank Tracking & SERP Provider Layer
 */

export class BaseSeoProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * Check whether provider credentials and environment are configured
   */
  isConfigured() {
    return false;
  }

  /**
   * Normalize provider raw response into standard internal structure
   */
  normalizeRankResult(data) {
    const prev = Number(data.previousRank) || 100;
    const curr = data.currentRank !== null && data.currentRank !== undefined ? Number(data.currentRank) : null;
    const rankChange = curr !== null ? prev - curr : 0;

    return {
      keyword: data.keyword || '',
      url: data.url || null,
      rank: curr,
      previousRank: prev,
      rankChange,
      searchVolume: Number(data.searchVolume) || 0,
      clicks: Number(data.clicks) || 0,
      impressions: Number(data.impressions) || 0,
      ctr: Number(data.ctr) || 0,
      position: curr,
      provider: this.name,
      checkedAt: data.checkedAt || new Date().toISOString(),
      status: data.status || (curr !== null ? 'SUCCESS' : 'NOT_FOUND'),
    };
  }

  /**
   * Fetch single keyword rank
   */
  async getKeywordRank(keyword, options = {}) {
    throw new Error(`getKeywordRank() not implemented for provider "${this.name}".`);
  }

  /**
   * Batch fetch keyword ranks
   */
  async getKeywordRanks(keywords, options = {}) {
    throw new Error(`getKeywordRanks() not implemented for provider "${this.name}".`);
  }

  /**
   * Fetch search visibility / impressions
   */
  async getSearchVisibility(domain, options = {}) {
    throw new Error(`getSearchVisibility() not implemented for provider "${this.name}".`);
  }

  /**
   * Fetch Search Console metrics
   */
  async getSearchConsoleData(siteUrl, options = {}) {
    throw new Error(`getSearchConsoleData() not implemented for provider "${this.name}".`);
  }

  /**
   * Health check / readiness
   */
  async healthCheck() {
    return {
      provider: this.name,
      configured: this.isConfigured(),
      status: this.isConfigured() ? 'READY' : 'CONFIGURATION_REQUIRED',
    };
  }
}

export default BaseSeoProvider;
