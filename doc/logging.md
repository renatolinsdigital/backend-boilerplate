# Logging System

The BackEnd Boilerplate uses [Winston](https://github.com/winstonjs/winston) for comprehensive logging with multiple transports and log levels.

## Features

- **Multiple Log Levels**: `error`, `warn`, `info`, `debug`
- **Daily Log Rotation**: Automatically creates new log files each day in separate folders
- **Separate Error Logs**: Error-level logs are stored in separate files
- **JSON Format**: File logs are stored in JSON format for easy parsing
- **Colorized Console**: Console output is colorized for better readability
- **Environment-Aware**: Different log levels for development vs production
- **Automatic Cleanup**: Old log files are automatically deleted based on retention policies

## Log Files

All log files are organized in daily folders under the `logs/` directory with the following structure:

- `logs/YYYY-MM-DD/application.log` - All application logs (info and above)
- `logs/YYYY-MM-DD/error.log` - Error-level logs only
- `logs/YYYY-MM-DD/debug.log` - Debug-level logs (development only)
- `logs/*-audit.json` - Rotation audit files (stored in main logs folder)

Example: `logs/2026-02-15/application.log`

Each day gets its own folder, making it easy to manage and archive logs by date. Audit files used by winston-daily-rotate-file to track rotation state are stored directly in the `logs/` folder.

## Log Retention

- **Error logs**: 30 days
- **Application logs**: 14 days
- **Debug logs**: 7 days (development only)

## File Size Limits

- Maximum file size: 20MB
- Old log files are automatically compressed (gzipped)
- When a file reaches 20MB, a new file is created

## Log Format

### Console Output

The console output is simplified to show only essential startup information:

```
[BackEnd Boilerplate] 11208 2026-02-15 14:59:26     LOG [Bootstrap] 🚀 Application is running on: http://[::1]:3000
[BackEnd Boilerplate] 11208 2026-02-15 14:59:26     LOG [Bootstrap] 📚 Swagger documentation: http://[::1]:3000/swagger
[BackEnd Boilerplate] 11208 2026-02-15 14:59:26     LOG [Bootstrap] 🌍 Environment: development
```

**Note**: Verbose NestJS bootstrap logs (module initialization, route mapping) are filtered from console output to reduce noise, but they are still recorded in log files for debugging purposes.

### File Output (JSON)

```json
{
  "context": "Bootstrap",
  "environment": "development",
  "level": "info",
  "message": "🚀 Application is running on: http://[::1]:3000",
  "service": "backend-boilerplate",
  "timestamp": "2026-02-15 14:52:46"
}
```

## Log Levels

### Production

- `error` - Critical errors and exceptions
- `warn` - Warning messages
- `info` - General application information

### Development

- All production levels plus:
- `debug` - Detailed debugging information

## Configuration

Winston configuration is located in [`src/common/logger/logger.config.ts`](../src/common/logger/logger.config.ts).

### Environment Variables

Set the `NODE_ENV` environment variable to control log levels:

```env
NODE_ENV=development  # Enables debug logs
NODE_ENV=production   # Info level and above
```

### Configuring Console Output Filter

By default, verbose NestJS bootstrap logs are filtered from console output to keep the terminal clean. Only essential logs like application startup URLs are shown.

To customize which logs appear in the console, edit the `ignoreNestBootstrapLogs` filter in [`src/common/logger/logger.config.ts`](../src/common/logger/logger.config.ts):

```typescript
// Filter to ignore verbose NestJS bootstrap logs in console
const ignoreNestBootstrapLogs = winston.format((info) => {
  // List of contexts to ignore in console output
  const ignoredContexts = [
    'InstanceLoader', // Module initialization
    'RoutesResolver', // Controller resolution
    'RouterExplorer', // Route mapping
    'NestFactory', // NestJS factory logs
    'NestApplication', // Application lifecycle logs
  ];

  // Only filter in console, not in files
  if (info.context && typeof info.context === 'string' && ignoredContexts.includes(info.context)) {
    return false; // Ignore this log
  }

  return info;
});
```

**How it works:**

- Logs from contexts in the `ignoredContexts` array are **hidden from console** but still saved to log files
- To show more logs in console, **remove** contexts from the array
- To hide additional logs, **add** new context names to the array
- This filter only affects console output - all logs are always saved to files

**Common contexts you might want to filter:**

- `InstanceLoader` - Dependency injection and module initialization
- `RoutesResolver` - Controller resolution
- `RouterExplorer` - Route mapping (GET, POST, etc.)
- `NestFactory` - Application factory logs
- `NestApplication` - Application lifecycle events
- Any custom context name from your services/controllers

**Example:** To see all route mappings in console, remove `'RouterExplorer'` from the array:

```typescript
const ignoredContexts = [
  'InstanceLoader',
  'RoutesResolver',
  // 'RouterExplorer',  // Commented out to show routes
  'NestFactory',
  'NestApplication',
];
```

## Using the Logger

### In Controllers and Services

Inject the Winston logger using the `WINSTON_MODULE_NEST_PROVIDER` token:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class MyService {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {}

  async myMethod() {
    this.logger.info('This is an info message', { context: 'MyService' });
    this.logger.warn('This is a warning', { context: 'MyService' });
    this.logger.error('This is an error', { context: 'MyService', error: err });
    this.logger.debug('Debug information', { context: 'MyService', data: someData });
  }
}
```

### Best Practices

1. **Use Appropriate Levels**
   - `error` - For exceptions and critical failures
   - `warn` - For recoverable issues or deprecated features
   - `info` - For important application events (startup, shutdowns, user actions)
   - `debug` - For detailed debugging information

2. **Include Context**
   - Always pass a `context` property to identify the source
   - Add relevant metadata for better debugging

3. **Avoid Logging Sensitive Data**
   - Never log passwords, tokens, or personal information
   - Sanitize user input before logging

4. **Use Structured Logging**
   - Pass objects instead of string concatenation
   - Use consistent property names

Example:

```typescript
// ✅ Good
this.logger.info('User registered', {
  context: 'UsersService',
  userId: user.id,
  email: user.email,
});

// ❌ Bad
this.logger.info(`User ${user.id} with email ${user.email} registered`);
```

## Log Analysis

Since logs are stored in JSON format, you can easily parse and analyze them:

### Using jq

```bash
# Get all error messages from a specific day
cat logs/2026-02-15/error.log | jq '.message'

# Filter by context
cat logs/2026-02-15/application.log | jq 'select(.context == "UsersService")'

# Count logs by level
cat logs/2026-02-15/application.log | jq '.level' | sort | uniq -c
```

### Using grep

```bash
# Find all logs containing "error" for a specific day
grep -i "error" logs/2026-02-15/application.log

# Search across all log folders and files
grep -r "UserNotFoundException" logs/

# Search in all application logs across all days
grep -r "error" logs/*/application.log
```

## Cleanup

The `logs/` folder is automatically cleaned by:

1. **Automatic rotation** - Winston deletes old files based on retention policies
2. **Manual cleanup** - Run `npm run clean` to delete all log files (follows .gitignore)

## Integration with NestJS

Winston is integrated with NestJS's internal logger, so all framework logs (route mapping, dependency initialization, etc.) are also captured by Winston.

This is configured in [`src/main.ts`](../src/main.ts):

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
```

## Related Files

- [`src/common/logger/logger.config.ts`](../src/common/logger/logger.config.ts) - Winston configuration
- [`src/common/logger/logger.module.ts`](../src/common/logger/logger.module.ts) - Logger module
- [`src/main.ts`](../src/main.ts) - Logger integration with NestJS
- [`src/app.module.ts`](../src/app.module.ts) - Logger module import
