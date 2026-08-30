/**
 * DataForSEO SERP Provider Adapter
 * Task 17 — Production Live SERP Rank Lookup, Location/Language Targeting & Error Classification
 */

import { BaseSeoProvider } from './baseSeoProvider.js';
import { RETRY_CATEGORIES, classifyFailure } from '../../automation/retryPolicy.js';

export class DataForSeoProvider extends BaseSeoProvider {
  constructor(config = {}) {
    super('DATAFORSEO', config);
    this.apiKey = process.env.DATAFORSEO_API_KEY || config.apiKey || null;
    this.login = process.env.DATAFORSEO_LOGIN || config.login || null;
    this.password = process.env.DATAFORSEO_PASSWORD || config.password || null;
  }

  isConfigured() {
    return Boolean(this.apiKey || (this.login && this.password));
  }

  /**
   * Fetch single keyword rank on live Google SERP
   */
  async getKeywordRank(keyword, options = {}) {
    if (!this.isConfigured()) {
      return {
        status: RETRY_CATEGORIES.CONFIGURATION_REQUIRED,
        provider: this.name,
        keyword,
        message: 'DataForSEO API credentials are not configured in environment.',
      };
    }

    const {
      targetDomain,
      locationCode = 2840, // United States
      languageCode = 'en',
      depth = 100,
    } = options;

    try {
      const authHeader = this.apiKey
        ? `Bearer ${this.apiKey}`
        : `Basic ${Buffer.from(`${this.login}:${this.password}`).toString('base64')}`;

      const endpoint = 'https://api.dataforseo.com/v3/serp/google/organic/live/regular';
      const payload = [
        {
          keyword: keyword.trim(),
          location_code: Number(locationCode),
          language_code: languageCode,
          depth: Number(depth),
        },
      ];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const failureType = classifyFailure(response.status, null, errorData);
        return {
          status: failureType,
          httpStatus: response.status,
          provider: this.name,
          error: errorData.status_message || `DataForSEO request failed with HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const task = data.tasks?.[0];

      if (!task || task.status_code !== 20000) {
        return {
          status: RETRY_CATEGORIES.FAILED,
          provider: this.name,
          error: task?.status_message || 'DataForSEO returned invalid task status.',
        };
      }

      const items = task.result?.[0]?.items || [];
      const organicItems = items.filter((item) => item.type === 'organic');

      let matchedItem = null;
      if (targetDomain) {
        const cleanTarget = targetDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        matchedItem = organicItems.find((item) => {
          const itemDomain = (item.domain || item.url || '').toLowerCase();
          return itemDomain.includes(cleanTarget);
        });
      } else {
        matchedItem = organicItems[0] || null;
      }

      if (!matchedItem) {
        return this.normalizeRankResult({
          keyword,
          url: null,
          currentRank: null,
          status: 'NOT_FOUND',
        });
      }

      return this.normalizeRankResult({
        keyword,
        url: matchedItem.url || null,
        currentRank: matchedItem.rank_group || matchedItem.rank_absolute || 100,
        searchVolume: Number(task.result?.[0]?.se_results_count) || 0,
        status: 'SUCCESS',
      });
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
   * Batch keyword ranks
   */
  async getKeywordRanks(keywords, options = {}) {
    if (!this.isConfigured()) {
      return {
        status: RETRY_CATEGORIES.CONFIGURATION_REQUIRED,
        provider: this.name,
        keywordsCount: keywords.length,
      };
    }

    const results = [];
    for (const kw of keywords) {
      const res = await this.getKeywordRank(kw, options);
      results.push(res);
    }

    return {
      status: RETRY_CATEGORIES.SUCCESS,
      provider: this.name,
      results,
    };
  }
}

export default DataForSeoProvider;
