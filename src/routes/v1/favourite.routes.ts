import { Router } from "express";
import * as pokemonValidator from "../../validators/favourite.validator";
import favouriteController from "../../controllers/favourite.controller";
import { WatchAsyncController } from "../../middleware/watch-async-controller";
import { RequestBodyValidatorMiddleware } from "../../middleware/request-body-validator.middleware";

const favouriteRouter = Router();

favouriteRouter.get('/', WatchAsyncController(favouriteController.getAllFavorites));

favouriteRouter.post('/', 
    RequestBodyValidatorMiddleware(pokemonValidator.addFavouriteSchema, 'payload'),
    WatchAsyncController(favouriteController.addFavorite)
);
favouriteRouter.delete('/:favouriteId', 
    RequestBodyValidatorMiddleware(pokemonValidator.favouriteIdSchema, 'params'),
    WatchAsyncController(favouriteController.removeFavorite)
);
favouriteRouter.get('/:id',
    RequestBodyValidatorMiddleware(pokemonValidator.favouriteIdSchema, 'params'),
    WatchAsyncController(favouriteController.checkFavorite)
);

export default favouriteRouter;

