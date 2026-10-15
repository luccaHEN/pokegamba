export interface NatureData {
  id: string;
  name: string;
  increasedStat: 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed' | null;
  decreasedStat: 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed' | null;
  increasedStatLabel: string;
  decreasedStatLabel: string;
  flavorLike: string;
  flavorDislike: string;
  summary: string;
}

export const COBBLEMON_NATURES: NatureData[] = [
  // --- Aumenta Ataque (Attack) ---
  {
    id: 'lonely',
    name: 'Lonely',
    increasedStat: 'attack',
    decreasedStat: 'defense',
    increasedStatLabel: '+10% Ataque',
    decreasedStatLabel: '-10% Defesa',
    flavorLike: 'Picante (Spicy)',
    flavorDislike: 'Azedo (Sour)',
    summary: 'Aumenta Ataque e diminui Defesa física.'
  },
  {
    id: 'brave',
    name: 'Brave',
    increasedStat: 'attack',
    decreasedStat: 'speed',
    increasedStatLabel: '+10% Ataque',
    decreasedStatLabel: '-10% Velocidade',
    flavorLike: 'Picante (Spicy)',
    flavorDislike: 'Doce (Sweet)',
    summary: 'Excelente para atacantes físicos em times de Trick Room.'
  },
  {
    id: 'adamant',
    name: 'Adamant',
    increasedStat: 'attack',
    decreasedStat: 'special-attack',
    increasedStatLabel: '+10% Ataque',
    decreasedStatLabel: '-10% Ataque Especial',
    flavorLike: 'Picante (Spicy)',
    flavorDislike: 'Seco (Dry)',
    summary: 'A melhor nature para atacantes físicos puros que não usam golpes especiais.'
  },
  {
    id: 'naughty',
    name: 'Naughty',
    increasedStat: 'attack',
    decreasedStat: 'special-defense',
    increasedStatLabel: '+10% Ataque',
    decreasedStatLabel: '-10% Defesa Especial',
    flavorLike: 'Picante (Spicy)',
    flavorDislike: 'Amargo (Bitter)',
    summary: 'Aumenta Ataque físico com redução em Defesa Especial.'
  },

  // --- Aumenta Defesa (Defense) ---
  {
    id: 'bold',
    name: 'Bold',
    increasedStat: 'defense',
    decreasedStat: 'attack',
    increasedStatLabel: '+10% Defesa',
    decreasedStatLabel: '-10% Ataque',
    flavorLike: 'Azedo (Sour)',
    flavorDislike: 'Picante (Spicy)',
    summary: 'Excelente para suportes e tanques defensivos físicos.'
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    increasedStat: 'defense',
    decreasedStat: 'speed',
    increasedStatLabel: '+10% Defesa',
    decreasedStatLabel: '-10% Velocidade',
    flavorLike: 'Azedo (Sour)',
    flavorDislike: 'Doce (Sweet)',
    summary: 'Aumenta Defesa física e reduz Velocidade.'
  },
  {
    id: 'impish',
    name: 'Impish',
    increasedStat: 'defense',
    decreasedStat: 'special-attack',
    increasedStatLabel: '+10% Defesa',
    decreasedStatLabel: '-10% Ataque Especial',
    flavorLike: 'Azedo (Sour)',
    flavorDislike: 'Seco (Dry)',
    summary: 'Excelente para tanques físicos que ainda atacam fisicamente (ex: Skarmory, Corviknight).'
  },
  {
    id: 'lax',
    name: 'Lax',
    increasedStat: 'defense',
    decreasedStat: 'special-defense',
    increasedStatLabel: '+10% Defesa',
    decreasedStatLabel: '-10% Defesa Especial',
    flavorLike: 'Azedo (Sour)',
    flavorDislike: 'Amargo (Bitter)',
    summary: 'Aumenta Defesa física e diminui Defesa Especial.'
  },

  // --- Aumenta Ataque Especial (Sp. Atk) ---
  {
    id: 'modest',
    name: 'Modest',
    increasedStat: 'special-attack',
    decreasedStat: 'attack',
    increasedStatLabel: '+10% Ataque Especial',
    decreasedStatLabel: '-10% Ataque',
    flavorLike: 'Seco (Dry)',
    flavorDislike: 'Picante (Spicy)',
    summary: 'A nature clássica para atacantes especiais puros (ex: Alakazam, Gardevoir).'
  },
  {
    id: 'mild',
    name: 'Mild',
    increasedStat: 'special-attack',
    decreasedStat: 'defense',
    increasedStatLabel: '+10% Ataque Especial',
    decreasedStatLabel: '-10% Defesa',
    flavorLike: 'Seco (Dry)',
    flavorDislike: 'Azedo (Sour)',
    summary: 'Aumenta Sp. Atk e diminui Defesa física.'
  },
  {
    id: 'quiet',
    name: 'Quiet',
    increasedStat: 'special-attack',
    decreasedStat: 'speed',
    increasedStatLabel: '+10% Ataque Especial',
    decreasedStatLabel: '-10% Velocidade',
    flavorLike: 'Seco (Dry)',
    flavorDislike: 'Doce (Sweet)',
    summary: 'Perfeito para atacantes especiais lentos em times de Trick Room.'
  },
  {
    id: 'rash',
    name: 'Rash',
    increasedStat: 'special-attack',
    decreasedStat: 'special-defense',
    increasedStatLabel: '+10% Ataque Especial',
    decreasedStatLabel: '-10% Defesa Especial',
    flavorLike: 'Seco (Dry)',
    flavorDislike: 'Amargo (Bitter)',
    summary: 'Aumenta Sp. Atk e diminui Sp. Def.'
  },

  // --- Aumenta Defesa Especial (Sp. Def) ---
  {
    id: 'calm',
    name: 'Calm',
    increasedStat: 'special-defense',
    decreasedStat: 'attack',
    increasedStatLabel: '+10% Defesa Especial',
    decreasedStatLabel: '-10% Ataque',
    flavorLike: 'Amargo (Bitter)',
    flavorDislike: 'Picante (Spicy)',
    summary: 'Excelente para tanques e barreiras especiais (ex: Blissey, Sylveon).'
  },
  {
    id: 'gentle',
    name: 'Gentle',
    increasedStat: 'special-defense',
    decreasedStat: 'defense',
    increasedStatLabel: '+10% Defesa Especial',
    decreasedStatLabel: '-10% Defesa',
    flavorLike: 'Amargo (Bitter)',
    flavorDislike: 'Azedo (Sour)',
    summary: 'Aumenta Defesa Especial e reduz Defesa física.'
  },
  {
    id: 'sassy',
    name: 'Sassy',
    increasedStat: 'special-defense',
    decreasedStat: 'speed',
    increasedStatLabel: '+10% Defesa Especial',
    decreasedStatLabel: '-10% Velocidade',
    flavorLike: 'Amargo (Bitter)',
    flavorDislike: 'Doce (Sweet)',
    summary: 'Usada em defensores especiais que atuam sob Trick Room.'
  },
  {
    id: 'careful',
    name: 'Careful',
    increasedStat: 'special-defense',
    decreasedStat: 'special-attack',
    increasedStatLabel: '+10% Defesa Especial',
    decreasedStatLabel: '-10% Ataque Especial',
    flavorLike: 'Amargo (Bitter)',
    flavorDislike: 'Seco (Dry)',
    summary: 'Ideal para Pokémon defensivos especiais com golpes físicos (ex: Tyranitar, Snorlax).'
  },

  // --- Aumenta Velocidade (Speed) ---
  {
    id: 'timid',
    name: 'Timid',
    increasedStat: 'speed',
    decreasedStat: 'attack',
    increasedStatLabel: '+10% Velocidade',
    decreasedStatLabel: '-10% Ataque',
    flavorLike: 'Doce (Sweet)',
    flavorDislike: 'Picante (Spicy)',
    summary: 'A nature mais popular para atacantes especiais rápidos (ex: Gengar, Greninja).'
  },
  {
    id: 'hasty',
    name: 'Hasty',
    increasedStat: 'speed',
    decreasedStat: 'defense',
    increasedStatLabel: '+10% Velocidade',
    decreasedStatLabel: '-10% Defesa',
    flavorLike: 'Doce (Sweet)',
    flavorDislike: 'Azedo (Sour)',
    summary: 'Aumenta Velocidade e diminui Defesa física.'
  },
  {
    id: 'jolly',
    name: 'Jolly',
    increasedStat: 'speed',
    decreasedStat: 'special-attack',
    increasedStatLabel: '+10% Velocidade',
    decreasedStatLabel: '-10% Ataque Especial',
    flavorLike: 'Doce (Sweet)',
    flavorDislike: 'Seco (Dry)',
    summary: 'A nature mais popular para atacantes físicos rápidos (ex: Garchomp, Weavile).'
  },
  {
    id: 'naive',
    name: 'Naive',
    increasedStat: 'speed',
    decreasedStat: 'special-defense',
    increasedStatLabel: '+10% Velocidade',
    decreasedStatLabel: '-10% Defesa Especial',
    flavorLike: 'Doce (Sweet)',
    flavorDislike: 'Amargo (Bitter)',
    summary: 'Muito usada em atacantes mistos (físico + especial) velozes.'
  },

  // --- Neutras (Sem alteração) ---
  {
    id: 'hardy',
    name: 'Hardy',
    increasedStat: null,
    decreasedStat: null,
    increasedStatLabel: 'Neutro (0%)',
    decreasedStatLabel: 'Neutro (0%)',
    flavorLike: 'Qualquer sabor',
    flavorDislike: 'Nenhum',
    summary: 'Não altera nenhum atributo.'
  },
  {
    id: 'docile',
    name: 'Docile',
    increasedStat: null,
    decreasedStat: null,
    increasedStatLabel: 'Neutro (0%)',
    decreasedStatLabel: 'Neutro (0%)',
    flavorLike: 'Qualquer sabor',
    flavorDislike: 'Nenhum',
    summary: 'Não altera nenhum atributo.'
  },
  {
    id: 'serious',
    name: 'Serious',
    increasedStat: null,
    decreasedStat: null,
    increasedStatLabel: 'Neutro (0%)',
    decreasedStatLabel: 'Neutro (0%)',
    flavorLike: 'Qualquer sabor',
    flavorDislike: 'Nenhum',
    summary: 'Não altera nenhum atributo.'
  },
  {
    id: 'bashful',
    name: 'Bashful',
    increasedStat: null,
    decreasedStat: null,
    increasedStatLabel: 'Neutro (0%)',
    decreasedStatLabel: 'Neutro (0%)',
    flavorLike: 'Qualquer sabor',
    flavorDislike: 'Nenhum',
    summary: 'Não altera nenhum atributo.'
  },
  {
    id: 'quirky',
    name: 'Quirky',
    increasedStat: null,
    decreasedStat: null,
    increasedStatLabel: 'Neutro (0%)',
    decreasedStatLabel: 'Neutro (0%)',
    flavorLike: 'Qualquer sabor',
    flavorDislike: 'Nenhum',
    summary: 'Não altera nenhum atributo.'
  }
];
