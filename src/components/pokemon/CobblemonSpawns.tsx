import { useState, useEffect } from 'react';
import { Compass, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { cobblemonService } from '../../services/cobblemon';
import type { CobblemonSpawnData } from '../../services/cobblemon';
import { cn } from '../../utils/cn';

interface CobblemonSpawnsProps {
  pokemonId: number;
  pokemonName: string;
}

const RARITY_STYLES: Record<string, { label: string; badge: string; border: string }> = {
  'ultra-rare': {
    label: 'Ultra Raro',
    badge: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-400/60 shadow-yellow-500/20',
    border: 'border-yellow-500/50',
  },
  'rare': {
    label: 'Raro',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20',
    border: 'border-purple-500/50',
  },
  'uncommon': {
    label: 'Incomum',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-blue-500/20',
    border: 'border-blue-500/50',
  },
  'common': {
    label: 'Comum',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20',
    border: 'border-emerald-500/50',
  },
};

const POSITION_LABELS: Record<string, { label: string; icon: string }> = {
  grounded: { label: 'Terrestre (Terra firme)', icon: '🌲' },
  submerged: { label: 'Submerso (Debaixo d\'água)', icon: '🌊' },
  surface: { label: 'Superfície da Água', icon: '⛵' },
  fishing: { label: 'Pesca com Vara', icon: '🎣' },
  air: { label: 'Aéreo (Voando)', icon: '🪂' },
  seafloor: { label: 'Leito Marinho (Fundo do Mar)', icon: '⚓' },
};

const TIME_LABELS: Record<string, { label: string; icon: string }> = {
  day: { label: 'Diurno (Dia)', icon: '☀️' },
  night: { label: 'Noturno (Noite)', icon: '🌙' },
  dusk: { label: 'Entardecer', icon: '🌇' },
  dawn: { label: 'Amanhecer', icon: '🌅' },
};

export function CobblemonSpawns({ pokemonId, pokemonName }: CobblemonSpawnsProps) {
  const [spawnData, setSpawnData] = useState<CobblemonSpawnData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    cobblemonService.getSpawnData(pokemonId, pokemonName)
      .then(data => {
        if (isMounted) {
          setSpawnData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pokemonId, pokemonName]);

  const rarityInfo = spawnData ? RARITY_STYLES[spawnData.highestRarity] || RARITY_STYLES.common : null;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-yellow-400" />
          Onde Encontrar no Cobblemon
        </h3>
        {spawnData && (
          <span className="text-xs text-cobble-400 font-bold hidden sm:inline">
            Mod Oficial Cobblemon
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-cobble-900/60 p-6 rounded-2xl border-2 border-cobble-700 animate-pulse space-y-4">
          <div className="h-5 bg-cobble-800 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="h-16 bg-cobble-800 rounded-xl" />
            <div className="h-16 bg-cobble-800 rounded-xl" />
            <div className="h-16 bg-cobble-800 rounded-xl" />
            <div className="h-16 bg-cobble-800 rounded-xl" />
          </div>
        </div>
      ) : !spawnData || spawnData.uniqueBiomes.length === 0 ? (
        <div className="bg-cobble-900/80 p-6 rounded-2xl border-2 border-cobble-700/80 text-center space-y-2">
          <div className="w-12 h-12 bg-cobble-800 rounded-full flex items-center justify-center mx-auto text-cobble-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-cobble-200">
            Sem spawn selvagem natural direto no Cobblemon
          </h4>
          <p className="text-xs text-cobble-400 max-w-lg mx-auto">
            Este Pokémon pode ser obtido evoluindo sua pré-evolução, através de eventos, batalhas especiais ou comandos de spawn.
          </p>
        </div>
      ) : (
        <div className="bg-cobble-900/90 rounded-2xl border-2 border-cobble-700 p-5 md:p-6 space-y-6 shadow-xl">
          
          {/* Category Banner if Legendary / Ultra Beast / Mythical */}
          {spawnData.category && spawnData.category !== 'standard' && (
            <div className={cn(
              "p-3 rounded-xl border flex items-center justify-between gap-3 shadow-md",
              spawnData.category === 'ultra-beast' 
                ? "bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border-purple-500/60 text-purple-200"
                : spawnData.category === 'legendary'
                ? "bg-gradient-to-r from-yellow-950/80 via-amber-950/80 to-yellow-950/80 border-yellow-500/60 text-yellow-200"
                : "bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-emerald-950/80 border-emerald-500/60 text-emerald-200"
            )}>
              <div className="flex items-center gap-2">
                <span className="text-xl select-none">
                  {spawnData.category === 'ultra-beast' ? '🌀' : spawnData.category === 'legendary' ? '👑' : '✨'}
                </span>
                <div>
                  <span className="font-black text-xs md:text-sm uppercase tracking-wide block text-white">
                    {spawnData.category === 'ultra-beast'
                      ? 'Ultra Beast (Criatura do Ultra Espaço)'
                      : spawnData.category === 'legendary'
                      ? 'Pokémon Lendário'
                      : 'Pokémon Mítico'}
                  </span>
                  <span className="text-[11px] opacity-90 block">
                    {spawnData.category === 'ultra-beast'
                      ? 'Spawna via Fendas Dimensionais (Wormholes), no The End ou em biomas raros'
                      : spawnData.category === 'legendary'
                      ? 'Spawna em eventos raros, altares com orbes ou datapacks de servidores'
                      : 'Obtido em eventos raros ou altares dimensionais'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Item / Altar Summoning Requirements Card */}
          {spawnData.requiredItem && (
            <div className="bg-gradient-to-br from-amber-950/40 via-cobble-900 to-black/60 border-2 border-yellow-500/60 rounded-2xl p-4 shadow-xl space-y-2.5 relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-yellow-500/30 pb-2">
                <span className="text-xl select-none">🗝️</span>
                <div>
                  <span className="font-black text-xs md:text-sm text-yellow-300 uppercase tracking-wide block">
                    Invocação por Item / Altar Especial
                  </span>
                  <span className="text-[11px] text-cobble-300 block">
                    No Cobblemon com datapack, este Pokémon é despertado através de um ritual ou item-chave.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                <div className="md:col-span-5 bg-black/40 border border-yellow-500/30 rounded-xl p-2.5 flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                    Item Necessário:
                  </span>
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>✨</span> {spawnData.requiredItem}
                  </span>
                </div>

                <div className="md:col-span-7 bg-black/40 border border-yellow-500/30 rounded-xl p-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                    Como Invocar no Jogo:
                  </span>
                  <p className="text-xs text-cobble-200 font-medium leading-relaxed">
                    {spawnData.summonGuide || spawnData.specialNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Special Spawn Note if present (only when no requiredItem to avoid duplicate) */}
          {spawnData.specialNote && !spawnData.requiredItem && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-yellow-200">
              <span className="text-base select-none shrink-0">🎯</span>
              <div>
                <strong className="text-yellow-300 uppercase tracking-wider text-[11px] block font-black mb-0.5">
                  Condição de Invocação & Aparição:
                </strong>
                <p className="font-medium text-yellow-100/90 leading-relaxed">
                  {spawnData.specialNote}
                </p>
              </div>
            </div>
          )}

          {/* Top Quick Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Rarity */}
            <div className="bg-black/30 border border-cobble-700 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-cobble-400 uppercase tracking-wider">
                Raridade de Spawn
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-black uppercase border shadow-sm", rarityInfo?.badge)}>
                  ✨ {rarityInfo?.label || 'Comum'}
                </span>
              </div>
            </div>

            {/* 2. Level Range */}
            <div className="bg-black/30 border border-cobble-700 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-cobble-400 uppercase tracking-wider">
                Nível Selvagem
              </span>
              <div className="mt-1 font-mono font-black text-sm text-yellow-300">
                {spawnData.levelRange}
              </div>
            </div>

            {/* 3. Position Type */}
            <div className="bg-black/30 border border-cobble-700 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-cobble-400 uppercase tracking-wider">
                Contexto no Mundo
              </span>
              <div className="mt-1 flex flex-wrap gap-1 text-xs font-bold text-white">
                {spawnData.positions.map(p => {
                  const info = POSITION_LABELS[p] || { label: p, icon: '📍' };
                  return (
                    <span key={p} className="inline-flex items-center gap-1 bg-cobble-800 px-2 py-0.5 rounded border border-cobble-600 text-[11px]">
                      <span>{info.icon}</span> {info.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Environmental Conditions if any */}
          {(Boolean(spawnData.timeRanges?.length) || 
            Boolean(spawnData.conditions?.requiresRain) || 
            Boolean(spawnData.conditions?.requiresThunder) || 
            Boolean(spawnData.conditions?.structures?.length) || 
            Boolean(spawnData.conditions?.nearbyBlocks?.length)) && (
            <div className="bg-black/30 border border-cobble-700/80 rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-black text-cobble-300 uppercase tracking-wider block">
                Condições do Ambiente:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {spawnData.timeRanges?.map(t => {
                  const info = TIME_LABELS[t] || { label: t, icon: '⏰' };
                  return (
                    <span key={t} className="inline-flex items-center gap-1.5 bg-cobble-800 text-cobble-200 px-2.5 py-1 rounded-lg border border-cobble-600 font-bold text-[11px]">
                      <span>{info.icon}</span> {info.label}
                    </span>
                  );
                })}
                {spawnData.conditions?.requiresRain && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-950/60 text-blue-300 px-2.5 py-1 rounded-lg border border-blue-600/50 font-bold text-[11px]">
                    <span>🌧️</span> Requer Chuva
                  </span>
                )}
                {spawnData.conditions?.requiresThunder && (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-950/60 text-yellow-300 px-2.5 py-1 rounded-lg border border-yellow-600/50 font-bold text-[11px]">
                    <span>⚡</span> Requer Tempestade com Raios
                  </span>
                )}
                {spawnData.conditions?.structures && spawnData.conditions.structures.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-950/60 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-600/50 font-bold text-[11px]">
                    <span>🏛️</span> Perto de Vilas / Estruturas
                  </span>
                )}
                {spawnData.conditions?.nearbyBlocks && spawnData.conditions.nearbyBlocks.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-950/60 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-600/50 font-bold text-[11px]">
                    <span>💧</span> Requer Blocos de Água por perto
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Biomes Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Biomas de Aparição ({spawnData.uniqueBiomes.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {spawnData.uniqueBiomes.map((biome) => (
                <div
                  key={biome.raw}
                  className="bg-black/40 border border-cobble-700/80 hover:border-emerald-500/60 p-2.5 rounded-xl transition-all flex items-start gap-2.5 group"
                >
                  <span className="text-2xl select-none group-hover:scale-110 transition-transform shrink-0">
                    {biome.icon}
                  </span>
                  <div className="min-w-0">
                    <span className="font-black text-xs text-white block truncate">
                      {biome.label}
                    </span>
                    {biome.description && (
                      <span className="text-[10px] text-cobble-400 block line-clamp-1">
                        {biome.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Spawn Conditions Info */}
          <div className="border-t border-cobble-700/60 pt-3 flex flex-wrap items-center justify-between text-xs text-cobble-300 gap-2">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baseado no datapack oficial do Cobblemon</span>
              </span>
            </div>

            <span className="text-[10px] text-cobble-400 italic">
              Pode variar de acordo com datapacks instalados no servidor.
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
