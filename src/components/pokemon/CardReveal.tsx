import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PokemonCard } from './PokemonCard';
import type { Pokemon } from '../../types/pokemon';
import { getCapsuleColors } from '../lottery/Gachapon';
import { cn } from '../../utils/cn';

interface CardRevealProps {
  pokemon: Pokemon;
  idx: number;
  compact?: boolean;
  participant?: string;
  availableParticipants?: string[];
  onSelectParticipant?: (newOwner: string) => void;
}

export function CardReveal({
  pokemon,
  idx,
  compact = false,
  participant,
  availableParticipants = [],
  onSelectParticipant
}: CardRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openTimer = setTimeout(() => setIsOpen(true), 800 + idx * 200);
    return () => {
      clearTimeout(openTimer);
    };
  }, [idx]);

  const colors = getCapsuleColors(pokemon);

  return (
    <div className={cn("relative h-full flex flex-col items-center justify-center", compact ? "min-h-[210px]" : "min-h-[290px]")}>
      
      <div className="absolute z-50 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0, y: 300, rotate: -720 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, delay: idx * 0.1 }}
          className={cn("relative flex flex-col", compact ? "w-20 h-20" : "w-32 h-32")}
        >
          <motion.div 
            animate={isOpen ? { y: compact ? -30 : -50, opacity: 0, rotate: -20, scale: 1.2 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("rounded-t-full border-4 border-b-2 border-slate-800 shadow-[inset_-5px_5px_15px_rgba(255,255,255,0.4)] relative overflow-hidden", compact ? "w-20 h-10" : "w-32 h-16", colors.top)}
          >
            <div className={cn("absolute bottom-[-6px] left-1/2 -translate-x-1/2 bg-white border-2 border-slate-800 rounded-full z-10", compact ? "w-5 h-5" : "w-8 h-8")} />
          </motion.div>

          <motion.div 
            animate={isOpen ? { y: compact ? 30 : 50, opacity: 0, rotate: 20, scale: 1.2 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("rounded-b-full border-4 border-t-2 border-slate-800 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2)] relative overflow-hidden", compact ? "w-20 h-10" : "w-32 h-16", colors.bottom)}
          >
            <div className={cn("absolute top-[-14px] left-1/2 -translate-x-1/2 bg-transparent border-2 border-slate-800 rounded-full z-10", compact ? "w-5 h-5" : "w-8 h-8")} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.2, y: 20, filter: 'brightness(1.8)' }}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0, filter: 'brightness(1)' } : { opacity: 0, scale: 0.2, y: 20, filter: 'brightness(1.8)' }}
        transition={{ type: 'spring', damping: 12, delay: 0.15 }}
        className="w-full h-full flex flex-col relative z-40 items-center"
      >
        {/* Interactive Trainer Selector or Display */}
        {onSelectParticipant && availableParticipants.length > 0 ? (
          <div className={cn("flex items-center gap-1.5 w-full justify-center", compact ? "mb-1" : "mb-2")}>
            <div className={cn("bg-cobble-900 border-2 border-yellow-500/80 flex items-center gap-1 shadow-md max-w-full", compact ? "px-1.5 py-0.5" : "px-2 py-1")}>
              <span className={cn("text-yellow-400", compact ? "text-[10px]" : "text-xs")}>👑</span>
              <select
                value={participant || ''}
                onChange={(e) => onSelectParticipant(e.target.value)}
                className={cn("bg-transparent text-yellow-300 font-black outline-none cursor-pointer uppercase tracking-wider truncate", compact ? "text-[10px]" : "text-xs")}
                title="Trocar ou definir o treinador deste Pokémon"
              >
                <option value="" className="bg-cobble-900 text-slate-300">Sem Dono</option>
                {availableParticipants.map(name => (
                  <option key={name} value={name} className="bg-cobble-900 text-yellow-400 font-bold">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : participant ? (
          <div className={cn("bg-yellow-500/20 border-2 border-yellow-500 text-yellow-300 font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md", compact ? "mb-1 px-2 py-0.5 text-[10px]" : "mb-2 px-3 py-1 text-xs")}>
            <span>👑</span> Treinador: {participant}
          </div>
        ) : null}

        <div className="flex-1 w-full">
          <PokemonCard pokemon={pokemon} compact={compact} />
        </div>
      </motion.div>
    </div>
  );
}
