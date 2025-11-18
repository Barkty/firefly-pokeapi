import { StatusCodes } from "http-status-codes";
import { fnRequest } from "../types";
import cacheManager, { CacheManager } from "../utils/cache-manager";
import { ApiResponse } from "../utils/response";
import Messages from "../utils/messages";
import { LoggerImpl } from "../utils/logger";

class CacheController {
    constructor(private readonly cacheManager: CacheManager) {}
    logger = new LoggerImpl(CacheController.name);
    public getAllCacheStats: fnRequest = async(_req, res) => {
        const stats = this.cacheManager.getStats();
        logger.info('Cache stats retrieved');
        return ApiResponse(res, null, Messages.CACHE_STATS, StatusCodes.OK, stats);
    }
    public flushCache: fnRequest = async(_req, res) => {
        this.cacheManager.flush();
          logger.info('Cache flushed successfully');
        return ApiResponse(res, null, Messages.CACHE_CLEARED, StatusCodes.OK);
    }
}

const cacheController = new CacheController(cacheManager);
export default cacheController;