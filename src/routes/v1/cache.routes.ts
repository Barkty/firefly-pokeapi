import { Router } from "express";
import { WatchAsyncController } from "../../middleware/watch-async-controller";
import cacheController from "../../controllers/cache.controller";

const cacheRouter = Router();

cacheRouter.get('/', 
    WatchAsyncController(cacheController.getAllCacheStats)
);
cacheRouter.delete('/', 
    WatchAsyncController(cacheController.flushCache)
);

export default cacheRouter;

