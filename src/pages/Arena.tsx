import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BattleLobby } from '../components/battle/BattleLobby';
import { TeamSelect } from '../components/battle/TeamSelect';
import { BattleArena } from '../components/battle/BattleArena';
import { Button } from '../components/ui/Button';
import { Users } from 'lucide-react';
import { PeerBattleService } from '../services/peerService';
import { calculateDamage, getRandomTeam } from '../utils/battleEngine';
import type { 
  BattlePokemon, 
  BattlePhase, 
  TurnAction, 
  TurnLog, 
  PeerMessage,
  AttackAnimationEvent,
  ChatMessage
} from '../types/battle';

export default function Arena() {
  const [searchParams] = useSearchParams();
  const urlRoom = searchParams.get('sala') || '';

  // Player and opponent identity
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('pkms-battle-trainer-name') || 'Treinador';
  });
  const [opponentName, setOpponentName] = useState('');
  const [roomId, setRoomId] = useState(urlRoom);
  const [isHost, setIsHost] = useState(false);
  const [isBotMode, setIsBotMode] = useState(false);

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Game Flow
  const [phase, setPhase] = useState<BattlePhase>('LOBBY');
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<BattlePokemon[]>([]);
  const [playerActiveIndex, setPlayerActiveIndex] = useState(0);
  const [opponentActiveIndex, setOpponentActiveIndex] = useState(0);

  const [playerReady, setPlayerReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  // Turn management
  const [isWaitingOpponent, setIsWaitingOpponent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [logs, setLogs] = useState<TurnLog[]>([
    { id: '1', text: 'Bem-vindo à Arena Pokémon! Prepare seus melhores Pokémon.' }
  ]);
  const [winner, setWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);

  // Turn Count
  const [turnCount, setTurnCount] = useState(1);
  const turnCountRef = useRef(1);
  turnCountRef.current = turnCount;

  // Real-Time Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Attack VFX animations
  const [currentAttackEvent, setCurrentAttackEvent] = useState<AttackAnimationEvent | null>(null);
  const [attackStage, setAttackStage] = useState<'idle' | 'lunge' | 'projectile' | 'impact'>('idle');

  // Turn actions cache
  const playerActionRef = useRef<TurnAction | null>(null);
  const opponentActionRef = useRef<TurnAction | null>(null);
  const peerServiceRef = useRef<PeerBattleService | null>(null);

  // Synchronized refs to eliminate any stale closures across WebRTC events
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;

  const playerTeamRef = useRef(playerTeam);
  playerTeamRef.current = playerTeam;

  const opponentTeamRef = useRef(opponentTeam);
  opponentTeamRef.current = opponentTeam;

  const playerActiveIndexRef = useRef(playerActiveIndex);
  playerActiveIndexRef.current = playerActiveIndex;

  const opponentActiveIndexRef = useRef(opponentActiveIndex);
  opponentActiveIndexRef.current = opponentActiveIndex;

  const playerNameRef = useRef(playerName);
  playerNameRef.current = playerName;

  const opponentNameRef = useRef(opponentName);
  opponentNameRef.current = opponentName;

  const handlePeerMessageRef = useRef<(msg: PeerMessage) => void>(() => {});

  // Sync player name to localStorage
  useEffect(() => {
    if (playerName) {
      localStorage.setItem('pkms-battle-trainer-name', playerName);
    }
  }, [playerName]);

  // Clean up WebRTC on unmount
  useEffect(() => {
    return () => {
      peerServiceRef.current?.destroy();
    };
  }, []);

  // Initialize WebRTC service
  const initPeerService = (isHostMode: boolean, code: string) => {
    setIsConnecting(true);
    setStatusText(isHostMode ? 'Criando sala P2P...' : 'Conectando ao Host...');

    const service = new PeerBattleService({
      onOpen: () => {
        setStatusText(isHostMode ? 'Aguardando oponente entrar no link...' : 'Entrando na sala...');
      },
      onConnected: () => {
        setIsConnecting(false);
        setStatusText('Oponente conectado!');

        // Exchange player names
        service.send({
          type: 'JOIN',
          playerName: playerNameRef.current || 'Treinador'
        });

        // If player already picked and confirmed their team, send it
        if (playerTeamRef.current && playerTeamRef.current.length === 4) {
          service.send({
            type: 'SELECT_TEAM',
            team: playerTeamRef.current
          });
        }
      },
      onData: (msg: PeerMessage) => {
        handlePeerMessageRef.current(msg);
      },
      onDisconnected: () => {
        if (!isHostMode && !opponentNameRef.current) {
          setPhase('ROOM_FULL');
          setStatusText('Esta sala já está cheia (duelo 1v1 já em andamento).');
        } else {
          setStatusText('Oponente desconectou-se.');
          addLog('Oponente desconectou-se da partida.', 'faint');
        }
      },
      onError: (err: unknown) => {
        console.error('Peer error:', err);
        setIsConnecting(false);
        const peerError = err as { type?: string };
        if (peerError?.type === 'unavailable-id') {
          setStatusText('Esta sala já está aberta por outro jogador. Entre como convidado ou escolha outro código.');
        } else if (peerError?.type === 'peer-unavailable') {
          setStatusText('Sala não encontrada. Peça ao Host para criar a sala antes de você entrar.');
        } else {
          setStatusText('Erro na conexão. Verifique o código da sala.');
        }
      }
    });

    peerServiceRef.current = service;

    if (isHostMode) {
      service.createRoom(code);
    } else {
      service.joinRoom(code);
    }
  };

  const handlePeerMessage = (msg: PeerMessage) => {
    switch (msg.type) {
      case 'JOIN':
      case 'PLAYER_INFO':
        // If Host already has a confirmed opponent, reject extra joining players
        if (isHostRef.current && opponentNameRef.current && opponentNameRef.current !== msg.playerName) {
          console.warn('Rejecting extra 3rd player:', msg.playerName);
          peerServiceRef.current?.send({ type: 'ROOM_FULL' });
          return;
        }

        setOpponentName(msg.playerName);
        opponentNameRef.current = msg.playerName;
        if (msg.type === 'JOIN') {
          peerServiceRef.current?.send({
            type: 'PLAYER_INFO',
            playerName: playerNameRef.current || 'Treinador'
          });
          if (playerTeamRef.current && playerTeamRef.current.length === 4) {
            peerServiceRef.current?.send({
              type: 'SELECT_TEAM',
              team: playerTeamRef.current
            });
          }
        }
        break;

      case 'SELECT_TEAM':
        setOpponentTeam(msg.team);
        opponentTeamRef.current = msg.team;
        break;

      case 'READY_TO_BATTLE':
        setOpponentReady(true);
        break;

      case 'SUBMIT_ACTION':
        opponentActionRef.current = msg.action;
        // If Host, evaluate turn when both inputs are received
        if (isHostRef.current) {
          checkAndResolveTurn();
        }
        break;

      case 'SYNC_TURN':
        applyTurnSync(msg.results);
        break;

      case 'CHAT_MESSAGE':
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: msg.sender,
            isMe: false,
            text: msg.text,
            timestamp: msg.timestamp || Date.now()
          }
        ]);
        break;

      case 'SURRENDER':
        addLog(`${msg.playerName || 'Oponente'} desistiu da batalha! Você venceu!`, 'effective');
        setWinner('player');
        setPhase('GAME_OVER');
        setIsWaitingOpponent(false);
        setIsAnimating(false);
        break;

      case 'LEAVE_ROOM':
        addLog(`${msg.playerName || 'Oponente'} saiu da sala.`, 'faint');
        if (phase === 'BATTLE') {
          setWinner('player');
          setPhase('GAME_OVER');
          setIsWaitingOpponent(false);
          setIsAnimating(false);
        } else {
          setOpponentName('');
          setOpponentReady(false);
          setOpponentTeam([]);
        }
        break;

      case 'ROOM_FULL':
        setPhase('ROOM_FULL');
        setStatusText('Esta sala já está cheia (duelo 1v1 já em andamento com 2 jogadores).');
        addLog('Esta sala já está cheia com 2 jogadores!', 'faint');
        break;

      case 'REMATCH':
        resetMatch();
        break;
    }
  };

  handlePeerMessageRef.current = handlePeerMessage;

  const addLog = (text: string, variant: TurnLog['variant'] = 'normal') => {
    setLogs((prev) => [...prev, { id: Math.random().toString(), text, variant }]);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: playerNameRef.current,
      isMe: true,
      text: text.trim(),
      timestamp: Date.now()
    };

    setChatMessages((prev) => [...prev, newMsg]);

    if (!isBotMode) {
      peerServiceRef.current?.send({
        type: 'CHAT_MESSAGE',
        text: newMsg.text,
        sender: newMsg.sender,
        timestamp: newMsg.timestamp
      });
    } else {
      triggerBotChatResponse();
    }
  };

  const triggerBotChatResponse = () => {
    const BOT_REPLIES = [
      'Boa jogada! Mas ainda estou na luta.',
      'Belo ataque! Vamos ver se aguenta o próximo.',
      'Você é bom, mas meu time foi preparado para o competitivo!',
      'Essa batalha está incrível! 🔥',
      'Não cante vitória antes da hora!',
      'Vou virar esse jogo!'
    ];
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'Treinador Azul (I.A.)',
          isMe: false,
          text: reply,
          timestamp: Date.now()
        }
      ]);
    }, 1200 + Math.random() * 800);
  };

  // Start Room as Host
  const handleCreateRoom = (code: string) => {
    setRoomId(code);
    setIsHost(true);
    isHostRef.current = true;
    setIsBotMode(false);
    setPlayerTeam([]);
    setOpponentTeam([]);
    setOpponentName('');
    setOpponentReady(false);
    setPlayerReady(false);
    setPhase('TEAM_SELECT');
    initPeerService(true, code);
  };

  // Join Room as Guest
  const handleJoinRoom = (code: string) => {
    setRoomId(code);
    setIsHost(false);
    isHostRef.current = false;
    setIsBotMode(false);
    setPlayerTeam([]);
    setOpponentTeam([]);
    setOpponentName('');
    setOpponentReady(false);
    setPlayerReady(false);
    setPhase('TEAM_SELECT');
    initPeerService(false, code);
  };

  // Bot Mode (Practice singleplayer)
  const handlePlayBot = () => {
    setIsBotMode(true);
    setIsHost(true);
    setPlayerTeam([]);
    setOpponentName('Treinador Azul (I.A.)');
    setOpponentTeam(getRandomTeam(4));
    setOpponentReady(true);
    setPlayerReady(false);
    setPlayerActiveIndex(0);
    setOpponentActiveIndex(0);
    setWinner(null);
    setIsWaitingOpponent(false);
    setIsAnimating(false);
    playerActionRef.current = null;
    opponentActionRef.current = null;
    setLogs([{ id: Math.random().toString(), text: 'Partida contra I.A. iniciada! Escolha sua equipe.' }]);
    setPhase('TEAM_SELECT');
  };

  // Confirm Team Selection
  const handleConfirmTeam = (team: BattlePokemon[]) => {
    // Ensure all pokemon in team are fully healed with max PP
    const freshTeam = team.map((p) => {
      const clone: BattlePokemon = JSON.parse(JSON.stringify(p));
      clone.currentHp = clone.maxHp;
      clone.fainted = false;
      clone.moves = clone.moves.map((m) => ({
        ...m,
        pp: m.maxPp
      }));
      return clone;
    });

    setPlayerTeam(freshTeam);
    setPlayerActiveIndex(0);
    setPlayerReady(true);

    if (isBotMode) {
      setOpponentTeam(getRandomTeam(4));
      setOpponentActiveIndex(0);
      setOpponentReady(true);
    } else {
      peerServiceRef.current?.send({
        type: 'SELECT_TEAM',
        team: freshTeam
      });
      peerServiceRef.current?.send({
        type: 'READY_TO_BATTLE'
      });
    }
  };

  // Start battle once both ready
  useEffect(() => {
    if (playerReady && (opponentReady || isBotMode)) {
      setPhase('BATTLE');
      addLog(`A batalha começou! ${playerName} vs ${opponentName}!`);
    }
  }, [playerReady, opponentReady, isBotMode]);

  // Player selected an action (Move or Switch)
  const handleSelectAction = (action: TurnAction) => {
    playerActionRef.current = action;
    setIsWaitingOpponent(true);

    if (isBotMode) {
      // Pick a move that has PP > 0
      const currentBotPoke = opponentTeamRef.current[opponentActiveIndexRef.current];
      const validMoves = (currentBotPoke?.moves || [])
        .map((m, idx) => ({ m, idx }))
        .filter((x) => (x.m.pp ?? x.m.maxPp) > 0);
      const chosenMoveIdx = validMoves.length > 0
        ? validMoves[Math.floor(Math.random() * validMoves.length)].idx
        : 0;

      opponentActionRef.current = { type: 'MOVE', moveIndex: chosenMoveIdx };
      resolveTurnLogic();
    } else {
      peerServiceRef.current?.send({
        type: 'SUBMIT_ACTION',
        action
      });

      if (isHostRef.current) {
        checkAndResolveTurn();
      }
    }
  };

  const checkAndResolveTurn = () => {
    if (playerActionRef.current && opponentActionRef.current) {
      resolveTurnLogic();
    }
  };

  // Host evaluates turn calculation
  const resolveTurnLogic = () => {
    setIsAnimating(true);
    setIsWaitingOpponent(true);

    const pAction = playerActionRef.current;
    const oAction = opponentActionRef.current;
    if (!pAction || !oAction) return;

    // Deep clone teams so we update HP, PP, and fainted status accurately
    const newHostTeam: BattlePokemon[] = JSON.parse(JSON.stringify(playerTeamRef.current));
    const newGuestTeam: BattlePokemon[] = JSON.parse(JSON.stringify(opponentTeamRef.current));

    let hostActive = playerActiveIndexRef.current;
    let guestActive = opponentActiveIndexRef.current;

    const actionLogs: TurnLog[] = [];
    const attackEvents: AttackAnimationEvent[] = [];

    const currentTurn = turnCountRef.current;
    actionLogs.push({
      id: Math.random().toString(),
      text: `TURNO ${currentTurn}`,
      variant: 'turn',
      turnNumber: currentTurn
    });
    setTurnCount((prev) => prev + 1);
    turnCountRef.current += 1;

    // 1. Handle switches first
    if (pAction.type === 'SWITCH') {
      hostActive = pAction.pokemonIndex;
      actionLogs.push({
        id: Math.random().toString(),
        text: `🔄 ${playerName} trocou para ${newHostTeam[hostActive].name}!`,
        variant: 'switch'
      });
    }

    if (oAction.type === 'SWITCH') {
      guestActive = oAction.pokemonIndex;
      actionLogs.push({
        id: Math.random().toString(),
        text: `🔄 ${opponentName} trocou para ${newGuestTeam[guestActive].name}!`,
        variant: 'switch'
      });
    }

    // Helper to perform an attack and deduct PP
    const performAttack = (
      atkTeam: BattlePokemon[],
      atkIdx: number,
      defTeam: BattlePokemon[],
      defIdx: number,
      moveIdx: number,
      atkTrainer: string,
      attackerRole: 'host' | 'guest',
      defenderRole: 'host' | 'guest'
    ) => {
      const attacker = atkTeam[atkIdx];
      const defender = defTeam[defIdx];
      if (attacker.currentHp <= 0 || defender.currentHp <= 0) return;

      const move = attacker.moves[moveIdx];
      if (!move) return;

      // Decrement PP!
      move.pp = Math.max(0, (move.pp ?? move.maxPp) - 1);

      const { damage, effectiveness, isCrit } = calculateDamage(attacker, defender, move);
      defender.currentHp = Math.max(0, defender.currentHp - damage);

      attackEvents.push({
        id: Math.random().toString(),
        attackerRole,
        defenderRole,
        attackerName: attacker.name,
        defenderName: defender.name,
        moveName: move.name,
        moveType: move.type,
        damageClass: move.damageClass,
        damage,
        effectiveness,
        isCrit
      });

      actionLogs.push({
        id: Math.random().toString(),
        text: `${attacker.name} (${atkTrainer}) usou ${move.name}!`,
        variant: 'normal'
      });

      if (effectiveness > 1) {
        actionLogs.push({ id: Math.random().toString(), text: '🔥 Foi super efetivo! (2x dano)', variant: 'effective' });
      } else if (effectiveness > 0 && effectiveness < 1) {
        actionLogs.push({ id: Math.random().toString(), text: '🛡️ Não foi muito efetivo... (0.5x dano)', variant: 'damage' });
      } else if (effectiveness === 0) {
        actionLogs.push({ id: Math.random().toString(), text: '🚫 Não teve efeito nenhum! (Imunidade)', variant: 'damage' });
      }

      if (isCrit) {
        actionLogs.push({ id: Math.random().toString(), text: '⚡ Acerto Crítico!', variant: 'effective' });
      }

      actionLogs.push({
        id: Math.random().toString(),
        text: `💥 ${defender.name} sofreu ${damage} de dano! (${defender.currentHp}/${defender.maxHp} HP restante)`,
        variant: 'damage'
      });

      if (defender.currentHp <= 0) {
        defender.fainted = true;
        defender.currentHp = 0;
        actionLogs.push({
          id: Math.random().toString(),
          text: `💀 ${defender.name} foi nocauteado!`,
          variant: 'faint'
        });
      }
    };

    // Determine priority and speed
    const pMove = pAction.type === 'MOVE' ? newHostTeam[hostActive].moves[pAction.moveIndex] : null;
    const oMove = oAction.type === 'MOVE' ? newGuestTeam[guestActive].moves[oAction.moveIndex] : null;

    const pPriority = pAction.type === 'SWITCH' ? 6 : (pMove?.priority || 0);
    const oPriority = oAction.type === 'SWITCH' ? 6 : (oMove?.priority || 0);

    const hostSpeed = newHostTeam[hostActive].stats.speed;
    const guestSpeed = newGuestTeam[guestActive].stats.speed;

    let hostFirst = true;
    if (pPriority !== oPriority) {
      hostFirst = pPriority > oPriority;
    } else if (hostSpeed !== guestSpeed) {
      hostFirst = hostSpeed > guestSpeed;
    } else {
      // Speed Tie: 50% de chance para cada lado (regra oficial de Pokémon)
      hostFirst = Math.random() < 0.5;
    }

    // Step 1: First actor attacks
    if (hostFirst && pAction.type === 'MOVE') {
      performAttack(newHostTeam, hostActive, newGuestTeam, guestActive, pAction.moveIndex, playerName, 'host', 'guest');
    } else if (!hostFirst && oAction.type === 'MOVE') {
      performAttack(newGuestTeam, guestActive, newHostTeam, hostActive, oAction.moveIndex, opponentName, 'guest', 'host');
    }

    // Step 2: Second actor attacks ONLY if it is still alive and not fainted!
    if (hostFirst && oAction.type === 'MOVE') {
      if (newGuestTeam[guestActive].currentHp > 0 && !newGuestTeam[guestActive].fainted) {
        performAttack(newGuestTeam, guestActive, newHostTeam, hostActive, oAction.moveIndex, opponentName, 'guest', 'host');
      } else if (newGuestTeam[guestActive].currentHp <= 0) {
        actionLogs.push({
          id: Math.random().toString(),
          text: `${newGuestTeam[guestActive].name} foi nocauteado antes de conseguir atacar!`,
          variant: 'faint'
        });
      }
    } else if (!hostFirst && pAction.type === 'MOVE') {
      if (newHostTeam[hostActive].currentHp > 0 && !newHostTeam[hostActive].fainted) {
        performAttack(newHostTeam, hostActive, newGuestTeam, guestActive, pAction.moveIndex, playerName, 'host', 'guest');
      } else if (newHostTeam[hostActive].currentHp <= 0) {
        actionLogs.push({
          id: Math.random().toString(),
          text: `${newHostTeam[hostActive].name} foi nocauteado antes de conseguir atacar!`,
          variant: 'faint'
        });
      }
    }

    // Check faints & Auto switch to next alive pokemon or trigger Game Over
    let gameOver = false;
    let win: 'host' | 'guest' | 'draw' | undefined;

    const guestFainted = newGuestTeam[guestActive].currentHp <= 0;
    const hostFainted = newHostTeam[hostActive].currentHp <= 0;

    let guestHasAlive = true;
    let hostHasAlive = true;

    // Check Guest team faint
    if (guestFainted) {
      newGuestTeam[guestActive].fainted = true;
      newGuestTeam[guestActive].currentHp = 0;
      const nextAliveIdx = newGuestTeam.findIndex((p) => !p.fainted && p.currentHp > 0);
      if (nextAliveIdx !== -1) {
        guestActive = nextAliveIdx;
        actionLogs.push({
          id: Math.random().toString(),
          text: `${opponentNameRef.current || opponentName} enviou ${newGuestTeam[guestActive].name}!`,
          variant: 'switch'
        });
      } else {
        guestHasAlive = false;
      }
    }

    // Check Host team faint
    if (hostFainted) {
      newHostTeam[hostActive].fainted = true;
      newHostTeam[hostActive].currentHp = 0;
      const nextAliveIdx = newHostTeam.findIndex((p) => !p.fainted && p.currentHp > 0);
      if (nextAliveIdx !== -1) {
        hostActive = nextAliveIdx;
        actionLogs.push({
          id: Math.random().toString(),
          text: `${playerNameRef.current || playerName} enviou ${newHostTeam[hostActive].name}!`,
          variant: 'switch'
        });
      } else {
        hostHasAlive = false;
      }
    }

    if (!guestHasAlive && !hostHasAlive) {
      gameOver = true;
      win = 'draw';
      actionLogs.push({
        id: Math.random().toString(),
        text: 'Todos os Pokémon de ambos os treinadores foram derrotados! Temos um empate!',
        variant: 'faint'
      });
    } else if (!guestHasAlive) {
      gameOver = true;
      win = 'host';
    } else if (!hostHasAlive) {
      gameOver = true;
      win = 'guest';
    }

    const syncPayload = {
      actionLogs,
      updatedHostTeam: newHostTeam,
      updatedGuestTeam: newGuestTeam,
      hostActiveIndex: hostActive,
      guestActiveIndex: guestActive,
      isGameOver: gameOver,
      winnerId: win,
      attackEvents
    };

    if (!isBotMode) {
      peerServiceRef.current?.send({
        type: 'SYNC_TURN',
        results: syncPayload
      });
    }

    applyTurnSync(syncPayload);
  };

  const applyTurnSync = (res: {
    actionLogs: TurnLog[];
    updatedHostTeam: BattlePokemon[];
    updatedGuestTeam: BattlePokemon[];
    hostActiveIndex: number;
    guestActiveIndex: number;
    isGameOver: boolean;
    winnerId?: 'host' | 'guest' | 'draw';
    attackEvents?: AttackAnimationEvent[];
  }) => {
    // Reset action refs
    playerActionRef.current = null;
    opponentActionRef.current = null;

    // Keep waiting state active while animating turn
    setIsAnimating(true);
    setIsWaitingOpponent(true);

    // Play logs
    setLogs((prev) => [...prev, ...res.actionLogs]);

    const events = res.attackEvents || [];

    const finalize = () => {
      const nextPlayer = isHostRef.current ? res.updatedHostTeam : res.updatedGuestTeam;
      const nextOpponent = isHostRef.current ? res.updatedGuestTeam : res.updatedHostTeam;
      const nextPlayerIdx = isHostRef.current ? res.hostActiveIndex : res.guestActiveIndex;
      const nextOpponentIdx = isHostRef.current ? res.guestActiveIndex : res.hostActiveIndex;

      setPlayerTeam(nextPlayer);
      playerTeamRef.current = nextPlayer;

      setOpponentTeam(nextOpponent);
      opponentTeamRef.current = nextOpponent;

      setPlayerActiveIndex(nextPlayerIdx);
      playerActiveIndexRef.current = nextPlayerIdx;

      setOpponentActiveIndex(nextOpponentIdx);
      opponentActiveIndexRef.current = nextOpponentIdx;

      setIsAnimating(false);
      setIsWaitingOpponent(false);

      if (res.isGameOver) {
        if (res.winnerId === 'draw') {
          setWinner('draw');
        } else {
          const won = (isHostRef.current && res.winnerId === 'host') || (!isHostRef.current && res.winnerId === 'guest');
          setWinner(won ? 'player' : 'opponent');
        }
        setPhase('GAME_OVER');
      }
    };

    if (events.length === 0) {
      setTimeout(finalize, 800);
      return;
    }

    // Step 1 VFX sequence
    const ev1 = events[0];
    setCurrentAttackEvent(ev1);
    setAttackStage('lunge');

    setTimeout(() => {
      setAttackStage('projectile');
    }, 250);

    setTimeout(() => {
      setAttackStage('impact');
    }, 700);

    setTimeout(() => {
      setAttackStage('idle');

      if (events.length > 1) {
        // Step 2 VFX sequence
        const ev2 = events[1];
        setTimeout(() => {
          setCurrentAttackEvent(ev2);
          setAttackStage('lunge');

          setTimeout(() => {
            setAttackStage('projectile');
          }, 250);

          setTimeout(() => {
            setAttackStage('impact');
          }, 700);

          setTimeout(() => {
            setAttackStage('idle');
            setCurrentAttackEvent(null);
            finalize();
          }, 1300);
        }, 150);
      } else {
        setCurrentAttackEvent(null);
        finalize();
      }
    }, 1300);
  };

  const resetMatch = () => {
    setPlayerReady(false);
    setPlayerTeam([]);
    setOpponentTeam([]);
    setPlayerActiveIndex(0);
    setOpponentActiveIndex(0);
    setWinner(null);
    setIsWaitingOpponent(false);
    setIsAnimating(false);
    playerActionRef.current = null;
    opponentActionRef.current = null;
    setTurnCount(1);
    turnCountRef.current = 1;
    setChatMessages([]);

    if (isBotMode) {
      setOpponentTeam(getRandomTeam(4));
      setOpponentReady(true);
    } else {
      setOpponentReady(false);
    }

    setLogs([{ id: Math.random().toString(), text: 'Nova partida iniciada! Escolham suas equipes.' }]);
    setPhase('TEAM_SELECT');
  };

  const handleRematch = () => {
    resetMatch();
    if (!isBotMode) {
      peerServiceRef.current?.send({ type: 'REMATCH' });
    }
  };

  // Surrender / Forfeit battle
  const handleSurrender = () => {
    if (phase !== 'BATTLE') return;

    addLog(`${playerName} desistiu da partida!`, 'faint');

    if (!isBotMode) {
      peerServiceRef.current?.send({
        type: 'SURRENDER',
        playerName: playerNameRef.current || 'Treinador'
      });
    }

    setWinner('opponent');
    setPhase('GAME_OVER');
    setIsWaitingOpponent(false);
    setIsAnimating(false);
  };

  // Leave Room & return to Lobby
  const handleLeaveRoom = () => {
    if (!isBotMode && peerServiceRef.current) {
      try {
        peerServiceRef.current.send({
          type: 'LEAVE_ROOM',
          playerName: playerNameRef.current || 'Treinador'
        });
        peerServiceRef.current.destroy();
      } catch (err) {
        console.error('Error leaving room:', err);
      }
      peerServiceRef.current = null;
    }

    setRoomId('');
    setPhase('LOBBY');
    setPlayerTeam([]);
    setOpponentTeam([]);
    setPlayerActiveIndex(0);
    setOpponentActiveIndex(0);
    setPlayerReady(false);
    setOpponentReady(false);
    setOpponentName('');
    setIsBotMode(false);
    setIsWaitingOpponent(false);
    setIsAnimating(false);
    setWinner(null);
    setChatMessages([]);
    setLogs([{ id: Math.random().toString(), text: 'Bem-vindo à Arena Pokémon! Prepare seus melhores Pokémon.' }]);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('sala');
      window.history.replaceState({}, '', url.pathname);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cobble-950 py-6">
      {phase === 'LOBBY' && (
        <BattleLobby
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomId={roomId}
          isHost={isHost}
          statusText={statusText}
          isConnecting={isConnecting}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onPlayBot={handlePlayBot}
        />
      )}

      {phase === 'TEAM_SELECT' && (
        <TeamSelect
          playerName={playerName}
          opponentName={opponentName}
          opponentReady={opponentReady || isBotMode}
          onConfirmTeam={handleConfirmTeam}
          roomId={roomId}
          isHost={isHost}
          isBotMode={isBotMode}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {(phase === 'BATTLE' || phase === 'GAME_OVER') && (
        <BattleArena
          isHost={isHost}
          playerName={playerName}
          opponentName={opponentName}
          playerTeam={playerTeam}
          opponentTeam={opponentTeam}
          playerActiveIndex={playerActiveIndex}
          opponentActiveIndex={opponentActiveIndex}
          logs={logs}
          isWaitingOpponent={isWaitingOpponent}
          isAnimating={isAnimating}
          isGameOver={phase === 'GAME_OVER'}
          winner={winner}
          onSelectAction={handleSelectAction}
          onRematch={handleRematch}
          chatMessages={chatMessages}
          onSendMessage={handleSendMessage}
          currentAttackEvent={currentAttackEvent}
          attackStage={attackStage}
          onSurrender={handleSurrender}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {phase === 'ROOM_FULL' && (
        <div className="max-w-md mx-auto px-4 py-14 text-center">
          <div className="bg-cobble-900/95 border-2 border-red-500/60 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
              <Users className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold uppercase tracking-wider border border-red-500/30">
                Capacidade Máxima Atingida
              </span>
              <h2 className="text-2xl font-black text-white">
                Esta Sala Está Cheia!
              </h2>
              <p className="text-xs sm:text-sm text-cobble-300 leading-relaxed">
                A sala <span className="font-mono text-yellow-400 font-bold bg-cobble-950 px-2 py-0.5 rounded border border-cobble-700">{roomId}</span> já possui 2 treinadores duelando no modo 1v1.
              </p>
              <p className="text-xs text-cobble-400">
                Você pode criar uma nova sala para desafiar outro amigo ou treinar contra a I.A.!
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                onClick={handleLeaveRoom}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-black py-2.5 rounded-xl text-white shadow-lg text-xs"
              >
                Voltar e Criar Minha Própria Sala
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
