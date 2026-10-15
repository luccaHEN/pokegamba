import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive spawn and item-summoning mapping for Legendaries, Mythicals, and Ultra Beasts
const SPECIAL_SPAWNS = {
  // Gen 1
  144: {
    name: 'articuno',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded', 'air'],
    biomes: ['#cobblemon:is_freezing', '#cobblemon:is_mountain'],
    summonType: 'shrine',
    requiredItem: 'Pena de Gelo (Ice Feather) / Orbe Congelado',
    summonGuide: 'Encontre o Altar do Gelo em picos nevados (altitude Y > 120) durante uma nevasca e ative-o segurando o item.',
    note: 'Nevasca / Chuva congelante em picos altos (Y > 120)'
  },
  145: {
    name: 'zapdos',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded', 'air'],
    biomes: ['#cobblemon:is_mountain', '#cobblemon:is_savanna'],
    summonType: 'shrine',
    requiredItem: 'Pena de Raio (Thunder Feather) / Orbe Elétrico',
    summonGuide: 'Localize o Altar da Tempestade em montanhas ou savanas e ative com a pena durante uma tempestade de raios.',
    note: 'Tempestades com raios em picos ou savanas abertas'
  },
  146: {
    name: 'moltres',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded', 'air'],
    biomes: ['#cobblemon:is_volcanic', '#cobblemon:is_badlands', '#minecraft:is_nether'],
    summonType: 'shrine',
    requiredItem: 'Pena de Fogo (Fire Feather) / Orbe de Fogo',
    summonGuide: 'Localize o Altar do Fogo em biomas vulcânicos ou deltas de basalto no Nether com o item de fogo.',
    note: 'Calor extremo, terras de basalto ou lagos de lava'
  },
  150: {
    name: 'mewtwo',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70-100',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_deep_dark', '#cobblemon:is_caves'],
    summonType: 'item',
    requiredItem: 'DNA de Mew + Tubo de Clonagem (Cloning Machine)',
    summonGuide: 'Encontre o laboratório subterrâneo abandonado em Cidades Antigas (Deep Dark) ou monte uma Máquina de Clonagem com DNA de Mew.',
    note: 'Profundezas de Cidades Antigas ou ruínas subterrâneas abandonadas'
  },
  151: {
    name: 'mew',
    category: 'mythical',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_jungle', '#cobblemon:is_tropical_island'],
    summonType: 'item',
    requiredItem: 'Mapa Marítimo Antigo (Old Sea Map) / Diário de Bordo',
    summonGuide: 'Raro em baús de navios naufragados; leve o mapa até uma ilha de selva tropical para fazê-lo aparecer entre os cipós.',
    note: 'Coração de selvas densas e templos de pirâmides da floresta'
  },

  // Gen 2
  243: {
    name: 'raikou',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_savanna', '#cobblemon:is_plains'],
    summonType: 'item',
    requiredItem: 'Sino do Trovão (Thunder Bell)',
    summonGuide: 'Toque o sino no monumento da Torre Queimada (Burned Tower) ou segure em savanas durante uma tempestade de raios.',
    note: 'Campos abertos e savanas durante tempestades'
  },
  244: {
    name: 'entei',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_badlands', '#cobblemon:is_volcanic', '#cobblemon:nether/is_basalt'],
    summonType: 'item',
    requiredItem: 'Sino do Fogo (Fire Bell)',
    summonGuide: 'Toque o sino no monumento da Torre Queimada ou perto de lagos de magma em biomas de terracota/basalto.',
    note: 'Áreas áridas vulcânicas ou deltas de basalto'
  },
  245: {
    name: 'suicune',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['surface', 'grounded'],
    biomes: ['#cobblemon:is_freshwater', '#cobblemon:is_beach'],
    summonType: 'item',
    requiredItem: 'Sino das Ondas (Wave Bell)',
    summonGuide: 'Toque o sino no monumento da Torre Queimada ou à beira de um lago cristalino ao amanhecer.',
    note: 'Margens de rios límpidos, praias e lagos cristalinos'
  },
  249: {
    name: 'lugia',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['submerged', 'surface'],
    biomes: ['#cobblemon:is_ocean'],
    summonType: 'item',
    requiredItem: 'Sino da Maré (Tidal Bell) + Pena de Prata (Silver Feather)',
    summonGuide: 'Toque o Sino da Maré em cavernas marinhas do Oceano Profundo em noites tempestuosas de lua cheia.',
    note: 'Fossas oceânicas profundas durante noites tempestuosas'
  },
  250: {
    name: 'ho-oh',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded', 'air'],
    biomes: ['#cobblemon:is_mountain', '#cobblemon:is_hills'],
    summonType: 'item',
    requiredItem: 'Sino Claro (Clear Bell) + Pena Arco-Íris (Rainbow Feather)',
    summonGuide: 'Coloque no topo do Altar da Torre dos Sinos e toque exatamente ao meio-dia sob céu limpo ensolarado.',
    note: 'Picos sagrados e torres com céu aberto durante o dia'
  },
  251: {
    name: 'celebi',
    category: 'mythical',
    bucket: 'ultra-rare',
    level: '30-50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_forest', 'minecraft:cherry_grove'],
    summonType: 'shrine',
    requiredItem: 'GS Ball (Pokébola GS)',
    summonGuide: 'Coloque a Pokébola GS no Santuário da Floresta (Ilex Shrine) no coração de um bosque florido para o guardião do tempo descer.',
    note: 'Florestas antigas e bosques de cerejeiras em dias floridos'
  },

  // Gen 3
  377: {
    name: 'regirock',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_desert', '#cobblemon:is_badlands'],
    summonType: 'shrine',
    requiredItem: 'Núcleo de Pedra Antigo (Rock Core)',
    summonGuide: 'Interaja com o selo das Ruínas do Deserto (Desert Ruins) quebrando o enigma das estátuas de arenito.',
    note: 'Pirâmides do deserto ou templos de pedra antigos'
  },
  378: {
    name: 'regice',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_freezing'],
    summonType: 'shrine',
    requiredItem: 'Núcleo de Gelo Eterno (Ice Core)',
    summonGuide: 'Ative o monumento congelado nas profundezas de um iceberg ou caverna de gelo compacto.',
    note: 'Icebergs profundos e picos de gelo compactado'
  },
  379: {
    name: 'registeel',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_caves'],
    summonType: 'shrine',
    requiredItem: 'Núcleo de Metal Antigo (Steel Core)',
    summonGuide: 'Ative o monumento de ferro antigo em cavernas subterrâneas profundas cercadas por minérios brutos.',
    note: 'Cavernas profundas com veios de ferro e metal bruto'
  },
  380: {
    name: 'latias',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['air', 'grounded'],
    biomes: ['#cobblemon:is_beach', '#cobblemon:is_tropical_island'],
    summonType: 'item',
    requiredItem: 'Soul Dew (Orvalho da Alma) ou Ticket Eon',
    summonGuide: 'Segure a Soul Dew no inventário em ilhas tropicais ensolaradas perto da praia.',
    note: 'Ilhas tropicais e céus litorâneos ensolarados'
  },
  381: {
    name: 'latios',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['air', 'grounded'],
    biomes: ['#cobblemon:is_beach', '#cobblemon:is_tropical_island'],
    summonType: 'item',
    requiredItem: 'Soul Dew (Orvalho da Alma) ou Ticket Eon',
    summonGuide: 'Segure a Soul Dew no inventário em ilhas tropicais ensolaradas perto da praia.',
    note: 'Ilhas tropicais e céus litorâneos ensolarados'
  },
  382: {
    name: 'kyogre',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['submerged'],
    biomes: ['#cobblemon:is_ocean'],
    summonType: 'item',
    requiredItem: 'Orbe Azul (Blue Orb)',
    summonGuide: 'Mergulhe no fundo de um oceano profundo durante uma chuva torrencial e ative o Altar do Oceano com o Blue Orb.',
    note: 'Profundezas dos oceanos durante chuva torrencial (Orbe Azul)'
  },
  383: {
    name: 'groudon',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_desert', '#cobblemon:nether/is_basalt'],
    summonType: 'item',
    requiredItem: 'Orbe Vermelho (Red Orb)',
    summonGuide: 'Vá a um deserto ensolarado ou ao mar de magma nos Deltas de Basalto do Nether com o Red Orb para despertar o titã da terra.',
    note: 'Desertos secos e lagos de magma no Nether (Orbe Vermelho)'
  },
  384: {
    name: 'rayquaza',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['air'],
    biomes: ['#cobblemon:is_mountain'],
    summonType: 'item',
    requiredItem: 'Orbe de Jade (Jade Orb) ou Fragmento de Meteorito',
    summonGuide: 'Construa ou suba até o topo do mundo (Altitude Y > 220) em céu limpo e ative o Altar dos Céus com o Orbe de Jade.',
    note: 'Topo do mundo (Y > 220) em céu limpo e aberto'
  },
  385: {
    name: 'jirachi',
    category: 'mythical',
    bucket: 'ultra-rare',
    level: '30',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_mountain'],
    summonType: 'item',
    requiredItem: 'Papel de Desejos (Wish Tag) ou Fragmento de Estrela',
    summonGuide: 'Interaja com o Altar Estelar em picos montanhosos exatamente à meia-noite durante chuva de estrelas cadentes.',
    note: 'Picos altos à meia-noite sob chuva de estrelas cadentes'
  },
  386: {
    name: 'deoxys',
    category: 'mythical',
    bucket: 'ultra-rare',
    level: '60',
    positions: ['grounded', 'air'],
    biomes: ['#minecraft:is_end'],
    summonType: 'shrine',
    requiredItem: 'Fragmento de Meteorito Extraterrestre',
    summonGuide: 'Coloque o fragmento de meteorito na cratera cósmica das ilhas exteriores do The End.',
    note: 'Crateras de meteoros ou dimensão do The End'
  },

  // Gen 4
  483: {
    name: 'dialga',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#minecraft:is_end', '#cobblemon:is_mountain'],
    summonType: 'shrine',
    requiredItem: 'Orbe Adamante (Adamant Orb)',
    summonGuide: 'Encontre o Pilar da Lança (Spear Pillar) nas montanhas mais altas ou no The End e insira o Adamant Orb no pilar azul.',
    note: 'Pilar da Lança no topo de montanhas celestiais ou The End'
  },
  484: {
    name: 'palkia',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#minecraft:is_end', '#cobblemon:is_mountain'],
    summonType: 'shrine',
    requiredItem: 'Orbe Lustroso (Lustrous Orb)',
    summonGuide: 'Encontre o Pilar da Lança (Spear Pillar) nas montanhas mais altas ou no The End e insira o Lustrous Orb no pilar rosa.',
    note: 'Fendas espaciais em montanhas ou ilhas do The End'
  },
  486: {
    name: 'regigigas',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_caves', '#cobblemon:is_temperate'],
    summonType: 'shrine',
    requiredItem: 'Trio de Regis (Regirock, Regice, Registeel) na sua equipe ativa',
    summonGuide: 'Leve os três golens (Regirock, Regice e Registeel) na equipe até a estátua selada nas profundezas do Templo Antigo e clique para despertá-lo.',
    note: 'Templos subterrâneos ancestrais (Requer o trio de Regis)'
  },
  487: {
    name: 'giratina',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#minecraft:is_nether', '#cobblemon:is_deep_dark'],
    summonType: 'shrine',
    requiredItem: 'Orbe Griseo (Griseous Orb)',
    summonGuide: 'Ative o portal do Mundo Distorcido no coração de uma Cidade Ancestral (Deep Dark) ou no Nether segurando o Griseous Orb.',
    note: 'Mundo Distorcido / Cidades Ancestrais e portais do Nether'
  },
  491: {
    name: 'darkrai',
    category: 'mythical',
    bucket: 'ultra-rare',
    level: '50',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_spooky', '#cobblemon:is_forest'],
    summonType: 'item',
    requiredItem: 'Pena da Lua Nova (Lunar Feather / Nightmare Shard)',
    summonGuide: 'Durma em uma cama dentro de uma floresta sombria durante a noite de lua nova tendo o fragmento de pesadelo no inventário.',
    note: 'Florestas escuras sob lua nova e áreas assombradas'
  },
  493: {
    name: 'arceus',
    category: 'mythical',
    bucket: 'ultra-rare',
    level: '100',
    positions: ['air', 'grounded'],
    biomes: ['#minecraft:is_end', '#cobblemon:is_mountain'],
    summonType: 'shrine',
    requiredItem: 'Flauta Celestial (Azure Flute) + 16 Placas de Tipo (Plates)',
    summonGuide: 'Suba ao Altar da Criação nas ilhas celestiais ou The End e toque a Flauta Celestial (Azure Flute) para abrir a escada de vidro e enfrentar o Criador.',
    note: 'Altar da Criação / Flauta Celestial no zênite do mundo'
  },

  // Gen 5
  643: {
    name: 'reshiram',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_mountain', '#cobblemon:is_volcanic'],
    summonType: 'item',
    requiredItem: 'Pedra da Luz (Light Stone)',
    summonGuide: 'Interaja com o pedestal do Castelo Ancestral no topo de picos vulcânicos para despertar o Dragão da Verdade.',
    note: 'Torres brancas e montanhas vulcânicas (Orbe de Luz)'
  },
  644: {
    name: 'zekrom',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_mountain', '#cobblemon:is_savanna'],
    summonType: 'item',
    requiredItem: 'Pedra das Trevas (Dark Stone)',
    summonGuide: 'Interaja com o pedestal do Castelo Ancestral sob chuva e relâmpagos para despertar o Dragão dos Ideais.',
    note: 'Torres escuras sob chuva elétrica (Orbe da Escuridão)'
  },
  646: {
    name: 'kyurem',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_freezing'],
    summonType: 'item',
    requiredItem: 'DNA Splicers (Emendador de DNA)',
    summonGuide: 'Encontrado no Abismo Gigante (Giant Chasm) congelado. Use o DNA Splicers para fundi-lo com Reshiram (White Kyurem) ou Zekrom (Black Kyurem).',
    note: 'Crateras de gelo eterno e cavernas congeladas'
  },

  // Gen 6
  716: {
    name: 'xerneas',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_forest', 'minecraft:cherry_grove'],
    summonType: 'shrine',
    requiredItem: 'Árvore da Vida Adormecida',
    summonGuide: 'Encontre a grande árvore multicolorida adormecida em bosques florestais e toque-a com pó de osso luminoso para acordar o cervo da vida.',
    note: 'Árvore da Vida em florestas ancestrais'
  },
  717: {
    name: 'yveltal',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['air', 'grounded'],
    biomes: ['#cobblemon:is_spooky', '#minecraft:is_nether'],
    summonType: 'shrine',
    requiredItem: 'Casulo da Destruição',
    summonGuide: 'Encontre o casulo gigante suspenso no teto de florestas sombrias ou no Nether e perturbe seu descanso com fogo.',
    note: 'Casulo da destruição em florestas sombrias ou Nether'
  },

  // Gen 7 - Ultra Beasts
  793: {
    name: 'nihilego',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded', 'submerged'],
    biomes: ['#minecraft:is_end', 'minecraft:dripstone_caves'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball + Resonador de Fendas (Wormhole Resonator)',
    summonGuide: 'Encontre uma Fenda Dimensional (Wormhole) cósmica abrindo nas ilhas do The End ou em cavernas de espeleotema.',
    note: 'Ultra Space / Fendas Dimensionais ou cavernas de espeleotema'
  },
  794: {
    name: 'buzzwole',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_jungle', '#cobblemon:is_swamp'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball + Resonador de Fendas (Wormhole Resonator)',
    summonGuide: 'Abra ou encontre uma fenda dimensional cósmica no meio de selvas densas ou pântanos lamacentos.',
    note: 'Ultra Floresta / Selvas tropicais densas e pântanos'
  },
  795: {
    name: 'pheromosa',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_desert', '#cobblemon:is_badlands'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball + Resonador de Fendas (Wormhole Resonator)',
    summonGuide: 'Surge através de portais de Ultra Space em desertos de areia branca e mesas de terracota.',
    note: 'Ultra Deserto / Oásis e areias reluzentes'
  },
  796: {
    name: 'xurkitree',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_savanna', '#minecraft:is_end'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball + Resonador de Fendas (Wormhole Resonator)',
    summonGuide: 'Aparece em savanas elétricas durante tempestades com relâmpagos ou em torres de plantas do The End.',
    note: 'Ultra Usina / Savana sob tempestade com raios ou The End'
  },
  797: {
    name: 'celesteela',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded', 'air'],
    biomes: ['#cobblemon:is_mountain', '#minecraft:is_end'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball + Resonador de Fendas (Wormhole Resonator)',
    summonGuide: 'Pousa como um foguete vivo do Ultra Espaço em picos nevados elevados ou no The End.',
    note: 'Ultra Cratera / Picos montanhosos e ilhas distantes do End'
  },
  798: {
    name: 'kartana',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded'],
    biomes: ['minecraft:bamboo_jungle', '#cobblemon:is_forest'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball + Resonador de Fendas (Wormhole Resonator)',
    summonGuide: 'Corta através de fendas dimensionais em densos bosques de bambu e florestas.',
    note: 'Ultra Floresta de Espadas / Selvas de bambu'
  },
  799: {
    name: 'guzzlord',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_deep_dark', '#minecraft:is_nether'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball + Resonador de Fendas (Wormhole Resonator)',
    summonGuide: 'Surge devorando blocos em Cidades Ancestrais do Deep Dark ou nas profundezas de lava do Nether.',
    note: 'Ultra Ruínas / Cidades Ancestrais do Deep Dark e abismos do Nether'
  },
  803: {
    name: 'poipole',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '40',
    positions: ['grounded'],
    biomes: ['#minecraft:is_end'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball',
    summonGuide: 'Pequena criatura que surge em estruturas e cidades da dimensão do The End.',
    note: 'Ultra Megalópolis / Cidades do The End'
  },
  804: {
    name: 'naganadel',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60',
    positions: ['air', 'grounded'],
    biomes: ['#minecraft:is_end'],
    summonType: 'item',
    requiredItem: 'Poipole com o ataque Dragon Pulse (Pulso do Dragão)',
    summonGuide: 'Ensine o golpe Dragon Pulse para o Poipole e suba 1 nível com ele no The End.',
    note: 'Evolução de Poipole aprendendo Dragon Pulse no The End'
  },
  805: {
    name: 'stakataka',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_badlands', '#minecraft:is_nether'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball',
    summonGuide: 'Surge como uma muralha de blocos vivos em fortalezas do Nether e desfiladeiros de terracota.',
    note: 'Ultra Muralha / Fortalezas do Nether e desfiladeiros de terracota'
  },
  806: {
    name: 'blacephalon',
    category: 'ultra-beast',
    bucket: 'ultra-rare',
    level: '60-70',
    positions: ['grounded'],
    biomes: ['#cobblemon:nether/is_warped', '#cobblemon:is_spooky'],
    summonType: 'wormhole',
    requiredItem: 'Beast Ball',
    summonGuide: 'Explode de fendas dimensionais em Florestas Distorcidas do Nether ou florestas sombrias à noite.',
    note: 'Ultra Carnaval / Florestas Distorcidas do Nether à noite'
  },

  // Gen 8
  888: {
    name: 'zacian',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_forest', 'minecraft:cherry_grove'],
    summonType: 'shrine',
    requiredItem: 'Espada Enferrujada (Rusted Sword)',
    summonGuide: 'Encontre o Altar dos Reis no Bosque da Névoa (Slumbering Weald) e interaja segurando a Espada Enferrujada.',
    note: 'Bosque Adormecido / Florestas com névoa densa (Espada Enferrujada)'
  },
  889: {
    name: 'zamazenta',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '70',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_mountain', '#cobblemon:is_forest'],
    summonType: 'shrine',
    requiredItem: 'Escudo Enferrujado (Rusted Shield)',
    summonGuide: 'Encontre o Altar dos Reis no Bosque da Névoa (Slumbering Weald) e interaja segurando o Escudo Enferrujado.',
    note: 'Bosque Adormecido / Cordilheiras rochosas (Escudo Enferrujado)'
  },

  // Gen 9
  1001: {
    name: 'wo-chien',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '60',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_swamp', '#cobblemon:is_forest'],
    summonType: 'shrine',
    requiredItem: '8 Estacas Roxas (Purple Stakes)',
    summonGuide: 'Procure e retire as 8 estacas roxas cravadas pelo solo nos pântanos para quebrar as correntes do Santuário.',
    note: 'Santuário da Folha Púrpura (Pântanos e folhas decaídas)'
  },
  1002: {
    name: 'chien-pao',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '60',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_freezing'],
    summonType: 'shrine',
    requiredItem: '8 Estacas Amarelas (Yellow Stakes)',
    summonGuide: 'Procure e retire as 8 estacas amarelas cravadas pelo solo em picos e encostas nevadas para quebrar o selo de gelo.',
    note: 'Santuário da Geada Branca (Picos nevados congelados)'
  },
  1003: {
    name: 'ting-lu',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '60',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_caves', '#cobblemon:is_badlands'],
    summonType: 'shrine',
    requiredItem: '8 Estacas Verdes (Green Stakes)',
    summonGuide: 'Procure e retire as 8 estacas verdes cravadas pelo solo em desfiladeiros e cavernas para despertar o titã de pedra.',
    note: 'Santuário da Terra Verde (Gargantas de rocha e cavernas)'
  },
  1004: {
    name: 'chi-yu',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '60',
    positions: ['submerged', 'grounded'],
    biomes: ['#cobblemon:is_volcanic', '#cobblemon:nether/is_basalt'],
    summonType: 'shrine',
    requiredItem: '8 Estacas Azuis (Blue Stakes)',
    summonGuide: 'Procure e retire as 8 estacas azuis cravadas pelo solo perto de lagos e quedas de lava para libertar o peixe de chamas.',
    note: 'Santuário do Fogo Azul (Lagos de lava e quedas d\'água ígneas)'
  },
  1007: {
    name: 'koraidon',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '72',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_caves'],
    summonType: 'item',
    requiredItem: 'Livro Escarlate (Scarlet Book) / Cristal Ancestral',
    summonGuide: 'Desça até as profundezas da Grande Cratera subterrânea (Altitude Y < -30) onde a névoa do passado se acumula.',
    note: 'Profundezas da Grande Cratera (Camada Y < -30)'
  },
  1008: {
    name: 'miraidon',
    category: 'legendary',
    bucket: 'ultra-rare',
    level: '72',
    positions: ['grounded'],
    biomes: ['#cobblemon:is_caves'],
    summonType: 'item',
    requiredItem: 'Livro Violeta (Violet Book) / Cristal Futurista',
    summonGuide: 'Desça até o Laboratório Zero na Grande Cratera subterrânea (Altitude Y < -30) onde a energia elétrica futurista flui.',
    note: 'Laboratório Zero na Grande Cratera (Camada Y < -30)'
  },
};

function main() {
  const datasetPath = path.resolve(__dirname, '../public/data/cobblemon_spawns.json');
  let currentData = {};
  if (fs.existsSync(datasetPath)) {
    currentData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  }

  let count = 0;
  for (const [idStr, info] of Object.entries(SPECIAL_SPAWNS)) {
    const id = parseInt(idStr, 10);
    currentData[id] = {
      id,
      name: info.name,
      bucket: info.bucket,
      level: info.level,
      category: info.category,
      summonType: info.summonType,
      requiredItem: info.requiredItem,
      summonGuide: info.summonGuide,
      positions: info.positions,
      biomes: info.biomes,
      anticonditions: [],
      specialNote: info.note,
    };
    count++;
  }

  fs.writeFileSync(datasetPath, JSON.stringify(currentData, null, 2), 'utf-8');
  console.log(`Sucesso! Guia completo de itens e invocação gerado para ${count} Pokémon lendários e Ultra Beasts.`);
}

main();
