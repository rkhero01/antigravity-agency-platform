/**
 * Google Search Console Provider Adapter
 * Task 17 — Production GSC Integration, Metrics Mapping & Configuration Gates
 */

import { BaseSeoProvider } from './baseSeoProvider.js';
import { RETRY_CATEGORIES, classifyFailure } from '../../automation/retryPolicy.js';

export class GoogleSearchConsoleProvider extends BaseSeoProvider {
  constructor(config = {}) {
    super('GOOGLE_SEARCH_CONSOLE', config);
    this.apiKey = process.env.GOOGLE_SEARCH_CONSOLE_KEY || config.apiKey || null;
    this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || config.clientEmail || null;
    this.privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || config.privateKey || null;
  }

  isConfigured() {
    return Boolean(this.apiKey || (this.clientEmail && this.privateKey));
  }

  /**
   * Fetch search console performance analytics
   */
  async getSearchConsoleData(siteUrl, options = {}) {
    if (!this.isConfigured()) {
      return {
        status: RETRY_CATEGORIES.CONFIGURATION_REQUIRED,
        provider: this.name,
        siteUrl,
        message: 'Google Search Console API key or Service Account credentials are not configured.',
      };
    }

    const {
      startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      dimensions = ['query', 'page'],
      rowLimit = 50,
    } = options;

    try {
      const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions,
          rowLimit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const failureType = classifyFailure(response.status, null, errorData);
        return {
          status: failureType,
          httpStatus: response.status,
          provider: this.name,
          error: errorData.error?.message || `GSC API request failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      const rows = (data.rows || []).map((row) => this.normalizeGscRow(row, siteUrl));

      return {
        status: RETRY_CATEGORIES.SUCCESS,
        provider: this.name,
        siteUrl,
        startDate,
        endDate,
        rows,
        totalRows: rows.length,
      };
    } catch (err) {
      const failureType = classifyFailure(500, err);
      return {
        status: failureType,
        provider: this.name,
        error: err.message,
      };
    }
  }

  /**
   * Single keyword rank / position via GSC
   */
  async getKeywordRank(keyword, options = {}) {
    if (!this.isConfigured()) {
      return {
        status: RETRY_CATEGORIES.CONFIGURATION_REQUIRED,
        provider: this.name,
        keyword,
      };
    }

    const { siteUrl } = options;
    if (!siteUrl) {
      return {
        status: RETRY_CATEGORIES.FAILED,
        provider: this.name,
        error: 'siteUrl parameter is required for GSC rank check.',
      };
    }

    const result = await this.getSearchConsoleData(siteUrl, {
      ...options,
      rowLimit: 250,
    });

    if (result.status !== RETRY_CATEGORIES.SUCCESS) {
      return result;
    }

    const matched = result.rows.find(
      (r) => r.query.toLowerCase() === keyword.toLowerCase().trim()
    );

    if (!matched) {
      return this.normalizeRankResult({
        keyword,
        url: siteUrl,
        currentRank: null,
        status: 'NOT_FOUND',
      });
    }

    return this.normalizeRankResult({
      keyword,
      url: matched.page,
      currentRank: Math.round(matched.position),
      clicks: matched.clicks,
      impressions: matched.impressions,
      ctr: matched.ctr,
      status: 'SUCCESS',
    });
  }

  /**
   * Normalize GSC row into standardized structure
   */
  normalizeGscRow(row, siteUrl = '') {
    const keys = row.keys || [];
    return {
      query: keys[0] || '',
      page: keys[1] || siteUrl,
      clicks: Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      ctr: Number(row.ctr) || 0,
      position: Number(row.position) ? Math.round(row.position * 10) / 10 : 100,
    };
  }
}

export default GoogleSearchConsoleProvider;
