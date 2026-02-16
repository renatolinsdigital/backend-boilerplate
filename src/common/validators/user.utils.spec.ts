import {
  validateEmail,
  validatePasswordComplexity,
  validateRole,
  validateId,
  validateRequiredFields,
} from './user.utils';

describe('User Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.com',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        '',
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Invalid email format');
      });
    });
  });

  describe('validatePasswordComplexity', () => {
    it('should accept passwords meeting all requirements', () => {
      const validPasswords = ['Password1', 'MyP@ssw0rd', 'Test1234', 'Abcdefg1'];

      validPasswords.forEach((password) => {
        const result = validatePasswordComplexity(password);
        expect(result.isValid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePasswordComplexity('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must be at least 8 characters long');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePasswordComplexity('password1');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePasswordComplexity('PASSWORD1');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePasswordComplexity('Password');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain at least one number');
    });
  });

  describe('validateRole', () => {
    it('should accept valid roles (case insensitive)', () => {
      const validRoles = ['ADMIN', 'admin', 'Student', 'TEACHER', 'staff', 'Guest'];

      validRoles.forEach((role) => {
        const result = validateRole(role);
        expect(result.isValid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it('should reject invalid roles', () => {
      const invalidRoles = ['USER', 'MODERATOR', 'SUPERADMIN', ''];

      invalidRoles.forEach((role) => {
        const result = validateRole(role);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('Invalid role');
      });
    });
  });

  describe('validateId', () => {
    it('should accept valid numeric IDs', () => {
      const validIds = ['1', '42', '999', '12345'];

      validIds.forEach((id) => {
        const result = validateId(id);
        expect(result.isValid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it('should reject non-numeric IDs', () => {
      const invalidIds = ['abc', '', 'user123', '-5', '0'];

      invalidIds.forEach((id) => {
        const result = validateId(id);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Invalid user ID format');
      });
    });
  });

  describe('validateRequiredFields', () => {
    it('should return valid when all fields have values', () => {
      const result = validateRequiredFields({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should detect single missing field', () => {
      const result = validateRequiredFields({
        email: 'test@example.com',
        password: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('password is required');
    });

    it('should detect multiple missing fields', () => {
      const result = validateRequiredFields({
        email: '',
        password: null,
        name: 'Test',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('email and password are required');
    });

    it('should handle undefined and null values', () => {
      const result = validateRequiredFields({
        email: undefined,
        password: null,
        name: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('are required');
    });
  });
});
