import { BadException } from "../utils/errors";
import { IFavourite } from "./favourites";
import * as Dtos from "../dtos/favourite.dto";

export interface IRepository {
    getAll(): Promise<IFavourite[]>;
    add(pokemon: Dtos.AddFavouriteDto): Promise<BadException | IFavourite>
    remove(pokemonId: string): Promise<void | BadException>
    exists(name: string): Promise<IFavourite | BadException>;
    writeData(data: { favorites: IFavourite[] }): Promise<void>;
    readData(): Promise<any>;
}