import express, { Request, Response } from 'express';
import pokemonRouter from './pokemon.routes';
import favouriteRouter from './favourite.routes';
import { limit } from '../../middleware/rate-limit.middleware';
import cacheRouter from './cache.routes';

const appRouter = express.Router();

appRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).send({
    message: `Hello from FireFly. Check the API specification for further guidance and next steps.`,
    success: 1,
  });
});

appRouter.use('/pokemons', limit('default'), pokemonRouter);
appRouter.use('/favourites', limit('default'), favouriteRouter);
appRouter.use('/cache', limit('api'), cacheRouter);

export const v1Router = appRouter;