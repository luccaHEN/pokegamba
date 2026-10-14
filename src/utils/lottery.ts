import { pokeApi } from '../services/pokeapi';
import type { Pokemon } from '../types/pokemon';

export interface LotteryFilters {
  type1?: string;
  type2?: string;
  generation?: number;
  allowLegendary?: boolean;
  allowMythical?: boolean;
  rarity?: 'all' | 'normal' | 'legendary' | 'mythical';
  evolution?: 'all' | 'base' | 'evolved' | '1' | '2' | '3';
  uniqueTypes?: boolean;
}

export const LEGENDARY_IDS = [
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 
  480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646,
  716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898
];

export const MYTHICAL_IDS = [
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893
];

export async function drawPokemon(
  filters: LotteryFilters, 
  allowLegendary: boolean, 
  allowMythical: boolean,
  excludeIds: number[] = [],
  excludeTypes: string[] = []
): Promise<Pokemon> {
  let possibleIds: number[] = [];

  try {
    let type1Ids: number[] | null = null;
    let type2Ids: number[] | null = null;
    let genIds: number[] | null = null;

    if (filters.type1 && filters.type1 !== 'all') {
      const typeData = await pokeApi.get<any>(`/type/${filters.type1}`);
      type1Ids = typeData.pokemon.map((p: any) => {
        const urlParts = p.pokemon.url.split('/');
        return parseInt(urlParts[urlParts.length - 2], 10);
      });
    }

    if (filters.type2 && filters.type2 !== 'all' && filters.type2 !== 'none') {
      const typeData = await pokeApi.get<any>(`/type/${filters.type2}`);
      type2Ids = typeData.pokemon.map((p: any) => {
        const urlParts = p.pokemon.url.split('/');
        return parseInt(urlParts[urlParts.length - 2], 10);
      });
    }

    if (filters.generation && filters.generation > 0) {
      const genData = await pokeApi.get<any>(`/generation/${filters.generation}`);
      genIds = genData.pokemon_species.map((s: any) => {
        const urlParts = s.url.split('/');
        return parseInt(urlParts[urlParts.length - 2], 10);
      });
    }

    // Start with all if nothing is filtered
    if (!type1Ids && !type2Ids && !genIds) {
      possibleIds = Array.from({ length: 1025 }, (_, i) => i + 1);
    } else {
      let intersection: number[] | null = null;
      const arraysToIntersect = [type1Ids, type2Ids, genIds].filter(arr => arr !== null) as number[][];
      
      if (arraysToIntersect.length > 0) {
        intersection = arraysToIntersect[0];
        for (let i = 1; i < arraysToIntersect.length; i++) {
          intersection = intersection.filter(id => arraysToIntersect[i].includes(id));
        }
      }

      possibleIds = intersection || [];
    }

    // Apply rarity hardcoded filters to dramatically reduce unnecessary API calls
    if (filters.rarity === 'legendary') {
      possibleIds = possibleIds.filter(id => LEGENDARY_IDS.includes(id));
    } else if (filters.rarity === 'mythical') {
      possibleIds = possibleIds.filter(id => MYTHICAL_IDS.includes(id));
    } else if (filters.rarity === 'normal') {
      possibleIds = possibleIds.filter(id => !LEGENDARY_IDS.includes(id) && !MYTHICAL_IDS.includes(id));
    }

    // Filter out mega evolutions, g-max, and special forms (IDs > 10000), and already drawn IDs
    possibleIds = possibleIds.filter(id => id <= 10000 && !excludeIds.includes(id));

    // Filter out types already drawn, but preserve any type explicitly requested in filter
    const effectiveExcludeTypes = excludeTypes.filter(
      t => t !== filters.type1 && (filters.type2 === 'none' || t !== filters.type2)
    );

    // Increase attempts since we might need to filter unique types and evolution stages via API
    for (let attempts = 0; attempts < 60; attempts++) {
      if (possibleIds.length === 0) throw new Error("Nenhum Pokémon encontrado com esses filtros.");
      
      const randomIndex = Math.floor(Math.random() * possibleIds.length);
      const chosenId = possibleIds[randomIndex];
      
      const pokemon = await pokeApi.getPokemon(chosenId);
      
      // If user wants ONLY one type
      if (filters.type2 === 'none' && pokemon.types.length > 1) {
        possibleIds.splice(randomIndex, 1);
        continue;
      }

      if (effectiveExcludeTypes.length > 0) {
        const hasExcludedType = pokemon.types.some((t: any) => effectiveExcludeTypes.includes(t.type.name));
        if (hasExcludedType) {
          possibleIds.splice(randomIndex, 1);
          continue;
        }
      }

      const species = await pokeApi.getPokemonSpecies(chosenId);

      // If we need to check legendary status from general allow rules (if rarity is 'all')
      if (filters.rarity === 'all' || !filters.rarity) {
        if (!allowLegendary && species.is_legendary) {
          possibleIds.splice(randomIndex, 1);
          continue;
        }
        if (!allowMythical && species.is_mythical) {
          possibleIds.splice(randomIndex, 1);
          continue;
        }
      }

      // Evolution check
      if (filters.evolution === 'base' || filters.evolution === '1') {
        if (species.evolves_from_species !== null) {
          possibleIds.splice(randomIndex, 1);
          continue;
        }
      } else if (filters.evolution === 'evolved') {
        if (species.evolves_from_species === null) {
          possibleIds.splice(randomIndex, 1);
          continue;
        }
      } else if (filters.evolution === '2' || filters.evolution === '3') {
        if (species.evolves_from_species === null) {
          possibleIds.splice(randomIndex, 1);
          continue;
        }
        
        try {
          const parentUrlParts = species.evolves_from_species.url.split('/');
          const parentId = parseInt(parentUrlParts[parentUrlParts.length - 2], 10);
          const parentSpecies = await pokeApi.getPokemonSpecies(parentId);
          const isStage2 = parentSpecies.evolves_from_species === null;
          
          if (filters.evolution === '2' && !isStage2) {
            possibleIds.splice(randomIndex, 1);
            continue;
          }
          if (filters.evolution === '3' && isStage2) {
            possibleIds.splice(randomIndex, 1);
            continue;
          }
        } catch (err) {
          // If we fail to fetch parent, skip this pokemon just to be safe
          possibleIds.splice(randomIndex, 1);
          continue;
        }
      }
      
      return pokemon;
    }
    
    throw new Error("Não foi possível encontrar um Pokémon que atenda às regras em tempo hábil.");

  } catch (error) {
    console.error("Lottery draw failed:", error);
    throw error;
  }
}
