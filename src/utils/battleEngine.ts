import type { BattlePokemon, BattleMove, PokemonType } from '../types/battle';
import { FULL_ROSTER, type RosterEntry } from '../data/battleRoster';

// 18 Pokemon Types Weakness / Resistance Chart
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

export function getTypeEffectiveness(moveType: PokemonType, targetTypes: PokemonType[]): number {
  let multiplier = 1;
  for (const defType of targetTypes) {
    const table = TYPE_CHART[moveType];
    if (table && table[defType] !== undefined) {
      multiplier *= table[defType]!;
    }
  }
  return multiplier;
}

export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove
): { damage: number; effectiveness: number; isCrit: boolean } {
  if (move.power <= 0 || move.damageClass === 'status') {
    return { damage: 0, effectiveness: 1, isCrit: false };
  }

  const level = attacker.level || 50;
  const isSpecial = move.damageClass === 'special';
  const atk = isSpecial ? attacker.stats.spAttack : attacker.stats.attack;
  const def = isSpecial ? defender.stats.spDefense : defender.stats.defense;

  // Base formula
  let baseDamage = Math.floor(Math.floor((Math.floor((2 * level) / 5 + 2) * move.power * atk) / def) / 50) + 2;

  // STAB (Same Type Attack Bonus)
  const isStab = attacker.types.includes(move.type);
  if (isStab) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  // Type effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  baseDamage = Math.floor(baseDamage * effectiveness);

  // Critical hit (6.25% chance)
  const isCrit = Math.random() < 0.0625;
  if (isCrit) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  // Random variance (0.85 to 1.00)
  const randomFactor = (Math.floor(Math.random() * 16) + 85) / 100;
  let finalDamage = Math.floor(baseDamage * randomFactor);

  if (effectiveness > 0 && finalDamage < 1) {
    finalDamage = 1;
  }

  return { damage: finalDamage, effectiveness, isCrit };
}

export function buildSprites(id: number) {
  return {
    front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
    showdownFront: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
    showdownBack: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`,
    artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  };
}

// Preset Roster of Balanced Ready-to-Battle Pokémon (Gen 1 to 4 fully evolved)
export const PRESET_ROSTER: RosterEntry[] = FULL_ROSTER;

export function getRandomTeam(count: number = 4): BattlePokemon[] {
  const shuffled = [...FULL_ROSTER].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  return selected.map((p) => {
    const clone: BattlePokemon = JSON.parse(JSON.stringify(p));
    clone.currentHp = clone.maxHp;
    clone.fainted = false;
    clone.moves = clone.moves.map((m) => ({
      ...m,
      pp: m.maxPp
    }));
    return clone;
  });
}
