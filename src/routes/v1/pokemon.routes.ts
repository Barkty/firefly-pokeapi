import { Router } from "express";
import pokemonController from "../../controllers/pokemon.controller";
import { WatchAsyncController } from "../../middleware/watch-async-controller";
import * as pokemonValidator from "../../validators/favourite.validator";
import { RequestBodyValidatorMiddleware } from "../../middleware/request-body-validator.middleware";

const pokemonRouter = Router();

pokemonRouter.get('/', 
    RequestBodyValidatorMiddleware(pokemonValidator.filterPokemonSchema, 'query'),
    WatchAsyncController(pokemonController.getPokemonList)
);
pokemonRouter.get('/type', 
    RequestBodyValidatorMiddleware(pokemonValidator.filterPokemonTypeOrWeaknessSchema, 'query'),
    WatchAsyncController(pokemonController.getPokemonByType)
);
pokemonRouter.get('/:pokemonName', 
    RequestBodyValidatorMiddleware(pokemonValidator.pokemonNameSchema, 'params'),
    WatchAsyncController(pokemonController.getPokemonByName)
);

export default pokemonRouter;

