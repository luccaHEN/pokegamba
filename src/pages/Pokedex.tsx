import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Filter, ArrowUpDown, RotateCcw, X, Layers, Sparkles } from 'lucide-react';
import { PokemonCard } from '../components/pokemon/PokemonCard';
import { Button } from '../components/ui/Button';
import { pokeApi } from '../services/pokeapi';
import type { Pokemon, PokemonListItem } from '../types/pokemon';

function levenshtein(s: string, t: string): number {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
}

const TYPES = [
  { id: 'all', label: 'Todos os Tipos' },
  { id: 'normal', label: 'Normal' },
  { id: 'fire', label: 'Fogo' },
  { id: 'water', label: 'Água' },
  { id: 'grass', label: 'Planta' },
  { id: 'electric', label: 'Elétrico' },
  { id: 'ice', label: 'Gelo' },
  { id: 'fighting', label: 'Lutador' },
  { id: 'poison', label: 'Veneno' },
  { id: 'ground', label: 'Terrestre' },
  { id: 'flying', label: 'Voador' },
  { id: 'psychic', label: 'Psíquico' },
  { id: 'bug', label: 'Inseto' },
  { id: 'rock', label: 'Pedra' },
  { id: 'ghost', label: 'Fantasma' },
  { id: 'dragon', label: 'Dragão' },
  { id: 'dark', label: 'Sombrio' },
  { id: 'steel', label: 'Aço' },
  { id: 'fairy', label: 'Fada' },
];

const GENERATIONS = [
  { id: 0, label: 'Todas Gerações', min: 1, max: 1025 },
  { id: 1, label: 'Gen 1 (Kanto)', min: 1, max: 151 },
  { id: 2, label: 'Gen 2 (Johto)', min: 152, max: 251 },
  { id: 3, label: 'Gen 3 (Hoenn)', min: 252, max: 386 },
  { id: 4, label: 'Gen 4 (Sinnoh)', min: 387, max: 493 },
  { id: 5, label: 'Gen 5 (Unova)', min: 494, max: 649 },
  { id: 6, label: 'Gen 6 (Kalos)', min: 650, max: 721 },
  { id: 7, label: 'Gen 7 (Alola)', min: 722, max: 809 },
  { id: 8, label: 'Gen 8 (Galar)', min: 810, max: 905 },
  { id: 9, label: 'Gen 9 (Paldea)', min: 906, max: 1025 },
];

type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'id-asc', label: 'Menor Nº (#1 → #1025)' },
  { id: 'id-desc', label: 'Maior Nº (#1025 → #1)' },
  { id: 'name-asc', label: 'Nome (A → Z)' },
  { id: 'name-desc', label: 'Nome (Z → A)' },
];

export default function Pokedex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGen, setSelectedGen] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('id-asc');

  const [typePokemonSet, setTypePokemonSet] = useState<Set<string> | null>(null);
  const [isLoadingTypeFilter, setIsLoadingTypeFilter] = useState(false);

  const [allNames, setAllNames] = useState<PokemonListItem[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Load all names once for smart search (cached in pokeApi)
  useEffect(() => {
    pokeApi.getAllPokemonList().then(res => setAllNames(res.results)).catch(console.error);
  }, []);

  // Debounce search input for silky-smooth typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load type members whenever selectedType changes
  useEffect(() => {
    let isMounted = true;
    if (selectedType === 'all') {
      setTypePokemonSet(null);
      return;
    }

    setIsLoadingTypeFilter(true);
    pokeApi.getPokemonByType(selectedType)
      .then((typeData: any) => {
        if (!isMounted) return;
        const set = new Set<string>();
        if (Array.isArray(typeData.pokemon)) {
          typeData.pokemon.forEach((entry: any) => {
            if (entry.pokemon?.name) {
              set.add(entry.pokemon.name.toLowerCase());
            }
          });
        }
        setTypePokemonSet(set);
      })
      .catch((err) => {
        console.error('Falha ao filtrar por tipo:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTypeFilter(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedType]);

  // Reset page whenever any search/filter parameter changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedType, selectedGen, sortBy]);

  // Pre-indexed list with cached IDs and lowercase names for fast lookups
  const indexedList = useMemo(() => {
    return allNames.map(p => {
      const parts = p.url.split('/');
      const id = parts[parts.length - 2] || '';
      return {
        name: p.name.toLowerCase(),
        id,
        rawName: p.name
      };
    });
  }, [allNames]);

  // Fast in-memory filtering and sorting
  const filteredAndSortedList = useMemo(() => {
    if (indexedList.length === 0) return [];

    const term = debouncedSearch.toLowerCase().trim();
    const genConfig = GENERATIONS.find(g => g.id === selectedGen);

    // 1. Initial filter by Generation and Type
    let candidates = indexedList.filter(p => {
      const numId = Number(p.id);
      if (isNaN(numId) || numId > 1025) return false;

      // Gen filter
      if (genConfig && genConfig.id > 0) {
        if (numId < genConfig.min || numId > genConfig.max) return false;
      }

      // Type filter
      if (typePokemonSet && !typePokemonSet.has(p.name)) {
        return false;
      }

      return true;
    });

    // 2. Filter by search term (direct + fuzzy fallback)
    if (term.length > 0) {
      let matches = candidates.filter(p => {
        return p.id === term || p.name.startsWith(term) || p.name.includes(term);
      });

      // Prioritize pokemon whose name starts with the search term
      matches.sort((a, b) => {
        const aStarts = a.name.startsWith(term);
        const bStarts = b.name.startsWith(term);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });

      // Fuzzy match for typos only if no direct match and query >= 3 chars
      if (matches.length === 0 && term.length >= 3) {
        matches = candidates
          .filter(p => Math.abs(p.name.length - term.length) <= 2)
          .map(p => ({ ...p, dist: levenshtein(p.name, term) }))
          .filter(p => p.dist <= 2)
          .sort((a, b) => a.dist - b.dist);
      }

      candidates = matches;
    }

    // 3. Sort
    return [...candidates].sort((a, b) => {
      if (sortBy === 'id-asc') return Number(a.id) - Number(b.id);
      if (sortBy === 'id-desc') return Number(b.id) - Number(a.id);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [indexedList, debouncedSearch, selectedGen, typePokemonSet, sortBy]);

  const totalCount = filteredAndSortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(page, totalPages - 1);

  // Fetch full details for the currently active page slice
  useEffect(() => {
    let isMounted = true;

    if (filteredAndSortedList.length === 0) {
      setPokemonList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const slice = filteredAndSortedList.slice(currentPage * limit, (currentPage + 1) * limit);

    Promise.all(slice.map(p => pokeApi.getPokemon(p.rawName)))
      .then(details => {
        if (isMounted) {
          setPokemonList(details);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filteredAndSortedList, currentPage]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedType !== 'all' || selectedGen !== 0 || sortBy !== 'id-asc'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedType('all');
    setSelectedGen(0);
    setSortBy('id-asc');
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Filter Control Panel */}
      <div className="bg-cobble-800 p-5 md:p-6 rounded-2xl border-2 border-cobble-700 shadow-xl space-y-4">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cobble-700/80 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2.5 drop-shadow-sm">
              <Sparkles className="w-7 h-7 text-yellow-400" />
              Pokédex
            </h1>
            <p className="text-cobble-300 text-sm mt-1">
              Catálogo completo de Pokémon com busca inteligente, filtros de tipo, geração e ordenação.
            </p>
          </div>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-yellow-300 border-yellow-600/40 hover:border-yellow-400 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* 1. Search Input */}
          <div className="lg:col-span-3 xl:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cobble-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-cobble-900 border-2 border-cobble-700 rounded-lg text-white placeholder-cobble-400 text-xs font-bold outline-none focus:border-yellow-400 transition-colors shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cobble-400 hover:text-white transition-colors"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2. Type Filter */}
          <div className="lg:col-span-3 xl:col-span-3 relative flex items-center bg-cobble-900 border-2 border-cobble-700 rounded-lg focus-within:border-yellow-400 transition-colors shadow-inner">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cobble-400 pointer-events-none shrink-0" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-transparent text-white font-bold text-xs pl-8 pr-7 py-2 outline-none cursor-pointer appearance-none truncate capitalize"
              title="Filtrar por Tipo"
            >
              {TYPES.map(t => (
                <option key={t.id} value={t.id} className="bg-cobble-900 text-white font-medium">
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cobble-400 pointer-events-none shrink-0" />
          </div>

          {/* 3. Generation Filter */}
          <div className="lg:col-span-3 xl:col-span-3 relative flex items-center bg-cobble-900 border-2 border-cobble-700 rounded-lg focus-within:border-yellow-400 transition-colors shadow-inner">
            <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cobble-400 pointer-events-none shrink-0" />
            <select
              value={selectedGen}
              onChange={(e) => setSelectedGen(Number(e.target.value))}
              className="w-full bg-transparent text-white font-bold text-xs pl-8 pr-7 py-2 outline-none cursor-pointer appearance-none truncate"
              title="Filtrar por Geração"
            >
              {GENERATIONS.map(g => (
                <option key={g.id} value={g.id} className="bg-cobble-900 text-white font-medium">
                  {g.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cobble-400 pointer-events-none shrink-0" />
          </div>

          {/* 4. Sort Selector */}
          <div className="lg:col-span-3 xl:col-span-3 relative flex items-center bg-cobble-900 border-2 border-cobble-700 rounded-lg focus-within:border-yellow-400 transition-colors shadow-inner">
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 pointer-events-none shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-transparent text-yellow-300 font-bold text-xs pl-8 pr-7 py-2 outline-none cursor-pointer appearance-none truncate"
              title="Ordenar Pokémon"
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.id} value={s.id} className="bg-cobble-900 text-white font-medium">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-400 pointer-events-none shrink-0" />
          </div>
        </div>

        {/* Results Counter and Active Tags Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-cobble-300 pt-1 gap-2 border-t border-cobble-700/50">
          <div className="flex items-center gap-2">
            <span>
              Encontrados: <strong className="text-yellow-400 font-black">{totalCount}</strong> Pokémon
            </span>
            {isLoadingTypeFilter && (
              <span className="text-[11px] text-yellow-400 italic animate-pulse">
                • Filtrando tipo...
              </span>
            )}
          </div>

          {totalCount > 0 && (
            <div className="font-bold text-cobble-400">
              Página <span className="text-white">{currentPage + 1}</span> de <span className="text-white">{totalPages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid or Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-cobble-800 animate-pulse border-2 border-cobble-700 flex flex-col items-center justify-center p-4">
              <div className="w-24 h-24 rounded-full bg-cobble-700/60 mb-4" />
              <div className="w-24 h-4 rounded bg-cobble-700/60 mb-2" />
              <div className="w-16 h-3 rounded bg-cobble-700/40" />
            </div>
          ))}
        </div>
      ) : pokemonList.length === 0 ? (
        <div className="text-center py-20 bg-cobble-800 rounded-2xl border-2 border-cobble-700 p-8 shadow-xl">
          <p className="text-cobble-200 text-xl font-bold mb-2">Nenhum Pokémon encontrado</p>
          <p className="text-cobble-400 text-sm max-w-md mx-auto mb-6">
            Não encontramos nenhum Pokémon que corresponda aos filtros de busca, tipo ou geração atuais.
          </p>
          {hasActiveFilters && (
            <Button variant="primary" onClick={handleResetFilters}>
              <RotateCcw className="w-4 h-4 mr-2" /> Resetar Filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pokemonList.map(p => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 pt-6 pb-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(0)}
                disabled={currentPage === 0}
                className="text-xs"
                title="Primeira Página"
              >
                « Primeira
              </Button>

              <Button 
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>

              <span className="px-4 py-2 bg-cobble-800 border-2 border-cobble-700 rounded-lg text-cobble-200 font-bold text-xs">
                Página <strong className="text-yellow-400">{currentPage + 1}</strong> de <strong>{totalPages}</strong>
              </span>

              <Button 
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="text-xs"
              >
                Próxima <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="text-xs"
                title="Última Página"
              >
                Última »
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
