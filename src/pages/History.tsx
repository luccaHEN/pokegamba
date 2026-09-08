import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { LotteryHistorySession } from '../types/pokemon';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Trash2, Dices, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function History() {
  const [history, setHistory] = useLocalStorage<LotteryHistorySession[]>('cobblemon-history', []);
  const [showConfirm, setShowConfirm] = useState(false);

  const clearHistory = () => {
    setShowConfirm(true);
  };

  const confirmClear = () => {
    setHistory([]);
    setShowConfirm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-cobble-800 border-4 border-red-600 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-red-400 mb-2 drop-shadow-md">
                  Atenção!
                </h3>
                <p className="text-cobble-200 text-lg mb-8 font-medium">
                  Tem certeza que deseja apagar todo o histórico de sorteios? Esta ação não pode ser desfeita!
                </p>
                
                <div className="flex gap-4 w-full">
                  <Button 
                    onClick={() => setShowConfirm(false)} 
                    className="flex-1 text-lg py-4 bg-cobble-700 hover:bg-cobble-600 text-white shadow-lg font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={confirmClear} 
                    className="flex-1 text-lg py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg border-2 border-red-500 font-bold rounded-xl transition-all active:scale-95"
                  >
                    Sim, apagar!
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center bg-cobble-800 p-6 rounded-xl border border-cobble-700">
        <div>
          <h1 className="text-3xl font-bold mb-2">Histórico</h1>
          <p className="text-cobble-300">Seus sorteios anteriores.</p>
        </div>
        {history.length > 0 && (
          <Button variant="danger" onClick={clearHistory}>
            <Trash2 className="w-5 h-5 mr-2" /> Limpar Histórico
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-cobble-800 rounded-xl border border-cobble-700">
          <Dices className="w-16 h-16 text-cobble-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cobble-300 mb-2">Nenhum sorteio realizado.</h2>
          <Link to="/sorteio">
            <Button className="mt-4">Ir para o Sorteio</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((rawSession: any) => {
            // Fix backwards compatibility with old history data structure in localStorage
            const isOldFormat = !rawSession.pokemons && rawSession.pokemon;
            const pokemons = isOldFormat ? [rawSession.pokemon] : (rawSession.pokemons || []);
            const quantityReq = isOldFormat ? rawSession.quantity : rawSession.quantityRequested;
            
            if (pokemons.length === 0) return null;

            return (
            <div key={rawSession.id} className="bg-cobble-800 rounded-xl border border-cobble-700 p-6 flex flex-col gap-6 shadow-md hover:border-cobble-500 transition-colors">
              {/* Header: Date and Filters */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cobble-700 pb-4 gap-4">
                <div className="flex items-center text-cobble-200">
                  <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="font-bold">{new Date(rawSession.date).toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cobble-900 border border-cobble-700 rounded-lg text-xs font-bold text-cobble-300">
                    Qtd: {pokemons.length}/{quantityReq || pokemons.length}
                  </span>
                  {rawSession.filters && rawSession.filters.length > 0 ? (
                    rawSession.filters.map((f: string) => (
                      <span key={f} className="px-3 py-1 bg-cobble-900 border border-cobble-700 rounded-lg text-xs font-bold text-cobble-300">
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 bg-cobble-900 border border-cobble-700 rounded-lg text-xs font-bold text-cobble-500">
                      Sem filtros
                    </span>
                  )}
                </div>
              </div>

              {/* Body: Drawn Pokemons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {pokemons.map((pokemon: any) => (
                  <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`}>
                    <div className="bg-cobble-900 rounded-xl border border-cobble-700 p-3 flex flex-col items-center hover:bg-cobble-700 hover:border-blue-500 transition-all group">
                      <img 
                        src={pokemon.sprites.front_default || pokemon.sprites.other['official-artwork'].front_default} 
                        alt={pokemon.name}
                        className="w-16 h-16 object-contain group-hover:scale-110 transition-transform drop-shadow-md"
                      />
                      <span className="text-xs font-bold text-cobble-400 mt-2">#{String(pokemon.id).padStart(4, '0')}</span>
                      <span className="text-sm font-bold capitalize text-white truncate w-full text-center">{pokemon.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
