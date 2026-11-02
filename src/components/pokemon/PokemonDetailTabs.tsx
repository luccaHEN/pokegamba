import React from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DetailTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PokemonDetailSidebarProps {
  tabs: DetailTabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  pokemonName: string;
  pokemonId: number;
  spriteUrl?: string;
  onScrollToTop: () => void;
  className?: string;
}

export interface PokemonDetailTabsProps {
  tabs: DetailTabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  className?: string;
}

/**
 * Barra de abas horizontais para visualização em telas compactas (< xl)
 */
export function PokemonDetailTabs({
  tabs,
  activeTab,
  onSelectTab,
  className,
}: PokemonDetailTabsProps) {
  return (
    <nav
      aria-label="Navegação de seções do Pokémon (Mobile)"
      className={cn(
        "xl:hidden sticky top-20 z-30 -mx-8 md:-mx-10 px-6 md:px-10 py-3",
        "bg-cobble-900/95 backdrop-blur-md border-y border-cobble-700 shadow-xl",
        "transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none",
                isActive
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 font-black shadow-md shadow-yellow-500/20 scale-102"
                  : "text-cobble-200 hover:text-white hover:bg-cobble-800 border border-transparent hover:border-cobble-600"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-yellow-950" : "text-cobble-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Trilho / Sidebar fixo ao lado do card central que desce acompanhando a rolagem (>= xl)
 */
export function PokemonDetailSidebar({
  tabs,
  activeTab,
  onSelectTab,
  pokemonName,
  pokemonId,
  spriteUrl,
  onScrollToTop,
  className,
}: PokemonDetailSidebarProps) {
  return (
    <aside
      aria-label="Navegação rápida do Pokémon"
      className={cn(
        "flex flex-col w-60 xl:w-64",
        "bg-cobble-900/95 backdrop-blur-md border-2 border-cobble-700 rounded-2xl p-4 shadow-2xl",
        "transition-all duration-200",
        className
      )}
    >
      {/* Header Info */}
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-cobble-700/80">
        {spriteUrl && (
          <img
            src={spriteUrl}
            alt={pokemonName}
            className="w-10 h-10 object-contain drop-shadow"
          />
        )}
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-yellow-400/90 uppercase tracking-wider block">
            #{String(pokemonId).padStart(4, '0')}
          </span>
          <h4 className="text-sm font-black text-white capitalize truncate leading-tight">
            {pokemonName.replace('-', ' ')}
          </h4>
        </div>
      </div>

      <div className="text-[11px] font-bold text-cobble-400 uppercase tracking-wider px-2 mb-2">
        Navegação Rápida
      </div>

      {/* Vertical Anchor Tabs */}
      <nav className="flex flex-col gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none text-left",
                isActive
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 font-black shadow-md shadow-yellow-500/20 translate-x-1"
                  : "text-cobble-300 hover:text-white hover:bg-cobble-800/80 border border-transparent hover:border-cobble-700"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-yellow-950" : "text-cobble-400 group-hover:text-yellow-400"
                )}
              />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Back to Top */}
      <div className="pt-3 mt-4 border-t border-cobble-700/80">
        <button
          type="button"
          onClick={onScrollToTop}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-cobble-300 hover:text-white hover:bg-cobble-800/80 transition-colors cursor-pointer border border-transparent hover:border-cobble-700"
        >
          <ChevronUp className="w-4 h-4" />
          <span>Voltar ao topo</span>
        </button>
      </div>
    </aside>
  );
}
