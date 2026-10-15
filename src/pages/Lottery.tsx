import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dices, Filter, Settings2, Sparkles, RefreshCw, History as HistoryIcon, 
  Users, Plus, X, Share2, Check, Zap, Shuffle, Image as ImageIcon, Crown, AlertTriangle, BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { drawPokemon } from '../utils/lottery';
import type { LotteryFilters } from '../utils/lottery';
import type { Pokemon, LotteryHistorySession } from '../types/pokemon';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cn } from '../utils/cn';
import { formatLotteryForDiscord, copyToClipboard } from '../utils/discord';
import { generateLotteryCardImage, copyImageBlobToClipboard, downloadImageBlob } from '../utils/cardGenerator';

import { Gachapon } from '../components/lottery/Gachapon';
import { CardReveal } from '../components/pokemon/CardReveal';
import { PokemonTypeBadge } from '../components/pokemon/PokemonTypeBadge';
import { StartersDraftBoard } from '../components/lottery/StartersDraftBoard';
import { StartersRoulette } from '../components/lottery/StartersRoulette';
import { STARTER_POKEMON_DEFS, formatStartersDraftForDiscord } from '../utils/starters';
import type { StarterPokemonDef } from '../utils/starters';
import { pokeApi } from '../services/pokeapi';

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

export default function Lottery() {
  const navigate = useNavigate();

  // Mode selection: Unified tabs (Custom, Quick, Type, Starters Draft)
  const [lotteryTab, setLotteryTab] = useLocalStorage<'custom' | 'quick' | 'type' | 'starters'>('cobblemon-lottery-tab', 'custom');

  // Tab 4: Starters Draft State (27 Starters with 0 repeats rule)
  const [claimedStarters, setClaimedStarters] = useLocalStorage<Record<number, string>>('cobblemon-claimed-starters', {});
  const [startersCenterView, setStartersCenterView] = useState<'board' | 'gachapon'>('board');
  const [copiedStartersDiscord, setCopiedStartersDiscord] = useState(false);
  const [showResetStartersConfirm, setShowResetStartersConfirm] = useState(false);

  // Starters Roulette Dramatic Overlay State
  const [isSpinningStarter, setIsSpinningStarter] = useState(false);
  const [activeSpinWinnerDef, setActiveSpinWinnerDef] = useState<StarterPokemonDef | null>(null);
  const [activeSpinTrainer, setActiveSpinTrainer] = useState<string>('');
  const [activeSpinFinished, setActiveSpinFinished] = useState(false);
  const [activeSpinPokemon, setActiveSpinPokemon] = useState<Pokemon | null>(null);

  // History & Session
  const [history, setHistory] = useLocalStorage<LotteryHistorySession[]>('cobblemon-history', []);
  const [currentSessionParticipants, setCurrentSessionParticipants] = useState<string[]>([]);
  const [currentSessionFilters, setCurrentSessionFilters] = useState<string[]>([]);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Participants State: simple clean list of trainer names
  const [rawParticipants, setRawParticipants] = useLocalStorage<any[]>('cobblemon-participants', []);
  const [newParticipant, setNewParticipant] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useLocalStorage<string>('cobblemon-selected-trainer', 'all');

  // Normalize in case older object structure existed in localStorage
  const participants: string[] = rawParticipants
    .map(p => (typeof p === 'string' ? p : String(p?.name || '')))
    .map(p => p.trim())
    .filter(Boolean);

  // Active target trainer: specific person or 'all' (distribute)
  const activeSelectedTrainer = (selectedTrainer !== 'all' && participants.includes(selectedTrainer))
    ? selectedTrainer
    : (participants.length === 1 ? participants[0] : 'all');

  // Tab 1: Custom Filters State
  const [quantity, setQuantity] = useLocalStorage('cobblemon-lottery-quantity', 1);
  const [filters, setFilters] = useLocalStorage<LotteryFilters>('cobblemon-lottery-filters', { 
    type1: 'all', 
    type2: 'all', 
    generation: 0,
    allowLegendary: true,
    allowMythical: true,
    rarity: 'all',
    evolution: 'all',
    uniqueTypes: true
  });

  // Tab 2: Quick Random Team State
  const [quickQty, setQuickQty] = useState(6);
  const [quickLegendaries, setQuickLegendaries] = useState(false);
  const [quickEvolution, setQuickEvolution] = useState<'all' | '1' | '2' | '3'>('all');
  const [quickUniqueTypes, setQuickUniqueTypes] = useState(true);

  // Tab 3: Type Roulette State
  const [drawnType, setDrawnType] = useState<string | null>(null);
  const [isDrawingType, setIsDrawingType] = useState(false);

  // Draw & Results State
  const [results, setResults] = useLocalStorage<Pokemon[]>('cobblemon-lottery-results', []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingQueue, setDrawingQueue] = useState<Pokemon[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastDrawConfig, setLastDrawConfig] = useState<{ qty: number, filters: LotteryFilters } | null>(null);

  // ==================== HANDLERS: PARTICIPANTS ====================
  const handleAddParticipant = () => {
    const trimmed = newParticipant.trim();
    if (!trimmed) return;
    if (participants.some(p => p.toLowerCase() === trimmed.toLowerCase())) return;
    setRawParticipants([...participants, trimmed]);
    setNewParticipant('');
    if (participants.length === 0) {
      setSelectedTrainer(trimmed);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    const removedName = participants[index];
    const nextList = participants.filter((_, i) => i !== index);
    setRawParticipants(nextList);
    if (selectedTrainer === removedName) {
      setSelectedTrainer(nextList.length > 0 ? nextList[0] : 'all');
    }
  };

  const handleClearParticipants = () => {
    setRawParticipants([]);
    setSelectedTrainer('all');
  };

  // ==================== HANDLERS: FILTERS ====================
  const resetFilters = () => {
    setQuantity(1);
    setFilters({
      type1: 'all',
      type2: 'all',
      generation: 0,
      allowLegendary: true,
      allowMythical: true,
      rarity: 'all',
      evolution: 'all',
      uniqueTypes: true
    });
  };

  const updateFilter = (key: keyof LotteryFilters, value: any) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'rarity' && ['legendary', 'mythical'].includes(value)) {
        next.evolution = 'all';
      }
      if (key === 'type1' && value !== 'all' && next.type2 === value) {
        next.type2 = 'all';
      }
      if (key === 'type2' && value !== 'all' && value !== 'none' && next.type1 === value) {
        next.type1 = 'all';
      }
      return next;
    });
  };

  const isEvolutionDisabled = ['legendary', 'mythical'].includes(filters.rarity || 'all');

  // ==================== HANDLERS: TYPE ROULETTE ====================
  const handleDrawType = async () => {
    if (isDrawingType) return;
    setIsDrawingType(true);
    
    const actualTypes = TYPES.filter(t => t !== 'all');
    let finalType = 'normal';
    
    for (let i = 0; i < 15; i++) {
      finalType = actualTypes[Math.floor(Math.random() * actualTypes.length)];
      setDrawnType(finalType);
      await new Promise(resolve => setTimeout(resolve, 80 + i * 10)); 
    }
    
    setIsDrawingType(false);
  };

  // ==================== CORE DRAW FUNCTION ====================
  const handleDraw = async (overrideQty?: number, overrideFilters?: LotteryFilters) => {
    setIsDrawing(true);
    setResults([]);
    setErrorMsg(null);

    const activeQty = overrideQty || quantity;
    const activeFilters = overrideFilters || filters;

    // Determine trainer ownership (specific selected trainer or round-robin among all)
    let finalOwners: string[] = [];
    if (participants.length > 0) {
      if (activeSelectedTrainer !== 'all') {
        finalOwners = Array(activeQty).fill(activeSelectedTrainer);
      } else {
        for (let i = 0; i < activeQty; i++) {
          finalOwners.push(participants[i % participants.length]);
        }
      }
    }

    setCurrentSessionParticipants(finalOwners);
    setLastDrawConfig({ qty: activeQty, filters: activeFilters });
    
    try {
      const drawnPokemon: Pokemon[] = [];
      const drawnIds: number[] = [];
      const drawnTypes: string[] = [];
      
      const allowLegendary = activeFilters.allowLegendary ?? true;
      const allowMythical = activeFilters.allowMythical ?? true;

      for (let i = 0; i < activeQty; i++) {
        try {
          const excludeTypes = activeFilters.uniqueTypes ? drawnTypes : [];
          const p = await drawPokemon(activeFilters, allowLegendary, allowMythical, drawnIds, excludeTypes);
          drawnPokemon.push(p);
          drawnIds.push(p.id);
          p.types.forEach(t => {
            if (!drawnTypes.includes(t.type.name)) {
              drawnTypes.push(t.type.name);
            }
          });
        } catch (e) {
          console.warn("Não foi possível sortear mais Pokémon para os filtros atuais.");
          break;
        }
      }

      if (drawnPokemon.length === 0) {
        throw new Error("A máquina procurou por todo lado, mas nenhum Pokémon existe com essa combinação de filtros ou regras de tipos!");
      }
      
      setDrawingQueue(drawnPokemon);
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      setResults(drawnPokemon);
      
      const sessionFilters = [
        activeFilters.type1 && activeFilters.type1 !== 'all' ? `Tipo 1: ${activeFilters.type1}` : '',
        activeFilters.type2 && activeFilters.type2 !== 'all' ? (activeFilters.type2 === 'none' ? 'Tipo 2: Nenhum' : `Tipo 2: ${activeFilters.type2}`) : '',
        activeFilters.generation ? `Gen: ${activeFilters.generation}` : '',
        activeFilters.rarity && activeFilters.rarity !== 'all' ? `Raridade: ${activeFilters.rarity}` : '',
        activeFilters.evolution && activeFilters.evolution !== 'all' ? `Evolução: ${activeFilters.evolution}` : '',
        activeFilters.uniqueTypes ? 'Sem tipos repetidos' : ''
      ].filter(Boolean);

      setCurrentSessionFilters(sessionFilters);

      const newHistorySession: LotteryHistorySession = {
        id: crypto.randomUUID(),
        pokemons: drawnPokemon,
        date: new Date().toISOString(),
        quantityRequested: activeQty,
        filters: sessionFilters,
        participants: finalOwners.length > 0 ? finalOwners : undefined
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

  // Quick Random Draw Handler
  const handleQuickDraw = () => {
    const quickFilters: LotteryFilters = {
      type1: 'all',
      type2: 'all',
      generation: 0,
      rarity: quickLegendaries ? 'all' : 'normal',
      evolution: quickEvolution,
      allowLegendary: quickLegendaries,
      allowMythical: quickLegendaries,
      uniqueTypes: quickUniqueTypes
    };

    handleDraw(quickQty, quickFilters);
  };

  // Draw Pokemons of Drawn Type
  const handleDrawFromRouletteType = () => {
    if (!drawnType) return;
    const typeFilters: LotteryFilters = {
      type1: drawnType,
      type2: 'all',
      generation: 0,
      rarity: 'all',
      evolution: 'all',
      allowLegendary: true,
      allowMythical: true,
      uniqueTypes: false
    };

    handleDraw(quantity, typeFilters);
  };

  // ==================== HANDLERS: STARTERS DRAFT (27 STARTERS) ====================
  const handleDrawStarter = (targetTrainerName?: string) => {
    if (isDrawing || isSpinningStarter) return;
    setErrorMsg(null);

    // Available starters (not yet claimed by anyone!)
    const available = STARTER_POKEMON_DEFS.filter(s => !claimedStarters[s.id]);
    if (available.length === 0) {
      setErrorMsg("Todos os 27 Pokémon iniciais já foram sorteados! Reinicie o pool para começar uma nova rodada.");
      return;
    }

    // Determine target trainer
    const recipient = targetTrainerName || 
      (activeSelectedTrainer !== 'all' 
        ? activeSelectedTrainer 
        : (participants.length > 0 ? (participants.find(p => !Object.values(claimedStarters).includes(p)) || participants[0]) : 'Treinador'));

    // Check if recipient already has a starter
    const existingStarterId = Object.entries(claimedStarters).find(([_, trainer]) => trainer === recipient)?.[0];
    if (existingStarterId) {
      const starterDef = STARTER_POKEMON_DEFS.find(s => s.id === Number(existingStarterId));
      setErrorMsg(`${recipient} já recebeu o inicial ${starterDef?.name || 'dele'} neste draft! Para sortear novamente, reinicie o pool ou selecione outro participante.`);
      return;
    }

    // Pick random winner from available starters
    const winnerDef = available[Math.floor(Math.random() * available.length)];

    // Launch the dramatic Roulette modal!
    setActiveSpinFinished(false);
    setActiveSpinPokemon(null);
    setActiveSpinWinnerDef(winnerDef);
    setActiveSpinTrainer(recipient);
    setIsSpinningStarter(true);
  };

  const handleStartersRouletteComplete = async () => {
    if (!activeSpinWinnerDef) return;
    setActiveSpinFinished(true);

    try {
      // Fetch full Pokemon object from PokeAPI
      const p = await pokeApi.getPokemon(activeSpinWinnerDef.id);
      setActiveSpinPokemon(p);

      // Claim starter for recipient in state and localStorage
      setClaimedStarters(prev => ({ ...prev, [activeSpinWinnerDef.id]: activeSpinTrainer }));

      // Add to history right away
      const newHistorySession: LotteryHistorySession = {
        id: crypto.randomUUID(),
        pokemons: [p],
        date: new Date().toISOString(),
        quantityRequested: 1,
        filters: [`🌟 Draft Iniciais: ${activeSpinWinnerDef.name} (${activeSpinWinnerDef.generationName})`],
        participants: [activeSpinTrainer]
      };
      setHistory([newHistorySession, ...history]);

    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro ao buscar dados do Pokémon inicial sorteado. Tente novamente!");
    }
  };

  const handleOpenWinnerDetails = () => {
    const starterId = activeSpinWinnerDef?.id || activeSpinPokemon?.id;
    setIsSpinningStarter(false);
    setActiveSpinFinished(false);
    setActiveSpinWinnerDef(null);
    setActiveSpinPokemon(null);
    if (starterId) {
      navigate(`/pokemon/${starterId}`);
    }
  };

  const handleOpenLotteryCard = () => {
    if (activeSpinPokemon) {
      setResults([activeSpinPokemon]);
      setCurrentSessionParticipants([activeSpinTrainer]);
      setCurrentSessionFilters([`🌟 Draft dos 27 Iniciais (${activeSpinWinnerDef?.generationName})`]);
    }
    setIsSpinningStarter(false);
    setActiveSpinFinished(false);
    setActiveSpinWinnerDef(null);
    setActiveSpinPokemon(null);
  };

  const handleNextStarterSpin = () => {
    // Find the next participant who does not have a starter yet
    const pendingTrainers = participants.filter(p => !Object.values(claimedStarters).includes(p));
    const nextTrainer = pendingTrainers.length > 0 ? pendingTrainers[0] : null;

    if (nextTrainer) {
      setSelectedTrainer(nextTrainer);
    }

    setIsSpinningStarter(false);
    setActiveSpinFinished(false);
    setActiveSpinWinnerDef(null);
    setActiveSpinPokemon(null);

    setTimeout(() => {
      handleDrawStarter(nextTrainer || undefined);
    }, 250);
  };

  const handleCloseRoulette = () => {
    setIsSpinningStarter(false);
    setActiveSpinFinished(false);
    setActiveSpinWinnerDef(null);
    setActiveSpinPokemon(null);
  };

  const handleDrawAllRemainingStarters = async () => {
    if (isDrawing) return;
    setErrorMsg(null);

    // List of participants who don't have a starter yet
    const pendingParticipants = participants.filter(p => !Object.values(claimedStarters).includes(p));
    if (pendingParticipants.length === 0) {
      setErrorMsg("Todos os participantes cadastrados já possuem um inicial sorteado!");
      return;
    }

    const available = STARTER_POKEMON_DEFS.filter(s => !claimedStarters[s.id]);
    if (available.length < pendingParticipants.length) {
      setErrorMsg(`Não há iniciais suficientes disponíveis (${available.length} restantes) para ${pendingParticipants.length} participantes!`);
      return;
    }

    setIsDrawing(true);
    setResults([]);

    try {
      // Shuffle available starters
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const chosenDefs = shuffled.slice(0, pendingParticipants.length);

      const drawnPokemons: Pokemon[] = [];
      const updatedClaimed = { ...claimedStarters };
      const owners: string[] = [];

      for (let i = 0; i < pendingParticipants.length; i++) {
        const participant = pendingParticipants[i];
        const starter = chosenDefs[i];
        updatedClaimed[starter.id] = participant;
        owners.push(participant);
        const p = await pokeApi.getPokemon(starter.id);
        drawnPokemons.push(p);
      }

      setDrawingQueue(drawnPokemons);
      await new Promise(r => setTimeout(r, 2200));

      setClaimedStarters(updatedClaimed);
      setResults(drawnPokemons);
      setCurrentSessionParticipants(owners);
      setCurrentSessionFilters([`🌟 Draft dos 27 Iniciais (${drawnPokemons.length} Treinadores)`]);

      const newHistorySession: LotteryHistorySession = {
        id: crypto.randomUUID(),
        pokemons: drawnPokemons,
        date: new Date().toISOString(),
        quantityRequested: drawnPokemons.length,
        filters: [`🌟 Draft Sequencial (${drawnPokemons.length} Treinadores)`],
        participants: owners
      };
      setHistory([newHistorySession, ...history]);

    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro ao realizar o sorteio dos iniciais.");
    } finally {
      setIsDrawing(false);
      setDrawingQueue([]);
    }
  };

  const handleResetStarters = () => {
    setShowResetStartersConfirm(true);
  };

  const confirmResetStarters = () => {
    setClaimedStarters({});
    setShowResetStartersConfirm(false);
  };

  const handleCopyStartersDiscord = async () => {
    const text = formatStartersDraftForDiscord(claimedStarters);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedStartersDiscord(true);
      setTimeout(() => setCopiedStartersDiscord(false), 2500);
    }
  };

  // Master Spin Trigger: Executes according to active tab
  const handleMasterSpin = () => {
    if (lotteryTab === 'starters') {
      handleDrawStarter();
    } else if (lotteryTab === 'custom') {
      handleDraw();
    } else if (lotteryTab === 'quick') {
      handleQuickDraw();
    } else if (lotteryTab === 'type') {
      if (drawnType && !isDrawingType) {
        handleDrawFromRouletteType();
      } else {
        handleDrawType();
      }
    }
  };

  // Discord Text Share Handler
  const handleCopyDiscord = async () => {
    const text = formatLotteryForDiscord(results, currentSessionParticipants, currentSessionFilters);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedDiscord(true);
      setTimeout(() => setCopiedDiscord(false), 2500);
    }
  };

  // Discord Image Card Share Handler
  const handleCopyImageDiscord = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const blob = await generateLotteryCardImage(results, currentSessionParticipants);
      const copied = await copyImageBlobToClipboard(blob);
      if (copied) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      } else {
        downloadImageBlob(blob, `sorteio-pokegamba-${Date.now()}.png`);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao gerar card de imagem:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const viewHistoryResults = (session: LotteryHistorySession) => {
    setResults(session.pokemons);
    setCurrentSessionParticipants(session.participants || []);
    setCurrentSessionFilters(session.filters || []);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-300 relative">
      
      {/* Error Modal */}
      <AnimatePresence>
        {errorMsg && (
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
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-red-400 mb-2 drop-shadow-md">
                  Ops! Algo deu errado
                </h3>
                <p className="text-cobble-200 text-sm md:text-base mb-6 font-medium">
                  {errorMsg}
                </p>
                <Button 
                  onClick={() => setErrorMsg(null)} 
                  variant="danger"
                  className="w-full text-base py-3 shadow-lg transition-all rounded-xl font-bold"
                >
                  Tentar Outra Combinação
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 relative z-10">
        
        {/* LEFT COLUMN: Clean Trainers & Unified Lottery Modes */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          
          {/* 1. CLEAN COMPACT TRAINERS CARD */}
          <div className="bg-cobble-800 border-4 border-cobble-700 p-3 shadow-xl flex flex-col h-fit">
            <div className="flex items-center justify-between mb-2 border-b-2 border-cobble-700 pb-1.5">
              <h2 className="text-sm font-black text-white flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-yellow-400" /> Treinadores ({participants.length})
              </h2>
              {participants.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-black/50 border border-cobble-600 px-2 py-0.5 rounded">
                    <span className="text-[10px] text-cobble-400 font-bold">Para:</span>
                    <select
                      value={activeSelectedTrainer}
                      onChange={(e) => setSelectedTrainer(e.target.value)}
                      className="bg-transparent text-yellow-300 font-black text-xs outline-none cursor-pointer max-w-[105px] truncate"
                      title="Escolha para qual amigo o sorteio será realizado"
                    >
                      {participants.length > 1 && (
                        <option value="all" className="bg-cobble-900 text-slate-200">👥 Todos</option>
                      )}
                      {participants.map(name => (
                        <option key={name} value={name} className="bg-cobble-900 text-yellow-400 font-bold">
                          👑 {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleClearParticipants}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer ml-1"
                    title="Limpar todos os treinadores"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>

            {/* Input to add trainer */}
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                placeholder="Adicionar treinador..."
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="flex-1 min-w-0 bg-black/40 border-2 border-cobble-700 px-2.5 py-1.5 text-xs text-white placeholder-cobble-400 outline-none focus:border-yellow-400 font-bold shadow-inner"
              />
              <button
                onClick={handleAddParticipant}
                className="bg-yellow-500 hover:bg-yellow-400 text-cobble-950 px-2.5 py-1.5 font-black text-xs border-2 border-yellow-600 transition-colors shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
                title="Adicionar treinador"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {participants.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1 custom-scrollbar">
                {participants.length > 1 && (
                  <button
                    onClick={() => setSelectedTrainer('all')}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold transition-all border cursor-pointer",
                      activeSelectedTrainer === 'all'
                        ? "bg-yellow-500 text-cobble-950 border-yellow-400 font-black shadow-sm ring-1 ring-yellow-400"
                        : "bg-cobble-900 border-cobble-700 text-cobble-300 hover:text-white hover:border-cobble-500"
                    )}
                    title="Distribuir os Pokémon sorteados entre todos os treinadores"
                  >
                    <span>👥</span> Todos
                  </button>
                )}
                {participants.map((name, i) => {
                  const isSelected = activeSelectedTrainer === name;
                  return (
                    <div
                      key={`${name}-${i}`}
                      onClick={() => setSelectedTrainer(name)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold transition-all border cursor-pointer select-none",
                        isSelected
                          ? "bg-yellow-500/20 border-yellow-400 text-yellow-300 font-black shadow-sm ring-1 ring-yellow-400"
                          : "bg-cobble-900 border-yellow-500/30 text-yellow-300/80 hover:border-yellow-400 hover:text-yellow-200"
                      )}
                      title={`Clique para sortear para ${name}`}
                    >
                      <span className="text-[9px] text-yellow-500">{isSelected ? '👑' : `#${i + 1}`}</span>
                      <span className="truncate max-w-[90px]">{name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveParticipant(i);
                        }}
                        className="text-cobble-400 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                        title="Remover"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-cobble-400 italic">
                Adicione amigos para associar os sorteios diretamente a eles.
              </p>
            )}
          </div>

          {/* 2. UNIFIED LOTTERY MODES CARD */}
          <div className="bg-cobble-800 border-4 border-cobble-700 p-3.5 shadow-xl flex flex-col h-fit">
            
            {/* Unified Mode Tabs Header */}
            <div className="flex border-b-2 border-cobble-700 bg-cobble-900/60 p-1 gap-1 mb-3">
              <button
                onClick={() => setLotteryTab('custom')}
                className={cn(
                  "flex-1 py-1.5 px-1 text-[11px] font-black flex items-center justify-center gap-1 transition-all border-2",
                  lotteryTab === 'custom'
                    ? "bg-cobble-800 border-blue-500 text-blue-300 shadow-md"
                    : "border-transparent text-cobble-400 hover:text-white hover:bg-cobble-800/50"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" /> Normal
              </button>
              <button
                onClick={() => setLotteryTab('quick')}
                className={cn(
                  "flex-1 py-1.5 px-1 text-[11px] font-black flex items-center justify-center gap-1 transition-all border-2",
                  lotteryTab === 'quick'
                    ? "bg-cobble-800 border-purple-500 text-purple-300 shadow-md"
                    : "border-transparent text-cobble-400 hover:text-white hover:bg-cobble-800/50"
                )}
              >
                <Shuffle className="w-3.5 h-3.5" /> Rápido
              </button>
              <button
                onClick={() => setLotteryTab('type')}
                className={cn(
                  "flex-1 py-1.5 px-1 text-[11px] font-black flex items-center justify-center gap-1 transition-all border-2",
                  lotteryTab === 'type'
                    ? "bg-cobble-800 border-yellow-500 text-yellow-300 shadow-md"
                    : "border-transparent text-cobble-400 hover:text-white hover:bg-cobble-800/50"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" /> Tipo
              </button>
              <button
                onClick={() => setLotteryTab('starters')}
                className={cn(
                  "flex-1 py-1.5 px-1 text-[11px] font-black flex items-center justify-center gap-1 transition-all border-2",
                  lotteryTab === 'starters'
                    ? "bg-cobble-800 border-emerald-500 text-emerald-300 shadow-md"
                    : "border-transparent text-cobble-400 hover:text-white hover:bg-cobble-800/50"
                )}
              >
                <Crown className="w-3.5 h-3.5 text-yellow-400" /> Iniciais
              </button>
            </div>

            {/* TAB CONTENT 1: CUSTOM LOTTERY */}
            {lotteryTab === 'custom' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="bg-black/30 p-2.5 border-2 border-cobble-700 group">
                  <h3 className="font-bold text-xs text-slate-200 mb-1.5 flex items-center tracking-widest">
                    <Dices className="w-4 h-4 mr-1.5 text-slate-400" /> Quantidade de Pokémon
                  </h3>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white outline-none font-bold text-sm cursor-pointer appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Pokémon{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <div className="bg-black/30 p-2.5 border-2 border-cobble-700 group w-1/2">
                    <h3 className="font-bold text-xs text-slate-200 mb-1 flex items-center tracking-widest">
                      <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Tipo 1
                    </h3>
                    <select
                      value={filters.type1}
                      onChange={(e) => updateFilter('type1', e.target.value)}
                      className="w-full bg-cobble-800 border-2 border-cobble-700 p-1.5 text-white outline-none capitalize font-bold text-xs cursor-pointer appearance-none"
                    >
                      {TYPES.map(t => (
                        <option key={t} value={t} disabled={t !== 'all' && filters.type2 === t}>
                          {t === 'all' ? 'Qualquer' : t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-black/30 p-2.5 border-2 border-cobble-700 group w-1/2">
                    <h3 className="font-bold text-xs text-slate-200 mb-1 flex items-center tracking-widest">
                      <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Tipo 2
                    </h3>
                    <select
                      value={filters.type2}
                      onChange={(e) => updateFilter('type2', e.target.value)}
                      className="w-full bg-cobble-800 border-2 border-cobble-700 p-1.5 text-white outline-none capitalize font-bold text-xs cursor-pointer appearance-none"
                    >
                      <option value="all">Qualquer</option>
                      <option value="none" className="text-red-400 font-bold">Nenhum</option>
                      {TYPES.filter(t => t !== 'all').map(t => (
                        <option key={t} value={t} disabled={filters.type1 === t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="bg-black/30 p-2.5 border-2 border-cobble-700 group w-1/2">
                    <h3 className="font-bold text-xs text-slate-200 mb-1 flex items-center tracking-widest">
                      <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Geração
                    </h3>
                    <select
                      value={filters.generation}
                      onChange={(e) => updateFilter('generation', parseInt(e.target.value))}
                      className="w-full bg-cobble-800 border-2 border-cobble-700 p-1.5 text-white outline-none font-bold text-xs cursor-pointer appearance-none"
                    >
                      {GENS.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-black/30 p-2.5 border-2 border-cobble-700 group w-1/2">
                    <h3 className="font-bold text-xs text-slate-200 mb-1 flex items-center tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Raridade
                    </h3>
                    <select
                      value={filters.rarity || 'all'}
                      onChange={(e) => updateFilter('rarity', e.target.value)}
                      className="w-full bg-cobble-800 border-2 border-cobble-700 p-1.5 text-white outline-none font-bold text-xs cursor-pointer appearance-none"
                    >
                      <option value="all">Misto</option>
                      <option value="normal">Comuns</option>
                      <option value="legendary" className="text-purple-400 font-bold">Lendários</option>
                      <option value="mythical" className="text-pink-400 font-bold">Míticos</option>
                    </select>
                  </div>
                </div>

                <div className={cn("bg-black/30 p-2.5 border-2", isEvolutionDisabled ? "border-cobble-800 opacity-60" : "border-cobble-700")}>
                  <h3 className="font-bold text-xs text-slate-200 mb-1 flex items-center tracking-widest">
                    <Sparkles className={cn("w-3.5 h-3.5 mr-1", isEvolutionDisabled ? "text-cobble-600" : "text-green-500/50")} /> Evolução
                  </h3>
                  <select
                    value={filters.evolution || 'all'}
                    onChange={(e) => updateFilter('evolution', e.target.value)}
                    disabled={isEvolutionDisabled}
                    className={cn("w-full bg-cobble-800 border-2 p-1.5 text-white outline-none font-bold text-xs appearance-none",
                      isEvolutionDisabled ? "border-cobble-800 cursor-not-allowed text-slate-400" : "border-cobble-700 cursor-pointer"
                    )}
                  >
                    <option value="all">{isEvolutionDisabled ? 'Lendários ñ evoluem' : 'Qualquer Estágio'}</option>
                    {!isEvolutionDisabled && <option value="base" className="text-green-400 font-bold">Base (Estágio 1)</option>}
                    {!isEvolutionDisabled && <option value="evolved" className="text-blue-400 font-bold">Evoluídos</option>}
                  </select>
                </div>

                {/* Unique Types Toggle */}
                <div 
                  onClick={() => updateFilter('uniqueTypes', !filters.uniqueTypes)}
                  className="bg-black/30 p-2.5 border-2 border-cobble-700 flex items-center justify-between cursor-pointer hover:border-yellow-500/70 transition-colors"
                >
                  <div>
                    <h3 className="font-black text-xs text-yellow-300 flex items-center tracking-wider">
                      <Zap className="w-3.5 h-3.5 mr-1 text-yellow-400" /> Não Repetir Tipos
                    </h3>
                    <p className="text-[10px] text-cobble-400">Garante tipos elementais variados</p>
                  </div>
                  <div className={cn(
                    "w-10 h-5 flex items-center p-0.5 border-2 transition-all",
                    filters.uniqueTypes ? "bg-yellow-500 border-yellow-300 justify-end" : "bg-cobble-900 border-cobble-700 justify-start"
                  )}>
                    <div className={cn("w-3 h-3 shadow-md", filters.uniqueTypes ? "bg-cobble-950" : "bg-cobble-500")} />
                  </div>
                </div>

                <Button onClick={resetFilters} variant="secondary" className="w-full text-xs py-2 mt-1" size="sm">
                  Limpar Filtros
                </Button>
              </div>
            )}

            {/* TAB CONTENT 2: QUICK RANDOM TEAM */}
            {lotteryTab === 'quick' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs">
                  ⚡ Sorteio rápido e balanceado para desafios, Nuzlocke ou times de Cobblemon.
                </div>

                <div className="bg-black/30 p-2.5 border-2 border-cobble-700">
                  <h3 className="font-bold text-xs text-slate-200 mb-2 tracking-widest uppercase">
                    Tamanho da Equipe
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 3, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setQuickQty(num)}
                        className={cn(
                          "py-2 font-black text-xs border-2 transition-all",
                          quickQty === num 
                            ? "bg-purple-600 border-purple-400 text-white shadow-md" 
                            : "bg-cobble-900 border-cobble-700 text-cobble-300 hover:text-white"
                        )}
                      >
                        {num === 6 ? 'Time (6)' : `${num} Pokémon`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 border-2 border-cobble-700">
                  <h3 className="font-bold text-xs text-slate-200 mb-1.5 tracking-widest uppercase">
                    Estágio de Evolução
                  </h3>
                  <select
                    value={quickEvolution}
                    onChange={(e) => setQuickEvolution(e.target.value as any)}
                    className="w-full bg-cobble-800 border-2 border-cobble-700 p-1.5 text-white outline-none font-bold text-xs cursor-pointer appearance-none"
                  >
                    <option value="all">Qualquer Estágio (Misto)</option>
                    <option value="1">Apenas Base (Estágio 1)</option>
                    <option value="2">Apenas Estágio 2</option>
                    <option value="3">Apenas Estágio 3 (Final)</option>
                  </select>
                </div>

                {/* Quick Legendaries Toggle */}
                <div 
                  onClick={() => setQuickLegendaries(!quickLegendaries)}
                  className="bg-black/30 p-2.5 border-2 border-cobble-700 flex items-center justify-between cursor-pointer hover:border-purple-500/70 transition-colors"
                >
                  <div>
                    <h3 className="font-black text-xs text-purple-300 flex items-center tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Incluir Lendários / Míticos
                    </h3>
                    <p className="text-[10px] text-cobble-400">{quickLegendaries ? 'Lendários liberados' : 'Apenas Pokémon normais'}</p>
                  </div>
                  <div className={cn(
                    "w-10 h-5 flex items-center p-0.5 border-2 transition-all",
                    quickLegendaries ? "bg-purple-600 border-purple-400 justify-end" : "bg-cobble-900 border-cobble-700 justify-start"
                  )}>
                    <div className={cn("w-3 h-3 shadow-md", quickLegendaries ? "bg-white" : "bg-cobble-500")} />
                  </div>
                </div>

                {/* Quick Unique Types Toggle */}
                <div 
                  onClick={() => setQuickUniqueTypes(!quickUniqueTypes)}
                  className="bg-black/30 p-2.5 border-2 border-cobble-700 flex items-center justify-between cursor-pointer hover:border-yellow-500/70 transition-colors"
                >
                  <div>
                    <h3 className="font-black text-xs text-yellow-300 flex items-center tracking-wider">
                      <Zap className="w-3.5 h-3.5 mr-1 text-yellow-400" /> Não Repetir Tipos
                    </h3>
                    <p className="text-[10px] text-cobble-400">Garante 100% de variedade elemental</p>
                  </div>
                  <div className={cn(
                    "w-10 h-5 flex items-center p-0.5 border-2 transition-all",
                    quickUniqueTypes ? "bg-yellow-500 border-yellow-300 justify-end" : "bg-cobble-900 border-cobble-700 justify-start"
                  )}>
                    <div className={cn("w-3 h-3 shadow-md", quickUniqueTypes ? "bg-cobble-950" : "bg-cobble-500")} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: TYPE ROULETTE */}
            {lotteryTab === 'type' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-2.5 bg-yellow-950/30 border border-yellow-500/30 text-yellow-200 text-xs">
                  🔮 Gire a roleta para o destino escolher um Tipo elemental para sua jornada!
                </div>

                <div className="bg-black/40 border-4 border-cobble-700 p-4 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-purple-500"></div>
                  
                  {drawnType ? (
                    <div className={cn("transform transition-all", isDrawingType ? "scale-110 blur-[1px] opacity-70" : "scale-125")}>
                      <PokemonTypeBadge type={drawnType} />
                      <p className="text-[11px] font-black uppercase text-yellow-400 mt-3 tracking-widest">
                        {isDrawingType ? 'Girando...' : 'Tipo Escolhido!'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Sparkles className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
                      <p className="text-xs font-bold text-cobble-300">
                        Nenhum tipo sorteado ainda.
                      </p>
                      <p className="text-[10px] text-cobble-400 mt-1">
                        Clique abaixo para girar a roleta elemental!
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleDrawType} 
                    disabled={isDrawingType}
                    className="w-full !bg-blue-600 hover:!bg-blue-500 text-white font-black text-sm py-3"
                  >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isDrawingType && "animate-spin")} /> 
                    {isDrawingType ? 'Sorteando Tipo...' : drawnType ? 'Sortear Outro Tipo' : 'Girar Roleta de Tipo'}
                  </Button>

                  {drawnType && !isDrawingType && (
                    <Button 
                      onClick={handleDrawFromRouletteType}
                      disabled={isDrawing}
                      className="w-full !bg-yellow-500 hover:!bg-yellow-400 text-cobble-950 font-black text-sm py-3 border-2 border-yellow-600"
                    >
                      <Zap className="w-4 h-4 mr-2" /> Sortear Pokémon deste Tipo ({drawnType.toUpperCase()})
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: STARTERS DRAFT */}
            {lotteryTab === 'starters' && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                {/* Header Stats */}
                <div className="bg-black/30 p-2.5 border-2 border-cobble-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Draft 27 Iniciais
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                      {27 - Object.keys(claimedStarters).length}/27 Disponíveis
                    </span>
                  </div>
                  <p className="text-[11px] text-cobble-400 leading-tight">
                    Sorteio exclusivo dos 27 iniciais (Gens 1-9). Cada inicial sorteado sai do pool para que ninguém receba Pokémon repetido!
                  </p>
                </div>

                {/* Participants Status List */}
                {participants.length > 0 && (
                  <div className="bg-black/30 p-2 border-2 border-cobble-700 space-y-1">
                    <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                      <span>Status dos Treinadores:</span>
                      <span className="text-[10px] text-cobble-400">
                        {participants.filter(p => Object.values(claimedStarters).includes(p)).length}/{participants.length} com inicial
                      </span>
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {participants.map((name) => {
                        const starterEntry = Object.entries(claimedStarters).find(([_, t]) => t === name);
                        const starterId = starterEntry ? Number(starterEntry[0]) : null;
                        const starterDef = starterId ? STARTER_POKEMON_DEFS.find(s => s.id === starterId) : null;
                        const isTarget = activeSelectedTrainer === name;

                        return (
                          <div
                            key={name}
                            onClick={() => setSelectedTrainer(name)}
                            className={cn(
                              "p-1 rounded border flex items-center justify-between text-xs cursor-pointer transition-all",
                              isTarget ? "border-yellow-400 bg-yellow-500/10" : "border-cobble-700 bg-cobble-900/60 hover:border-cobble-500"
                            )}
                          >
                            <span className="font-bold flex items-center gap-1 text-slate-200 text-[11px]">
                              <span>👑</span> {name}
                            </span>
                            {starterDef ? (
                              <span className="font-bold text-[10px] text-emerald-400 flex items-center gap-1">
                                <span>{starterDef.type === 'grass' ? '🌿' : starterDef.type === 'fire' ? '🔥' : '💧'}</span>
                                {starterDef.name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-cobble-400 italic">Aguardando giro</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-1">
                  <Button
                    onClick={() => handleDrawStarter()}
                    disabled={isDrawing || isSpinningStarter || (27 - Object.keys(claimedStarters).length === 0)}
                    className="w-full !bg-emerald-600 hover:!bg-emerald-500 text-white font-black text-xs py-2 shadow-md border-2 border-emerald-700"
                  >
                    <Dices className="w-4 h-4 mr-1.5" />
                    {isSpinningStarter ? 'Girando Roleta...' : activeSelectedTrainer !== 'all' ? `Sortear Inicial para ${activeSelectedTrainer}` : 'Sortear Próximo Inicial'}
                  </Button>

                  {participants.length > 1 && participants.some(p => !Object.values(claimedStarters).includes(p)) && (
                    <Button
                      onClick={handleDrawAllRemainingStarters}
                      disabled={isDrawing}
                      className="w-full !bg-blue-600 hover:!bg-blue-500 text-white font-black text-xs py-1.5 border-2 border-blue-700 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1.5" /> Sortear para Todos os Faltantes
                    </Button>
                  )}

                  <div className="flex gap-2 pt-0.5">
                    <Button
                      onClick={handleCopyStartersDiscord}
                      size="sm"
                      className="flex-1 !bg-[#5865F2] hover:!bg-[#4752C4] text-white font-bold text-[11px] py-1 border border-[#3c45a5]"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1" /> {copiedStartersDiscord ? 'Copiado!' : 'Discord'}
                    </Button>

                    <Button
                      onClick={handleResetStarters}
                      size="sm"
                      variant="secondary"
                      className="text-red-400 hover:text-red-300 font-bold text-[11px] py-1 border border-red-900/50 hover:bg-red-950/40 cursor-pointer"
                      title="Reinicia o pool dos 27 iniciais"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reiniciar Pool
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Gachapon Machine OR Starters Draft Board */}
        <div className="xl:col-span-5 flex flex-col items-center justify-start bg-cobble-800 border-4 border-cobble-700 p-4 shadow-inner relative min-h-[520px]">
          <h2 className="text-3xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-md mb-1 text-center" style={{ WebkitTextStroke: '1px #423223' }}>
            PokeGamba
          </h2>
          
          {/* Active Mode & Target Trainer Pills */}
          <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5">
            <div className="px-2.5 py-0.5 bg-black/40 border border-cobble-700 rounded-full flex items-center gap-1.5 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-cobble-300">Modo:</span>
              <span className="text-yellow-400 uppercase font-black">
                {lotteryTab === 'custom' ? 'Personalizado' : lotteryTab === 'quick' ? 'Equipe Rápida' : lotteryTab === 'type' ? 'Roleta de Tipo' : 'Draft 27 Iniciais'}
              </span>
              {lotteryTab === 'starters' ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40 font-bold">
                  🔒 {27 - Object.keys(claimedStarters).length}/27 Restantes
                </span>
              ) : (filters.uniqueTypes || (lotteryTab === 'quick' && quickUniqueTypes)) && (
                <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.2 rounded border border-yellow-500/40">
                  🔒 Sem Repetir
                </span>
              )}
            </div>

            {participants.length > 0 && (
              <div className="px-2.5 py-0.5 bg-black/40 border border-cobble-700 rounded-full flex items-center gap-1.5 text-xs font-bold">
                <span className="text-cobble-300">Para:</span>
                <span className="text-yellow-300 font-black">
                  {activeSelectedTrainer !== 'all' ? `👑 ${activeSelectedTrainer}` : `👥 Todos (${participants.length})`}
                </span>
              </div>
            )}
          </div>

          {/* Starters Center View Switcher */}
          {lotteryTab === 'starters' && (
            <div className="flex border border-cobble-600 bg-black/50 p-0.5 rounded-lg mb-2 gap-1">
              <button
                onClick={() => setStartersCenterView('board')}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1 cursor-pointer",
                  startersCenterView === 'board'
                    ? "bg-yellow-500 text-cobble-950 shadow"
                    : "text-cobble-300 hover:text-white"
                )}
              >
                <span>📋</span> Quadro dos 27 Iniciais
              </button>
              <button
                onClick={() => setStartersCenterView('gachapon')}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1 cursor-pointer",
                  startersCenterView === 'gachapon'
                    ? "bg-yellow-500 text-cobble-950 shadow"
                    : "text-cobble-300 hover:text-white"
                )}
              >
                <span>🎰</span> Máquina Gachapon
              </button>
            </div>
          )}

          {lotteryTab === 'starters' && startersCenterView === 'board' ? (
            <StartersDraftBoard 
              claimedStarters={claimedStarters} 
              highlightedId={activeSpinWinnerDef?.id || null}
              className="w-full my-auto"
            />
          ) : (
            <Gachapon isDrawing={isDrawing} queue={drawingQueue} />
          )}

          <div className="mt-auto w-full max-w-sm pt-4">
            <Button 
              onClick={handleMasterSpin} 
              disabled={isDrawing || isDrawingType || isSpinningStarter || (lotteryTab === 'starters' && 27 - Object.keys(claimedStarters).length === 0)}
              size="lg"
              className={cn(
                "w-full py-5 text-2xl font-black shadow-xl transition-all",
                lotteryTab === 'starters'
                  ? "!bg-emerald-600 hover:!bg-emerald-500 !border-emerald-800 text-white"
                  : lotteryTab === 'type' && !drawnType 
                  ? "!bg-blue-600 hover:!bg-blue-500 !border-blue-800" 
                  : "!bg-yellow-500 hover:!bg-yellow-400 text-cobble-950 !border-yellow-600"
              )}
            >
              {isDrawing || isDrawingType || isSpinningStarter ? (
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
              {isDrawing || isSpinningStarter ? (
                isSpinningStarter ? 'Girando Roleta...' : 'Sorteando...'
              ) : (
                lotteryTab === 'starters' ? (
                  activeSelectedTrainer !== 'all' ? `GIRAR INICIAL! (${activeSelectedTrainer})` : 'GIRAR INICIAL!'
                ) :
                lotteryTab === 'type' && !drawnType ? 'GIRAR TIPO!' :
                lotteryTab === 'quick' ? `GIRAR! (${quickQty})` : `GIRAR! (${quantity})`
              )}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Feed / History */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          <div className="bg-cobble-800 border-4 border-cobble-700 p-4 shadow-xl flex flex-col h-full max-h-[560px]">
            <h2 className="text-xl font-black text-white mb-4 border-b-4 border-cobble-700 pb-2 flex items-center">
              <HistoryIcon className="w-5 h-5 mr-2 text-yellow-400" /> Últimos Ganhadores
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
               {history.slice(0, 20).map(h => (
                  <div 
                    key={h.id} 
                    onClick={() => viewHistoryResults(h)}
                    className="bg-cobble-900 border-2 border-cobble-700 p-2.5 hover:border-cobble-500 hover:bg-cobble-800 transition-colors cursor-pointer group shadow-sm"
                    title="Clique para ver este resultado!"
                  >
                     <div className="text-slate-200 group-hover:text-yellow-400 text-xs mb-1 font-bold tracking-wider transition-colors flex items-center justify-between">
                       <span>{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       <span className="text-[10px] text-cobble-400">{h.pokemons.length} Pokémon{h.pokemons.length > 1 ? 's' : ''}</span>
                     </div>
                     {h.participants && h.participants.length > 0 && (
                       <div className="text-yellow-400 text-xs mb-2 font-bold truncate flex items-center gap-1">
                         <span>👑</span> {h.participants.slice(0, 3).join(', ')}{h.participants.length > 3 ? ` +${h.participants.length - 3}` : ''}
                       </div>
                     )}
                     <div className="flex flex-wrap gap-1.5">
                       {h.pokemons.map((p, idx) => (
                          <div key={`${p.id}-${idx}`} className="relative">
                            <img 
                              src={p.sprites.front_default} 
                              className="w-10 h-10 bg-cobble-800 border-2 border-cobble-700 object-contain p-0.5 group-hover:border-yellow-500/70 transition-colors" 
                              alt={p.name} 
                            />
                          </div>
                       ))}
                     </div>
                  </div>
               ))}
               {history.length === 0 && (
                 <div className="text-cobble-400 text-center mt-12 text-sm italic font-medium">Nenhum sorteio ainda.</div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DRAMATIC STARTERS ROULETTE OVERLAY (CS:GO / CASINO STYLE) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isSpinningStarter && activeSpinWinnerDef && (
          <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/95 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start custom-scrollbar">
            {/* Top Close Bar */}
            <div className="w-full max-w-5xl flex justify-end shrink-0 mb-1 z-20">
              <button
                onClick={handleCloseRoulette}
                className="p-1.5 text-cobble-400 hover:text-white hover:bg-cobble-800 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl my-auto flex flex-col items-center pb-6"
            >
              {/* Header Box */}
              <div className="text-center mb-3 sm:mb-4 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-black text-xs uppercase tracking-wider shadow">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>27 Iniciais • Sem Repetição</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  {activeSpinFinished ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 animate-pulse">
                      🎉 TEMOS UM VENCEDOR! 🎉
                    </span>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-cobble-300">
                      ROLETA DOS INICIAIS
                    </span>
                  )}
                </h2>

                <div className="text-sm sm:text-base font-bold text-yellow-400 flex items-center justify-center gap-2">
                  <span className="text-cobble-300">Sorteando inicial para:</span>
                  <span className="px-2.5 py-0.5 bg-yellow-500 text-cobble-950 font-black rounded-lg shadow-md flex items-center gap-1.5 text-xs sm:text-sm">
                    <Crown className="w-3.5 h-3.5 text-cobble-950" />
                    {activeSpinTrainer}
                  </span>
                </div>
              </div>

              {/* The Big Roulette */}
              <div className="w-full shadow-2xl relative">
                <StartersRoulette
                  isSpinning={isSpinningStarter}
                  winner={activeSpinWinnerDef}
                  availableStarters={STARTER_POKEMON_DEFS.filter(s => !claimedStarters[s.id])}
                  onSpinComplete={handleStartersRouletteComplete}
                  className="w-full"
                />
              </div>

              {/* Tension / Status Subtitle OR Winner Showcase */}
              <div className="mt-5 text-center flex flex-col items-center w-full">
                {activeSpinFinished ? (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="w-full max-w-xl bg-cobble-900 border-4 border-yellow-400 rounded-2xl p-5 shadow-[0_0_50px_rgba(250,204,21,0.4)] flex flex-col items-center relative overflow-hidden"
                  >
                    {/* Radial gold glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent pointer-events-none" />

                    {/* Top Tag */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500 text-cobble-950 font-black text-xs uppercase tracking-wider rounded-full mb-3 shadow">
                      <span>👑</span> INICIAL SORTEADO COM SUCESSO!
                    </div>

                    {/* Big Sprite with glowing aura */}
                    <div className="relative mb-2 flex items-center justify-center">
                      <div className="absolute w-28 h-28 rounded-full bg-yellow-400/25 blur-xl animate-pulse" />
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${activeSpinWinnerDef.id}.png`}
                        alt={activeSpinWinnerDef.name}
                        className="w-28 h-28 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] relative z-10 animate-bounce"
                        style={{ animationDuration: '2.5s' }}
                      />
                    </div>

                    {/* Pokémon Name & Type */}
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-wide uppercase drop-shadow-md">
                      {activeSpinWinnerDef.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1.5 mb-3 flex-wrap justify-center">
                      <span className={cn(
                        "px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border shadow-sm",
                        activeSpinWinnerDef.type === 'fire' ? "bg-orange-950/90 text-orange-300 border-orange-500" :
                        activeSpinWinnerDef.type === 'water' ? "bg-cyan-950/90 text-cyan-300 border-cyan-500" :
                        "bg-emerald-950/90 text-emerald-300 border-emerald-500"
                      )}>
                        {activeSpinWinnerDef.type === 'fire' ? '🔥 Tipo Fogo' : activeSpinWinnerDef.type === 'water' ? '💧 Tipo Água' : '🌿 Tipo Planta'}
                      </span>
                      <span className="text-xs text-yellow-300 font-black bg-black/60 px-2.5 py-1 rounded-md border border-cobble-700">
                        #{String(activeSpinWinnerDef.id).padStart(3, '0')} • {activeSpinWinnerDef.generationName}
                      </span>
                    </div>

                    {/* Recipient Trainer Banner */}
                    <div className="w-full bg-yellow-500/15 border-2 border-yellow-500/50 rounded-xl p-3 mb-4 text-sm font-bold text-yellow-300 flex items-center justify-center gap-2">
                      <span className="text-lg">🎉</span>
                      <span>
                        Escolhido para: <span className="text-white font-black text-base uppercase underline decoration-yellow-400 decoration-2">{activeSpinTrainer}</span>!
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
                      <Button
                        onClick={handleOpenWinnerDetails}
                        className="flex-1 min-w-[200px] !bg-emerald-600 hover:!bg-emerald-500 text-white font-black text-sm py-2.5 border-2 border-emerald-700 shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4 text-emerald-200" />
                        Ver Detalhes
                      </Button>

                      <Button
                        onClick={handleOpenLotteryCard}
                        variant="secondary"
                        className="font-bold text-xs py-2.5 px-3 border border-cobble-600 hover:bg-cobble-700 text-yellow-300 cursor-pointer flex items-center gap-1.5 shadow"
                        title="Ver card do sorteio com opções de exportar imagem e texto para o Discord"
                      >
                        <Share2 className="w-3.5 h-3.5 text-yellow-400" />
                        Card Discord
                      </Button>

                      {participants.length > 1 && participants.some(p => !Object.values(claimedStarters).includes(p)) && (() => {
                        const nextPending = participants.find(p => !Object.values(claimedStarters).includes(p));
                        return (
                          <Button
                            onClick={handleNextStarterSpin}
                            className="flex-1 min-w-[200px] !bg-blue-600 hover:!bg-blue-500 text-white font-black text-sm py-2.5 border-2 border-blue-700 shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Girar p/ {nextPending ? nextPending : 'Próximo'}
                          </Button>
                        );
                      })()}

                      <Button
                        onClick={handleCloseRoulette}
                        variant="secondary"
                        className="font-bold text-xs py-2.5 px-4 border border-cobble-600 hover:bg-cobble-700 text-cobble-300 cursor-pointer"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Fechar
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base text-yellow-300 font-bold tracking-wide animate-pulse">
                      👀 Acompanhe a agulha central desacelerando entre os Pokémon...
                    </p>
                    <p className="text-xs text-cobble-400">
                      Todos os participantes podem ver quais iniciais estão passando pela mira!
                    </p>
                  </div>
                )}

                {!activeSpinFinished && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        handleStartersRouletteComplete();
                      }}
                      className="text-xs text-cobble-400 hover:text-white transition-colors underline cursor-pointer"
                    >
                      Pular animação
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESULTS MODAL OVERLAY */}
      <AnimatePresence>
        {!isDrawing && !isSpinningStarter && results.length > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-cobble-900 border-4 md:border-[6px] border-cobble-700 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative rounded-2xl overflow-hidden"
            >
              {/* FIXED MODAL HEADER */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-cobble-800 border-b-4 border-cobble-700 shrink-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xl">🎉</span>
                  <h3 className="text-lg md:text-xl font-black text-white tracking-wide">
                    Resultado do Sorteio
                  </h3>
                  {(() => {
                    const uniqueTrainers = Array.from(new Set(currentSessionParticipants.filter(Boolean)));
                    if (uniqueTrainers.length === 0) return null;
                    const label = uniqueTrainers.length === 1 ? uniqueTrainers[0] : uniqueTrainers.join(', ');
                    return (
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 font-black px-2.5 py-1 border border-yellow-500/40 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Crown className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Treinador: {label}</span>
                      </span>
                    );
                  })()}
                  <span className="text-xs bg-cobble-900 text-cobble-300 font-bold px-2 py-0.5 border border-cobble-700 rounded-full">
                    {results.length} Pokémon{results.length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => setResults([])}
                  className="text-cobble-400 hover:text-white hover:bg-cobble-700/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SCROLLABLE CARDS BODY */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <div className={cn(
                  "grid gap-3 md:gap-4 justify-center mx-auto",
                  results.length === 1 ? "grid-cols-1 max-w-xs" : 
                  results.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-xl" :
                  results.length === 3 ? "grid-cols-1 sm:grid-cols-3 max-w-4xl" :
                  results.length === 4 ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 max-w-5xl" :
                  "grid-cols-2 sm:grid-cols-3 md:grid-cols-6 max-w-6xl"
                )}>
                  {results.map((p, idx) => {
                    const owner = currentSessionParticipants[idx] || (participants.length === 1 ? participants[0] : undefined);
                    return (
                      <div key={`${p.id}-${idx}`} className="transform transition-transform hover:scale-[1.02]">
                        <CardReveal 
                          pokemon={p} 
                          idx={idx} 
                          compact={results.length >= 3}
                          participant={owner}
                          availableParticipants={participants}
                          onSelectParticipant={(newOwner) => {
                            const updated = [...currentSessionParticipants];
                            updated[idx] = newOwner;
                            setCurrentSessionParticipants(updated);
                            // Also update claimed starters if in starter draft
                            if (lotteryTab === 'starters') {
                              setClaimedStarters(prev => ({ ...prev, [p.id]: newOwner }));
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FIXED MODAL FOOTER */}
              <div className="shrink-0 bg-cobble-950/90 border-t-4 border-cobble-700 p-3 md:p-4 flex flex-col items-center gap-2">
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 w-full">
                  
                  {/* 1. Discord Text Share */}
                  <Button 
                    onClick={handleCopyDiscord} 
                    size="sm" 
                    className={cn(
                      "font-bold border-2 text-xs md:text-sm py-2 px-3 md:px-4 text-white shadow-md transition-all active:scale-95",
                      copiedDiscord ? "!bg-green-600 hover:!bg-green-500 !border-green-800" : "!bg-[#5865F2] hover:!bg-[#4752C4] !border-[#3c45a5]"
                    )}
                    title="Copia o texto formatado em Markdown para colar no chat do Discord"
                  >
                    {copiedDiscord ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-green-200" /> 1. Texto Copiado!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-1.5" /> 1. Copiar Texto Discord
                      </>
                    )}
                  </Button>

                  {/* 2. Discord Image Card Share */}
                  <Button 
                    onClick={handleCopyImageDiscord} 
                    disabled={isGeneratingImage}
                    size="sm" 
                    className={cn(
                      "font-bold border-2 text-xs md:text-sm py-2 px-3 md:px-4 text-white shadow-md transition-all active:scale-95",
                      copiedImage ? "!bg-green-600 hover:!bg-green-500 !border-green-800" : "!bg-emerald-600 hover:!bg-emerald-500 !border-emerald-800"
                    )}
                    title="Copia a imagem do card para colar no Discord (Ctrl+V) ou baixar"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1.5 animate-spin text-white" /> Gerando Imagem...
                      </>
                    ) : copiedImage ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-green-200" /> 2. Imagem Copiada!
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-1.5" /> 2. Copiar Card Imagem
                      </>
                    )}
                  </Button>

                  {/* 3. Re-spin */}
                  <Button 
                    onClick={() => { 
                      setResults([]); 
                      if (lastDrawConfig) {
                        handleDraw(lastDrawConfig.qty, lastDrawConfig.filters);
                      } else {
                        handleDraw();
                      }
                    }} 
                    size="sm" 
                    className="font-bold border-2 !bg-blue-600 hover:!bg-blue-500 !border-blue-800 text-xs md:text-sm py-2 px-3 md:px-4"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" /> Girar de Novo
                  </Button>

                  {/* 4. Close Modal */}
                  <Button 
                    onClick={() => { setResults([]); }} 
                    size="sm" 
                    variant="secondary"
                    className="font-bold border-2 text-xs md:text-sm py-2 px-3 md:px-4 hover:bg-cobble-600"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Fechar
                  </Button>
                </div>

                {/* Subtitle / Tip on sending together in Discord */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STYLIZED RESET STARTERS CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetStartersConfirm && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-cobble-900 border-4 border-red-500 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.4)] relative overflow-hidden text-center"
            >
              {/* Top gradient accent line */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

              {/* Warning Icon with red glow aura */}
              <div className="relative mb-3 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center shadow-inner">
                  <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-1.5">
                Reiniciar Pool dos Iniciais?
              </h3>

              {/* Subtitle / Explanation */}
              <p className="text-cobble-300 text-xs sm:text-sm mb-4 leading-relaxed font-medium">
                Tem certeza que deseja zerar o sorteio dos 27 iniciais? Todos os Pokémon sorteados voltarão a ficar disponíveis no pote para novos sorteios.
              </p>

              {/* Stat box */}
              {Object.keys(claimedStarters).length > 0 && (
                <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-2.5 mb-5 text-xs text-red-300 font-bold flex items-center justify-center gap-2">
                  <span>⚠️</span>
                  <span>
                    <strong className="text-white font-black">{Object.keys(claimedStarters).length}</strong> inicial(is) sorteado(s) voltarão ao pote!
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => setShowResetStartersConfirm(false)}
                  variant="secondary"
                  className="flex-1 py-3 font-bold text-xs sm:text-sm border border-cobble-600 hover:bg-cobble-700 text-cobble-200 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmResetStarters}
                  className="flex-1 py-3 font-black text-xs sm:text-sm !bg-gradient-to-r !from-red-600 !to-red-700 hover:!from-red-500 hover:!to-red-600 text-white border-2 border-red-500 shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sim, Reiniciar!
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
