import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BattlePokemon, TurnAction, TurnLog, AttackAnimationEvent, ChatMessage } from '../../types/battle';
import { PokemonTypeBadge } from '../pokemon/PokemonTypeBadge';
import { Button } from '../ui/Button';
import { RefreshCw, Trophy, Skull, ArrowRightLeft, Swords, MessageSquare, ScrollText, Send, Flag, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { AttackVFX } from './AttackVFX';

interface BattleArenaProps {
  isHost: boolean;
  playerName: string;
  opponentName: string;
  playerTeam: BattlePokemon[];
  opponentTeam: BattlePokemon[];
  playerActiveIndex: number;
  opponentActiveIndex: number;
  logs: TurnLog[];
  isWaitingOpponent: boolean;
  isAnimating: boolean;
  isGameOver: boolean;
  winner: 'player' | 'opponent' | 'draw' | null;
  onSelectAction: (action: TurnAction) => void;
  onRematch: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentAttackEvent?: AttackAnimationEvent | null;
  attackStage?: 'idle' | 'lunge' | 'projectile' | 'impact';
  onSurrender?: () => void;
  onLeaveRoom?: () => void;
}

export function BattleArena({
  isHost,
  playerName,
  opponentName,
  playerTeam,
  opponentTeam,
  playerActiveIndex,
  opponentActiveIndex,
  logs,
  isWaitingOpponent,
  isAnimating,
  isGameOver,
  winner,
  onSelectAction,
  onRematch,
  chatMessages,
  onSendMessage,
  currentAttackEvent = null,
  attackStage = 'idle',
  onSurrender,
  onLeaveRoom,
}: BattleArenaProps) {
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'chat'>('log');
  const [inputText, setInputText] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Floating speech bubbles on the arena
  const [floatingChat, setFloatingChat] = useState<{ text: string; sender: 'player' | 'opponent' } | null>(null);

  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const activePlayerPoke = playerTeam[playerActiveIndex] || playerTeam[0];
  const activeOpponentPoke = opponentTeam[opponentActiveIndex] || opponentTeam[0];

  const isPlayerAttacker = currentAttackEvent
    ? isHost
      ? currentAttackEvent.attackerRole === 'host'
      : currentAttackEvent.attackerRole === 'guest'
    : false;

  const isOpponentAttacker = currentAttackEvent ? !isPlayerAttacker : false;

  // Auto-scroll logs INSIDE container only (does not scroll page/window)
  useEffect(() => {
    if (activeTab === 'log' && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs.length, activeTab]);

  // Handle new chat messages
  useEffect(() => {
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      setFloatingChat({
        text: lastMsg.text,
        sender: lastMsg.isMe ? 'player' : 'opponent',
      });

      const timer = setTimeout(() => {
        setFloatingChat(null);
      }, 4000);

      if (activeTab !== 'chat' && !lastMsg.isMe) {
        setUnreadChatCount((prev) => prev + 1);
      }

      if (activeTab === 'chat' && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }

      return () => clearTimeout(timer);
    }
  }, [chatMessages.length]);

  const handleTabChange = (tab: 'log' | 'chat') => {
    setActiveTab(tab);
    setTimeout(() => {
      if (tab === 'chat' && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        setUnreadChatCount(0);
      } else if (tab === 'log' && logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getHpPercent = (poke?: BattlePokemon) => {
    if (!poke || poke.maxHp <= 0 || poke.currentHp <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((poke.currentHp / poke.maxHp) * 100)));
  };

  const getHpBarColor = (percent: number) => {
    if (percent > 50) return 'bg-emerald-500';
    if (percent > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleMoveClick = (moveIndex: number) => {
    if (isWaitingOpponent || isAnimating || isGameOver) return;
    onSelectAction({ type: 'MOVE', moveIndex });
  };

  const handleSwitchClick = (newIndex: number) => {
    if (isWaitingOpponent || isAnimating || isGameOver) return;
    if (newIndex === playerActiveIndex) return;
    if (playerTeam[newIndex].fainted || playerTeam[newIndex].currentHp <= 0) return;

    setShowSwitchModal(false);
    onSelectAction({ type: 'SWITCH', pokemonIndex: newIndex });
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* LEFT COLUMN: Stadium Viewport + Attack & Switch Controls */}
        <div className="lg:col-span-8 flex flex-col space-y-2.5">
          {/* Stadium Header: Arena Badge, Surrender/Leave buttons & Opponent's Remaining Pokéballs */}
          <div className="flex items-center justify-between gap-2 bg-cobble-900/80 px-4 py-2 rounded-2xl border border-cobble-700/80 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Arena Pokémon Nv. 50
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Surrender button (only during active battle) */}
              {!isGameOver && onSurrender && (
                <button
                  onClick={() => setShowSurrenderModal(true)}
                  disabled={isWaitingOpponent || isAnimating}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 flex items-center gap-1 transition-all disabled:opacity-50"
                  title="Desistir do duelo e conceder a vitória ao rival"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desistir</span>
                </button>
              )}

              {/* Leave Room button */}
              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold text-cobble-400 hover:text-white bg-cobble-800 hover:bg-cobble-700 border border-cobble-600 flex items-center gap-1 transition-all"
                  title="Sair da sala de batalha e voltar ao saguão"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              )}

              <div className="h-4 w-px bg-cobble-700 mx-1 hidden sm:block" />

              <span className="text-xs font-bold text-cobble-300">
                {opponentName}
              </span>
              {/* Remaining pokeballs indicator */}
              <div className="flex gap-1">
                {opponentTeam.map((p, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm transition-opacity',
                      p.currentHp <= 0 ? 'bg-cobble-600 opacity-40' : 'bg-red-500'
                    )}
                    title={`${p.name} (${p.currentHp > 0 ? `${p.currentHp}/${p.maxHp} HP` : 'Nocauteado'})`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Battle Scene Stadium */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[440px] rounded-3xl overflow-hidden border-2 border-cobble-700 shadow-2xl bg-gradient-to-b from-sky-900 via-emerald-950 to-stone-900 flex flex-col justify-between p-4 sm:p-5">
            {/* Background battlefield decor */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-800/40 via-transparent to-transparent pointer-events-none" />

            {/* Dynamic Attack Animations & Projectiles */}
            <AttackVFX
              event={currentAttackEvent}
              stage={attackStage}
              isPlayerAttacker={isPlayerAttacker}
            />

            {/* Floating Comic Speech Bubble for Live Chat Messages */}
            <AnimatePresence>
              {floatingChat && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  className={cn(
                    'absolute z-40 max-w-[220px] sm:max-w-xs p-2.5 rounded-2xl shadow-2xl text-xs font-bold backdrop-blur-md border pointer-events-none',
                    floatingChat.sender === 'player'
                      ? 'bottom-28 left-6 sm:left-12 bg-blue-600/95 text-white border-blue-400 rounded-bl-none shadow-blue-500/20'
                      : 'top-24 right-6 sm:right-16 bg-cobble-900/95 text-white border-cobble-500 rounded-tr-none shadow-black/40'
                  )}
                >
                  <div className="text-[10px] uppercase font-black tracking-wider text-cobble-300 mb-0.5">
                    {floatingChat.sender === 'player' ? 'Você' : opponentName}:
                  </div>
                  <div className="break-words">{floatingChat.text}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TOP SECTION: Opponent Info Card & Sprite */}
            <div className="relative flex items-start justify-between z-10">
              {/* Opponent Info Box */}
              <div className="bg-cobble-900/90 border border-cobble-600/80 rounded-2xl p-2.5 sm:p-3.5 shadow-xl backdrop-blur-md min-w-[190px] sm:min-w-[240px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm sm:text-base font-black text-white capitalize">
                    {activeOpponentPoke?.name}
                  </span>
                  <span className="text-xs font-bold text-yellow-400 font-mono">
                    Nv. {activeOpponentPoke?.level}
                  </span>
                </div>

                <div className="flex gap-1 mb-2">
                  {activeOpponentPoke?.types.map((t) => (
                    <PokemonTypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0" />
                  ))}
                </div>

                {/* HP Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 sm:h-3 bg-cobble-950 rounded-full overflow-hidden p-0.5 border border-cobble-700">
                    <motion.div
                      className={cn('h-full rounded-full transition-colors', getHpBarColor(getHpPercent(activeOpponentPoke)))}
                      initial={{ width: '100%' }}
                      animate={{ width: `${getHpPercent(activeOpponentPoke)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-cobble-300 font-mono font-bold">
                    <span>HP</span>
                    <span>
                      {Math.max(0, activeOpponentPoke?.currentHp || 0)} / {activeOpponentPoke?.maxHp} ({getHpPercent(activeOpponentPoke)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent Pokémon Sprite */}
              <motion.div
                animate={
                  isOpponentAttacker && attackStage === 'lunge'
                    ? { x: [0, -35, 0], y: [0, 15, 0], scale: [1, 1.15, 1] }
                    : isPlayerAttacker && attackStage === 'impact'
                    ? { x: [-12, 12, -8, 8, -4, 4, 0], filter: ['brightness(2.2) contrast(1.5)', 'none'] }
                    : { y: [0, -4, 0] }
                }
                transition={{
                  duration:
                    (isOpponentAttacker && attackStage === 'lunge') || (isPlayerAttacker && attackStage === 'impact')
                      ? 0.45
                      : 2.5,
                  repeat:
                    (isOpponentAttacker && attackStage === 'lunge') || (isPlayerAttacker && attackStage === 'impact')
                      ? 0
                      : Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center mr-2 sm:mr-8"
              >
                {/* Ground shadow */}
                <div className="absolute bottom-2 w-24 h-5 bg-black/40 rounded-full blur-sm" />
                <img
                  src={
                    activeOpponentPoke?.sprites.showdownFront ||
                    activeOpponentPoke?.sprites.front ||
                    activeOpponentPoke?.sprites.artwork
                  }
                  alt={activeOpponentPoke?.name}
                  className={cn(
                    'max-h-full max-w-full object-contain relative z-10 transition-opacity duration-500',
                    activeOpponentPoke?.currentHp <= 0 ? 'opacity-0 translate-y-8' : 'opacity-100'
                  )}
                />
              </motion.div>
            </div>

            {/* BOTTOM SECTION: Player Sprite & Info Card */}
            <div className="relative flex items-end justify-between z-10 mt-auto">
              {/* Player Pokémon Sprite (Back view) */}
              <motion.div
                animate={
                  isPlayerAttacker && attackStage === 'lunge'
                    ? { x: [0, 35, 0], y: [0, -15, 0], scale: [1, 1.15, 1] }
                    : isOpponentAttacker && attackStage === 'impact'
                    ? { x: [-12, 12, -8, 8, -4, 4, 0], filter: ['brightness(2.2) contrast(1.5)', 'none'] }
                    : { y: [0, -3, 0] }
                }
                transition={{
                  duration:
                    (isPlayerAttacker && attackStage === 'lunge') || (isOpponentAttacker && attackStage === 'impact')
                      ? 0.45
                      : 2.5,
                  repeat:
                    (isPlayerAttacker && attackStage === 'lunge') || (isOpponentAttacker && attackStage === 'impact')
                      ? 0
                      : Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-36 h-36 sm:w-52 sm:h-52 flex items-center justify-center ml-1 sm:ml-6"
              >
                {/* Ground shadow */}
                <div className="absolute bottom-1 w-28 h-6 bg-black/40 rounded-full blur-sm" />
                <img
                  src={
                    activePlayerPoke?.sprites.showdownBack ||
                    activePlayerPoke?.sprites.back ||
                    activePlayerPoke?.sprites.showdownFront ||
                    activePlayerPoke?.sprites.front
                  }
                  alt={activePlayerPoke?.name}
                  className={cn(
                    'max-h-full max-w-full object-contain relative z-10 transition-opacity duration-500 scale-125 sm:scale-150 origin-bottom',
                    activePlayerPoke?.currentHp <= 0 ? 'opacity-0 translate-y-8' : 'opacity-100'
                  )}
                />
              </motion.div>

              {/* Player Info Box */}
              <div className="bg-cobble-900/90 border border-cobble-600/80 rounded-2xl p-2.5 sm:p-3.5 shadow-xl backdrop-blur-md min-w-[190px] sm:min-w-[240px]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-black text-white capitalize">
                      {activePlayerPoke?.name}
                    </span>
                    <span className="text-[10px] text-cobble-400 font-bold uppercase">
                      ({playerName})
                    </span>
                  </div>
                  <span className="text-xs font-bold text-yellow-400 font-mono">
                    Nv. {activePlayerPoke?.level}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    {activePlayerPoke?.types.map((t) => (
                      <PokemonTypeBadge key={t} type={t} className="text-[9px] px-1.5 py-0" />
                    ))}
                  </div>
                  {/* Remaining balls */}
                  <div className="flex gap-1">
                    {playerTeam.map((p, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'w-3 h-3 rounded-full border border-black/40 shadow-sm transition-opacity',
                          p.currentHp <= 0 ? 'bg-cobble-600 opacity-40' : 'bg-emerald-500'
                        )}
                        title={`${p.name} (${p.currentHp > 0 ? `${p.currentHp}/${p.maxHp} HP` : 'Nocauteado'})`}
                      />
                    ))}
                  </div>
                </div>

                {/* HP Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 sm:h-3 bg-cobble-950 rounded-full overflow-hidden p-0.5 border border-cobble-700">
                    <motion.div
                      className={cn('h-full rounded-full transition-colors', getHpBarColor(getHpPercent(activePlayerPoke)))}
                      initial={{ width: '100%' }}
                      animate={{ width: `${getHpPercent(activePlayerPoke)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-cobble-300 font-mono font-bold">
                    <span>HP</span>
                    <span>
                      {activePlayerPoke?.currentHp} / {activePlayerPoke?.maxHp} ({getHpPercent(activePlayerPoke)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Moves Selection & Switch Directly Under the Stadium */}
          <div>
            {isGameOver ? (
              <div className="p-5 bg-cobble-900/90 border border-cobble-700 rounded-2xl text-center space-y-3">
                <div className="inline-flex p-2.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  {winner === 'player' ? (
                    <Trophy className="w-7 h-7 text-yellow-400" />
                  ) : winner === 'draw' ? (
                    <Swords className="w-7 h-7 text-amber-400" />
                  ) : (
                    <Skull className="w-7 h-7 text-red-400" />
                  )}
                </div>
                <h3 className="text-xl font-black text-white">
                  {winner === 'player'
                    ? 'Vitória! Você venceu a batalha!'
                    : winner === 'draw'
                    ? 'Empate! Ambos os Pokémon caíram juntos!'
                    : 'Fim de Jogo! O rival venceu.'}
                </h3>
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  <Button
                    onClick={onRematch}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-black px-6 py-2.5 rounded-xl text-white shadow-lg text-xs"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Jogar Novamente / Revanche
                  </Button>
                  {onLeaveRoom && (
                    <Button
                      onClick={onLeaveRoom}
                      variant="secondary"
                      className="border-cobble-600 bg-cobble-800 hover:bg-cobble-700 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Sala
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {/* 4 Moves Buttons */}
                <div className="sm:col-span-3 grid grid-cols-2 gap-2">
                  {activePlayerPoke?.moves.map((move, index) => {
                    const isOutOfPp = (move.pp ?? 0) <= 0;
                    const isDisabled = isWaitingOpponent || isAnimating || activePlayerPoke.currentHp <= 0 || isOutOfPp;
                    return (
                      <button
                        key={move.id}
                        disabled={isDisabled}
                        onClick={() => handleMoveClick(index)}
                        className={cn(
                          'p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 relative overflow-hidden group',
                          isDisabled
                            ? 'bg-cobble-800/40 border-cobble-700/40 text-cobble-500 cursor-not-allowed opacity-60'
                            : 'bg-cobble-800/90 border-cobble-700 hover:border-yellow-500 hover:bg-cobble-700/80 active:scale-95 shadow-md'
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs sm:text-sm font-black text-white capitalize group-hover:text-yellow-400 transition-colors truncate pr-1">
                            {move.name}
                          </span>
                          <PokemonTypeBadge type={move.type} className="text-[9px] px-1.5 py-0 shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-cobble-300 font-mono w-full">
                          <span>Poder: {move.power || '-'}</span>
                          <span className={cn('font-bold', isOutOfPp ? 'text-red-400 font-black' : 'text-cobble-300')}>
                            PP: {move.pp}/{move.maxPp} {isOutOfPp ? '(Sem PP)' : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Switch Button */}
                <div className="flex flex-col">
                  <Button
                    variant="secondary"
                    disabled={isWaitingOpponent || isAnimating || isGameOver}
                    onClick={() => setShowSwitchModal(true)}
                    className="h-full min-h-[70px] border-cobble-700 bg-cobble-800/80 hover:bg-cobble-700 text-cobble-200 hover:text-white font-bold flex flex-col items-center justify-center p-2.5 gap-1 rounded-xl"
                  >
                    <ArrowRightLeft className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs text-center leading-tight">Trocar Pokémon</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Battle Log & Real-Time Chat */}
        <div className="lg:col-span-4 flex flex-col bg-cobble-900/90 border border-cobble-700/80 rounded-2xl shadow-xl overflow-hidden h-[460px] sm:h-[500px] lg:h-[550px] max-h-[550px] min-h-0">
          {/* Tabs Header */}
          <div className="flex items-center justify-between border-b border-cobble-700/80 bg-cobble-900/95 px-3 py-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleTabChange('log')}
                className={cn(
                  'px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5',
                  activeTab === 'log'
                    ? 'bg-cobble-800 text-yellow-400 border border-yellow-400/40 shadow'
                    : 'text-cobble-400 hover:text-white hover:bg-cobble-800/50'
                )}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>

              <button
                onClick={() => handleTabChange('chat')}
                className={cn(
                  'px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 relative',
                  activeTab === 'chat'
                    ? 'bg-cobble-800 text-yellow-400 border border-yellow-400/40 shadow'
                    : 'text-cobble-400 hover:text-white hover:bg-cobble-800/50'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
                {unreadChatCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-black animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            </div>

            <div className="text-[10px] text-cobble-400 font-mono">
              {activeTab === 'log' ? `${logs.length} eventos` : `${chatMessages.length} msgs`}
            </div>
          </div>

          {/* Tab Content: Detailed Battle Log */}
          {activeTab === 'log' && (
            <div
              ref={logContainerRef}
              className="flex-1 min-h-0 bg-cobble-950/90 p-3 overflow-y-auto font-mono text-xs shadow-inner space-y-1.5 custom-scrollbar"
            >
              {logs.map((item) => {
                if (item.variant === 'turn') {
                  return (
                    <div
                      key={item.id}
                      className="text-center font-black text-yellow-400 py-1 my-1 border-y border-cobble-800/80 text-[11px] tracking-widest bg-cobble-900/50 rounded"
                    >
                      {item.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'py-0.5 leading-relaxed flex items-start gap-1.5',
                      item.variant === 'damage' && 'text-red-400 font-bold',
                      item.variant === 'effective' && 'text-amber-400 font-bold',
                      item.variant === 'faint' && 'text-purple-400 font-black',
                      item.variant === 'switch' && 'text-cyan-400 font-semibold',
                      (!item.variant || item.variant === 'normal') && 'text-cobble-200'
                    )}
                  >
                    <span className="text-cobble-600 select-none">›</span>
                    <span className="flex-1">{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content: Real-Time Chat Feed & Input */}
          {activeTab === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col bg-cobble-950/90">
              {/* Chat Messages Feed */}
              <div
                ref={chatContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 custom-scrollbar"
              >
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-cobble-500 text-xs italic">
                    Nenhuma mensagem enviada ainda. Digite algo abaixo para conversar com o oponente!
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col',
                        msg.isMe ? 'items-end' : 'items-start'
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-[9px] text-cobble-400 mb-0.5 px-1 font-mono">
                        <span className="font-bold text-cobble-300">{msg.sender}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={cn(
                          'px-3 py-1.5 rounded-2xl text-xs max-w-[85%] break-words shadow',
                          msg.isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-cobble-800 text-cobble-100 border border-cobble-700 rounded-bl-none'
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendChat}
                className="flex items-center gap-2 p-2.5 bg-cobble-900/95 border-t border-cobble-700/80 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite no chat..."
                  className="flex-1 bg-cobble-950 border border-cobble-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-cobble-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  maxLength={120}
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-yellow-500 hover:bg-yellow-400 text-cobble-950 font-black text-xs px-3 py-1.5 flex items-center gap-1 rounded-xl shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Switch Pokémon Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cobble-900 border border-cobble-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-yellow-400" />
                Escolha o Pokémon para Troca
              </h4>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-cobble-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-2">
              {playerTeam.map((poke, index) => {
                const isActive = index === playerActiveIndex;
                const isFainted = poke.fainted || poke.currentHp <= 0;
                return (
                  <button
                    key={poke.id}
                    disabled={isActive || isFainted}
                    onClick={() => handleSwitchClick(index)}
                    className={cn(
                      'w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all',
                      isActive
                        ? 'border-yellow-500 bg-yellow-500/10 cursor-default'
                        : isFainted
                        ? 'border-cobble-800 bg-cobble-950/40 opacity-40 cursor-not-allowed'
                        : 'border-cobble-700 bg-cobble-800/80 hover:border-cobble-500 hover:bg-cobble-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={poke.sprites.front}
                        alt={poke.name}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <div className="text-xs font-black text-white capitalize">{poke.name}</div>
                        <div className="text-[10px] text-cobble-400 font-mono">
                          HP: {poke.currentHp}/{poke.maxHp}
                        </div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">
                        Ativo
                      </span>
                    ) : isFainted ? (
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                        Desmaiado
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-cobble-400">Trocar</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Surrender Confirmation Modal */}
      {showSurrenderModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cobble-900 border border-cobble-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="inline-flex p-3 rounded-full bg-red-500/20 text-red-400">
              <Flag className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-black text-white mb-1">Desistir do Duelo?</h4>
              <p className="text-xs text-cobble-400">
                Ao desistir, a vitória será concedida imediatamente ao seu adversário. Deseja continuar?
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowSurrenderModal(false)}
                className="flex-1 bg-cobble-800 hover:bg-cobble-700 border-cobble-700 text-xs font-bold py-2 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowSurrenderModal(false);
                  onSurrender?.();
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black py-2 rounded-xl shadow-lg shadow-red-600/30"
              >
                Sim, Desistir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
