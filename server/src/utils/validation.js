/**
 * Lightweight Centralized Request Validation Utilities
 * Task 28 — Step 2: Request Validation Foundation
 */

import { ValidationError } from './errors.js';

export function validateRequired(value, fieldName = 'Field') {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`"${fieldName}" is required and cannot be empty.`, { field: fieldName });
  }
  return value;
}

export function validateString(value, fieldName = 'Field', min = 1, max = 255) {
  validateRequired(value, fieldName);
  if (typeof value !== 'string') {
    throw new ValidationError(`"${fieldName}" must be a string.`, { field: fieldName });
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new ValidationError(`"${fieldName}" length must be between ${min} and ${max} characters.`, {
      field: fieldName,
      min,
      max,
    });
  }
  return trimmed;
}

export function validateEmail(email, fieldName = 'email') {
  const str = validateString(email, fieldName, 5, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    throw new ValidationError(`"${fieldName}" must be a valid email address.`, { field: fieldName });
  }
  return str.toLowerCase();
}

export function validateEnum(value, allowedValues = [], fieldName = 'Field') {
  validateRequired(value, fieldName);
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `Invalid value for "${fieldName}". Allowed values: [${allowedValues.join(', ')}].`,
      { field: fieldName, allowedValues }
    );
  }
  return value;
}

export function validateNumber(value, fieldName = 'Field', min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === null) {
    throw new ValidationError(`"${fieldName}" is required.`, { field: fieldName });
  }
  const num = Number(value);
  if (isNaN(num) || !isFinite(num) || num < min || num > max) {
    throw new ValidationError(`"${fieldName}" must be a valid number between ${min} and ${max}.`, {
      field: fieldName,
      min,
      max,
    });
  }
  return num;
}

export function validateId(id, fieldName = 'id') {
  return validateString(id, fieldName, 1, 128);
}

export const validator = {
  validateRequired,
  validateString,
  validateEmail,
  validateEnum,
  validateNumber,
  validateId,
};

export default validator;
