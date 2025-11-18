import Joi from "joi";

export const filterPokemonSchema = Joi.object({
  limit: Joi.number().label('Limit').max(20).required(),
  offset: Joi.number().label('Limit').required(),
  name: Joi.string().label('Name'),
});
export const filterPokemonTypeOrWeaknessSchema = Joi.object({
  type: Joi.string().label('Type/Weakness').required()
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
