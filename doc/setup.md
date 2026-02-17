# Setup & Getting Started

## Prerequisites

- Node.js ≥ 18
- npm ≥ 10
- PostgreSQL

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Create database
psql -U postgres
CREATE DATABASE boilerplate_db;
\q

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Run migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Start server
npm run dev
```

## Environment Variables

Create `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/boilerplate_db?schema=public"
JWT_SECRET="min-32-chars-strong-random-string"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

**Important:**

- Change `password` to your PostgreSQL password
- Use strong JWT_SECRET (32+ characters) in production
- Update CORS_ORIGINS with your frontend URLs

## PostgreSQL Setup

**Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)  
**macOS:** `brew install postgresql@18 && brew services start postgresql@18`  
**Linux:** `sudo apt-get install postgresql postgresql-contrib`

Default port: 5432

## Available Scripts

```bash
npm run dev              # Development server (hot reload)
npm run build            # Production build
npm test                 # Run tests
npm run lint            # Check code quality
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run clean            # Remove build artifacts
npm run free             # Kill process on port 3000
```

## First Steps

**Create a user:**

```bash
POST http://localhost:3000/users/register
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Login:**

```bash
POST http://localhost:3000/auth/login
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Access API:**

- Root: `http://localhost:3000`
- Swagger: `http://localhost:3000/swagger`

## Troubleshooting

**Database connection failed:**

- Verify PostgreSQL is running
- Check credentials in `DATABASE_URL`
- Ensure database exists

**Port 3000 already in use:**

```bash
npm run free
```

**Prisma errors:**

```bash
npm run prisma:generate
npm run prisma:migrate
```
