import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PokemonCard } from './PokemonCard';
import type { Pokemon } from '../../types/pokemon';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { getCapsuleColors } from '../lottery/Gachapon';
import { cn } from '../../utils/cn';

export function CardReveal({ pokemon, idx }: { pokemon: Pokemon; idx: number }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openTimer = setTimeout(() => setIsOpen(true), 800 + idx * 200);
    return () => {
      clearTimeout(openTimer);
    };
  }, [idx]);

  const colors = getCapsuleColors(pokemon);

  return (
    <div className="relative h-full flex flex-col items-center justify-center min-h-[350px]">
      
      <div className="absolute z-50 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0, y: 300, rotate: -720 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, delay: idx * 0.1 }}
          className="relative w-32 h-32 flex flex-col"
        >
          <motion.div 
            animate={isOpen ? { y: -50, opacity: 0, rotate: -20, scale: 1.2 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("w-32 h-16 rounded-t-full border-4 border-b-2 border-slate-800 shadow-[inset_-5px_5px_15px_rgba(255,255,255,0.4)] relative overflow-hidden", colors.top)}
          >
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-4 border-slate-800 rounded-full z-10"></div>
          </motion.div>

          <motion.div 
            animate={isOpen ? { y: 50, opacity: 0, rotate: 20, scale: 1.2 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("w-32 h-16 rounded-b-full border-4 border-t-2 border-slate-800 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2)] relative overflow-hidden", colors.bottom)}
          >
            <div className="absolute top-[-22px] left-1/2 -translate-x-1/2 w-8 h-8 bg-transparent border-4 border-slate-800 rounded-full z-10"></div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.1, y: 20, filter: 'brightness(2) blur(10px)' }}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0, filter: 'brightness(1) blur(0px)' } : { opacity: 0, scale: 0.1, y: 20, filter: 'brightness(2) blur(10px)' }}
        transition={{ type: 'spring', damping: 12, delay: 0.15 }}
        className="w-full h-full flex flex-col relative z-40"
      >
        <div className="flex-1">
          <PokemonCard pokemon={pokemon} />
        </div>
      </motion.div>
    </div>
  );
}
