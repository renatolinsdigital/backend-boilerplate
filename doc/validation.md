# Input Validation

The application uses centralized validation utilities to ensure data integrity and prevent injection attacks.

## Validation Architecture

**Location**: `src/common/validators/`

The validation system is divided into domain-specific modules. Examples:

### User Validation ([user.utils.ts](../src/common/validators/user.utils.ts))

- **validateEmail()** - Email format validation using regex
- **validatePasswordComplexity()** - Password strength validation (medium level)
- **validateRole()** - User role validation against allowed values
- **validateId()** - Numeric ID format validation
- **validateRequiredFields()** - Required field presence validation

### Pagination Validation ([pagination.utils.ts](../src/common/validators/pagination.utils.ts))

- **validatePagination()** - Page and limit parameter validation
  - Page must be a positive integer
  - Limit must be an integer between 1 and 1000

## Validation Pattern

All validators return a consistent `ValidationResult` interface:

```typescript
interface ValidationResult {
  isValid: boolean;
  message?: string; // Error message if invalid
}
```

**Usage Example:**

```typescript
const passwordValidation = validatePasswordComplexity(body.password);
if (!passwordValidation.isValid) {
  throw new BadRequestException(passwordValidation.message);
}
```
