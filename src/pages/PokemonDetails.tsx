import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Ruler, Weight, Shield, Sword, Heart, Zap, ArrowUp, Sparkles, ShieldAlert, ZapOff } from 'lucide-react';
import { pokeApi } from '../services/pokeapi';
import type { Pokemon, PokemonSpecies } from '../types/pokemon';
import { PokemonTypeBadge } from '../components/pokemon/PokemonTypeBadge';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

export default function PokemonDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<Pokemon[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [resistances, setResistances] = useState<string[]>([]);
  const [immunities, setImmunities] = useState<string[]>([]);
  
  const [isShiny, setIsShiny] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const p = await pokeApi.getPokemon(id);
        const s = await pokeApi.getPokemonSpecies(id);
        setPokemon(p);
        setSpecies(s);

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

        // Calculate Type Matchups
        const typePromises = p.types.map(t => pokeApi.getPokemonByType(t.type.name));
        const typeDataList = await Promise.all(typePromises);
        
        const multipliers: Record<string, number> = {};
        
        // Initialize all types to 1x
        typeDataList[0].damage_relations.double_damage_from.forEach((t: any) => multipliers[t.name] = 1);
        
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

  const currentSprite = isShiny 
    ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny)
    : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-cobble-300 hover:text-white">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </Button>

      <div className="bg-cobble-800 rounded-[2rem] border-2 border-cobble-700 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Image Header with Shiny Toggle */}
        <div className="relative h-72 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cobble-700 via-cobble-800 to-cobble-900 flex items-center justify-center">
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
              <h1 className="text-5xl font-black capitalize mb-4 text-white drop-shadow-sm">{pokemon.name}</h1>
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

          <p className="text-xl text-cobble-200 italic border-l-4 border-blue-500 pl-6 py-2 font-medium bg-gradient-to-r from-blue-500/10 to-transparent rounded-r-xl">
            "{description}"
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Stats */}
            <div>
              <h3 className="text-2xl font-black mb-6 flex items-center text-white">
                Stats Base
              </h3>
              <div className="space-y-5">
                {pokemon.stats.map(s => {
                  const Icon = statIcons[s.stat.name] || Heart;
                  const color = statColors[s.stat.name] || 'bg-blue-500';
                  const percentage = Math.min(100, (s.base_stat / 255) * 100);
                  
                  return (
                    <div key={s.stat.name}>
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="flex items-center text-cobble-300 capitalize font-bold">
                          <Icon className="w-4 h-4 mr-2" /> {s.stat.name.replace('-', ' ')}
                        </span>
                        <span className="font-black text-white">{s.base_stat}</span>
                      </div>
                      <div className="h-3 w-full bg-cobble-900 rounded-full overflow-hidden border border-cobble-800 shadow-inner">
                        <div 
                          className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`} 
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

          {/* Evolution Chain */}
          {evolutionChain.length > 1 && (
            <div className="pt-8 border-t border-cobble-700">
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
                          src={evo.sprites.other['official-artwork'].front_default || evo.sprites.front_default} 
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
    </div>
  );
}
