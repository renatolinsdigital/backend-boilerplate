# System Modules

## App Module

- Root module that imports all feature modules
- Registers the root endpoint controller

## Prisma Module

- Provides global access to the Prisma Client
- Handles database connection initialization
- Uses PostgreSQL adapter for Prisma v7

## Users Module

- Manages user creation and retrieval
- Provides password hashing with bcryptjs
- Exports `UsersService` for use in other modules (Auth)

## Auth Module

- Handles user authentication
- Imports `UsersModule` to access user validation
- Provides login endpoint
