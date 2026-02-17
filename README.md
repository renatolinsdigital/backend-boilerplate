# BackEnd Boilerplate

A **Node.js + NestJS** back-end application with **Prisma** as ORM for **PostgreSQL**. Includes user management and basic authentication.

![Print](print/swagger_print.png)

## Main Stack

- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **NestJS** - Progressive framework with dependency injection
- **PostgreSQL** - Relational database
- **Prisma** - Type-safe ORM with migrations

## Tools & Libraries

- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation for data and environment variables
- **Winston** - Structured logging
- **Swagger/OpenAPI** - Interactive API documentation
- **Jest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks

## Running the project

To have this project up and running on your machine, check the **[Setup Guide](doc/setup.md)**, then access the API at `http://localhost:3000`

## Technical Implementations

- ✅ Modular and scalable architecture
- ✅ JWT authentication with configurable expiration
- ✅ CORS configuration for cross-origin access control
- ✅ User management (create, retrieve, delete)
- ✅ Paginated user listing
- ✅ Password security (bcrypt + complexity validation)
- ✅ Data and Environment variables validation with Zod
- ✅ Global exception filters
- ✅ Health check endpoint with database connectivity
- ✅ Unit testing with Jest
- ✅ Production-ready logging with Winston (daily rotation, multiple levels)
- ✅ Interactive API documentation with Swagger/OpenAPI
- ✅ Code quality with ESLint + Prettier + Git hooks

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run free         # Kill any process using port 3000
npm run clean        # Remove build artifacts and cache files (uses .gitignore as reference)

# Building
npm run build        # Compile TypeScript to JavaScript

# Code Quality
npm run lint         # Check code for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm test             # Run all unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage report

# Database
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Run database migrations
```

## Documentation

- **[Setup & Getting Started](doc/setup.md)** - Installation and configuration
- **[API Documentation](http://localhost:3000/swagger)** - Interactive Swagger UI (run `npm run dev` first)
- **[Testing](doc/testing.md)** - Unit testing guide
- **[Logging](doc/logging.md)** - Winston logging with daily rotation
- **[Security](doc/security.md)** - Authentication, password hashing, CORS
- **[Validation](doc/zod_validation.md)** - Zod schema validation
- **[Code Quality](doc/code_quality.md)** - Linting, formatting, git hooks
- **[Modules](doc/modules.md)** - Application module structure
- **[Extending](doc/extending.md)** - Adding new features
