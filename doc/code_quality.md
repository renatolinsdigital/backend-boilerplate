# Code Quality Guide

This document outlines the code quality standards, best practices, and tooling used in the BackEnd Boilerplate project.

---

## Table of Contents

- [JavaScript/TypeScript Best Practices](#javascripttypescript-best-practices)
- [Naming Conventions](#naming-conventions)
- [Linting with ESLint](#linting-with-eslint)
- [Code Formatting with Prettier](#code-formatting-with-prettier)
- [Git Hooks with Husky](#git-hooks-with-husky)
- [Development Workflow](#development-workflow)

---

## JavaScript/TypeScript Best Practices

### General Principles

1. **Write Clean, Readable Code**
   - Code is read more often than it's written
   - Prioritize clarity over cleverness
   - Use meaningful variable and function names

2. **Follow the Single Responsibility Principle**
   - Each function should do one thing well
   - Each class/module should have one reason to change
   - Keep functions small and focused

3. **Avoid `any` Type**
   - Always specify types in TypeScript
   - Use `unknown` instead of `any` when type is truly unknown
   - Create interfaces/types for complex objects

4. **Use Async/Await Over Callbacks**

   ```typescript
   // ✅ Good
   async function getUser(id: number) {
     const user = await this.prisma.user.findUnique({ where: { id } });
     return user;
   }

   // ❌ Avoid
   function getUser(id: number, callback: Function) {
     this.prisma.user.findUnique({ where: { id } }).then(callback);
   }
   ```

5. **Handle Errors Properly**

   ```typescript
   // ✅ Good - Specific error handling
   try {
     await this.service.performAction();
   } catch (error) {
     if (error instanceof ValidationError) {
       throw new BadRequestException(error.message);
     }
     this.logger.error('Unexpected error', error.stack);
     throw new InternalServerErrorException();
   }

   // ❌ Avoid - Silent failures or generic catches
   try {
     await this.service.performAction();
   } catch (error) {
     // Silent failure - no handling
   }
   ```

6. **Destructure Objects and Arrays**

   ```typescript
   // ✅ Good
   const { email, name, role } = user;
   const [first, second] = items;

   // ❌ Avoid
   const email = user.email;
   const name = user.name;
   const role = user.role;
   ```

7. **Use Optional Chaining and Nullish Coalescing**

   ```typescript
   // ✅ Good
   const userName = user?.profile?.name ?? 'Anonymous';

   // ❌ Avoid
   const userName = user && user.profile && user.profile.name ? user.profile.name : 'Anonymous';
   ```

8. **Prefer `const` Over `let`, Avoid `var`**

   ```typescript
   // ✅ Good
   const apiKey = process.env.API_KEY;
   let counter = 0;

   // ❌ Avoid
   var apiKey = process.env.API_KEY;
   ```

9. **Use Template Literals**

   ```typescript
   // ✅ Good
   const message = `User ${id} logged in successfully`;

   // ❌ Avoid
   const message = 'User ' + id + ' logged in successfully';
   ```

10. **Avoid Deep Nesting**

    ```typescript
    // ✅ Good - Early returns
    async function processUser(id: number) {
      const user = await this.findUser(id);
      if (!user) {
        throw new NotFoundException();
      }

      if (user.isBlocked) {
        throw new ForbiddenException();
      }

      return this.processValidUser(user);
    }

    // ❌ Avoid - Deep nesting
    async function processUser(id: number) {
      const user = await this.findUser(id);
      if (user) {
        if (!user.isBlocked) {
          return this.processValidUser(user);
        } else {
          throw new ForbiddenException();
        }
      } else {
        throw new NotFoundException();
      }
    }
    ```

---

## Naming Conventions

### General Rules

- Use **camelCase** for variables, functions, and methods
- Use **PascalCase** for classes, interfaces, types, and enums
- Use **UPPER_SNAKE_CASE** for constants
- Use descriptive names that reveal intent

### Variables

```typescript
// ✅ Good
const userId = 123;
const totalPrice = 99.99;
const activeUsers = [];

// ❌ Avoid
const uid = 123;
const tp = 99.99;
const arr = [];
```

### Booleans

Always prefix boolean variables with `is` or `has`:

```typescript
// ✅ Good
const isActive = true;
const hasPermission = false;

// ❌ Avoid
const active = true;
const permission = false;
const edit = user.role === 'ADMIN';
```

### Functions and Methods

Use verbs to describe actions:

```typescript
// ✅ Good
function createUser(data: CreateUserDto) {}
function getUser(id: number) {}
function validateEmail(email: string) {}
function calculateTotal(items: Item[]) {}
function isAuthenticated() {}
function hasRole(role: Role) {}

// ❌ Avoid
function user(data: CreateUserDto) {}
function userById(id: number) {}
function email(email: string) {}
```

### Classes and Interfaces

```typescript
// ✅ Good - Classes
class UserService {}
class AuthGuard {}
class HttpExceptionFilter {}

// ✅ Good - Interfaces
interface CreateUserDto {}
interface ValidationResult {}
interface JwtPayload {}

// ❌ Avoid - Don't prefix interfaces with 'I'
interface IUser {} // TypeScript community convention: no 'I' prefix
```

### Constants

```typescript
// ✅ Good
const DEFAULT_PAGE_SIZE = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const JWT_EXPIRATION = '7d';

// ❌ Avoid
const defaultPageSize = 10;
const max_login_attempts = 5;
```

### Files

- Use **kebab-case** for file names
- Be descriptive and specific

```
✅ Good:
- user.service.ts
- auth.controller.ts
- user-not-found.exception.ts
- pagination.utils.ts

❌ Avoid:
- UserService.ts
- auth_controller.ts
- exception.ts
```

---

## Linting with ESLint

### Overview

This project uses **ESLint** with **@typescript-eslint** for static code analysis and enforcing code quality standards.

### Running ESLint

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Configuration and key rules

The ESLint setup is defined in `eslint.config.js` using the ESLint v9 flat config format. The configurations described here are examples of how the project can be structured, including recommended TypeScript rules, consistent code style enforcement, and Prettier integration. Example rules include warning against explicit `any` types to encourage proper typing, requiring unused variables, parameters, or caught errors to start with `_` to be ignored, and allowing `console.log` during development while recommending proper logging in production. It also commonly ignores folders such as `dist/`, `node_modules/`, `prisma/migrations/`, utility scripts, and log or environment files.

---

## Code Formatting with Prettier

### Overview

**Prettier** handles all code formatting automatically, ensuring consistent style across the codebase.

### Configuration

Defined in `.prettierrc`:

```json
{
  "semi": true, // Always use semicolons
  "trailingComma": "all", // Trailing commas where valid
  "singleQuote": true, // Use single quotes
  "printWidth": 100, // Max line length: 100 characters
  "tabWidth": 2, // 2 spaces for indentation
  "endOfLine": "lf" // Unix-style line endings
}
```

### Running Prettier

```bash
# Format all code
npm run format

# Check if code is formatted correctly
npm run format:check
```

### Integration with ESLint

Prettier runs through ESLint via `eslint-plugin-prettier`, ensuring no conflicts between linting and formatting rules.

### Examples

```typescript
// Prettier automatically formats to:
const user = {
  id: 1,
  email: 'user@example.com',
  role: 'ADMIN', // Trailing comma
};

const message = 'Hello world'; // Single quotes

// Long lines are wrapped at 100 characters
const result = await this.service.performComplexOperation(param1, param2, param3, param4);
```

---

## Git Hooks with Husky

### Overview

**Husky** manages Git hooks, running automated checks before commits to ensure code quality.

### Pre-commit Hook

Located at `.husky/pre-commit`, it runs **lint-staged** on all staged files:

```bash
npx lint-staged
```

### What Happens on Commit

When you run `git commit`:

1. **Backup** - Original state is backed up in git stash
2. **Lint-staged runs** - Only staged files are processed
3. **ESLint** - Runs `eslint --fix` on `.js` and `.ts` files
4. **Prettier** - Runs `prettier --write` on staged files
5. **Auto-fix** - Fixed files are re-staged automatically
6. **Validation** - If unfixable errors exist, commit is blocked
7. **Commit** - If all checks pass, commit proceeds

### Configuration

Defined in `package.json`:

```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

### Benefits

- ✅ **Automatic** - No manual formatting needed
- ✅ **Fast** - Only staged files are checked
- ✅ **Consistent** - All commits meet quality standards
- ✅ **Prevents bugs** - Catches issues before they enter codebase
- ✅ **Clean history** - All committed code is properly formatted

### Bypassing Hooks (Not Recommended)

If you absolutely need to bypass hooks:

```bash
git commit --no-verify -m "Emergency fix"
```

⚠️ **Warning:** Only use this in extreme emergencies. All code should pass quality checks.

---

## Development Workflow

### Daily Development

1. **Write code** - Focus on functionality
2. **Save files** - VS Code may auto-format if configured
3. **Stage changes** - `git add .`
4. **Commit** - `git commit -m "descriptive message"`
5. **Hooks run automatically** - Code is linted and formatted
6. **Fix any errors** - If hooks fail, fix issues and commit again

### Before Creating PR

```bash
# Run full linting check
npm run lint

# Verify formatting
npm run format:check

# Run all tests (when implemented)
npm run test
```

### Recommended VS Code Extensions

Install these extensions for the best development experience:

- **ESLint** (`dbaeumer.vscode-eslint`) - Real-time linting
- **Prettier** (`esbenp.prettier-vscode`) - Format on save
- **TypeScript** (built-in) - TypeScript support

### VS Code Settings

The project includes `.vscode/settings.json` to provide **real-time code quality feedback** as you develop. While git hooks ensure quality at commit time, VS Code settings give you immediate feedback while coding.

**Why this file is necessary:** Automatic formatting on save ensures that your code is consistently formatted every time you save a file, with Prettier handling it automatically in the background. This promotes team consistency by aligning editor behavior and formatting standards across all developers. It also accelerates development, as issues are identified and corrected immediately rather than only during the commit phase. The result is a smoother and more efficient developer experience, eliminating the need to manually execute formatting commands.

Current project configuration: `.vscode/settings.json`. Some of the main settings used are:

- `"editor.formatOnSave": true` - Automatically runs Prettier on every save
- `"editor.defaultFormatter"` - Uses Prettier as the default formatter for all files
- `"source.fixAll": "explicit"` - Auto-fixes all fixable linting errors (ESLint, etc.) on save

**Note:** This file is committed to the repository to ensure consistent behavior across the team. Make sure you have the required VS Code extensions installed for these settings to work properly.

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [NestJS Style Guide](https://docs.nestjs.com/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Husky Documentation](https://typicode.github.io/husky/)

---

## Summary

This project enforces code quality through:

1. **Automated tools** - ESLint, Prettier, and Husky work together
2. **Best practices** - Follow JavaScript/TypeScript conventions
3. **Naming conventions** - Consistent, descriptive names
4. **Git hooks** - Quality checks on every commit
5. **Developer experience** - Fast feedback, automatic fixes

Following these guidelines ensures the codebase remains clean, maintainable, and consistent across all contributions.
