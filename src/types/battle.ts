export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'steel' | 'dark' | 'fairy';

export interface BattleMove {
  id: string;
  name: string;
  namePt: string;
  type: PokemonType;
  power: number;
  accuracy: number;
  damageClass: 'physical' | 'special' | 'status';
  pp: number;
  maxPp: number;
  priority?: number;
  description?: string;
}

export interface BattlePokemon {
  id: number;
  name: string;
  types: PokemonType[];
  level: number;
  maxHp: number;
  currentHp: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  sprites: {
    front: string;
    back: string;
    showdownFront: string;
    showdownBack: string;
    artwork: string;
  };
  moves: BattleMove[];
  fainted: boolean;
}

export interface PlayerData {
  id: string;
  name: string;
  isHost: boolean;
  team: BattlePokemon[];
  activePokemonIndex: number;
  isReady: boolean;
}

export type BattlePhase = 
  | 'LOBBY' 
  | 'TEAM_SELECT' 
  | 'BATTLE' 
  | 'GAME_OVER'
  | 'ROOM_FULL';

export type TurnAction = 
  | { type: 'MOVE'; moveIndex: number }
  | { type: 'SWITCH'; pokemonIndex: number };

export interface TurnLog {
  id: string;
  text: string;
  variant?: 'normal' | 'damage' | 'effective' | 'faint' | 'switch' | 'turn';
  turnNumber?: number;
  attacker?: string;
  defender?: string;
  moveName?: string;
  moveType?: PokemonType;
  damage?: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  isMe: boolean;
  text: string;
  timestamp: number;
}

export interface AttackAnimationEvent {
  id: string;
  attackerRole: 'host' | 'guest';
  defenderRole: 'host' | 'guest';
  attackerName: string;
  defenderName: string;
  moveName: string;
  moveType: PokemonType;
  damageClass: 'physical' | 'special' | 'status';
  damage: number;
  effectiveness: number;
  isCrit: boolean;
}

export type PeerMessage =
  | { type: 'JOIN'; playerName: string }
  | { type: 'PLAYER_INFO'; playerName: string }
  | { type: 'SELECT_TEAM'; team: BattlePokemon[] }
  | { type: 'READY_TO_BATTLE' }
  | { type: 'SUBMIT_ACTION'; action: TurnAction }
  | { type: 'SYNC_TURN'; results: {
      actionLogs: TurnLog[];
      updatedHostTeam: BattlePokemon[];
      updatedGuestTeam: BattlePokemon[];
      hostActiveIndex: number;
      guestActiveIndex: number;
      isGameOver: boolean;
      winnerId?: 'host' | 'guest' | 'draw';
      attackEvents?: AttackAnimationEvent[];
      needsHostSwitch?: boolean;
      needsGuestSwitch?: boolean;
    }}
  | { type: 'FORCED_SWITCH'; pokemonIndex: number }
  | { type: 'REMATCH' }
  | { type: 'CHAT_MESSAGE'; text: string; sender: string; timestamp: number }
  | { type: 'SURRENDER'; playerName: string }
  | { type: 'LEAVE_ROOM'; playerName: string }
  | { type: 'ROOM_FULL' };
