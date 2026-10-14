import { useState } from 'react';
import { STARTER_POKEMON_DEFS, getStarterSpriteUrl } from '../../utils/starters';
import type { StarterPokemonDef } from '../../utils/starters';
import { cn } from '../../utils/cn';
import { Crown, Sparkles, CheckCircle2 } from 'lucide-react';

interface StartersDraftBoardProps {
  claimedStarters: Record<number, string>;
  highlightedId?: number | null;
  onSelectStarter?: (starter: StarterPokemonDef) => void;
  className?: string;
}

const TYPE_STYLES = {
  grass: {
    border: 'border-emerald-500/60 hover:border-emerald-400',
    bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    indicator: '🌿',
  },
  fire: {
    border: 'border-orange-500/60 hover:border-orange-400',
    bg: 'bg-orange-950/40 hover:bg-orange-900/50',
    text: 'text-orange-300',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    indicator: '🔥',
  },
  water: {
    border: 'border-cyan-500/60 hover:border-cyan-400',
    bg: 'bg-cyan-950/40 hover:bg-cyan-900/50',
    text: 'text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    indicator: '💧',
  },
};

export function StartersDraftBoard({
  claimedStarters,
  highlightedId,
  onSelectStarter,
  className
}: StartersDraftBoardProps) {
  const [filterType, setFilterType] = useState<'all' | 'grass' | 'fire' | 'water'>('all');

  const claimedCount = Object.keys(claimedStarters).length;
  const remainingCount = 27 - claimedCount;
  const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={cn("bg-cobble-900/90 border-4 border-cobble-700 p-3 rounded-xl flex flex-col shadow-2xl relative", className)}>
      {/* Board Header */}
      <div className="flex items-center justify-between border-b-2 border-cobble-700 pb-2 mb-2 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h3 className="text-xs md:text-sm font-black text-white tracking-wide">
            Quadro dos 27 Iniciais
          </h3>
          <span className="text-[10px] bg-yellow-500/20 text-yellow-300 font-bold px-2 py-0.5 border border-yellow-500/40 rounded-full">
            {remainingCount} Disponíveis
          </span>
        </div>

        <div className="text-[11px] font-bold text-cobble-400">
          <span className="text-emerald-400 font-black">{claimedCount}</span> / 27 Sorteados
        </div>
      </div>

      {/* Quick Type Filter Tabs */}
      <div className="flex gap-1 mb-2 bg-black/40 p-1 rounded-lg border border-cobble-700/80">
        <button
          onClick={() => setFilterType('all')}
          className={cn(
            "flex-1 py-1 text-[11px] font-black rounded transition-all text-center cursor-pointer",
            filterType === 'all' ? "bg-yellow-500 text-cobble-950 shadow" : "text-cobble-400 hover:text-white"
          )}
        >
          Todos (27)
        </button>
        <button
          onClick={() => setFilterType('grass')}
          className={cn(
            "flex-1 py-1 text-[11px] font-black rounded transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
            filterType === 'grass' ? "bg-emerald-600 text-white shadow" : "text-emerald-400 hover:text-emerald-200"
          )}
        >
          <span>🌿</span> Planta
        </button>
        <button
          onClick={() => setFilterType('fire')}
          className={cn(
            "flex-1 py-1 text-[11px] font-black rounded transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
            filterType === 'fire' ? "bg-orange-600 text-white shadow" : "text-orange-400 hover:text-orange-200"
          )}
        >
          <span>🔥</span> Fogo
        </button>
        <button
          onClick={() => setFilterType('water')}
          className={cn(
            "flex-1 py-1 text-[11px] font-black rounded transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
            filterType === 'water' ? "bg-cyan-600 text-white shadow" : "text-cyan-400 hover:text-cyan-200"
          )}
        >
          <span>💧</span> Água
        </button>
      </div>

      {/* View Mode 1: Filtered by Type (Shows all 9 starters of that type clearly in a 3x3 grid) */}
      {filterType !== 'all' ? (
        <div className="grid grid-cols-3 gap-2 p-1 max-h-[380px] overflow-y-auto custom-scrollbar">
          {STARTER_POKEMON_DEFS.filter(s => s.type === filterType).map((starter) => {
            const owner = claimedStarters[starter.id];
            const isClaimed = Boolean(owner);
            const isHighlighted = highlightedId === starter.id;
            const typeStyle = TYPE_STYLES[starter.type];

            return (
              <div
                key={starter.id}
                onClick={() => onSelectStarter?.(starter)}
                className={cn(
                  "relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all select-none",
                  isHighlighted && "ring-4 ring-yellow-400 scale-105 z-20 shadow-2xl bg-yellow-500/20 animate-pulse",
                  isClaimed
                    ? "bg-cobble-950/80 border-cobble-700 opacity-60"
                    : cn(typeStyle.bg, typeStyle.border, "cursor-pointer shadow-sm hover:scale-[1.03]")
                )}
              >
                {isClaimed && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl z-10 flex flex-col items-center justify-center p-1 text-center">
                    <div className="bg-yellow-500 text-cobble-950 border border-yellow-300 font-black text-[10px] px-1.5 py-0.5 rounded shadow flex items-center gap-1 truncate max-w-full">
                      <Crown className="w-3 h-3 shrink-0" />
                      <span className="truncate">{owner}</span>
                    </div>
                  </div>
                )}

                <div className="w-full flex items-center justify-between text-[9px] text-cobble-400 font-mono">
                  <span className="font-bold text-yellow-400">G{starter.gen}</span>
                  <span>#{String(starter.id).padStart(3, '0')}</span>
                </div>

                <img
                  src={getStarterSpriteUrl(starter.id)}
                  alt={starter.name}
                  className={cn(
                    "w-14 h-14 object-contain filter drop-shadow my-1",
                    isClaimed && "grayscale opacity-50"
                  )}
                  loading="lazy"
                />

                <div className="w-full text-center">
                  <span className={cn("text-xs font-black block truncate", isClaimed ? "text-cobble-400 line-through" : "text-white")}>
                    {starter.name}
                  </span>
                  <span className="text-[9px] text-cobble-400 block font-bold">
                    {starter.generationName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: All 9 Generations */
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[380px] custom-scrollbar">
          {generations.map((genNum) => {
            const genStarters = STARTER_POKEMON_DEFS.filter(s => s.gen === genNum);
            return (
              <div 
                key={genNum} 
                className="bg-black/30 border border-cobble-700/80 rounded-lg p-1.5 flex items-center gap-2"
              >
                {/* Gen Label */}
                <div className="w-12 shrink-0 text-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-cobble-400 block">
                    G{genNum}
                  </span>
                </div>

                {/* 3 Starter Slots */}
                <div className="flex-1 grid grid-cols-3 gap-1.5">
                  {genStarters.map((starter) => {
                    const owner = claimedStarters[starter.id];
                    const isClaimed = Boolean(owner);
                    const isHighlighted = highlightedId === starter.id;
                    const typeStyle = TYPE_STYLES[starter.type];

                    return (
                      <div
                        key={starter.id}
                        onClick={() => onSelectStarter?.(starter)}
                        className={cn(
                          "relative flex flex-col items-center justify-between p-1 rounded-lg border transition-all select-none",
                          isHighlighted && "ring-4 ring-yellow-400 scale-105 z-20 shadow-2xl bg-yellow-500/20 animate-pulse",
                          isClaimed
                            ? "bg-cobble-950/80 border-cobble-700 opacity-60"
                            : cn(typeStyle.bg, typeStyle.border, "cursor-pointer shadow-sm hover:scale-[1.02]")
                        )}
                        title={
                          isClaimed 
                            ? `${starter.name} já foi sorteado para ${owner}!` 
                            : `${starter.name} está disponível!`
                        }
                      >
                        {/* Claimed Stamp */}
                        {isClaimed && (
                          <div className="absolute inset-0 bg-black/60 rounded-lg z-10 flex flex-col items-center justify-center p-0.5 text-center">
                            <div className="bg-yellow-500/90 text-cobble-950 border border-yellow-300 font-black text-[9px] px-1 py-0.2 rounded shadow flex items-center gap-0.5 truncate max-w-full">
                              <Crown className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{owner}</span>
                            </div>
                          </div>
                        )}

                        <div className="w-full flex items-center justify-between text-[8px] text-cobble-400 font-mono px-0.5">
                          <span>{typeStyle.indicator}</span>
                          <span>#{String(starter.id).padStart(3, '0')}</span>
                        </div>

                        <img
                          src={getStarterSpriteUrl(starter.id)}
                          alt={starter.name}
                          className={cn(
                            "w-10 h-10 object-contain filter drop-shadow my-0.5",
                            isClaimed && "grayscale opacity-50"
                          )}
                          loading="lazy"
                        />

                        <span className={cn("text-[10px] font-bold block truncate max-w-full text-center", isClaimed ? "text-cobble-400 line-through" : "text-white")}>
                          {starter.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-2 pt-1.5 border-t border-cobble-700/80 flex items-center justify-between text-[10px] text-cobble-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-yellow-400" />
          <span>1 inicial por participante (sem repetição).</span>
        </span>
        <span className="font-bold text-yellow-400">
          {claimedCount}/27 Sorteados
        </span>
      </div>
    </div>
  );
}
