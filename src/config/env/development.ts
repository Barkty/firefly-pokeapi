import { configDotenv } from 'dotenv';
configDotenv();

const development = {
  NODE_ENV: process.env.FIREFLY_NODE_ENV,
  PORT: process.env.FIREFLY_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_URL: process.env.DATABASE_URL,
}

export default development;