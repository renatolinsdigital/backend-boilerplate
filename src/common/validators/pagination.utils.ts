/**
 * Pagination validation utility functions
 * Using Zod for type-safe schema validation
 */

import { ZodError } from 'zod';
import { ValidationResult } from './models';
import { paginationSchema } from '../../users/users.schemas';

/**
 * Validates pagination parameters using Zod schema
 * @param page - Page number
 * @param limit - Items per page limit
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validatePagination(page: string, limit: string): ValidationResult {
  try {
    paginationSchema.parse({ page, limit });
    return { isValid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        message: error.issues[0]?.message || 'Invalid pagination parameters',
      };
    }
    return {
      isValid: false,
      message: 'Invalid pagination parameters',
    };
  }
}
