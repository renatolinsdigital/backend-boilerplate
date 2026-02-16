# BackEnd Boilerplate - Implemented Features

## Core Stack

- **Framework**: NestJS 10.0.0 with TypeScript
- **Database**: PostgreSQL with Prisma ORM 7.4.0
- **Logging**: Winston with daily log rotation and multiple transports
- **Runtime**: Node.js with ts-node-dev for development

## Authentication & Security

- JWT-based authentication (@nestjs/jwt 11.0.2)
  - 7-day token expiration
  - AuthGuard protecting sensitive endpoints
- Password security with bcryptjs (10 salt rounds)
- Password complexity: 8+ chars, uppercase, lowercase, number
- Role system: ADMIN, STUDENT, TEACHER, STAFF, GUEST (enum in database)

## API Endpoints

- `GET /` - Health check (uptime, database status, version)
- `POST /auth/login` - User authentication
- `POST /users/register` - User registration (public)
- `GET /users` - List users with pagination (protected)
- `GET /users/:id` - Get user by ID (protected)
- `DELETE /users/:id` - Delete user (protected)

## API Documentation

- **Swagger/OpenAPI** - Interactive API documentation at `/swagger`
  - Auto-generated from controller decorators
  - Try-it-out functionality for testing endpoints
  - JWT Bearer token authentication support
  - Request/response schemas with examples
  - Organized by tags (Health, Authentication, Users)
  - Available at [http://localhost:3000/swagger](http://localhost:3000/swagger) when server is running

## Validation

- Centralized validators in [src/common/validators](../src/common/validators)
  - Email format validation
  - Password complexity validation
  - Role validation (enum check)
  - User ID validation (positive integer)
  - Pagination validation (page > 0, limit 1-1000)
  - Required fields validation
- Consistent `ValidationResult` interface for all validators

## Configuration

- Environment validation with Zod at startup
  - `DATABASE_URL` (required)
  - `JWT_SECRET` (required, min 32 chars)
  - `JWT_EXPIRES_IN` (optional, default "7d")
  - `NODE_ENV` (development/production/test)
  - `LOG_LEVEL` (optional, controlled by NODE_ENV)
- ConfigService for type-safe environment access
- Fail-fast on invalid configuration

## Error Handling

- Global exception filters
  - `AllExceptionsFilter` - catches all exceptions
  - `HttpExceptionFilter` - HTTP-specific handling
- Custom exceptions: `UserNotFoundException`, `CustomUnauthorizedException`
- Consistent error response format

## Database

- Prisma ORM with PostgreSQL adapter
- User model with email uniqueness constraint
- Migration system (`npm run prisma:migrate`)
- Type-safe queries with automatic SQL injection prevention

## Code Quality & Development Tools

- **ESLint** - TypeScript/JavaScript linting with @typescript-eslint
  - Configured for NestJS best practices
  - Warns on `any` type usage
  - Enforces consistent code style
- **Prettier** - Automatic code formatting
  - Single quotes, semicolons, trailing commas
  - 100 character line width
  - LF line endings
- **Git Hooks with Husky** - Automated quality checks
  - Pre-commit hook runs `lint-staged`
  - Auto-formats and lints staged files before commit
  - Ensures all committed code passes quality checks
- **Commands**
  - `npm run lint` - Check for linting errors
  - `npm run lint:fix` - Auto-fix linting errors
  - `npm run format` - Format all code with Prettier
  - `npm run format:check` - Verify code formatting

## Testing

- **Jest** - JavaScript testing framework with TypeScript support
  - 41 unit tests covering core functionality
  - Test files located alongside source files (`.spec.ts`)
  - 100% coverage for validators and services
- **@nestjs/testing** - NestJS testing utilities
  - Dependency mocking and injection
  - Service and controller testing support
- **Test Coverage**
  - Validators: 100% coverage (email, password, role, ID, pagination)
  - Auth Service: 100% coverage (login, token verification)
  - Users Service: 100% coverage (CRUD, password hashing, pagination)
- **Commands**
  - `npm test` - Run all unit tests
  - `npm run test:watch` - Run tests in watch mode
  - `npm run test:cov` - Generate coverage report
- **Coverage Report** - HTML report available at `coverage/lcov-report/index.html`

## Logging System

- **Winston** - Production-ready logging with multiple transports
  - Multiple log levels: error, warn, info, debug
  - Environment-aware configuration (development vs production)
  - Colorized console output for better readability
  - JSON format for file logs (easy parsing and analysis)
- **Daily Log Rotation** - Automatic file rotation with winston-daily-rotate-file
  - Daily folder structure: `logs/YYYY-MM-DD/application.log`
  - Separate files for application, error, and debug logs
  - Automatic cleanup based on retention policies
  - Log compression (gzip) for old files
- **Log Files**
  - `logs/YYYY-MM-DD/application.log` - All application logs (14-day retention, 20MB max)
  - `logs/YYYY-MM-DD/error.log` - Error-level logs only (30-day retention)
  - `logs/YYYY-MM-DD/debug.log` - Debug logs (7-day retention, development only)
- **NestJS Integration** - Full integration with NestJS internal logging
  - All framework logs (route mapping, module initialization) captured by Winston
  - Custom logger provider via WINSTON_MODULE_NEST_PROVIDER
  - Consistent log format across application and framework logs
- **Structured Logging**
  - Metadata support for context and additional data
  - Service name and environment included in all logs
  - Timestamp in YYYY-MM-DD HH:mm:ss format
- **Documentation** - See [Logging Guide](logging.md) for usage examples and best practices
