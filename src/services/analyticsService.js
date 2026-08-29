import { initialMockAnalyticsData } from '../data/mockAnalytics.js';
import { mockClients } from '../data/mockClients.js';

let scheduledReportsState = [
  {
    id: 'sched-1',
    clientName: 'Apex Fitness Club',
    email: 'sarah@apexfit.com',
    frequency: 'Weekly (Monday 09:00 AM)',
    format: 'Executive Summary PDF',
    status: 'Active',
    lastSent: '2026-08-24 09:00 AM',
  },
  {
    id: 'sched-2',
    clientName: 'Verde Organics',
    email: 'david@verdeorganics.io',
    frequency: 'Monthly (1st of month)',
    format: 'Full Performance Pack',
    status: 'Active',
    lastSent: '2026-08-01 09:00 AM',
  },
];

export const analyticsService = {
  /**
   * Main analytics fetcher
   */
  async getAnalytics(clientId = 'all', dateRange = '30d') {
    const data = { ...initialMockAnalyticsData };

    if (clientId && clientId !== 'all' && data.clientAnalytics[clientId]) {
      const clientData = data.clientAnalytics[clientId];
      return Promise.resolve({
        summary: {
          totalReach: clientData.totalReach,
          reachGrowth: '+16.2%',
          totalFollowers: clientData.followers,
          followersGrowth: clientData.followersGrowth,
          totalEngagement: clientData.totalEngagement,
          engagementGrowth: '+18.4%',
          engagementRate: clientData.engagementRate,
          rateBenchmark: '+2.4% above average',
          totalPostsPublished: 24,
          publishingPacing: '100% on schedule',
          attributedRevenue: Math.round(clientData.totalReach * 0.45),
          revenueGrowth: '+22.5%',
        },
        channelBreakdown: clientData.channels,
        timeseries: data.timeseries[dateRange] || data.timeseries['30d'],
        demographics: data.demographics,
        topContentLeaderboard: data.topContentLeaderboard.filter(
          (c) => c.clientName.toLowerCase().includes(clientData.clientName.toLowerCase())
        ),
      });
    }

    return Promise.resolve({
      summary: data.summary,
      channelBreakdown: data.channelBreakdown,
      timeseries: data.timeseries[dateRange] || data.timeseries['30d'],
      demographics: data.demographics,
      topContentLeaderboard: data.topContentLeaderboard,
    });
  },

  /**
   * Fetch timeseries for chart
   */
  async getTimeseries(dateRange = '30d') {
    return Promise.resolve(
      initialMockAnalyticsData.timeseries[dateRange] || initialMockAnalyticsData.timeseries['30d']
    );
  },

  /**
   * Schedule recurring reports
   */
  async getScheduledReports() {
    return Promise.resolve([...scheduledReportsState]);
  },

  async scheduleAutomatedReport(config) {
    const client = mockClients.find((c) => c.id === config.clientId) || mockClients[0];
    const newSchedule = {
      id: `sched-${Date.now()}`,
      clientName: client.name,
      email: config.recipientEmail || client.email,
      frequency: config.frequency || 'Weekly (Monday 09:00 AM)',
      format: config.format || 'Executive Summary PDF',
      status: 'Active',
      lastSent: 'Scheduled for next cycle',
    };
    scheduledReportsState = [newSchedule, ...scheduledReportsState];
    return Promise.resolve(newSchedule);
  },

  async deleteScheduledReport(id) {
    scheduledReportsState = scheduledReportsState.filter((s) => s.id !== id);
    return Promise.resolve(true);
  },
};

export default analyticsService;
