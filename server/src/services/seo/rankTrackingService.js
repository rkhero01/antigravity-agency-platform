/**
 * SEO Rank Tracking Service
 * Task 17 — Live Multi-Tenant SERP Rank Tracking, Snapshot History & Audit Trail
 */

import { seoKeywordRepository } from '../../repositories/seoKeywordRepository.js';
import { clientRepository } from '../../repositories/clientRepository.js';
import { getSeoProvider, PROVIDER_TYPES } from './providers/index.js';
import { auditService, AUDIT_ACTIONS } from '../auditService.js';
import { NotFoundError, AuthorizationError } from '../../utils/errors.js';
import { safeNum } from '../../utils/metrics.js';

export class RankTrackingService {
  /**
   * Execute live rank check for a single keyword
   */
  async checkKeywordRank(keywordId, agencyId, options = {}) {
    const { providerName = PROVIDER_TYPES.DATAFORSEO, actorId = 'SYSTEM', requestId = `REQ-${Date.now()}` } = options;

    const kw = await seoKeywordRepository.findById(keywordId, agencyId);
    if (!kw) {
      const existsOther = await seoKeywordRepository.findById(keywordId);
      if (existsOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency SEO keyword is strictly prohibited.');
      }
      throw new NotFoundError(`SEO Keyword with ID "${keywordId}" not found.`);
    }

    const client = await clientRepository.findById(kw.clientId, agencyId);
    const targetDomain = client ? client.website || client.name : null;

    const provider = getSeoProvider(providerName);
    const providerResult = await provider.getKeywordRank(kw.keyword, {
      ...options,
      targetDomain,
      siteUrl: kw.url || (targetDomain ? `https://${targetDomain.toLowerCase().replace(/\s+/g, '')}.com` : undefined),
    });

    if (providerResult.status === 'CONFIGURATION_REQUIRED' || providerResult.status === 'EXECUTION_BLOCKED') {
      return {
        keywordId,
        keyword: kw.keyword,
        status: providerResult.status,
        provider: provider.name,
        currentRank: kw.currentRank,
        previousRank: kw.previousRank,
        rankChange: safeNum(kw.previousRank, 100) - safeNum(kw.currentRank, 100),
        message: providerResult.message || `Provider ${provider.name} is not configured or execution is blocked.`,
      };
    }

    if (providerResult.status === 'NOT_FOUND' || providerResult.rank === null) {
      return {
        keywordId,
        keyword: kw.keyword,
        status: 'NOT_FOUND',
        provider: provider.name,
        currentRank: kw.currentRank,
        previousRank: kw.previousRank,
        rankChange: safeNum(kw.previousRank, 100) - safeNum(kw.currentRank, 100),
        checkedAt: new Date().toISOString(),
      };
    }

    // Calculate rank movements
    const newCurrent = Number(providerResult.rank);
    const newPrevious = Number(kw.currentRank) || 100;
    const rankChange = newPrevious - newCurrent;

    let updatedStatus = kw.status;
    if (newCurrent <= (kw.targetRank || 10)) {
      updatedStatus = 'ACHIEVED';
    } else if (rankChange > 0) {
      updatedStatus = 'IMPROVING';
    } else if (rankChange < 0) {
      updatedStatus = 'DECLINING';
    }

    const updated = await seoKeywordRepository.update(
      keywordId,
      {
        currentRank: newCurrent,
        previousRank: newPrevious,
        rankChange,
        status: updatedStatus,
        url: providerResult.url || kw.url,
        searchVolume: providerResult.searchVolume || kw.searchVolume,
      },
      agencyId
    );

    // Record persistent historical snapshot in AuditLog
    await auditService.log({
      actorId,
      agencyId,
      clientId: kw.clientId,
      action: AUDIT_ACTIONS.EXECUTE,
      entityType: 'SEO_KEYWORD_RANK_SNAPSHOT',
      entityId: keywordId,
      before: {
        currentRank: kw.currentRank,
        previousRank: kw.previousRank,
        status: kw.status,
      },
      after: {
        currentRank: newCurrent,
        previousRank: newPrevious,
        rankChange,
        status: updatedStatus,
        provider: provider.name,
        searchVolume: updated.searchVolume,
        clicks: providerResult.clicks,
        impressions: providerResult.impressions,
      },
      requestId,
    });

    return {
      keywordId,
      keyword: updated.keyword,
      currentRank: newCurrent,
      previousRank: newPrevious,
      rankChange,
      status: updatedStatus,
      provider: provider.name,
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieve historical rank snapshots for a keyword
   */
  async getRankHistory(keywordId, agencyId) {
    const kw = await seoKeywordRepository.findById(keywordId, agencyId);
    if (!kw) {
      const existsOther = await seoKeywordRepository.findById(keywordId);
      if (existsOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency SEO rank history is strictly prohibited.');
      }
      throw new NotFoundError(`SEO Keyword with ID "${keywordId}" not found.`);
    }

    const snapshots = await auditService.getAuditLogs({
      entityType: 'SEO_KEYWORD_RANK_SNAPSHOT',
      entityId: keywordId,
    }, agencyId);

    return snapshots.map((s) => {
      const after = s.after || {};
      return {
        id: s.id,
        keywordId,
        agencyId: s.agencyId,
        clientId: s.clientId,
        rank: after.currentRank,
        previousRank: after.previousRank,
        rankChange: after.rankChange,
        provider: after.provider || 'UNKNOWN',
        searchVolume: after.searchVolume,
        impressions: after.impressions,
        clicks: after.clicks,
        timestamp: s.createdAt,
      };
    });
  }
}

export const rankTrackingService = new RankTrackingService();
export default rankTrackingService;
