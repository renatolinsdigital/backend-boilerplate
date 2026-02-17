# Code Quality

Standards and tooling for maintaining code quality.

## Tools

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files only

## Commands

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
npm run format:check  # Check formatting
```

## Best Practices

**TypeScript:**

- Avoid `any` - use specific types or `unknown`
- Use interfaces for objects
- Leverage type inference

**Code Style:**

- Use `const` over `let`, never `var`
- Prefer async/await over callbacks
- Use template literals for strings
- Destructure objects and arrays
- Use optional chaining: `user?.profile?.name`
- Early returns over deep nesting

**Error Handling:**

- Catch specific error types
- Use appropriate HTTP exceptions
- Log errors with stack traces
- Never silent catches

**Naming:**

- camelCase: variables, functions
- PascalCase: classes, interfaces, types
- UPPER_SNAKE_CASE: constants
- Booleans: prefix with `is` or `has`
- Functions: use verbs (createUser, validateEmail)

## Git Hooks

**Pre-commit** (via Husky):

- Runs ESLint on staged files
- Runs Prettier for enforcement
- Prevents commits with lint errors

## Configuration

- ESLint: `eslint.config.js`
- Prettier: `.prettierrc` (if exists, or uses defaults)
- Husky: `.husky/pre-commit`
- lint-staged: `package.json`

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Docs](https://prettier.io/docs/en/)
