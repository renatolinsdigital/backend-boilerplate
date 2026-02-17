/**
 * Zod validation schemas for input validation
 * Centralized schemas for type-safe validation across controllers
 */

import { z } from 'zod';

/**
 * Email validation schema
 * Validates email format using Zod's built-in email validation
 */
export const emailSchema = z
  .string()
  .email({ message: 'Invalid email format' })
  .trim()
  .toLowerCase();

/**
 * Password complexity schema (medium level)
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

/**
 * User role validation schema
 * Validates against allowed user roles
 */
export const roleSchema = z.enum(['ADMIN', 'STUDENT', 'TEACHER', 'STAFF', 'GUEST'], {
  message: 'Invalid role. Must be one of: ADMIN, STUDENT, TEACHER, STAFF, GUEST',
});

/**
 * Numeric ID validation schema
 * Validates that the ID is a positive integer
 */
export const idSchema = z.coerce
  .number({
    message: 'Invalid user ID format',
  })
  .int({ message: 'ID must be an integer' })
  .positive({ message: 'ID must be a positive number' });

/**
 * Pagination page number schema
 * Validates page parameter (positive integer)
 */
export const pageSchema = z.coerce
  .number({
    message: 'Page must be a positive integer',
  })
  .int({ message: 'Page must be a positive integer' })
  .positive({ message: 'Page must be a positive integer' });

/**
 * Pagination limit schema
 * Validates limit parameter (integer between 1 and 1000)
 */
export const limitSchema = z.coerce
  .number({
    message: 'Limit must be an integer between 1 and 1000',
  })
  .int({ message: 'Limit must be an integer between 1 and 1000' })
  .min(1, { message: 'Limit must be an integer between 1 and 1000' })
  .max(1000, { message: 'Limit must be an integer between 1 and 1000' });

/**
 * Pagination schema combining page and limit
 */
export const paginationSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
});

/**
 * User registration schema
 * Validates complete user registration data
 */
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional(),
  role: roleSchema.optional(),
});

/**
 * User login schema
 * Validates login credentials
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

/**
 * Required fields schema builder
 * Creates a schema for validating required fields from a record
 */
export const createRequiredFieldsSchema = (fields: Record<string, unknown>) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const key of Object.keys(fields)) {
    schemaShape[key] = z.any().refine((val) => val !== undefined && val !== null && val !== '', {
      message: `${key} is required`,
    });
  }

  return z.object(schemaShape);
};
