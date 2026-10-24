import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Crown, Sparkles, Share2, Check, RefreshCw, 
  ArrowRight, Shuffle, AlertCircle, Trophy 
} from 'lucide-react';
import { TrainerWheel } from './TrainerWheel';
import { ConfettiOverlay } from './ConfettiOverlay';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { formatDraftOrderForDiscord, copyToClipboard } from '../../utils/discord';
import { STARTER_POKEMON_DEFS } from '../../utils/starters';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface TrainerWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: string[];
  onUpdateParticipants: (newParticipants: string[]) => void;
  draftOrder: string[];
  onUpdateDraftOrder: (newOrder: string[]) => void;
  claimedStarters: Record<number, string>;
  onSelectTrainerForStarterDraw: (trainerName: string) => void;
}

export function TrainerWheelModal({
  isOpen,
  onClose,
  participants,
  onUpdateParticipants,
  draftOrder,
  onUpdateDraftOrder,
  claimedStarters,
  onSelectTrainerForStarterDraw,
}: TrainerWheelModalProps) {
  // Sound preferences persisted in localStorage
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('cobblemon-wheel-sound', true);

  // Active pool of trainers currently on the wheel (trainers not yet in draftOrder)
  const [excludedFromWheel, setExcludedFromWheel] = useState<string[]>([]);
  const [newTrainerInput, setNewTrainerInput] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastDrawnWinner, setLastDrawnWinner] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [showAutoDraftConfirm, setShowAutoDraftConfirm] = useState(false);

  // Compute trainers that appear on the wheel:
  // Must be in participants, not yet drafted, and not manually excluded
  const wheelTrainers = useMemo(() => {
    return participants.filter(
      p => !draftOrder.includes(p) && !excludedFromWheel.includes(p)
    );
  }, [participants, draftOrder, excludedFromWheel]);

  // Handle adding a trainer
  const handleAddTrainer = () => {
    const trimmed = newTrainerInput.trim();
    if (!trimmed) return;
    if (participants.some(p => p.toLowerCase() === trimmed.toLowerCase())) return;

    const next = [...participants, trimmed];
    onUpdateParticipants(next);
    setNewTrainerInput('');
  };

  // When a spin finishes: directly add winner to draft order without any popup confirmation!
  const handleSpinComplete = (winner: string) => {
    setIsSpinning(false);
    setLastDrawnWinner(winner);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Automatically add winner to draft order
    let nextOrder = draftOrder.includes(winner) ? draftOrder : [...draftOrder, winner];

    // If only 1 trainer remains after this, auto-add them too!
    const remaining = participants.filter(p => !nextOrder.includes(p));
    if (remaining.length === 1) {
      nextOrder = [...nextOrder, remaining[0]];
    }

    onUpdateDraftOrder(nextOrder);
  };

  // Direct shortcut to jump to starter draw for a trainer
  const handleDrawStarterNow = (trainer: string) => {
    let nextOrder = draftOrder;
    if (!draftOrder.includes(trainer)) {
      nextOrder = [...draftOrder, trainer];
      const remaining = participants.filter(p => !nextOrder.includes(p));
      if (remaining.length === 1) {
        nextOrder = [...nextOrder, remaining[0]];
      }
      onUpdateDraftOrder(nextOrder);
    }
    setLastDrawnWinner(null);
    onClose();
    onSelectTrainerForStarterDraw(trainer);
  };

  // When only 1 participant remains without a place, auto-add them to the list
  useEffect(() => {
    if (participants.length > 1 && draftOrder.length > 0) {
      const remaining = participants.filter(p => !draftOrder.includes(p));
      if (remaining.length === 1) {
        onUpdateDraftOrder([...draftOrder, remaining[0]]);
      }
    }
  }, [participants, draftOrder, onUpdateDraftOrder]);

  // Auto-draft all remaining trainers in random order
  const handleAutoDraftAll = () => {
    const remaining = participants.filter(p => !draftOrder.includes(p));
    if (remaining.length === 0) return;

    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    onUpdateDraftOrder([...draftOrder, ...shuffled]);
    setShowAutoDraftConfirm(false);
  };

  // Reset entire draft order
  const handleResetOrder = () => {
    onUpdateDraftOrder([]);
    setExcludedFromWheel([]);
    setLastDrawnWinner(null);
  };

  // Copy order to Discord
  const handleCopyDiscord = async () => {
    const text = formatDraftOrderForDiscord(draftOrder);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedDiscord(true);
      setTimeout(() => setCopiedDiscord(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <ConfettiOverlay active={showConfetti} />

      <div className="bg-cobble-900 border-4 border-cobble-700 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="bg-cobble-950/90 border-b-2 border-cobble-700 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Roleta de Ordem dos Treinadores
                </h2>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-300 font-bold px-2 py-0.5 border border-yellow-500/40 rounded-full">
                  Estilo SpinTheWheel
                </span>
              </div>
              <p className="text-xs text-cobble-400">
                Gire a roleta para sortear a ordem em que cada treinador escolherá seu Pokémon inicial!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-cobble-800 border border-cobble-600 text-cobble-300 hover:text-white hover:bg-cobble-700 transition-colors cursor-pointer"
            title="Fechar roleta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          
          {/* LEFT COLUMN: THE CIRCULAR WHEEL */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-cobble-950/60 border-2 border-cobble-800 rounded-xl p-4">
            
            {wheelTrainers.length > 0 ? (
              <>
                <TrainerWheel
                  trainers={wheelTrainers}
                  isSpinning={isSpinning}
                  onSpinStart={() => setIsSpinning(true)}
                  onSpinComplete={handleSpinComplete}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled(!soundEnabled)}
                  size={380}
                />
                {lastDrawnWinner && (
                  <div className="mt-2.5 w-full max-w-[340px] bg-yellow-500/15 border border-yellow-500/50 rounded-lg py-1.5 px-3 text-center animate-in fade-in zoom-in duration-200">
                    <p className="text-xs font-black text-yellow-300 flex items-center justify-center gap-1.5 truncate">
                      <span>🎉</span>
                      <span><strong>{lastDrawnWinner}</strong> adicionado à lista!</span>
                    </p>
                    <p className="text-[10px] text-cobble-400 font-bold">
                      {wheelTrainers.length <= 1 ? 'Ordem completa definida!' : 'Clique em Girar para o próximo!'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                <Trophy className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
                <h3 className="text-lg font-black text-white mb-1">
                  Todos os treinadores já foram sorteados!
                </h3>
                <p className="text-xs text-cobble-400 max-w-sm mb-4">
                  A ordem completa do draft foi definida com sucesso. Você pode reiniciar a ordem para girar novamente ou começar o sorteio dos Pokémon iniciais!
                </p>
                <Button
                  onClick={handleResetOrder}
                  className="!bg-yellow-500 hover:!bg-yellow-400 text-cobble-950 font-black text-xs py-2 px-4 border border-yellow-600 shadow"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Girar Novamente (Reiniciar)
                </Button>
              </div>
            )}

            {/* Quick Add Trainer Input */}
            <div className="mt-4 w-full max-w-md bg-black/40 p-2.5 rounded-xl border border-cobble-700/80">
              <label className="text-[11px] font-bold text-cobble-300 mb-1 block">
                Adicionar Treinador à Roleta:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nome do treinador..."
                  value={newTrainerInput}
                  onChange={(e) => setNewTrainerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTrainer();
                    }
                  }}
                  className="flex-1 bg-cobble-900 border border-cobble-700 px-3 py-1.5 text-xs text-white placeholder-cobble-400 rounded outline-none focus:border-yellow-400 font-bold"
                />
                <button
                  onClick={handleAddTrainer}
                  className="bg-yellow-500 hover:bg-yellow-400 text-cobble-950 px-3 py-1.5 font-black text-xs rounded border border-yellow-600 transition-colors shadow flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DRAFT ORDER & PARTICIPANTS STATUS */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            
            {/* Drafted Order List Card */}
            <div className="bg-cobble-950/70 border-2 border-cobble-800 rounded-xl p-3 flex flex-col flex-1">
              <div className="flex items-center justify-between border-b border-cobble-800 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-xs sm:text-sm font-black text-white">
                    Ordem Sorteada ({draftOrder.length}/{participants.length})
                  </h3>
                </div>

                {draftOrder.length > 0 && (
                  <button
                    onClick={handleResetOrder}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                  >
                    Limpar Ordem
                  </button>
                )}
              </div>

              {draftOrder.length > 0 ? (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {draftOrder.map((trainer, index) => {
                    const pos = index + 1;
                    const starterEntry = Object.entries(claimedStarters).find(([, t]) => t === trainer);
                    const starterId = starterEntry ? Number(starterEntry[0]) : null;
                    const starterDef = starterId ? STARTER_POKEMON_DEFS.find(s => s.id === starterId) : null;
                    const orderLabel = `${pos}º`;

                    return (
                      <div
                        key={trainer}
                        className={cn(
                          "p-2 rounded-lg border flex items-center justify-between text-xs transition-all",
                          pos === 1 
                            ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-200 font-bold" 
                            : "bg-cobble-900/80 border-cobble-700 text-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-black text-xs w-7 shrink-0 text-cobble-400 font-mono text-center">{orderLabel}</span>
                          <span className="font-bold truncate">{trainer}</span>
                        </div>

                        {starterDef ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 shrink-0 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            <span>{starterDef.type === 'grass' ? '🌿' : starterDef.type === 'fire' ? '🔥' : '💧'}</span>
                            {starterDef.name}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDrawStarterNow(trainer)}
                            className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-black px-2 py-0.5 rounded transition-colors shadow shrink-0 cursor-pointer flex items-center gap-1"
                            title="Sortear inicial deste treinador"
                          >
                            <span>Sortear</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-cobble-400 text-xs italic">
                  Nenhum treinador sorteado ainda. Gire a roleta para determinar quem escolhe 1º!
                </div>
              )}

              {/* Action Bar for Draft Order */}
              {draftOrder.length > 0 && (
                <div className="pt-2 border-t border-cobble-800 mt-auto flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyDiscord}
                      size="sm"
                      className="flex-1 !bg-[#5865F2] hover:!bg-[#4752C4] text-white font-bold text-xs py-2 border border-[#3c45a5]"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1" />
                      {copiedDiscord ? 'Copiado p/ Discord!' : 'Copiar Ordem Discord'}
                    </Button>

                    <Button
                      onClick={onClose}
                      size="sm"
                      variant="secondary"
                      className="flex-1 text-xs py-2 font-bold border border-cobble-600 hover:bg-cobble-700 text-cobble-200"
                      title="Voltar ao draft dos iniciais com a ordem sorteada"
                    >
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Concluir
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Remaining Pool of Trainers Card */}
            <div className="bg-cobble-950/70 border-2 border-cobble-800 rounded-xl p-3">
              <div className="flex items-center justify-between border-b border-cobble-800 pb-1.5 mb-2">
                <span className="text-xs font-bold text-slate-300">
                  Aguardando Sorteio ({participants.filter(p => !draftOrder.includes(p)).length})
                </span>

                {participants.filter(p => !draftOrder.includes(p)).length > 1 && (
                  <button
                    onClick={() => setShowAutoDraftConfirm(true)}
                    className="text-[11px] text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Embaralha e gera a ordem de todos de uma vez"
                  >
                    <Shuffle className="w-3 h-3" />
                    Sortear Todos Automático
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                {participants.filter(p => !draftOrder.includes(p)).map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cobble-900 border border-cobble-700 text-cobble-300 text-[11px] font-bold"
                  >
                    👑 {name}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* AUTO DRAFT CONFIRMATION */}
      <AnimatePresence>
        {showAutoDraftConfirm && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cobble-900 border-4 border-cobble-700 rounded-xl p-5 max-w-sm w-full shadow-2xl text-center"
            >
              <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-sm font-black text-white mb-2">
                Sortear Todos Automaticamente?
              </h3>
              <p className="text-xs text-cobble-400 mb-4">
                Isso irá embaralhar todos os treinadores restantes e definir a ordem completa imediatamente sem precisar girar um por um.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAutoDraftConfirm(false)}
                  variant="secondary"
                  className="flex-1 text-xs py-2"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAutoDraftAll}
                  className="flex-1 !bg-yellow-500 hover:!bg-yellow-400 text-cobble-950 font-black text-xs py-2 border border-yellow-600"
                >
                  Sim, Sortear!
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
