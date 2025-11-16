import path from "path";
import fs from "fs/promises";
import { FAVORITES_FILE_PATH } from "../config/constants";
import { IFavourite } from "../interfaces/favourites";
import { BadException } from "../utils/errors";
import { IRepository } from "../interfaces/repository";
import * as Dtos from "../dtos/favourite.dto";

class FavoritesRepositoryImpl implements IRepository {
  constructor() {
    this.initializeStorage();
  }
  private filePath = path.resolve(FAVORITES_FILE_PATH);

  private async initializeStorage() {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify({ favorites: [] }, null, 2));
        logger.info('Initialized favorites storage file');
      }
    } catch (error) {
      logger.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  public async readData(): Promise<{favorites: IFavourite[]}> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error reading favorites data:', error);
      return { favorites: [] };
    }
  }

  public async writeData(data: { favorites: IFavourite[] }): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error('Error writing favorites data:', error);
      throw error;
    }
  }

  public async getAll(): Promise<IFavourite[]> {
    const data = await this.readData();
    return data.favorites || [];
  }

  public async add(pokemon: Dtos.AddFavouriteDto): Promise<BadException | IFavourite> {
    const data = await this.readData();
    const favorite = {
      name: pokemon.name,
      imageUrl: pokemon.imageUrl,
    };

    data.favorites.push(favorite);
    await this.writeData(data);
    
    logger.info(`Added Pokemon "${pokemon.name}" to favorites`);
    return favorite;
  }

  public async remove(pokemonId: string): Promise<void | BadException> {
    const data = await this.readData();
    const initialLength = data.favorites.length;
    
    data.favorites = data.favorites.filter(fav => fav.name !== pokemonId);
    
    if (data.favorites.length === initialLength) {
      return new BadException('Pokemon not found in favorites');
    }

    await this.writeData(data);
    logger.info(`Removed Pokemon ${pokemonId} from favorites`);
  }

  async exists(pokemonId: string): Promise<IFavourite | BadException> {
    const data = await this.readData();
    const existing = data.favorites.find(fav => fav.name === pokemonId);
    if (!existing) {
      logger.info(`Pokemon ${pokemonId} not found in favorites`, 'src.repositories.favourites.repository');
      return new BadException("Method not implemented.");
    }
    return existing;
  }
}

const fileFavouritesRepository = new FavoritesRepositoryImpl();
export default fileFavouritesRepository;