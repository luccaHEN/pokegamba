import { motion, AnimatePresence } from 'framer-motion';
import type { AttackAnimationEvent, PokemonType } from '../../types/battle';
import { PokemonTypeBadge } from '../pokemon/PokemonTypeBadge';
import { Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AttackVFXProps {
  event: AttackAnimationEvent | null;
  stage: 'lunge' | 'projectile' | 'impact' | 'idle';
  isPlayerAttacker: boolean;
}

export function AttackVFX({ event, stage, isPlayerAttacker }: AttackVFXProps) {
  if (!event || stage === 'idle') return null;

  // Coordinate setup in percentage of the stadium
  // Player is bottom-left (~20%, ~75%)
  // Opponent is top-right (~80%, ~28%)
  const startX = isPlayerAttacker ? '22%' : '78%';
  const startY = isPlayerAttacker ? '72%' : '30%';

  const targetX = isPlayerAttacker ? '78%' : '22%';
  const targetY = isPlayerAttacker ? '30%' : '72%';

  const type = event.moveType;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. Attack Announcement Banner (Top-Center) */}
      <AnimatePresence>
        {(stage === 'lunge' || stage === 'projectile' || stage === 'impact') && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="px-4 py-1.5 rounded-full bg-cobble-950/90 border border-cobble-600 shadow-2xl backdrop-blur-md flex items-center gap-2">
              <span className="text-xs font-black text-white capitalize">{event.attackerName}</span>
              <span className="text-[11px] text-cobble-400">usou</span>
              <span className="text-xs font-black text-yellow-400 flex items-center gap-1">
                {event.moveName}
              </span>
              <PokemonTypeBadge type={event.moveType} className="text-[9px] px-1.5 py-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Projectile Traveling Animation */}
      <AnimatePresence>
        {stage === 'projectile' && (
          <motion.div
            initial={{ left: startX, top: startY, opacity: 0, scale: 0.5 }}
            animate={{ left: targetX, top: targetY, opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
          >
            {renderProjectile(type)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Impact Burst on Defender */}
      <AnimatePresence>
        {stage === 'impact' && (
          <>
            {/* Screen Flash on Super Effective / Heavy Hit */}
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'absolute inset-0 pointer-events-none',
                type === 'fire' ? 'bg-orange-600/30' :
                type === 'electric' ? 'bg-yellow-400/40' :
                type === 'water' || type === 'ice' ? 'bg-cyan-500/30' :
                type === 'grass' ? 'bg-emerald-500/30' :
                type === 'psychic' || type === 'fairy' ? 'bg-pink-500/30' :
                'bg-red-600/20'
              )}
            />

            {/* Impact Center Effect */}
            <motion.div
              initial={{ left: targetX, top: targetY, scale: 0.3, opacity: 1 }}
              animate={{ left: targetX, top: targetY, scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
            >
              {renderImpact(type)}
            </motion.div>

            {/* Floating Combat Text (Damage & Effectiveness) */}
            <motion.div
              initial={{ left: targetX, top: targetY, opacity: 0, y: 0, scale: 0.7 }}
              animate={{ left: targetX, top: targetY, opacity: 1, y: -65, scale: 1.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-40 text-center pointer-events-none select-none flex flex-col items-center gap-0.5"
            >
              {/* Damage number */}
              <div className="text-2xl sm:text-3xl font-black text-red-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] stroke-black tracking-tight font-mono">
                -{event.damage} <span className="text-base text-red-300">HP</span>
              </div>

              {/* Critical Hit Badge */}
              {event.isCrit && (
                <div className="px-2 py-0.5 rounded-full bg-yellow-500 text-cobble-950 font-black text-[10px] sm:text-xs shadow-lg uppercase tracking-wider animate-bounce flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  CRÍTICO!
                </div>
              )}

              {/* Type Effectiveness Alert */}
              {event.effectiveness > 1 && (
                <div className="px-2 py-0.5 rounded-full bg-orange-600/90 text-white font-black text-[9px] sm:text-[10px] shadow border border-orange-400 uppercase tracking-wider">
                  Super Efetivo! (2x)
                </div>
              )}
              {event.effectiveness > 0 && event.effectiveness < 1 && (
                <div className="px-2 py-0.5 rounded-full bg-cobble-800/90 text-cobble-300 font-bold text-[9px] border border-cobble-600 uppercase tracking-wider">
                  Pouco Efetivo...
                </div>
              )}
              {event.effectiveness === 0 && (
                <div className="px-2 py-0.5 rounded-full bg-cobble-900 text-cobble-400 font-bold text-[9px] border border-cobble-700 uppercase tracking-wider">
                  Não teve efeito! (0x)
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Visual projectile by Pokémon Type
function renderProjectile(type: PokemonType) {
  switch (type) {
    case 'fire':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-500 rounded-full blur-md animate-pulse opacity-80" />
          <div className="w-10 h-10 bg-gradient-to-tr from-red-600 via-orange-500 to-yellow-300 rounded-full shadow-lg shadow-orange-500 flex items-center justify-center text-xl animate-spin">
            🔥
          </div>
          <div className="absolute -left-2 w-6 h-6 bg-red-500 rounded-full blur-sm opacity-60" />
        </div>
      );

    case 'water':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-80" />
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-200 rounded-full shadow-lg shadow-cyan-500 flex items-center justify-center text-xl animate-pulse">
            🌊
          </div>
        </div>
      );

    case 'electric':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-90 animate-ping" />
          <div className="w-12 h-12 bg-yellow-300 rounded-full shadow-xl shadow-yellow-400 flex items-center justify-center text-2xl animate-bounce">
            ⚡
          </div>
        </div>
      );

    case 'grass':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-75" />
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-700 via-green-500 to-lime-300 rounded-full flex items-center justify-center text-xl animate-spin">
            🍃
          </div>
        </div>
      );

    case 'ice':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-300 rounded-full blur-md opacity-90" />
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-300 via-cyan-100 to-white rounded-full shadow-lg flex items-center justify-center text-2xl animate-pulse">
            ❄️
          </div>
        </div>
      );

    case 'ghost':
    case 'dark':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-900 rounded-full blur-lg opacity-90" />
          <div className="w-12 h-12 bg-gradient-to-br from-purple-950 via-purple-700 to-black rounded-full shadow-xl shadow-purple-900 flex items-center justify-center text-xl border border-purple-500/50">
            🟣
          </div>
        </div>
      );

    case 'psychic':
    case 'fairy':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-pink-500 rounded-full blur-lg opacity-80" />
          <div className="w-12 h-12 bg-gradient-to-tr from-fuchsia-600 via-pink-400 to-rose-200 rounded-full shadow-lg flex items-center justify-center text-xl animate-spin">
            ✨
          </div>
        </div>
      );

    case 'rock':
    case 'ground':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-800 rounded-full blur-md opacity-75" />
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-950 via-yellow-800 to-stone-600 rounded-full shadow-lg flex items-center justify-center text-xl">
            🪨
          </div>
        </div>
      );

    case 'dragon':
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-600 rounded-full blur-lg opacity-90 animate-pulse" />
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-950 via-blue-600 to-cyan-300 rounded-full shadow-xl flex items-center justify-center text-xl">
            🐉
          </div>
        </div>
      );

    default:
      // Fighting, Normal, Steel, Flying, Bug, Poison
      return (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/40 rounded-full blur-md" />
          <div className="w-10 h-10 bg-gradient-to-r from-stone-400 via-white to-stone-200 rounded-full shadow-lg flex items-center justify-center text-xl animate-ping">
            💥
          </div>
        </div>
      );
  }
}

// Visual explosion burst upon impact
function renderImpact(type: PokemonType) {
  switch (type) {
    case 'fire':
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-90" />
          <div className="text-4xl">💥</div>
          <div className="absolute -top-3 text-2xl">🔥</div>
          <div className="absolute -bottom-3 text-2xl">🔥</div>
          <div className="absolute -left-3 text-2xl">🔥</div>
          <div className="absolute -right-3 text-2xl">🔥</div>
        </div>
      );

    case 'water':
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-80" />
          <div className="text-4xl">🌊</div>
          <div className="absolute -top-2 text-2xl">💧</div>
          <div className="absolute -bottom-2 text-2xl">💧</div>
        </div>
      );

    case 'electric':
      return (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl opacity-90" />
          <div className="text-5xl">⚡</div>
          <div className="absolute inset-0 border-4 border-yellow-300 rounded-full animate-ping" />
        </div>
      );

    case 'ice':
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-200 rounded-full blur-xl opacity-80" />
          <div className="text-4xl">❄️</div>
          <div className="absolute -top-3 text-2xl">🧊</div>
        </div>
      );

    case 'grass':
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-80" />
          <div className="text-4xl">🍃</div>
          <div className="absolute -right-2 text-2xl">🌿</div>
        </div>
      );

    case 'ghost':
    case 'dark':
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-800 rounded-full blur-2xl opacity-90" />
          <div className="text-4xl">💀</div>
        </div>
      );

    case 'psychic':
    case 'fairy':
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-pink-500 rounded-full blur-2xl opacity-90" />
          <div className="text-4xl">✨</div>
          <div className="absolute inset-0 border-2 border-pink-300 rounded-full animate-ping" />
        </div>
      );

    default:
      // Physical / Slash impact
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/40 rounded-full blur-lg" />
          <div className="text-4xl">💥</div>
          {/* Dual Slash lines */}
          <div className="absolute w-20 h-1 bg-white rotate-45 shadow-[0_0_8px_white]" />
          <div className="absolute w-20 h-1 bg-red-400 -rotate-45 shadow-[0_0_8px_red]" />
        </div>
      );
  }
}
