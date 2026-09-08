import re

def main():
    with open('src/pages/Lottery.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find where the return statement starts
    return_index = content.find('  return (')
    
    pre_return = content[:return_index]

    new_jsx = """  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-300 relative">
      {/* Custom Error Modal */}
      <AnimatePresence>
        {errorMsg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-cobble-800 border-4 border-red-600 rounded-none p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-black text-red-400 mb-2 drop-shadow-md">
                  Ops! Algo deu errado
                </h3>
                <p className="text-cobble-200 text-lg mb-8 font-medium">
                  {errorMsg}
                </p>
                
                <Button 
                  onClick={() => setErrorMsg(null)} 
                  variant="danger"
                  className="w-full text-lg py-4 shadow-lg transition-all"
                >
                  Tentar Outra Combinação
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: Filters (Config Panel) */}
        <div className="xl:col-span-3 bg-cobble-800 border-4 border-cobble-700 p-4 shadow-xl flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4 border-b-4 border-cobble-700 pb-2">
            <h2 className="text-xl font-black text-white flex items-center">
              <Settings2 className="w-5 h-5 mr-2 text-blue-400" /> Configurar Sorteio
            </h2>
          </div>
          
          <div className="space-y-4 flex-1">
            
            {/* Quantity */}
            <div className="bg-cobble-900/50 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-cobble-400 mb-2 flex items-center tracking-widest"><Dices className="w-4 h-4 mr-2 text-cobble-500" /> Quantidade</h3>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white focus:border-blue-500 outline-none font-bold shadow-inner cursor-pointer appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Pokémon{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Type 1 */}
            <div className="bg-cobble-900/50 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-cobble-400 mb-2 flex items-center tracking-widest"><Filter className="w-4 h-4 mr-2 text-cobble-500" /> Tipo 1</h3>
              <select
                value={filters.type1}
                onChange={(e) => updateFilter('type1', e.target.value)}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white focus:border-blue-500 outline-none capitalize font-bold shadow-inner cursor-pointer appearance-none"
              >
                {TYPES.map(t => (
                  <option key={t} value={t} disabled={t !== 'all' && filters.type2 === t}>{t === 'all' ? 'Qualquer' : t}</option>
                ))}
              </select>
            </div>

            {/* Type 2 */}
            <div className="bg-cobble-900/50 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-cobble-400 mb-2 flex items-center tracking-widest"><Filter className="w-4 h-4 mr-2 text-cobble-500" /> Tipo 2</h3>
              <select
                value={filters.type2}
                onChange={(e) => updateFilter('type2', e.target.value)}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white focus:border-blue-500 outline-none capitalize font-bold shadow-inner cursor-pointer appearance-none"
              >
                <option value="all">Qualquer</option>
                <option value="none" className="text-red-400 font-bold">Nenhum (Único)</option>
                {TYPES.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t} disabled={filters.type1 === t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Gen */}
            <div className="bg-cobble-900/50 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-cobble-400 mb-2 flex items-center tracking-widest"><Filter className="w-4 h-4 mr-2 text-cobble-500" /> Geração</h3>
              <select
                value={filters.generation}
                onChange={(e) => updateFilter('generation', parseInt(e.target.value))}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white focus:border-blue-500 outline-none font-bold shadow-inner cursor-pointer appearance-none"
              >
                {GENS.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Rarity */}
            <div className="bg-cobble-900/50 p-3 border-2 border-cobble-700 group">
              <h3 className="font-bold text-xs text-cobble-400 mb-2 flex items-center tracking-widest"><Sparkles className="w-4 h-4 mr-2 text-purple-500/50" /> Raridade</h3>
              <select
                value={filters.rarity || 'all'}
                onChange={(e) => updateFilter('rarity', e.target.value)}
                className="w-full bg-cobble-800 border-2 border-cobble-700 p-2 text-white focus:border-purple-500 outline-none font-bold shadow-inner cursor-pointer appearance-none"
              >
                <option value="all">Misto</option>
                <option value="normal">Comuns</option>
                <option value="legendary" className="text-purple-400 font-bold">Lendários</option>
                <option value="mythical" className="text-pink-400 font-bold">Míticos</option>
              </select>
            </div>

            {/* Evo */}
            <div className={cn("bg-cobble-900/50 p-3 border-2", isEvolutionDisabled ? "border-cobble-800 opacity-60" : "border-cobble-700")}>
              <h3 className="font-bold text-xs text-cobble-400 mb-2 flex items-center tracking-widest">
                <Sparkles className={cn("w-4 h-4 mr-2", isEvolutionDisabled ? "text-cobble-600" : "text-green-500/50")} /> Evolução
              </h3>
              <select
                value={filters.evolution || 'all'}
                onChange={(e) => updateFilter('evolution', e.target.value)}
                disabled={isEvolutionDisabled}
                className={cn("w-full bg-cobble-800 border-2 p-2 text-white outline-none font-bold shadow-inner appearance-none",
                  isEvolutionDisabled ? "border-cobble-800 cursor-not-allowed text-cobble-500" : "border-cobble-700 cursor-pointer focus:border-green-500"
                )}
              >
                <option value="all">{isEvolutionDisabled ? 'Lendários ñ evoluem' : 'Qualquer'}</option>
                {!isEvolutionDisabled && <option value="base" className="text-green-400 font-bold">Base</option>}
                {!isEvolutionDisabled && <option value="evolved" className="text-blue-400 font-bold">Evoluídos</option>}
              </select>
            </div>

          </div>

          <div className="mt-4 pt-4 border-t-4 border-cobble-700 flex flex-col gap-2">
            <Button onClick={handleRandomDraw} className="w-full !bg-purple-600 hover:!bg-purple-500 text-white !border-purple-800" size="sm">
              <Dices className="w-4 h-4 mr-2"/> Filtros Aleatórios
            </Button>
            <Button onClick={resetFilters} variant="secondary" className="w-full text-xs" size="sm">
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* CENTER COLUMN: Gachapon Machine */}
        <div className="xl:col-span-6 flex flex-col items-center justify-start bg-cobble-800 border-4 border-cobble-700 p-8 shadow-inner relative min-h-[500px]">
          <h2 className="text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-md mb-2 text-center" style={{ WebkitTextStroke: '1px #423223' }}>
            Poké Gachapon
          </h2>
          <p className="text-cobble-400 font-bold tracking-widest mb-4">SORTEIO DE COBBLEMON</p>
          
          <Gachapon isDrawing={isDrawing} queue={drawingQueue} />

          <div className="mt-auto w-full max-w-sm pt-8">
            <Button 
                onClick={() => handleDraw()} 
                disabled={isDrawing}
                size="lg"
                className="w-full py-6 text-3xl font-black shadow-xl"
              >
                {isDrawing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-3"
                  >
                    <Dices className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <Dices className="mr-3 w-8 h-8" />
                )}
                {isDrawing ? 'Sorteando' : 'GIRAR!'}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Feed / History */}
        <div className="xl:col-span-3 bg-cobble-800 border-4 border-cobble-700 p-4 shadow-xl flex flex-col h-fit max-h-[700px]">
          <h2 className="text-xl font-black text-white mb-4 border-b-4 border-cobble-700 pb-2 flex items-center">
            Últimos Ganhadores
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
             {history.slice(0, 15).map(h => (
                <div key={h.id} className="bg-cobble-900 border-2 border-cobble-700 p-2 hover:border-cobble-500 transition-colors">
                   <div className="text-cobble-400 text-xs mb-2 font-bold tracking-wider">Sorteio às {new Date(h.date).toLocaleTimeString()}</div>
                   <div className="flex flex-wrap gap-2">
                     {h.pokemons.map(p => (
                        <div key={p.id} className="relative group">
                          <img 
                            src={p.sprites.front_default} 
                            className="w-12 h-12 bg-cobble-800 border-2 border-cobble-700 object-contain p-1" 
                            alt={p.name} 
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 z-50 whitespace-nowrap">
                            {p.name}
                          </div>
                        </div>
                     ))}
                   </div>
                </div>
             ))}
             {history.length === 0 && (
               <div className="text-cobble-400 text-center mt-10 font-bold">Nenhum sorteio ainda.</div>
             )}
          </div>
        </div>
      </div>

      {/* BOTTOM RESULTS GRID */}
      <AnimatePresence>
        {!isDrawing && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cobble-800 border-4 border-cobble-700 p-8 shadow-2xl mt-8"
          >
            <h2 className="text-4xl font-black text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 drop-shadow-lg" style={{ WebkitTextStroke: '1px #423223' }}>
              VOCÊ ENCONTROU {results.length === 1 ? 'UM NOVO POKÉMON!' : 'NOVOS POKÉMON!'}
            </h2>
            
            <div className={cn(
              "grid gap-8 justify-center mx-auto",
              results.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl"
            )}>
              {results.map((p, idx) => (
                <CardReveal key={`${p.id}-${idx}`} pokemon={p} idx={idx} />
              ))}
            </div>

            <div className="mt-16 flex flex-col md:flex-row justify-center gap-6">
              <Button 
                onClick={() => { setResults([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                size="lg" 
                variant="secondary"
                className="font-bold border-4"
              >
                <Settings2 className="w-5 h-5 mr-2" /> Esconder Resultados
              </Button>
              <Button 
                onClick={() => { handleDraw(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                size="lg" 
                className="font-bold border-4 !bg-blue-600 hover:!bg-blue-500 !border-blue-800"
              >
                <RefreshCw className="w-5 h-5 mr-2" /> Girar de Novo (Mesmos Filtros)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

    with open('src/pages/Lottery.tsx', 'w', encoding='utf-8') as f:
        f.write(pre_return + new_jsx)

if __name__ == "__main__":
    main()
