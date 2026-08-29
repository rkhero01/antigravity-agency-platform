/**
 * SEO Keyword Management Controller
 * Task 28 — Step 3: SEO Keyword CRUD & SERP Calculations
 */

import { seoKeywordRepository } from '../repositories/seoKeywordRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { safeNum } from '../utils/metrics.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

const ALLOWED_STATUSES = ['TRACKING', 'IMPROVING', 'DECLINING', 'ACHIEVED', 'PAUSED'];
const ALLOWED_INTENTS = ['INFORMATIONAL', 'COMMERCIAL', 'TRANSACTIONAL', 'NAVIGATIONAL'];

export async function listKeywords(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, status, searchIntent, search } = req.query;

    let keywords = await seoKeywordRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      keywords = keywords.filter((k) => k.clientId === clientId);
    }

    if (status && status !== 'all') {
      keywords = keywords.filter((k) => k.status.toUpperCase() === status.toUpperCase());
    }

    if (searchIntent && searchIntent !== 'all') {
      keywords = keywords.filter((k) => k.searchIntent.toUpperCase() === searchIntent.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      keywords = keywords.filter((k) => k.keyword.toLowerCase().includes(q) || k.url?.toLowerCase().includes(q));
    }

    // Ensure rankChange is dynamically computed for each keyword
    keywords = keywords.map((k) => ({
      ...k,
      rankChange: safeNum(k.previousRank, 100) - safeNum(k.currentRank, 100),
    }));

    const result = paginateArray(keywords, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getKeywordById(req, res, next) {
  try {
    const { keywordId } = req.params;
    validator.validateId(keywordId, 'keywordId');

    const kw = await seoKeywordRepository.findById(keywordId, req.agencyId);
    if (!kw) {
      const existsInOther = await seoKeywordRepository.findById(keywordId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency SEO keyword is strictly prohibited.');
      }
      throw new NotFoundError(`SEO Keyword with ID "${keywordId}" not found.`);
    }

    kw.rankChange = safeNum(kw.previousRank, 100) - safeNum(kw.currentRank, 100);

    return sendSuccess(res, { keyword: kw });
  } catch (err) {
    next(err);
  }
}

export async function createKeyword(req, res, next) {
  try {
    const { clientId, keyword, searchVolume = 0, difficulty = 0, currentRank = 100, previousRank = 100, targetRank = 10, url, searchIntent = 'INFORMATIONAL', status = 'TRACKING', notes } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(keyword, 'keyword', 2, 150);

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach SEO keyword to an external agency client.');
    }

    const validIntent = validator.validateEnum(searchIntent.toUpperCase(), ALLOWED_INTENTS, 'searchIntent');
    const validStatus = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');

    const prev = validator.validateNumber(previousRank, 'previousRank', 1, 100);
    const curr = validator.validateNumber(currentRank, 'currentRank', 1, 100);
    const rankChange = prev - curr;

    const newKw = await seoKeywordRepository.create({
      agencyId: req.agencyId,
      clientId,
      keyword: keyword.trim(),
      searchVolume: validator.validateNumber(searchVolume, 'searchVolume', 0),
      difficulty: validator.validateNumber(difficulty, 'difficulty', 0, 100),
      currentRank: curr,
      previousRank: prev,
      targetRank: validator.validateNumber(targetRank, 'targetRank', 1, 100),
      url: url ? String(url).trim() : null,
      searchIntent: validIntent,
      status: validStatus,
      notes: notes ? String(notes).trim() : null,
      rankChange,
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'SEO_KEYWORD',
      entityId: newKw.id,
      before: null,
      after: newKw,
      requestId: req.id,
    });

    return sendSuccess(res, { keyword: newKw }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateKeyword(req, res, next) {
  try {
    const { keywordId } = req.params;
    validator.validateId(keywordId, 'keywordId');

    const existing = await seoKeywordRepository.findById(keywordId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`SEO Keyword with ID "${keywordId}" not found.`);
    }

    const { currentRank, previousRank, targetRank, url, searchIntent, status, notes } = req.body || {};
    const updates = {};

    if (currentRank !== undefined) updates.currentRank = validator.validateNumber(currentRank, 'currentRank', 1, 100);
    if (previousRank !== undefined) updates.previousRank = validator.validateNumber(previousRank, 'previousRank', 1, 100);
    if (targetRank !== undefined) updates.targetRank = validator.validateNumber(targetRank, 'targetRank', 1, 100);
    if (url !== undefined) updates.url = String(url).trim();
    if (searchIntent !== undefined) updates.searchIntent = validator.validateEnum(searchIntent.toUpperCase(), ALLOWED_INTENTS, 'searchIntent');
    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');
    if (notes !== undefined) updates.notes = String(notes).trim();

    const finalPrev = updates.previousRank !== undefined ? updates.previousRank : existing.previousRank;
    const finalCurr = updates.currentRank !== undefined ? updates.currentRank : existing.currentRank;
    updates.rankChange = finalPrev - finalCurr;

    const updated = await seoKeywordRepository.update(keywordId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'SEO_KEYWORD',
      entityId: keywordId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { keyword: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteKeyword(req, res, next) {
  try {
    const { keywordId } = req.params;
    validator.validateId(keywordId, 'keywordId');

    const existing = await seoKeywordRepository.findById(keywordId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`SEO Keyword with ID "${keywordId}" not found.`);
    }

    await seoKeywordRepository.delete(keywordId, req.agencyId, true);

    return sendSuccess(res, { message: `SEO Keyword "${existing.keyword}" removed successfully.` });
  } catch (err) {
    next(err);
  }
}

export const seoKeywordController = {
  listKeywords,
  getKeywordById,
  createKeyword,
  updateKeyword,
  deleteKeyword,
};

export default seoKeywordController;
