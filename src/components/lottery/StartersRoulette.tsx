import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { StarterPokemonDef } from '../../utils/starters';
import { getStarterSpriteUrl } from '../../utils/starters';
import { cn } from '../../utils/cn';

interface StartersRouletteProps {
  isSpinning: boolean;
  winner: StarterPokemonDef | null;
  availableStarters: StarterPokemonDef[];
  onSpinComplete: () => void;
  className?: string;
}

const CARD_WIDTH = 140; // Card width in px
const CARD_GAP = 12;    // Gap between cards in px
const ITEM_TOTAL_WIDTH = CARD_WIDTH + CARD_GAP;

// CS:GO Case Opening exact parameters
const WINNER_INDEX = 32;       // 32 items before landing (authentic CS:GO strip length)
const SPIN_DURATION_SEC = 5.2; // 5.2 seconds (standard CS:GO case roll time)
const SPIN_DURATION_MS = 5200; // Milliseconds for timer synchronization
const CSGO_EASE = [0.12, 0.8, 0.25, 1] as const; // Famous CS:GO deceleration curve

const TYPE_BG = {
  grass: 'from-emerald-900/80 to-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-emerald-950/50',
  fire: 'from-orange-900/80 to-orange-950/90 border-orange-500/80 text-orange-300 shadow-orange-950/50',
  water: 'from-cyan-900/80 to-cyan-950/90 border-cyan-500/80 text-cyan-300 shadow-cyan-950/50',
};

const TYPE_EMOJIS = {
  grass: '🌿 Planta',
  fire: '🔥 Fogo',
  water: '💧 Água',
};

// Web audio synthesizer for realistic CS:GO case click sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch {}
}

function playVictoryChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (CS:GO award chime)
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.35);
    });
  } catch {}
}

export function StartersRoulette({
  isSpinning,
  winner,
  availableStarters,
  onSpinComplete,
  className,
}: StartersRouletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [targetTranslateX, setTargetTranslateX] = useState(0);
  const [hasLanded, setHasLanded] = useState(false);

  // Measure container width dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Build the roulette track when spinning with a winner
  const trackItems = useMemo(() => {
    if (!winner || availableStarters.length === 0) {
      return availableStarters.slice(0, 10);
    }

    const items: StarterPokemonDef[] = [];
    const pool = availableStarters;

    // Pre-winner items (32 cards for exact CS:GO reel length)
    for (let i = 0; i < WINNER_INDEX; i++) {
      items.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    // Insert winner card
    items.push(winner);

    // Trailing items past winner
    for (let i = 0; i < 8; i++) {
      items.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    return items;
  }, [isSpinning, winner]);

  // Compute translateX and trigger synchronized timers when spin begins
  useEffect(() => {
    if (isSpinning && winner) {
      setHasLanded(false);

      const center = containerWidth / 2;
      const winnerCenterOffset = WINNER_INDEX * ITEM_TOTAL_WIDTH + CARD_WIDTH / 2;
      // Slight jitter inside the card (-20px to +20px) like physical CS:GO wheel
      const randomJitter = (Math.random() - 0.5) * 40;
      const target = center - winnerCenterOffset + randomJitter;
      setTargetTranslateX(target);

      // Decelerating CS:GO click sounds
      const tickTimeouts: ReturnType<typeof setTimeout>[] = [];
      let elapsed = 0;
      let interval = 30; // Very fast at the start (CS:GO blur speed)

      while (elapsed < SPIN_DURATION_MS - 100) {
        const timeout = setTimeout(() => {
          playTickSound();
        }, elapsed);
        tickTimeouts.push(timeout);

        // Exponential deceleration matching CS:GO ease curve
        const progress = elapsed / SPIN_DURATION_MS;
        interval = 30 + Math.pow(progress, 3.2) * 480;
        elapsed += interval;
      }

      // Authoritative finish timer: ONLY fires when the full 5.2s spin completes!
      const finishTimeout = setTimeout(() => {
        setHasLanded(true);
        playVictoryChime();
        onSpinComplete();
      }, SPIN_DURATION_MS);

      return () => {
        tickTimeouts.forEach(clearTimeout);
        clearTimeout(finishTimeout);
      };
    } else {
      setTargetTranslateX(0);
      setHasLanded(false);
    }
  }, [isSpinning, winner, containerWidth]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[220px] bg-cobble-950 border-4 border-yellow-500/90 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(234,179,8,0.3)] flex flex-col justify-center select-none",
        className
      )}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/15 via-transparent to-black pointer-events-none" />

      {/* Center Target Needle: Top Golden Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-yellow-400 filter drop-shadow-[0_2px_8px_rgba(250,204,21,1)]" />
        <div className="w-0.5 h-full bg-yellow-400/70 shadow-[0_0_12px_rgba(250,204,21,1)]" />
      </div>

      {/* Center Target Needle: Bottom Golden Pointer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
        <div className="w-0.5 h-full bg-yellow-400/70 shadow-[0_0_12px_rgba(250,204,21,1)]" />
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[18px] border-b-yellow-400 filter drop-shadow-[0_-2px_8px_rgba(250,204,21,1)]" />
      </div>

      {/* Center Highlight Golden Laser Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] h-full bg-yellow-400/10 border-x-2 border-yellow-400/60 pointer-events-none z-20 backdrop-blur-[0.5px] shadow-[inset_0_0_15px_rgba(250,204,21,0.15)]" />

      {/* Side gradient shadows for depth */}
      <div className="absolute top-0 left-0 w-28 h-full bg-gradient-to-r from-cobble-950 via-cobble-950/80 to-transparent z-25 pointer-events-none" />
      <div className="absolute top-0 right-0 w-28 h-full bg-gradient-to-l from-cobble-950 via-cobble-950/80 to-transparent z-25 pointer-events-none" />

      {/* The Moving Track */}
      <div className="relative w-full h-[185px] flex items-center z-10 overflow-hidden">
        <motion.div
          animate={{ x: isSpinning ? targetTranslateX : 0 }}
          initial={{ x: 0 }}
          transition={
            isSpinning
              ? { duration: SPIN_DURATION_SEC, ease: CSGO_EASE }
              : { duration: 0.2 }
          }
          className="flex items-center gap-[12px]"
        >
          {trackItems.map((starter, i) => {
            const isWinnerCard = i === WINNER_INDEX;
            const typeStyle = TYPE_BG[starter.type];

            return (
              <div
                key={`${starter.id}-${i}`}
                style={{ width: `${CARD_WIDTH}px` }}
                className={cn(
                  "h-[175px] shrink-0 rounded-xl border-2 bg-gradient-to-b p-2 flex flex-col items-center justify-between shadow-xl relative transition-all duration-300",
                  typeStyle,
                  hasLanded && isWinnerCard && "ring-4 ring-yellow-400 shadow-[0_0_40px_rgba(250,204,21,1)] scale-[1.05] z-20"
                )}
              >
                {/* Winner Badge on Card when landed */}
                {hasLanded && isWinnerCard && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-cobble-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-xl whitespace-nowrap flex items-center gap-1 z-30 animate-pulse">
                    <span>👑</span> ESCOLHIDO
                  </div>
                )}

                {/* Header: ID & Type Tag */}
                <div className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-cobble-200">
                  <span className="bg-black/40 px-1.5 py-0.2 rounded border border-white/10">
                    #{String(starter.id).padStart(3, '0')}
                  </span>
                  <span className="text-[10px] font-bold">
                    {TYPE_EMOJIS[starter.type]}
                  </span>
                </div>

                {/* Big Crisp Sprite */}
                <div className="relative my-1 flex items-center justify-center">
                  <img
                    src={getStarterSpriteUrl(starter.id)}
                    alt={starter.name}
                    className="w-20 h-20 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transition-transform hover:scale-110"
                    draggable={false}
                  />
                </div>

                {/* Name & Generation */}
                <div className="w-full text-center">
                  <span className="text-sm font-black text-white block truncate tracking-wide drop-shadow-sm">
                    {starter.name}
                  </span>
                  <span className="text-[10px] text-yellow-300 block font-bold uppercase tracking-wider">
                    {starter.generationName}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-1.5 left-4 z-30 text-[11px] text-yellow-400 font-black flex items-center gap-1.5 drop-shadow-sm">
        <span>🎰</span> Roleta dos 27 Iniciais • {availableStarters.length} no pote
      </div>
    </div>
  );
}
