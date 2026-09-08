import { useState } from 'react';
import { Dices, Filter, Settings2, Sparkles, RefreshCw, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { drawPokemon } from '../utils/lottery';
import type { LotteryFilters } from '../utils/lottery';
import type { Pokemon, LotteryHistorySession } from '../types/pokemon';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cn } from '../utils/cn';

const TYPES = ['all', 'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
const GENS = [
  { id: 0, name: 'Todas' },
  { id: 1, name: 'Geração 1' },
  { id: 2, name: 'Geração 2' },
  { id: 3, name: 'Geração 3' },
  { id: 4, name: 'Geração 4' },
  { id: 5, name: 'Geração 5' },
  { id: 6, name: 'Geração 6' },
  { id: 7, name: 'Geração 7' },
  { id: 8, name: 'Geração 8' },
  { id: 9, name: 'Geração 9' },
];

import { Gachapon } from '../components/lottery/Gachapon';

import { CardReveal } from '../components/pokemon/CardReveal';

export default function Lottery() {
  const [history, setHistory] = useLocalStorage<LotteryHistorySession[]>('cobblemon-history', []);

  const [quantity, setQuantity] = useLocalStorage('cobblemon-lottery-quantity', 1);
  const [filters, setFilters] = useLocalStorage<LotteryFilters>('cobblemon-lottery-filters', { 
    type1: 'all', 
    type2: 'all', 
    generation: 0,
    allowLegendary: true,
    allowMythical: true
  });
  const [results, setResults] = useLocalStorage<Pokemon[]>('cobblemon-lottery-results', []);

  const [isDrawing, setIsDrawing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [drawingQueue, setDrawingQueue] = useState<Pokemon[]>([]);

  const resetFilters = () => {
    setQuantity(1);
    setFilters({
      type1: 'all',
      type2: 'all',
      generation: 0,
      allowLegendary: true,
      allowMythical: true,
      rarity: 'all',
      evolution: 'all'
    });
  };

  const updateFilter = (key: keyof LotteryFilters, value: any) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      
      // Smart Rules
      // 1. Legendaries and Mythicals rarely evolve. Lock evolution to 'all'.
      if (key === 'rarity' && ['legendary', 'mythical'].includes(value)) {
        next.evolution = 'all';
      }
      
      // 2. Prevent same type in both slots
      if (key === 'type1' && value !== 'all' && next.type2 === value) {
        next.type2 = 'all';
      }
      if (key === 'type2' && value !== 'all' && value !== 'none' && next.type1 === value) {
        next.type1 = 'all';
      }

      return next;
    });
  };

  const handleDraw = async (overrideQty?: number, overrideFilters?: LotteryFilters) => {
    setIsDrawing(true);
    setResults([]);
    setErrorMsg(null);
    
    const activeQty = overrideQty || quantity;
    const activeFilters = overrideFilters || filters;
    
    try {
      const drawnPokemon: Pokemon[] = [];
      const drawnIds: number[] = [];
      
      const allowLegendary = activeFilters.allowLegendary ?? true;
      const allowMythical = activeFilters.allowMythical ?? true;

      for (let i = 0; i < activeQty; i++) {
        try {
          const p = await drawPokemon(activeFilters, allowLegendary, allowMythical, drawnIds);
          drawnPokemon.push(p);
          drawnIds.push(p.id);
        } catch (e) {
          console.warn("Não foi possível sortear mais Pokémon para os filtros atuais.");
          break; // Stop trying to draw more, but keep what we have
        }
      }

      if (drawnPokemon.length === 0) {
        throw new Error("A máquina procurou por todo lado, mas nenhum Pokémon existe com essa combinação exata de filtros!");
      }
      
      setDrawingQueue(drawnPokemon);
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      setResults(drawnPokemon);
      
      const newHistorySession = {
        id: crypto.randomUUID(),
        pokemons: drawnPokemon,
        date: new Date().toISOString(),
        quantityRequested: activeQty,
        filters: [
          activeFilters.type1 !== 'all' ? `Tipo 1: ${activeFilters.type1}` : '',
          activeFilters.type2 !== 'all' ? (activeFilters.type2 === 'none' ? 'Tipo 2: Nenhum' : `Tipo 2: ${activeFilters.type2}`) : '',
          activeFilters.generation ? `Gen: ${activeFilters.generation}` : '',
          activeFilters.rarity && activeFilters.rarity !== 'all' ? `Raridade: ${activeFilters.rarity}` : '',
          activeFilters.evolution && activeFilters.evolution !== 'all' ? `Evolução: ${activeFilters.evolution}` : ''
        ].filter(Boolean)
      };
      
      setHistory([newHistorySession, ...history]);
      
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Erro ao realizar o sorteio. Combinação de filtros muito restrita ou impossível!');
    } finally {
      setIsDrawing(false);
      setDrawingQueue([]);
    }
  };

  const handleRandomDraw = () => {
    const qty = Math.floor(Math.random() * 6) + 1;
    const t1 = Math.random() > 0.5 ? 'all' : TYPES[Math.floor(Math.random() * TYPES.length)];
    const t2 = Math.random() > 0.5 ? 'all' : TYPES[Math.floor(Math.random() * TYPES.length)];
    const rarities = ['all', 'all', 'normal', 'legendary', 'mythical'] as const;
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const evos = ['all', 'base', 'evolved'] as const;
    
    const randomFilters: LotteryFilters = {
      type1: t1,
      type2: t2 === t1 ? 'all' : t2,
      generation: Math.random() > 0.7 ? 0 : GENS[Math.floor(Math.random() * (GENS.length - 1)) + 1].id,
      rarity,
      evolution: (rarity === 'legendary' || rarity === 'mythical') ? 'all' : evos[Math.floor(Math.random() * evos.length)],
      allowLegendary: true,
      allowMythical: true
    };

    setQuantity(qty);
    setFilters(randomFilters);
    handleDraw(qty, randomFilters);
  };

  const isEvolutionDisabled = ['legendary', 'mythical'].includes(filters.rarity || 'all');

  const viewHistoryResults = (historicalPokemons: Pokemon[]) => {
    setResults(historicalPokemons);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-300 relative" style={{ zoom: 0.9 }}>
      <AnimatePresence>
        {errorMsg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" style={{ zoom: 1.11 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-cobble-800 border-4 border-red-600 rounded-none p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-black text-red-400 mb-2 drop-shadow-md">
                  Ops! Algo deu errado
                </h3>
                <p className="text-cobble-200 text-lg mb-8 font-medium">
                  {errorMsg}
                </p>
                <Button 
                  onClick={() => setErrorMsg(null)} 
                  variant="danger"
                  className="w-full text-lg py-4 shadow-lg transition-all"
                >
                  Tentar Outra Combinação
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: Filters */}
        <div className="xl:col-span-3 bg-cobble-800 border-4 border-cobble-700 p-4 shadow-xl flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4 border-b-4 border-cobble-700 pb-2">
            <h2 className="text-xl font-black text-white flex items-center">
              <Settings2 className="w-5 h-5 mr-2 text-blue-400" /> Configurar Sorteio
            </h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="bg-black/30 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-slate-200 mb-2 flex items-center tracking-widest"><Dices className="w-4 h-4 mr-2 text-slate-400" /> Quantidade</h3>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white outline-none font-bold shadow-inner cursor-pointer appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Pokémon{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="bg-black/30 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-slate-200 mb-2 flex items-center tracking-widest"><Filter className="w-4 h-4 mr-2 text-slate-400" /> Tipo 1</h3>
              <select
                value={filters.type1}
                onChange={(e) => updateFilter('type1', e.target.value)}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white outline-none capitalize font-bold shadow-inner cursor-pointer appearance-none"
              >
                {TYPES.map(t => (
                  <option key={t} value={t} disabled={t !== 'all' && filters.type2 === t}>{t === 'all' ? 'Qualquer' : t}</option>
                ))}
              </select>
            </div>

            <div className="bg-black/30 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-slate-200 mb-2 flex items-center tracking-widest"><Filter className="w-4 h-4 mr-2 text-slate-400" /> Tipo 2</h3>
              <select
                value={filters.type2}
                onChange={(e) => updateFilter('type2', e.target.value)}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white outline-none capitalize font-bold shadow-inner cursor-pointer appearance-none"
              >
                <option value="all">Qualquer</option>
                <option value="none" className="text-red-400 font-bold">Nenhum (Único)</option>
                {TYPES.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t} disabled={filters.type1 === t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="bg-black/30 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-slate-200 mb-2 flex items-center tracking-widest"><Filter className="w-4 h-4 mr-2 text-slate-400" /> Geração</h3>
              <select
                value={filters.generation}
                onChange={(e) => updateFilter('generation', parseInt(e.target.value))}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white outline-none font-bold shadow-inner cursor-pointer appearance-none"
              >
                {GENS.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-black/30 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-slate-200 mb-2 flex items-center tracking-widest"><Sparkles className="w-4 h-4 mr-2 text-purple-500/50" /> Raridade</h3>
              <select
                value={filters.rarity || 'all'}
                onChange={(e) => updateFilter('rarity', e.target.value)}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white outline-none font-bold shadow-inner cursor-pointer appearance-none"
              >
                <option value="all">Misto</option>
                <option value="normal">Comuns</option>
                <option value="legendary" className="text-purple-400 font-bold">Lendários</option>
                <option value="mythical" className="text-pink-400 font-bold">Míticos</option>
              </select>
            </div>

            <div className={cn("bg-black/30 p-3 border-2", isEvolutionDisabled ? "border-cobble-800 opacity-60" : "border-cobble-700")}>
              <h3 className="font-bold text-xs text-slate-200 mb-2 flex items-center tracking-widest">
                <Sparkles className={cn("w-4 h-4 mr-2", isEvolutionDisabled ? "text-cobble-600" : "text-green-500/50")} /> Evolução
              </h3>
              <select
                value={filters.evolution || 'all'}
                onChange={(e) => updateFilter('evolution', e.target.value)}
                disabled={isEvolutionDisabled}
                className={cn("w-full bg-cobble-800 border-2 p-2 text-white outline-none font-bold shadow-inner appearance-none",
                  isEvolutionDisabled ? "border-cobble-800 cursor-not-allowed text-slate-400" : "border-cobble-700 cursor-pointer"
                )}
              >
                <option value="all">{isEvolutionDisabled ? 'Lendários ñ evoluem' : 'Qualquer'}</option>
                {!isEvolutionDisabled && <option value="base" className="text-green-400 font-bold">Base</option>}
                {!isEvolutionDisabled && <option value="evolved" className="text-blue-400 font-bold">Evoluídos</option>}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-4 border-cobble-700 flex flex-col gap-2">
            <Button onClick={handleRandomDraw} className="w-full !bg-purple-600 hover:!bg-purple-500 text-white !border-purple-800" size="sm">
              <Dices className="w-4 h-4 mr-2"/> Filtros Aleatórios
            </Button>
            <Button onClick={resetFilters} variant="secondary" className="w-full text-xs" size="sm">
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* CENTER COLUMN: Gachapon Machine */}
        <div className="xl:col-span-6 flex flex-col items-center justify-start bg-cobble-800 border-4 border-cobble-700 p-8 shadow-inner relative min-h-[500px]">
          <h2 className="text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-md mb-2 text-center" style={{ WebkitTextStroke: '1px #423223' }}>
            Poké Gamba
          </h2>
          <p className="text-slate-200 font-bold tracking-widest mb-4">SORTEIO DE COBBLEMON</p>
          
          <Gachapon isDrawing={isDrawing} queue={drawingQueue} />

          <div className="mt-auto w-full max-w-sm pt-8">
            <Button 
                onClick={() => handleDraw()} 
                disabled={isDrawing}
                size="lg"
                className="w-full py-6 text-3xl font-black shadow-xl"
              >
                {isDrawing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-3"
                  >
                    <Dices className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <Dices className="mr-3 w-8 h-8" />
                )}
                {isDrawing ? 'Sorteando' : 'GIRAR!'}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Feed / History */}
        <div className="xl:col-span-3 bg-cobble-800 border-4 border-cobble-700 p-4 shadow-xl flex flex-col h-fit max-h-[700px]">
          <h2 className="text-xl font-black text-white mb-4 border-b-4 border-cobble-700 pb-2 flex items-center">
            <HistoryIcon className="w-5 h-5 mr-2 text-yellow-400" /> Últimos Ganhadores
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
             {history.slice(0, 15).map(h => (
                <div 
                  key={h.id} 
                  onClick={() => viewHistoryResults(h.pokemons)}
                  className="bg-cobble-900 border-2 border-cobble-700 p-2 hover:border-cobble-500 hover:bg-cobble-800 transition-colors cursor-pointer group"
                  title="Clique para ver este resultado!"
                >
                   <div className="text-slate-200 group-hover:text-yellow-400 text-xs mb-2 font-bold tracking-wider transition-colors">
                     Sorteio às {new Date(h.date).toLocaleTimeString()}
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {h.pokemons.map(p => (
                        <div key={p.id} className="relative">
                          <img 
                            src={p.sprites.front_default} 
                            className="w-12 h-12 bg-cobble-800 border-2 border-cobble-700 object-contain p-1" 
                            alt={p.name} 
                          />
                        </div>
                     ))}
                   </div>
                </div>
             ))}
             {history.length === 0 && (
               <div className="text-slate-200 text-center mt-10 font-bold">Nenhum sorteio ainda.</div>
             )}
          </div>
        </div>
      </div>

      {/* RESULTS MODAL OVERLAY */}
      <AnimatePresence>
        {!isDrawing && results.length > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" style={{ zoom: 1.11 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-cobble-900/95 backdrop-blur-md border-[8px] border-cobble-700 p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-[1200px] max-h-[95vh] overflow-y-auto custom-scrollbar relative rounded-xl"
              style={{ zoom: 0.9 }}
            >
              
              <div className={cn(
                "grid gap-8 justify-center mx-auto",
                results.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl"
              )}>
                {results.map((p, idx) => (
                  <div key={`${p.id}-${idx}`} className="transform transition-transform hover:scale-105">
                    <CardReveal pokemon={p} idx={idx} />
                  </div>
                ))}
              </div>

              <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6">
                <Button 
                  onClick={() => { setResults([]); }} 
                  size="lg" 
                  variant="secondary"
                  className="font-bold border-[4px] text-xl py-6 px-10 hover:bg-cobble-600"
                >
                  <Settings2 className="w-6 h-6 mr-3" /> Fechar Resultados
                </Button>
                <Button 
                  onClick={() => { setResults([]); handleDraw(); }} 
                  size="lg" 
                  className="font-bold border-[4px] !bg-blue-600 hover:!bg-blue-500 !border-blue-800 text-xl py-6 px-10"
                >
                  <RefreshCw className="w-6 h-6 mr-3" /> Girar de Novo
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
