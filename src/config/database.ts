import mongoose from "mongoose";
import dotenv from "dotenv";
import Env from "../utils/envholder";
import logger from "../utils/logger";
import { AppEnv } from "../enums";

dotenv.config();

mongoose.set('strictQuery', false);

const DATABASE_URL = Env.get<string>('DATABASE_URL') 
const DATABASE_NAME = Env.get<string>('DATABASE_NAME') 
const NODE_ENV = Env.get<string>('NODE_ENV')

declare global {
  // Prevent TS errors with global object
  var mongooseConn: typeof mongoose | null;
}

global.mongooseConn = global.mongooseConn || null;

/**
 * Connect to database
 */
export const connect = async (uri: string, dbName: string): Promise<any> => {
    try {
        if (global.mongooseConn && mongoose.connection.readyState === 1) {
            logger.info('✅ Using existing global DB connection');
            return global.mongooseConn;
        }

        const fullString = NODE_ENV === AppEnv.DEVELOPMENT ? uri : `${uri}&authSource=admin&ssl=true`;
        try {
            global.mongooseConn = await mongoose.connect(fullString, {
                dbName,
                maxPoolSize: 10,
                minPoolSize: 1,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            logger.info('✅ MongoDB connected via global cache', 'src.config.database');
            return global.mongooseConn;
        } catch (error) {
            logger.error('❌ MongoDB connection failed', error);
            throw error;
        }
        
    } catch (error) {
        logger.error('DB connect error: ', error)
    }
};

/**
 * Connect to other databases depending on environment
 */
export const connectDB = async (dbName = DATABASE_NAME) => {
    await connect(DATABASE_URL, dbName);
};

export const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    global.mongooseConn = null;
    logger.info('🛑 Disconnected from database', 'src.config.database');
  }
};
