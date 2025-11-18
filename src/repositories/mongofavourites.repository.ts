import { IFavourite } from "../interfaces/favourites";
import { IRepository } from "../interfaces/repository";
import Favorite from "../models/favourites.model";
import { BadException } from "../utils/errors";
import * as Dtos from "../dtos/favourite.dto";

export class MongoFavoritesRepository implements IRepository {
  public async exists(name: string): Promise<IFavourite | BadException> {
    const existing = await Favorite.findOne({ name });
    if (!existing) {
      return new BadException("Pokemon not found in favorites");
    }
    return existing;
  }
  writeData(data: { favorites: IFavourite[]; }): Promise<void> {
    logger.warn(`Method with argument (${JSON.stringify(data)}) not implemented.`, {trace: 'src.repositories.mongofavourites.repository'});
    throw new Error("Method not implemented.");
  }
  readData(): Promise<any> {
    logger.warn(`Method not implemented.`, {trace: 'src.repositories.mongofavourites.repository'});
    throw new Error("Method not implemented.");
  }
  public async getAll(): Promise<IFavourite[]> {
    const favorites = await Favorite
        .find()
        .sort({ createdAt: -1 })
        .select('-__v -updatedAt')
        .lean();
      
      return favorites;
  }

  public async add(pokemon: Dtos.AddFavouriteDto): Promise<IFavourite> {
    const favorite = await new Favorite({
      name: pokemon.name,
      imageUrl: pokemon.imageUrl
    }).save();
    
    logger.info(`Added Pokemon ${pokemon.name} (ID: ${pokemon.name}) to favorites`, {trace: 'src.repositories.mongofavourites.repository'});
    return favorite;
  }

  public async remove(pokemonId: string): Promise<void | BadException> {
    const result = await Favorite.deleteOne({ name: pokemonId });
    if (result.deletedCount === 0) {
      logger.error(`Pokemon not found in favorites`,);
      return new BadException('Pokemon not found in favorites');
    }
    logger.info(`Removed Pokemon ${pokemonId} from favorites`, {trace: 'src.repositories.mongofavourites.repository'});
  }
}

const favoritesRepository = new MongoFavoritesRepository();
export default favoritesRepository;