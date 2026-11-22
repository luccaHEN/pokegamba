import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { StarterPokemonDef } from '../../utils/starters';
import { getStarterSpriteUrl } from '../../utils/starters';
import { Sparkles, HelpCircle, XCircle, ArrowRight } from 'lucide-react';
import { ConfettiOverlay } from './ConfettiOverlay';
import { cn } from '../../utils/cn';

interface StarterShinyDrawProps {
  starter: StarterPokemonDef;
  trainer: string;
  onComplete: (isShiny: boolean) => void;
  className?: string;
}

// Synthesizer sounds for card flip, shiny win and miss
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

function playCardFlipSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

function playShinyFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    // Sparkling arpeggio + fanfare
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i >= 4 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.45);
    });
  } catch {}
}

function playMissSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

export function StarterShinyDraw({
  starter,
  trainer,
  onComplete,
  className
}: StarterShinyDrawProps) {
  // Exactly 1 winning card index out of 8 (0..7)
  const winningCardIndex = useMemo(() => Math.floor(Math.random() * 8), []);

  const [pickedCardIndex, setPickedCardIndex] = useState<number | null>(null);
  const [revealAll, setRevealAll] = useState(false);
  const [isShinyWon, setIsShinyWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasTriggeredRef = useRef(false);

  const normalSprite = getStarterSpriteUrl(starter.id, false);
  const shinySprite = getStarterSpriteUrl(starter.id, true);

  const handleCardClick = (index: number) => {
    if (pickedCardIndex !== null) return; // Already picked

    playCardFlipSound();
    setPickedCardIndex(index);

    const won = index === winningCardIndex;
    setIsShinyWon(won);

    if (won) {
      setShowConfetti(true);
      setTimeout(() => {
        playShinyFanfare();
      }, 150);
      // Reveal the rest gently after a small moment
      setTimeout(() => {
        setRevealAll(true);
      }, 700);
    } else {
      setTimeout(() => {
        playMissSound();
      }, 150);
      // Reveal the rest so user sees where the shiny card was
      setTimeout(() => {
        setRevealAll(true);
      }, 650);
    }
  };

  const handleProceed = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    onComplete(isShinyWon);
  };

  return (
    <div className={cn("flex flex-col items-center w-full max-w-4xl mx-auto select-none", className)}>
      <ConfettiOverlay active={showConfetti} />

      {/* Header Banner */}
      <div className="text-center mb-4">


        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide drop-shadow">
          {pickedCardIndex === null ? (
            <>Escolha 1 das 8 cartas para <span className="text-yellow-400">{trainer}</span></>
          ) : isShinyWon ? (
            <span className="text-yellow-300 animate-pulse flex items-center justify-center gap-2">
              ✨ PARABÉNS! VOCÊ TIROU ELE SHINY! ✨
            </span>
          ) : (
            <span className="text-cobble-200">
              Não foi dessa vez! Seu <span className="text-white font-black">{starter.name}</span> é normal.
            </span>
          )}
        </h2>

        <p className="text-xs sm:text-sm text-cobble-300 mt-1 max-w-lg mx-auto">
          {pickedCardIndex === null ? (
            <><strong>1 carta</strong> guarda a versão <strong>Shiny</strong> ✨ (12.5% de chance). As outras 7 são normais.</>
          ) : isShinyWon ? (
            <>Você encontrou a carta dourada premiada! O inicial brilhou com cores raras!</>
          ) : (
            <>A carta Shiny estava na posição <strong>#{winningCardIndex + 1}</strong>.</>
          )}
        </p>
      </div>

      {/* 8 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 w-full p-2">
        {Array.from({ length: 8 }).map((_, index) => {
          const isThisCardWinning = index === winningCardIndex;
          const isPicked = pickedCardIndex === index;
          const isFlipped = isPicked || revealAll;

          return (
            <motion.div
              key={index}
              whileHover={pickedCardIndex === null ? { scale: 1.05, y: -4 } : {}}
              whileTap={pickedCardIndex === null ? { scale: 0.96 } : {}}
              onClick={() => handleCardClick(index)}
              className={cn(
                "relative h-36 sm:h-44 md:h-52 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-xl perspective-1000",
                pickedCardIndex === null && "hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] border-cobble-700 bg-gradient-to-b from-cobble-800 via-cobble-900 to-cobble-950",
                isFlipped && isThisCardWinning && "border-yellow-400 bg-gradient-to-b from-yellow-950/80 via-amber-900/60 to-cobble-950 shadow-[0_0_35px_rgba(250,204,21,0.8)] ring-2 ring-yellow-300",
                isFlipped && !isThisCardWinning && "border-cobble-800 bg-gradient-to-b from-cobble-900/90 to-cobble-950 opacity-65",
                isPicked && !isThisCardWinning && "border-red-500/80 ring-2 ring-red-500/40 opacity-90",
                pickedCardIndex !== null && "cursor-default"
              )}
            >
              {/* Back Face (Not Flipped) */}
              {!isFlipped && (
                <div className="flex flex-col items-center justify-between p-2.5 text-center h-full w-full relative">
                  <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-cobble-400">
                    <span className="text-yellow-400">#{index + 1}</span>
                  </div>

                  {/* Glowing mystery core */}
                  <div className="relative my-auto">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shadow-[inset_0_0_12px_rgba(234,179,8,0.2)]">
                      <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="w-full text-center">
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-cobble-300 block">
                      Carta #{index + 1}
                    </span>
                    <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-wider block mt-0.5">
                      Abrir
                    </span>
                  </div>
                </div>
              )}

              {/* Front Face (Flipped - Winning / Shiny) */}
              {isFlipped && isThisCardWinning && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="flex flex-col items-center justify-between p-2 h-full w-full relative z-10"
                >
                  {/* Top Badge */}
                  <div className="bg-yellow-400 text-cobble-950 font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-cobble-950 fill-cobble-950" />
                    <span>SHINY!</span>
                  </div>

                  {/* Shiny Sprite with sparkling radial background */}
                  <div className="relative my-0.5 flex items-center justify-center">
                    <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-400/25 blur-md animate-pulse" />
                    <img
                      src={shinySprite}
                      alt={`${starter.name} Shiny`}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain filter drop-shadow-[0_4px_10px_rgba(250,204,21,0.6)] relative z-10"
                      draggable={false}
                    />
                  </div>

                  {/* Bottom indicator */}
                  <div className="text-center w-full">
                    <div className="w-full h-[3px] bg-yellow-400 rounded-full mb-1 shadow-[0_0_8px_#facc15]" />
                    <span className="text-[10px] sm:text-xs font-black text-yellow-300 block truncate">
                      {isPicked ? '👑 VOCÊ ACHOU!' : 'Estava aqui!'}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-yellow-400/80 font-mono">
                      Carta #{index + 1}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Front Face (Flipped - Normal / Miss) */}
              {isFlipped && !isThisCardWinning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-between p-2 h-full w-full relative"
                >
                  {/* Top Badge */}
                  <div className={cn(
                    "font-bold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 uppercase tracking-wide",
                    isPicked ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-black/50 text-cobble-400 border border-cobble-700"
                  )}>
                    {isPicked ? (
                      <>
                        <XCircle className="w-2.5 h-2.5 text-red-400" />
                        <span>Sua Escolha</span>
                      </>
                    ) : (
                      <span>Normal</span>
                    )}
                  </div>

                  {/* Normal Sprite */}
                  <div className="relative my-0.5 flex items-center justify-center opacity-70">
                    <img
                      src={normalSprite}
                      alt={starter.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 object-contain filter grayscale-[30%] drop-shadow"
                      draggable={false}
                    />
                  </div>

                  {/* Bottom indicator */}
                  <div className="text-center w-full">
                    <div className="w-full h-[2px] bg-cobble-700 rounded-full mb-1" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-cobble-400 block truncate">
                      {isPicked ? 'Não foi dessa vez 💨' : 'Versão Normal'}
                    </span>
                    <span className="text-[8px] text-cobble-500 font-mono">
                      #{index + 1}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Action / Continue Button */}
      <div className="mt-5 flex flex-col items-center justify-center w-full">
        {pickedCardIndex === null ? (
          <div className="text-xs sm:text-sm text-yellow-400/90 font-bold bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner">
            <span className="animate-bounce">👉</span>
            <span>Clique em uma das 8 cartas para tentar a sorte de tirar Shiny!</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          >
            <button
              onClick={handleProceed}
              className={cn(
                "w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm tracking-wide shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer",
                isShinyWon
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 shadow-[0_0_25px_rgba(250,204,21,0.6)] active:scale-95"
                  : "bg-cobble-700 hover:bg-cobble-600 text-white border border-cobble-500 active:scale-95"
              )}
            >
              <span>{isShinyWon ? 'Receber Inicial Shiny!' : 'Ver Resultado Final'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
