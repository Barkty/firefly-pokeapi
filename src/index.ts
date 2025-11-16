import http from 'http';
import { Express } from 'express';
import { connectDB } from './config/database';
import Logger from './config/logger';
import { AppEnv } from './enums';
import { envValidatorSchema } from './utils/env-validator';
import Env from './utils/envholder';
import app from './config/express';

async function main(app: Express): Promise<void> {
  const logger = new Logger({ serviceName: app.name });

  // run the following before initializing App function
  await Env.validateEnv(envValidatorSchema);
  await connectDB();

  const server = http.createServer(app);

  const PORT = Env.get<number>('PORT') || 9080;
  const NODE_ENV = Env.get<string>('NODE_ENV');

  NODE_ENV !== AppEnv.PRODUCTION &&
    server.on('listening', () => {
      logger.info(`Listening on http://localhost:${PORT}`);
      console.info(`Listening on http://localhost:${PORT}`);
    });

  server.listen(PORT);
}

main(app);
