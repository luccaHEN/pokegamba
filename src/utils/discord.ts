import type { Pokemon } from '../types/pokemon';

const TYPE_EMOJIS: Record<string, string> = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌿',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️',
  ground: '🏜️',
  flying: '🦅',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨',
};

export function formatLotteryForDiscord(
  pokemons: Pokemon[],
  participants?: string[],
  filters?: string[]
): string {
  const lines: string[] = [];

  lines.push('# 🎰 ` POKEGAMBA ` • RESULTADO DO SORTEIO 🎲');
  lines.push('');

  const hasParticipants = participants && participants.some((p) => Boolean(p && p.trim()));

  if (hasParticipants && participants) {
    // Group by participant
    const groups = new Map<string, Pokemon[]>();
    const unassigned: Pokemon[] = [];

    pokemons.forEach((pokemon, idx) => {
      const owner = participants[idx]?.trim();
      if (owner) {
        if (!groups.has(owner)) {
          groups.set(owner, []);
        }
        groups.get(owner)!.push(pokemon);
      } else {
        unassigned.push(pokemon);
      }
    });

    groups.forEach((pokeList, owner) => {
      lines.push(`### 👑 Treinador: \` ${owner} \` (${pokeList.length} Pokémon)`);
      pokeList.forEach((pokemon) => {
        const primaryType = pokemon.types[0]?.type.name || 'normal';
        const emoji = TYPE_EMOJIS[primaryType] || '⭐';
        const typeNames = pokemon.types.map((t) => t.type.name.toUpperCase()).join(' / ');
        const idFormatted = `#${String(pokemon.id).padStart(4, '0')}`;
        const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

        lines.push(`> ${emoji} **${capitalizedName}** \`[${idFormatted}]\` • **[ ${typeNames} ]**`);
      });
      lines.push('');
    });

    if (unassigned.length > 0) {
      lines.push(`### 🎲 Sem Treinador Atribuído (${unassigned.length})`);
      unassigned.forEach((pokemon) => {
        const primaryType = pokemon.types[0]?.type.name || 'normal';
        const emoji = TYPE_EMOJIS[primaryType] || '⭐';
        const typeNames = pokemon.types.map((t) => t.type.name.toUpperCase()).join(' / ');
        const idFormatted = `#${String(pokemon.id).padStart(4, '0')}`;
        const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

        lines.push(`> ${emoji} **${capitalizedName}** \`[${idFormatted}]\` • **[ ${typeNames} ]**`);
      });
      lines.push('');
    }
  } else {
    // Numbered list
    lines.push('### 📦 Pokémon Sorteados:');
    pokemons.forEach((pokemon, idx) => {
      const primaryType = pokemon.types[0]?.type.name || 'normal';
      const emoji = TYPE_EMOJIS[primaryType] || '⭐';
      const typeNames = pokemon.types.map((t) => t.type.name.toUpperCase()).join(' / ');
      const idFormatted = `#${String(pokemon.id).padStart(4, '0')}`;
      const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

      lines.push(`> \`${idx + 1}.\` ${emoji} **${capitalizedName}** \`[${idFormatted}]\` • **[ ${typeNames} ]**`);
    });
    lines.push('');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (filters && filters.length > 0) {
    lines.push(`🎯 **Filtros Utilizados:** \`${filters.join(' • ')}\``);
  }

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Falha ao copiar texto:', err);
    return false;
  }
}
