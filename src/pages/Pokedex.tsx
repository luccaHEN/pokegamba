import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PokemonCard } from '../components/pokemon/PokemonCard';
import { Input } from '../components/ui/Input';
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

export default function Pokedex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allNames, setAllNames] = useState<PokemonListItem[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Load all names once for smart search
  useEffect(() => {
    pokeApi.getAllPokemonList().then(res => setAllNames(res.results)).catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function loadPokemon() {
      setLoading(true);
      try {
        const term = searchTerm.toLowerCase().trim();
        
        if (term.length > 0) {
          // Smart Search
          // 1. Try exact start or includes, or exact ID match
          let matches = allNames.filter(p => {
            const idMatch = p.url.split('/').filter(Boolean).pop();
            return p.name.startsWith(term) || p.name.includes(term) || idMatch === term;
          });

          // Prioritize pokemon that start with the letter/term
          matches.sort((a, b) => {
            const aStarts = a.name.startsWith(term);
            const bStarts = b.name.startsWith(term);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0; // Keep original ID order if both match the same way
          });
          
          // 2. If nothing found and term is at least 3 chars, try fuzzy search (typos)
          if (matches.length === 0 && term.length >= 3) {
            matches = allNames
              .map(p => ({ ...p, dist: levenshtein(p.name, term) }))
              .filter(p => p.dist <= 2) // Allow up to 2 typos
              .sort((a, b) => a.dist - b.dist);
          }
          
          const toFetch = matches.slice(0, limit);
          
          if (toFetch.length > 0) {
            const detailsPromises = toFetch.map(p => pokeApi.getPokemon(p.name));
            const details = await Promise.all(detailsPromises);
            if (isMounted) setPokemonList(details);
          } else {
            if (isMounted) setPokemonList([]);
          }
        } else {
          // Normal Pagination
          const listData = await pokeApi.getPokemonList(limit, page * limit);
          const detailsPromises = listData.results.map((p) => pokeApi.getPokemon(p.name));
          const details = await Promise.all(detailsPromises);
          if (isMounted) setPokemonList(details);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadPokemon();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [page, searchTerm, allNames]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-cobble-800 p-6 rounded-xl border border-cobble-700">
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">Pokédex</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cobble-400" />
            <Input 
              placeholder="Pesquisar Pokémon por nome ou ID exato..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-cobble-800 animate-pulse border border-cobble-700" />
          ))}
        </div>
      ) : pokemonList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-cobble-300 text-lg">Nenhum Pokémon encontrado.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pokemonList.map(p => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>

          {!searchTerm && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button 
                variant="secondary" 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
              </Button>
              <span className="text-cobble-300 font-medium">Página {page + 1}</span>
              <Button 
                variant="secondary" 
                onClick={() => setPage(p => p + 1)}
              >
                Próxima <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
