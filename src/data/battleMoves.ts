import type { BattleMove } from '../types/battle';

export const BATTLE_MOVES: Record<string, BattleMove> = {
  // Fire
  'flamethrower': { id: 'flamethrower', name: 'Flamethrower', namePt: 'Flamethrower', type: 'fire', power: 90, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },
  'fire-blast': { id: 'fire-blast', name: 'Fire Blast', namePt: 'Fire Blast', type: 'fire', power: 110, accuracy: 85, damageClass: 'special', pp: 5, maxPp: 5 },
  'flare-blitz': { id: 'flare-blitz', name: 'Flare Blitz', namePt: 'Flare Blitz', type: 'fire', power: 120, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'fire-punch': { id: 'fire-punch', name: 'Fire Punch', namePt: 'Fire Punch', type: 'fire', power: 75, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'overheat': { id: 'overheat', name: 'Overheat', namePt: 'Overheat', type: 'fire', power: 130, accuracy: 90, damageClass: 'special', pp: 5, maxPp: 5 },

  // Water
  'hydro-pump': { id: 'hydro-pump', name: 'Hydro Pump', namePt: 'Hydro Pump', type: 'water', power: 110, accuracy: 80, damageClass: 'special', pp: 5, maxPp: 5 },
  'surf': { id: 'surf', name: 'Surf', namePt: 'Surf', type: 'water', power: 90, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },
  'scald': { id: 'scald', name: 'Scald', namePt: 'Scald', type: 'water', power: 80, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },
  'waterfall': { id: 'waterfall', name: 'Waterfall', namePt: 'Waterfall', type: 'water', power: 80, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'aqua-jet': { id: 'aqua-jet', name: 'Aqua Jet', namePt: 'Aqua Jet', type: 'water', power: 40, accuracy: 100, damageClass: 'physical', pp: 20, maxPp: 20, priority: 1 },
  'water-shuriken': { id: 'water-shuriken', name: 'Water Shuriken', namePt: 'Water Shuriken', type: 'water', power: 60, accuracy: 100, damageClass: 'special', pp: 20, maxPp: 20, priority: 1 },

  // Grass
  'energy-ball': { id: 'energy-ball', name: 'Energy Ball', namePt: 'Energy Ball', type: 'grass', power: 90, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'giga-drain': { id: 'giga-drain', name: 'Giga Drain', namePt: 'Giga Drain', type: 'grass', power: 75, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'leaf-blade': { id: 'leaf-blade', name: 'Leaf Blade', namePt: 'Leaf Blade', type: 'grass', power: 90, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'wood-hammer': { id: 'wood-hammer', name: 'Wood Hammer', namePt: 'Wood Hammer', type: 'grass', power: 120, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'solar-beam': { id: 'solar-beam', name: 'Solar Beam', namePt: 'Solar Beam', type: 'grass', power: 120, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },

  // Electric
  'thunderbolt': { id: 'thunderbolt', name: 'Thunderbolt', namePt: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },
  'thunder': { id: 'thunder', name: 'Thunder', namePt: 'Thunder', type: 'electric', power: 110, accuracy: 70, damageClass: 'special', pp: 10, maxPp: 10 },
  'volt-tackle': { id: 'volt-tackle', name: 'Volt Tackle', namePt: 'Volt Tackle', type: 'electric', power: 120, accuracy: 100, damageClass: 'physical', pp: 5, maxPp: 5 },
  'wild-charge': { id: 'wild-charge', name: 'Wild Charge', namePt: 'Wild Charge', type: 'electric', power: 90, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'discharge': { id: 'discharge', name: 'Discharge', namePt: 'Discharge', type: 'electric', power: 80, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },

  // Ice
  'ice-beam': { id: 'ice-beam', name: 'Ice Beam', namePt: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'blizzard': { id: 'blizzard', name: 'Blizzard', namePt: 'Blizzard', type: 'ice', power: 110, accuracy: 70, damageClass: 'special', pp: 5, maxPp: 5 },
  'ice-punch': { id: 'ice-punch', name: 'Ice Punch', namePt: 'Ice Punch', type: 'ice', power: 75, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'ice-shard': { id: 'ice-shard', name: 'Ice Shard', namePt: 'Ice Shard', type: 'ice', power: 40, accuracy: 100, damageClass: 'physical', pp: 30, maxPp: 30, priority: 1 },
  'icicle-crash': { id: 'icicle-crash', name: 'Icicle Crash', namePt: 'Icicle Crash', type: 'ice', power: 85, accuracy: 90, damageClass: 'physical', pp: 10, maxPp: 10 },

  // Fighting
  'close-combat': { id: 'close-combat', name: 'Close Combat', namePt: 'Close Combat', type: 'fighting', power: 120, accuracy: 100, damageClass: 'physical', pp: 5, maxPp: 5 },
  'aura-sphere': { id: 'aura-sphere', name: 'Aura Sphere', namePt: 'Aura Sphere', type: 'fighting', power: 80, accuracy: 100, damageClass: 'special', pp: 20, maxPp: 20 },
  'focus-blast': { id: 'focus-blast', name: 'Focus Blast', namePt: 'Focus Blast', type: 'fighting', power: 120, accuracy: 70, damageClass: 'special', pp: 5, maxPp: 5 },
  'drain-punch': { id: 'drain-punch', name: 'Drain Punch', namePt: 'Drain Punch', type: 'fighting', power: 75, accuracy: 100, damageClass: 'physical', pp: 10, maxPp: 10 },
  'mach-punch': { id: 'mach-punch', name: 'Mach Punch', namePt: 'Mach Punch', type: 'fighting', power: 40, accuracy: 100, damageClass: 'physical', pp: 30, maxPp: 30, priority: 1 },
  'superpower': { id: 'superpower', name: 'Superpower', namePt: 'Superpower', type: 'fighting', power: 120, accuracy: 100, damageClass: 'physical', pp: 5, maxPp: 5 },
  'cross-chop': { id: 'cross-chop', name: 'Cross Chop', namePt: 'Cross Chop', type: 'fighting', power: 100, accuracy: 80, damageClass: 'physical', pp: 5, maxPp: 5 },

  // Poison
  'sludge-bomb': { id: 'sludge-bomb', name: 'Sludge Bomb', namePt: 'Sludge Bomb', type: 'poison', power: 90, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'sludge-wave': { id: 'sludge-wave', name: 'Sludge Wave', namePt: 'Sludge Wave', type: 'poison', power: 95, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'gunk-shot': { id: 'gunk-shot', name: 'Gunk Shot', namePt: 'Gunk Shot', type: 'poison', power: 120, accuracy: 80, damageClass: 'physical', pp: 5, maxPp: 5 },
  'poison-jab': { id: 'poison-jab', name: 'Poison Jab', namePt: 'Poison Jab', type: 'poison', power: 80, accuracy: 100, damageClass: 'physical', pp: 20, maxPp: 20 },
  'cross-poison': { id: 'cross-poison', name: 'Cross Poison', namePt: 'Cross Poison', type: 'poison', power: 70, accuracy: 100, damageClass: 'physical', pp: 20, maxPp: 20 },

  // Ground
  'earthquake': { id: 'earthquake', name: 'Earthquake', namePt: 'Earthquake', type: 'ground', power: 100, accuracy: 100, damageClass: 'physical', pp: 10, maxPp: 10 },
  'earth-power': { id: 'earth-power', name: 'Earth Power', namePt: 'Earth Power', type: 'ground', power: 90, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'drill-run': { id: 'drill-run', name: 'Drill Run', namePt: 'Drill Run', type: 'ground', power: 80, accuracy: 95, damageClass: 'physical', pp: 10, maxPp: 10 },

  // Flying
  'brave-bird': { id: 'brave-bird', name: 'Brave Bird', namePt: 'Brave Bird', type: 'flying', power: 120, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'air-slash': { id: 'air-slash', name: 'Air Slash', namePt: 'Air Slash', type: 'flying', power: 75, accuracy: 95, damageClass: 'special', pp: 15, maxPp: 15 },
  'hurricane': { id: 'hurricane', name: 'Hurricane', namePt: 'Hurricane', type: 'flying', power: 110, accuracy: 70, damageClass: 'special', pp: 10, maxPp: 10 },
  'acrobatics': { id: 'acrobatics', name: 'Acrobatics', namePt: 'Acrobatics', type: 'flying', power: 110, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'bounce': { id: 'bounce', name: 'Bounce', namePt: 'Bounce', type: 'flying', power: 85, accuracy: 85, damageClass: 'physical', pp: 5, maxPp: 5 },

  // Psychic
  'psychic': { id: 'psychic', name: 'Psychic', namePt: 'Psychic', type: 'psychic', power: 90, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'psyshock': { id: 'psyshock', name: 'Psyshock', namePt: 'Psyshock', type: 'psychic', power: 80, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'zen-headbutt': { id: 'zen-headbutt', name: 'Zen Headbutt', namePt: 'Zen Headbutt', type: 'psychic', power: 80, accuracy: 90, damageClass: 'physical', pp: 15, maxPp: 15 },

  // Bug
  'bug-buzz': { id: 'bug-buzz', name: 'Bug Buzz', namePt: 'Bug Buzz', type: 'bug', power: 90, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'x-scissor': { id: 'x-scissor', name: 'X-Scissor', namePt: 'X-Scissor', type: 'bug', power: 80, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'megahorn': { id: 'megahorn', name: 'Megahorn', namePt: 'Megahorn', type: 'bug', power: 120, accuracy: 85, damageClass: 'physical', pp: 10, maxPp: 10 },
  'u-turn': { id: 'u-turn', name: 'U-turn', namePt: 'U-turn', type: 'bug', power: 70, accuracy: 100, damageClass: 'physical', pp: 20, maxPp: 20 },

  // Rock
  'stone-edge': { id: 'stone-edge', name: 'Stone Edge', namePt: 'Stone Edge', type: 'rock', power: 100, accuracy: 80, damageClass: 'physical', pp: 5, maxPp: 5 },
  'rock-slide': { id: 'rock-slide', name: 'Rock Slide', namePt: 'Rock Slide', type: 'rock', power: 75, accuracy: 90, damageClass: 'physical', pp: 10, maxPp: 10 },
  'power-gem': { id: 'power-gem', name: 'Power Gem', namePt: 'Power Gem', type: 'rock', power: 80, accuracy: 100, damageClass: 'special', pp: 20, maxPp: 20 },

  // Ghost
  'shadow-ball': { id: 'shadow-ball', name: 'Shadow Ball', namePt: 'Shadow Ball', type: 'ghost', power: 80, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },
  'shadow-punch': { id: 'shadow-punch', name: 'Shadow Punch', namePt: 'Shadow Punch', type: 'ghost', power: 60, accuracy: 100, damageClass: 'physical', pp: 20, maxPp: 20 },
  'shadow-claw': { id: 'shadow-claw', name: 'Shadow Claw', namePt: 'Shadow Claw', type: 'ghost', power: 70, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'shadow-sneak': { id: 'shadow-sneak', name: 'Shadow Sneak', namePt: 'Shadow Sneak', type: 'ghost', power: 40, accuracy: 100, damageClass: 'physical', pp: 30, maxPp: 30, priority: 1 },

  // Dragon
  'draco-meteor': { id: 'draco-meteor', name: 'Draco Meteor', namePt: 'Draco Meteor', type: 'dragon', power: 130, accuracy: 90, damageClass: 'special', pp: 5, maxPp: 5 },
  'dragon-pulse': { id: 'dragon-pulse', name: 'Dragon Pulse', namePt: 'Dragon Pulse', type: 'dragon', power: 85, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'dragon-claw': { id: 'dragon-claw', name: 'Dragon Claw', namePt: 'Dragon Claw', type: 'dragon', power: 80, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'outrage': { id: 'outrage', name: 'Outrage', namePt: 'Outrage', type: 'dragon', power: 120, accuracy: 100, damageClass: 'physical', pp: 10, maxPp: 10 },

  // Steel
  'flash-cannon': { id: 'flash-cannon', name: 'Flash Cannon', namePt: 'Flash Cannon', type: 'steel', power: 80, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'iron-head': { id: 'iron-head', name: 'Iron Head', namePt: 'Iron Head', type: 'steel', power: 80, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'meteor-mash': { id: 'meteor-mash', name: 'Meteor Mash', namePt: 'Meteor Mash', type: 'steel', power: 90, accuracy: 90, damageClass: 'physical', pp: 10, maxPp: 10 },
  'bullet-punch': { id: 'bullet-punch', name: 'Bullet Punch', namePt: 'Bullet Punch', type: 'steel', power: 40, accuracy: 100, damageClass: 'physical', pp: 30, maxPp: 30, priority: 1 },
  'heavy-slam': { id: 'heavy-slam', name: 'Heavy Slam', namePt: 'Heavy Slam', type: 'steel', power: 100, accuracy: 100, damageClass: 'physical', pp: 10, maxPp: 10 },

  // Dark
  'dark-pulse': { id: 'dark-pulse', name: 'Dark Pulse', namePt: 'Dark Pulse', type: 'dark', power: 80, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },
  'crunch': { id: 'crunch', name: 'Crunch', namePt: 'Crunch', type: 'dark', power: 80, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'sucker-punch': { id: 'sucker-punch', name: 'Sucker Punch', namePt: 'Sucker Punch', type: 'dark', power: 70, accuracy: 100, damageClass: 'physical', pp: 5, maxPp: 5, priority: 1 },
  'night-slash': { id: 'night-slash', name: 'Night Slash', namePt: 'Night Slash', type: 'dark', power: 70, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },

  // Fairy
  'moonblast': { id: 'moonblast', name: 'Moonblast', namePt: 'Moonblast', type: 'fairy', power: 95, accuracy: 100, damageClass: 'special', pp: 15, maxPp: 15 },
  'dazzling-gleam': { id: 'dazzling-gleam', name: 'Dazzling Gleam', namePt: 'Dazzling Gleam', type: 'fairy', power: 80, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'play-rough': { id: 'play-rough', name: 'Play Rough', namePt: 'Play Rough', type: 'fairy', power: 90, accuracy: 90, damageClass: 'physical', pp: 10, maxPp: 10 },

  // Normal
  'extreme-speed': { id: 'extreme-speed', name: 'Extreme Speed', namePt: 'Extreme Speed', type: 'normal', power: 80, accuracy: 100, damageClass: 'physical', pp: 5, maxPp: 5, priority: 2 },
  'quick-attack': { id: 'quick-attack', name: 'Quick Attack', namePt: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, damageClass: 'physical', pp: 30, maxPp: 30, priority: 1 },
  'body-slam': { id: 'body-slam', name: 'Body Slam', namePt: 'Body Slam', type: 'normal', power: 85, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'double-edge': { id: 'double-edge', name: 'Double-Edge', namePt: 'Double-Edge', type: 'normal', power: 120, accuracy: 100, damageClass: 'physical', pp: 15, maxPp: 15 },
  'tri-attack': { id: 'tri-attack', name: 'Tri Attack', namePt: 'Tri Attack', type: 'normal', power: 80, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 },
  'hyper-voice': { id: 'hyper-voice', name: 'Hyper Voice', namePt: 'Hyper Voice', type: 'normal', power: 90, accuracy: 100, damageClass: 'special', pp: 10, maxPp: 10 }
};

export function getMove(id: string): BattleMove {
  const m = BATTLE_MOVES[id];
  if (m) return JSON.parse(JSON.stringify(m));
  return {
    id,
    name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    namePt: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    type: 'normal',
    power: 80,
    accuracy: 100,
    damageClass: 'physical',
    pp: 15,
    maxPp: 15
  };
}
