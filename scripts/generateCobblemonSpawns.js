import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchAllSpawnFiles() {
  console.log('1. Buscando lista de arquivos de spawn do Cobblemon...');
  const allTreeItems = [];

  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tree?path=common/src/main/resources/data/cobblemon/spawn_pool_world&per_page=100&page=${page}`);
    if (!res.ok) break;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    allTreeItems.push(...data.filter(d => d.type === 'blob' && d.name.endsWith('.json') && d.name !== '0000_empty.json'));
  }

  console.log(`Encontrados ${allTreeItems.length} arquivos de spawn.`);
  return allTreeItems;
}

async function downloadAndCompile(treeItems) {
  console.log('2. Baixando e compilando regras de spawn...');
  const compiled = {};
  const batchSize = 35;

  const rarityRank = {
    'ultra-rare': 4,
    'rare': 3,
    'uncommon': 2,
    'common': 1,
  };

  for (let i = 0; i < treeItems.length; i += batchSize) {
    const batch = treeItems.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (item) => {
      try {
        const url = `https://gitlab.com/cable-mc/cobblemon/-/raw/main/${item.path}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.enabled || !Array.isArray(data.spawns) || data.spawns.length === 0) return;

        // Extract id from filename (e.g., "0025_pikachu.json" -> 25)
        const match = item.name.match(/^(\d{4})_(.+)\.json$/);
        if (!match) return;
        const pokemonId = parseInt(match[1], 10);
        const pokemonName = match[2];

        let highestBucket = 'common';
        let maxRank = 0;
        let minLevel = 999;
        let maxLevel = 0;
        const positions = new Set();
        const biomes = new Set();
        const anticonditions = new Set();

        data.spawns.forEach(s => {
          const bucket = (s.bucket || 'common').toLowerCase();
          const rank = rarityRank[bucket] || 1;
          if (rank > maxRank) {
            maxRank = rank;
            highestBucket = bucket;
          }

          if (s.level) {
            const parts = String(s.level).split('-').map(Number);
            if (parts[0] && parts[0] < minLevel) minLevel = parts[0];
            if (parts[1] && parts[1] > maxLevel) maxLevel = parts[1];
            if (parts.length === 1 && parts[0] > maxLevel) maxLevel = parts[0];
          }

          if (s.spawnablePositionType) {
            positions.add(s.spawnablePositionType);
          }

          if (Array.isArray(s.condition?.biomes)) {
            s.condition.biomes.forEach(b => biomes.add(b));
          }

          if (Array.isArray(s.anticondition?.biomes)) {
            s.anticondition.biomes.forEach(b => anticonditions.add(b));
          }
        });

        const levelRange = minLevel <= maxLevel && minLevel !== 999
          ? `${minLevel}-${maxLevel}`
          : '';

        compiled[pokemonId] = {
          id: pokemonId,
          name: pokemonName,
          bucket: highestBucket,
          level: levelRange,
          positions: Array.from(positions),
          biomes: Array.from(biomes),
          anticonditions: Array.from(anticonditions),
        };
      } catch (err) {
        // Silently continue for corrupted files
      }
    }));

    process.stdout.write(`Processados ${Math.min(i + batchSize, treeItems.length)}/${treeItems.length}...\r`);
  }

  console.log('\nProcessamento finalizado com sucesso!');
  return compiled;
}

async function main() {
  const treeItems = await fetchAllSpawnFiles();
  const compiled = await downloadAndCompile(treeItems);

  const outputDir = path.resolve(__dirname, '../public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'cobblemon_spawns.json');
  fs.writeFileSync(outputPath, JSON.stringify(compiled, null, 2), 'utf-8');
  console.log(`Arquivo salvo com sucesso em: ${outputPath}`);
  console.log(`Total de Pokémon mapeados com spawn no Cobblemon: ${Object.keys(compiled).length}`);
}

main().catch(console.error);
