import { StatusCodes } from "http-status-codes";
import { fnRequest } from "../types";
import { ApiResponse } from "../utils/response";
import favoritesService, { IFavoritesService } from "../services/favourite.service";
import Messages from "../utils/messages";
import * as Dto from '../dtos/favourite.dto'

class FavoritesController {
  constructor(private readonly favoritesService: IFavoritesService) {}

  public getAllFavorites: fnRequest = async(_req, res) => {
    const favorites = await this.favoritesService.getAllFavorites();
      
    return ApiResponse(res, null, Messages.FAVOURITES_FETCHED, StatusCodes.OK, favorites);
  }

  public addFavorite: fnRequest = async(req, res) => {
    const { body } = req;
    const payload: Dto.AddFavouriteDto = {...body}

    const favorite = await this.favoritesService.addFavorite(payload);

    return ApiResponse(res, favorite, "Pokemon added to favourites", StatusCodes.CREATED, favorite);
  }

  public removeFavorite: fnRequest = async(req, res) => {
    const { favouriteId } = req.params;

    const result = await this.favoritesService.removeFavorite(favouriteId);
    return ApiResponse(res, result, "Pokemon removed from favourites", StatusCodes.NO_CONTENT, result);
  }

  public checkFavorite: fnRequest = async(req, res) => {
    const { favouriteId } = req.params;

    const isFavorite = await this.favoritesService.isFavorite(favouriteId);

    return ApiResponse(res, null, Messages.FAVORITE_CONFIRMED, StatusCodes.OK, isFavorite);
  }
}

const favoritesController = new FavoritesController(favoritesService);
export default favoritesController;