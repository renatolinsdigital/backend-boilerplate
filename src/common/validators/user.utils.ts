/**
 * Validation utility functions for input validation across controllers
 * Using Zod for type-safe schema validation
 */

import { ZodError } from 'zod';
import { ValidationResult } from './models';
import {
  emailSchema,
  passwordSchema,
  roleSchema,
  idSchema,
  createRequiredFieldsSchema,
} from '../../users/users.schemas';

/**
 * Validates email format using Zod schema
 * @param email - Email address to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        message: error.issues[0]?.message || 'Invalid email format',
      };
    }
    return {
      isValid: false,
      message: 'Invalid email format',
    };
  }
}

/**
 * Validates password complexity (medium level) using Zod schema
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
  try {
    passwordSchema.parse(password);
    return { isValid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        message: error.issues[0]?.message || 'Invalid password format',
      };
    }
    return {
      isValid: false,
      message: 'Invalid password format',
    };
  }
}

/**
 * Validates user role using Zod schema
 * @param role - Role to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateRole(role: string): ValidationResult {
  try {
    roleSchema.parse(role.toUpperCase());
    return { isValid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        message:
          error.issues[0]?.message ||
          'Invalid role. Must be one of: ADMIN, STUDENT, TEACHER, STAFF, GUEST',
      };
    }
    return {
      isValid: false,
      message: 'Invalid role. Must be one of: ADMIN, STUDENT, TEACHER, STAFF, GUEST',
    };
  }
}

/**
 * Validates numeric ID format using Zod schema
 * @param id - ID string to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateId(id: string): ValidationResult {
  try {
    idSchema.parse(id);
    return { isValid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        message: error.issues[0]?.message || 'Invalid user ID format',
      };
    }
    return {
      isValid: false,
      message: 'Invalid user ID format',
    };
  }
}

/**
 * Validates required fields using Zod schema
 * @param fields - Object containing field names and their values
 * @returns ValidationResult with validation status and error message if invalid
 */
export function validateRequiredFields(fields: Record<string, unknown>): ValidationResult {
  try {
    const schema = createRequiredFieldsSchema(fields);
    schema.parse(fields);
    return { isValid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const missingField = error.issues[0]?.path?.[0];
      const message = error.issues[0]?.message;
      return {
        isValid: false,
        message: message || `${String(missingField)} is required`,
      };
    }
    return {
      isValid: false,
      message: 'Required field validation failed',
    };
  }
}
