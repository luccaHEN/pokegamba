import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RARITY_RANK = {
  'ultra-rare': 4,
  'rare': 3,
  'uncommon': 2,
  'common': 1,
};

function compileLocalSpawns() {
  const spawnDir = path.resolve(__dirname, '../temp_spawns/common/src/main/resources/data/cobblemon/spawn_pool_world');
  if (!fs.existsSync(spawnDir)) {
    throw new Error(`Diretório de spawns não encontrado: ${spawnDir}`);
  }

  const files = fs.readdirSync(spawnDir).filter(f => f.endsWith('.json') && f !== '0000_empty.json');
  console.log(`Encontrados ${files.length} arquivos de spawn no repositório.`);

  const compiled = {};

  for (const file of files) {
    const match = file.match(/^(\d{4})_(.+)\.json$/);
    if (!match) continue;

    const pokemonId = parseInt(match[1], 10);
    const pokemonName = match[2];

    try {
      const filePath = path.join(spawnDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);

      if (!data.enabled || !Array.isArray(data.spawns) || data.spawns.length === 0) continue;

      let highestBucket = 'common';
      let maxRank = 0;
      let minLevel = 999;
      let maxLevel = 0;
      const positions = new Set();
      const biomes = new Set();
      const anticonditions = new Set();
      const timeRanges = new Set();
      let canRain = false;
      let needsThunder = false;
      let nearbyBlocks = new Set();
      let structures = new Set();

      data.spawns.forEach(s => {
        const bucket = (s.bucket || 'common').toLowerCase();
        const rank = RARITY_RANK[bucket] || 1;
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

        if (s.condition?.timeRange) {
          timeRanges.add(s.condition.timeRange);
        }

        if (s.condition?.isRaining === true) {
          canRain = true;
        }
        if (s.condition?.isThundering === true) {
          needsThunder = true;
        }

        if (Array.isArray(s.condition?.neededNearbyBlocks)) {
          s.condition.neededNearbyBlocks.forEach(blk => nearbyBlocks.add(blk));
        }

        if (Array.isArray(s.condition?.structures)) {
          s.condition.structures.forEach(st => structures.add(st));
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
        timeRanges: Array.from(timeRanges),
        conditions: {
          requiresRain: canRain,
          requiresThunder: needsThunder,
          structures: Array.from(structures),
          nearbyBlocks: Array.from(nearbyBlocks)
        }
      };

    } catch (err) {
      console.warn(`Erro ao ler arquivo ${file}:`, err.message);
    }
  }

  const outputPath = path.resolve(__dirname, '../public/data/cobblemon_spawns.json');
  fs.writeFileSync(outputPath, JSON.stringify(compiled, null, 2), 'utf-8');
  console.log(`Compilação concluída! Total de espécies mapeadas: ${Object.keys(compiled).length}`);
  console.log(`Salvo em: ${outputPath}`);
}

compileLocalSpawns();
