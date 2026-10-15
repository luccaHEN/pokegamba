export interface FossilData {
  id: string;
  fossilName: string;
  pokemonId: number;
  pokemonName: string;
  generation: string;
  miningLocation: string;
  restorationMachine: string;
  description: string;
}

export const COBBLEMON_FOSSILS: FossilData[] = [
  {
    id: 'helix',
    fossilName: 'Helix Fossil (Fóssil Hélix)',
    pokemonId: 138,
    pokemonName: 'Omanyte',
    generation: 'Geração 1 (Kanto)',
    miningLocation: 'Blocos de Cascalho Suspeito em Ruínas Oceânicas e cavernas costeiras.',
    restorationMachine: 'Fossil Machine (Limpador e Revitalizador de Fóssil)',
    description: 'Um fóssil marinho espiral que preserva a concha de um molusco pré-histórico extinto.'
  },
  {
    id: 'dome',
    fossilName: 'Dome Fossil (Fóssil Domo)',
    pokemonId: 140,
    pokemonName: 'Kabuto',
    generation: 'Geração 1 (Kanto)',
    miningLocation: 'Areia Suspeita em ruínas submarinas e sedimentos do fundo do mar.',
    restorationMachine: 'Fossil Machine',
    description: 'Carapaça fóssil redonda e dura pertencente a um artrópode primitivo de águas profundas.'
  },
  {
    id: 'old-amber',
    fossilName: 'Old Amber (Âmbar Antigo)',
    pokemonId: 142,
    pokemonName: 'Aerodactyl',
    generation: 'Geração 1 (Kanto)',
    miningLocation: 'Minerado raramente em veios de minério em cavernas profundas ou troncos petrificados.',
    restorationMachine: 'Fossil Machine',
    description: 'Pedaço de resina fossilizada translúcida que contém material genético do feroz réptil alado.'
  },
  {
    id: 'root',
    fossilName: 'Root Fossil (Fóssil Raiz)',
    pokemonId: 345,
    pokemonName: 'Lileep',
    generation: 'Geração 3 (Hoenn)',
    miningLocation: 'Areia e arenito em desertos, cânions de terracota e templos de deserto.',
    restorationMachine: 'Fossil Machine',
    description: 'Planta marinha ancestral que vivia fixada no leito oceânico há milhões de anos.'
  },
  {
    id: 'claw',
    fossilName: 'Claw Fossil (Fóssil Garra)',
    pokemonId: 347,
    pokemonName: 'Anorith',
    generation: 'Geração 3 (Hoenn)',
    miningLocation: 'Sedimentos áridos em desertos e ruínas antigas enterradas.',
    restorationMachine: 'Fossil Machine',
    description: 'Garra fossilizada endurecida de um crustáceo pré-histórico caçador.'
  },
  {
    id: 'skull',
    fossilName: 'Skull Fossil (Fóssil Crânio)',
    pokemonId: 408,
    pokemonName: 'Cranidos',
    generation: 'Geração 4 (Sinnoh)',
    miningLocation: 'Minérios subterrâneos de ardósia profunda (Deepslate) e cavernas rochosas.',
    restorationMachine: 'Fossil Machine',
    description: 'Crânio espesso e rígido em formato de domo capaz de desferir investidas destrutivas.'
  },
  {
    id: 'armor',
    fossilName: 'Armor Fossil (Fóssil Armadura)',
    pokemonId: 410,
    pokemonName: 'Shieldon',
    generation: 'Geração 4 (Sinnoh)',
    miningLocation: 'Camadas profundas de ardósia (Deepslate) e cavernas subterrâneas.',
    restorationMachine: 'Fossil Machine',
    description: 'Escudo facial impenetrável que resistia aos mais fortes predadores da pré-história.'
  },
  {
    id: 'cover',
    fossilName: 'Cover Fossil (Fóssil Cobertura)',
    pokemonId: 564,
    pokemonName: 'Tirtouga',
    generation: 'Geração 5 (Unova)',
    miningLocation: 'Cascalho submerso, fossas oceânicas e monumentos oceânicos abandonados.',
    restorationMachine: 'Fossil Machine',
    description: 'Carapaça de tartaruga ancestral que habitava oceanos quentes do passado.'
  },
  {
    id: 'plume',
    fossilName: 'Plume Fossil (Fóssil Pluma)',
    pokemonId: 566,
    pokemonName: 'Archen',
    generation: 'Geração 5 (Unova)',
    miningLocation: 'Rochas sedimentares em montanhas altas e penhascos.',
    restorationMachine: 'Fossil Machine',
    description: 'Pena ancestral fossilizada do que se acredita ser o antepassado de todos os Pokémon pássaros.'
  },
  {
    id: 'jaw',
    fossilName: 'Jaw Fossil (Fóssil Mandíbula)',
    pokemonId: 696,
    pokemonName: 'Tyrunt',
    generation: 'Geração 6 (Kalos)',
    miningLocation: 'Cavernas de ardósia profunda e fósseis gigantes subterrâneos.',
    restorationMachine: 'Fossil Machine',
    description: 'Mandíbula de dentes gigantescos capaz de triturar blocos sólidos com facilidade.'
  },
  {
    id: 'sail',
    fossilName: 'Sail Fossil (Fóssil Vela)',
    pokemonId: 698,
    pokemonName: 'Amaura',
    generation: 'Geração 6 (Kalos)',
    miningLocation: 'Gelo compactado e camadas glaciais subterrâneas (Frozen Peaks / Cavernas de Gelo).',
    restorationMachine: 'Fossil Machine',
    description: 'Vela dorsal preservada pelo frio de um dócil saurópode da era do gelo.'
  },
  {
    id: 'bird-dino',
    fossilName: 'Fossilized Bird & Dino (Pássaro & Dino)',
    pokemonId: 880,
    pokemonName: 'Dracozolt',
    generation: 'Geração 8 (Galar)',
    miningLocation: 'Areia suspeita e escavações raras em ruínas de Galar.',
    restorationMachine: 'Restaurador de Fósseis Quiméricos',
    description: 'Combinação restaurada da parte superior de uma ave ancestral com a cauda de um dinossauro.'
  },
  {
    id: 'fish-dino',
    fossilName: 'Fossilized Fish & Dino (Peixe & Dino)',
    pokemonId: 882,
    pokemonName: 'Dracovish',
    generation: 'Geração 8 (Galar)',
    miningLocation: 'Escavações submarinas em ruínas antigas.',
    restorationMachine: 'Restaurador de Fósseis Quiméricos',
    description: 'Combinação de uma cabeça de peixe carnívoro pré-histórico com o corpo de um réptil gigante.'
  }
];
