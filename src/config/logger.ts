import winston, { Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import dayjs from 'dayjs';
import Env from '../utils/envholder';

export interface LoggerConfig {
  level?: string;
  serviceName?: string;
  env?: string;
  context?: string;
}

const logFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.printf((info: any) => {
    const time = `${dayjs().format('YYYY-MM-DD, HH:mm:ss')}`;
    const { level, message, stack, code, context } = info;
    
    // Add context to the log message if it exists
    const contextStr = context ? `[${context}]` : '';

    if (level == 'error') {
      return `[❌❌❌ ${level}] [${time}] ${contextStr} ${
        code != null ? `[${code}] -> [${message}]` : message
      } ${code == null || code >= 500 ? `$[ERR_STACK] -> ${stack}` : ''}`;
    }

    return `[${time}] | [${level}] ${contextStr} -> ${message}`;
  }),
  winston.format.json(),
);

const infoLogRotationTransport = new DailyRotateFile({
  filename: './/logs//info',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '80d',
  level: 'info',
  extension: '.log'
});

const errorLogRotationTransport = new DailyRotateFile({
  filename: './/logs//error',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '80d',
  level: 'error',
  extension: '.log'
});

const loggerInfo = (config: LoggerConfig) => {
  let logger;
  const { env, serviceName } = config;
  
  switch (env) {
    case 'production':
      logger = winston.createLogger({
        level: 'info',
        format: logFormat,
        defaultMeta: { service: serviceName },
        transports: [
          infoLogRotationTransport,
          errorLogRotationTransport
        ],
        exitOnError: false
      });
      break;
    case 'development':
      logger = winston.createLogger({
        level: 'info',
        format: logFormat,
        defaultMeta: { service: serviceName },
        transports: [
          infoLogRotationTransport,
          errorLogRotationTransport,
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ],
        exitOnError: false
      });
      break;
    case 'staging':
      logger = winston.createLogger({
        level: 'info',
        format: logFormat,
        defaultMeta: { service: serviceName },
        transports: [
          infoLogRotationTransport,
          errorLogRotationTransport,
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ],
        exitOnError: false
      });
      break;
    case 'test':
      logger = winston.createLogger({
        level: 'info',
        format: logFormat,
        defaultMeta: { service: serviceName },
        transports: [
          infoLogRotationTransport,
          errorLogRotationTransport,
          new winston.transports.File({
            filename: 'logs/error.log',
            maxsize: 500,
            format: logFormat
          })
        ],
        exitOnError: false
      });
      break;
    default:
      logger = winston.createLogger({
        level: 'info',
        format: logFormat,
        defaultMeta: { service: serviceName },
        transports: [
          infoLogRotationTransport,
          errorLogRotationTransport,
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ],
        exitOnError: false
      });
  }
  
  return logger;
};

class Logger {
  private logger: WinstonLogger;
  private context?: string;

  constructor(config: LoggerConfig) {
    const { 
      level = 'info', 
      serviceName,
      context
    } = config;

    this.context = context;
    this.logger = loggerInfo({ 
      env: Env.get<string>('NODE_ENV'), 
      serviceName, 
      level 
    });
  }

  // Add context to metadata
  private addContext(meta?: Record<string, any>): Record<string, any> {
    return {
      ...meta,
      ...(this.context && { context: this.context })
    };
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, this.addContext(meta));
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    this.logger.error(message, this.addContext({ 
      ...(error && { 
        error: { 
          name: error.name, 
          message: error.message, 
          stack: error.stack 
        } 
      }),
      ...meta
    }));
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, this.addContext(meta));
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, this.addContext(meta));
  }

  // Method to change context dynamically if needed
  setContext(context: string): void {
    this.context = context;
  }
}

export default Logger;

const logger = new Logger({
  serviceName: 'pokemon-backend',
  env: Env.get<string>('NODE_ENV'),
});
declare global {
  // eslint-disable-next-line no-var
  var logger: Logger;
}
global.logger = logger;
