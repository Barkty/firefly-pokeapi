import { StatusCodes } from "http-status-codes";
import { fnRequest } from "../types";
import { ApiResponse } from "../utils/response";
import favoritesService, { IFavoritesService } from "../services/favourite.service";

class FavoritesController {
  constructor(private readonly favoritesService: IFavoritesService) {}

  public getAllFavorites: fnRequest = async(_req, res) => {
    const favorites = await this.favoritesService.getAllFavorites();
      
    return ApiResponse(res, null, "Favourites fetched successfully", StatusCodes.OK, favorites);
  }

  public addFavorite: fnRequest = async(req, res) => {
    const { name, imageUrl } = req.body;

    const favorite = await this.favoritesService.addFavorite({
      name,
      imageUrl
    });

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

    return ApiResponse(res, null, "Pokemon is found a favourite", StatusCodes.OK, isFavorite);
  }
}

const favoritesController = new FavoritesController(favoritesService);
export default favoritesController;