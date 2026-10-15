export interface PokeBallData {
  id: string;
  name: string;
  catchRateMultiplier: string;
  apricornRecipe: string;
  baseMaterial: string;
  specialCondition: string;
  description: string;
}

export const COBBLEMON_POKEBALLS: PokeBallData[] = [
  {
    id: 'poke-ball',
    name: 'Poké Ball',
    catchRateMultiplier: '1x',
    apricornRecipe: '3 Apricorns Vermelhos',
    baseMaterial: 'Base de Ferro ou Cobre + Botão de Pedra',
    specialCondition: 'Nenhuma condição especial.',
    description: 'A cápsula de captura padrão para iniciar qualquer jornada Pokémon.'
  },
  {
    id: 'great-ball',
    name: 'Great Ball',
    catchRateMultiplier: '1.5x',
    apricornRecipe: '2 Apricorns Azuis + 1 Apricorn Vermelho',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: 'Multiplicador constante de 1.5x em todas as situações.',
    description: 'Oferece taxa de captura superior à Poké Ball comum com cápsula azul e vermelha.'
  },
  {
    id: 'ultra-ball',
    name: 'Ultra Ball',
    catchRateMultiplier: '2x',
    apricornRecipe: '2 Apricorns Pretos + 1 Apricorn Amarelo',
    baseMaterial: 'Base de Ouro ou Ferro + Botão de Pedra',
    specialCondition: 'Multiplicador alto constante de 2x.',
    description: 'Uma das melhores bolas padrão para capturar Pokémon fortes e de nível elevado.'
  },
  {
    id: 'master-ball',
    name: 'Master Ball',
    catchRateMultiplier: 'Garantido (100% / Infinito)',
    apricornRecipe: 'Não pode ser craftada com Apricorns',
    baseMaterial: 'Drop raro de chefes lendários ou baús do The End / Cidades Antigas',
    specialCondition: 'Captura qualquer Pokémon selvagem instantaneamente sem chance de falha.',
    description: 'A esfera de captura suprema de tecnologia lendária e desempenho infalível.'
  },
  {
    id: 'net-ball',
    name: 'Net Ball',
    catchRateMultiplier: '3.5x (Água / Inseto) ou 1x',
    apricornRecipe: '2 Apricorns Pretos + 1 Apricorn Azul',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: '3.5x contra Pokémon do tipo Água (Water) ou Inseto (Bug).',
    description: 'Projetada com malha de contenção ideal para pesca, lagos e criaturas da floresta.'
  },
  {
    id: 'dusk-ball',
    name: 'Dusk Ball',
    catchRateMultiplier: '3x (Noite / Cavernas) ou 1x',
    apricornRecipe: '2 Apricorns Verdes + 1 Apricorn Preto',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: '3x durante a Noite no Minecraft ou em Cavernas sem luz solar.',
    description: 'A bola favorita para mineradores e exploradores de cavernas profundas.'
  },
  {
    id: 'dive-ball',
    name: 'Dive Ball',
    catchRateMultiplier: '3.5x (Submerso) ou 1x',
    apricornRecipe: '2 Apricorns Azuis + 1 Apricorn Rosa',
    baseMaterial: 'Base de Cobre ou Ferro + Botão de Pedra',
    specialCondition: '3.5x quando o Pokémon selvagem ou o jogador estão debaixo d\'água.',
    description: 'Excelente para capturar Pokémon nos oceanos e fossas marinhas do Minecraft.'
  },
  {
    id: 'quick-ball',
    name: 'Quick Ball',
    catchRateMultiplier: '5x (Primeiro Turno) ou 1x',
    apricornRecipe: '2 Apricorns Amarelos + 1 Apricorn Azul',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: '5x se utilizada imediatamente no primeiro turno do encontro.',
    description: 'Arremesso rápido com a maior taxa de sucesso inicial do jogo.'
  },
  {
    id: 'timer-ball',
    name: 'Timer Ball',
    catchRateMultiplier: '1x a 4x (Aumenta a cada turno)',
    apricornRecipe: '1 Apricorn Vermelho + 1 Apricorn Preto + 1 Apricorn Branco',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: 'Começa em 1x e sobe +0.3x por turno, atingindo o máximo de 4x após 10 turnos.',
    description: 'A melhor escolha para batalhas prolongadas e combates desgastantes.'
  },
  {
    id: 'heavy-ball',
    name: 'Heavy Ball',
    catchRateMultiplier: 'Bônus proporcional ao Peso (+20 a +30)',
    apricornRecipe: '2 Apricorns Azuis + 1 Apricorn Preto',
    baseMaterial: 'Base de Ferro Pesada + Botão de Pedra',
    specialCondition: 'Bônus massivo contra Pokémon muito pesados (ex: Snorlax, Steelix, Wailord, Groudon).',
    description: 'Forjada para suportar o impacto de Pokémon de massa colossal.'
  },
  {
    id: 'fast-ball',
    name: 'Fast Ball',
    catchRateMultiplier: '4x (Velozes) ou 1x',
    apricornRecipe: '2 Apricorns Vermelhos + 1 Apricorn Amarelo',
    baseMaterial: 'Base de Cobre ou Ferro + Botão de Pedra',
    specialCondition: '4x contra Pokémon com Velocidade Base ≥ 100 ou com tendência a fugir.',
    description: 'Desenvolvida especialmente para capturar Pokémon velozes antes que fujam.'
  },
  {
    id: 'luxury-ball',
    name: 'Luxury Ball',
    catchRateMultiplier: '1x (Dobra ganho de Felicidade)',
    apricornRecipe: '1 Apricorn Preto + 1 Apricorn Vermelho + 1 Apricorn Branco',
    baseMaterial: 'Base de Ouro + Botão de Pedra',
    specialCondition: 'O Pokémon capturado ganha amizade e felicidade o dobro mais rápido.',
    description: 'Cápsula luxuosa e confortável que acelera evoluções por amizade (ex: Eevee, Riolu, Pichu).'
  },
  {
    id: 'repeat-ball',
    name: 'Repeat Ball',
    catchRateMultiplier: '3.5x (Se já registrado) ou 1x',
    apricornRecipe: '2 Apricorns Vermelhos + 1 Apricorn Preto',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: '3.5x se você já capturou ou registrou essa espécie na Pokédex anteriormente.',
    description: 'Perfeita para caçar cópias de Pokémon para selecionar melhores IVs ou natures.'
  },
  {
    id: 'moon-ball',
    name: 'Moon Ball',
    catchRateMultiplier: '4x (Evoluem por Moon Stone) ou 1x',
    apricornRecipe: '2 Apricorns Azuis + 1 Apricorn Amarelo',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: '4x contra espécies que evoluem com Moon Stone (Clefairy, Jigglypuff, Nidorino, Skitty).',
    description: 'Decorada com o símbolo da lua crescente em tons escuros.'
  },
  {
    id: 'love-ball',
    name: 'Love Ball',
    catchRateMultiplier: '8x (Mesma Espécie + Sexo Oposto) ou 1x',
    apricornRecipe: '3 Apricorns Rosa',
    baseMaterial: 'Base de Ferro + Botão de Pedra',
    specialCondition: '8x se o Pokémon adversário for da mesma espécie e sexo oposto ao seu Pokémon ativo.',
    description: 'A maior taxa de captura condicional do jogo quando há atração entre os parceiros.'
  },
  {
    id: 'beast-ball',
    name: 'Beast Ball',
    catchRateMultiplier: '5x (Ultra Beasts) ou 0.1x (Comuns)',
    apricornRecipe: 'Tecnologia do Ultra Espaço / Recompensa Rara',
    baseMaterial: 'Placas dimensionais e circuito alienígena',
    specialCondition: 'Multiplicador de 5x contra Ultra Beasts. Penalidade severa (0.1x) contra Pokémon normais.',
    description: 'Esfera especial desenvolvida especificamente para conter a energia das Ultra Beasts.'
  }
];
