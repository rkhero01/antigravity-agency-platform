/**
 * AI Intelligence Read-Only Controller
 * Task 28 — Step 2: AI Read API Foundation
 */

import { aiIntelligenceRepository } from '../repositories/aiIntelligenceRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError } from '../utils/errors.js';

export async function getInsights(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, category, status } = req.query;

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
    }

    const filters = {};
    if (clientId && clientId !== 'all') filters.clientId = clientId;
    if (category && category !== 'all') filters.category = category;
    if (status && status !== 'all') filters.status = status;

    const items = await aiIntelligenceRepository.getInsights(filters, req.agencyId);
    const result = paginateArray(items, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, priority, status } = req.query;

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
    }

    const filters = {};
    if (clientId && clientId !== 'all') filters.clientId = clientId;
    if (priority && priority !== 'all') filters.priority = priority.toUpperCase();
    if (status && status !== 'all') filters.status = status;

    const items = await aiIntelligenceRepository.getRecommendations(filters, req.agencyId);
    const result = paginateArray(items, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getAnomalies(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, severity, status } = req.query;

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
    }

    const filters = {};
    if (clientId && clientId !== 'all') filters.clientId = clientId;
    if (severity && severity !== 'all') filters.severity = severity.toUpperCase();
    if (status && status !== 'all') filters.status = status;

    const items = await aiIntelligenceRepository.getAnomalies(filters, req.agencyId);
    const result = paginateArray(items, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export const aiController = {
  getInsights,
  getRecommendations,
  getAnomalies,
};

export default aiController;
