import { useState, useEffect, useMemo } from 'react';
import { Swords, Search, ChevronLeft, ChevronRight, BookOpen, Disc, Sparkles } from 'lucide-react';
import { pokeApi } from '../../services/pokeapi';
import type { PokemonMoveEntry } from '../../types/pokemon';
import { PokemonTypeBadge } from './PokemonTypeBadge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface MoveDetail {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
}

interface ProcessedMove {
  name: string;
  formattedName: string;
  method: 'level-up' | 'machine' | 'egg' | 'tutor' | 'other';
  level: number;
}

interface PokemonLearnsetProps {
  moves?: PokemonMoveEntry[];
}

function formatMoveName(name: string): string {
  return name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function PokemonLearnset({ moves = [] }: PokemonLearnsetProps) {
  const [activeTab, setActiveTab] = useState<'level-up' | 'machine' | 'egg' | 'all'>('level-up');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [moveDetailsCache, setMoveDetailsCache] = useState<Record<string, MoveDetail>>({});
  const limit = 20;

  // Process and categorize all moves using the most recent version details
  const processedMoves = useMemo<ProcessedMove[]>(() => {
    if (!moves || moves.length === 0) return [];

    return moves.map(entry => {
      // Find the most recent or highest priority version detail
      const details = entry.version_group_details || [];
      const latestDetail = details[details.length - 1];

      const methodName = latestDetail?.move_learn_method?.name || 'other';
      let method: ProcessedMove['method'] = 'other';
      if (methodName === 'level-up') method = 'level-up';
      else if (methodName === 'machine') method = 'machine';
      else if (methodName === 'egg') method = 'egg';
      else if (methodName === 'tutor') method = 'tutor';

      return {
        name: entry.move.name,
        formattedName: formatMoveName(entry.move.name),
        method,
        level: latestDetail?.level_learned_at || 0,
      };
    });
  }, [moves]);

  // Counts per tab
  const counts = useMemo(() => {
    return {
      'level-up': processedMoves.filter(m => m.method === 'level-up').length,
      'machine': processedMoves.filter(m => m.method === 'machine').length,
      'egg': processedMoves.filter(m => m.method === 'egg').length,
      'all': processedMoves.length,
    };
  }, [processedMoves]);

  // Filtered and sorted according to active tab and search
  const filteredMoves = useMemo(() => {
    let list = processedMoves;

    // Filter by tab
    if (activeTab !== 'all') {
      list = list.filter(m => m.method === activeTab);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => m.name.includes(q) || m.formattedName.toLowerCase().includes(q));
    }

    // Sort: level-up by level ascending, others alphabetically
    return [...list].sort((a, b) => {
      if (a.method === 'level-up' && b.method === 'level-up') {
        return a.level - b.level;
      }
      return a.formattedName.localeCompare(b.formattedName);
    });
  }, [processedMoves, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMoves.length / limit));
  const currentPage = Math.min(page, totalPages - 1);
  const currentSlice = filteredMoves.slice(currentPage * limit, (currentPage + 1) * limit);

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(0);
  }, [activeTab, searchQuery]);

  // Fetch details (type, power, accuracy, damage class) for visible moves
  useEffect(() => {
    let isMounted = true;
    const movesToFetch = currentSlice.filter(m => !moveDetailsCache[m.name]);

    if (movesToFetch.length === 0) return;

    Promise.all(
      movesToFetch.map(async m => {
        try {
          const data = await pokeApi.getMove(m.name);
          return {
            name: m.name,
            type: data.type?.name || 'normal',
            power: data.power,
            accuracy: data.accuracy,
            pp: data.pp,
            damageClass: data.damage_class?.name || 'status',
          };
        } catch {
          return null;
        }
      })
    ).then(results => {
      if (!isMounted) return;
      const updates: Record<string, MoveDetail> = {};
      results.forEach(r => {
        if (r) updates[r.name] = r;
      });
      if (Object.keys(updates).length > 0) {
        setMoveDetailsCache(prev => ({ ...prev, ...updates }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentSlice, moveDetailsCache]);

  if (!moves || moves.length === 0) return null;

  return (
    <div className="space-y-5">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-yellow-400" />
            Golpes & Movimentos
          </h3>
          <p className="text-xs text-cobble-400 mt-0.5">
            Lista completa de ataques aprendidos por nível, máquinas técnicas (TMs) e herança.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cobble-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar golpe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-cobble-900 border-2 border-cobble-700 rounded-lg text-white placeholder-cobble-400 text-xs font-bold outline-none focus:border-yellow-400 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-cobble-700 pb-2">
        <button
          onClick={() => setActiveTab('level-up')}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border",
            activeTab === 'level-up'
              ? "bg-blue-600 text-white border-blue-400 shadow-md"
              : "bg-cobble-900 text-cobble-300 border-cobble-700 hover:text-white hover:bg-cobble-800"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Por Nível ({counts['level-up']})
        </button>

        <button
          onClick={() => setActiveTab('machine')}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border",
            activeTab === 'machine'
              ? "bg-purple-600 text-white border-purple-400 shadow-md"
              : "bg-cobble-900 text-cobble-300 border-cobble-700 hover:text-white hover:bg-cobble-800"
          )}
        >
          <Disc className="w-3.5 h-3.5" />
          Por MT / TM ({counts['machine']})
        </button>

        {counts['egg'] > 0 && (
          <button
            onClick={() => setActiveTab('egg')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border",
              activeTab === 'egg'
                ? "bg-amber-600 text-white border-amber-400 shadow-md"
                : "bg-cobble-900 text-cobble-300 border-cobble-700 hover:text-white hover:bg-cobble-800"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ovo / Tutor ({counts['egg']})
          </button>
        )}

        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border",
            activeTab === 'all'
              ? "bg-yellow-500 text-cobble-950 border-yellow-300 shadow-md font-black"
              : "bg-cobble-900 text-cobble-300 border-cobble-700 hover:text-white hover:bg-cobble-800"
          )}
        >
          Todos ({counts['all']})
        </button>
      </div>

      {/* Moves Table */}
      {filteredMoves.length === 0 ? (
        <div className="text-center py-10 bg-cobble-900/60 rounded-xl border border-cobble-700">
          <p className="text-cobble-300 text-sm font-bold">Nenhum golpe encontrado para esta categoria ou busca.</p>
        </div>
      ) : (
        <div className="bg-cobble-900/90 rounded-2xl border-2 border-cobble-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cobble-950 text-cobble-400 font-black uppercase tracking-wider border-b-2 border-cobble-700">
                <tr>
                  <th className="py-3 px-4">Método / Nível</th>
                  <th className="py-3 px-4">Golpe</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-center">Poder</th>
                  <th className="py-3 px-4 text-center">Precisão</th>
                  <th className="py-3 px-4 text-center">PP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cobble-800/80">
                {currentSlice.map((move) => {
                  const details = moveDetailsCache[move.name];

                  const damageClassBadge = details ? (
                    details.damageClass === 'physical' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                        💥 Físico
                      </span>
                    ) : details.damageClass === 'special' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        ✨ Especial
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-500/20 text-slate-300 border border-slate-500/40">
                        🛡️ Status
                      </span>
                    )
                  ) : (
                    <span className="text-cobble-500">—</span>
                  );

                  return (
                    <tr key={move.name} className="hover:bg-cobble-800/50 transition-colors">
                      {/* Method / Level */}
                      <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                        {move.method === 'level-up' ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono text-[11px]">
                            {move.level > 0 ? `Lv. ${move.level}` : 'Lv. Inicial'}
                          </span>
                        ) : move.method === 'machine' ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-[11px]">
                            💿 MT / TM
                          </span>
                        ) : move.method === 'egg' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px]">
                            🥚 Ovo
                          </span>
                        ) : (
                          <span className="text-cobble-400 font-mono text-[11px]">
                            Tutor
                          </span>
                        )}
                      </td>

                      {/* Move Name */}
                      <td className="py-2.5 px-4 font-black text-white capitalize tracking-wide">
                        {move.formattedName}
                      </td>

                      {/* Type Badge */}
                      <td className="py-2.5 px-4">
                        {details?.type ? (
                          <PokemonTypeBadge type={details.type} className="px-2 py-0.5 text-[10px]" />
                        ) : (
                          <div className="w-12 h-4 bg-cobble-800 animate-pulse rounded" />
                        )}
                      </td>

                      {/* Damage Class */}
                      <td className="py-2.5 px-4">
                        {damageClassBadge}
                      </td>

                      {/* Power */}
                      <td className="py-2.5 px-4 text-center font-bold text-white">
                        {details ? (details.power ?? '—') : '—'}
                      </td>

                      {/* Accuracy */}
                      <td className="py-2.5 px-4 text-center font-bold text-white">
                        {details ? (details.accuracy ? `${details.accuracy}%` : '—') : '—'}
                      </td>

                      {/* PP */}
                      <td className="py-2.5 px-4 text-center font-bold text-cobble-300">
                        {details ? (details.pp ?? '—') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-2.5 bg-cobble-950 border-t border-cobble-800 text-xs text-cobble-300">
              <span className="font-bold">
                Mostrando <strong className="text-yellow-400">{currentSlice.length}</strong> de <strong className="text-white">{filteredMoves.length}</strong> golpes
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="text-xs px-2.5 py-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Anterior
                </Button>
                <span className="font-bold px-2">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="text-xs px-2.5 py-1"
                >
                  Próxima <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
