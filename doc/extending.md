# Extending the Project

Recommendations for adding new features.

## Role-Based Access Control

Create `RolesGuard` to enforce permissions:

- Use decorators to restrict routes by role
- Implement custom permission system
- Example: `@Roles('ADMIN')` decorator on endpoints

## Data Transfer Objects (DTOs)

Consider using NestJS ValidationPipe with class-validator:

- Install `class-validator` and `class-transformer`
- Create DTO classes with validation decorators
- Enable global validation pipe
- Alternative: Continue using Zod schemas (currently implemented)

## Performance

**Caching:**

- Redis with `@nestjs/cache-manager`
- Cache frequently accessed data
- Set appropriate TTL values

**Rate Limiting:**

- `@nestjs/throttler` for API rate limiting
- Protect auth endpoints from brute force
- Configure per-route limits

**Database:**

- Add indexes on frequently queried fields
- Use Prisma select for specific fields only
- Implement cursor-based pagination for large datasets
- Optimize connection pooling

## Monitoring

**Error Tracking:**

- Integrate Sentry for production errors
- Set up error rate alerts

**Metrics:**

- `@nestjs/terminus` for health checks
- Prometheus metrics
- Track response times and request rates

## Development Guidelines

When adding features:

- Follow NestJS module pattern
- Add tests for new code
- Update Swagger documentation
- Use TypeScript strictly
- Validate all inputs (Zod or DTOs)
- Handle errors with custom exceptions
- Protect routes with guards

## Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
