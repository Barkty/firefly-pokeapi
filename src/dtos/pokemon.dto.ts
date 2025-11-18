// Base Types
export interface Pokemon {
  name: string;
  url: string;
}

export class FilterPokemon {
  name: string;
  page: number;
  limit: number
}

interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: Pokemon;
  version_group: Pokemon;
}

interface Move {
  move: Pokemon;
  version_group_details: VersionGroupDetail[];
}

interface Ability {
  ability: Pokemon;
  is_hidden: boolean;
  slot: number;
}

interface Type {
  slot: number;
  type: Pokemon;
}

interface Stat {
  base_stat: number;
  effort: number;
  stat: Pokemon;
}

interface Sprites {
  back_default: string | null;
  back_female: string | null;
  back_shiny: string | null;
  back_shiny_female: string | null;
  front_default: string | null;
  front_female: string | null;
  front_shiny: string | null;
  front_shiny_female: string | null;
  other?: {
    dream_world?: {
      front_default: string | null;
      front_female: string | null;
    };
    home?: {
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
    showdown?: {
      back_default: string | null;
      back_female: string | null;
      back_shiny: string | null;
      back_shiny_female: string | null;
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
  };
  versions?: any; // Complex nested structure - can be expanded if needed
}

interface GameIndex {
  game_index: number;
  version: Pokemon;
}

interface Cries {
  latest: string;
  legacy: string;
}

// Main Pokemon Interface
export interface PokemonDTO {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  abilities: Ability[];
  forms: Pokemon[];
  game_indices: GameIndex[];
  held_items: any[]; // Usually empty for most pokemon
  location_area_encounters: string;
  moves: Move[];
  past_abilities: any[];
  past_types: any[];
  species: Pokemon;
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  cries?: Cries;
}

export interface SimplifiedPokemonDTO {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  abilities: string[];
  stats?: {
    name: string;
    value: number;
  }[];
  height?: number;
  weight?: number;
  evolutionChain?: {
    name: string;
    id: number;
  }[];
}

// For Pokemon List Response
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

export class FetchPokemonByName {
  name: string;
}

export class FetchPokemonByType {
  type: string;
}