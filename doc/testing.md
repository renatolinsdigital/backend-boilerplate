# Testing

Unit testing with Jest and TypeScript support.

## Quick Start

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:cov     # With coverage report
```

## Coverage

- **26 unit tests** covering validators, services
- **Coverage report:** `coverage/lcov-report/index.html`
- Test files: `*.spec.ts` alongside source code

## Test Structure

Tests use AAA pattern (Arrange, Act, Assert):

```typescript
describe('Service', () => {
  let service: Service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [Service],
    }).compile();
    service = module.get<Service>(Service);
  });

  it('should do something', () => {
    const result = service.method('input');
    expect(result).toBe('expected');
  });
});
```

## Mocking Dependencies

```typescript
const mockService = {
  method: jest.fn(),
};

providers: [
  ServiceUnderTest,
  { provide: Dependency, useValue: mockService },
];
```

## Best Practices

- Use descriptive test names
- Test edge cases and errors
- Clean up mocks: `afterEach(() => jest.clearAllMocks())`
- Mock external dependencies (database, APIs)
- Keep tests fast and isolated

## Troubleshooting

```bash
npx jest --clearCache        # Clear cache
npm test -- --verbose        # Verbose output
npm test -- file.spec.ts     # Run specific file
```

## Resources

- [Jest Docs](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
