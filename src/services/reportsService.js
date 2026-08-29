import { initialMockReports } from '../data/mockReports.js';
import { mockClients } from '../data/mockClients.js';

let reportsState = [...initialMockReports];

export const reportsService = {
  /**
   * Fetch all generated reports with optional filters
   */
  async getReports(filters = {}) {
    const { clientId, category, search } = filters;

    let filtered = [...reportsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((r) => r.clientId === clientId);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(
        (r) => r.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single report by ID
   */
  async getReportById(id) {
    const report = reportsState.find((r) => r.id === id);
    return Promise.resolve(report || null);
  },

  /**
   * Generate new AI report
   */
  async generateReport(config) {
    const client = mockClients.find((c) => c.id === config.clientId) || mockClients[0];

    const categoryMap = {
      executive: 'Executive Summary',
      ads: 'Paid Media Audit',
      organic: 'Organic Growth',
      forecast: 'Strategic Forecast',
    };

    const newReport = {
      id: `rep-${Date.now()}`,
      title: config.title || `${client.name} ${config.period || 'August 2026'} Performance Audit`,
      clientId: client.id,
      clientName: client.name,
      period: config.period || 'August 2026 (Monthly Review)',
      category: categoryMap[config.category] || 'Executive Summary',
      type: 'Executive PDF & Presentation',
      status: 'Ready',
      fileSize: '4.6 MB',
      generatedAt: 'Just now (Generated)',
      author: 'AI Strategic Engine',
      highlights: {
        reach: '112.5K (+16.8%)',
        engagement: '24.2K (6.4% Rate)',
        spend: '$3,200',
        revenue: '$18,400',
        roas: '5.75x',
      },
      summaryText:
        config.customNotes ||
        `Automated comprehensive performance review for ${client.name}. Highlights strong organic engagement velocity and positive return on paid media spend across all managed accounts.`,
      thumbnail: client.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    };

    reportsState = [newReport, ...reportsState];
    return Promise.resolve(newReport);
  },

  /**
   * Delete report
   */
  async deleteReport(id) {
    reportsState = reportsState.filter((r) => r.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Calculate summary metrics
   */
  calculateReportMetrics(reportsList) {
    const total = reportsList.length;
    const readyCount = reportsList.filter((r) => r.status === 'Ready').length;
    const executiveSummariesCount = reportsList.filter(
      (r) => r.category === 'Executive Summary'
    ).length;
    const paidAuditsCount = reportsList.filter(
      (r) => r.category === 'Paid Media Audit'
    ).length;

    return {
      total,
      readyCount,
      executiveSummariesCount,
      paidAuditsCount,
    };
  },
};

export default reportsService;
