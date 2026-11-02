import { cn } from '../../utils/cn';

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  ice: 'Gelo',
  fighting: 'Lutador',
  poison: 'Veneno',
  ground: 'Terrestre',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Pedra',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
  stellar: 'Estelar',
};

export function formatPokemonType(type?: string | null): string {
  if (!type) return '';
  const lower = type.toLowerCase().trim();
  return TYPE_TRANSLATIONS[lower] || type.charAt(0).toUpperCase() + type.slice(1);
}

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
  stellar: 'bg-gradient-to-r from-teal-400 to-indigo-400 text-white',
};

export function PokemonTypeBadge({ type, className }: { type: string; className?: string }) {
  const cleanType = (type || '').toLowerCase().trim();
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-semibold',
        typeColors[cleanType] || 'bg-gray-500 text-white',
        className
      )}
    >
      {formatPokemonType(type)}
    </span>
  );
}
