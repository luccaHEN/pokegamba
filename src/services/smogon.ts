export interface SmogonBuild {
  name: string;
  tier: string;
  generation: string;   // ex: 'Gen 9 (SV)', 'Gen 7 (SM)'
  shortGen: string;     // ex: 'Gen 9', 'Gen 7'
  genSlug: string;      // ex: 'sv', 'sm'
  moves: string[];
  item?: string;
  ability?: string;
  nature?: string;
  teraType?: string;
  evs?: Record<string, number>;
  ivs?: Record<string, number>;
  level?: number;
}

export interface GenerationMeta {
  key: string;
  label: string;
  shortGen: string;
  smogonSlug: string;
}

export const GENERATIONS: GenerationMeta[] = [
  { key: 'gen9', label: 'Gen 9 (Scarlet & Violet)', shortGen: 'Gen 9', smogonSlug: 'sv' },
  { key: 'gen8', label: 'Gen 8 (Sword & Shield)', shortGen: 'Gen 8', smogonSlug: 'ss' },
  { key: 'gen7', label: 'Gen 7 (Sun & Moon)', shortGen: 'Gen 7', smogonSlug: 'sm' },
  { key: 'gen6', label: 'Gen 6 (X & Y)', shortGen: 'Gen 6', smogonSlug: 'xy' },
  { key: 'gen5', label: 'Gen 5 (Black & White)', shortGen: 'Gen 5', smogonSlug: 'bw' },
  { key: 'gen4', label: 'Gen 4 (Diamond & Pearl)', shortGen: 'Gen 4', smogonSlug: 'dp' },
  { key: 'gen3', label: 'Gen 3 (Ruby & Sapphire)', shortGen: 'Gen 3', smogonSlug: 'rs' },
  { key: 'gen2', label: 'Gen 2 (Gold & Silver)', shortGen: 'Gen 2', smogonSlug: 'gs' },
  { key: 'gen1', label: 'Gen 1 (Red & Blue)', shortGen: 'Gen 1', smogonSlug: 'rb' },
];

const TIER_ORDER = [
  'ou',
  'ubers',
  'uu',
  'ru',
  'nu',
  'pu',
  'zu',
  'lc',
  'doublesou',
  'nationaldex',
  'monotype',
  '1v1',
  'anythinggoes',
  'cap',
];

const memoryCache: Record<string, any> = {};
const pendingFetches: Record<string, Promise<any> | undefined> = {};

async function loadShowdownSets(genKey: string): Promise<Record<string, any>> {
  if (memoryCache[genKey]) return memoryCache[genKey];
  const pending = pendingFetches[genKey];
  if (pending) return pending;

  pendingFetches[genKey] = (async () => {
    try {
      // Tenta recuperar do sessionStorage
      try {
        const cached = sessionStorage.getItem(`smogon_sets_${genKey}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          memoryCache[genKey] = parsed;
          return parsed;
        }
      } catch (_) {
        // sessionStorage pode falhar em iframe privado ou limite de quota
      }

      const res = await fetch(`https://play.pokemonshowdown.com/data/sets/${genKey}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      memoryCache[genKey] = data;

      try {
        sessionStorage.setItem(`smogon_sets_${genKey}`, JSON.stringify(data));
      } catch (_) {
        // Ignora quota excedida
      }

      return data;
    } catch (err) {
      console.warn(`Falha ao carregar sets competitivos para ${genKey}:`, err);
      return {};
    } finally {
      delete pendingFetches[genKey];
    }
  })();

  return pendingFetches[genKey];
}

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Gera candidatos de busca para nomes vindos da PokéAPI que possuem sufixos de forma padrão.
 * Ex: 'giratina-altered' -> ['giratinaaltered', 'giratina']
 *     'aegislash-shield' -> ['aegislashshield', 'aegislash']
 *     'pidgeot' -> ['pidgeot']
 */
function getCandidateKeys(rawName: string): string[] {
  const norm = normalizeName(rawName);
  const candidates = new Set<string>([norm]);

  const stripped = rawName
    .toLowerCase()
    .replace(
      /-(altered|normal|disguised|single-strike|rapid-strike|incarnate|therian|standard|shield|blade|average|small|large|super|solo|school|red-meteor|50|10|complete|baile|pom-pom|pau|sensu|plant|sandy|trash|aria|pirouette|ordinary|resolute|midday|midnight|dusk|amped|low-key|ice|noice|full-belly|hangry|two-segment|three-segment|zero|hero|curly|droopy|stretchy|green-plumage|blue-plumage|yellow-plumage|white-plumage|male|female)$/i,
      ''
    );
  candidates.add(normalizeName(stripped));

  return Array.from(candidates);
}

function getTierSortIndex(tierKey: string): number {
  const cleanKey = tierKey.replace(/^gen\d+/, '').toLowerCase();
  const idx = TIER_ORDER.indexOf(cleanKey);
  return idx >= 0 ? idx : 999;
}

export async function getSmogonBuilds(rawPokemonName: string): Promise<SmogonBuild[]> {
  const candidateKeys = getCandidateKeys(rawPokemonName);

  // Busca na geração mais recente primeiro (Gen 9 -> Gen 8 -> Gen 7 -> ...)
  for (const gen of GENERATIONS) {
    const data = await loadShowdownSets(gen.key);
    if (!data || Object.keys(data).length === 0) continue;

    const tierKeys = Object.keys(data).sort((a, b) => getTierSortIndex(a) - getTierSortIndex(b));
    const genBuilds: SmogonBuild[] = [];

    for (const tierKey of tierKeys) {
      const tierData = data[tierKey];
      if (!tierData) continue;
      const tierLabel = tierKey.replace(/^gen\d+/, '').toUpperCase();

      // 1. Procurar nas análises oficiais curadas (dex)
      if (tierData.dex) {
        for (const monName of Object.keys(tierData.dex)) {
          const normMon = normalizeName(monName);
          if (candidateKeys.includes(normMon)) {
            const setsObj = tierData.dex[monName];
            for (const setName of Object.keys(setsObj)) {
              const rawSet = setsObj[setName];
              genBuilds.push({
                name: setName,
                tier: tierLabel,
                generation: gen.label,
                shortGen: gen.shortGen,
                genSlug: gen.smogonSlug,
                moves: rawSet.moves || [],
                item: rawSet.item,
                ability: rawSet.ability,
                nature: rawSet.nature,
                teraType: rawSet.teraType,
                evs: rawSet.evs,
                ivs: rawSet.ivs,
                level: rawSet.level || 100,
              });
            }
          }
        }
      }

      // 2. Procurar nas estatísticas de uso em torneios (stats)
      if (tierData.stats) {
        for (const monName of Object.keys(tierData.stats)) {
          const normMon = normalizeName(monName);
          if (candidateKeys.includes(normMon)) {
            const setsObj = tierData.stats[monName];
            for (const setName of Object.keys(setsObj)) {
              const rawSet = setsObj[setName];
              const exists = genBuilds.some(b => b.tier === tierLabel && b.name === setName);
              if (!exists) {
                genBuilds.push({
                  name: setName === 'Showdown Usage' ? `Uso Competitivo (${tierLabel})` : setName,
                  tier: tierLabel,
                  generation: gen.label,
                  shortGen: gen.shortGen,
                  genSlug: gen.smogonSlug,
                  moves: rawSet.moves || [],
                  item: rawSet.item,
                  ability: rawSet.ability,
                  nature: rawSet.nature,
                  teraType: rawSet.teraType,
                  evs: rawSet.evs,
                  ivs: rawSet.ivs,
                  level: rawSet.level || 100,
                });
              }
            }
          }
        }
      }
    }

    // Se encontrou builds nesta geração, retorna!
    if (genBuilds.length > 0) {
      return genBuilds;
    }
  }

  return [];
}

export function formatShowdownExport(pokemonName: string, build: SmogonBuild): string {
  const capitalizedName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
  const lines: string[] = [];

  const itemStr = build.item ? ` @ ${build.item}` : '';
  lines.push(`${capitalizedName}${itemStr}`);

  if (build.ability) {
    lines.push(`Ability: ${build.ability}`);
  }

  if (build.teraType) {
    lines.push(`Tera Type: ${build.teraType}`);
  }

  if (build.evs && Object.keys(build.evs).length > 0) {
    const statMap: Record<string, string> = {
      hp: 'HP',
      atk: 'Atk',
      def: 'Def',
      spa: 'SpA',
      spd: 'SpD',
      spe: 'Spe',
    };
    const evStrings = Object.entries(build.evs)
      .filter(([_, val]) => val > 0)
      .map(([stat, val]) => `${val} ${statMap[stat] || stat}`);
    if (evStrings.length > 0) {
      lines.push(`EVs: ${evStrings.join(' / ')}`);
    }
  }

  if (build.nature) {
    lines.push(`${build.nature} Nature`);
  }

  if (build.moves && build.moves.length > 0) {
    build.moves.forEach(m => {
      lines.push(`- ${m}`);
    });
  }

  return lines.join('\n');
}

export function getSmogonDexUrl(pokemonName: string, genSlug = 'sv'): string {
  const slug = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `https://www.smogon.com/dex/${genSlug}/pokemon/${slug}/`;
}
