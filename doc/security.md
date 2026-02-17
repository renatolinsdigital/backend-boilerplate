# Security

Security implementation including JWT authentication, password hashing, input validation, and CORS configuration.

## Authentication

**JWT Tokens** - Stateless authentication with 7-day expiration (configurable via `JWT_EXPIRES_IN`)

**Token Payload:**

```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "STUDENT",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Login Flow:**

1. POST credentials to `/auth/login`
2. System validates password with bcrypt
3. Returns JWT token if valid
4. Include token in `Authorization: Bearer <token>` header

**Protected Routes:** Most endpoints require JWT authentication via `AuthGuard`

**Public Endpoints:** `/users/register`, `/auth/login`, `/` (welcome)

## Password Security

**Hashing:** bcryptjs with 10 salt rounds - one-way hashing with unique salts per password

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Process:**

- Registration: Hash password before storing - plain text never saved
- Login: Compare submitted password with stored hash using `bcrypt.compare()`

## Input Validation

**Zod Schemas** - Type-safe validation for all user inputs

**Protected Against:**

- SQL Injection (Prisma parameterization)
- Email injection (format validation)
- XSS (input sanitization)
- Invalid data types (schema validation)

See [Zod Validation](zod_validation.md) for details.

## Database Security

**Prisma ORM:**

- Parameterized queries prevent SQL injection
- Type-safe queries
- Connection pooling

**User Model:**

- Unique email constraint
- Password field stores hashes only
- Default role: GUEST (least privilege)
- Auto-increment IDs (non-guessable)

**Role Enum:** ADMIN, STUDENT, TEACHER, STAFF, GUEST (enforced at database level)

## Environment Variables

**Required Variables:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET="min-32-chars-strong-random-string"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

**Validation:** All variables validated at startup with Zod - app fails fast on invalid config

**Security Notes:**

- `JWT_SECRET`: Must be 32+ characters, never commit to git, change in production
- `DATABASE_URL`: Contains sensitive credentials
- `CORS_ORIGINS`: Comma-separated list or `*` for all (not recommended for production)

## CORS Configuration

**Configure Origins:**

```env
# Development
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

# Production
CORS_ORIGINS="https://myapp.com,https://www.myapp.com"

# Public API (not recommended with credentials)
CORS_ORIGINS="*"
```

**Settings** (in [main.ts](../src/main.ts)):

- credentials: `true` (allows cookies/JWT)
- methods: `GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS`
- allowedHeaders: `Content-Type,Accept,Authorization`
- maxAge: 3600 seconds

**Common Issues:**

- "Origin not allowed" → Add origin to `CORS_ORIGINS`, restart server
- "Credentials + \*" error → Use specific origins or disable credentials
- Works in Postman not browser → CORS is browser-enforced only

## Error Handling

**Global Exception Filters:**

- Consistent error responses
- No sensitive data exposure in error messages
- All exceptions logged for monitoring
- Generic 500 errors for internal failures

**Format:**

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2026-02-15T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Security Checklist

**Implemented:**

- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT authentication
- ✅ Input validation (Zod schemas)
- ✅ Protected routes (AuthGuard)
- ✅ SQL injection prevention (Prisma)
- ✅ Password complexity requirements
- ✅ No password exposure in responses
- ✅ Environment variable validation
- ✅ Type safety (TypeScript)
- ✅ CORS configuration

**Production Recommendations:**

- Use strong, unique JWT_SECRET (32+ chars)
- Enable HTTPS only
- Add rate limiting (`@nestjs/throttler`)
- Add Helmet.js security headers
- Use minimal database permissions
- Implement monitoring and alerting
- Regular security audits
- Never use `CORS_ORIGINS="*"` with credentials

## Resources

- [JWT.io](https://jwt.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prisma Security](https://www.prisma.io/docs/guides/database/advanced-database-hardening)
