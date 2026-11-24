import { useState, useMemo } from 'react';
import { PRESET_ROSTER, getRandomTeam } from '../../utils/battleEngine';
import type { BattlePokemon, BattleMove } from '../../types/battle';
import type { RosterEntry } from '../../data/battleRoster';
import { PokemonTypeBadge } from '../pokemon/PokemonTypeBadge';
import { Button } from '../ui/Button';
import {
  Dices,
  Check,
  Swords,
  User,
  ShieldAlert,
  Search,
  X,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Gauge,
  Share2,
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface TeamSelectProps {
  playerName: string;
  opponentName: string;
  opponentReady: boolean;
  onConfirmTeam: (team: BattlePokemon[]) => void;
  roomId?: string;
  isHost?: boolean;
  isBotMode?: boolean;
  onLeaveRoom?: () => void;
}

const GEN_OPTIONS = [
  { label: 'Todas', value: 0 },
  { label: 'Gen 1 (Kanto)', value: 1 },
  { label: 'Gen 2 (Johto)', value: 2 },
  { label: 'Gen 3 (Hoenn)', value: 3 },
  { label: 'Gen 4 (Sinnoh)', value: 4 },
];

export function TeamSelect({
  playerName,
  opponentName,
  opponentReady,
  onConfirmTeam,
  roomId = '',
  isHost = false,
  isBotMode = false,
  onLeaveRoom,
}: TeamSelectProps) {
  const [selectedTeam, setSelectedTeam] = useState<BattlePokemon[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGen, setSelectedGen] = useState<number>(0);
  const [inspectedPokemon, setInspectedPokemon] = useState<RosterEntry>(() => {
    const roster = PRESET_ROSTER as RosterEntry[];
    return roster[0];
  });

  const handleCopyInvite = () => {
    if (!roomId || typeof window === 'undefined') return;
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.pathname.endsWith('/arena')) {
      currentUrl.pathname = `${currentUrl.pathname.replace(/\/$/, '')}/arena`;
    }
    currentUrl.search = `?sala=${roomId}`;
    navigator.clipboard.writeText(currentUrl.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isInTeam = (pokeId: number) => {
    return selectedTeam.some((p) => p.id === pokeId);
  };

  const handleTogglePokemon = (pokemon: BattlePokemon) => {
    if (isLocked) return;
    const exists = selectedTeam.some((p) => p.id === pokemon.id);

    if (exists) {
      setSelectedTeam(selectedTeam.filter((p) => p.id !== pokemon.id));
    } else {
      if (selectedTeam.length < 4) {
        setSelectedTeam([...selectedTeam, JSON.parse(JSON.stringify(pokemon))]);
      } else {
        // Substitui o último se já tiver 4
        const updated = [...selectedTeam.slice(0, 3), JSON.parse(JSON.stringify(pokemon))];
        setSelectedTeam(updated);
      }
    }
  };

  const handleRemoveFromSlot = (index: number) => {
    if (isLocked) return;
    setSelectedTeam(selectedTeam.filter((_, idx) => idx !== index));
  };

  const handleRandomize = () => {
    if (isLocked) return;
    const team = getRandomTeam(4);
    setSelectedTeam(team);
    if (team[0]) {
      setInspectedPokemon(team[0] as RosterEntry);
    }
  };

  const handleConfirm = () => {
    if (selectedTeam.length !== 4) return;
    setIsLocked(true);
    onConfirmTeam(selectedTeam);
  };

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return (PRESET_ROSTER as RosterEntry[]).filter((p) => {
      if (selectedGen > 0 && p.gen !== selectedGen) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesType = p.types.some((t) => t.toLowerCase().includes(query));
        const matchesId = p.id.toString() === query;
        const matchesMove = p.moves.some((m) => m.name.toLowerCase().includes(query));
        return matchesName || matchesType || matchesId || matchesMove;
      }
      return true;
    });
  }, [searchQuery, selectedGen]);

  const inspectedInTeam = isInTeam(inspectedPokemon.id);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Top Header: VS Bar & Opponent Status */}
      <div className="bg-cobble-850/90 border border-cobble-700/80 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-black">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-cobble-400 uppercase font-bold tracking-wider">Você</div>
            <div className="text-sm font-black text-white">{playerName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {opponentReady ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{opponentName || 'Oponente'} confirmou!</span>
            </div>
          ) : opponentName ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cobble-900 border border-cobble-700 text-cobble-300 text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
              <span>{opponentName} escolhendo time...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Aguardando adversário entrar...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isBotMode && onLeaveRoom && (
            <Button
              onClick={onLeaveRoom}
              variant="secondary"
              className="text-xs font-bold py-1 px-2.5 border-cobble-700 bg-cobble-800 hover:bg-red-950/50 text-cobble-300 hover:text-red-300 flex items-center gap-1 rounded-xl"
              title="Voltar ao saguão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          )}
          <div className="text-right">
            <div className="text-[10px] text-cobble-400 uppercase font-bold tracking-wider">Rival</div>
            <div className="text-sm font-black text-white">{opponentName || 'Aguardando...'}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 font-black">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Multiplayer Room Link & Code Banner (Shown in 1v1 multiplayer) */}
      {!isBotMode && roomId && (
        <div className="bg-gradient-to-r from-cobble-900 via-cobble-850 to-cobble-900 border border-cobble-700 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-cobble-400 font-bold uppercase tracking-wider">
              {isHost ? 'Sua Sala 1v1:' : 'Conectado na Sala:'}
            </span>
            <span className="text-sm font-black text-yellow-400 font-mono tracking-widest px-2.5 py-0.5 bg-cobble-950 rounded-lg border border-cobble-700 shadow-inner">
              {roomId}
            </span>
            <span className="text-xs text-cobble-400 hidden sm:inline">
              (Monte sua equipe enquanto o rival se conecta!)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopyInvite}
              variant="secondary"
              className="text-xs font-bold py-1.5 px-3 border-cobble-600 bg-cobble-800 hover:bg-cobble-700 text-white flex items-center gap-1.5 rounded-xl shadow"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Copiar Link de Convite</span>
                </>
              )}
            </Button>

            {onLeaveRoom && (
              <Button
                onClick={onLeaveRoom}
                variant="secondary"
                className="text-xs font-bold py-1.5 px-3 border-red-500/30 bg-red-950/40 hover:bg-red-900/60 text-red-300 flex items-center gap-1.5 rounded-xl transition-colors shadow"
                title="Sair da sala e voltar ao saguão"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Sala</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Selected Team Bar (Compact & Prominent) */}
      <div className="bg-cobble-900/90 border border-cobble-700/90 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-yellow-400" />
              Seu Time de Duelo
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">
              {selectedTeam.length}/4 Pokémon
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRandomize}
              disabled={isLocked}
              variant="secondary"
              className="border-cobble-700 bg-cobble-800 hover:bg-cobble-700 text-cobble-200 hover:text-white text-xs font-bold flex items-center gap-1.5 px-3 py-1.5"
            >
              <Dices className="w-4 h-4 text-yellow-400" />
              Sortear
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={selectedTeam.length !== 4 || isLocked}
              className={cn(
                'font-black text-xs sm:text-sm flex items-center gap-2 px-5 py-2',
                isLocked
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-600/30'
              )}
            >
              {isLocked ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  Pronto!
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  Confirmar Time
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 4 Selected Team Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map((slotIdx) => {
            const poke = selectedTeam[slotIdx];
            const isInspected = poke && inspectedPokemon.id === poke.id;

            return (
              <div
                key={slotIdx}
                onClick={() => poke && setInspectedPokemon(poke as RosterEntry)}
                className={cn(
                  'h-20 rounded-xl border p-2 flex items-center gap-2.5 relative transition-all duration-200 cursor-pointer',
                  poke
                    ? isInspected
                      ? 'bg-yellow-500/15 border-yellow-400 ring-2 ring-yellow-400/30 shadow-md'
                      : 'bg-cobble-800/80 border-cobble-600 hover:border-yellow-500/60'
                    : 'bg-cobble-950/40 border-dashed border-cobble-700/60 flex items-center justify-center text-cobble-500 cursor-default'
                )}
              >
                {poke ? (
                  <>
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-cobble-900/90 rounded-lg p-0.5 border border-cobble-700/40">
                      <img
                        src={poke.sprites.showdownFront || poke.sprites.front}
                        alt={poke.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-yellow-500 font-mono font-bold">#{poke.id}</span>
                        {!isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromSlot(slotIdx);
                            }}
                            className="text-cobble-400 hover:text-red-400 p-0.5 transition-colors"
                            title="Remover do time"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-white truncate capitalize">{poke.name}</h4>
                      <div className="flex gap-1 mt-0.5">
                        {poke.types.map((t) => (
                          <PokemonTypeBadge key={t} type={t} className="text-[8px] px-1 py-0" />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-bold text-cobble-500 uppercase tracking-wider">+ Slot Vazio</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Catalog (Left) + Sticky Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Search, Generation Tabs & Scrollable Catalog */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Controls Bar */}
          <div className="bg-cobble-900/80 border border-cobble-700/80 rounded-2xl p-3 backdrop-blur-sm space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cobble-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome, tipo (dragon, fire) ou golpe (earthquake)..."
                  className="w-full bg-cobble-950 border border-cobble-700 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-cobble-500 focus:outline-none focus:border-yellow-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cobble-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Roster Counter */}
              <div className="text-[11px] text-cobble-400 font-mono hidden sm:flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>
                  <strong className="text-white">{filteredRoster.length}</strong> de {PRESET_ROSTER.length} Pokémon
                </span>
              </div>
            </div>

            {/* Gen Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {GEN_OPTIONS.map((gen) => (
                <button
                  key={gen.value}
                  onClick={() => setSelectedGen(gen.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    selectedGen === gen.value
                      ? 'bg-yellow-500 text-cobble-950 shadow font-black'
                      : 'bg-cobble-800/80 text-cobble-300 hover:bg-cobble-700 hover:text-white border border-cobble-700/60'
                  )}
                >
                  {gen.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Pokémon Grid */}
          <div className="bg-cobble-900/60 border border-cobble-700/80 rounded-2xl p-3">
            <div className="max-h-[540px] overflow-y-auto pr-1.5 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredRoster.map((poke) => {
                  const inTeam = isInTeam(poke.id);
                  const isCurrent = inspectedPokemon.id === poke.id;

                  return (
                    <div
                      key={poke.id}
                      onClick={() => setInspectedPokemon(poke)}
                      className={cn(
                        'group text-left p-2.5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between cursor-pointer select-none',
                        isCurrent
                          ? 'bg-yellow-500/15 border-yellow-400 ring-2 ring-yellow-400/40 shadow-lg'
                          : inTeam
                          ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                          : 'bg-cobble-800/60 border-cobble-700/70 hover:border-cobble-500 hover:bg-cobble-700/70'
                      )}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] text-cobble-400 font-mono font-bold">#{poke.id}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cobble-950 text-cobble-400 font-mono">
                            G{poke.gen}
                          </span>
                          {inTeam && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-cobble-950 flex items-center justify-center font-black">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sprite */}
                      <div className="w-full h-16 flex items-center justify-center my-1">
                        <img
                          src={poke.sprites.front}
                          alt={poke.name}
                          className="max-h-full max-w-full object-contain transition-transform group-hover:scale-110 filter drop-shadow"
                          loading="lazy"
                        />
                      </div>

                      {/* Info & Types */}
                      <div>
                        <div className="text-xs font-black text-white truncate capitalize">{poke.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {poke.types.map((t) => (
                            <PokemonTypeBadge key={t} type={t} className="text-[8px] px-1 py-0" />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredRoster.length === 0 && (
                <div className="text-center py-16 text-cobble-400 text-xs font-mono">
                  Nenhum Pokémon encontrado para "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Inspector Panel (Instant Moveset & Stats without scrolling!) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-4">
          <div className="bg-cobble-900/95 border border-cobble-700 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-4">
            {/* Header: Sprite & Basic Info */}
            <div className="relative bg-gradient-to-b from-cobble-800/80 to-cobble-900/90 border border-cobble-700/60 rounded-xl p-3 flex flex-col items-center justify-center text-center overflow-hidden">
              {/* Radial glow */}
              <div className="absolute w-32 h-32 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="w-full flex items-center justify-between text-xs font-mono text-cobble-400 mb-1">
                <span>#{inspectedPokemon.id}</span>
                <span className="px-2 py-0.5 rounded bg-cobble-800 text-cobble-300 font-bold">
                  Gen {inspectedPokemon.gen}
                </span>
              </div>

              <div className="w-28 h-28 flex items-center justify-center relative z-10 my-1">
                <img
                  src={
                    inspectedPokemon.sprites.showdownFront ||
                    inspectedPokemon.sprites.front
                  }
                  alt={inspectedPokemon.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-lg"
                />
              </div>

              <h3 className="text-lg font-black text-white capitalize">{inspectedPokemon.name}</h3>

              <div className="flex gap-1.5 mt-1.5">
                {inspectedPokemon.types.map((t) => (
                  <PokemonTypeBadge key={t} type={t} className="text-[10px] px-2 py-0.5" />
                ))}
              </div>

              {/* Action Button: Add or Remove from Team */}
              <div className="w-full mt-3">
                {inspectedInTeam ? (
                  <Button
                    onClick={() => handleTogglePokemon(inspectedPokemon)}
                    disabled={isLocked || selectedTeam.length <= 1}
                    variant="danger"
                    className="w-full text-xs font-black py-2 flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover do Time
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleTogglePokemon(inspectedPokemon)}
                    disabled={isLocked}
                    className="w-full text-xs font-black py-2 flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-cobble-950 font-black shadow-md"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    {selectedTeam.length >= 4 ? 'Substituir no Time (4/4)' : 'Adicionar ao Time'}
                  </Button>
                )}
              </div>
            </div>

            {/* Competitive Moves Section (Always clearly visible!) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Moveset (4 Golpes Oficiais)
                </h4>
                <span className="text-[10px] text-cobble-400 font-mono">Nv. 50</span>
              </div>

              <div className="space-y-1.5">
                {inspectedPokemon.moves.map((move: BattleMove) => {
                  const isPhysical = move.damageClass === 'physical';
                  const isSpecial = move.damageClass === 'special';

                  return (
                    <div
                      key={move.id}
                      className="bg-cobble-800/90 border border-cobble-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2 hover:border-cobble-500 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-white truncate">{move.name}</span>
                          {move.priority && move.priority > 0 ? (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              +{move.priority} Prio
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-cobble-400">
                          <PokemonTypeBadge type={move.type} className="text-[8px] px-1 py-0" />
                          <span
                            className={cn(
                              'px-1 rounded font-bold uppercase text-[8px]',
                              isPhysical
                                ? 'bg-orange-500/20 text-orange-400'
                                : isSpecial
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-cobble-700 text-cobble-300'
                            )}
                          >
                            {isPhysical ? 'Físico' : isSpecial ? 'Especial' : 'Status'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-mono flex-shrink-0">
                        <div className="font-bold text-white">
                          Poder: <span className="text-yellow-400">{move.power || '-'}</span>
                        </div>
                        <div className="text-[10px] text-cobble-400">
                          Acc: {move.accuracy ? `${move.accuracy}%` : '-'} | PP: {move.pp}/{move.maxPp}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Level 50 Stats Overview */}
            <div className="space-y-2 pt-1 border-t border-cobble-700/60">
              <h4 className="text-[11px] font-black text-cobble-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                Atributos Nv. 50
              </h4>
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                <div className="bg-cobble-800/60 rounded-lg p-1.5 border border-cobble-700/40">
                  <div className="text-[9px] text-cobble-400 uppercase">HP</div>
                  <div className="text-xs font-black text-emerald-400">{inspectedPokemon.maxHp}</div>
                </div>
                <div className="bg-cobble-800/60 rounded-lg p-1.5 border border-cobble-700/40">
                  <div className="text-[9px] text-cobble-400 uppercase">Ataque</div>
                  <div className="text-xs font-black text-orange-400">{inspectedPokemon.stats.attack}</div>
                </div>
                <div className="bg-cobble-800/60 rounded-lg p-1.5 border border-cobble-700/40">
                  <div className="text-[9px] text-cobble-400 uppercase">Defesa</div>
                  <div className="text-xs font-black text-yellow-400">{inspectedPokemon.stats.defense}</div>
                </div>
                <div className="bg-cobble-800/60 rounded-lg p-1.5 border border-cobble-700/40">
                  <div className="text-[9px] text-cobble-400 uppercase">Sp. Atk</div>
                  <div className="text-xs font-black text-cyan-400">{inspectedPokemon.stats.spAttack}</div>
                </div>
                <div className="bg-cobble-800/60 rounded-lg p-1.5 border border-cobble-700/40">
                  <div className="text-[9px] text-cobble-400 uppercase">Sp. Def</div>
                  <div className="text-xs font-black text-teal-400">{inspectedPokemon.stats.spDefense}</div>
                </div>
                <div className="bg-cobble-800/60 rounded-lg p-1.5 border border-cobble-700/40">
                  <div className="text-[9px] text-cobble-400 uppercase">Speed</div>
                  <div className="text-xs font-black text-pink-400">{inspectedPokemon.stats.speed}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
