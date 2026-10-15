export interface ItemDisplayInfo {
  name: string;
  category: 'held' | 'stone' | 'berry' | 'ball' | 'vanilla' | 'drop';
  categoryLabel: string;
}

export function formatItemName(rawItem: string): ItemDisplayInfo {
  const parts = rawItem.split(':');
  const namespace = parts.length > 1 ? parts[0] : 'minecraft';
  const id = parts.length > 1 ? parts[1] : parts[0];

  let category: ItemDisplayInfo['category'] = 'drop';
  let categoryLabel = 'Drop Comum';

  if (id.includes('berry')) {
    category = 'berry';
    categoryLabel = 'Baga / Berry';
  } else if (id.includes('stone') || id.includes('ore') || id.includes('shard')) {
    category = 'stone';
    categoryLabel = 'Pedra / Minério';
  } else if (id.includes('ball')) {
    category = 'ball';
    categoryLabel = 'Pokebola';
  } else if (namespace === 'minecraft') {
    category = 'vanilla';
    categoryLabel = 'Item Minecraft';
  } else {
    // Cobblemon held items / relics
    category = 'held';
    categoryLabel = 'Item de Batalha (Held)';
  }

  // Capitalize words
  const name = id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    name,
    category,
    categoryLabel,
  };
}
