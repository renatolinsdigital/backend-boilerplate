import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logDir = 'logs';

// Define log format for files (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Filter to ignore verbose NestJS bootstrap logs in console
const ignoreNestBootstrapLogs = winston.format((info) => {
  // List of contexts to ignore in console output
  const ignoredContexts = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestFactory',
    'NestApplication',
  ];

  // Only filter in console, not in files
  if (info.context && typeof info.context === 'string' && ignoredContexts.includes(info.context)) {
    return false; // Ignore this log
  }

  return info;
});

// Define log format for console (colorized and readable)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  ignoreNestBootstrapLogs(),
  nestWinstonModuleUtilities.format.nestLike('BackEnd Boilerplate', {
    colors: true,
    prettyPrint: true,
  }),
);

// Daily rotate file transport for all logs
const allLogsTransport: DailyRotateFile = new DailyRotateFile({
  filename: `${logDir}/%DATE%/application.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
  level: 'info',
  auditFile: `${logDir}/application-audit.json`,
});

// Daily rotate file transport for error logs only
const errorLogsTransport: DailyRotateFile = new DailyRotateFile({
  filename: `${logDir}/%DATE%/error.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
  level: 'error',
  auditFile: `${logDir}/error-audit.json`,
});

// Daily rotate file transport for debug logs (only in development)
const debugLogsTransport: DailyRotateFile = new DailyRotateFile({
  filename: `${logDir}/%DATE%/debug.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: fileFormat,
  level: 'debug',
  auditFile: `${logDir}/debug-audit.json`,
});

export const winstonConfig = {
  transports: [
    // Console transport (always enabled, colorized)
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),

    // File transports
    allLogsTransport,
    errorLogsTransport,

    // Debug logs only in development
    ...(process.env.NODE_ENV !== 'production' ? [debugLogsTransport] : []),
  ],

  // Exit on error (false means Winston will not exit on error)
  exitOnError: false,

  // Default log level
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Add default metadata to all log entries
  defaultMeta: {
    service: 'backend-boilerplate',
    environment: process.env.NODE_ENV || 'development',
  },
};
