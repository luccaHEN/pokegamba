import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Pokemon } from '../../types/pokemon';
import { PokemonTypeBadge } from './PokemonTypeBadge';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../../utils/cn';

export function PokemonCard({ pokemon, isShadow = false }: { pokemon: Pokemon, isShadow?: boolean }) {
  const [favorites, setFavorites] = useLocalStorage<number[]>('cobblemon-favorites', []);

  const isFavorite = favorites.includes(pokemon.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorite) {
      setFavorites(favorites.filter((id) => id !== pokemon.id));
    } else {
      setFavorites([...favorites, pokemon.id]);
    }
  };

  const mainType = pokemon.types[0]?.type.name || 'normal';
  
  const typeGradients: Record<string, string> = {
    normal: 'from-stone-500/20 to-transparent',
    fire: 'from-orange-500/20 to-transparent',
    water: 'from-blue-500/20 to-transparent',
    electric: 'from-yellow-400/20 to-transparent',
    grass: 'from-green-500/20 to-transparent',
    ice: 'from-cyan-400/20 to-transparent',
    fighting: 'from-red-600/20 to-transparent',
    poison: 'from-purple-500/20 to-transparent',
    ground: 'from-amber-600/20 to-transparent',
    flying: 'from-indigo-400/20 to-transparent',
    psychic: 'from-pink-500/20 to-transparent',
    bug: 'from-lime-500/20 to-transparent',
    rock: 'from-stone-600/20 to-transparent',
    ghost: 'from-purple-700/20 to-transparent',
    dragon: 'from-indigo-600/20 to-transparent',
    dark: 'from-slate-700/20 to-transparent',
    steel: 'from-slate-500/20 to-transparent',
    fairy: 'from-pink-400/20 to-transparent',
  };

  const gradient = typeGradients[mainType] || typeGradients.normal;

  return (
    <Link
      to={isShadow ? '#' : `/pokemon/${pokemon.id}`}
      className={cn(
        'group relative flex flex-col items-center p-4 rounded-xl border border-cobble-700 transition-all overflow-hidden bg-gradient-to-br h-full w-full',
        gradient,
        isShadow ? 'bg-black/50 cursor-pointer border-dashed border-cobble-500 hover:border-yellow-400' : 'bg-cobble-800 hover:scale-105 hover:shadow-xl hover:border-cobble-500'
      )}
    >
      {!isShadow && (
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-cobble-900/50 hover:bg-cobble-700 transition-colors"
        >
          <Heart
            className={cn('w-5 h-5 transition-colors', isFavorite ? 'fill-red-500 text-red-500' : 'text-cobble-300')}
          />
        </button>
      )}

      <span className="absolute top-3 left-3 text-xs font-bold text-cobble-400">
        #{String(pokemon.id).padStart(4, '0')}
      </span>

      <div className="w-32 h-32 mt-4 mb-2 flex items-center justify-center relative">
        {isShadow && <span className="absolute text-5xl font-black text-yellow-400 z-20 animate-pulse drop-shadow-md">?</span>}
        <img
          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
          alt={isShadow ? '???' : pokemon.name}
          className={cn(
            "max-w-full max-h-full object-contain transition-all duration-500",
            isShadow ? "brightness-0 opacity-70 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "drop-shadow-lg group-hover:scale-110"
          )}
          loading="lazy"
        />
      </div>

      <h3 className={cn("text-lg font-bold capitalize mt-2 mb-2", isShadow && "text-cobble-400")}>
        {isShadow ? 'Quem é esse Pokémon?' : pokemon.name}
      </h3>
      
      <div className={cn("flex flex-col gap-1 w-full px-2 mt-auto min-h-[64px]", isShadow && "opacity-0")}>
        {pokemon.types.map((t) => (
          <div key={t.type.name} className="flex items-center justify-between bg-cobble-900/50 rounded-md px-2 py-1 h-7">
            <span className="text-xs text-cobble-300 font-medium">Tipo {t.slot}</span>
            <PokemonTypeBadge type={t.type.name} />
          </div>
        ))}
        {pokemon.types.length === 1 && (
          <div className="flex items-center justify-between rounded-md px-2 py-1 h-7 opacity-20">
            <span className="text-xs text-cobble-500 font-medium">Tipo 2</span>
            <span className="text-xs text-cobble-500">-</span>
          </div>
        )}
      </div>
    </Link>
  );
}
