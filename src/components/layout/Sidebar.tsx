import { useState, useEffect } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Menu, X, Dices, Book, History, Star, Type, Package, Compass, Swords, 
  ChevronLeft, ChevronRight, ChevronDown, Globe, Apple, Bone, Disc, Dna, Layers 
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const LOOT_CATEGORIES = [
  { id: 'by-item', name: 'Por Itens', icon: Package },
  { id: 'by-pokemon', name: 'Por Pokémon', icon: Layers },
] as const;

export const GUIDE_CATEGORIES = [
  { id: 'atlas', name: 'Biomas', icon: Globe },
  { id: 'evolutions', name: 'Evoluções', icon: Compass },
  { id: 'berries', name: 'Bagas', icon: Apple },
  { id: 'fossils', name: 'Fósseis', icon: Bone },
  { id: 'pokeballs', name: 'Poké Balls', icon: Disc },
  { id: 'natures', name: 'Natures', icon: Dna },
] as const;

const TOP_NAV_ITEMS = [
  { name: 'Sorteio', href: '/sorteio', icon: Dices, badge: 'Popular' },
  { name: 'Pokédex', href: '/pokedex', icon: Book },
  { name: 'Batalha 1v1', href: '/arena', icon: Swords, badge: 'Novo' },
];

const BOTTOM_NAV_ITEMS = [
  { name: 'Favoritos', href: '/favoritos', icon: Star },
  { name: 'Histórico', href: '/historico', icon: History },
];

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useLocalStorage<boolean>('pokesumas-sidebar-expanded', false);
  const [fontPref, setFontPref] = useLocalStorage<'pixel' | 'modern'>('cobblemon-font', 'pixel');

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Route active states
  const isLootActive = location.pathname.startsWith('/loot');
  const currentLootView = searchParams.get('view') || 'by-item';

  const isGuideActive = location.pathname.startsWith('/guia');
  const currentTab = searchParams.get('tab') || 'atlas';

  // Exclusive Accordion: open only one section at a time to prevent scrollbar
  const [openSection, setOpenSection] = useState<'loot' | 'guide' | null>(() => {
    if (isLootActive) return 'loot';
    if (isGuideActive) return 'guide';
    return null;
  });

  // Sync open section when navigating between routes
  useEffect(() => {
    if (isLootActive) setOpenSection('loot');
    else if (isGuideActive) setOpenSection('guide');
  }, [isLootActive, isGuideActive]);

  const toggleSection = (section: 'loot' | 'guide') => {
    setOpenSection(prev => prev === section ? null : section);
  };

  useEffect(() => {
    if (fontPref === 'modern') {
      document.body.classList.remove('font-pixel');
      document.body.classList.add('font-modern');
    } else {
      document.body.classList.remove('font-modern');
      document.body.classList.add('font-pixel');
    }
  }, [fontPref]);

  const toggleFont = () => {
    setFontPref(fontPref === 'pixel' ? 'modern' : 'pixel');
  };

  return (
    <>
      {/* MOBILE TOP BAR (Hidden on desktop) */}
      <header className="md:hidden sticky top-0 z-50 bg-cobble-900/95 backdrop-blur-md border-b border-cobble-700 px-4 py-3 flex items-center justify-between shadow-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-cobble-200 hover:text-white rounded-lg hover:bg-cobble-800 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shadow-inner p-1">
            <img src="/sea-lion-pokemon-transparent.png" alt="PokeSumas" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
            PokeSumas
          </span>
        </div>

        <button
          onClick={toggleFont}
          className="p-2 bg-cobble-800 text-cobble-300 hover:text-white rounded-lg border border-cobble-700 text-xs font-bold"
          title="Alternar fonte"
        >
          <Type className="w-4 h-4" />
        </button>
      </header>

      {/* MOBILE OVERLAY DRAWER */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-cobble-900 border-r border-cobble-700 p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-cobble-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shadow-sm p-1">
                    <img src="/sea-lion-pokemon-transparent.png" alt="PokeSumas" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white italic">PokeSumas</h2>
                    <span className="text-[10px] text-cobble-400 block font-sans">Cobblemon Companion</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 text-cobble-400 hover:text-white rounded-lg hover:bg-cobble-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1.5">
                {TOP_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all',
                          isActive
                            ? 'bg-yellow-400 text-yellow-950 shadow-md font-black shadow-yellow-500/20'
                            : 'text-cobble-200 hover:bg-cobble-800 hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}

                {/* Drops / Loot Mobile Accordion */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSection('loot')}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer',
                      isLootActive
                        ? 'bg-yellow-400 text-yellow-950 font-black shadow-md shadow-yellow-500/20'
                        : 'text-cobble-200 hover:bg-cobble-800 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 shrink-0" />
                      <span>Drops / Loot</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        openSection === 'loot' && "rotate-180"
                      )}
                    />
                  </button>

                  {openSection === 'loot' && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-cobble-700 ml-5 my-1">
                      {LOOT_CATEGORIES.map(cat => {
                        const CatIcon = cat.icon;
                        const isSubActive = isLootActive && currentLootView === cat.id;
                        return (
                          <NavLink
                            key={cat.id}
                            to={`/loot?view=${cat.id}`}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                              isSubActive
                                ? "bg-yellow-400 text-yellow-950 font-black shadow-sm"
                                : "text-cobble-300 hover:text-white hover:bg-cobble-800"
                            )}
                          >
                            <CatIcon className={cn("w-4 h-4 shrink-0", isSubActive ? "text-yellow-950" : "text-yellow-400")} />
                            <span>{cat.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Guia Cobblemon Mobile Accordion */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSection('guide')}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer',
                      isGuideActive
                        ? 'bg-yellow-400 text-yellow-950 font-black shadow-md shadow-yellow-500/20'
                        : 'text-cobble-200 hover:bg-cobble-800 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Compass className="w-5 h-5 shrink-0" />
                      <span>Guia Cobblemon</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        openSection === 'guide' && "rotate-180"
                      )}
                    />
                  </button>

                  {openSection === 'guide' && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-cobble-700 ml-5 my-1">
                      {GUIDE_CATEGORIES.map(cat => {
                        const CatIcon = cat.icon;
                        const isSubActive = isGuideActive && currentTab === cat.id;
                        return (
                          <NavLink
                            key={cat.id}
                            to={`/guia?tab=${cat.id}`}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                              isSubActive
                                ? "bg-yellow-400 text-yellow-950 font-black shadow-sm"
                                : "text-cobble-300 hover:text-white hover:bg-cobble-800"
                            )}
                          >
                            <CatIcon className={cn("w-4 h-4 shrink-0", isSubActive ? "text-yellow-950" : "text-yellow-400")} />
                            <span>{cat.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>

                {BOTTOM_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all',
                          isActive
                            ? 'bg-yellow-400 text-yellow-950 shadow-md font-black shadow-yellow-500/20'
                            : 'text-cobble-200 hover:bg-cobble-800 hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-cobble-800 flex items-center justify-between">
              <span className="text-xs text-cobble-400">Fonte:</span>
              <button
                onClick={toggleFont}
                className="px-3 py-1.5 bg-cobble-800 text-cobble-200 hover:text-white rounded-lg border border-cobble-700 text-xs font-bold flex items-center gap-2"
              >
                <Type className="w-3.5 h-3.5 text-yellow-400" />
                <span>{fontPref === 'pixel' ? 'Pixel Retro' : 'Modern'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP FIXED SIDEBAR */}
      <aside
        className={cn(
          "hidden md:flex fixed top-0 bottom-0 left-0 z-40 bg-cobble-900/95 backdrop-blur-md border-r border-cobble-700/80 flex-col justify-between transition-all duration-300 shadow-2xl overflow-hidden",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        {/* Top: Logo & Main Nav */}
        <div className="flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-16 flex items-center px-4 border-b border-cobble-700/80 justify-between shrink-0">
            {isExpanded ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-600/10 border border-yellow-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/10 p-1">
                  <img src="/sea-lion-pokemon-transparent.png" alt="PokeSumas" className="w-8 h-8 object-contain" />
                </div>
                <div className="truncate">
                  <h1 className="text-xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500">
                    PokeSumas
                  </h1>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div 
                  onClick={() => setIsExpanded(true)}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-600/10 border border-yellow-500/40 flex items-center justify-center shadow-lg shadow-yellow-500/10 group cursor-pointer hover:scale-105 transition-transform p-1.5" 
                  title="PokeSumas - Clique para expandir"
                >
                  <img src="/sea-lion-pokemon-transparent.png" alt="PokeSumas" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-1 overflow-hidden">
            {TOP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center rounded-2xl transition-all duration-200 font-bold',
                      isExpanded ? 'px-3.5 py-2.5 gap-3.5 text-sm' : 'p-3 justify-center text-base',
                      isActive
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20 font-black'
                        : 'text-cobble-300 hover:text-white hover:bg-cobble-800/80 border border-transparent hover:border-cobble-700/60'
                    )
                  }
                >
                  <Icon className={cn("shrink-0 transition-transform group-hover:scale-110", isExpanded ? "w-5 h-5" : "w-6 h-6")} />

                  {isExpanded && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {/* Tooltip on collapsed mode */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-cobble-800 border border-cobble-600 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 whitespace-nowrap z-50 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-yellow-400 text-yellow-950 px-1.5 py-0.2 rounded font-black">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}

            {/* DROPS / LOOT ITEM WITH EXPANDABLE OPTIONS / FLYOUT */}
            {isExpanded ? (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection('loot')}
                  className={cn(
                    'w-full group relative flex items-center rounded-2xl transition-all duration-200 font-bold px-3.5 py-2.5 gap-3.5 text-sm cursor-pointer justify-between',
                    isLootActive
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20 font-black'
                      : 'text-cobble-300 hover:text-white hover:bg-cobble-800/80 border border-transparent hover:border-cobble-700/60'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Package className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Drops / Loot</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200",
                      openSection === 'loot' && "rotate-180"
                    )}
                  />
                </button>

                {openSection === 'loot' && (
                  <div className="pl-3.5 pr-1 py-0.5 space-y-0.5 border-l-2 border-cobble-700/70 ml-5 my-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {LOOT_CATEGORIES.map(cat => {
                      const CatIcon = cat.icon;
                      const isSubActive = isLootActive && currentLootView === cat.id;
                      return (
                        <NavLink
                          key={cat.id}
                          to={`/loot?view=${cat.id}`}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                            isSubActive
                              ? "bg-yellow-400 text-yellow-950 font-black shadow-md shadow-yellow-500/20"
                              : "text-cobble-300 hover:text-white hover:bg-cobble-800/80"
                          )}
                        >
                          <CatIcon className={cn("w-4 h-4 shrink-0", isSubActive ? "text-yellow-950" : "text-yellow-400")} />
                          <span className="truncate">{cat.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(true);
                    setOpenSection('loot');
                  }}
                  className={cn(
                    'w-full flex items-center justify-center p-3 rounded-2xl transition-all duration-200 font-bold cursor-pointer',
                    isLootActive
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20 font-black'
                      : 'text-cobble-300 hover:text-white hover:bg-cobble-800/80 border border-transparent hover:border-cobble-700/60'
                  )}
                  title="Drops / Loot"
                >
                  <Package className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" />
                </button>

                {/* Flyout Popover on Hover */}
                <div className="absolute left-full ml-3 top-0 bg-cobble-900 border border-cobble-700 text-white rounded-2xl shadow-2xl p-2 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="px-3 py-1.5 border-b border-cobble-800 mb-1 flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-400 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Drops / Loot
                    </span>
                    <span className="text-[10px] text-cobble-400 font-mono">Modo</span>
                  </div>
                  <div className="space-y-0.5">
                    {LOOT_CATEGORIES.map(cat => {
                      const CatIcon = cat.icon;
                      const isSubActive = isLootActive && currentLootView === cat.id;
                      return (
                        <NavLink
                          key={cat.id}
                          to={`/loot?view=${cat.id}`}
                          className={cn(
                            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                            isSubActive
                              ? "bg-yellow-400 text-yellow-950 font-black"
                              : "text-cobble-300 hover:text-white hover:bg-cobble-800"
                          )}
                        >
                          <CatIcon className={cn("w-3.5 h-3.5 shrink-0", isSubActive ? "text-yellow-950" : "text-yellow-400")} />
                          <span>{cat.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* GUIA COBBLEMON ITEM WITH EXPANDABLE OPTIONS / FLYOUT */}
            {isExpanded ? (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection('guide')}
                  className={cn(
                    'w-full group relative flex items-center rounded-2xl transition-all duration-200 font-bold px-3.5 py-2.5 gap-3.5 text-sm cursor-pointer justify-between',
                    isGuideActive
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20 font-black'
                      : 'text-cobble-300 hover:text-white hover:bg-cobble-800/80 border border-transparent hover:border-cobble-700/60'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Compass className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Guia Cobblemon</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200",
                      openSection === 'guide' && "rotate-180"
                    )}
                  />
                </button>

                {openSection === 'guide' && (
                  <div className="pl-3.5 pr-1 py-0.5 space-y-0.5 border-l-2 border-cobble-700/70 ml-5 my-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {GUIDE_CATEGORIES.map(cat => {
                      const CatIcon = cat.icon;
                      const isSubActive = isGuideActive && currentTab === cat.id;
                      return (
                        <NavLink
                          key={cat.id}
                          to={`/guia?tab=${cat.id}`}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                            isSubActive
                              ? "bg-yellow-400 text-yellow-950 font-black shadow-md shadow-yellow-500/20"
                              : "text-cobble-300 hover:text-white hover:bg-cobble-800/80"
                          )}
                        >
                          <CatIcon className={cn("w-3.5 h-3.5 shrink-0", isSubActive ? "text-yellow-950" : "text-yellow-400")} />
                          <span className="truncate">{cat.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(true);
                    setOpenSection('guide');
                  }}
                  className={cn(
                    'w-full flex items-center justify-center p-3 rounded-2xl transition-all duration-200 font-bold cursor-pointer',
                    isGuideActive
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20 font-black'
                      : 'text-cobble-300 hover:text-white hover:bg-cobble-800/80 border border-transparent hover:border-cobble-700/60'
                  )}
                  title="Guia Cobblemon"
                >
                  <Compass className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" />
                </button>

                {/* Flyout Popover on Hover */}
                <div className="absolute left-full ml-3 top-0 bg-cobble-900 border border-cobble-700 text-white rounded-2xl shadow-2xl p-2 w-52 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="px-3 py-1.5 border-b border-cobble-800 mb-1 flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Guia Cobblemon
                    </span>
                    <span className="text-[10px] text-cobble-400 font-mono">6 categorias</span>
                  </div>
                  <div className="space-y-0.5">
                    {GUIDE_CATEGORIES.map(cat => {
                      const CatIcon = cat.icon;
                      const isSubActive = isGuideActive && currentTab === cat.id;
                      return (
                        <NavLink
                          key={cat.id}
                          to={`/guia?tab=${cat.id}`}
                          className={cn(
                            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                            isSubActive
                              ? "bg-yellow-400 text-yellow-950 font-black"
                              : "text-cobble-300 hover:text-white hover:bg-cobble-800"
                          )}
                        >
                          <CatIcon className={cn("w-3.5 h-3.5 shrink-0", isSubActive ? "text-yellow-950" : "text-yellow-400")} />
                          <span>{cat.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center rounded-2xl transition-all duration-200 font-bold',
                      isExpanded ? 'px-3.5 py-2.5 gap-3.5 text-sm' : 'p-3 justify-center text-base',
                      isActive
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20 font-black'
                        : 'text-cobble-300 hover:text-white hover:bg-cobble-800/80 border border-transparent hover:border-cobble-700/60'
                    )
                  }
                >
                  <Icon className={cn("shrink-0 transition-transform group-hover:scale-110", isExpanded ? "w-5 h-5" : "w-6 h-6")} />

                  {isExpanded && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {/* Tooltip on collapsed mode */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-cobble-800 border border-cobble-600 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 whitespace-nowrap z-50 flex items-center gap-1.5">
                      <span>{item.name}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Clean & Compact Footer */}
        <div className="p-3 border-t border-cobble-700/80 shrink-0">
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFont}
                className="flex-1 py-2 px-3 rounded-xl bg-cobble-800/70 hover:bg-cobble-800 text-cobble-300 hover:text-white border border-cobble-700/60 transition-colors flex items-center justify-between text-xs font-bold"
                title={fontPref === 'pixel' ? 'Trocar para fonte Moderna' : 'Trocar para fonte Pixel'}
              >
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>Fonte: {fontPref === 'pixel' ? 'Pixel' : 'Moderna'}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cobble-900 text-cobble-400 font-mono">
                  {fontPref.toUpperCase()}
                </span>
              </button>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl bg-cobble-800/40 hover:bg-cobble-800 text-cobble-400 hover:text-white border border-cobble-700/40 transition-colors flex items-center justify-center shrink-0"
                title="Recolher Menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col items-center">
              <button
                onClick={toggleFont}
                className="p-2.5 rounded-xl bg-cobble-800/70 hover:bg-cobble-800 text-cobble-300 hover:text-white border border-cobble-700/60 transition-colors flex items-center justify-center"
                title={fontPref === 'pixel' ? 'Trocar para fonte Moderna' : 'Trocar para fonte Pixel'}
              >
                <Type className="w-4 h-4 text-yellow-400" />
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="p-2.5 rounded-xl bg-cobble-800/40 hover:bg-cobble-800 text-cobble-400 hover:text-white border border-cobble-700/40 transition-colors flex items-center justify-center"
                title="Expandir Menu"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}