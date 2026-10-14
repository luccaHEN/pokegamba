import { useState, useEffect } from 'react';
import { Swords, ExternalLink, Copy, Check, Sparkles, Shield, Zap, RefreshCw } from 'lucide-react';
import { getSmogonBuilds, formatShowdownExport, getSmogonDexUrl } from '../../services/smogon';
import type { SmogonBuild } from '../../services/smogon';
import { Button } from '../ui/Button';
import { copyToClipboard } from '../../utils/discord';
import { cn } from '../../utils/cn';

const NATURE_EFFECTS: Record<string, string> = {
  Adamant: '+Atk, -SpA',
  Bashful: 'Neutro',
  Bold: '+Def, -Atk',
  Brave: '+Atk, -Spe',
  Calm: '+SpD, -Atk',
  Careful: '+SpD, -SpA',
  Docile: 'Neutro',
  Gentle: '+SpD, -Def',
  Hardy: 'Neutro',
  Hasty: '+Spe, -Def',
  Impish: '+Def, -SpA',
  Jolly: '+Spe, -SpA',
  Lax: '+Def, -SpD',
  Lonely: '+Atk, -Def',
  Mild: '+SpA, -Def',
  Modest: '+SpA, -Atk',
  Naive: '+Spe, -SpD',
  Naughty: '+Atk, -SpD',
  Quiet: '+SpA, -Spe',
  Quirky: 'Neutro',
  Rash: '+SpA, -SpD',
  Relaxed: '+Def, -Spe',
  Sassy: '+SpD, -Spe',
  Serious: 'Neutro',
  Timid: '+Spe, -Atk',
};

export function SmogonBuilds({ pokemonName }: { pokemonName: string }) {
  const [builds, setBuilds] = useState<SmogonBuild[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setSelectedIdx(0);

    getSmogonBuilds(pokemonName)
      .then(res => {
        if (isMounted) setBuilds(res);
      })
      .catch(err => {
        console.error('Erro ao buscar builds do Smogon:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pokemonName]);

  const activeBuild = builds[selectedIdx];

  const handleCopyShowdown = async () => {
    if (!activeBuild) return;
    const exportText = formatShowdownExport(pokemonName, activeBuild);
    const success = await copyToClipboard(exportText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const smogonUrl = getSmogonDexUrl(pokemonName, activeBuild?.genSlug || 'sv');

  if (loading) {
    return (
      <div className="bg-cobble-900/80 border-2 border-cobble-700 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[220px]">
        <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mb-3" />
        <span className="text-cobble-300 font-bold text-sm">Carregando builds competitivas da Smogon...</span>
      </div>
    );
  }

  if (builds.length === 0) {
    return (
      <div className="bg-cobble-900/80 border-2 border-cobble-700 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
        <Swords className="w-10 h-10 text-cobble-500 mb-3" />
        <h4 className="text-lg font-bold text-cobble-200 mb-1">Nenhuma build padrão encontrada para {pokemonName}</h4>
        <p className="text-cobble-400 text-sm max-w-md mb-4">
          Não encontramos uma análise competitiva registrada para este Pokémon no banco de dados.
        </p>
        <a 
          href={smogonUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cobble-800 hover:bg-cobble-700 text-yellow-400 border border-yellow-500/40 rounded-xl text-xs font-bold transition-all shadow-md"
        >
          <ExternalLink className="w-4 h-4" /> Pesquisar no Smogon Dex
        </a>
      </div>
    );
  }

  return (
    <div className="bg-cobble-900/90 border-2 border-cobble-700 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cobble-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white flex flex-wrap items-center gap-2">
              Builds Competitivas
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 font-bold uppercase tracking-wider">
                Smogon 
              </span>
              {activeBuild?.generation && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                  {activeBuild.generation}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyShowdown}
            size="sm"
            className={cn(
              "font-bold text-xs py-2 px-3.5 border transition-all shadow-md active:scale-95",
              copied 
                ? "!bg-green-600 hover:!bg-green-500 !border-green-800 text-white" 
                : "!bg-blue-600 hover:!bg-blue-500 !border-blue-700 text-white"
            )}
            title="Copiar build no formato Pokémon Showdown (para colar no jogo ou em simuladores)"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-green-200" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Smogon
              </>
            )}
          </Button>

          <a
            href={smogonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-cobble-800 hover:bg-cobble-700 text-cobble-300 hover:text-yellow-400 rounded-lg border border-cobble-600 transition-colors shadow-sm"
            title={`Ver análise oficial no Smogon Dex (${activeBuild?.generation || 'Smogon'})`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Tabs if multiple builds exist */}
      {builds.length > 1 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {builds.map((b, idx) => (
            <button
              key={`${b.tier}-${b.name}-${idx}`}
              onClick={() => setSelectedIdx(idx)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer",
                selectedIdx === idx
                  ? "bg-yellow-500 text-yellow-950 border-yellow-400 shadow-md scale-105"
                  : "bg-cobble-800 text-cobble-300 border-cobble-700 hover:border-cobble-500 hover:text-white"
              )}
            >
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-black">
                {b.shortGen}
              </span>

              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-black">
                {b.tier}
              </span>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Build Card */}
      {activeBuild && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: 4 Moveset slots */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-cobble-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Golpes Recomendados (Moveset)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeBuild.moves.slice(0, 4).map((move, i) => (
                <div
                  key={`${move}-${i}`}
                  className="bg-cobble-800/90 border border-cobble-700 rounded-xl p-3 flex items-center gap-2.5 shadow-sm hover:border-yellow-500/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-cobble-900 border border-cobble-700 flex items-center justify-center text-[10px] font-black text-yellow-400">
                    {i + 1}
                  </div>
                  <span className="font-bold text-sm text-white capitalize truncate">{move}</span>
                </div>
              ))}
              {/* Fill placeholders if less than 4 moves */}
              {Array.from({ length: Math.max(0, 4 - activeBuild.moves.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-cobble-900/40 border border-dashed border-cobble-700/60 rounded-xl p-3 flex items-center gap-2.5 opacity-40"
                >
                  <span className="text-xs text-cobble-500 font-bold">Slot Livre / Opcional</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Parameters (Item, Ability, Nature, EVs) */}
          <div className="lg:col-span-5 space-y-3 bg-cobble-800/70 p-4 md:p-5 rounded-2xl border border-cobble-700">
            <h4 className="text-xs font-black uppercase tracking-wider text-cobble-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Configuração do Treinador
            </h4>

            <div className="space-y-2.5 text-xs">
              {/* Item */}
              <div className="flex justify-between items-center py-1 border-b border-cobble-700/50">
                <span className="text-cobble-400 font-medium">Item:</span>
                <span className="font-bold text-yellow-300 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                  {activeBuild.item || 'Nenhum / À escolha'}
                </span>
              </div>

              {/* Ability */}
              <div className="flex justify-between items-center py-1 border-b border-cobble-700/50">
                <span className="text-cobble-400 font-medium">Habilidade:</span>
                <span className="font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                  {activeBuild.ability || '-'}
                </span>
              </div>

              {/* Nature */}
              <div className="flex justify-between items-center py-1 border-b border-cobble-700/50">
                <span className="text-cobble-400 font-medium">Nature:</span>
                <span className="font-bold text-green-300 flex items-center gap-1.5">
                  {activeBuild.nature || '-'}
                  {activeBuild.nature && NATURE_EFFECTS[activeBuild.nature] && (
                    <span className="text-[10px] text-cobble-400 font-normal">
                      ({NATURE_EFFECTS[activeBuild.nature]})
                    </span>
                  )}
                </span>
              </div>

              {/* Tera Type (if exists) */}
              {activeBuild.teraType && (
                <div className="flex justify-between items-center py-1 border-b border-cobble-700/50">
                  <span className="text-cobble-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Tera Type:
                  </span>
                  <span className="font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                    {activeBuild.teraType}
                  </span>
                </div>
              )}

              {/* EVs */}
              {activeBuild.evs && Object.keys(activeBuild.evs).length > 0 && (
                <div className="pt-1">
                  <span className="text-cobble-400 font-medium block mb-1.5">EVs (Esforço):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(activeBuild.evs).map(([stat, val]) => (
                      <span
                        key={stat}
                        className="px-2 py-0.5 bg-cobble-900 border border-cobble-700 rounded text-[11px] font-mono font-bold text-cobble-200"
                      >
                        <strong className="text-yellow-400 uppercase">{stat}:</strong> {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
