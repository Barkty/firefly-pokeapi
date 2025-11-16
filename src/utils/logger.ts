import Logger from "../config/logger";

export interface logWrapper {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

export class LoggerImpl implements logWrapper {
  private readonly logger = new Logger({ defaultContext: LoggerImpl.name });

  public info(message: string, ...args: any[]) {
    this.logger.info(`${message} in ${args[0]}`);
  }

  public error(message: string, ...args: any[]) {
    this.logger.error(`Error: ${message} in ${args[0]}`);
  }
  
  public warn(message: string, ...args: any[]) {
    this.logger.warn(`Warring: ${message} in ${args[0]}`);
  }

  public debug(message: string, ...args: any[]) {
    this.logger.debug(`Debuging: ${message} in ${args[0]}`);
  }
}

const logger = new LoggerImpl();
// Set the global logger
declare global {
  // eslint-disable-next-line no-var
  var logger: LoggerImpl;
}
global.logger = logger;

export default logger;