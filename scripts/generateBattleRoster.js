import fs from 'fs';
import path from 'path';

// List of all iconic and final-evolution Pokemon from Gen 1 to Gen 4 (Dex 1 to 493)
const ROSTER_DEF = [
  // === GEN 1 ===
  { id: 3, name: 'Venusaur', gen: 1, types: ['grass', 'poison'], stats: [80, 82, 83, 100, 100, 80], moves: ['sludge-bomb', 'energy-ball', 'giga-drain', 'earth-power'] },
  { id: 6, name: 'Charizard', gen: 1, types: ['fire', 'flying'], stats: [78, 84, 78, 109, 85, 100], moves: ['flamethrower', 'air-slash', 'dragon-pulse', 'fire-blast'] },
  { id: 9, name: 'Blastoise', gen: 1, types: ['water'], stats: [79, 83, 100, 85, 105, 78], moves: ['hydro-pump', 'surf', 'ice-beam', 'flash-cannon'] },
  { id: 12, name: 'Butterfree', gen: 1, types: ['bug', 'flying'], stats: [60, 45, 50, 90, 80, 70], moves: ['bug-buzz', 'air-slash', 'psychic', 'energy-ball'] },
  { id: 15, name: 'Beedrill', gen: 1, types: ['bug', 'poison'], stats: [65, 90, 40, 45, 80, 75], moves: ['x-scissor', 'poison-jab', 'drill-run', 'u-turn'] },
  { id: 18, name: 'Pidgeot', gen: 1, types: ['normal', 'flying'], stats: [83, 80, 75, 70, 70, 101], moves: ['brave-bird', 'air-slash', 'u-turn', 'quick-attack'] },
  { id: 24, name: 'Arbok', gen: 1, types: ['poison'], stats: [60, 95, 69, 65, 79, 80], moves: ['gunk-shot', 'earthquake', 'crunch', 'sucker-punch'] },
  { id: 26, name: 'Raichu', gen: 1, types: ['electric'], stats: [60, 90, 55, 90, 80, 110], moves: ['thunderbolt', 'volt-tackle', 'focus-blast', 'quick-attack'] },
  { id: 28, name: 'Sandslash', gen: 1, types: ['ground'], stats: [75, 100, 110, 45, 55, 65], moves: ['earthquake', 'stone-edge', 'x-scissor', 'iron-head'] },
  { id: 31, name: 'Nidoqueen', gen: 1, types: ['poison', 'ground'], stats: [90, 92, 87, 75, 85, 76], moves: ['earth-power', 'sludge-wave', 'ice-beam', 'thunderbolt'] },
  { id: 34, name: 'Nidoking', gen: 1, types: ['poison', 'ground'], stats: [81, 102, 77, 85, 75, 85], moves: ['earth-power', 'sludge-wave', 'flamethrower', 'ice-beam'] },
  { id: 36, name: 'Clefable', gen: 1, types: ['fairy'], stats: [95, 70, 73, 95, 90, 60], moves: ['moonblast', 'flamethrower', 'ice-beam', 'psychic'] },
  { id: 38, name: 'Ninetales', gen: 1, types: ['fire'], stats: [73, 76, 75, 81, 100, 100], moves: ['flamethrower', 'fire-blast', 'energy-ball', 'dark-pulse'] },
  { id: 45, name: 'Vileplume', gen: 1, types: ['grass', 'poison'], stats: [75, 80, 85, 110, 90, 50], moves: ['sludge-bomb', 'energy-ball', 'giga-drain', 'moonblast'] },
  { id: 49, name: 'Venomoth', gen: 1, types: ['bug', 'poison'], stats: [70, 65, 60, 90, 75, 90], moves: ['bug-buzz', 'sludge-bomb', 'psychic', 'energy-ball'] },
  { id: 51, name: 'Dugtrio', gen: 1, types: ['ground'], stats: [35, 100, 50, 50, 70, 120], moves: ['earthquake', 'stone-edge', 'sucker-punch', 'shadow-claw'] },
  { id: 53, name: 'Persian', gen: 1, types: ['normal'], stats: [65, 70, 60, 65, 65, 115], moves: ['double-edge', 'play-rough', 'u-turn', 'sucker-punch'] },
  { id: 55, name: 'Golduck', gen: 1, types: ['water'], stats: [80, 82, 78, 95, 80, 85], moves: ['hydro-pump', 'ice-beam', 'psychic', 'focus-blast'] },
  { id: 57, name: 'Primeape', gen: 1, types: ['fighting'], stats: [65, 105, 60, 60, 70, 95], moves: ['close-combat', 'earthquake', 'stone-edge', 'poison-jab'] },
  { id: 59, name: 'Arcanine', gen: 1, types: ['fire'], stats: [90, 110, 80, 100, 80, 95], moves: ['flare-blitz', 'extreme-speed', 'wild-charge', 'close-combat'] },
  { id: 62, name: 'Poliwrath', gen: 1, types: ['water', 'fighting'], stats: [90, 95, 95, 70, 90, 70], moves: ['waterfall', 'close-combat', 'ice-punch', 'earthquake'] },
  { id: 64, name: 'Kadabra', gen: 1, types: ['psychic'], stats: [40, 35, 30, 120, 70, 105], moves: ['psychic', 'shadow-ball', 'focus-blast', 'dazzling-gleam'] },
  { id: 65, name: 'Alakazam', gen: 1, types: ['psychic'], stats: [55, 50, 45, 135, 95, 120], moves: ['psychic', 'shadow-ball', 'focus-blast', 'dazzling-gleam'] },
  { id: 68, name: 'Machamp', gen: 1, types: ['fighting'], stats: [90, 130, 80, 65, 85, 55], moves: ['close-combat', 'stone-edge', 'earthquake', 'ice-punch'] },
  { id: 71, name: 'Victreebel', gen: 1, types: ['grass', 'poison'], stats: [80, 105, 65, 100, 70, 70], moves: ['leaf-blade', 'sludge-bomb', 'sucker-punch', 'weather-ball'] },
  { id: 73, name: 'Tentacruel', gen: 1, types: ['water', 'poison'], stats: [80, 70, 65, 80, 120, 100], moves: ['hydro-pump', 'sludge-wave', 'ice-beam', 'scald'] },
  { id: 76, name: 'Golem', gen: 1, types: ['rock', 'ground'], stats: [80, 120, 130, 55, 65, 45], moves: ['earthquake', 'stone-edge', 'heavy-slam', 'fire-punch'] },
  { id: 78, name: 'Rapidash', gen: 1, types: ['fire'], stats: [65, 100, 70, 80, 80, 105], moves: ['flare-blitz', 'wild-charge', 'high-horsepower', 'drill-run'] },
  { id: 80, name: 'Slowbro', gen: 1, types: ['water', 'psychic'], stats: [95, 75, 110, 100, 80, 30], moves: ['scald', 'psychic', 'ice-beam', 'shadow-ball'] },
  { id: 85, name: 'Dodrio', gen: 1, types: ['normal', 'flying'], stats: [60, 110, 70, 60, 60, 110], moves: ['brave-bird', 'drill-run', 'double-edge', 'quick-attack'] },
  { id: 87, name: 'Dewgong', gen: 1, types: ['water', 'ice'], stats: [90, 70, 80, 70, 95, 70], moves: ['surf', 'ice-beam', 'drill-run', 'ice-shard'] },
  { id: 89, name: 'Muk', gen: 1, types: ['poison'], stats: [105, 105, 75, 65, 100, 50], moves: ['gunk-shot', 'poison-jab', 'fire-punch', 'shadow-sneak'] },
  { id: 91, name: 'Cloyster', gen: 1, types: ['water', 'ice'], stats: [50, 95, 180, 85, 45, 70], moves: ['icicle-crash', 'hydro-pump', 'ice-shard', 'drill-run'] },
  { id: 93, name: 'Haunter', gen: 1, types: ['ghost', 'poison'], stats: [45, 50, 45, 115, 55, 95], moves: ['shadow-ball', 'sludge-bomb', 'thunderbolt', 'dazzling-gleam'] },
  { id: 94, name: 'Gengar', gen: 1, types: ['ghost', 'poison'], stats: [60, 65, 60, 130, 75, 110], moves: ['shadow-ball', 'sludge-wave', 'focus-blast', 'thunderbolt'] },
  { id: 99, name: 'Kingler', gen: 1, types: ['water'], stats: [55, 130, 115, 50, 50, 75], moves: ['waterfall', 'x-scissor', 'rock-slide', 'body-slam'] },
  { id: 101, name: 'Electrode', gen: 1, types: ['electric'], stats: [60, 50, 70, 80, 80, 150], moves: ['thunderbolt', 'volt-tackle', 'foul-play', 'sucker-punch'] },
  { id: 103, name: 'Exeggutor', gen: 1, types: ['grass', 'psychic'], stats: [95, 95, 85, 125, 75, 55], moves: ['energy-ball', 'psychic', 'sludge-bomb', 'wood-hammer'] },
  { id: 105, name: 'Marowak', gen: 1, types: ['ground'], stats: [60, 80, 110, 50, 80, 45], moves: ['earthquake', 'stone-edge', 'iron-head', 'fire-punch'] },
  { id: 106, name: 'Hitmonlee', gen: 1, types: ['fighting'], stats: [50, 120, 53, 35, 110, 87], moves: ['close-combat', 'stone-edge', 'mach-punch', 'earthquake'] },
  { id: 107, name: 'Hitmonchan', gen: 1, types: ['fighting'], stats: [50, 105, 79, 35, 110, 76], moves: ['close-combat', 'drain-punch', 'ice-punch', 'mach-punch'] },
  { id: 110, name: 'Weezing', gen: 1, types: ['poison'], stats: [65, 90, 120, 85, 70, 60], moves: ['sludge-bomb', 'fire-blast', 'thunderbolt', 'dark-pulse'] },
  { id: 112, name: 'Rhydon', gen: 1, types: ['ground', 'rock'], stats: [105, 130, 120, 45, 45, 40], moves: ['earthquake', 'stone-edge', 'megahorn', 'ice-punch'] },
  { id: 113, name: 'Chansey', gen: 1, types: ['normal'], stats: [250, 5, 5, 35, 105, 50], moves: ['hyper-voice', 'ice-beam', 'thunderbolt', 'shadow-ball'] },
  { id: 115, name: 'Kangaskhan', gen: 1, types: ['normal'], stats: [105, 95, 80, 40, 80, 90], moves: ['body-slam', 'earthquake', 'sucker-punch', 'crunch'] },
  { id: 121, name: 'Starmie', gen: 1, types: ['water', 'psychic'], stats: [60, 75, 85, 100, 85, 115], moves: ['hydro-pump', 'psychic', 'ice-beam', 'thunderbolt'] },
  { id: 122, name: 'Mr. Mime', gen: 1, types: ['psychic', 'fairy'], stats: [40, 45, 65, 100, 120, 90], moves: ['psychic', 'dazzling-gleam', 'focus-blast', 'shadow-ball'] },
  { id: 123, name: 'Scyther', gen: 1, types: ['bug', 'flying'], stats: [70, 110, 80, 55, 80, 105], moves: ['x-scissor', 'close-combat', 'night-slash', 'u-turn'] },
  { id: 124, name: 'Jynx', gen: 1, types: ['ice', 'psychic'], stats: [65, 50, 35, 115, 95, 95], moves: ['ice-beam', 'psychic', 'focus-blast', 'shadow-ball'] },
  { id: 125, name: 'Electabuzz', gen: 1, types: ['electric'], stats: [65, 83, 57, 95, 85, 105], moves: ['thunderbolt', 'volt-tackle', 'cross-chop', 'psychic'] },
  { id: 126, name: 'Magmar', gen: 1, types: ['fire'], stats: [65, 95, 57, 100, 85, 93], moves: ['fire-blast', 'thunderbolt', 'focus-blast', 'flamethrower'] },
  { id: 127, name: 'Pinsir', gen: 1, types: ['bug'], stats: [65, 125, 100, 55, 70, 85], moves: ['x-scissor', 'close-combat', 'earthquake', 'stone-edge'] },
  { id: 128, name: 'Tauros', gen: 1, types: ['normal'], stats: [75, 100, 95, 40, 70, 110], moves: ['body-slam', 'earthquake', 'close-combat', 'iron-head'] },
  { id: 130, name: 'Gyarados', gen: 1, types: ['water', 'flying'], stats: [95, 125, 79, 60, 100, 81], moves: ['waterfall', 'bounce', 'crunch', 'earthquake'] },
  { id: 131, name: 'Lapras', gen: 1, types: ['water', 'ice'], stats: [130, 85, 80, 85, 95, 60], moves: ['hydro-pump', 'ice-beam', 'thunderbolt', 'ice-shard'] },
  { id: 134, name: 'Vaporeon', gen: 1, types: ['water'], stats: [130, 65, 60, 110, 95, 65], moves: ['hydro-pump', 'scald', 'ice-beam', 'shadow-ball'] },
  { id: 135, name: 'Jolteon', gen: 1, types: ['electric'], stats: [65, 65, 60, 110, 95, 130], moves: ['thunderbolt', 'shadow-ball', 'volt-tackle', 'quick-attack'] },
  { id: 136, name: 'Flareon', gen: 1, types: ['fire'], stats: [65, 130, 60, 95, 110, 65], moves: ['flare-blitz', 'superpower', 'iron-tail', 'quick-attack'] },
  { id: 139, name: 'Omastar', gen: 1, types: ['rock', 'water'], stats: [70, 60, 125, 115, 70, 55], moves: ['hydro-pump', 'power-gem', 'ice-beam', 'earth-power'] },
  { id: 141, name: 'Kabutops', gen: 1, types: ['rock', 'water'], stats: [60, 115, 105, 65, 70, 80], moves: ['stone-edge', 'waterfall', 'aqua-jet', 'x-scissor'] },
  { id: 142, name: 'Aerodactyl', gen: 1, types: ['rock', 'flying'], stats: [80, 105, 65, 60, 75, 130], moves: ['stone-edge', 'brave-bird', 'earthquake', 'crunch'] },
  { id: 143, name: 'Snorlax', gen: 1, types: ['normal'], stats: [160, 110, 65, 65, 110, 30], moves: ['body-slam', 'crunch', 'heavy-slam', 'earthquake'] },
  { id: 144, name: 'Articuno', gen: 1, types: ['ice', 'flying'], stats: [90, 85, 100, 95, 125, 85], moves: ['ice-beam', 'hurricane', 'blizzard', 'ice-shard'] },
  { id: 145, name: 'Zapdos', gen: 1, types: ['electric', 'flying'], stats: [90, 90, 85, 125, 90, 100], moves: ['thunderbolt', 'hurricane', 'heat-wave', 'volt-tackle'] },
  { id: 146, name: 'Moltres', gen: 1, types: ['fire', 'flying'], stats: [90, 100, 90, 125, 85, 90], moves: ['fire-blast', 'hurricane', 'flamethrower', 'air-slash'] },
  { id: 149, name: 'Dragonite', gen: 1, types: ['dragon', 'flying'], stats: [91, 134, 95, 100, 100, 80], moves: ['outrage', 'extreme-speed', 'earthquake', 'fire-punch'] },
  { id: 150, name: 'Mewtwo', gen: 1, types: ['psychic'], stats: [106, 110, 90, 154, 90, 130], moves: ['psystrike', 'shadow-ball', 'aura-sphere', 'ice-beam'] },
  { id: 151, name: 'Mew', gen: 1, types: ['psychic'], stats: [100, 100, 100, 100, 100, 100], moves: ['psychic', 'flamethrower', 'ice-beam', 'earthquake'] },

  // === GEN 2 ===
  { id: 154, name: 'Meganium', gen: 2, types: ['grass'], stats: [80, 82, 100, 83, 100, 80], moves: ['energy-ball', 'earthquake', 'giga-drain', 'body-slam'] },
  { id: 157, name: 'Typhlosion', gen: 2, types: ['fire'], stats: [78, 84, 78, 109, 85, 100], moves: ['eruption', 'flamethrower', 'focus-blast', 'solar-beam'] },
  { id: 160, name: 'Feraligatr', gen: 2, types: ['water'], stats: [85, 105, 100, 79, 83, 78], moves: ['waterfall', 'crunch', 'ice-punch', 'earthquake'] },
  { id: 164, name: 'Noctowl', gen: 2, types: ['normal', 'flying'], stats: [100, 50, 50, 86, 96, 70], moves: ['hurricane', 'hyper-voice', 'psychic', 'shadow-ball'] },
  { id: 169, name: 'Crobat', gen: 2, types: ['poison', 'flying'], stats: [85, 90, 80, 70, 80, 130], moves: ['brave-bird', 'cross-poison', 'u-turn', 'zen-headbutt'] },
  { id: 171, name: 'Lanturn', gen: 2, types: ['water', 'electric'], stats: [125, 58, 58, 76, 76, 67], moves: ['surf', 'thunderbolt', 'ice-beam', 'volt-tackle'] },
  { id: 178, name: 'Xatu', gen: 2, types: ['psychic', 'flying'], stats: [65, 75, 70, 95, 70, 95], moves: ['psychic', 'air-slash', 'shadow-ball', 'u-turn'] },
  { id: 181, name: 'Ampharos', gen: 2, types: ['electric'], stats: [90, 75, 85, 115, 90, 55], moves: ['thunderbolt', 'dragon-pulse', 'focus-blast', 'power-gem'] },
  { id: 182, name: 'Bellossom', gen: 2, types: ['grass'], stats: [75, 80, 95, 90, 100, 50], moves: ['energy-ball', 'sludge-bomb', 'moonblast', 'giga-drain'] },
  { id: 184, name: 'Azumarill', gen: 2, types: ['water', 'fairy'], stats: [100, 50, 80, 60, 80, 50], moves: ['play-rough', 'waterfall', 'aqua-jet', 'superpower'] },
  { id: 186, name: 'Politoed', gen: 2, types: ['water'], stats: [90, 75, 75, 90, 100, 70], moves: ['hydro-pump', 'ice-beam', 'scald', 'focus-blast'] },
  { id: 195, name: 'Quagsire', gen: 2, types: ['water', 'ground'], stats: [95, 85, 85, 65, 65, 35], moves: ['earthquake', 'waterfall', 'ice-punch', 'stone-edge'] },
  { id: 196, name: 'Espeon', gen: 2, types: ['psychic'], stats: [65, 65, 60, 130, 95, 110], moves: ['psychic', 'shadow-ball', 'dazzling-gleam', 'psyshock'] },
  { id: 197, name: 'Umbreon', gen: 2, types: ['dark'], stats: [95, 65, 110, 60, 130, 65], moves: ['dark-pulse', 'foul-play', 'body-slam', 'quick-attack'] },
  { id: 199, name: 'Slowking', gen: 2, types: ['water', 'psychic'], stats: [95, 75, 80, 100, 110, 30], moves: ['surf', 'psychic', 'ice-beam', 'fire-blast'] },
  { id: 205, name: 'Forretress', gen: 2, types: ['bug', 'steel'], stats: [75, 90, 140, 60, 60, 40], moves: ['gyro-ball', 'earthquake', 'bug-buzz', 'volt-tackle'] },
  { id: 208, name: 'Steelix', gen: 2, types: ['steel', 'ground'], stats: [75, 85, 200, 55, 65, 30], moves: ['earthquake', 'heavy-slam', 'stone-edge', 'crunch'] },
  { id: 210, name: 'Granbull', gen: 2, types: ['fairy'], stats: [90, 120, 75, 60, 60, 45], moves: ['play-rough', 'close-combat', 'crunch', 'earthquake'] },
  { id: 212, name: 'Scizor', gen: 2, types: ['bug', 'steel'], stats: [70, 130, 100, 55, 80, 65], moves: ['bullet-punch', 'x-scissor', 'close-combat', 'u-turn'] },
  { id: 213, name: 'Shuckle', gen: 2, types: ['bug', 'rock'], stats: [20, 10, 230, 10, 230, 5], moves: ['stone-edge', 'bug-buzz', 'rock-slide', 'body-slam'] },
  { id: 214, name: 'Heracross', gen: 2, types: ['bug', 'fighting'], stats: [80, 125, 75, 40, 95, 85], moves: ['close-combat', 'megahorn', 'stone-edge', 'earthquake'] },
  { id: 215, name: 'Sneasel', gen: 2, types: ['dark', 'ice'], stats: [55, 95, 55, 35, 75, 115], moves: ['icicle-crash', 'ice-shard', 'poison-jab', 'night-slash'] },
  { id: 227, name: 'Skarmory', gen: 2, types: ['steel', 'flying'], stats: [65, 80, 140, 40, 70, 70], moves: ['brave-bird', 'iron-head', 'drill-run', 'body-slam'] },
  { id: 229, name: 'Houndoom', gen: 2, types: ['dark', 'fire'], stats: [75, 90, 50, 110, 80, 95], moves: ['fire-blast', 'dark-pulse', 'sludge-bomb', 'sucker-punch'] },
  { id: 230, name: 'Kingdra', gen: 2, types: ['water', 'dragon'], stats: [75, 95, 95, 95, 95, 85], moves: ['hydro-pump', 'draco-meteor', 'ice-beam', 'surf'] },
  { id: 232, name: 'Donphan', gen: 2, types: ['ground'], stats: [90, 120, 120, 60, 60, 50], moves: ['earthquake', 'stone-edge', 'ice-shard', 'knock-off'] },
  { id: 233, name: 'Porygon2', gen: 2, types: ['normal'], stats: [85, 80, 90, 105, 95, 60], moves: ['tri-attack', 'ice-beam', 'thunderbolt', 'shadow-ball'] },
  { id: 237, name: 'Hitmontop', gen: 2, types: ['fighting'], stats: [50, 95, 95, 35, 110, 70], moves: ['close-combat', 'mach-punch', 'sucker-punch', 'stone-edge'] },
  { id: 241, name: 'Miltank', gen: 2, types: ['normal'], stats: [95, 80, 105, 40, 70, 100], moves: ['body-slam', 'play-rough', 'earthquake', 'zen-headbutt'] },
  { id: 242, name: 'Blissey', gen: 2, types: ['normal'], stats: [255, 10, 10, 75, 135, 55], moves: ['hyper-voice', 'ice-beam', 'thunderbolt', 'flamethrower'] },
  { id: 243, name: 'Raikou', gen: 2, types: ['electric'], stats: [90, 85, 75, 115, 100, 115], moves: ['thunderbolt', 'volt-tackle', 'shadow-ball', 'aura-sphere'] },
  { id: 244, name: 'Entei', gen: 2, types: ['fire'], stats: [115, 115, 85, 90, 75, 100], moves: ['sacred-fire', 'extreme-speed', 'stone-edge', 'iron-head'] },
  { id: 245, name: 'Suicune', gen: 2, types: ['water'], stats: [100, 75, 115, 90, 115, 85], moves: ['hydro-pump', 'ice-beam', 'scald', 'air-slash'] },
  { id: 248, name: 'Tyranitar', gen: 2, types: ['rock', 'dark'], stats: [100, 134, 110, 95, 100, 61], moves: ['stone-edge', 'crunch', 'earthquake', 'fire-punch'] },
  { id: 249, name: 'Lugia', gen: 2, types: ['psychic', 'flying'], stats: [106, 90, 130, 90, 154, 110], moves: ['aeroblast', 'psychic', 'hydro-pump', 'ice-beam'] },
  { id: 250, name: 'Ho-Oh', gen: 2, types: ['fire', 'flying'], stats: [106, 130, 90, 110, 154, 90], moves: ['sacred-fire', 'brave-bird', 'earthquake', 'iron-head'] },
  { id: 251, name: 'Celebi', gen: 2, types: ['psychic', 'grass'], stats: [100, 100, 100, 100, 100, 100], moves: ['energy-ball', 'psychic', 'earth-power', 'shadow-ball'] },

  // === GEN 3 ===
  { id: 254, name: 'Sceptile', gen: 3, types: ['grass'], stats: [70, 85, 65, 105, 85, 120], moves: ['leaf-blade', 'energy-ball', 'dragon-pulse', 'focus-blast'] },
  { id: 257, name: 'Blaziken', gen: 3, types: ['fire', 'fighting'], stats: [80, 120, 70, 110, 70, 80], moves: ['flare-blitz', 'close-combat', 'stone-edge', 'brave-bird'] },
  { id: 260, name: 'Swampert', gen: 3, types: ['water', 'ground'], stats: [100, 110, 90, 85, 90, 60], moves: ['waterfall', 'earthquake', 'ice-punch', 'superpower'] },
  { id: 262, name: 'Mightyena', gen: 3, types: ['dark'], stats: [70, 90, 70, 60, 60, 70], moves: ['crunch', 'sucker-punch', 'play-rough', 'iron-tail'] },
  { id: 272, name: 'Ludicolo', gen: 3, types: ['water', 'grass'], stats: [80, 70, 70, 90, 100, 70], moves: ['hydro-pump', 'energy-ball', 'ice-beam', 'giga-drain'] },
  { id: 275, name: 'Shiftry', gen: 3, types: ['grass', 'dark'], stats: [90, 100, 60, 90, 60, 80], moves: ['leaf-blade', 'dark-pulse', 'sucker-punch', 'hurricane'] },
  { id: 277, name: 'Swellow', gen: 3, types: ['normal', 'flying'], stats: [60, 85, 60, 75, 50, 125], moves: ['brave-bird', 'hyper-voice', 'u-turn', 'quick-attack'] },
  { id: 279, name: 'Pelipper', gen: 3, types: ['water', 'flying'], stats: [60, 50, 100, 95, 70, 65], moves: ['hydro-pump', 'hurricane', 'scald', 'u-turn'] },
  { id: 282, name: 'Gardevoir', gen: 3, types: ['psychic', 'fairy'], stats: [68, 65, 65, 125, 115, 80], moves: ['moonblast', 'psychic', 'shadow-ball', 'thunderbolt'] },
  { id: 286, name: 'Breloom', gen: 3, types: ['grass', 'fighting'], stats: [60, 130, 80, 60, 60, 70], moves: ['bullet-seed', 'mach-punch', 'close-combat', 'stone-edge'] },
  { id: 289, name: 'Slaking', gen: 3, types: ['normal'], stats: [150, 160, 100, 95, 65, 100], moves: ['double-edge', 'earthquake', 'sucker-punch', 'play-rough'] },
  { id: 291, name: 'Ninjask', gen: 3, types: ['bug', 'flying'], stats: [61, 90, 45, 50, 50, 160], moves: ['x-scissor', 'acrobatics', 'u-turn', 'night-slash'] },
  { id: 297, name: 'Hariyama', gen: 3, types: ['fighting'], stats: [144, 120, 60, 40, 60, 50], moves: ['close-combat', 'heavy-slam', 'stone-edge', 'knock-off'] },
  { id: 302, name: 'Sableye', gen: 3, types: ['dark', 'ghost'], stats: [50, 75, 75, 65, 65, 50], moves: ['shadow-claw', 'foul-play', 'sucker-punch', 'poison-jab'] },
  { id: 303, name: 'Mawile', gen: 3, types: ['steel', 'fairy'], stats: [50, 85, 85, 55, 55, 50], moves: ['play-rough', 'iron-head', 'sucker-punch', 'crunch'] },
  { id: 306, name: 'Aggron', gen: 3, types: ['steel', 'rock'], stats: [70, 110, 180, 60, 60, 50], moves: ['heavy-slam', 'stone-edge', 'earthquake', 'ice-punch'] },
  { id: 308, name: 'Medicham', gen: 3, types: ['fighting', 'psychic'], stats: [60, 60, 75, 60, 75, 80], moves: ['close-combat', 'zen-headbutt', 'ice-punch', 'bullet-punch'] },
  { id: 310, name: 'Manectric', gen: 3, types: ['electric'], stats: [70, 75, 60, 105, 60, 105], moves: ['thunderbolt', 'overheat', 'volt-tackle', 'quick-attack'] },
  { id: 319, name: 'Sharpedo', gen: 3, types: ['water', 'dark'], stats: [70, 120, 40, 95, 40, 95], moves: ['hydro-pump', 'crunch', 'waterfall', 'ice-beam'] },
  { id: 321, name: 'Wailord', gen: 3, types: ['water'], stats: [170, 90, 45, 90, 45, 60], moves: ['water-spout', 'hydro-pump', 'ice-beam', 'body-slam'] },
  { id: 323, name: 'Camerupt', gen: 3, types: ['fire', 'ground'], stats: [70, 100, 70, 105, 75, 40], moves: ['fire-blast', 'earth-power', 'flamethrower', 'stone-edge'] },
  { id: 324, name: 'Torkoal', gen: 3, types: ['fire'], stats: [70, 85, 140, 85, 70, 20], moves: ['fire-blast', 'solar-beam', 'earth-power', 'body-slam'] },
  { id: 330, name: 'Flygon', gen: 3, types: ['ground', 'dragon'], stats: [80, 100, 80, 80, 80, 100], moves: ['earthquake', 'dragon-claw', 'stone-edge', 'u-turn'] },
  { id: 332, name: 'Cacturne', gen: 3, types: ['grass', 'dark'], stats: [70, 115, 60, 115, 60, 55], moves: ['energy-ball', 'dark-pulse', 'sucker-punch', 'poison-jab'] },
  { id: 334, name: 'Altaria', gen: 3, types: ['dragon', 'flying'], stats: [75, 70, 90, 70, 105, 80], moves: ['draco-meteor', 'hurricane', 'dragon-pulse', 'earthquake'] },
  { id: 335, name: 'Zangoose', gen: 3, types: ['normal'], stats: [73, 115, 60, 60, 60, 90], moves: ['close-combat', 'x-scissor', 'shadow-claw', 'quick-attack'] },
  { id: 336, name: 'Seviper', gen: 3, types: ['poison'], stats: [73, 100, 60, 100, 60, 65], moves: ['sludge-bomb', 'flamethrower', 'dark-pulse', 'giga-drain'] },
  { id: 340, name: 'Whiscash', gen: 3, types: ['water', 'ground'], stats: [110, 78, 73, 76, 71, 60], moves: ['earthquake', 'waterfall', 'ice-beam', 'stone-edge'] },
  { id: 342, name: 'Crawdaunt', gen: 3, types: ['water', 'dark'], stats: [63, 120, 85, 90, 55, 55], moves: ['knock-off', 'crabhammer', 'aqua-jet', 'close-combat'] },
  { id: 344, name: 'Claydol', gen: 3, types: ['ground', 'psychic'], stats: [60, 70, 105, 70, 120, 75], moves: ['earth-power', 'psychic', 'ice-beam', 'shadow-ball'] },
  { id: 348, name: 'Armaldo', gen: 3, types: ['rock', 'bug'], stats: [75, 125, 100, 70, 80, 45], moves: ['x-scissor', 'stone-edge', 'earthquake', 'aqua-jet'] },
  { id: 350, name: 'Milotic', gen: 3, types: ['water'], stats: [95, 60, 79, 100, 125, 81], moves: ['hydro-pump', 'ice-beam', 'scald', 'dragon-pulse'] },
  { id: 354, name: 'Banette', gen: 3, types: ['ghost'], stats: [64, 115, 65, 83, 63, 65], moves: ['shadow-claw', 'sucker-punch', 'gunk-shot', 'dazzling-gleam'] },
  { id: 356, name: 'Dusclops', gen: 3, types: ['ghost'], stats: [40, 70, 130, 60, 130, 25], moves: ['shadow-punch', 'ice-punch', 'earthquake', 'shadow-sneak'] },
  { id: 359, name: 'Absol', gen: 3, types: ['dark'], stats: [65, 130, 60, 75, 60, 75], moves: ['night-slash', 'sucker-punch', 'play-rough', 'close-combat'] },
  { id: 362, name: 'Glalie', gen: 3, types: ['ice'], stats: [80, 80, 80, 80, 80, 80], moves: ['ice-beam', 'earthquake', 'shadow-ball', 'ice-shard'] },
  { id: 365, name: 'Walrein', gen: 3, types: ['ice', 'water'], stats: [110, 80, 90, 95, 90, 65], moves: ['surf', 'ice-beam', 'blizzard', 'earthquake'] },
  { id: 373, name: 'Salamence', gen: 3, types: ['dragon', 'flying'], stats: [95, 135, 80, 110, 80, 100], moves: ['draco-meteor', 'outrage', 'earthquake', 'fire-blast'] },
  { id: 376, name: 'Metagross', gen: 3, types: ['steel', 'psychic'], stats: [80, 135, 130, 95, 90, 70], moves: ['meteor-mash', 'zen-headbutt', 'earthquake', 'bullet-punch'] },
  { id: 377, name: 'Regirock', gen: 3, types: ['rock'], stats: [80, 100, 200, 50, 100, 50], moves: ['stone-edge', 'earthquake', 'ice-punch', 'iron-head'] },
  { id: 378, name: 'Regice', gen: 3, types: ['ice'], stats: [80, 50, 100, 100, 200, 50], moves: ['ice-beam', 'thunderbolt', 'focus-blast', 'blizzard'] },
  { id: 379, name: 'Registeel', gen: 3, types: ['steel'], stats: [80, 75, 150, 75, 150, 50], moves: ['iron-head', 'earthquake', 'ice-punch', 'thunderbolt'] },
  { id: 380, name: 'Latias', gen: 3, types: ['dragon', 'psychic'], stats: [80, 80, 90, 110, 130, 110], moves: ['draco-meteor', 'psychic', 'surf', 'thunderbolt'] },
  { id: 381, name: 'Latios', gen: 3, types: ['dragon', 'psychic'], stats: [80, 90, 80, 130, 110, 110], moves: ['draco-meteor', 'psychic', 'surf', 'thunderbolt'] },
  { id: 382, name: 'Kyogre', gen: 3, types: ['water'], stats: [100, 100, 90, 150, 140, 90], moves: ['water-spout', 'hydro-pump', 'ice-beam', 'thunder'] },
  { id: 383, name: 'Groudon', gen: 3, types: ['ground'], stats: [100, 150, 140, 100, 90, 90], moves: ['earthquake', 'fire-blast', 'stone-edge', 'solar-beam'] },
  { id: 384, name: 'Rayquaza', gen: 3, types: ['dragon', 'flying'], stats: [105, 150, 90, 150, 90, 95], moves: ['dragon-ascent', 'outrage', 'extreme-speed', 'earthquake'] },
  { id: 385, name: 'Jirachi', gen: 3, types: ['steel', 'psychic'], stats: [100, 100, 100, 100, 100, 100], moves: ['iron-head', 'psychic', 'thunderbolt', 'dazzling-gleam'] },
  { id: 386, name: 'Deoxys', gen: 3, types: ['psychic'], stats: [50, 150, 50, 150, 50, 150], moves: ['psycho-boost', 'superpower', 'shadow-ball', 'extreme-speed'] },

  // === GEN 4 ===
  { id: 389, name: 'Torterra', gen: 4, types: ['grass', 'ground'], stats: [95, 109, 105, 75, 85, 56], moves: ['wood-hammer', 'earthquake', 'stone-edge', 'crunch'] },
  { id: 392, name: 'Infernape', gen: 4, types: ['fire', 'fighting'], stats: [76, 104, 71, 104, 71, 108], moves: ['flare-blitz', 'close-combat', 'mach-punch', 'u-turn'] },
  { id: 395, name: 'Empoleon', gen: 4, types: ['water', 'steel'], stats: [84, 86, 88, 111, 101, 60], moves: ['hydro-pump', 'flash-cannon', 'ice-beam', 'drill-run'] },
  { id: 398, name: 'Staraptor', gen: 4, types: ['normal', 'flying'], stats: [85, 120, 70, 50, 60, 100], moves: ['brave-bird', 'close-combat', 'double-edge', 'u-turn'] },
  { id: 405, name: 'Luxray', gen: 4, types: ['electric'], stats: [80, 120, 79, 95, 79, 70], moves: ['wild-charge', 'volt-tackle', 'crunch', 'superpower'] },
  { id: 407, name: 'Roserade', gen: 4, types: ['grass', 'poison'], stats: [60, 70, 65, 125, 105, 90], moves: ['sludge-bomb', 'energy-ball', 'giga-drain', 'dazzling-gleam'] },
  { id: 409, name: 'Rampardos', gen: 4, types: ['rock'], stats: [97, 165, 60, 65, 50, 58], moves: ['head-smash', 'stone-edge', 'earthquake', 'fire-punch'] },
  { id: 411, name: 'Bastiodon', gen: 4, types: ['rock', 'steel'], stats: [60, 52, 168, 47, 138, 30], moves: ['iron-head', 'stone-edge', 'earthquake', 'heavy-slam'] },
  { id: 416, name: 'Vespiquen', gen: 4, types: ['bug', 'flying'], stats: [70, 80, 102, 80, 102, 40], moves: ['attack-order', 'air-slash', 'bug-buzz', 'sludge-bomb'] },
  { id: 419, name: 'Floatzel', gen: 4, types: ['water'], stats: [85, 105, 55, 85, 50, 115], moves: ['wave-crash', 'waterfall', 'ice-punch', 'aqua-jet'] },
  { id: 423, name: 'Gastrodon', gen: 4, types: ['water', 'ground'], stats: [111, 83, 68, 92, 82, 39], moves: ['earth-power', 'scald', 'ice-beam', 'sludge-bomb'] },
  { id: 424, name: 'Ambipom', gen: 4, types: ['normal'], stats: [75, 100, 66, 60, 66, 115], moves: ['double-hit', 'u-turn', 'fake-out', 'knock-off'] },
  { id: 426, name: 'Drifblim', gen: 4, types: ['ghost', 'flying'], stats: [150, 80, 44, 90, 54, 80], moves: ['shadow-ball', 'air-slash', 'thunderbolt', 'acrobatics'] },
  { id: 428, name: 'Lopunny', gen: 4, types: ['normal'], stats: [65, 76, 84, 54, 96, 105], moves: ['high-jump-kick', 'return', 'quick-attack', 'ice-punch'] },
  { id: 429, name: 'Mismagius', gen: 4, types: ['ghost'], stats: [60, 60, 60, 105, 105, 105], moves: ['shadow-ball', 'dazzling-gleam', 'thunderbolt', 'psychic'] },
  { id: 430, name: 'Honchkrow', gen: 4, types: ['dark', 'flying'], stats: [100, 125, 52, 105, 52, 71], moves: ['brave-bird', 'sucker-punch', 'night-slash', 'superpower'] },
  { id: 435, name: 'Skuntank', gen: 4, types: ['poison', 'dark'], stats: [103, 93, 67, 71, 61, 84], moves: ['poison-jab', 'crunch', 'sucker-punch', 'fire-blast'] },
  { id: 437, name: 'Bronzong', gen: 4, types: ['steel', 'psychic'], stats: [67, 89, 116, 79, 116, 33], moves: ['gyro-ball', 'psychic', 'earthquake', 'iron-head'] },
  { id: 442, name: 'Spiritomb', gen: 4, types: ['ghost', 'dark'], stats: [50, 92, 108, 92, 108, 35], moves: ['shadow-ball', 'dark-pulse', 'sucker-punch', 'psychic'] },
  { id: 445, name: 'Garchomp', gen: 4, types: ['dragon', 'ground'], stats: [108, 130, 95, 80, 85, 102], moves: ['earthquake', 'dragon-claw', 'stone-edge', 'outrage'] },
  { id: 448, name: 'Lucario', gen: 4, types: ['fighting', 'steel'], stats: [70, 110, 70, 115, 70, 90], moves: ['close-combat', 'meteor-mash', 'extreme-speed', 'aura-sphere'] },
  { id: 450, name: 'Hippowdon', gen: 4, types: ['ground'], stats: [108, 112, 118, 68, 72, 47], moves: ['earthquake', 'stone-edge', 'crunch', 'ice-fang'] },
  { id: 452, name: 'Drapion', gen: 4, types: ['poison', 'dark'], stats: [70, 90, 110, 60, 75, 95], moves: ['cross-poison', 'crunch', 'earthquake', 'swords-dance'] },
  { id: 454, name: 'Toxicroak', gen: 4, types: ['poison', 'fighting'], stats: [83, 106, 65, 86, 65, 85], moves: ['gunk-shot', 'drain-punch', 'sucker-punch', 'ice-punch'] },
  { id: 460, name: 'Abomasnow', gen: 4, types: ['grass', 'ice'], stats: [90, 92, 75, 92, 85, 60], moves: ['blizzard', 'wood-hammer', 'ice-shard', 'earthquake'] },
  { id: 461, name: 'Weavile', gen: 4, types: ['dark', 'ice'], stats: [70, 120, 65, 45, 85, 125], moves: ['knock-off', 'icicle-crash', 'ice-shard', 'poison-jab'] },
  { id: 462, name: 'Magnezone', gen: 4, types: ['electric', 'steel'], stats: [70, 70, 115, 130, 90, 60], moves: ['thunderbolt', 'flash-cannon', 'volt-switch', 'body-press'] },
  { id: 463, name: 'Lickilicky', gen: 4, types: ['normal'], stats: [110, 85, 95, 80, 95, 50], moves: ['body-slam', 'earthquake', 'knock-off', 'explosion'] },
  { id: 464, name: 'Rhyperior', gen: 4, types: ['ground', 'rock'], stats: [115, 140, 130, 55, 55, 40], moves: ['earthquake', 'stone-edge', 'megahorn', 'ice-punch'] },
  { id: 465, name: 'Tangrowth', gen: 4, types: ['grass'], stats: [100, 100, 125, 110, 50, 50], moves: ['giga-drain', 'leaf-storm', 'knock-off', 'earthquake'] },
  { id: 466, name: 'Electivire', gen: 4, types: ['electric'], stats: [75, 123, 67, 95, 85, 95], moves: ['wild-charge', 'cross-chop', 'ice-punch', 'earthquake'] },
  { id: 467, name: 'Magmortar', gen: 4, types: ['fire'], stats: [75, 95, 67, 125, 95, 83], moves: ['fire-blast', 'thunderbolt', 'focus-blast', 'psychic'] },
  { id: 468, name: 'Togekiss', gen: 4, types: ['fairy', 'flying'], stats: [85, 50, 95, 120, 115, 80], moves: ['air-slash', 'dazzling-gleam', 'aura-sphere', 'flamethrower'] },
  { id: 469, name: 'Yanmega', gen: 4, types: ['bug', 'flying'], stats: [86, 76, 86, 116, 56, 95], moves: ['bug-buzz', 'air-slash', 'giga-drain', 'shadow-ball'] },
  { id: 470, name: 'Leafeon', gen: 4, types: ['grass'], stats: [65, 110, 130, 60, 65, 95], moves: ['leaf-blade', 'x-scissor', 'iron-tail', 'quick-attack'] },
  { id: 471, name: 'Glaceon', gen: 4, types: ['ice'], stats: [65, 60, 110, 130, 95, 65], moves: ['ice-beam', 'blizzard', 'shadow-ball', 'ice-shard'] },
  { id: 472, name: 'Gliscor', gen: 4, types: ['ground', 'flying'], stats: [75, 95, 125, 45, 75, 95], moves: ['earthquake', 'acrobatics', 'u-turn', 'stone-edge'] },
  { id: 473, name: 'Mamoswine', gen: 4, types: ['ice', 'ground'], stats: [110, 130, 80, 70, 60, 80], moves: ['earthquake', 'icicle-crash', 'ice-shard', 'stone-edge'] },
  { id: 474, name: 'Porygon-Z', gen: 4, types: ['normal'], stats: [85, 80, 70, 135, 75, 90], moves: ['tri-attack', 'hyper-voice', 'ice-beam', 'thunderbolt'] },
  { id: 475, name: 'Gallade', gen: 4, types: ['psychic', 'fighting'], stats: [68, 125, 65, 65, 115, 80], moves: ['close-combat', 'zen-headbutt', 'psycho-cut', 'night-slash'] },
  { id: 476, name: 'Probopass', gen: 4, types: ['rock', 'steel'], stats: [60, 55, 145, 75, 150, 40], moves: ['power-gem', 'flash-cannon', 'earth-power', 'volt-switch'] },
  { id: 477, name: 'Dusknoir', gen: 4, types: ['ghost'], stats: [45, 100, 135, 65, 135, 45], moves: ['shadow-sneak', 'shadow-punch', 'earthquake', 'ice-punch'] },
  { id: 478, name: 'Froslass', gen: 4, types: ['ice', 'ghost'], stats: [70, 80, 70, 80, 70, 110], moves: ['ice-beam', 'shadow-ball', 'ice-shard', 'destiny-bond'] },
  { id: 479, name: 'Rotom', gen: 4, types: ['electric', 'ghost'], stats: [50, 50, 77, 95, 77, 91], moves: ['thunderbolt', 'shadow-ball', 'volt-switch', 'will-o-wisp'] },
  { id: 483, name: 'Dialga', gen: 4, types: ['steel', 'dragon'], stats: [100, 120, 120, 150, 100, 90], moves: ['roar-of-time', 'flash-cannon', 'earth-power', 'draco-meteor'] },
  { id: 484, name: 'Palkia', gen: 4, types: ['water', 'dragon'], stats: [90, 120, 100, 150, 120, 100], moves: ['spatial-rend', 'hydro-pump', 'draco-meteor', 'surf'] },
  { id: 485, name: 'Heatran', gen: 4, types: ['fire', 'steel'], stats: [91, 90, 106, 130, 106, 77], moves: ['magma-storm', 'earth-power', 'flash-cannon', 'flamethrower'] },
  { id: 487, name: 'Giratina', gen: 4, types: ['ghost', 'dragon'], stats: [150, 100, 120, 100, 120, 90], moves: ['shadow-force', 'draco-meteor', 'aura-sphere', 'shadow-ball'] },
  { id: 488, name: 'Cresselia', gen: 4, types: ['psychic'], stats: [120, 70, 120, 75, 130, 85], moves: ['psychic', 'moonblast', 'ice-beam', 'energy-ball'] },
  { id: 491, name: 'Darkrai', gen: 4, types: ['dark'], stats: [70, 90, 90, 135, 90, 125], moves: ['dark-pulse', 'dark-void', 'focus-blast', 'sludge-bomb'] }
];

// Helper to convert base stats to realistic Level 50 stats (Standard VGC 31 IVs / 85 EVs neutral)
function calculateLvl50Stats(base) {
  const [bHp, bAtk, bDef, bSpa, bSpd, bSpe] = base;
  const hp = Math.floor((2 * bHp + 31 + 10) * 50 / 100) + 50 + 10;
  const atk = Math.floor((2 * bAtk + 31 + 10) * 50 / 100) + 5;
  const def = Math.floor((2 * bDef + 31 + 10) * 50 / 100) + 5;
  const spAttack = Math.floor((2 * bSpa + 31 + 10) * 50 / 100) + 5;
  const spDefense = Math.floor((2 * bSpd + 31 + 10) * 50 / 100) + 5;
  const speed = Math.floor((2 * bSpe + 31 + 10) * 50 / 100) + 5;
  return { hp, attack: atk, defense: def, spAttack, spDefense, speed };
}

// Set of Legendaries & Mythicals to exclude
const LEGENDARY_IDS = new Set([
  // Gen 1
  144, 145, 146, 150, 151,
  // Gen 2
  243, 244, 245, 249, 250, 251,
  // Gen 3
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
  // Gen 4
  480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493
]);

const NON_LEGENDARY_ROSTER = ROSTER_DEF.filter((p) => !LEGENDARY_IDS.has(p.id));

console.log(`Generating non-legendary roster with ${NON_LEGENDARY_ROSTER.length} Pokemon...`);

const fileContent = `import type { BattlePokemon } from '../types/battle';
import { getMove } from './battleMoves';

export interface RosterEntry extends BattlePokemon {
  gen: 1 | 2 | 3 | 4;
}

export function buildSprites(id: number) {
  return {
    front: \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/\${id}.png\`,
    back: \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/\${id}.png\`,
    showdownFront: \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/\${id}.gif\`,
    showdownBack: \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/\${id}.gif\`,
    artwork: \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${id}.png\`
  };
}

const RAW_ROSTER = ${JSON.stringify(NON_LEGENDARY_ROSTER, null, 2)};

export const FULL_ROSTER: RosterEntry[] = RAW_ROSTER.map((item: any) => {
  const [bHp, bAtk, bDef, bSpa, bSpd, bSpe] = item.stats;
  const maxHp = Math.floor((2 * bHp + 31 + 10) * 50 / 100) + 60;
  const stats = {
    hp: maxHp,
    attack: Math.floor((2 * bAtk + 31 + 10) * 50 / 100) + 5,
    defense: Math.floor((2 * bDef + 31 + 10) * 50 / 100) + 5,
    spAttack: Math.floor((2 * bSpa + 31 + 10) * 50 / 100) + 5,
    spDefense: Math.floor((2 * bSpd + 31 + 10) * 50 / 100) + 5,
    speed: Math.floor((2 * bSpe + 31 + 10) * 50 / 100) + 5
  };

  return {
    id: item.id,
    name: item.name,
    gen: item.gen,
    types: item.types,
    level: 50,
    maxHp,
    currentHp: maxHp,
    stats,
    sprites: buildSprites(item.id),
    fainted: false,
    moves: item.moves.map((mId: string) => getMove(mId))
  };
});
`;

fs.writeFileSync(path.resolve('src/data/battleRoster.ts'), fileContent, 'utf-8');
console.log('src/data/battleRoster.ts created successfully!');
