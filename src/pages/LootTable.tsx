import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Sparkles, Filter, ChevronLeft, ChevronRight, Layers, ArrowUpDown, X, Loader2 } from 'lucide-react';
import { cobblemonService } from '../services/cobblemon';
import type { CobblemonPokemonDrops, CobblemonItemSource } from '../services/cobblemon';
import { formatItemName } from '../utils/itemFormatter';

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-zinc-600/40 text-zinc-300 border-zinc-500/50',
  fire: 'bg-orange-600/40 text-orange-300 border-orange-500/50',
  water: 'bg-blue-600/40 text-blue-300 border-blue-500/50',
  electric: 'bg-yellow-600/40 text-yellow-300 border-yellow-500/50',
  grass: 'bg-emerald-600/40 text-emerald-300 border-emerald-500/50',
  ice: 'bg-cyan-600/40 text-cyan-300 border-cyan-500/50',
  fighting: 'bg-red-700/40 text-red-300 border-red-500/50',
  poison: 'bg-purple-600/40 text-purple-300 border-purple-500/50',
  ground: 'bg-amber-700/40 text-amber-300 border-amber-600/50',
  flying: 'bg-indigo-600/40 text-indigo-300 border-indigo-400/50',
  psychic: 'bg-pink-600/40 text-pink-300 border-pink-400/50',
  bug: 'bg-lime-600/40 text-lime-300 border-lime-500/50',
  rock: 'bg-stone-600/40 text-stone-300 border-stone-400/50',
  ghost: 'bg-violet-800/40 text-violet-300 border-violet-500/50',
  dragon: 'bg-teal-700/40 text-teal-300 border-teal-500/50',
  dark: 'bg-neutral-800/60 text-neutral-300 border-neutral-600/50',
  steel: 'bg-slate-600/40 text-slate-300 border-slate-400/50',
  fairy: 'bg-rose-500/40 text-rose-300 border-rose-400/50',
};

const ITEMS_PER_PAGE = 24;

export default function LootTable() {
  const [viewMode, setViewMode] = useState<'by-item' | 'by-pokemon'>('by-item');
  const [itemLootMap, setItemLootMap] = useState<Record<string, CobblemonItemSource[]>>({});
  const [pokemonDropsMap, setPokemonDropsMap] = useState<Record<number, CobblemonPokemonDrops>>({});
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'held' | 'stone' | 'berry' | 'ball' | 'vanilla'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const [itemsData, pokemonsData] = await Promise.all([
        cobblemonService.getAllItemLoot(),
        cobblemonService.getAllPokemonDrops(),
      ]);
      if (isMounted) {
        setItemLootMap(itemsData);
        setPokemonDropsMap(pokemonsData);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Items (by-item view)
  const filteredItems = useMemo(() => {
    const list = Object.keys(itemLootMap).map((rawItem) => {
      const info = formatItemName(rawItem);
      const sources = itemLootMap[rawItem];
      return {
        rawItem,
        ...info,
        sourcesCount: sources.length,
        sources,
      };
    });

    return list
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.rawItem.toLowerCase().includes(search.toLowerCase()) ||
          item.sources.some((s) => s.pokemonName.toLowerCase().includes(search.toLowerCase()));

        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
  }, [itemLootMap, search, categoryFilter, sortOrder]);

  // Filtered Pokémon (by-pokemon view)
  const filteredPokemons = useMemo(() => {
    const list = Object.values(pokemonDropsMap);

    return list
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toString() === search.trim() ||
          p.entries.some((e) => {
            const info = formatItemName(e.item);
            return info.name.toLowerCase().includes(search.toLowerCase());
          });

        return matchesSearch;
      })
      .sort((a, b) => {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      });
  }, [pokemonDropsMap, search, sortOrder]);

  // Reset page when search or view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, viewMode, sortOrder]);

  const totalPages = Math.ceil(
    (viewMode === 'by-item' ? filteredItems.length : filteredPokemons.length) / ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const paginatedPokemons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPokemons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPokemons, currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
        <p className="text-yellow-400 font-bold text-lg animate-pulse">Carregando Tabelas de Drops do Cobblemon...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cobble-900 via-cobble-800 to-cobble-900 border border-yellow-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Loot Table Oficial Cobblemon
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide flex items-center gap-3">
              <Package className="w-9 h-9 text-yellow-400" />
              Drops & Loot Tables
            </h1>
            <p className="text-cobble-300 text-sm sm:text-base mt-2 max-w-2xl">
              Consulte quais itens cada Pokemon selvagem dropa ao ser derrotado, ou pesquise diretamente por um item para saber quem o dropa.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-cobble-950/80 p-1.5 rounded-xl border border-cobble-700 self-stretch md:self-auto shadow-inner">
            <button
              onClick={() => setViewMode('by-item')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'by-item'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
                  : 'text-cobble-300 hover:text-white hover:bg-cobble-800/50'
              }`}
            >
              <Package className="w-4 h-4" />
              Por Itens ({Object.keys(itemLootMap).length})
            </button>
            <button
              onClick={() => setViewMode('by-pokemon')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'by-pokemon'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
                  : 'text-cobble-300 hover:text-white hover:bg-cobble-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Por Pokémon ({Object.keys(pokemonDropsMap).length})
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-cobble-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-cobble-700/80 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cobble-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                viewMode === 'by-item'
                  ? 'Buscar item (ex: Light Ball, Pearl, Stone, Berry, Ender...)'
                  : 'Buscar Pokémon por nome ou ID (ex: Pikachu, 25, Charizard...)'
              }
              className="w-full bg-cobble-950/80 border border-cobble-700 rounded-xl pl-12 pr-10 py-3 text-white placeholder-cobble-400 focus:outline-none focus:border-yellow-400 transition-colors shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cobble-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter (Item View only) */}
          {viewMode === 'by-item' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <div className="relative flex-1 md:w-64">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full appearance-none bg-cobble-950 border border-cobble-700 rounded-xl pl-3.5 pr-8 py-3 text-white font-medium focus:outline-none focus:border-yellow-400 cursor-pointer text-sm"
                >
                  <option value="all" className="bg-cobble-900 text-white py-1">Todas as Categorias</option>
                  <option value="held" className="bg-cobble-900 text-white py-1">Itens de Batalha (Held)</option>
                  <option value="stone" className="bg-cobble-900 text-white py-1">Pedras Evolutivas e Minérios</option>
                  <option value="berry" className="bg-cobble-900 text-white py-1">Bagas (Berries)</option>
                  <option value="ball" className="bg-cobble-900 text-white py-1">Pokebolas</option>
                  <option value="vanilla" className="bg-cobble-900 text-white py-1">Itens Minecraft (Vanilla)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cobble-400 text-xs">▼</div>
              </div>
            </div>
          )}

          {/* Sort Button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-cobble-950/80 hover:bg-cobble-800 border border-cobble-700 rounded-xl text-white font-medium transition-colors w-full md:w-auto flex-shrink-0"
            title="Alternar Ordenação"
          >
            <ArrowUpDown className="w-4 h-4 text-yellow-400" />
            <span>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'by-item' ? (
        /* ================= BY ITEM VIEW ================= */
        <div>
          {filteredItems.length === 0 ? (
            <div className="bg-cobble-900/40 border border-cobble-800 rounded-2xl p-12 text-center text-cobble-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-bold">Nenhum item encontrado para esta busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedItems.map((item) => (
                <div
                  key={item.rawItem}
                  className="bg-cobble-900/60 border border-cobble-700/80 hover:border-yellow-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Item Title & Category */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cobble-950 border border-cobble-800 text-yellow-400 uppercase tracking-wider">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base truncate" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-cobble-400 font-mono truncate" title={item.rawItem}>
                        {item.rawItem}
                      </p>
                    </div>

                    {/* Dropped by count tag */}
                    <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-cobble-950/50 border border-cobble-800 mb-3 font-semibold text-cobble-300">
                      <span>Derrubado por:</span>
                      <span className="text-yellow-400 font-bold">{item.sourcesCount} Pokémon</span>
                    </div>

                    {/* List of Pokémon sources preview */}
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {item.sources.map((src) => (
                        <Link
                          key={src.pokemonId}
                          to={`/pokemon/${src.pokemonId}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-cobble-800/40 hover:bg-yellow-500/10 border border-cobble-700/40 hover:border-yellow-500/30 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-mono text-yellow-400/80">#{src.pokemonId}</span>
                            <span className="text-sm font-semibold text-white group-hover:text-yellow-300 truncate">
                              {src.pokemonName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs px-2 py-0.5 rounded bg-cobble-900 border border-cobble-700 text-cobble-300 font-mono">
                              x{src.quantityRange}
                            </span>
                            <span
                              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                src.percentage >= 100
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : src.percentage >= 20
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {src.percentage}%
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= BY POKÉMON VIEW ================= */
        <div>
          {filteredPokemons.length === 0 ? (
            <div className="bg-cobble-900/40 border border-cobble-800 rounded-2xl p-12 text-center text-cobble-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-bold">Nenhum Pokémon com drops encontrado para esta busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedPokemons.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="bg-cobble-900/60 border border-cobble-700/80 hover:border-yellow-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Name, ID, Sprite */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                          alt={pokemon.name}
                          className="w-14 h-14 object-contain filter drop-shadow"
                          loading="lazy"
                        />
                        <div>
                          <span className="text-xs font-mono font-bold text-yellow-400">
                            #{pokemon.id.toString().padStart(3, '0')}
                          </span>
                          <Link
                            to={`/pokemon/${pokemon.id}`}
                            className="block font-bold text-white text-base hover:text-yellow-400 transition-colors"
                          >
                            {pokemon.name}
                          </Link>
                        </div>
                      </div>
                      {/* Types badges */}
                      <div className="flex flex-col gap-1 items-end">
                        {pokemon.primaryType && (
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              TYPE_COLORS[pokemon.primaryType] || 'bg-cobble-800 text-cobble-300 border-cobble-700'
                            }`}
                          >
                            {pokemon.primaryType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Drops entries */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-cobble-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Loot Droppado</span>
                        <span className="text-cobble-500 font-mono">Max rolls: {pokemon.amount}</span>
                      </div>
                      {pokemon.entries.map((entry, idx) => {
                        const itemInfo = formatItemName(entry.item);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-cobble-950/60 border border-cobble-800 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate" title={itemInfo.name}>
                                {itemInfo.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cobble-900 text-yellow-400/90 font-medium border border-cobble-800">
                                  {itemInfo.categoryLabel}
                                </span>
                                <span className="text-[10px] text-cobble-500 font-mono truncate" title={entry.item}>
                                  {entry.item}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="px-1.5 py-0.5 rounded bg-cobble-900 border border-cobble-700 text-cobble-300 font-mono text-[11px]">
                                x{entry.quantityRange}
                              </span>
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                  entry.percentage >= 100
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : entry.percentage >= 20
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}
                              >
                                {entry.percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link
                    to={`/pokemon/${pokemon.id}`}
                    className="mt-4 block text-center py-2 px-3 bg-cobble-800/80 hover:bg-yellow-500 hover:text-yellow-950 text-cobble-200 text-xs font-bold rounded-xl border border-cobble-700 transition-colors"
                  >
                    Ver Detalhes do Pokémon & Spawns →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 pb-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cobble-800 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cobble-700 border border-cobble-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <div className="px-4 py-2 bg-cobble-900/80 border border-cobble-700 rounded-xl text-sm font-bold text-cobble-300">
            Página <span className="text-yellow-400">{currentPage}</span> de <span className="text-white">{totalPages}</span>
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cobble-800 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cobble-700 border border-cobble-700 transition-colors"
          >
            Próxima
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
