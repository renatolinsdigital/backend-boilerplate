/**
 * Validation utility functions for input validation across controllers
 */

import { ValidationResult } from './models';

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Invalid email format',
    };
  }

  return { isValid: true };
}

/**
 * Validates password complexity (medium level)
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @param password - Password to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validatePasswordComplexity(password: string): ValidationResult {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  return { isValid: true };
}

/**
 * Validates user role
 * @param role - Role to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateRole(role: string): ValidationResult {
  const validRoles = ['ADMIN', 'STUDENT', 'TEACHER', 'STAFF', 'GUEST'];

  if (!validRoles.includes(role.toUpperCase())) {
    return {
      isValid: false,
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates numeric ID format
 * @param id - ID string to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateId(id: string): ValidationResult {
  const numericId = Number(id);

  if (isNaN(numericId) || numericId < 1) {
    return {
      isValid: false,
      message: 'Invalid user ID format',
    };
  }

  return { isValid: true };
}

/**
 * Validates required fields
 * @param fields - Object containing field names and their values
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateRequiredFields(fields: Record<string, unknown>): ValidationResult {
  const missingFields = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `${missingFields.join(' and ')} ${missingFields.length === 1 ? 'is' : 'are'} required`,
    };
  }

  return { isValid: true };
}
