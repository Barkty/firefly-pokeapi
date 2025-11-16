import express, { Request, Response } from 'express';
import pokemonRouter from './pokemon.routes';
import favouriteRouter from './favourite.routes';

const appRouter = express.Router();

appRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).send({
    message: `Hello from FireFly. Check the API specification for further guidance and next steps.`,
    success: 1,
  });
});

appRouter.use('/pokemons', pokemonRouter);
appRouter.use('/favourites', favouriteRouter);

export const v1Router = appRouter;