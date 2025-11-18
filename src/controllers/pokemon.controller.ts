import { StatusCodes } from "http-status-codes";
import pokemonService, { IPokemonService } from "../services/pokemon.service";
import { fnRequest } from "../types";
import { ApiResponse } from "../utils/response";
import * as Dtos from "../dtos/pokemon.dto";
import Messages from "../utils/messages";


class PokemonController {
  constructor(private readonly pokemonService: IPokemonService) {}

  public getPokemonList: fnRequest = async(req, res) => {
    const { query } = req;

    const payload: Dtos.FilterPokemon = { name: query.name as string || '', page: parseInt(query.offset as string) || 1, limit: parseInt(query.limit as string) || 20 };
    const pokemonList = await this.pokemonService.getPokemonList(payload);
    
    return ApiResponse(res, null, Messages.POKEMON_FETCHED, StatusCodes.OK, pokemonList);
  }

  public getPokemonByName: fnRequest = async(req, res) => {
    const { pokemonName } = req.params;

    const pokemon = await this.pokemonService.getPokemonByName(pokemonName);
    
    return ApiResponse(res, null, Messages.POKEMON_FETCHED, StatusCodes.OK, pokemon);
  }

  public getPokemonByType: fnRequest = async(req, res) => {
    const { query } = req;
    const payload: Dtos.FetchPokemonByType = { type: query.type as string };

    const pokemon = await this.pokemonService.getPokemonByType(payload.type);
    
    return ApiResponse(res, null, Messages.POKEMON_FETCHED, StatusCodes.OK, pokemon);
  }
}

const pokemonController = new PokemonController(pokemonService);
export default pokemonController;