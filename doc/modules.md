# Modules

Application module structure.

## App Module

- Root module importing all feature modules
- Registers global exception filters
- Configures Winston logger

## Prisma Module

- Provides global Prisma client access
- Handles database connection
- PostgreSQL adapter for Prisma v7

## Users Module

- User CRUD operations
- Password hashing with bcryptjs
- Zod validation schemas
- Exports UsersService for Auth module

## Auth Module

- JWT authentication
- Login endpoint
- Uses UsersService for validation
- Returns access tokens

## Common

- **Guards:** AuthGuard for route protection
- **Filters:** Global exception handling
- **Logger:** Winston configuration
- **Validators:** Legacy validation wrappers (use Zod schemas directly for new code)
