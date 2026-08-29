/**
 * Reusable Pagination & Sorting Helper
 * Task 28 — Step 2: Pagination Foundation
 */

import { ValidationError } from './errors.js';

export function parsePaginationParams(query = {}) {
  let page = parseInt(query.page || '1', 10);
  let limit = parseInt(query.limit || '20', 10);
  const sort = query.sort ? String(query.sort).trim() : 'createdAt';
  const order = query.order ? String(query.order).toLowerCase() : 'desc';

  if (isNaN(page) || page < 1) {
    throw new ValidationError('Invalid pagination: "page" must be an integer greater than or equal to 1.');
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError('Invalid pagination: "limit" must be an integer between 1 and 100.');
  }

  if (order !== 'asc' && order !== 'desc') {
    throw new ValidationError('Invalid pagination: "order" must be either "asc" or "desc".');
  }

  return {
    page,
    limit,
    sort,
    order,
    skip: (page - 1) * limit,
  };
}

export function paginateArray(items = [], options = {}) {
  const { page, limit, sort, order } = options;

  // Sorting
  const sorted = [...items].sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];

    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (order === 'asc') {
      return valA > valB ? 1 : -1;
    }
    return valA < valB ? 1 : -1;
  });

  const total = sorted.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginatedData = sorted.slice(start, start + limit);

  return {
    data: paginatedData,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export const paginationUtils = {
  parsePaginationParams,
  paginateArray,
};

export default paginationUtils;
