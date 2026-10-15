export interface CobblemonBiomeInfo {
  raw: string;
  label: string;
  icon: string;
  description?: string;
}

export interface CobblemonSpawnData {
  enabled: boolean;
  pokemonName: string;
  pokemonId: number;
  highestRarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare' | 'none';
  category?: 'legendary' | 'ultra-beast' | 'mythical' | 'standard';
  summonType?: 'item' | 'shrine' | 'wormhole' | 'event';
  requiredItem?: string;
  summonGuide?: string;
  specialNote?: string;
  levelRange: string;
  positions: string[];
  uniqueBiomes: CobblemonBiomeInfo[];
  anticonditionBiomes?: CobblemonBiomeInfo[];
  timeRanges?: string[];
  conditions?: {
    requiresRain?: boolean;
    requiresThunder?: boolean;
    structures?: string[];
    nearbyBlocks?: string[];
  };
}

const BIOME_MAP: Record<string, { label: string; icon: string; description: string }> = {
  // Overworld & Gerais
  '#cobblemon:is_overworld': { label: 'Superfície do Overworld', icon: '🌍', description: 'Maioria dos biomas comuns terrestres' },
  '#cobblemon:is_forest': { label: 'Florestas (Forest)', icon: '🌲', description: 'Florestas de carvalho, bétula e densas' },
  '#cobblemon:is_jungle': { label: 'Selvas e Florestas Tropicais (Jungle)', icon: '🌴', description: 'Selvas com bambu e cipós' },
  '#cobblemon:is_plains': { label: 'Planícies (Plains)', icon: '🌾', description: 'Campos abertos e pradarias' },
  '#cobblemon:is_grassland': { label: 'Pradarias e Pastagens (Grassland)', icon: '🌿', description: 'Campos verdejantes com grama alta' },
  '#cobblemon:is_floral': { label: 'Campos Floridos & Florais', icon: '🌸', description: 'Florestas de flores, prados floridos e pradarias de girassol' },
  '#cobblemon:is_cherry_blossom': { label: 'Bosque de Cerejeiras (Cherry Grove)', icon: '🌸', description: 'Árvores de cerejeira e pétalas caindo' },
  'minecraft:cherry_grove': { label: 'Bosque de Cerejeiras (Cherry Grove)', icon: '🌸', description: 'Árvores de cerejeira e pétalas caindo' },
  'minecraft:sunflower_plains': { label: 'Planície dos Girassóis', icon: '🌻', description: 'Campos densos repletos de girassóis' },
  '#cobblemon:is_bamboo': { label: 'Florestas de Bambu (Bamboo)', icon: '🎋', description: 'Selvas densas repletas de talos de bambu' },
  '#cobblemon:is_magical': { label: 'Biomas Mágicos & Encantados', icon: '✨', description: 'Áreas raras com energia mística natural' },
  '#cobblemon:is_arid': { label: 'Biomas Áridos', icon: '🏜️', description: 'Desertos, savanas secas e badlands' },
  '#cobblemon:is_desert': { label: 'Deserto (Desert)', icon: '🏜️', description: 'Dunas de areia quente e oásis' },
  '#cobblemon:is_badlands': { label: 'Terras Ermas (Badlands / Mesa)', icon: '🏜️', description: 'Montanhas de terracota avermelhada' },
  '#cobblemon:is_mountain': { label: 'Montanhas e Picos Altos', icon: '⛰️', description: 'Picos rochosos e encostas elevadas' },
  '#cobblemon:is_peak': { label: 'Picos Escarpados & Cumes', icon: '🏔️', description: 'Topos pontiagudos de montanhas rochosas' },
  '#cobblemon:is_highlands': { label: 'Terras Altas (Highlands)', icon: '⛰️', description: 'Planalto rochoso elevado com vegetação rasteira' },
  '#cobblemon:is_plateau': { label: 'Platôs e Chapadas', icon: '🏜️', description: 'Grandes elevações planas no topo de montanhas' },
  '#cobblemon:is_hills': { label: 'Colinas e Encostas', icon: '🏔️', description: 'Elevações de relevo no Overworld' },
  '#cobblemon:is_shrubland': { label: 'Arbustais e Matas Secas', icon: '🌾', description: 'Vegetação arbustiva em clima semiárido' },
  '#cobblemon:is_ocean': { label: 'Oceanos Profundos (Ocean)', icon: '🌊', description: 'Águas abertas e fossas marinhas' },
  '#cobblemon:is_deep_ocean': { label: 'Oceanos Profundos & Abissais', icon: '🐋', description: 'Profundezas oceânicas escuras' },
  '#cobblemon:is_warm_ocean': { label: 'Oceanos Quentes & Recifes de Coral', icon: '🪸', description: 'Águas tropicais cristalinas com corais' },
  '#cobblemon:is_lukewarm_ocean': { label: 'Oceanos Mornos (Lukewarm)', icon: '🐠', description: 'Águas costeiras temperadas a mornas' },
  '#cobblemon:is_temperate_ocean': { label: 'Oceanos Temperados', icon: '🌊', description: 'Mares de temperatura amena' },
  '#cobblemon:is_cold_ocean': { label: 'Oceanos Frios', icon: '🌊', description: 'Águas geladas do norte' },
  '#cobblemon:is_frozen_ocean': { label: 'Oceanos Congelados & Icebergs', icon: '🧊', description: 'Placas de gelo e icebergs flutuantes' },
  '#cobblemon:is_beach': { label: 'Praias e Litoral (Beach)', icon: '🏖️', description: 'Faixa litorânea de areia' },
  '#cobblemon:is_coast': { label: 'Costas e Enseadas', icon: '🏖️', description: 'Transição entre terra firme e o mar' },
  '#cobblemon:is_sandy': { label: 'Terrenos Arenosos', icon: '🏖️', description: 'Extensões de areia costeiras ou desérticas' },
  'minecraft:snowy_beach': { label: 'Praia Nevada', icon: '❄️', description: 'Costas cobertas de neve à beira-mar' },
  '#cobblemon:is_freshwater': { label: 'Água Doce (Rios e Lagos)', icon: '💧', description: 'Margens e leitos de rios e lagoas' },
  '#cobblemon:is_river': { label: 'Rios (River)', icon: '🏞️', description: 'Corpos d\'água fluviais cortando o relevo' },
  'minecraft:frozen_river': { label: 'Rio Congelado', icon: '🧊', description: 'Cursos d\'água com superfície de gelo' },
  '#cobblemon:is_swamp': { label: 'Pântanos e Manguezais', icon: '🌿', description: 'Lama, vitória-régia e mangues' },
  '#cobblemon:has_block/mud': { label: 'Zonas Lamacentas (Mangues)', icon: '🪵', description: 'Terrenos pantanosos com lama e raízes' },
  '#cobblemon:is_freezing': { label: 'Biomas Glaciais e Neve', icon: '❄️', description: 'Planícies nevadas, taigas frias e gelo' },
  '#cobblemon:is_snowy': { label: 'Biomas com Neve', icon: '❄️', description: 'Áreas cobertas por mantos de neve' },
  '#cobblemon:is_snowy_forest': { label: 'Florestas Nevadas', icon: '🌲', description: 'Bosques com copas cobertas de neve' },
  '#cobblemon:is_snowy_taiga': { label: 'Taiga Nevada', icon: '🌲', description: 'Pinheiros cobertos de neve' },
  '#cobblemon:is_glacial': { label: 'Picos Glaciais & Gelo Compacto', icon: '🧊', description: 'Geleiras antigas de gelo azul' },
  '#cobblemon:is_cold': { label: 'Regiões Frias', icon: '🌨️', description: 'Climas boreais de baixa temperatura' },
  '#cobblemon:is_tundra': { label: 'Tundra Ártica', icon: '🌨️', description: 'Planícies frias com vegetação rasteira' },
  '#cobblemon:is_taiga': { label: 'Taigas e Pinhais', icon: '🌲', description: 'Florestas de pinheiros e abetos' },
  '#cobblemon:is_savanna': { label: 'Savana (Savanna)', icon: '🦁', description: 'Árvores de acácia e grama alta' },
  '#cobblemon:is_tropical_island': { label: 'Ilhas Tropicais', icon: '🏝️', description: 'Ilhas oceânicas ensolaradas' },
  '#cobblemon:is_island': { label: 'Ilhas Marinhas', icon: '🏝️', description: 'Porções de terra cercadas por água' },
  '#cobblemon:is_temperate': { label: 'Biomas Temperados', icon: '🍃', description: 'Clima ameno do Overworld' },
  '#cobblemon:is_caves': { label: 'Cavernas Subterrâneas', icon: '⛏️', description: 'Subterrâneo abaixo do nível Y 0' },
  '#cobblemon:is_deep_dark': { label: 'Deep Dark & Cidades Antigas', icon: '💀', description: 'Profundezas com blocos de sculk' },
  '#cobblemon:is_spooky': { label: 'Locais Sombrios e Noturnos', icon: '👻', description: 'Áreas ermas de baixa luminosidade' },
  '#cobblemon:is_volcanic': { label: 'Biomas Vulcânicos', icon: '🌋', description: 'Áreas quentes com rochas de basalto' },
  '#cobblemon:is_lush': { label: 'Cavernas Exuberantes (Lush Caves)', icon: '🌺', description: 'Cavernas com musgo, azaleias e bagas luminosas' },
  'minecraft:lush_caves': { label: 'Cavernas Exuberantes (Lush Caves)', icon: '🌺', description: 'Cavernas com musgo, azaleias e bagas luminosas' },
  '#cobblemon:is_dripstone': { label: 'Cavernas de Espeleotema (Dripstone)', icon: '🪨', description: 'Cavernas pontiagudas de estalactite' },
  'minecraft:dripstone_caves': { label: 'Cavernas de Espeleotema (Dripstone)', icon: '🪨', description: 'Cavernas pontiagudas de estalactite' },
  '#cobblemon:is_mushroom': { label: 'Ilhas dos Cogumelos (Mushroom)', icon: '🍄', description: 'Campos roxos de micélio e cogumelos gigantes' },
  'minecraft:mushroom_fields': { label: 'Campos de Cogumelos', icon: '🍄', description: 'Ilhas roxas de micélio sem monstros' },
  '#cobblemon:is_sky': { label: 'Céus Abertos & Altitudes Elevadas', icon: '☁️', description: 'Camada aérea acima das nuvens' },

  // Nether
  '#cobblemon:is_nether': { label: 'Dimensão do Nether', icon: '🔥', description: 'Inferno de lava, fortalezas e carmesim' },
  '#minecraft:is_nether': { label: 'Dimensão do Nether', icon: '🔥', description: 'Inferno de lava, fortalezas e carmesim' },
  '#cobblemon:nether/is_basalt': { label: 'Deltas de Basalto (Nether)', icon: '🌋', description: 'Nether vulcânico com cinzas e magma' },
  '#cobblemon:nether/is_crimson': { label: 'Floresta Carmesim (Nether)', icon: '🍄', description: 'Fungos vermelhos e piglins' },
  '#cobblemon:nether/is_warped': { label: 'Floresta Distorcida (Nether)', icon: '🍄', description: 'Fungos azulados e endermen' },
  '#cobblemon:nether/is_soul_sand': { label: 'Vale das Almas (Nether)', icon: '💀', description: 'Areia de almas e fogo azul' },
  '#cobblemon:nether/is_desert': { label: 'Desertos do Nether', icon: '🔥', description: 'Planícies quentes de netherrack' },
  '#cobblemon:nether/is_wasteland': { label: 'Terras Devastadas do Nether', icon: '🌋', description: 'Áreas centrais desoladas do Nether' },
  '#cobblemon:nether/is_fungus': { label: 'Bosques Fúngicos do Nether', icon: '🍄', description: 'Florestas de cogumelos do submundo' },
  '#cobblemon:nether/is_toxic': { label: 'Pântanos Tóxicos do Nether', icon: '🧪', description: 'Zonas com vapores nocivos' },
  '#cobblemon:nether/is_quartz': { label: 'Jazidas de Quartzo (Nether)', icon: '💎', description: 'Cavernas repletas de minérios de quartzo' },

  // The End
  '#cobblemon:is_end': { label: 'Dimensão do The End', icon: '🔮', description: 'Ilhas do End com pedras de extremidade' },
  '#minecraft:is_end': { label: 'Dimensão do The End', icon: '🔮', description: 'Ilhas do End com pedras de extremidade' },

  // Modded Dimensions & Biomes (Aether, Bumblezone, Biomes O' Plenty)
  '#aether:is_aether': { label: 'Dimensão do Aether', icon: '🕊️', description: 'Ilhas celestes flutuantes com vegetação dourada' },
  'aether:skyroot_forest': { label: 'Floresta de Skyroot (Aether)', icon: '🕊️', description: 'Bosques celestes de árvores de skyroot' },
  'aether:skyroot_woodland': { label: 'Bosques de Skyroot (Aether)', icon: '🕊️', description: 'Bosques abertos na dimensão do Aether' },
  'aether:skyroot_grove': { label: 'Arvoredo de Skyroot (Aether)', icon: '🕊️', description: 'Campos celestiais com arvoredo sagrado' },
  'aether:skyroot_meadow': { label: 'Pradaria Celeste (Aether)', icon: '🕊️', description: 'Prados de flores celestiais no Aether' },
  '#the_bumblezone:the_bumblezone': { label: 'Dimensão Bumblezone', icon: '🐝', description: 'Colmeia dimensional repleta de mel e abelhas' },
  'the_bumblezone:floral_meadow': { label: 'Prado Floral da Colmeia', icon: '🐝', description: 'Jardins floridos subterrâneos do Bumblezone' },
  'the_bumblezone:pollinated_fields': { label: 'Campos Polinizados (Bumblezone)', icon: '🍯', description: 'Campos dourados carregados de pólen' },
  'the_bumblezone:crystal_canyon': { label: 'Cânion de Cristais (Bumblezone)', icon: '✨', description: 'Cânions de mel cristalizado' },
  'biomesoplenty:crystalline_chasm': { label: 'Abismo Cristalino (Biomes O\' Plenty)', icon: '💎', description: 'Ravina subterrânea de cristais resplandecentes' },
  'minecraft:sulfur_caves': { label: 'Cavernas de Enxofre', icon: '♨️', description: 'Cavernas profundas com gases de enxofre' },
};

function formatBiomeTag(raw: string): CobblemonBiomeInfo {
  if (BIOME_MAP[raw]) {
    return {
      raw,
      label: BIOME_MAP[raw].label,
      icon: BIOME_MAP[raw].icon,
      description: BIOME_MAP[raw].description,
    };
  }

  // Generic fallback formatter for custom or modded tags (e.g. aether:skyroot_forest)
  const clean = raw
    .replace(/^#/, '')
    .replace(/^cobblemon:is_/, '')
    .replace(/^cobblemon:/, '')
    .replace(/^minecraft:is_/, '')
    .replace(/^minecraft:/, '')
    .split('/')
    .pop()!
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    raw,
    label: clean,
    icon: '🗺️',
    description: `Bioma: ${raw}`,
  };
}

let datasetCache: Record<string, any> | null = null;
let datasetPromise: Promise<Record<string, any> | null> | null = null;

async function loadDataset(): Promise<Record<string, any> | null> {
  if (datasetCache) return datasetCache;
  if (datasetPromise) return datasetPromise;

  datasetPromise = (async () => {
    try {
      // 1. Try sessionStorage cache
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem('cobblemon_full_dataset_v2');
        if (stored) {
          datasetCache = JSON.parse(stored);
          return datasetCache;
        }
      }

      // 2. Fetch static bundle
      const res = await fetch('/data/cobblemon_spawns.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      datasetCache = data;

      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('cobblemon_full_dataset_v2', JSON.stringify(data));
        }
      } catch {}

      return data;
    } catch (err) {
      console.warn('Falha ao carregar dataset local de spawns do Cobblemon:', err);
      return null;
    } finally {
      datasetPromise = null;
    }
  })();

  return datasetPromise;
}

export interface CobblemonDropEntry {
  item: string;
  quantityRange: string;
  percentage: number;
}

export interface CobblemonPokemonDrops {
  id: number;
  name: string;
  primaryType?: string;
  secondaryType?: string;
  amount: number;
  entries: CobblemonDropEntry[];
}

export interface CobblemonItemSource {
  pokemonId: number;
  pokemonName: string;
  primaryType?: string;
  secondaryType?: string;
  quantityRange: string;
  percentage: number;
}

let dropsCache: Record<number, CobblemonPokemonDrops> | null = null;
let itemLootCache: Record<string, CobblemonItemSource[]> | null = null;

export const cobblemonService = {
  async getSpawnData(pokemonId: number, pokemonName: string): Promise<CobblemonSpawnData | null> {
    const dataset = await loadDataset();
    if (!dataset) return null;

    const entry = dataset[pokemonId];
    if (!entry) return null;

    const biomesList: CobblemonBiomeInfo[] = (entry.biomes || []).map((b: string) => formatBiomeTag(b));
    const anticonditionsList: CobblemonBiomeInfo[] = (entry.anticonditions || []).map((b: string) => formatBiomeTag(b));

    const levelRange = entry.level ? `Lv. ${entry.level}` : 'Variável';

    return {
      enabled: true,
      pokemonName: entry.name || pokemonName,
      pokemonId,
      highestRarity: entry.bucket || 'common',
      category: entry.category,
      summonType: entry.summonType,
      requiredItem: entry.requiredItem,
      summonGuide: entry.summonGuide,
      specialNote: entry.specialNote,
      levelRange,
      positions: entry.positions || ['grounded'],
      uniqueBiomes: biomesList,
      anticonditionBiomes: anticonditionsList,
      timeRanges: entry.timeRanges,
      conditions: entry.conditions,
    };
  },

  async getPokemonDrops(pokemonId: number): Promise<CobblemonPokemonDrops | null> {
    if (dropsCache) return dropsCache[pokemonId] || null;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem('cobblemon_drops_dataset');
        if (stored) {
          dropsCache = JSON.parse(stored);
          return dropsCache ? dropsCache[pokemonId] || null : null;
        }
      }

      const res = await fetch('/data/cobblemon_drops.json');
      if (!res.ok) return null;
      const data = await res.json();
      dropsCache = data;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('cobblemon_drops_dataset', JSON.stringify(data));
        }
      } catch {}
      return data[pokemonId] || null;
    } catch {
      return null;
    }
  },

  async getAllItemLoot(): Promise<Record<string, CobblemonItemSource[]>> {
    if (itemLootCache) return itemLootCache;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem('cobblemon_item_loot_dataset');
        if (stored) {
          itemLootCache = JSON.parse(stored);
          return itemLootCache || {};
        }
      }

      const res = await fetch('/data/cobblemon_item_loot.json');
      if (!res.ok) return {};
      const data = await res.json();
      itemLootCache = data;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('cobblemon_item_loot_dataset', JSON.stringify(data));
        }
      } catch {}
      return data;
    } catch {
      return {};
    }
  },

  async getAllPokemonDrops(): Promise<Record<number, CobblemonPokemonDrops>> {
    if (dropsCache) return dropsCache;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem('cobblemon_drops_dataset');
        if (stored) {
          dropsCache = JSON.parse(stored);
          return dropsCache || {};
        }
      }

      const res = await fetch('/data/cobblemon_drops.json');
      if (!res.ok) return {};
      const data = await res.json();
      dropsCache = data;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('cobblemon_drops_dataset', JSON.stringify(data));
        }
      } catch {}
      return data;
    } catch {
      return {};
    }
  }
};

