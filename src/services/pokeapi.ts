import raticateImg from '../assets/raticate.png';
import type { Pokemon, PokemonSpecies, PokemonListResponse } from '../types/pokemon';

export function patchPokemonSprites(pokemon: Pokemon): Pokemon {
  if (!pokemon) return pokemon;
  const isRaticate = 
    pokemon.id === 20 || 
    pokemon.name === 'raticate' || 
    pokemon.name === 'raticate-alola' || 
    pokemon.name === 'raticate-totem' || 
    pokemon.name === 'raticate-totem-alola';

  if (isRaticate) {
    return {
      ...pokemon,
      sprites: {
        ...pokemon.sprites,
        front_default: raticateImg,
        front_shiny: raticateImg,
        other: {
          ...pokemon.sprites?.other,
          'official-artwork': {
            front_default: raticateImg,
            front_shiny: raticateImg,
          },
          showdown: {
            front_default: raticateImg,
            front_shiny: raticateImg,
          },
        },
      },
    };
  }
  return pokemon;
}

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const memoryCache = new Map<string, any>();
const STORAGE_PREFIX = 'pk_cache_';

function getFromStorage<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const item = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, data: any): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // If quota exceeded, silently continue with in-memory cache
  }
}

export const pokeApi = {
  async get<T>(endpoint: string): Promise<T> {
    // 1. Check L1 Memory Cache
    if (memoryCache.has(endpoint)) {
      return memoryCache.get(endpoint);
    }

    // 2. Check L2 SessionStorage Cache (persists across page reloads & fast navigation)
    const stored = getFromStorage<T>(endpoint);
    if (stored) {
      const patched = endpoint.startsWith('/pokemon/') ? (patchPokemonSprites(stored as any) as T) : stored;
      memoryCache.set(endpoint, patched);
      return patched;
    }

    // 3. Fetch from API
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }
    let data = await response.json();
    if (endpoint.startsWith('/pokemon/')) {
      data = patchPokemonSprites(data as any);
    }

    memoryCache.set(endpoint, data);
    saveToStorage(endpoint, data);

    return data;
  },

  async getPokemon(idOrName: string | number): Promise<Pokemon> {
    const data = await this.get<Pokemon>(`/pokemon/${idOrName}`);
    return patchPokemonSprites(data);
  },

  async getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    return this.get<PokemonSpecies>(`/pokemon-species/${idOrName}`);
  },

  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    return this.get<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
  },

  async getAllPokemonList(): Promise<PokemonListResponse> {
    // Limits to roughly all pokemon up to gen 9
    return this.get<PokemonListResponse>(`/pokemon?limit=1025`);
  },

  async getPokemonByType(type: string): Promise<any> {
    return this.get<any>(`/type/${type}`);
  },

  async getAbility(idOrName: string | number): Promise<any> {
    return this.get<any>(`/ability/${idOrName}`);
  },

  async getMove(idOrName: string | number): Promise<any> {
    return this.get<any>(`/move/${idOrName}`);
  }
};
