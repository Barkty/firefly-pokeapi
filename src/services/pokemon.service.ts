import * as Dtos from "../dtos/pokemon.dto";
import * as speciesDtos from "../dtos/pokemon-species.dto";
import { apiClient } from "../utils/apiClient";
import { cacheManager, CACHE_CONFIG, CACHE_KEYS } from '../utils/cache-manager';
import { LoggerImpl } from "../utils/logger";

export interface IPokemonService {
  getPokemonList(args: Dtos.FilterPokemon): Promise<Dtos.SimplifiedPokemonDTO[]>;
  getPokemonByName(name: string): Promise<any>;
  getPokemonByType(name: string): Promise<any>;
}

class PokemonService implements IPokemonService {
  constructor() {}
  logger = new LoggerImpl(PokemonService.name);
  private BATCH_SIZE = 10;

  private pendingRequests = new Map<string, Promise<any>>();

  public async getPokemonList(args: Dtos.FilterPokemon): Promise<Dtos.SimplifiedPokemonDTO[]> {
    const cacheKey = `${CACHE_KEYS.POKEMON_LIST}:${args.page}_${args.limit}_${args.name || 'all'}`;

    // Check cache first
    const cached = cacheManager.get<Dtos.SimplifiedPokemonDTO[]>(cacheKey);
    if (cached) {
      logger.info('Returning cached Pokemon list', {trace: 'getPokemonList'});
      return this.filterByName(cached, args.name);
    }

    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      logger.info('Returning pending request for Pokemon list', {trace: 'getPokemonList'});
      return pendingRequest;
    }

    const requestPromise = this.fetchPokemonList(args, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  public async getPokemonByName(name: string) {
    const cacheKey = `${CACHE_KEYS.POKEMON_DETAIL}:${name.toLowerCase()}`;
    
    // Check cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Returning cached Pokemon ${name}`, {trace: 'src.services.pokemon.getPokemonByName'});
      return cached;
    }

    logger.info(`Fetching Pokemon ${name} from PokéAPI`, {trace: 'src.services.pokemon.getPokemonByName'});
    
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
    cacheManager.set(cacheKey, pokemon, CACHE_CONFIG.LONG);
    logger.info(`Successfully fetched and cached Pokemon ${name}`, {trace: 'src.services.pokemon.service'});
    
    return pokemon;
  }

  public async getPokemonByType(name: string) {
    const cacheKey = `${CACHE_KEYS.POKEMON_LIST}:${name.toLowerCase()}`;
    
    // Check cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Returning cached Pokemon ${name}`, {trace: 'src.services.pokemon.getPokemonByType'});
      return cached;
    }

    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      logger.info('Returning pending request for Pokemon list', {trace: 'getPokemonByType'});
      return pendingRequest;
    }

    logger.info(`Fetching Pokemon ${name} from PokéAPI`, {trace: 'src.services.pokemon.getPokemonByType'});
    
    const requestPromise = this.fetchPokemonListByType({ type: name }, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchPokemonList(
    args: Dtos.FilterPokemon, 
    cacheKey: string
  ): Promise<Dtos.SimplifiedPokemonDTO[]> {
    logger.info(`Fetching ${args.limit} Pokemon from PokéAPI`, {trace: 'fetchPokemonList'});
    
    try {
      const { data } = await apiClient.get(`/pokemon?limit=${args.limit}&offset=${args.page}`);
      const pokemonList = data.results;
      const enrichedPokemon: Dtos.SimplifiedPokemonDTO[] = [];

      for (let i = 0; i < pokemonList.length; i += this.BATCH_SIZE) {
        const batch = pokemonList.slice(i, i + this.BATCH_SIZE);
        
        const batchPromises = batch.map(async (pokemon: Dtos.Pokemon) => {
          try {
            const pokemonCacheKey = `${CACHE_KEYS.POKEMON_DETAIL}:${pokemon.name}`;
            const cachedDetail = cacheManager.get<Dtos.SimplifiedPokemonDTO>(pokemonCacheKey);
            
            if (cachedDetail) {
              return cachedDetail;
            }

            const detailsResponse = await apiClient.get(`/pokemon/${pokemon.name}`);
            const details: Dtos.PokemonDTO = detailsResponse.data;
      
            const simplifiedPokemon = {
              id: details.id,
              name: details.name,
              imageUrl: details.sprites.other?.['official-artwork']?.front_default || details.sprites.front_default,
              types: details.types.map(t => ({
                name: t.type.name,
                slot: t.slot
              })),
              abilities: details.abilities.map(a => ({
                name: a.ability.name,
                isHidden: a.is_hidden
              })),
            };

            cacheManager.set(pokemonCacheKey, simplifiedPokemon, CACHE_CONFIG.LONG);

            return simplifiedPokemon;
          } catch (error) {
            logger.error(`Failed to fetch Pokemon ${pokemon.name}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        enrichedPokemon.push(...batchResults.filter(Boolean) as Dtos.SimplifiedPokemonDTO[]);
        
        // Rate limiting between batches
        if (i + this.BATCH_SIZE < pokemonList.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Cache the complete list
      cacheManager.set(cacheKey, enrichedPokemon, CACHE_CONFIG.SHORT);
      logger.info(`Successfully fetched and cached ${enrichedPokemon.length} Pokemon`, {trace: 'fetchPokemonList'});
      
      return this.filterByName(enrichedPokemon, args.name);
    } catch (error) {
      logger.error('Error fetching Pokemon list:', error);
      throw error;
    }
  }
  private async fetchPokemonListByType(
    args: Dtos.FetchPokemonByType, 
    cacheKey: string
  ): Promise<Dtos.SimplifiedPokemonDTO[]> {
    logger.info(`Fetching ${args.type} Pokemon from PokéAPI`, {trace: 'fetchPokemonListByType'});
    
    try {
      const { data } = await apiClient.get(`/type/${args.type}`);
      const pokemonList = data.results;
      const enrichedPokemon: Dtos.SimplifiedPokemonDTO[] = [];

      for (let i = 0; i < pokemonList.length; i += this.BATCH_SIZE) {
        const batch = pokemonList.slice(i, i + this.BATCH_SIZE);
        
        const batchPromises = batch.map(async (pokemon: Dtos.Pokemon) => {
          try {
            const pokemonCacheKey = `${CACHE_KEYS.POKEMON_DETAIL}:${pokemon.name}`;
            const cachedDetail = cacheManager.get<Dtos.SimplifiedPokemonDTO>(pokemonCacheKey);
            
            if (cachedDetail) {
              return cachedDetail;
            }

            const detailsResponse = await apiClient.get(`/pokemon/${pokemon.name}`);
            const details: Dtos.PokemonDTO = detailsResponse.data;
      
            const simplifiedPokemon = {
              id: details.id,
              name: details.name,
              imageUrl: details.sprites.other?.['official-artwork']?.front_default || details.sprites.front_default,
              types: details.types.map(t => ({
                name: t.type.name,
                slot: t.slot
              })),
              abilities: details.abilities.map(a => ({
                name: a.ability.name,
                isHidden: a.is_hidden
              })),
            };

            cacheManager.set(pokemonCacheKey, simplifiedPokemon, CACHE_CONFIG.LONG);

            return simplifiedPokemon;
          } catch (error) {
            logger.error(`Failed to fetch Pokemon ${pokemon.name}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        enrichedPokemon.push(...batchResults.filter(Boolean) as Dtos.SimplifiedPokemonDTO[]);
        
        // Rate limiting between batches
        if (i + this.BATCH_SIZE < pokemonList.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Cache the complete list
      cacheManager.set(cacheKey, enrichedPokemon, CACHE_CONFIG.SHORT);
      logger.info(`Successfully fetched and cached ${enrichedPokemon.length} Pokemon`, {trace: 'fetchPokemonList'});
      
      return enrichedPokemon;
    } catch (error) {
      logger.error('Error fetching Pokemon list:', error);
      throw error;
    }
  }

  private async fetchPokemonDetails(name: string): Promise<Dtos.SimplifiedPokemonDTO | null> {
    try {
      logger.info(`Fetching Pokemon details: ${name}`, {trace: 'fetchPokemonDetails'});
      
      const { data } = await apiClient.get(`/pokemon/${name.toLowerCase()}`);
      
      const pokemon: Dtos.SimplifiedPokemonDTO = {
        id: data.id,
        name: data.name,
        imageUrl: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
        types: data.types.map((t: any) => ({
          name: t.type.name,
          slot: t.slot
        })),
        abilities: data.abilities.map((a: any) => ({
          name: a.ability.name,
          isHidden: a.is_hidden
        })),
      };

      // Cache the result
      const cacheKey = `${CACHE_KEYS.POKEMON_DETAIL}:${name.toLowerCase()}`;
      cacheManager.set(cacheKey, pokemon, CACHE_CONFIG.LONG);

      return pokemon;
    } catch (error) {
      this.logger.error(`Failed to fetch Pokemon ${name}:`, error);
      return null;
    }
  }

  public async searchPokemon(name: string): Promise<Dtos.SimplifiedPokemonDTO | null> {
    const cacheKey = `${CACHE_KEYS.POKEMON_DETAIL}:${name.toLowerCase()}`;

    // Check cache
    const cached = cacheManager.get<Dtos.SimplifiedPokemonDTO>(cacheKey);
    if (cached) {
      logger.info(`Returning cached Pokemon: ${name}`, {trace: 'searchPokemon'});
      return cached;
    }

    // Check pending requests
    const pendingKey = `search:${name.toLowerCase()}`;
    const pendingRequest = this.pendingRequests.get(pendingKey);
    if (pendingRequest) {
      logger.info(`Returning pending search for: ${name}`, {trace: 'searchPokemon'});
      return pendingRequest;
    }

    // Create new request
    const requestPromise = this.fetchPokemonDetails(name);
    this.pendingRequests.set(pendingKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
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

  private filterByName(pokemons: Dtos.SimplifiedPokemonDTO[], name?: string): Dtos.SimplifiedPokemonDTO[] {
    if (!name) return pokemons;
    return pokemons.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  }

  /**
   * Clear all pending requests (useful for testing/cleanup)
   */
  public clearPendingRequests(): void {
    this.pendingRequests.clear();
  }
}

const pokemonService = new PokemonService();
export default pokemonService;