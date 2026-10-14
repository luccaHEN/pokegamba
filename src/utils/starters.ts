export interface StarterPokemonDef {
  id: number;
  name: string;
  gen: number;
  type: 'grass' | 'fire' | 'water';
  generationName: string;
}

export const STARTER_POKEMON_DEFS: StarterPokemonDef[] = [
  // Gen 1 - Kanto
  { id: 1, name: 'Bulbasaur', gen: 1, type: 'grass', generationName: 'Gen 1 (Kanto)' },
  { id: 4, name: 'Charmander', gen: 1, type: 'fire', generationName: 'Gen 1 (Kanto)' },
  { id: 7, name: 'Squirtle', gen: 1, type: 'water', generationName: 'Gen 1 (Kanto)' },

  // Gen 2 - Johto
  { id: 152, name: 'Chikorita', gen: 2, type: 'grass', generationName: 'Gen 2 (Johto)' },
  { id: 155, name: 'Cyndaquil', gen: 2, type: 'fire', generationName: 'Gen 2 (Johto)' },
  { id: 158, name: 'Totodile', gen: 2, type: 'water', generationName: 'Gen 2 (Johto)' },

  // Gen 3 - Hoenn
  { id: 252, name: 'Treecko', gen: 3, type: 'grass', generationName: 'Gen 3 (Hoenn)' },
  { id: 255, name: 'Torchic', gen: 3, type: 'fire', generationName: 'Gen 3 (Hoenn)' },
  { id: 258, name: 'Mudkip', gen: 3, type: 'water', generationName: 'Gen 3 (Hoenn)' },

  // Gen 4 - Sinnoh
  { id: 387, name: 'Turtwig', gen: 4, type: 'grass', generationName: 'Gen 4 (Sinnoh)' },
  { id: 390, name: 'Chimchar', gen: 4, type: 'fire', generationName: 'Gen 4 (Sinnoh)' },
  { id: 393, name: 'Piplup', gen: 4, type: 'water', generationName: 'Gen 4 (Sinnoh)' },

  // Gen 5 - Unova
  { id: 495, name: 'Snivy', gen: 5, type: 'grass', generationName: 'Gen 5 (Unova)' },
  { id: 498, name: 'Tepig', gen: 5, type: 'fire', generationName: 'Gen 5 (Unova)' },
  { id: 501, name: 'Oshawott', gen: 5, type: 'water', generationName: 'Gen 5 (Unova)' },

  // Gen 6 - Kalos
  { id: 650, name: 'Chespin', gen: 6, type: 'grass', generationName: 'Gen 6 (Kalos)' },
  { id: 653, name: 'Fennekin', gen: 6, type: 'fire', generationName: 'Gen 6 (Kalos)' },
  { id: 656, name: 'Froakie', gen: 6, type: 'water', generationName: 'Gen 6 (Kalos)' },

  // Gen 7 - Alola
  { id: 722, name: 'Rowlet', gen: 7, type: 'grass', generationName: 'Gen 7 (Alola)' },
  { id: 725, name: 'Litten', gen: 7, type: 'fire', generationName: 'Gen 7 (Alola)' },
  { id: 728, name: 'Popplio', gen: 7, type: 'water', generationName: 'Gen 7 (Alola)' },

  // Gen 8 - Galar
  { id: 810, name: 'Grookey', gen: 8, type: 'grass', generationName: 'Gen 8 (Galar)' },
  { id: 813, name: 'Scorbunny', gen: 8, type: 'fire', generationName: 'Gen 8 (Galar)' },
  { id: 816, name: 'Sobble', gen: 8, type: 'water', generationName: 'Gen 8 (Galar)' },

  // Gen 9 - Paldea
  { id: 906, name: 'Sprigatito', gen: 9, type: 'grass', generationName: 'Gen 9 (Paldea)' },
  { id: 909, name: 'Fuecoco', gen: 9, type: 'fire', generationName: 'Gen 9 (Paldea)' },
  { id: 912, name: 'Quaxly', gen: 9, type: 'water', generationName: 'Gen 9 (Paldea)' },
];

export function getStarterSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function formatStartersDraftForDiscord(claimedStarters: Record<number, string>): string {
  const lines: string[] = [];
  lines.push('# 🌟 ` POKEGAMBA ` • DRAFT DOS 27 INICIAIS 🎲');
  lines.push('');

  const claimedEntries = Object.entries(claimedStarters);
  if (claimedEntries.length === 0) {
    lines.push('_Nenhum inicial foi sorteado ainda._');
    lines.push(`📊 **Pool:** 27/27 iniciais disponíveis para sorteio.`);
    return lines.join('\n');
  }

  const typeEmojis: Record<string, string> = {
    grass: '🌿 Grama',
    fire: '🔥 Fogo',
    water: '💧 Água',
  };

  lines.push('### 👑 Iniciais Conquistados pelos Treinadores:');
  claimedEntries.forEach(([idStr, trainer]) => {
    const id = Number(idStr);
    const def = STARTER_POKEMON_DEFS.find(s => s.id === id);
    if (def) {
      const typeStr = typeEmojis[def.type] || def.type;
      const idFormatted = `#${String(def.id).padStart(4, '0')}`;
      lines.push(`• **${trainer}** ➔ **${def.name}** (${idFormatted}) • ${typeStr} • _${def.generationName}_`);
    }
  });

  const remainingCount = 27 - claimedEntries.length;
  lines.push('');
  lines.push(`📊 **Status do Pool:** \`${remainingCount} / 27\` disponíveis para os próximos sorteios.`);

  return lines.join('\n');
}
