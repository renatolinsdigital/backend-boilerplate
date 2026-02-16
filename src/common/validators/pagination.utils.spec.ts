import { validatePagination } from './pagination.utils';

describe('Pagination Validation Utils', () => {
  describe('validatePagination', () => {
    it('should accept valid pagination parameters', () => {
      const validCases = [
        { page: '1', limit: '10' },
        { page: '5', limit: '50' },
        { page: '100', limit: '1000' },
        { page: '1', limit: '1' },
      ];

      validCases.forEach(({ page, limit }) => {
        const result = validatePagination(page, limit);
        expect(result.isValid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it('should reject invalid page numbers', () => {
      const invalidPages = [
        { page: '0', limit: '10', expectedMessage: 'Page must be a positive integer' },
        { page: '-1', limit: '10', expectedMessage: 'Page must be a positive integer' },
        { page: 'abc', limit: '10', expectedMessage: 'Page must be a positive integer' },
        { page: '', limit: '10', expectedMessage: 'Page must be a positive integer' },
        { page: '3.5', limit: '10', expectedMessage: 'Page must be a positive integer' },
        { page: '2.99', limit: '10', expectedMessage: 'Page must be a positive integer' },
      ];

      invalidPages.forEach(({ page, limit, expectedMessage }) => {
        const result = validatePagination(page, limit);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe(expectedMessage);
      });
    });

    it('should reject invalid limit values', () => {
      const invalidLimits = [
        { page: '1', limit: '0', expectedMessage: 'Limit must be an integer between 1 and 1000' },
        { page: '1', limit: '-5', expectedMessage: 'Limit must be an integer between 1 and 1000' },
        {
          page: '1',
          limit: '1001',
          expectedMessage: 'Limit must be an integer between 1 and 1000',
        },
        { page: '1', limit: 'xyz', expectedMessage: 'Limit must be an integer between 1 and 1000' },
        { page: '1', limit: '', expectedMessage: 'Limit must be an integer between 1 and 1000' },
        {
          page: '1',
          limit: '10.5',
          expectedMessage: 'Limit must be an integer between 1 and 1000',
        },
        {
          page: '1',
          limit: '50.99',
          expectedMessage: 'Limit must be an integer between 1 and 1000',
        },
      ];

      invalidLimits.forEach(({ page, limit, expectedMessage }) => {
        const result = validatePagination(page, limit);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe(expectedMessage);
      });
    });

    it('should accept limit at boundaries', () => {
      const result1 = validatePagination('1', '1');
      expect(result1.isValid).toBe(true);

      const result2 = validatePagination('1', '1000');
      expect(result2.isValid).toBe(true);
    });
  });
});
