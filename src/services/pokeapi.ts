import type { Pokemon, PokemonSpecies, PokemonListResponse } from '../types/pokemon';

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const cache = new Map<string, any>();

export const pokeApi = {
  async get<T>(endpoint: string): Promise<T> {
    if (cache.has(endpoint)) {
      return cache.get(endpoint);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }
    const data = await response.json();
    cache.set(endpoint, data);
    return data;
  },

  async getPokemon(idOrName: string | number): Promise<Pokemon> {
    return this.get<Pokemon>(`/pokemon/${idOrName}`);
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
  }
};
