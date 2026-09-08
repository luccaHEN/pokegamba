import { cn } from '../../utils/cn';

const typeColors: Record<string, string> = {
  normal: 'bg-stone-400 text-stone-900',
  fire: 'bg-orange-500 text-white',
  water: 'bg-blue-500 text-white',
  electric: 'bg-yellow-400 text-yellow-900',
  grass: 'bg-green-500 text-white',
  ice: 'bg-cyan-300 text-cyan-900',
  fighting: 'bg-red-600 text-white',
  poison: 'bg-purple-500 text-white',
  ground: 'bg-amber-600 text-white',
  flying: 'bg-indigo-300 text-indigo-900',
  psychic: 'bg-pink-500 text-white',
  bug: 'bg-lime-500 text-white',
  rock: 'bg-stone-600 text-white',
  ghost: 'bg-purple-700 text-white',
  dragon: 'bg-indigo-600 text-white',
  dark: 'bg-slate-700 text-white',
  steel: 'bg-slate-400 text-slate-900',
  fairy: 'bg-pink-300 text-pink-900',
};

export function PokemonTypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
        typeColors[type] || 'bg-gray-500 text-white',
        className
      )}
    >
      {type}
    </span>
  );
}
