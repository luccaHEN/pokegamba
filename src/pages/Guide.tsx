import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, Sparkles, Filter, X, ArrowRight } from 'lucide-react';
import { COBBLEMON_EVOLUTIONS } from '../data/evolutions';
import type { EvolutionData } from '../data/evolutions';
import { COBBLEMON_BERRIES } from '../data/berries';
import type { BerryData } from '../data/berries';
import { COBBLEMON_FOSSILS } from '../data/fossils';
import type { FossilData } from '../data/fossils';
import { COBBLEMON_POKEBALLS } from '../data/pokeballs';
import type { PokeBallData } from '../data/pokeballs';
import { COBBLEMON_NATURES } from '../data/natures';
import type { NatureData } from '../data/natures';

export default function Guide() {
  const [activeTab, setActiveTab] = useState<'evolutions' | 'berries' | 'fossils' | 'pokeballs' | 'natures'>('evolutions');
  const [search, setSearch] = useState('');

  // Evolution filters
  const [evolutionMethodFilter, setEvolutionMethodFilter] = useState<'all' | 'pedra' | 'amizade' | 'troca' | 'condicao'>('all');

  // Berry filters
  const [berryCategoryFilter, setBerryCategoryFilter] = useState<'all' | 'cura' | 'status' | 'ev' | 'resistencia' | 'utilidade'>('all');

  // Filtered Evolutions
  const filteredEvolutions = useMemo(() => {
    return COBBLEMON_EVOLUTIONS.filter((evo: EvolutionData) => {
      const query = search.toLowerCase();
      const matchesSearch =
        evo.pokemonName.toLowerCase().includes(query) ||
        evo.evolvesToName.toLowerCase().includes(query) ||
        evo.requirement.toLowerCase().includes(query) ||
        evo.detail.toLowerCase().includes(query);

      const matchesMethod = evolutionMethodFilter === 'all' || evo.methodType === evolutionMethodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [search, evolutionMethodFilter]);

  // Filtered Berries
  const filteredBerries = useMemo(() => {
    return COBBLEMON_BERRIES.filter((berry: BerryData) => {
      const query = search.toLowerCase();
      const matchesSearch =
        berry.name.toLowerCase().includes(query) ||
        berry.effect.toLowerCase().includes(query) ||
        berry.description.toLowerCase().includes(query) ||
        berry.categoryLabel.toLowerCase().includes(query);

      const matchesCategory = berryCategoryFilter === 'all' || berry.category === berryCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [search, berryCategoryFilter]);

  // Filtered Fossils
  const filteredFossils = useMemo(() => {
    return COBBLEMON_FOSSILS.filter((fossil: FossilData) => {
      const query = search.toLowerCase();
      return (
        fossil.fossilName.toLowerCase().includes(query) ||
        fossil.pokemonName.toLowerCase().includes(query) ||
        fossil.miningLocation.toLowerCase().includes(query) ||
        fossil.description.toLowerCase().includes(query)
      );
    });
  }, [search]);

  // Filtered Poké Balls
  const filteredPokeBalls = useMemo(() => {
    return COBBLEMON_POKEBALLS.filter((ball: PokeBallData) => {
      const query = search.toLowerCase();
      return (
        ball.name.toLowerCase().includes(query) ||
        ball.apricornRecipe.toLowerCase().includes(query) ||
        ball.specialCondition.toLowerCase().includes(query) ||
        ball.description.toLowerCase().includes(query)
      );
    });
  }, [search]);

  // Filtered Natures
  const filteredNatures = useMemo(() => {
    return COBBLEMON_NATURES.filter((nature: NatureData) => {
      const query = search.toLowerCase();
      return (
        nature.name.toLowerCase().includes(query) ||
        nature.increasedStatLabel.toLowerCase().includes(query) ||
        nature.decreasedStatLabel.toLowerCase().includes(query) ||
        nature.summary.toLowerCase().includes(query) ||
        nature.flavorLike.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cobble-900 via-cobble-800 to-cobble-900 border border-yellow-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Guia Completo Cobblemon
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide flex items-center gap-3">
              <Compass className="w-9 h-9 text-yellow-400" />
              Guia Cobblemon & Sobrevivência
            </h1>
            <p className="text-cobble-300 text-sm sm:text-base mt-2 max-w-2xl">
              Consulte métodos evolutivos especiais, efeitos e cultivo de bagas, escavação de fósseis pré-históricos e receitas de criação de Poké Balls com Apricorns.
            </p>
          </div>

          {/* Sub-tabs Toggle */}
          <div className="flex flex-wrap bg-cobble-950/80 p-1.5 rounded-xl border border-cobble-700 self-stretch md:self-auto shadow-inner gap-1">
            <button
              onClick={() => {
                setActiveTab('evolutions');
                setSearch('');
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'evolutions'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
                  : 'text-cobble-300 hover:text-white hover:bg-cobble-800/50'
              }`}
            >
              Evoluções ({COBBLEMON_EVOLUTIONS.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('berries');
                setSearch('');
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'berries'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
                  : 'text-cobble-300 hover:text-white hover:bg-cobble-800/50'
              }`}
            >
              Bagas ({COBBLEMON_BERRIES.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('fossils');
                setSearch('');
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'fossils'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
                  : 'text-cobble-300 hover:text-white hover:bg-cobble-800/50'
              }`}
            >
              Fósseis ({COBBLEMON_FOSSILS.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('pokeballs');
                setSearch('');
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pokeballs'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
                  : 'text-cobble-300 hover:text-white hover:bg-cobble-800/50'
              }`}
            >
              Poké Balls ({COBBLEMON_POKEBALLS.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('natures');
                setSearch('');
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'natures'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20'
                  : 'text-cobble-300 hover:text-white hover:bg-cobble-800/50'
              }`}
            >
              Natures ({COBBLEMON_NATURES.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
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
                activeTab === 'evolutions'
                  ? 'Buscar Pokémon ou método (ex: Eevee, Thunder Stone, Amizade, Chuva...)'
                  : activeTab === 'berries'
                  ? 'Buscar baga ou efeito (ex: Sitrus, Paralisia, EV, Fogo, Lum...)'
                  : activeTab === 'fossils'
                  ? 'Buscar fóssil, Pokémon ou local (ex: Helix, Omanyte, Deepslate, Cascalho...)'
                  : activeTab === 'pokeballs'
                  ? 'Buscar Poké Ball, receita ou condição (ex: Ultra Ball, Apricorn, Noite, Água...)'
                  : 'Buscar Nature ou modificador (ex: Adamant, Modest, Jolly, Ataque, Velocidade...)'
              }
              className="w-full bg-cobble-950/80 border border-cobble-700 rounded-xl pl-12 pr-10 py-3 text-white placeholder-cobble-400 focus:outline-none focus:border-yellow-400 transition-colors shadow-inner text-sm"
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

          {/* Method Filter (Evolutions) */}
          {activeTab === 'evolutions' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <div className="relative flex-1 md:w-64">
                <select
                  value={evolutionMethodFilter}
                  onChange={(e) => setEvolutionMethodFilter(e.target.value as any)}
                  className="w-full appearance-none bg-cobble-950 border border-cobble-700 rounded-xl pl-3.5 pr-8 py-3 text-white font-medium focus:outline-none focus:border-yellow-400 cursor-pointer text-sm"
                >
                  <option value="all" className="bg-cobble-900 text-white py-1">Todos os Métodos</option>
                  <option value="pedra" className="bg-cobble-900 text-white py-1">Pedras Evolutivas</option>
                  <option value="amizade" className="bg-cobble-900 text-white py-1">Amizade / Felicidade</option>
                  <option value="troca" className="bg-cobble-900 text-white py-1">Troca ou Link Cable</option>
                  <option value="condicao" className="bg-cobble-900 text-white py-1">Condição Especial (Clima/Golpe)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cobble-400 text-xs">▼</div>
              </div>
            </div>
          )}

          {/* Category Filter (Berries) */}
          {activeTab === 'berries' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <div className="relative flex-1 md:w-64">
                <select
                  value={berryCategoryFilter}
                  onChange={(e) => setBerryCategoryFilter(e.target.value as any)}
                  className="w-full appearance-none bg-cobble-950 border border-cobble-700 rounded-xl pl-3.5 pr-8 py-3 text-white font-medium focus:outline-none focus:border-yellow-400 cursor-pointer text-sm"
                >
                  <option value="all" className="bg-cobble-900 text-white py-1">Todas as Categorias</option>
                  <option value="cura" className="bg-cobble-900 text-white py-1">Cura de Vida (HP)</option>
                  <option value="status" className="bg-cobble-900 text-white py-1">Cura de Problemas de Status</option>
                  <option value="ev" className="bg-cobble-900 text-white py-1">Redução de Pontos de EV</option>
                  <option value="resistencia" className="bg-cobble-900 text-white py-1">Resistência a Golpes Elementais</option>
                  <option value="utilidade" className="bg-cobble-900 text-white py-1">Restauração de PP / Utilidades</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cobble-400 text-xs">▼</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'evolutions' ? (
        /* ================= EVOLUTIONS TAB ================= */
        <div>
          {filteredEvolutions.length === 0 ? (
            <div className="bg-cobble-900/40 border border-cobble-800 rounded-2xl p-12 text-center text-cobble-400">
              <p className="text-lg font-bold">Nenhuma evolução encontrada para este filtro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvolutions.map((evo, idx) => (
                <div
                  key={idx}
                  className="bg-cobble-900/60 border border-cobble-700/80 hover:border-yellow-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Method Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cobble-950 border border-cobble-800 text-yellow-400">
                        {evo.methodTypeLabel}
                      </span>
                      <span className="text-xs font-mono font-semibold text-cobble-400">
                        Requisito: <strong className="text-white">{evo.requirement}</strong>
                      </span>
                    </div>

                    {/* Evolution Visual Pathway */}
                    <div className="flex items-center justify-between bg-cobble-950/70 p-3 rounded-xl border border-cobble-800 mb-3">
                      {/* From */}
                      <Link
                        to={`/pokemon/${evo.pokemonId}`}
                        className="flex flex-col items-center gap-1 group text-center"
                      >
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.pokemonId}.png`}
                          alt={evo.pokemonName}
                          className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                          loading="lazy"
                        />
                        <span className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">
                          {evo.pokemonName}
                        </span>
                        <span className="text-[10px] font-mono text-cobble-500">#{evo.pokemonId}</span>
                      </Link>

                      {/* Arrow */}
                      <div className="flex flex-col items-center px-2">
                        <ArrowRight className="w-5 h-5 text-yellow-400 animate-pulse" />
                      </div>

                      {/* To */}
                      <Link
                        to={`/pokemon/${evo.evolvesToId}`}
                        className="flex flex-col items-center gap-1 group text-center"
                      >
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.evolvesToId}.png`}
                          alt={evo.evolvesToName}
                          className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                          loading="lazy"
                        />
                        <span className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">
                          {evo.evolvesToName}
                        </span>
                        <span className="text-[10px] font-mono text-cobble-500">#{evo.evolvesToId}</span>
                      </Link>
                    </div>

                    {/* How to evolve instructions */}
                    <p className="text-xs text-cobble-300 leading-relaxed bg-cobble-900/50 p-2.5 rounded-lg border border-cobble-800/80">
                      {evo.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'berries' ? (
        /* ================= BERRIES TAB ================= */
        <div>
          {filteredBerries.length === 0 ? (
            <div className="bg-cobble-900/40 border border-cobble-800 rounded-2xl p-12 text-center text-cobble-400">
              <p className="text-lg font-bold">Nenhuma baga encontrada para este filtro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBerries.map((berry) => (
                <div
                  key={berry.id}
                  className="bg-cobble-900/60 border border-cobble-700/80 hover:border-yellow-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cobble-950 border border-cobble-800 text-yellow-400">
                        {berry.categoryLabel}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{berry.name}</h3>

                    {/* Effect Card */}
                    <div className="p-2.5 rounded-xl bg-cobble-950/80 border border-cobble-800 mb-3">
                      <p className="text-xs text-yellow-300 font-medium leading-relaxed">{berry.effect}</p>
                    </div>

                    {/* Growth info */}
                    <div className="space-y-1.5 text-xs text-cobble-400 mb-2">
                      <div className="flex items-center justify-between">
                        <span>Tempo de Crescimento:</span>
                        <span className="text-white font-mono text-[11px]">{berry.growthTime}</span>
                      </div>
                      {berry.mutationHint && (
                        <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[11px]">
                          <strong>Mutação / Cruzamento:</strong> {berry.mutationHint}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-cobble-400 italic">{berry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'fossils' ? (
        /* ================= FOSSILS TAB ================= */
        <div>
          {filteredFossils.length === 0 ? (
            <div className="bg-cobble-900/40 border border-cobble-800 rounded-2xl p-12 text-center text-cobble-400">
              <p className="text-lg font-bold">Nenhum fóssil encontrado para esta busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFossils.map((fossil) => (
                <div
                  key={fossil.id}
                  className="bg-cobble-900/60 border border-cobble-700/80 hover:border-yellow-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Fossil Name & Generation */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cobble-950 border border-cobble-800 text-yellow-400">
                        {fossil.generation}
                      </span>
                      <span className="text-xs text-cobble-400 font-medium">Fóssil Raro</span>
                    </div>

                    <h3 className="text-lg font-black text-white mb-3">{fossil.fossilName}</h3>

                    {/* Pokémon Revived Box */}
                    <div className="flex items-center justify-between bg-cobble-950/80 p-3 rounded-xl border border-cobble-800 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${fossil.pokemonId}.png`}
                          alt={fossil.pokemonName}
                          className="w-14 h-14 object-contain filter drop-shadow"
                          loading="lazy"
                        />
                        <div>
                          <span className="text-[10px] font-mono text-yellow-400 font-bold">#{fossil.pokemonId}</span>
                          <Link
                            to={`/pokemon/${fossil.pokemonId}`}
                            className="block text-sm font-bold text-white hover:text-yellow-400 transition-colors"
                          >
                            {fossil.pokemonName}
                          </Link>
                          <span className="text-[11px] text-cobble-400">Pokémon Revivido</span>
                        </div>
                      </div>

                      <Link
                        to={`/pokemon/${fossil.pokemonId}`}
                        className="px-3 py-1.5 rounded-lg bg-cobble-800 hover:bg-yellow-500 hover:text-yellow-950 text-xs font-bold text-cobble-200 border border-cobble-700 transition-colors"
                      >
                        Ver Detalhes →
                      </Link>
                    </div>

                    {/* Where to mine in Minecraft */}
                    <div className="space-y-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-cobble-950/60 border border-cobble-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-cobble-400 block mb-1">
                          Onde Encontrar / Minerar no Minecraft:
                        </span>
                        <p className="text-xs font-medium text-cobble-200 leading-relaxed">
                          {fossil.miningLocation}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-cobble-950/60 border border-cobble-800">
                        <span className="text-[10px] uppercase font-black tracking-wider text-yellow-400 block mb-1">
                          Máquina de Ressurreição:
                        </span>
                        <p className="text-xs text-white font-semibold">
                          {fossil.restorationMachine}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-cobble-400 italic">{fossil.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'pokeballs' ? (
        /* ================= POKÉ BALLS TAB ================= */
        <div>
          {filteredPokeBalls.length === 0 ? (
            <div className="bg-cobble-900/40 border border-cobble-800 rounded-2xl p-12 text-center text-cobble-400">
              <p className="text-lg font-bold">Nenhuma Poké Ball encontrada para esta busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPokeBalls.map((ball) => (
                <div
                  key={ball.id}
                  className="bg-cobble-900/60 border border-cobble-700/80 hover:border-yellow-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Name & Multiplier */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-black text-white">{ball.name}</h3>
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                        Taxa: {ball.catchRateMultiplier}
                      </span>
                    </div>

                    {/* Recipe Box */}
                    <div className="p-3 rounded-xl bg-cobble-950/80 border border-cobble-800 mb-3 space-y-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-cobble-400 block">
                          Receita de Apricorns (Topo da Bola):
                        </span>
                        <span className="text-xs font-bold text-white block mt-0.5">
                          {ball.apricornRecipe}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-cobble-800/80">
                        <span className="text-[10px] font-black uppercase tracking-wider text-cobble-400 block">
                          Base & Componentes:
                        </span>
                        <span className="text-xs text-cobble-300 block mt-0.5">
                          {ball.baseMaterial}
                        </span>
                      </div>
                    </div>

                    {/* Special Catch Condition */}
                    <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                        Condição / Bônus Especial de Captura:
                      </span>
                      <p className="text-xs text-cobble-200 font-medium leading-relaxed">
                        {ball.specialCondition}
                      </p>
                    </div>

                    <p className="text-xs text-cobble-400 italic">{ball.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= NATURES TAB ================= */
        <div>
          {filteredNatures.length === 0 ? (
            <div className="bg-cobble-900/40 border border-cobble-800 rounded-2xl p-12 text-center text-cobble-400">
              <p className="text-lg font-bold">Nenhuma Nature encontrada para esta busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNatures.map((nature) => (
                <div
                  key={nature.id}
                  className="bg-cobble-900/60 border border-cobble-700/80 hover:border-yellow-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Nature Name */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-black text-white">{nature.name}</h3>
                      {nature.increasedStat ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cobble-950 border border-cobble-800 text-yellow-400">
                          Modificadora
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cobble-950 border border-cobble-800 text-cobble-400">
                          Neutra
                        </span>
                      )}
                    </div>

                    {/* Stats Modifiers */}
                    <div className="space-y-1.5 mb-3">
                      {nature.increasedStat ? (
                        <>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
                            <span className="text-cobble-300 font-medium">Aumenta (+10%):</span>
                            <span className="font-black text-emerald-400">{nature.increasedStatLabel}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-xs">
                            <span className="text-cobble-300 font-medium">Diminui (-10%):</span>
                            <span className="font-black text-red-400">{nature.decreasedStatLabel}</span>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 rounded-lg bg-cobble-950/80 border border-cobble-800 text-xs text-center text-cobble-300 font-semibold">
                          Sem bônus ou penalidade (Atributos Balanceados)
                        </div>
                      )}
                    </div>

                    {/* Berry Flavor Preferences */}
                    <div className="p-2.5 rounded-xl bg-cobble-950/50 border border-cobble-800 text-xs space-y-1 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-cobble-400">Gosta de:</span>
                        <span className="font-semibold text-white">{nature.flavorLike}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-cobble-400">Não gosta:</span>
                        <span className="font-semibold text-cobble-400">{nature.flavorDislike}</span>
                      </div>
                    </div>

                    <p className="text-xs text-cobble-400 italic">{nature.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
