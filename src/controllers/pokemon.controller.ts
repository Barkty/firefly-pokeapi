import { StatusCodes } from "http-status-codes";
import pokemonService, { IPokemonService } from "../services/pokemon.service";
import { fnRequest } from "../types";
import { ApiResponse } from "../utils/response";
import * as Dtos from "../dtos/pokemon.dto";


class PokemonController {
  constructor(private readonly pokemonService: IPokemonService) {}

  public getPokemonList: fnRequest = async(req, res) => {
    const { query } = req;
    console.log('Query params:', query);
    const payload: Dtos.FilterPokemon = { name: query.name as string || '' };
    const pokemonList = await this.pokemonService.getPokemonList(payload);
    
    return ApiResponse(res, null, "Pokemon fetched successfully", StatusCodes.OK, pokemonList);
  }

  public getPokemonByName: fnRequest = async(req, res) => {
    const { pokemonName } = req.params;

    const pokemon = await this.pokemonService.getPokemonByName(pokemonName);
    
    return ApiResponse(res, null, "Pokemon fetched successfully", StatusCodes.OK, pokemon);
  }

//   public searchPokemon: fnRequest = async(req, res) => {
//     try {
//       const { query } = req.query;
      
//       if (!query || query.trim().length === 0) {
//         return res.status(400).json({
//           success: false,
//           error: 'Search query is required'
//         });
//       }

//       const pokemonList = await this.pokemonService.getPokemonList();
//       const searchTerm = query.toLowerCase().trim();
      
//       const results = pokemonList.filter(pokemon => 
//         pokemon.name.toLowerCase().includes(searchTerm)
//       );

//       res.json({
//         success: true,
//         count: results.length,
//         data: results
//       });
//     } catch (error) {
//       logger.error('Controller error in searchPokemon:', error);
//       next(error);
//     }
//   }
}

const pokemonController = new PokemonController(pokemonService);
export default pokemonController;