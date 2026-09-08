import { useState, useEffect } from 'react';
import { pokeApi } from '../services/pokeapi';
import type { Pokemon } from '../types/pokemon';

export function usePokemonList(limit: number, offset: number) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const listData = await pokeApi.getPokemonList(limit, offset);
        
        // Fetch details for all pokemon in the current page
        const detailsPromises = listData.results.map((p) => pokeApi.get<Pokemon>(`/pokemon/${p.name}`));
        const details = await Promise.all(detailsPromises);
        
        if (isMounted) {
          setPokemon(details);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [limit, offset]);

  return { pokemon, loading, error };
}
