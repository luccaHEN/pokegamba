export interface RegionalFormGuide {
  formId: string;
  name: string;
  region: 'Hisui' | 'Alola' | 'Galar' | 'Paldea' | 'Mega' | 'Gigantamax' | 'Outro';
  obtainMethod: string;
  evolutionOrSpawn: 'evolucao' | 'spawn' | 'item' | 'evento';
  cobblemonDetails: string;
}

export const REGIONAL_OBTAIN_GUIDE: Record<string, RegionalFormGuide> = {
  // --- HISUI ---
  'arcanine-hisui': {
    formId: 'arcanine-hisui',
    name: 'Arcanine de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Growlithe de Hisui usando uma Fire Stone.',
    cobblemonDetails: 'Obtenha um Growlithe Hisuian (capturado em montanhas/encostas com datapacks ou através de ovos) e use uma Fire Stone nele para evoluir diretamente.'
  },
  'growlithe-hisui': {
    formId: 'growlithe-hisui',
    name: 'Growlithe de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em biomas rochosos, montanhosos ou vulcânicos.',
    cobblemonDetails: 'Em servidores com Cobblemon e suporte a Hisui, aparece em encostas de montanhas, badlands ou cavernas rochosas quentes.'
  },
  'zorua-hisui': {
    formId: 'zorua-hisui',
    name: 'Zorua de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em biomas congelados e taigas nevadas durante a noite.',
    cobblemonDetails: 'Aparece à noite em biomas glaciais, planícies nevadas ou florestas de pinheiro cobertas de neve.'
  },
  'zoroark-hisui': {
    formId: 'zoroark-hisui',
    name: 'Zoroark de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Zorua de Hisui ao atingir o Nível 30.',
    cobblemonDetails: 'Pode ser obtido naturalmente ao treinar o Hisuian Zorua até o Lv. 30.'
  },
  'braviary-hisui': {
    formId: 'braviary-hisui',
    name: 'Braviary de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Rufflet no Nível 54 em biomas de montanha nevada.',
    cobblemonDetails: 'No Cobblemon, evolua o Rufflet no Lv. 54 estando em biomas frios ou picos nevados (Jagged Peaks / Frozen Peaks).'
  },
  'sliggoo-hisui': {
    formId: 'sliggoo-hisui',
    name: 'Sliggoo de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Goomy no Nível 40 em biomas com chuva ou neblina.',
    cobblemonDetails: 'Ao atingir o Lv. 40 em áreas com ferro ou durante o clima chuvoso com aspecto hisuiano.'
  },
  'goodra-hisui': {
    formId: 'goodra-hisui',
    name: 'Goodra de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua o Hisuian Sliggoo no Nível 50 ou superior durante Chuva ou Nevasca.',
    cobblemonDetails: 'Deve estar no nível 50+ sob tempestade ou chuva torrencial no Minecraft.'
  },
  'avalugg-hisui': {
    formId: 'avalugg-hisui',
    name: 'Avalugg de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Bergmite no Nível 37.',
    cobblemonDetails: 'Evolui no Lv. 37 quando exposto a aspectos minerais e gelo de montanhas altas.'
  },
  'decidueye-hisui': {
    formId: 'decidueye-hisui',
    name: 'Decidueye de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Dartrix no Nível 36.',
    cobblemonDetails: 'Evolução variante do Dartrix disponível no Cobblemon em biomas de taiga e montanhas.'
  },
  'typhlosion-hisui': {
    formId: 'typhlosion-hisui',
    name: 'Typhlosion de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Quilava no Nível 36 durante a Noite.',
    cobblemonDetails: 'Suba para o nível 36 com Quilava durante a noite no Minecraft.'
  },
  'samurott-hisui': {
    formId: 'samurott-hisui',
    name: 'Samurott de Hisui',
    region: 'Hisui',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Dewott no Nível 36 durante a Noite.',
    cobblemonDetails: 'Evolua o Dewott durante a noite no Minecraft.'
  },

  // --- ALOLA ---
  'raichu-alola': {
    formId: 'raichu-alola',
    name: 'Raichu de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Use uma Thunder Stone no Pikachu em biomas de Praia (Beach) ou Ilha Tropical.',
    cobblemonDetails: 'No Cobblemon oficial, basta levar um Pikachu comum para uma Praia do Minecraft ou Ilha Tropical e usar uma Thunder Stone nele.'
  },
  'marowak-alola': {
    formId: 'marowak-alola',
    name: 'Marowak de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Cubone no Nível 28 durante a Noite em biomas quentes ou praia.',
    cobblemonDetails: 'Suba o Cubone para o Lv. 28 durante a noite em biomas como Deserto, Savana ou Praia.'
  },
  'meowth-alola': {
    formId: 'meowth-alola',
    name: 'Meowth de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna naturalmente no Overworld (Planícies, Florestas e Vilas).',
    cobblemonDetails: 'Spawna no Minecraft em biomas temperados abertos e nas imediações de vilas.'
  },
  'persian-alola': {
    formId: 'persian-alola',
    name: 'Persian de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua o Alolan Meowth com Amizade Alta (≥ 160).',
    cobblemonDetails: 'Caminhe, batalhe e dê bagas ao Meowth de Alola até atingir amizade alta, depois suba 1 nível.'
  },
  'vulpix-alola': {
    formId: 'vulpix-alola',
    name: 'Vulpix de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em biomas nevados, planícies congeladas e picos gelados.',
    cobblemonDetails: 'Encontrado no Minecraft em Snowy Plains, Snowy Slopes e Frozen Peaks.'
  },
  'ninetales-alola': {
    formId: 'ninetales-alola',
    name: 'Ninetales de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Use uma Ice Stone no Alolan Vulpix.',
    cobblemonDetails: 'Aplique uma Ice Stone diretamente no Vulpix de Alola.'
  },
  'sandshrew-alola': {
    formId: 'sandshrew-alola',
    name: 'Sandshrew de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em biomas nevados e cavernas glaciais.',
    cobblemonDetails: 'Spawna no subsolo frio e encostas nevadas do Minecraft.'
  },
  'sandslash-alola': {
    formId: 'sandslash-alola',
    name: 'Sandslash de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Use uma Ice Stone no Alolan Sandshrew.',
    cobblemonDetails: 'Aplique uma Ice Stone diretamente no Sandshrew de Alola.'
  },
  'geodude-alola': {
    formId: 'geodude-alola',
    name: 'Geodude de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em cavernas montanhosas e biomas com minério de ferro e cobre.',
    cobblemonDetails: 'Spawna em cavernas e montanhas com alta presença mineral.'
  },
  'graveler-alola': {
    formId: 'graveler-alola',
    name: 'Graveler de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua o Alolan Geodude no Nível 25.',
    cobblemonDetails: 'Evolução natural por nível.'
  },
  'golem-alola': {
    formId: 'golem-alola',
    name: 'Golem de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Troca com outro jogador ou use um Link Cable no Alolan Graveler.',
    cobblemonDetails: 'No Cobblemon, utilize o item Link Cable no Alolan Graveler.'
  },
  'grimer-alola': {
    formId: 'grimer-alola',
    name: 'Grimer de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em pântanos, manguezais e áreas costeiras poluídas.',
    cobblemonDetails: 'Spawna em Swamp e Mangrove Swamp do Minecraft.'
  },
  'muk-alola': {
    formId: 'muk-alola',
    name: 'Muk de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua o Alolan Grimer no Nível 38.',
    cobblemonDetails: 'Evolução por nível.'
  },
  'exeggutor-alola': {
    formId: 'exeggutor-alola',
    name: 'Exeggutor de Alola',
    region: 'Alola',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Use uma Leaf Stone em um Exeggcute em biomas de Praia ou Ilha Tropical.',
    cobblemonDetails: 'Leve um Exeggcute para uma praia ou selva costeira e use uma Leaf Stone.'
  },

  // --- GALAR ---
  'meowth-galar': {
    formId: 'meowth-galar',
    name: 'Meowth de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em Taigas Frias e biomas congelados do Minecraft.',
    cobblemonDetails: 'Spawna naturalmente em #cobblemon:is_freezing e #cobblemon:is_taiga.'
  },
  'perrserker': {
    formId: 'perrserker',
    name: 'Perrserker',
    region: 'Galar',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Galarian Meowth no Nível 28.',
    cobblemonDetails: 'Evolução natural no Lv. 28.'
  },
  'ponyta-galar': {
    formId: 'ponyta-galar',
    name: 'Ponyta de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em Florestas Místicas, Bosque de Cerejeiras (Cherry Grove) e Dark Forest.',
    cobblemonDetails: 'Aparece em florestas densas e bosques mágicos de flores cor-de-rosa.'
  },
  'rapidash-galar': {
    formId: 'rapidash-galar',
    name: 'Rapidash de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua a Galarian Ponyta no Nível 40.',
    cobblemonDetails: 'Evolui no Lv. 40.'
  },
  'slowpoke-galar': {
    formId: 'slowpoke-galar',
    name: 'Slowpoke de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em praias tropicais e lagoas calmas.',
    cobblemonDetails: 'Spawna na areia litorânea e margens de rios.'
  },
  'slowbro-galar': {
    formId: 'slowbro-galar',
    name: 'Slowbro de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'item',
    obtainMethod: 'Use o item Galarica Cuff no Galarian Slowpoke.',
    cobblemonDetails: 'Fabricado com Galarian Twigs ou obtido em baús de estrutura.'
  },
  'slowking-galar': {
    formId: 'slowking-galar',
    name: 'Slowking de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'item',
    obtainMethod: 'Use o item Galarica Wreath no Galarian Slowpoke.',
    cobblemonDetails: 'Fabricado com Galarian Twigs ou encontrado em templos antigos.'
  },
  'corsola-galar': {
    formId: 'corsola-galar',
    name: 'Corsola de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em oceanos frios profundos e fossas abissais.',
    cobblemonDetails: 'Spawna em Deep Ocean frio no Minecraft.'
  },
  'cursola': {
    formId: 'cursola',
    name: 'Cursola',
    region: 'Galar',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua a Galarian Corsola no Nível 38.',
    cobblemonDetails: 'Evolução por nível.'
  },
  'zigzagoon-galar': {
    formId: 'zigzagoon-galar',
    name: 'Zigzagoon de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em Planícies e Florestas abertas durante a noite.',
    cobblemonDetails: 'Comum durante a noite no Overworld.'
  },
  'linoone-galar': {
    formId: 'linoone-galar',
    name: 'Linoone de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua o Galarian Zigzagoon no Nível 20.',
    cobblemonDetails: 'Evolução por nível.'
  },
  'obstagoon': {
    formId: 'obstagoon',
    name: 'Obstagoon',
    region: 'Galar',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua o Galarian Linoone no Nível 35 Durante a Noite.',
    cobblemonDetails: 'Deve atingir o Lv. 35 enquanto for de noite no Minecraft.'
  },
  'darumaka-galar': {
    formId: 'darumaka-galar',
    name: 'Darumaka de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em biomas de gelo, neve e montanhas congeladas.',
    cobblemonDetails: 'Spawna em Snowy Plains e Jagged Peaks.'
  },
  'darmanitan-galar': {
    formId: 'darmanitan-galar',
    name: 'Darmanitan de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Use uma Ice Stone no Galarian Darumaka.',
    cobblemonDetails: 'Aplique uma Ice Stone diretamente no Darumaka de Galar.'
  },
  'weezing-galar': {
    formId: 'weezing-galar',
    name: 'Weezing de Galar',
    region: 'Galar',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua um Koffing no Nível 35 em biomas de Pântano, Floresta ou Cidades.',
    cobblemonDetails: 'Evolui no Lv. 35.'
  },

  // --- PALDEA ---
  'tauros-paldea': {
    formId: 'tauros-paldea',
    name: 'Tauros de Paldea',
    region: 'Paldea',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em Savanas e Planícies quentes em manadas.',
    cobblemonDetails: 'Spawna em bandos nas planícies abertas do Minecraft.'
  },
  'wooper-paldea': {
    formId: 'wooper-paldea',
    name: 'Wooper de Paldea',
    region: 'Paldea',
    evolutionOrSpawn: 'spawn',
    obtainMethod: 'Spawna em Pântanos, Manguezais e lamaçais.',
    cobblemonDetails: 'Spawna em águas rasas de pântanos.'
  },
  'clodsire': {
    formId: 'clodsire',
    name: 'Clodsire',
    region: 'Paldea',
    evolutionOrSpawn: 'evolucao',
    obtainMethod: 'Evolua o Paldean Wooper no Nível 20.',
    cobblemonDetails: 'Evolução natural no Lv. 20.'
  }
};
