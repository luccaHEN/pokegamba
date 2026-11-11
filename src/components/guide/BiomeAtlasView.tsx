import { useState } from 'react';
import { BIOME_ZONES } from '../../data/biomes';
import type { BiomeZone } from '../../data/biomes';
import { BiomePlanet3D } from './BiomePlanet3D';
import { BiomePopulationDrawer } from './BiomePopulationDrawer';
import { Globe, LayoutGrid, Sparkles, ChevronRight, Layers } from 'lucide-react';

export function BiomeAtlasView() {
  const [selectedZone, setSelectedZone] = useState<BiomeZone | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'cards'>('3d');

  const handleSelectZone = (zone: BiomeZone) => {
    setSelectedZone(zone);
  };

  const handleCloseDrawer = () => {
    setSelectedZone(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Mode Toggle & Quick Explanation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-cobble-800/80 p-4 sm:p-5 rounded-2xl border border-cobble-700">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Atlas Interativo do Mundo Cobblemon
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-yellow-400" />
            Planeta dos Biomas & Censo de População
          </h2>
          <p className="text-xs sm:text-sm text-cobble-300 mt-1 max-w-xl">
            Gire o planeta em 3D, explore os continentes e clique em qualquer região para ver a população completa de Pokémon que spawnam nela.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-cobble-950 p-1 rounded-xl border border-cobble-700 self-stretch sm:self-auto">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-400/20'
                : 'text-cobble-300 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Planeta 3D</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-400/20'
                : 'text-cobble-300 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grade de Cards</span>
          </button>
        </div>
      </div>

      {/* Main View Area: 3D Planet or 2D Cards Grid */}
      {viewMode === '3d' ? (
        <div className="space-y-4">
          <BiomePlanet3D
            selectedZone={selectedZone}
            onSelectZone={handleSelectZone}
          />

          {/* Quick Biome Navigator Carousel / Grid below the 3D Planet */}
          <div className="bg-cobble-900/60 p-4 rounded-2xl border border-cobble-800">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-cobble-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-yellow-400" />
                Continentes & Zonas do Planeta
              </span>
              <span className="text-[11px] text-cobble-400">Clique para focar no 3D e abrir o censo</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {BIOME_ZONES.map(zone => {
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleSelectZone(zone)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 group ${
                      isSelected
                        ? 'bg-yellow-500/20 border-yellow-400 shadow-md shadow-yellow-500/20 scale-102'
                        : 'bg-cobble-950/70 border-cobble-800 hover:bg-cobble-800/90 hover:border-cobble-600'
                    }`}
                  >
                    <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                      {zone.icon}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">
                      {zone.shortName}
                    </h4>
                    <span 
                      className="text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${zone.color}25`, 
                        color: zone.color,
                        border: `1px solid ${zone.color}50` 
                      }}
                    >
                      {zone.climate.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 2D Cards Grid fallback view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BIOME_ZONES.map(zone => (
            <div
              key={zone.id}
              onClick={() => handleSelectZone(zone)}
              className="cursor-pointer group flex flex-col justify-between p-5 rounded-2xl bg-cobble-900/80 border border-cobble-700/80 hover:border-yellow-400/80 hover:bg-cobble-800/80 transition-all duration-200 shadow-lg hover:shadow-yellow-500/10"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-4xl p-2 rounded-2xl bg-cobble-950/80 border border-cobble-800 group-hover:scale-110 transition-transform shadow-inner">
                    {zone.icon}
                  </span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{ 
                      backgroundColor: `${zone.color}25`, 
                      color: zone.color,
                      border: `1px solid ${zone.color}50` 
                    }}
                  >
                    {zone.climate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                  {zone.name}
                </h3>
                <p className="text-xs text-cobble-400 mt-1 line-clamp-2">
                  {zone.subtitle}
                </p>

                <p className="text-xs text-cobble-300/90 mt-3 line-clamp-3 bg-cobble-950/40 p-2.5 rounded-xl border border-cobble-800/60 leading-relaxed">
                  {zone.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-cobble-800 flex items-center justify-between text-xs font-bold text-yellow-400 group-hover:translate-x-1 transition-transform">
                <span>Explorar População</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Population Drawer Side-Modal */}
      <BiomePopulationDrawer
        zone={selectedZone}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
