import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { pokeApi } from '../services/pokeapi';
import type { Pokemon } from '../types/pokemon';
import { PokemonCard } from '../components/pokemon/PokemonCard';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function Favorites() {
  const [favorites] = useLocalStorage<number[]>('cobblemon-favorites', []);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFavorites() {
      setLoading(true);
      try {
        if (favorites.length === 0) {
          if (isMounted) setPokemonList([]);
          return;
        }

        const promises = favorites.map(id => pokeApi.getPokemon(id));
        const results = await Promise.all(promises);
        if (isMounted) setPokemonList(results);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [favorites]);

  const visibleList = pokemonList.filter(p => favorites.includes(p.id));

  const handleToggleFavorite = (id: number, isFav: boolean) => {
    if (!isFav) {
      setPokemonList(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-cobble-800 p-6 rounded-xl border border-cobble-700">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" /> 
            Meus Favoritos
          </h1>
          <p className="text-cobble-300">Sua coleção pessoal de Pokémon marcados como favoritos.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: Math.max(favorites.length, 5) }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-cobble-800 animate-pulse border border-cobble-700" />
          ))}
        </div>
      ) : visibleList.length === 0 ? (
        <div className="text-center py-20 bg-cobble-800 rounded-xl border border-cobble-700">
          <Star className="w-16 h-16 text-cobble-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cobble-300 mb-2">Nenhum Pokémon favoritado ainda.</h2>
          <p className="text-cobble-400 mb-6">Encontre seus Pokémon no Sorteio ou na Pokédex e marque o coraçãozinho!</p>
          <div className="flex justify-center gap-4">
            <Link to="/sorteio"><Button variant="primary">Ir para Sorteio</Button></Link>
            <Link to="/pokedex"><Button variant="secondary">Ir para Pokédex</Button></Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {visibleList.map(p => (
            <div key={p.id} className="h-full flex flex-col transition-all">
              <PokemonCard pokemon={p} onToggleFavorite={handleToggleFavorite} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
