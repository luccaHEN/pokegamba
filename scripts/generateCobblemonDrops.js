import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 5, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.warn(`[429 Rate Limit] Aguardando ${delay}ms para tentar novamente... (${url})`);
        await sleep(delay);
        delay *= 1.5;
        continue;
      }
      if (!res.ok) {
        if (res.status === 404) return null;
        console.warn(`[HTTP ${res.status}] Tentativa ${attempt}/${retries} para ${url}`);
        await sleep(delay);
        continue;
      }
      return await res.json();
    } catch (err) {
      console.warn(`[Erro de rede] ${err.message}. Tentativa ${attempt}/${retries}`);
      await sleep(delay);
    }
  }
  return null;
}

async function getAllSpeciesFiles() {
  console.log('1. Listando todas as espécies de todas as gerações do Cobblemon...');
  const allFiles = [];

  for (let gen = 1; gen <= 9; gen++) {
    let page = 1;
    while (true) {
      const treeUrl = `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tree?path=common/src/main/resources/data/cobblemon/species/generation${gen}&per_page=100&page=${page}`;
      const items = await fetchWithRetry(treeUrl);
      if (!items || !Array.isArray(items) || items.length === 0) break;
      
      const jsonFiles = items.filter(i => i.type === 'blob' && i.name.endsWith('.json'));
      allFiles.push(...jsonFiles);
      if (items.length < 100) break;
      page++;
      await sleep(300);
    }
    console.log(`Geração ${gen} processada na listagem.`);
    await sleep(400);
  }

  console.log(`Total de arquivos de espécies encontrados: ${allFiles.length}`);
  return allFiles;
}

async function main() {
  const files = await getAllSpeciesFiles();
  const dropsMap = {};
  const batchSize = 10;

  console.log(`2. Baixando drops das espécies em lotes de ${batchSize}...`);

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (file) => {
      const encodedPath = encodeURIComponent(file.path);
      const fileUrl = `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/files/${encodedPath}/raw?ref=main`;
      const data = await fetchWithRetry(fileUrl);
      if (!data || !data.nationalPokedexNumber) return;

      const id = data.nationalPokedexNumber;
      const name = data.name;
      const drops = data.drops;

      if (drops && Array.isArray(drops.entries) && drops.entries.length > 0) {
        dropsMap[id] = {
          id,
          name,
          amount: drops.amount || drops.entries.length,
          entries: drops.entries.map(entry => ({
            item: entry.item,
            quantityRange: entry.quantityRange || '1',
            percentage: entry.percentage ?? 100
          }))
        };
      }
    }));

    if ((i + batchSize) % 50 === 0 || i + batchSize >= files.length) {
      console.log(`Progresso: ${Math.min(i + batchSize, files.length)} / ${files.length} espécies processadas. (${Object.keys(dropsMap).length} com drops)`);
    }

    await sleep(500); // Respeitar limites da API GitLab
  }

  const outputPath = path.resolve(__dirname, '../public/data/cobblemon_drops.json');
  fs.writeFileSync(outputPath, JSON.stringify(dropsMap, null, 2), 'utf-8');
  console.log(`✅ Sucesso! Tabela de Drops gerada com ${Object.keys(dropsMap).length} Pokémon em: ${outputPath}`);
}

main().catch(console.error);
