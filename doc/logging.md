# Logging

Winston-based logging with daily rotation and multiple log levels.

## Features

- **Log Levels:** error, warn, info, debug (debug only in development)
- **Daily Rotation:** Separate folders per day in `logs/YYYY-MM-DD/`
- **Separate Files:** application.log, error.log, debug.log
- **JSON Format:** Structured logs for parsing
- **Console:** Colorized output (NestJS bootstrap logs filtered)

## Log Files

```
logs/YYYY-MM-DD/
├── application.log (all logs, info+)
├── error.log       (errors only)
└── debug.log       (debug, dev only)
```

**Retention:** Errors 30d, application 14d, debug 7d  
**Max size:** 20MB (auto-rotate/compress)

## Usage

```typescript
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

constructor(
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private logger: Logger
) {}

this.logger.info('Message', { context: 'MyService' });
this.logger.error('Error details', { context: 'MyService', error: err });
```

## Configuration

**Location:** `src/common/logger/logger.config.ts`  
**Environment:** Set `NODE_ENV=development` for debug logs  
**Console Filter:** NestJS bootstrap logs hidden in console, saved to files

## Best Practices

- Always include `context` property
- Use correct level: error (exceptions), info (events), debug (details)
- Never log passwords, tokens, or sensitive data
- Use structured logging with objects
