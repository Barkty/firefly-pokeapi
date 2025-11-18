import Logger from "../config/logger";

export class LoggerImpl {
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger({ 
      serviceName: 'FireflyBackend',
      context: context 
    });
  }

  public info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  public error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, error, meta);
  }
  
  public warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}