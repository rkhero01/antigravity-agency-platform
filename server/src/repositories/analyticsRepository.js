/**
 * Analytics Data Repository
 * Task 10: Multi-Tenant Aggregation over Real PostgreSQL Data
 */

import { clientRepository } from './clientRepository.js';
import { campaignRepository } from './campaignRepository.js';
import { leadRepository } from './leadRepository.js';
import { contentRepository } from './contentRepository.js';
import { socialAccountRepository } from './socialAccountRepository.js';
import { publishingRepository } from './publishingRepository.js';
import { AuthorizationError } from '../utils/errors.js';

export class AnalyticsRepository {
  /**
   * Parse date window filters into startDate and endDate objects
   */
  parseDateRange(range = 'last_30_days', customStart = null, customEnd = null) {
    const now = new Date();
    let startDate;
    let endDate = now;

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return { startDate, endDate };
      }
    }

    switch (range) {
      case 'today': {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      }
      case 'yesterday': {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      }
      case 'last_7_days': {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case 'last_30_days':
      case '30d': {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      }
      case 'this_month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
      case 'previous_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      }
      default: {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    return { startDate, endDate };
  }

  /**
   * Filter an array of items by date range using createdAt or specified dateField
   */
  filterByDate(items, startDate, endDate, dateField = 'createdAt') {
    if (!startDate && !endDate) return items;
    return items.filter((item) => {
      const rawDate = item[dateField] || item.createdAt;
      if (!rawDate) return true;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return true;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }

  /**
   * Fetch all raw tenant entities scoped by agencyId and optional clientId
   */
  async getTenantData(agencyId, clientId = null, range = 'last_30_days', customStart = null, customEnd = null) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    const { startDate, endDate } = this.parseDateRange(range, customStart, customEnd);

    const clientFilter = clientId && clientId !== 'all' ? clientId : null;

    const [clientsRaw, campaignsRaw, leadsRaw, contentRaw, socialRaw, jobsRaw] = await Promise.all([
      clientRepository.findMany({ agencyId }),
      campaignRepository.findMany({ agencyId }),
      leadRepository.findMany({ agencyId }),
      contentRepository.findMany({ agencyId }),
      socialAccountRepository.findMany({ agencyId }),
      publishingRepository.findMany({ agencyId }),
    ]);

    // Exclude soft-deleted
    const clients = clientsRaw.filter((c) => !c.deletedAt && (!clientFilter || c.id === clientFilter));
    const campaigns = this.filterByDate(
      campaignsRaw.filter((c) => !c.deletedAt && (!clientFilter || c.clientId === clientFilter)),
      startDate,
      endDate
    );
    const leads = this.filterByDate(
      leadsRaw.filter((l) => !l.deletedAt && (!clientFilter || l.clientId === clientFilter)),
      startDate,
      endDate
    );
    const content = this.filterByDate(
      contentRaw.filter((p) => !p.deletedAt && (!clientFilter || p.clientId === clientFilter)),
      startDate,
      endDate
    );
    const socialAccounts = socialRaw.filter((s) => !s.deletedAt && (!clientFilter || s.clientId === clientFilter));
    const publishingJobs = this.filterByDate(
      jobsRaw.filter((j) => !j.deletedAt),
      startDate,
      endDate
    );

    return {
      clients,
      campaigns,
      leads,
      content,
      socialAccounts,
      publishingJobs,
      dateWindow: { startDate, endDate, range },
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
