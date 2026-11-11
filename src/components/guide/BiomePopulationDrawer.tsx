import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  X, Search, ExternalLink, Sun, Moon, CloudRain, 
  Compass, Loader2 
} from 'lucide-react';
import type { BiomeZone } from '../../data/biomes';
import { cobblemonService } from '../../services/cobblemon';
import type { BiomePokemonEntry } from '../../services/cobblemon';

interface BiomePopulationDrawerProps {
  zone: BiomeZone | null;
  onClose: () => void;
}

const RARITY_LABELS: Record<string, { label: string; badge: string; border: string }> = {
  'ultra-rare': {
    label: 'Ultra-Raro',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    border: 'border-yellow-500/50 hover:border-yellow-400',
  },
  rare: {
    label: 'Raro',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    border: 'border-purple-500/40 hover:border-purple-400',
  },
  uncommon: {
    label: 'Incomum',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    border: 'border-blue-500/40 hover:border-blue-400',
  },
  common: {
    label: 'Comum',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    border: 'border-emerald-500/40 hover:border-emerald-400',
  },
};

export function BiomePopulationDrawer({ zone, onClose }: BiomePopulationDrawerProps) {
  const [pokemons, setPokemons] = useState<BiomePokemonEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'ultra-rare' | 'rare' | 'uncommon' | 'common'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'night' | 'rain'>('all');

  useEffect(() => {
    if (!zone) return;

    let isMounted = true;
    setLoading(true);
    setSearch('');
    setRarityFilter('all');
    setTimeFilter('all');

    cobblemonService.getPokemonsForBiomeZone(zone.matchedTags).then(res => {
      if (isMounted) {
        setPokemons(res);
        setLoading(false);
      }
    });

    // Prevent body scroll when drawer is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      isMounted = false;
      document.body.style.overflow = originalOverflow;
    };
  }, [zone]);

  const filteredPokemons = useMemo(() => {
    return pokemons.filter(p => {
      // Search query
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search);

      // Rarity filter
      const matchesRarity = rarityFilter === 'all' || p.rarity === rarityFilter;

      // Time / Weather filter
      let matchesTime = true;
      if (timeFilter === 'day') {
        matchesTime = !p.timeRanges || p.timeRanges.length === 0 || p.timeRanges.includes('day');
      } else if (timeFilter === 'night') {
        matchesTime = !p.timeRanges || p.timeRanges.length === 0 || p.timeRanges.includes('night');
      } else if (timeFilter === 'rain') {
        matchesTime = p.conditions?.requiresRain === true || p.conditions?.requiresThunder === true;
      }

      return matchesSearch && matchesRarity && matchesTime;
    });
  }, [pokemons, search, rarityFilter, timeFilter]);

  if (!zone || typeof document === 'undefined') return null;

  const ultraCount = pokemons.filter(p => p.rarity === 'ultra-rare').length;
  const rareCount = pokemons.filter(p => p.rarity === 'rare').length;
  const uncommonCount = pokemons.filter(p => p.rarity === 'uncommon').length;
  const commonCount = pokemons.filter(p => p.rarity === 'common').length;

  return createPortal(
    <div className="fixed inset-0 z-[120] overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-cobble-900 border-l border-cobble-700 h-full max-h-screen flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header with Biome Identity */}
        <div 
          className="relative p-6 border-b border-cobble-700 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${zone.color}22 0%, #0f172a 100%)`
          }}
        >
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2.5 rounded-2xl bg-cobble-800/80 border border-cobble-600 shadow-md">
                {zone.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: zone.color }}
                  >
                    {zone.climate}
                  </span>
                  <span className="text-xs text-cobble-400">Censo Demográfico</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide mt-1">
                  {zone.name}
                </h2>
                <p className="text-xs text-cobble-300 mt-0.5">{zone.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-cobble-800/80 text-cobble-300 hover:text-white hover:bg-cobble-700 transition-colors border border-cobble-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-cobble-300/90 mt-4 leading-relaxed bg-cobble-950/40 p-3 rounded-xl border border-cobble-700/50">
            {zone.description}
          </p>

          {/* Landmarks / Characteristic Blocks */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[10px] text-cobble-400 font-semibold mr-1">Elementos:</span>
            {zone.landmarks.map((mark, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-cobble-800 text-cobble-200 border border-cobble-700">
                {mark}
              </span>
            ))}
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-cobble-700/60 text-center">
            <div className="bg-cobble-950/60 p-2 rounded-xl border border-yellow-500/20">
              <div className="text-sm font-black text-yellow-400">{ultraCount}</div>
              <div className="text-[10px] text-cobble-400">Ultra-Raros</div>
            </div>
            <div className="bg-cobble-950/60 p-2 rounded-xl border border-purple-500/20">
              <div className="text-sm font-black text-purple-400">{rareCount}</div>
              <div className="text-[10px] text-cobble-400">Raros</div>
            </div>
            <div className="bg-cobble-950/60 p-2 rounded-xl border border-blue-500/20">
              <div className="text-sm font-black text-blue-400">{uncommonCount}</div>
              <div className="text-[10px] text-cobble-400">Incomuns</div>
            </div>
            <div className="bg-cobble-950/60 p-2 rounded-xl border border-emerald-500/20">
              <div className="text-sm font-black text-emerald-400">{commonCount}</div>
              <div className="text-[10px] text-cobble-400">Comuns</div>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 bg-cobble-950/80 border-b border-cobble-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cobble-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Pesquisar entre os ${pokemons.length} Pokémon desta região...`}
              className="w-full pl-9 pr-4 py-2 bg-cobble-900 border border-cobble-700 rounded-xl text-xs text-white placeholder-cobble-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cobble-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Rarity filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setRarityFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  rarityFilter === 'all'
                    ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                    : 'bg-cobble-900 text-cobble-400 hover:text-white border border-cobble-700'
                }`}
              >
                Todos ({pokemons.length})
              </button>
              <button
                onClick={() => setRarityFilter('ultra-rare')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  rarityFilter === 'ultra-rare'
                    ? 'bg-yellow-500 text-yellow-950'
                    : 'bg-cobble-900 text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                Ultra ({ultraCount})
              </button>
              <button
                onClick={() => setRarityFilter('rare')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  rarityFilter === 'rare'
                    ? 'bg-purple-500 text-white'
                    : 'bg-cobble-900 text-purple-400 hover:bg-purple-500/10 border border-purple-500/30'
                }`}
              >
                Raros ({rareCount})
              </button>
              <button
                onClick={() => setRarityFilter('uncommon')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  rarityFilter === 'uncommon'
                    ? 'bg-blue-500 text-white'
                    : 'bg-cobble-900 text-blue-400 hover:bg-blue-500/10 border border-blue-500/30'
                }`}
              >
                Incomuns ({uncommonCount})
              </button>
              <button
                onClick={() => setRarityFilter('common')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  rarityFilter === 'common'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-cobble-900 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30'
                }`}
              >
                Comuns ({commonCount})
              </button>
            </div>

            {/* Weather / Time Selector */}
            <div className="flex items-center gap-1 bg-cobble-900 p-0.5 rounded-lg border border-cobble-700">
              <button
                onClick={() => setTimeFilter('all')}
                title="Qualquer horário"
                className={`p-1.5 rounded text-xs font-semibold ${
                  timeFilter === 'all' ? 'bg-cobble-700 text-white' : 'text-cobble-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTimeFilter('day')}
                title="Apenas Dia"
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                  timeFilter === 'day' ? 'bg-amber-500/30 text-amber-300' : 'text-cobble-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => setTimeFilter('night')}
                title="Apenas Noite"
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                  timeFilter === 'night' ? 'bg-indigo-500/30 text-indigo-300' : 'text-cobble-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              </button>
              <button
                onClick={() => setTimeFilter('rain')}
                title="Com Chuva / Tempestade"
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                  timeFilter === 'rain' ? 'bg-cyan-500/30 text-cyan-300' : 'text-cobble-400 hover:text-white'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Pokemon Population Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-cobble-400">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-2" />
              <p className="text-sm">Explorando ecossistema de {zone.name}...</p>
            </div>
          ) : filteredPokemons.length === 0 ? (
            <div className="text-center py-16 px-4 bg-cobble-950/40 rounded-2xl border border-cobble-800">
              <Compass className="w-10 h-10 text-cobble-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Nenhum Pokémon encontrado</h3>
              <p className="text-xs text-cobble-400 max-w-xs mx-auto">
                Tente ajustar os filtros de raridade, clima ou o termo de busca.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPokemons.map(p => {
                const rarityStyle = RARITY_LABELS[p.rarity] || RARITY_LABELS.common;
                const formattedName = p.name.charAt(0).toUpperCase() + p.name.slice(1);
                const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

                return (
                  <Link
                    key={p.id}
                    to={`/pokemon/${p.id}`}
                    className={`group relative flex items-center gap-3 p-3 rounded-2xl bg-cobble-950/60 border ${rarityStyle.border} transition-all duration-200 hover:bg-cobble-800/80 hover:shadow-lg`}
                  >
                    {/* Pokemon Artwork */}
                    <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center bg-cobble-900/80 rounded-xl p-1 border border-cobble-700/60 group-hover:scale-105 transition-transform">
                      <img
                        src={artworkUrl}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-contain drop-shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-cobble-400">
                          #{String(p.id).padStart(3, '0')}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${rarityStyle.badge}`}>
                          {rarityStyle.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate group-hover:text-yellow-400 transition-colors">
                        {formattedName}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-cobble-300">
                        <span className="bg-cobble-800 px-1.5 py-0.5 rounded text-cobble-200 font-semibold">
                          {p.levelRange}
                        </span>
                        {p.conditions?.requiresRain && (
                          <span className="flex items-center gap-0.5 text-cyan-300">
                            <CloudRain className="w-3 h-3" /> Chuva
                          </span>
                        )}
                        {p.timeRanges && p.timeRanges.length > 0 && (
                          <span className="text-cobble-400">
                            {p.timeRanges.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow action */}
                    <div className="text-cobble-500 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-cobble-950 border-t border-cobble-800 flex items-center justify-between text-xs text-cobble-400">
          <span>
            Exibindo <strong>{filteredPokemons.length}</strong> de <strong>{pokemons.length}</strong> espécies
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cobble-800 hover:bg-cobble-700 text-white rounded-xl font-bold transition-colors"
          >
            Fechar Censo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
