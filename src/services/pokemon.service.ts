import { CACHE_TTL, POKEMON_LIMIT } from "../config/constants";
import Logger from "../config/logger";
import * as Dtos from "../dtos/pokemon.dto";
import * as speciesDtos from "../dtos/pokemon-species.dto";
import { apiClient } from "../utils/apiClient";
import NodeCache from "node-cache";

export interface IPokemonService {
  getPokemonList(args: Dtos.FilterPokemon): Promise<Dtos.SimplifiedPokemonDTO[]>;
  getPokemonByName(name: string): Promise<any>;
  clearCache(): void;
}

class PokemonService implements IPokemonService {
  constructor() {}
  logger = new Logger({ serviceName: PokemonService.name });
  private cache = new NodeCache({ stdTTL: CACHE_TTL });
  private BATCH_SIZE = 20;

  public async getPokemonList(args: Dtos.FilterPokemon): Promise<Dtos.SimplifiedPokemonDTO[]> {
    const cacheKey = 'pokemon_list';
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached Pokemon list');
      const cachedPokemons = cached as Dtos.SimplifiedPokemonDTO[];
      return args.name ? cachedPokemons.filter(p => p.name.toLowerCase().includes(args.name.toLowerCase())) : cachedPokemons;
    }

    logger.info(`Fetching ${POKEMON_LIMIT} Pokemon from PokéAPI`);
    
    // Fetch the list of Pokemon
    const { data } = await apiClient.get(`/pokemon?limit=${POKEMON_LIMIT}`);
    const pokemonList = data.results;
    const enrichedPokemon: Dtos.SimplifiedPokemonDTO[] = [];

    // Fetch details for each Pokemon in batch
    for (let i = 0; i < pokemonList.length; i += this.BATCH_SIZE) {
      const batch = pokemonList.slice(i, i + this.BATCH_SIZE);
      const batchPromises = batch.map(async (pokemon: Dtos.Pokemon, _index: number) => {
        const detailsResponse = await apiClient.get(`/pokemon/${pokemon.name}`);
        const details: Dtos.PokemonDTO = detailsResponse.data;
  
        return {
          id: details.id,
          name: details.name,
          imageUrl: details.sprites.front_default ?? details?.sprites?.other?.['official-artwork']?.front_default,
          types: details.types.map(t => t.type.name),
          abilities: details.abilities.map(a => a.ability.name),
          height: details.height,
          weight: details.weight,
          weaknesses: [] // Placeholder for weaknesses
        };
      });
      const batchResults = await Promise.all(batchPromises);
      enrichedPokemon.push(...batchResults.filter(Boolean) as Dtos.SimplifiedPokemonDTO[]);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Cache the results
    this.cache.set(cacheKey, enrichedPokemon);
    logger.info(`Successfully fetched and cached ${enrichedPokemon.length} Pokemon`, 'src.services.pokemon.service');
    
    return args.name ? enrichedPokemon.filter(p => p.name.toLowerCase().includes(args.name.toLowerCase())) : enrichedPokemon;
  }

  public async getPokemonByName(name: string) {
    const cacheKey = `pokemon_${name.toLowerCase()}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.info(`Returning cached Pokemon ${name}`);
      return cached;
    }

    logger.info(`Fetching Pokemon ${name} from PokéAPI`, 'src.services.pokemon.service');
    
    const [detailsResponse, speciesResponse] = await Promise.all([
      apiClient.get(`/pokemon/${name}`),
      apiClient.get(`/pokemon-species/${name}`)
    ]);

    const details: Dtos.PokemonDTO = detailsResponse.data;
    const species: speciesDtos.PokemonSpecies = speciesResponse.data;

    // Get evolution chain
    let evolutionChain = null;
    if (species.evolution_chain && species.evolution_chain.url) {
      try {
        const evolutionResponse = await apiClient.get(species.evolution_chain.url.replace('https://pokeapi.co/api/v2', ''));
        evolutionChain = this.parseEvolutionChain(evolutionResponse.data.chain);
      } catch (error) {
        logger.error(`Failed to fetch evolution chain for Pokemon ${name}`, error.message);
      }
    }

    const pokemon = {
      id: details.id,
      name: details.name,
      imageUrl: details.sprites.front_default || details?.sprites?.other?.['official-artwork']?.front_default,
      types: details.types.map(t => ({
        name: t.type.name,
        slot: t.slot
      })),
      abilities: details.abilities.map(a => ({
        name: a.ability.name,
        isHidden: a.is_hidden
      })),
      stats: details.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      height: details.height,
      weight: details.weight,
      evolutionChain: evolutionChain
    };

    // Cache the result
    this.cache.set(cacheKey, pokemon);
    logger.info(`Successfully fetched and cached Pokemon ${name}`, 'src.services.pokemon.service');
    
    return pokemon;
  }

  parseEvolutionChain(chain: any) {
    const evolutions: {name: string, id: number}[] = [];
    
    const traverse = (node: any) => {
      evolutions.push({
        name: node.species.name,
        id: this.extractIdFromUrl(node.species.url)
      });
      
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((evolution: any) => traverse(evolution));
      }
    };
    
    traverse(chain);
    return evolutions;
  }

  extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1]);
  }

  clearCache() {
    this.cache.flushAll();
    logger.info('Cache cleared');
  }
}

const pokemonService = new PokemonService();
export default pokemonService;