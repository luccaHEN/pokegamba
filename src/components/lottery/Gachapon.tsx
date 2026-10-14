import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useEffect, useState } from 'react';
import type { Pokemon } from '../../types/pokemon';
import { LEGENDARY_IDS, MYTHICAL_IDS } from '../../utils/lottery';

export function getCapsuleColors(pokemon: Pokemon) {
  if (MYTHICAL_IDS.includes(pokemon.id)) {
    return {
      top: 'bg-gradient-to-t from-red-600 to-red-500',
      bottom: 'bg-gradient-to-b from-red-600 to-red-500',
      drop: 'bg-gradient-to-b from-red-600 to-red-600'
    };
  }
  if (LEGENDARY_IDS.includes(pokemon.id)) {
    return {
      top: 'bg-gradient-to-t from-purple-700 to-purple-500',
      bottom: 'bg-gradient-to-b from-slate-200 to-white',
      drop: 'bg-gradient-to-b from-purple-600 to-white'
    };
  }
  return {
    top: 'bg-gradient-to-t from-red-600 to-red-400',
    bottom: 'bg-gradient-to-b from-slate-200 to-white',
    drop: 'bg-gradient-to-b from-red-500 to-white'
  };
}

export function Gachapon({ isDrawing, queue = [] }: { isDrawing: boolean, queue?: Pokemon[] }) {
  const [capsules, setCapsules] = useState<{ id: number; color: string; left: string; delay: number }[]>([]);

  useEffect(() => {
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-pink-400', 'bg-purple-400'];
    const newCapsules = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${15 + Math.random() * 70}%`,
      delay: Math.random() * 0.5,
    }));
    setCapsules(newCapsules);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      <div className="relative w-64 flex flex-col items-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]">
        
        <div className="w-56 h-56 rounded-t-full bg-gradient-to-tr from-sky-400/20 via-sky-200/25 to-white/40 border-8 border-b-0 border-slate-300 relative overflow-hidden z-10 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.3),inset_10px_10px_20px_rgba(255,255,255,0.6)]">
          <div className="absolute top-4 right-6 w-20 h-10 bg-gradient-to-b from-white/70 to-transparent rounded-full rotate-[-35deg] pointer-events-none"></div>

          {capsules.map((cap) => (
            <motion.div
              key={cap.id}
              className={cn('absolute bottom-0 w-10 h-10 rounded-full border border-black/20 shadow-[inset_-4px_-4px_6px_rgba(0,0,0,0.6),inset_3px_3px_6px_rgba(255,255,255,0.8)]', cap.color)}
              style={{ left: cap.left }}
              animate={
                isDrawing
                  ? {
                      y: [0, -Math.random() * 90 - 30, 0],
                      x: [0, (Math.random() - 0.5) * 50, 0],
                      rotate: [0, 180, 360],
                    }
                  : { y: 0, x: 0 }
              }
              transition={
                isDrawing
                  ? { duration: 0.3 + Math.random() * 0.4, repeat: Infinity, delay: cap.delay }
                  : { duration: 0 }
              }
            >
              <div className="w-full h-[1px] bg-black/30 absolute top-1/2 -translate-y-1/2"></div>
            </motion.div>
          ))}
        </div>

        <div className="w-64 h-56 bg-[radial-gradient(ellipse_at_top,#ef4444,#b91c1c,#7f1d1d)] rounded-b-3xl border-8 border-t-8 border-slate-300 relative z-20 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),inset_10px_10px_20px_rgba(255,255,255,0.3)]">
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full border-4 border-slate-500 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.5),0_5px_10px_rgba(0,0,0,0.4)]">
            <motion.div 
              className="w-16 h-4 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full shadow-lg"
              animate={isDrawing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute top-2 right-3 w-2 h-6 bg-slate-900 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"></div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-slate-700 to-slate-900 rounded-xl border-t-4 border-slate-900 overflow-hidden flex items-end justify-center shadow-[inset_0_10px_10px_rgba(0,0,0,0.8)]">
            <div className="w-20 h-10 bg-black rounded-t-full absolute bottom-0 shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>

            <AnimatePresence>
              {isDrawing && queue.length > 0 && (
                <div className="absolute bottom-0 flex justify-center w-full gap-1">
                  {queue.slice(0, 3).map((p, i) => {
                    const colors = getCapsuleColors(p);
                    const isLegendary = LEGENDARY_IDS.includes(p.id);
                    return (
                    <motion.div
                      key={`${p.id}-${i}`}
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: [ -100, 0, -10, 0 ], opacity: 1 }}
                      transition={{ 
                        delay: 1.5 + (i * 0.3),
                        duration: 0.5,
                        times: [0, 0.7, 0.85, 1] 
                      }}
                      className={cn("w-8 h-8 rounded-full shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.5),inset_3px_3px_6px_rgba(255,255,255,0.8),0_5px_10px_rgba(0,0,0,0.8)] z-30 relative overflow-hidden", colors.drop)}
                    >
                      <div className="absolute w-full h-[2px] bg-slate-800 top-1/2 -translate-y-1/2"></div>
                      <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-400 shadow-sm flex items-center justify-center">
                        {isLegendary && <span className="text-[4px] font-black text-purple-700 -mt-[1px]">M</span>}
                      </div>
                    </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {isDrawing && (
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-2xl font-black text-yellow-400 drop-shadow-md animate-pulse"
        >
          {queue.length > 0 ? "A máquina está liberando as cápsulas!" : "Girando a manivela..."}
        </motion.h2>
      )}
    </div>
  );
}
