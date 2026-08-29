/**
 * Standardized API Error Definitions
 * Task 27 — Step 6: Normalized Error Handling
 */

export const API_ERROR_CODES = {
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  DUPLICATE_EXECUTION: 'DUPLICATE_EXECUTION',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  EXECUTION_BLOCKED: 'EXECUTION_BLOCKED',
};

export class ApiError extends Error {
  constructor(message, code = API_ERROR_CODES.PROVIDER_ERROR, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = details.status || 500;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = details.requestId || `REQ-ERR-${Date.now()}`;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
    };
  }
}

export function createApiError(message, code, details = {}) {
  return new ApiError(message, code, details);
}
