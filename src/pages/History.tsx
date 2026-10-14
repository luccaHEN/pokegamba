import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { LotteryHistorySession } from '../types/pokemon';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Trash2, Dices, Calendar, Share2, Check, Users, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatLotteryForDiscord, copyToClipboard } from '../utils/discord';
import { generateLotteryCardImage, copyImageBlobToClipboard, downloadImageBlob } from '../utils/cardGenerator';

export default function History() {
  const [history, setHistory] = useLocalStorage<LotteryHistorySession[]>('cobblemon-history', []);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [copiedImageSessionId, setCopiedImageSessionId] = useState<string | null>(null);
  const [generatingImageSessionId, setGeneratingImageSessionId] = useState<string | null>(null);

  const clearHistory = () => {
    setShowConfirm(true);
  };

  const confirmClear = () => {
    setHistory([]);
    setShowConfirm(false);
  };

  const handleCopyDiscord = async (session: any, pokemons: any[]) => {
    const text = formatLotteryForDiscord(pokemons, session.participants, session.filters);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedSessionId(session.id);
      setTimeout(() => setCopiedSessionId(null), 2500);
    }
  };

  const handleCopyImage = async (session: any, pokemons: any[]) => {
    if (generatingImageSessionId) return;
    setGeneratingImageSessionId(session.id);
    try {
      const blob = await generateLotteryCardImage(pokemons, session.participants);
      const copied = await copyImageBlobToClipboard(blob);
      if (!copied) {
        downloadImageBlob(blob, `sorteio-${session.id.slice(0, 8)}.png`);
      }
      setCopiedImageSessionId(session.id);
      setTimeout(() => setCopiedImageSessionId(null), 3000);
    } catch (err) {
      console.error('Falha ao gerar imagem:', err);
    } finally {
      setGeneratingImageSessionId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 18 }}
              className="bg-cobble-800 border-4 border-red-600 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-red-950/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-red-600/20 rounded-full flex items-center justify-center mb-3">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-red-400 mb-2 drop-shadow-md">
                  Atenção!
                </h3>
                <p className="text-cobble-200 text-sm md:text-base mb-6 font-medium">
                  Tem certeza que deseja apagar todo o histórico de sorteios? Esta ação não pode ser desfeita!
                </p>
                
                <div className="flex gap-3 w-full">
                  <Button 
                    onClick={() => setShowConfirm(false)} 
                    className="flex-1 text-sm md:text-base py-3 bg-cobble-700 hover:bg-cobble-600 text-white shadow-lg font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={confirmClear} 
                    className="flex-1 text-sm md:text-base py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg border-2 border-red-500 font-bold rounded-xl transition-all active:scale-95"
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
            const isOldFormat = !rawSession.pokemons && rawSession.pokemon;
            const pokemons = isOldFormat ? [rawSession.pokemon] : (rawSession.pokemons || []);
            const quantityReq = isOldFormat ? rawSession.quantity : rawSession.quantityRequested;
            
            if (pokemons.length === 0) return null;

            return (
            <div key={rawSession.id} className="bg-cobble-800 rounded-xl border border-cobble-700 p-6 flex flex-col gap-5 shadow-md hover:border-cobble-500 transition-colors">
              {/* Header: Date, Participants and Filters */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cobble-700 pb-4 gap-4">
                <div className="flex items-center text-cobble-200">
                  <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="font-bold">{new Date(rawSession.date).toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopyDiscord(rawSession, pokemons)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-[#8892f7] hover:text-white border border-[#5865F2]/50 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Copiar texto formatado em Markdown para o Discord"
                  >
                    {copiedSessionId === rawSession.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-300" /> Texto Copiado!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" /> Texto Discord
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyImage(rawSession, pokemons)}
                    disabled={generatingImageSessionId === rawSession.id}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Copiar imagem do card para o Discord (Ctrl+V) ou baixar"
                  >
                    {generatingImageSessionId === rawSession.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gerando...
                      </>
                    ) : copiedImageSessionId === rawSession.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-300" /> Imagem Copiada!
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" /> Card Imagem
                      </>
                    )}
                  </button>

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

              {/* Participants Bar if exists */}
              {rawSession.participants && rawSession.participants.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold bg-black/30 p-2.5 rounded-lg border border-cobble-700">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Users className="w-4 h-4" /> Treinadores:
                  </span>
                  {rawSession.participants.map((p: string, idx: number) => (
                    <span key={idx} className="bg-cobble-900 border border-yellow-500/30 px-2 py-0.5 rounded text-yellow-300">
                      #{idx + 1} {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Body: Drawn Pokemons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {pokemons.map((pokemon: any, idx: number) => {
                  const participantName = rawSession.participants?.[idx];
                  return (
                    <Link key={`${pokemon.id}-${idx}`} to={`/pokemon/${pokemon.id}`}>
                      <div className="bg-cobble-900 rounded-xl border border-cobble-700 p-3 flex flex-col items-center hover:bg-cobble-700 hover:border-blue-500 transition-all group relative">
                        {participantName && (
                          <span className="absolute top-1.5 left-1.5 right-1.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-[10px] font-black uppercase px-1 py-0.5 rounded text-center truncate">
                            👑 {participantName}
                          </span>
                        )}
                        <img 
                          src={pokemon.sprites.front_default || pokemon.sprites.other?.['official-artwork']?.front_default} 
                          alt={pokemon.name}
                          className={`w-16 h-16 object-contain group-hover:scale-110 transition-transform drop-shadow-md ${participantName ? 'mt-4' : ''}`}
                        />
                        <span className="text-xs font-bold text-cobble-400 mt-2">#{String(pokemon.id).padStart(4, '0')}</span>
                        <span className="text-sm font-bold capitalize text-white truncate w-full text-center">{pokemon.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
