# Logging

## Overview
The application uses a combination of Winston and Pino for logging, with NestJS integration through nest-winston.

## Logging Configuration

### Log Levels
- error: Critical errors that require immediate attention
- warn: Warning messages for potential issues
- info: General operational information
- debug: Detailed debugging information

### Log Format
Logs are formatted using Pino Pretty for development and structured JSON for production.

### Log Storage
- Console output for development
- File-based logging for production
- Integration with monitoring systems

### Request Logging
- Request ID tracking via express-request-id
- Request/response logging middleware
- Performance metrics logging

### Error Logging
- Global exception filter for error handling
- Stack trace preservation
- Error context logging

## Features

- Multiple log levels (error, warn, info, debug, verbose)
- Context-aware logging
- Structured JSON logging for files
- Colored console output for development
- Separate error log file
- Stack trace capture for errors
- Metadata support for additional context

## Configuration

The logging system is configured in `src/logger/logger.module.ts` with three transports:

1. **Console Transport**
   - Colored output for development
   - Human-readable format
   - Includes timestamp, context, and log level
   - Stack traces for errors

2. **Application Log File**
   - All logs in JSON format
   - Persistent storage
   - Located at `logs/application.log`
   - Includes structured metadata

3. **Error Log File**
   - Error-level logs only
   - JSON format
   - Located at `logs/error.log`
   - Easier error tracking

## Usage

### Basic Usage

Inject the `LoggerService` into your service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

@Injectable()
export class YourService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('YourService');
  }

  someMethod() {
    this.logger.info('Processing request');
    try {
      // Your code here
    } catch (error) {
      this.logger.error('Failed to process request', error.stack);
    }
  }
}
```

### Log Levels

The logger provides multiple log levels for different purposes:

- `error`: For errors that need immediate attention
- `warn`: For potentially harmful situations
- `info`: For general operational information
- `debug`: For detailed information during development
- `verbose`: For the most detailed logging

### Adding Metadata

You can include additional metadata with your logs:

```typescript
this.logger.info('User logged in', {
  userId: user.id,
  timestamp: new Date(),
  ipAddress: request.ip
});
```

### Error Logging

For errors, include the stack trace:

```typescript
try {
  // Risky operation
} catch (error) {
  this.logger.error('Operation failed', error.stack, {
    operationId: '123',
    userId: '456'
  });
}
```

## Best Practices

1. **Set Context**
   - Always set the context when injecting the logger
   - Use meaningful context names (e.g., 'UserService', 'AuthController')

2. **Log Levels**
   - Use appropriate log levels
   - Reserve error for actual errors
   - Use debug/verbose for development only

3. **Metadata**
   - Include relevant metadata
   - Avoid sensitive information
   - Use consistent metadata structure

4. **Error Handling**
   - Always include stack traces for errors
   - Add relevant context to error logs
   - Use structured logging for better analysis

## Log File Management

The application creates two log files:
- `logs/application.log`: Contains all logs
- `logs/error.log`: Contains only error logs

Consider implementing log rotation in production to manage file size.

## Development vs Production

In development:
- Console output is enabled with colors
- Debug and verbose logs are visible
- Human-readable format

In production:
- Console output may be disabled
- Only error, warn, and info levels
- JSON format for better parsing 