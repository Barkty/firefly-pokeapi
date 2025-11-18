import mongoose from "mongoose";
import dotenv from "dotenv";
import { LoggerImpl } from "../backend/src/utils/logger";

dotenv.config();

mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false);

const { FIREFLY_TEST_DATABASE_URL, FIREFLY_TEST_DATABASE_NAME } = process.env
const logger = new LoggerImpl('TestSetup');
/**
 * Disconnect test database during teardowns
 */
const disconnect = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        logger.info("Disconnected from MongoDB after testing.");
    }
};

/**
 * Deletes all collections [it is meant for the test databases during teardowns]
 */
const truncate = async () => {
    if (mongoose.connection.readyState !== 0) {
        const { collections } = mongoose.connection;
        const promises = Object.keys(collections).map((collection) =>
            mongoose.connection.collection(collection).deleteMany({})
        );
        await Promise.all(promises);
    }
};

before(async function () {
/**
 * Connect to database
 */
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(FIREFLY_TEST_DATABASE_URL!, {
                dbName: FIREFLY_TEST_DATABASE_NAME,
                serverSelectionTimeoutMS: 30000
            });
            logger.info("Connected to database", {trace: 'testSetup.ts'});
        }
    } catch (error: any) {
        logger.error("Failed to connect to MongoDB:", error);
        throw error; // Ensure Mocha knows about the failure
    }
})

after(async function () {
    await truncate();
    await disconnect();
});
