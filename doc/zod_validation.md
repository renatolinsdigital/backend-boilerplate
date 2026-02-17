# Zod Validation

Type-safe validation using [Zod](https://zod.dev/) for user input, environment variables, and query parameters.

## Schema Locations

- **User validation:** `src/users/users.schemas.ts` - Email, password, role, pagination, registration, login
- **Environment:** Validated on startup (main.ts)

## Usage in Controllers

```typescript
import { userRegistrationSchema, idSchema } from './users.schemas';
import { ZodError } from 'zod';

try {
  const validated = userRegistrationSchema.parse(body);
  // Use validated data
} catch (error) {
  if (error instanceof ZodError) {
    throw new BadRequestException(error.issues[0].message);
  }
}
```

## Key Features

- **Type inference:** TypeScript types auto-generated from schemas
- **Transformations:** `.trim()`, `.toLowerCase()`, `.coerce.number()`
- **Composable:** Reuse base schemas (emailSchema, passwordSchema)
- **Descriptive errors:** Custom messages for each validation rule

## Resources

- [Zod Documentation](https://zod.dev/)
- [Project Schemas](../src/users/users.schemas.ts)
