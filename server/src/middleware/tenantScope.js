/**
 * Multi-Tenant Agency Isolation Middleware & Assertion Helpers
 * Task 28 — Step 1: Multi-Tenant Security Architecture
 */

import { AuthorizationError } from '../utils/errors.js';

/**
 * Enforce Tenant Scope on Request Context
 */
export function tenantScopeMiddleware(req, res, next) {
  if (!req.user || !req.user.agencyId) {
    return next(new AuthorizationError('Tenant context missing: Authenticated agency ID required'));
  }

  // Bind trusted agencyId from authenticated identity
  req.agencyId = req.user.agencyId;

  // Validate if route parameters attempt to inject a different agencyId
  if (req.params.agencyId && req.params.agencyId !== req.agencyId && req.user.role !== 'SUPER_ADMIN') {
    return next(new AuthorizationError('Tenant isolation violation: Cross-agency access is strictly prohibited'));
  }

  next();
}

/**
 * Assert that an entity belongs to the user's tenant
 */
export function assertTenantAccess(entityAgencyId, userAgencyId) {
  if (!entityAgencyId || !userAgencyId || entityAgencyId !== userAgencyId) {
    throw new AuthorizationError('Tenant isolation violation: Access to external agency entity is strictly prohibited');
  }
  return true;
}

export const tenantUtils = {
  tenantScopeMiddleware,
  assertTenantAccess,
};

export default tenantUtils;
