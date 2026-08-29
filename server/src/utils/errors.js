/**
 * Standardized Backend Error Classes & Codes
 * Task 28 — Step 5: Complete Normalized Backend Error Hierarchy
 */

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXECUTION_BLOCKED: 'EXECUTION_BLOCKED',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
};

export class AppError extends Error {
  constructor(message, code = ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = {}) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required or invalid credentials', details = {}) {
    super(message, ERROR_CODES.AUTHENTICATION_ERROR, 401, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden: Insufficient permissions or tenant mismatch', details = {}) {
    super(message, ERROR_CODES.AUTHORIZATION_ERROR, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource not found', details = {}) {
    super(message, ERROR_CODES.NOT_FOUND, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict or duplicate execution', details = {}) {
    super(message, ERROR_CODES.CONFLICT, 409, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed or constraint violated', details = {}) {
    super(message, ERROR_CODES.DATABASE_ERROR, 500, details);
  }
}

export class ExecutionBlockedError extends AppError {
  constructor(message = 'Real production execution is strictly blocked in this environment', details = {}) {
    super(message, ERROR_CODES.EXECUTION_BLOCKED, 403, details);
  }
}

export default {
  ERROR_CODES,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExecutionBlockedError,
};
