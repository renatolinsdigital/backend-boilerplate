/**
 * Pagination validation utility functions
 */

import { ValidationResult } from './models';

/**
 * Validates pagination parameters
 * @param page - Page number
 * @param limit - Items per page limit
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validatePagination(page: string, limit: string): ValidationResult {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
    return {
      isValid: false,
      message: 'Page must be a positive integer',
    };
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000 || !Number.isInteger(limitNum)) {
    return {
      isValid: false,
      message: 'Limit must be an integer between 1 and 1000',
    };
  }

  return { isValid: true };
}
