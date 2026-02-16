# Testing Guide

This project uses **Jest** as the testing framework with full TypeScript support via **ts-jest**.

## Test Structure

Tests are located alongside their source files with the `.spec.ts` extension:

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov
```

### Coverage Output

The coverage report is generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html` (open in browser)
- **Text Summary**: Displayed in terminal
- **LCOV Format**: `coverage/lcov.info` (for CI/CD integration)

## Writing Tests

### Test Example Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceName /* dependencies */],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Mocking Dependencies

#### Mocking Services

```typescript
const mockUsersService = {
  findOneByEmail: jest.fn(),
  create: jest.fn(),
};

const module: TestingModule = await Test.createTestingModule({
  providers: [
    AuthService,
    {
      provide: UsersService,
      useValue: mockUsersService,
    },
  ],
}).compile();
```

#### Mocking External Libraries

```typescript
jest.mock('bcryptjs');

// In test
(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
```

### Testing Best Practices

1. **AAA Pattern**: Arrange, Act, Assert

   ```typescript
   it('should validate email', () => {
     // Arrange
     const email = 'test@example.com';

     // Act
     const result = validateEmail(email);

     // Assert
     expect(result.isValid).toBe(true);
   });
   ```

2. **Test Edge Cases**: Always test boundary conditions

   ```typescript
   it('should reject emails without @ symbol', () => {
     const result = validateEmail('notanemail');
     expect(result.isValid).toBe(false);
   });
   ```

3. **Clear Test Names**: Use descriptive test names

   ```typescript
   // ✅ Good
   it('should return 401 when password is incorrect');

   // ❌ Bad
   it('test login');
   ```

4. **Clean Up After Tests**

   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

5. **Mock External Dependencies**: Never hit real database or APIs
   ```typescript
   const mockPrismaService = {
     user: {
       findUnique: jest.fn(),
       create: jest.fn(),
     },
   };
   ```

## Testing Validators

Validators are pure functions, making them easy to test:

```typescript
describe('validateEmail', () => {
  it('should accept valid emails', () => {
    const validEmails = ['user@example.com', 'test.user@domain.co.uk'];

    validEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
    });
  });

  it('should reject invalid emails', () => {
    const invalidEmails = ['notanemail', '@example.com'];

    invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid email format');
    });
  });
});
```

## Testing Services

Services require mocking of dependencies:

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { validateUser: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return access token on successful login', async () => {
    // Mock implementations
    jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser);
    jest.spyOn(jwtService, 'sign').mockReturnValue('token');

    const result = await service.login('test@example.com', 'Password123');

    expect(result.access_token).toBe('token');
  });
});
```

## Configuration

Jest configuration is in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
};
```

## CI/CD Integration

To integrate tests into CI/CD pipeline:

```yaml
# Example: GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:cov

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Tests Failing Locally

```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- user.utils.spec.ts
```

### Mock Not Working

Ensure you're clearing mocks between tests:

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

### TypeScript Errors in Tests

Make sure `@types/jest` is installed:

```bash
npm install --save-dev @types/jest
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
