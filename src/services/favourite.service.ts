import { IFavourite } from "../interfaces/favourites";
import { IRepository } from "../interfaces/repository";
import * as Dtos from "../dtos/favourite.dto";
import { BadException } from "../utils/errors";
import favoritesRepository from "../repositories/mongofavourites.repository";
import Logger from "../config/logger";

export interface IFavoritesService {
  getAllFavorites(): Promise<IFavourite[]>;
  addFavorite(pokemonData: Dtos.AddFavouriteDto): Promise<IFavourite | BadException>;
  removeFavorite(pokemonId: string): Promise<void | BadException>;
  isFavorite(pokemonId: string): Promise<boolean>;
}

class FavoritesService implements IFavoritesService {
  constructor(private readonly repository: IRepository) {}
  logger = new Logger({ serviceName: FavoritesService.name });

  async getAllFavorites(): Promise<IFavourite[]> {
    const favorites = await this.repository.getAll();
    logger.info(`Retrieved ${favorites.length} favorites`);
    return favorites;
  }

  async addFavorite(pokemonData: Dtos.AddFavouriteDto): Promise<IFavourite | BadException> {
    let favorite = await this.repository.exists(pokemonData.name);
    if (!(favorite instanceof BadException)) {
      logger.info(`Pokemon ${pokemonData.name} already in favorites`);
      return new BadException('Pokemon already in favorites');
    }

    favorite = await this.repository.add(pokemonData);
    
    return favorite;
  }

  async removeFavorite(pokemonId: string): Promise<void | BadException> {
    const isFav = await this.isFavorite(pokemonId);
    if (!isFav) {
      logger.info(`Pokemon ${pokemonId} not found in favorites`, 'src.services.favourite.service');
      return new BadException('Pokemon not found in favorites');
    }
    const resp = await this.repository.remove(pokemonId);
    if (resp instanceof BadException) {
      return resp;
    }
  }

  async isFavorite(pokemonId: string): Promise<boolean> {
    const resp = await this.repository.exists(pokemonId);
    return !(resp instanceof BadException);
  }
}

const favoritesService = new FavoritesService(favoritesRepository);
export default favoritesService;