import Joi from "joi";

export const filterPokemonSchema = Joi.object({
  limit: Joi.number().label('Limit').required(),
  offset: Joi.number().label('Limit').required(),
  name: Joi.string().label('Name'),
});
export const pokemonNameSchema = Joi.object({
  pokemonName: Joi.string().label('Name').required()
});
export const favouriteIdSchema = Joi.object({
  favouriteId: Joi.string().label('Favourite ID').required()
});
export const addFavouriteSchema = Joi.object({
  name: Joi.string().label('Name').required(),
  imageUrl: Joi.string().uri().label('Avatar').required(),
});
