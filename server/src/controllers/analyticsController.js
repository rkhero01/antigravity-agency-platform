/**
 * Analytics & Performance Controller
 * Task 10: Multi-Tenant Analytics REST Endpoints
 */

import { analyticsService } from '../services/analyticsService.js';
import { sendSuccess } from '../utils/response.js';

export async function getOverview(req, res, next) {
  try {
    const filters = {
      range: req.query.range || req.query.dateRange || 'last_30_days',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      clientId: req.query.clientId,
    };
    const overview = await analyticsService.getOverview(req.agencyId, filters);
    return sendSuccess(res, overview);
  } catch (err) {
    next(err);
  }
}

export async function getCampaigns(req, res, next) {
  try {
    const filters = {
      range: req.query.range || req.query.dateRange || 'last_30_days',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      clientId: req.query.clientId,
      platform: req.query.platform,
    };
    const campaigns = await analyticsService.getCampaignAnalytics(req.agencyId, filters);
    return sendSuccess(res, { campaigns });
  } catch (err) {
    next(err);
  }
}

export async function getLeads(req, res, next) {
  try {
    const filters = {
      range: req.query.range || req.query.dateRange || 'last_30_days',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      clientId: req.query.clientId,
    };
    const leads = await analyticsService.getLeadAnalytics(req.agencyId, filters);
    return sendSuccess(res, leads);
  } catch (err) {
    next(err);
  }
}

export async function getContent(req, res, next) {
  try {
    const filters = {
      range: req.query.range || req.query.dateRange || 'last_30_days',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      clientId: req.query.clientId,
    };
    const content = await analyticsService.getContentAnalytics(req.agencyId, filters);
    return sendSuccess(res, content);
  } catch (err) {
    next(err);
  }
}

export async function getClients(req, res, next) {
  try {
    const filters = {
      range: req.query.range || req.query.dateRange || 'last_30_days',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const clients = await analyticsService.getClientAnalytics(req.agencyId, filters);
    return sendSuccess(res, { clients });
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req, res, next) {
  try {
    const { format = 'csv', type = 'overview', range, startDate, endDate, clientId } = req.query;
    const filters = { range, startDate, endDate, clientId };

    if (format === 'csv') {
      const csvData = await analyticsService.generateCsvReport(req.agencyId, type, filters);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=agency-analytics-${type}-${Date.now()}.csv`);
      return res.status(200).send(csvData);
    }

    const overview = await analyticsService.getOverview(req.agencyId, filters);
    return sendSuccess(res, overview);
  } catch (err) {
    next(err);
  }
}

export const analyticsController = {
  getOverview,
  getCampaigns,
  getLeads,
  getContent,
  getClients,
  exportReport,
};

export default analyticsController;
