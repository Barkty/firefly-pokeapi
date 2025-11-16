interface NamedAPIResource {
  name: string;
  url: string;
}

interface Language {
  name: string;
  url: string;
}

interface FlavorTextEntry {
  flavor_text: string;
  language: Language;
  version: NamedAPIResource;
}

interface Genus {
  genus: string;
  language: Language;
}

interface Name {
  language: Language;
  name: string;
}

interface PalParkEncounter {
  area: NamedAPIResource;
  base_score: number;
  rate: number;
}

interface PokedexNumber {
  entry_number: number;
  pokedex: NamedAPIResource;
}

interface Variety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

interface PokemonSpecies {
  base_happiness: number;
  capture_rate: number;
  color: NamedAPIResource;
  egg_groups: NamedAPIResource[];
  evolution_chain: {
    url: string;
  };
  evolves_from_species: NamedAPIResource | null;
  flavor_text_entries: FlavorTextEntry[];
  form_descriptions: any[]; // Can be typed more specifically if needed
  forms_switchable: boolean;
  gender_rate: number;
  genera: Genus[];
  generation: NamedAPIResource;
  growth_rate: NamedAPIResource;
  habitat: NamedAPIResource;
  has_gender_differences: boolean;
  hatch_counter: number;
  id: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  name: string;
  names: Name[];
  order: number;
  pal_park_encounters: PalParkEncounter[];
  pokedex_numbers: PokedexNumber[];
  shape: NamedAPIResource;
  varieties: Variety[];
}

export type { 
  PokemonSpecies, 
  NamedAPIResource, 
  FlavorTextEntry, 
  Genus, 
  Name,
  PalParkEncounter,
  PokedexNumber,
  Variety
};