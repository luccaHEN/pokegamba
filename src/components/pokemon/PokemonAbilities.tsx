import { useState, useEffect } from 'react';
import { Sparkles, Shield } from 'lucide-react';
import { pokeApi } from '../../services/pokeapi';
import { cn } from '../../utils/cn';

interface AbilityInfo {
  name: string;
  isHidden: boolean;
  slot: number;
  effect: string;
  flavor: string;
  loading: boolean;
}

interface PokemonAbilitiesProps {
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
}

function formatAbilityName(name: string): string {
  return name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function PokemonAbilities({ abilities }: PokemonAbilitiesProps) {
  const [abilityData, setAbilityData] = useState<AbilityInfo[]>([]);

  useEffect(() => {
    let isMounted = true;

    // Initialize with loading states
    const initialList: AbilityInfo[] = abilities.map(a => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      slot: a.slot,
      effect: '',
      flavor: '',
      loading: true,
    }));
    setAbilityData(initialList);

    // Fetch details in parallel
    const promises = abilities.map(async (a) => {
      try {
        const data = await pokeApi.getAbility(a.ability.name);
        
        // Find English short effect or Portuguese flavor text if exists
        const effectEntry = data.effect_entries?.find((e: any) => e.language.name === 'en');
        const flavorEntry = data.flavor_text_entries?.find(
          (f: any) => f.language.name === 'pt-br' || f.language.name === 'en'
        );

        const shortEffect = effectEntry?.short_effect || effectEntry?.effect || '';
        const flavor = flavorEntry?.flavor_text?.replace(/\f/g, ' ') || '';

        return {
          name: a.ability.name,
          isHidden: a.is_hidden,
          slot: a.slot,
          effect: shortEffect,
          flavor: flavor,
          loading: false,
        };
      } catch (err) {
        console.warn(`Falha ao buscar detalhes da habilidade ${a.ability.name}:`, err);
        return {
          name: a.ability.name,
          isHidden: a.is_hidden,
          slot: a.slot,
          effect: 'Detalhes da habilidade indisponíveis.',
          flavor: '',
          loading: false,
        };
      }
    });

    Promise.all(promises).then(results => {
      if (isMounted) {
        setAbilityData(results);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [abilities]);

  if (!abilities || abilities.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          Habilidades Naturais
        </h3>
        <span className="text-xs text-cobble-400 font-bold">
          {abilities.length} {abilities.length === 1 ? 'habilidade' : 'habilidades'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {abilityData.map((ab) => {
          const formattedName = formatAbilityName(ab.name);

          return (
            <div
              key={`${ab.name}-${ab.slot}`}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden",
                ab.isHidden
                  ? "bg-gradient-to-br from-yellow-950/40 via-cobble-900 to-cobble-900 border-yellow-500/50 hover:border-yellow-400"
                  : "bg-cobble-900/90 border-cobble-700 hover:border-cobble-500"
              )}
            >
              {/* Header: Name and Status Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-black text-base text-white tracking-wide flex items-center gap-1.5">
                    {ab.isHidden ? (
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Shield className="w-4 h-4 text-blue-400" />
                    )}
                    {formattedName}
                  </h4>
                </div>

                {ab.isHidden ? (
                  <span className="shrink-0 text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-400/50 shadow flex items-center gap-1">
                    <span>👑</span> Oculta (Hidden)
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-cobble-800 text-cobble-300 border border-cobble-700">
                    Slot {ab.slot}
                  </span>
                )}
              </div>

              {/* Body: Effect description */}
              {ab.loading ? (
                <div className="space-y-1.5 animate-pulse mt-2">
                  <div className="h-3 bg-cobble-800 rounded w-full" />
                  <div className="h-3 bg-cobble-800 rounded w-4/5" />
                </div>
              ) : (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-cobble-200 font-medium leading-relaxed">
                    {ab.effect || ab.flavor || 'Efeito passivo em batalha.'}
                  </p>
                  {ab.flavor && ab.effect && ab.flavor !== ab.effect && (
                    <p className="text-[11px] text-cobble-400 italic">
                      "{ab.flavor}"
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
