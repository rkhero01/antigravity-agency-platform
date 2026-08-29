/**
 * Authentication & Role-Based Authorization Middleware
 * Task 28 — Step 1: Authentication & Authorization Foundation
 */

import { verifyToken } from '../auth/tokenUtils.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER',
};

// Hierarchy definition
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ['*'],
  [ROLES.ADMIN]: ['agency:read', 'agency:write', 'client:*', 'action:*', 'webhook:*', 'team:*'],
  [ROLES.MANAGER]: ['client:read', 'client:write', 'action:approve', 'action:execute', 'team:read'],
  [ROLES.OPERATOR]: ['client:read', 'action:execute', 'crm:*', 'whatsapp:*'],
  [ROLES.ANALYST]: ['client:read', 'analytics:read', 'ai:read'],
  [ROLES.VIEWER]: ['client:read', 'dashboard:read'],
};

/**
 * Enforce Authentication
 */
export function requireAuthentication(req, res, next) {
  const authHeader = req.header('Authorization') || req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Authentication token missing or malformed'));
  }

  const token = authHeader.substring(7).trim();
  const result = verifyToken(token);

  if (!result.valid) {
    return next(new AuthenticationError(`Invalid authentication token: ${result.reason}`));
  }

  req.user = result.payload;
  req.agencyId = result.payload.agencyId;
  next();
}

/**
 * Enforce Role Boundary
 */
export function requireRole(allowedRoles = []) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const userRole = req.user.role || ROLES.VIEWER;
    if (userRole === ROLES.OWNER || roles.includes(userRole)) {
      return next();
    }

    return next(new AuthorizationError(`Role "${userRole}" lacks access. Requires: [${roles.join(', ')}]`));
  };
}

/**
 * Enforce Granular Permission Boundary
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const userRole = req.user.role || ROLES.VIEWER;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (permissions.includes('*') || permissions.includes(permission)) {
      return next();
    }

    return next(new AuthorizationError(`User lacks required permission: "${permission}"`));
  };
}

export const authMiddleware = {
  ROLES,
  ROLE_PERMISSIONS,
  requireAuthentication,
  requireRole,
  requirePermission,
};

export default authMiddleware;
