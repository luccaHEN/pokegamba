import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Ruler, Weight, Shield, Sword, Heart, Zap, ArrowUp, Sparkles, 
  ShieldAlert, ZapOff, BarChart3, Compass, Swords, Trophy, GitFork, ChevronUp 
} from 'lucide-react';
import { pokeApi } from '../services/pokeapi';
import type { Pokemon, PokemonSpecies } from '../types/pokemon';
import { PokemonTypeBadge } from '../components/pokemon/PokemonTypeBadge';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { SmogonBuilds } from '../components/pokemon/SmogonBuilds';
import { PokemonAbilities } from '../components/pokemon/PokemonAbilities';
import { PokemonLearnset } from '../components/pokemon/PokemonLearnset';
import { CobblemonSpawns } from '../components/pokemon/CobblemonSpawns';
import { PokemonDetailTabs, PokemonDetailSidebar } from '../components/pokemon/PokemonDetailTabs';
import type { DetailTabItem } from '../components/pokemon/PokemonDetailTabs';
import { REGIONAL_OBTAIN_GUIDE } from '../data/regionalForms';
import { COBBLEMON_NATURES } from '../data/natures';
import raticateImg from '../assets/raticate.png';

export default function PokemonDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<Pokemon[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [resistances, setResistances] = useState<string[]>([]);
  const [immunities, setImmunities] = useState<string[]>([]);
  
  // Variations / Regional Forms
  const [varieties, setVarieties] = useState<{ name: string; label: string; isDefault: boolean }[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');

  // Nature selector for stat highlight
  const [selectedNature, setSelectedNature] = useState<string>('none');
  
  const [isShiny, setIsShiny] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sticky Tab Navigation State
  const [activeTab, setActiveTab] = useState<string>('section-stats');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isManualScrolling = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const tabs = useMemo<DetailTabItem[]>(() => {
    const list: DetailTabItem[] = [
      { id: 'section-stats', label: 'Stats & Combate', icon: BarChart3 },
      { id: 'section-spawns', label: 'Spawns Cobblemon', icon: Compass },
      { id: 'section-abilities', label: 'Habilidades', icon: Sparkles },
      { id: 'section-moves', label: 'Ataques', icon: Swords },
      { id: 'section-smogon', label: 'Builds Smogon', icon: Trophy },
    ];
    if (evolutionChain.length > 1) {
      list.push({ id: 'section-evolution', label: 'Evoluções', icon: GitFork });
    }
    return list;
  }, [evolutionChain.length]);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    isManualScrolling.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    const element = document.getElementById(tabId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrolling.current = false;
    }, 800);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('section-stats');
  };

  // ScrollSpy listener to sync activeTab with visible section
  useEffect(() => {
    const sectionIds = tabs.map(t => t.id);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowBackToTop(scrollY > 400);

      if (isManualScrolling.current) return;

      const threshold = 220; // Distance from top below Navbar
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            current = id;
          }
        }
      }

      setActiveTab(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [tabs]);

  const calculateTypeMatchups = async (p: Pokemon) => {
    try {
      const typePromises = p.types.map(t => pokeApi.getPokemonByType(t.type.name));
      const typeDataList = await Promise.all(typePromises);
      
      const multipliers: Record<string, number> = {};
      
      typeDataList[0]?.damage_relations?.double_damage_from?.forEach((t: any) => multipliers[t.name] = 1);
      
      typeDataList.forEach((typeData: any) => {
        typeData.damage_relations.double_damage_from.forEach((t: any) => multipliers[t.name] = (multipliers[t.name] || 1) * 2);
        typeData.damage_relations.half_damage_from.forEach((t: any) => multipliers[t.name] = (multipliers[t.name] || 1) * 0.5);
        typeData.damage_relations.no_damage_from.forEach((t: any) => multipliers[t.name] = 0);
      });

      const weak: string[] = [];
      const resist: string[] = [];
      const immune: string[] = [];

      Object.entries(multipliers).forEach(([type, mult]) => {
        if (mult > 1) weak.push(type);
        if (mult < 1 && mult > 0) resist.push(type);
        if (mult === 0) immune.push(type);
      });

      setWeaknesses(weak);
      setResistances(resist);
      setImmunities(immune);
    } catch (err) {
      console.warn('Erro ao calcular matchups:', err);
    }
  };

  const formatFormLabel = (rawName: string, baseName: string): string => {
    if (rawName === baseName) return 'Forma Padrão / Clássica';
    const sub = rawName.replace(`${baseName}-`, '');
    const map: Record<string, string> = {
      'hisui': 'Hisuian (Hisui)',
      'alola': 'Alolan (Alola)',
      'galar': 'Galarian (Galar)',
      'paldea': 'Paldean (Paldea)',
      'mega': 'Mega Evolução',
      'mega-x': 'Mega Evolução X',
      'mega-y': 'Mega Evolução Y',
      'gmax': 'Gigantamax',
      'origin': 'Forma Origem',
      'therian': 'Forma Therian',
      'incarnate': 'Forma Incarnate',
      'crowned': 'Crowned Form',
      'bloodmoon': 'Bloodmoon',
      'totem': 'Totem'
    };
    return map[sub] || sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Switch between form variations
  const handleSwitchForm = async (formName: string) => {
    if (formName === selectedForm) return;
    try {
      setLoading(true);
      const newPokemonData = await pokeApi.getPokemon(formName);
      setPokemon(newPokemonData);
      setSelectedForm(formName);
      await calculateTypeMatchups(newPokemonData);
    } catch (err) {
      console.error('Erro ao trocar de variação:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const p = await pokeApi.getPokemon(id);
        const s = await pokeApi.getPokemonSpecies(id);
        setPokemon(p);
        setSpecies(s);
        setSelectedForm(p.name);

        // Process Varieties / Regional Forms
        if (s.varieties && s.varieties.length > 1) {
          const formattedVarieties = s.varieties.map(v => ({
            name: v.pokemon.name,
            label: formatFormLabel(v.pokemon.name, s.name),
            isDefault: v.is_default
          }));
          setVarieties(formattedVarieties);
        } else {
          setVarieties([]);
        }

        // Fetch Evolution Chain
        if (s.evolution_chain?.url) {
          const chainId = s.evolution_chain.url.split('/').filter(Boolean).pop();
          if (chainId) {
            const chainData = await pokeApi.get<any>(`/evolution-chain/${chainId}`);
            const evos: string[] = [];
            
            const extractEvolutions = (node: any) => {
              evos.push(node.species.name);
              node.evolves_to.forEach((evo: any) => extractEvolutions(evo));
            };
            extractEvolutions(chainData.chain);
            
            const evoPromises = evos.map(name => pokeApi.getPokemon(name).catch(() => null));
            const evoResults = await Promise.all(evoPromises);
            setEvolutionChain(evoResults.filter(Boolean) as Pokemon[]);
          }
        }

        // Calculate Type Matchups for default form
        await calculateTypeMatchups(p);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    setIsShiny(false); // Reset shiny toggle on page change
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-pulse w-16 h-16 bg-cobble-700 rounded-full"></div></div>;
  }

  if (!pokemon || !species) {
    return <div className="text-center text-red-400">Pokémon não encontrado.</div>;
  }

  const description = species.flavor_text_entries.find(f => f.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') || 'No description available.';

  const statIcons: Record<string, any> = {
    'hp': Heart,
    'attack': Sword,
    'defense': Shield,
    'special-attack': Zap,
    'special-defense': Shield,
    'speed': ArrowUp
  };

  const statColors: Record<string, string> = {
    'hp': 'bg-green-500',
    'attack': 'bg-red-500',
    'defense': 'bg-blue-500',
    'special-attack': 'bg-purple-500',
    'special-defense': 'bg-indigo-500',
    'speed': 'bg-yellow-500'
  };

  const isRaticate = pokemon.id === 20 || pokemon.name === 'raticate' || pokemon.name === 'raticate-alola';

  const currentSprite = isRaticate
    ? raticateImg
    : isShiny 
    ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny)
    : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);

  return (
    <div className="relative max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 text-cobble-300 hover:text-white">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </Button>

      {/* Giant Main Pokémon Card - 100% Centered */}
      <div className="w-full bg-cobble-800 rounded-[2rem] border-2 border-cobble-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Image Header with Shiny Toggle */}
        <div className="relative h-72 rounded-t-[2rem] overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cobble-700 via-cobble-800 to-cobble-900 flex items-center justify-center">
          <span className="absolute top-6 left-6 text-6xl font-black text-white/5 tracking-tighter">
            #{String(pokemon.id).padStart(4, '0')}
          </span>
          
          <button 
            onClick={() => setIsShiny(!isShiny)}
            className={cn(
              "absolute top-6 right-6 p-3 rounded-xl font-bold flex items-center gap-2 transition-all border-2 shadow-lg",
              isShiny ? "bg-yellow-400 text-yellow-900 border-yellow-300 hover:bg-yellow-300" : "bg-cobble-800 text-cobble-300 border-cobble-600 hover:bg-cobble-700 hover:text-yellow-400"
            )}
            title="Ver versão Shiny"
          >
            <Sparkles className="w-5 h-5" />
            {isShiny ? 'Versão Shiny' : 'Versão Normal'}
          </button>

          <img 
            key={currentSprite}
            src={currentSprite} 
            alt={pokemon.name}
            className="h-64 w-64 object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-10 hover:scale-110 transition-transform duration-500 animate-in zoom-in-95"
          />
        </div>

        <div className="p-8 md:p-10 space-y-12">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-black capitalize mb-4 text-white drop-shadow-sm">{pokemon.name.replace('-', ' ')}</h1>
              <div className="flex gap-4">
                {pokemon.types.map(t => (
                  <PokemonTypeBadge key={t.type.name} type={t.type.name} className="px-4 py-1.5 text-sm shadow-md" />
                ))}
              </div>
            </div>
            
            <div className="flex gap-6 bg-cobble-900/80 p-5 rounded-2xl border border-cobble-700 shadow-inner">
              <div className="text-center">
                <Ruler className="w-6 h-6 mx-auto mb-2 text-cobble-400" />
                <span className="text-base font-bold text-white">{pokemon.height / 10} m</span>
              </div>
              <div className="w-px bg-cobble-700"></div>
              <div className="text-center">
                <Weight className="w-6 h-6 mx-auto mb-2 text-cobble-400" />
                <span className="text-base font-bold text-white">{pokemon.weight / 10} kg</span>
              </div>
            </div>
          </div>

          {/* Regional Forms / Variations Selector */}
          {varieties.length > 1 && (
            <div className="p-5 rounded-2xl bg-cobble-900/70 border border-cobble-700 shadow-inner space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center justify-between">
                <span>Variações & Formas Regionais</span>
                <span className="text-cobble-400 font-normal">Selecione para alternar atributos, tipos e sprites</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {varieties.map((v) => {
                  const isActive = selectedForm === v.name;
                  return (
                    <button
                      key={v.name}
                      onClick={() => handleSwitchForm(v.name)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm",
                        isActive
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 border-yellow-300 shadow-yellow-500/20 scale-105"
                          : "bg-cobble-800 text-cobble-300 border-cobble-700 hover:border-yellow-400/50 hover:text-white"
                      )}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>

              {/* How to Obtain this variation Guide Card */}
              {selectedForm && REGIONAL_OBTAIN_GUIDE[selectedForm] && (
                <div className="mt-3 p-4 rounded-xl bg-cobble-950/80 border border-yellow-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
                      Como Obter no Cobblemon / Minecraft:
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cobble-900 text-cobble-300 border border-cobble-800">
                      Região: {REGIONAL_OBTAIN_GUIDE[selectedForm].region}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {REGIONAL_OBTAIN_GUIDE[selectedForm].obtainMethod}
                  </p>
                  <p className="text-xs text-cobble-300 leading-relaxed">
                    {REGIONAL_OBTAIN_GUIDE[selectedForm].cobblemonDetails}
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-xl text-cobble-200 italic border-l-4 border-blue-500 pl-6 py-2 font-medium bg-gradient-to-r from-blue-500/10 to-transparent rounded-r-xl">
            "{description}"
          </p>

          {/* Sticky Tab Navigation */}
          <PokemonDetailTabs
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
          />

          <div id="section-stats" className="scroll-mt-20 grid md:grid-cols-2 gap-10">
            {/* Stats */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-2xl font-black flex items-center text-white">
                  Stats Base
                </h3>

                {/* Nature Selector */}
                <div className="relative">
                  <select
                    value={selectedNature}
                    onChange={(e) => setSelectedNature(e.target.value)}
                    className="appearance-none bg-cobble-900 border border-cobble-700 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-yellow-400 cursor-pointer shadow-inner"
                    title="Simular efeito de Nature nos atributos"
                  >
                    <option value="none" className="bg-cobble-900 text-white">Nature: Padrão (Sem Nature)</option>
                    {COBBLEMON_NATURES.map((nat) => (
                      <option key={nat.id} value={nat.id} className="bg-cobble-900 text-white">
                        {nat.name} ({nat.increasedStat ? `${nat.increasedStatLabel} / ${nat.decreasedStatLabel}` : 'Neutra'})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-cobble-400 text-[10px]">▼</div>
                </div>
              </div>

              {/* Active Nature Indicator Notice */}
              {selectedNature !== 'none' && (() => {
                const currentNat = COBBLEMON_NATURES.find(n => n.id === selectedNature);
                if (!currentNat) return null;
                return (
                  <div className="mb-4 p-2.5 rounded-xl bg-cobble-900/80 border border-cobble-700 text-xs flex items-center justify-between gap-2 shadow-inner">
                    <span className="font-bold text-white">Efeito de {currentNat.name}:</span>
                    {currentNat.increasedStat ? (
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                          {currentNat.increasedStatLabel}
                        </span>
                        <span className="font-black text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                          {currentNat.decreasedStatLabel}
                        </span>
                      </div>
                    ) : (
                      <span className="text-cobble-300 font-semibold">Atributos Neutros (0%)</span>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-5">
                {pokemon.stats.map(s => {
                  const Icon = statIcons[s.stat.name] || Heart;
                  const currentNat = COBBLEMON_NATURES.find(n => n.id === selectedNature);
                  const isBoosted = currentNat?.increasedStat === s.stat.name;
                  const isReduced = currentNat?.decreasedStat === s.stat.name;

                  let color = statColors[s.stat.name] || 'bg-blue-500';
                  if (isBoosted) color = 'bg-emerald-500';
                  if (isReduced) color = 'bg-red-500';

                  const percentage = Math.min(100, (s.base_stat / 255) * 100);
                  
                  return (
                    <div key={s.stat.name}>
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className={cn(
                          "flex items-center capitalize font-bold transition-colors",
                          isBoosted ? "text-emerald-400 font-black" : isReduced ? "text-red-400 font-black" : "text-cobble-300"
                        )}>
                          <Icon className="w-4 h-4 mr-2" /> 
                          {s.stat.name.replace('-', ' ')}
                          {isBoosted && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded uppercase font-black tracking-wide">+10%</span>}
                          {isReduced && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-red-950/80 text-red-300 border border-red-500/40 rounded uppercase font-black tracking-wide">-10%</span>}
                        </span>
                        <span className={cn(
                          "font-black text-white transition-colors",
                          isBoosted ? "text-emerald-300" : isReduced ? "text-red-300" : ""
                        )}>
                          {s.base_stat}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-cobble-900 rounded-full overflow-hidden border border-cobble-800 shadow-inner">
                        <div 
                          className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Combat Matchups */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black mb-6 flex items-center text-white">
                Combate (Vantagens)
              </h3>
              
              <div className="bg-red-500/10 border-2 border-red-500/20 rounded-2xl p-5">
                <h4 className="font-bold text-red-400 mb-3 flex items-center text-sm uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 mr-2" /> Fraquezas (Leva 2x ou 4x dano)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {weaknesses.length > 0 ? weaknesses.map(w => (
                    <PokemonTypeBadge key={w} type={w} />
                  )) : <span className="text-cobble-400 text-sm font-bold">Nenhuma fraqueza extrema!</span>}
                </div>
              </div>

              <div className="bg-green-500/10 border-2 border-green-500/20 rounded-2xl p-5">
                <h4 className="font-bold text-green-400 mb-3 flex items-center text-sm uppercase tracking-wider">
                  <Shield className="w-4 h-4 mr-2" /> Resistências (Leva metade do dano)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resistances.length > 0 ? resistances.map(r => (
                    <PokemonTypeBadge key={r} type={r} />
                  )) : <span className="text-cobble-400 text-sm font-bold">Nenhuma resistência.</span>}
                </div>
              </div>

              {immunities.length > 0 && (
                <div className="bg-cobble-900 border-2 border-cobble-700 rounded-2xl p-5">
                  <h4 className="font-bold text-cobble-300 mb-3 flex items-center text-sm uppercase tracking-wider">
                    <ZapOff className="w-4 h-4 mr-2" /> Imunidades (Não leva dano)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {immunities.map(i => (
                      <PokemonTypeBadge key={i} type={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cobblemon Minecraft Spawns Section */}
          <div id="section-spawns" className="scroll-mt-20 pt-8 border-t border-cobble-700">
            <CobblemonSpawns pokemonId={pokemon.id} pokemonName={pokemon.name} />
          </div>

          {/* Natural Abilities Section */}
          <div id="section-abilities" className="scroll-mt-20 pt-8 border-t border-cobble-700">
            <PokemonAbilities abilities={pokemon.abilities} />
          </div>

          {/* Learnset / Moves Section */}
          <div id="section-moves" className="scroll-mt-20 pt-8 border-t border-cobble-700">
            <PokemonLearnset moves={pokemon.moves} />
          </div>

          {/* Smogon Competitive Builds */}
          <div id="section-smogon" className="scroll-mt-20 pt-8 border-t border-cobble-700">
            <SmogonBuilds pokemonName={pokemon.name} />
          </div>

          {/* Evolution Chain */}
          {evolutionChain.length > 1 && (
            <div id="section-evolution" className="scroll-mt-20 pt-8 border-t border-cobble-700">
              <h3 className="text-2xl font-black mb-8 text-center text-white">Linha Evolutiva</h3>
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 bg-cobble-900/50 p-8 rounded-3xl border border-cobble-700/50 shadow-inner">
                {evolutionChain.map((evo, idx) => (
                  <div key={evo.id} className="flex items-center gap-4 md:gap-8">
                    <Link to={`/pokemon/${evo.id}`} className="group flex flex-col items-center">
                      <div className={cn(
                        "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center p-4 transition-all duration-300 border-4 shadow-xl",
                        evo.id === pokemon.id 
                          ? "bg-blue-500/20 border-blue-500 scale-110" 
                          : "bg-cobble-800 border-cobble-600 group-hover:border-blue-400 group-hover:scale-105"
                      )}>
                        <img 
                          src={
                            (evo.id === 20 || evo.name === 'raticate' || evo.name === 'raticate-alola')
                              ? raticateImg
                              : (evo.sprites.other['official-artwork'].front_default || evo.sprites.front_default)
                          } 
                          alt={evo.name}
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                      <span className="mt-4 font-bold capitalize text-cobble-200 group-hover:text-white transition-colors">
                        {evo.name}
                      </span>
                    </Link>
                    {idx < evolutionChain.length - 1 && (
                      <div className="text-cobble-600 hidden md:block">
                        <ArrowLeft className="w-8 h-8 rotate-180" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky Desktop Rail - Positioned beside the centered card, descends as user scrolls */}
      <div className="hidden xl:block absolute left-full ml-6 top-16 bottom-0 w-60 xl:w-64 pointer-events-none">
        <div className="sticky top-24 pointer-events-auto">
          <PokemonDetailSidebar
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            pokemonName={pokemon.name}
            pokemonId={pokemon.id}
            spriteUrl={isRaticate ? raticateImg : (pokemon.sprites.front_default || currentSprite)}
            onScrollToTop={handleScrollToTop}
          />
        </div>
      </div>

      {/* Floating Back to Top Button for mobile/compact viewports */}
      <button
        type="button"
        onClick={handleScrollToTop}
        className={cn(
          "xl:hidden fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-2xl transition-all duration-300 cursor-pointer",
          "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 font-black",
          "border-2 border-yellow-300 hover:scale-110 active:scale-95 hover:shadow-yellow-500/30",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        )}
        title="Voltar ao topo"
        aria-label="Voltar ao topo da página"
      >
        <ChevronUp className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
}
