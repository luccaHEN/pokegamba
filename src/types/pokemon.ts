export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonMoveVersion {
  level_learned_at: number;
  move_learn_method: {
    name: string;
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
}

export interface PokemonMoveEntry {
  move: {
    name: string;
    url: string;
  };
  version_group_details: PokemonMoveVersion[];
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    front_shiny?: string;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny?: string;
      };
      showdown?: {
        front_default?: string;
        front_shiny?: string;
      }
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
  moves?: PokemonMoveEntry[];
  cries?: {
    latest: string;
    legacy: string;
  };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  generation: {
    name: string;
    url: string;
  };
  evolves_from_species: {
    name: string;
    url: string;
  } | null;
  evolution_chain: {
    url: string;
  };
  varieties?: {
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    };
  }[];
}

export interface LotteryHistorySession {
  id: string;
  pokemons: Pokemon[];
  date: string;
  quantityRequested: number;
  filters: string[];
  participants?: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark';
  allowLegendary: boolean;
  allowMythical: boolean;
  allowDuplicates: boolean;
}
