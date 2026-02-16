# Security

## Overview

This document outlines the security measures implemented in the BackEnd Boilerplate API. The application uses multiple layers of security including password hashing, JWT-based authentication, input validation, and protected routes.

---

## Authentication & Authorization

### JWT (JSON Web Tokens)

The application uses **JWT tokens** for stateless authentication.

#### Configuration

- **Library**: `@nestjs/jwt` with `jsonwebtoken`
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Token Expiration**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret Key**: Configured via `JWT_SECRET` environment variable

#### Token Structure

```typescript
{
  sub: user.id,        // Subject (user ID)
  email: user.email,   // User email
  role: user.role,     // User role (ADMIN, STUDENT, TEACHER, STAFF, GUEST)
  iat: <timestamp>,    // Issued at
  exp: <timestamp>     // Expiration time
}
```

#### Login Flow

1. User submits credentials via `POST /auth/login`
2. System validates credentials using bcrypt
3. If valid, generates JWT token with user payload
4. Returns access token and user information
5. Client includes token in Authorization header for subsequent requests

**Response Format:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "7d",
  "user": { ... }
}
```

#### Token Verification

The `AuthGuard` verifies tokens on protected endpoints:

1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature and expiration
3. Decodes payload and attaches to request object
4. Throws `UnauthorizedException` if invalid or expired

**Implementation**: [auth.guard.ts](../src/common/guards/auth.guard.ts)

### Authorization Levels

The system supports role-based access control with the following roles:

- **ADMIN** - Full system access
- **TEACHER** - Instructor privileges
- **STUDENT** - Learner access
- **STAFF** - Support personnel
- **GUEST** - Limited access (default)

**Note**: Role-based authorization is configured but fine-grained permissions are not yet enforced at the route level.

---

## Password Security

### Password Hashing

This project uses **bcryptjs** for secure password hashing.

### Library

- **Package**: `bcryptjs` (v2.4.3)
- **Algorithm**: bcrypt (Blowfish cipher-based)
- **Salt Rounds**: 10

### How It Works

#### During User Registration

When a new user registers, their password is hashed before being stored in the database:

```typescript
// In users.service.ts - create method
const hashedPassword = await bcrypt.hash(data.password, 10);
```

**Process**:

1. User submits plain text password via `POST /users/register`
2. Password is validated for complexity (see Password Policy below)
3. `bcrypt.hash()` generates a salt and hashes the password
4. The salt rounds parameter (10) determines computational cost
5. Only the hashed password is stored in the database
6. Plain text password is never stored

**Salt Rounds (10)**: This means the algorithm performs 2^10 (1,024) iterations, making brute-force attacks computationally expensive while maintaining reasonable performance.

#### During Login

When a user logs in, their password is verified against the stored hash:

```typescript
// In users.service.ts - validateUser method
if (user && (await bcrypt.compare(pass, user.password))) {
  const { password, ...result } = user;
  return result;
}
```

**Process**:

1. User submits email and password via `POST /auth/login`
2. System retrieves the user record by email
3. `bcrypt.compare()` hashes the submitted password with the same salt
4. Compares the result with the stored hash
5. Returns user data (without password) if match succeeds
6. Returns null if match fails

### Security Benefits

- **One-way hashing**: Cannot reverse the hash to get the original password
- **Unique salts**: Each password has a unique salt, preventing rainbow table attacks
- **Adaptive cost**: Salt rounds can be increased as hardware improves
- **Timing attack resistant**: bcrypt includes protections against timing attacks

### Password Policy

Password requirements enforce **medium complexity** for security:

**Requirements:**

- **Minimum length**: 8 characters
- **Uppercase letter**: At least one (A-Z)
- **Lowercase letter**: At least one (a-z)
- **Number**: At least one (0-9)

**Validation Location**: [user.utils.ts](../src/common/validators/user.utils.ts) - `validatePasswordComplexity()` function

**Valid Examples:**

- `Password1`
- `MySecure123`
- `Welcome2024`

**Invalid Examples:**

- `password` (no uppercase, no number)
- `PASSWORD1` (no lowercase)
- `Password` (no number)
- `Pass1` (too short)

**Security Benefits:**

- Prevents simple, easily guessable passwords
- Forces use of mixed character types
- Balances security with usability

---

### Protected Against

- **SQL Injection**: Prisma ORM parameterizes all queries
- **Email Injection**: Email format validation
- **XSS**: Input sanitization through validation
- **Invalid Data Types**: Type checking and format validation

---

## Protected Endpoints

### Authentication Required

Most endpoints require JWT authentication. Include the token in the Authorization header:

**Authorization Header Format:**

```
Authorization: Bearer <your-jwt-token>
```

### Public Endpoints (No JWT Required)

These endpoints are accessible without authentication:

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| POST   | `/users/register` | User registration   |
| POST   | `/auth/login`     | User login          |
| GET    | `/`               | API welcome message |

### Guard Implementation

Protected routes use the `AuthGuard` which:

1. Validates Authorization header presence
2. Extracts and verifies JWT token
3. Checks token expiration
4. Attaches user payload to request
5. Throws `UnauthorizedException` on failure

**Implementation**: [auth.guard.ts](../src/common/guards/auth.guard.ts)

---

## Error Handling

### Exception Filters

The application uses global exception filters for consistent error responses:

#### AllExceptionsFilter

Catches all unhandled exceptions and returns structured error responses:

```json
{
  "statusCode": 500,
  "message": "Error message",
  "error": "Internal Server Error",
  "timestamp": "2026-02-15T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

#### HttpExceptionFilter

Handles HTTP exceptions (BadRequestException, UnauthorizedException, etc.) with appropriate status codes.

### Security through Error Handling

- **No sensitive data exposure**: Error messages don't reveal system internals
- **Consistent responses**: All errors follow the same structure
- **Logging**: All exceptions are logged for monitoring
- **Generic 500 errors**: Internal errors return generic messages to users

**Implementation**: [filters/](../src/common/filters/)

---

## Database Security

### Prisma ORM

The application uses Prisma ORM for database interactions, providing:

- **Parameterized queries**: Automatic SQL injection prevention
- **Type safety**: TypeScript types prevent data type errors
- **Connection pooling**: Efficient database connection management

### Schema Security

#### User Model Constraints

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique              // Enforced uniqueness
  name      String?
  password  String                        // Stores bcrypt hash only
  role      Role     @default(GUEST)      // Defaults to least privilege
  createdAt DateTime @default(now())
}
```

**Security Features:**

- **Unique email constraint**: Prevents duplicate accounts
- **Password field**: Only stores hashed passwords
- **Default role**: New users get minimal privileges (GUEST)
- **Auto-incrementing IDs**: Non-guessable user identifiers

#### Role Enum

```prisma
enum Role {
  ADMIN
  STUDENT
  TEACHER
  STAFF
  GUEST
}
```

Enforces valid role values at database level.

---

## Environment Variables

### Required Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/boilerplate_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

### Validation at Startup

The application validates all environment variables at startup using Joi schema validation. If any required variable is missing or invalid, the application will fail to start with a descriptive error message.

**Validation Rules:**

- `DATABASE_URL` - Required, must be a string
- `JWT_SECRET` - Required, must be at least 32 characters
- `JWT_EXPIRES_IN` - Optional, defaults to "7d"
- `NODE_ENV` - Optional, must be "development", "production", or "test", defaults to "development"

**Implementation**: [app.module.ts](../src/app.module.ts)

This ensures configuration errors are caught early, preventing runtime failures.

### Security Considerations

1. **JWT_SECRET**
   - Must be a strong, random string (at least 32 characters) - **enforced by validation**
   - **NEVER commit to version control**
   - Change default value in production
   - Keep separate secrets for different environments

2. **DATABASE_URL**
   - Contains sensitive credentials
   - Use connection string format
   - Ensure database user has minimal required permissions

3. **JWT_EXPIRES_IN**
   - Balance security vs. user experience
   - Shorter duration = more secure but less convenient
   - Default: 7 days

4. **NODE_ENV**
   - Controls application behavior
   - Set to "production" for production deployments
   - Validated to prevent typos

---

## CORS (Cross-Origin Resource Sharing)

### Overview

CORS controls which domains can access your API from browsers. Configure allowed origins via environment variable; other settings are hardcoded in [main.ts](../src/main.ts).

### Configuration

#### Environment Variable

```env
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

- Add to `.env` file
- Comma-separated list of allowed origins
- Use `*` for all origins (development/public APIs only)

#### Hardcoded Settings

| Setting            | Value                                    | Description                              |
| ------------------ | ---------------------------------------- | ---------------------------------------- |
| **credentials**    | `true`                                   | Allows cookies and Authorization headers |
| **methods**        | `GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS` | Allowed HTTP methods                     |
| **allowedHeaders** | `Content-Type,Accept,Authorization`      | Allowed request headers                  |
| **exposedHeaders** | `X-Total-Count`                          | Response headers visible to client       |
| **maxAge**         | `3600` (1 hour)                          | Preflight cache duration                 |

To modify: Edit values in [main.ts](../src/main.ts)

### Environment Examples

**Development:**

```env
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:5173"
```

**Production:**

```env
CORS_ORIGINS="https://myapp.com,https://www.myapp.com"
```

**Public API:**

```env
CORS_ORIGINS="*"
```

⚠️ **Warning**: Cannot use `*` with `credentials: true`. Either specify origins or set `credentials: false` in [main.ts](../src/main.ts).

### Common Issues

#### "Origin not allowed by CORS policy"

**Fix:**

- Add origin to `CORS_ORIGINS` in `.env`
- Include exact protocol and port: `http://localhost:3000`
- Restart server after changing `.env`

#### "Credentials flag is true, but Access-Control-Allow-Origin is \*"

**Fix:**

- Use specific origins instead of `*`
- OR set `credentials: false` in [main.ts](../src/main.ts)

#### "Method not allowed"

**Fix:**

- Verify method is in: `GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS`
- Update `methods` in [main.ts](../src/main.ts) if needed

#### "Header not allowed"

**Fix:**

- Verify header is in: `Content-Type,Accept,Authorization`
- Add to `allowedHeaders` in [main.ts](../src/main.ts) if needed

#### CORS works in Postman but not browser

**Explanation:** CORS is browser-enforced. Postman/curl don't check CORS. Test in actual browsers.

### Testing CORS

**Browser Console:**

```javascript
fetch('http://localhost:3000/api/users', {
  method: 'GET',
  credentials: 'include',
  headers: { Authorization: 'Bearer <token>' },
})
  .then((r) => r.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

**cURL (Preflight Test):**

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS -v \
     http://localhost:3000/api/users
```

### CORS Best Practices

**Production checklist:**

- ✓ Always use HTTPS
- ✓ Never use `*` in production (except public APIs)
- ✓ List specific origins only
- ✓ Include www and non-www versions if needed
- ✓ Monitor CORS errors in logs

**To modify settings:**

- Origins: Update `CORS_ORIGINS` in `.env`
- Methods/Headers/Credentials: Edit [main.ts](../src/main.ts)

**Resources:**

- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [NestJS - CORS](https://docs.nestjs.com/security/cors)

---

## Security Best Practices

### Implemented

✅ **Password Hashing** - bcrypt with 10 salt rounds
✅ **JWT Authentication** - Stateless token-based auth
✅ **Input Validation** - Centralized validation utilities
✅ **Protected Routes** - AuthGuard on sensitive endpoints
✅ **Error Handling** - Global exception filters
✅ **SQL Injection Prevention** - Prisma ORM parameterization
✅ **Password Complexity** - Medium-level requirements
✅ **No Password Exposure** - Passwords excluded from API responses
✅ **Environment Variables** - Sensitive config externalized
✅ **Configuration Validation** - Joi schema validation at startup
✅ **Type Safety** - TypeScript throughout
✅ **CORS** - Configurable cross-origin resource sharing

### Development vs Production

**Development**

- Uses default JWT secret (acceptable for local dev)
- Detailed error messages
- No HTTPS requirement

**Production** (Recommendations)

- Strong, unique JWT secret
- Generic error messages
- HTTPS enforcement
- Rate limiting enabled
- Helmet.js security headers
- Database user with minimal permissions
- Regular security audits
- Monitoring and alerting
