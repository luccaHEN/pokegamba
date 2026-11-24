import { useState } from 'react';
import { Swords, Check, Copy, Play, Bot, Users, Sparkles, Clipboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface BattleLobbyProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  roomId: string;
  isHost: boolean;
  statusText: string;
  isConnecting: boolean;
  onCreateRoom: (id: string) => void;
  onJoinRoom: (id: string) => void;
  onPlayBot: () => void;
}

export function BattleLobby({
  playerName,
  setPlayerName,
  roomId,
  isHost,
  statusText,
  isConnecting,
  onCreateRoom,
  onJoinRoom,
  onPlayBot,
}: BattleLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState(() => (!isHost && roomId ? roomId : ''));

  const generateRandomRoomId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId.trim().toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      let val = text.trim().toUpperCase();
      if (val.includes('SALA=')) {
        val = val.split('SALA=')[1].split('&')[0];
      }
      setJoinCodeInput(val);
      if (val.trim() && playerName.trim()) {
        onJoinRoom(val.trim());
      }
    } catch (e) {
      console.warn('Could not read clipboard:', e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex p-3 bg-red-500/20 rounded-2xl border border-red-500/30 text-red-400 mb-3 animate-pulse">
          <Swords className="w-10 h-10" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-orange-400 drop-shadow-md">
          ARENA DE BATALHA 1v1
        </h1>
      </div>

      {/* Nickname Selection */}
      <div className="bg-cobble-800/90 border border-cobble-700 rounded-2xl p-6 shadow-xl mb-6 backdrop-blur-md">
        <label className="block text-sm font-bold text-cobble-200 uppercase tracking-wider mb-2">
          Seu Nome de Treinador
        </label>
        <div className="flex gap-3">
          <Input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ex: Ash, Red, Treinador..."
            className="bg-cobble-900 border-cobble-700 text-white font-bold"
            maxLength={18}
          />
        </div>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room */}
        <div className="bg-gradient-to-b from-cobble-800/90 to-cobble-900/90 border border-cobble-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Criar Nova Sala</h3>
                <p className="text-xs text-cobble-400">Gere um código para desafiar alguém</p>
              </div>
            </div>

            {roomId && isHost ? (
              <div className="mt-4 p-4 bg-cobble-950/80 border border-orange-500/40 rounded-xl space-y-3">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-cobble-400 font-bold">Código da Sala</span>
                  <div className="text-3xl font-black tracking-widest text-yellow-400 font-mono mt-1">
                    {roomId}
                  </div>
                </div>

                <Button
                  onClick={handleCopyCode}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-300" />
                      Código Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Código da Sala
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-cobble-300 animate-pulse pt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
                  {statusText || 'Aguardando oponente entrar com o código...'}
                </div>
              </div>
            ) : (
              <p className="text-sm text-cobble-300 mb-6">
                Você será o Host da partida. Ao clicar abaixo, um código exclusivo será criado para você compartilhar com seu rival.
              </p>
            )}
          </div>

          {(!roomId || !isHost) && (
            <Button
              onClick={() => {
                const code = generateRandomRoomId();
                onCreateRoom(code);
              }}
              disabled={isConnecting || !playerName.trim()}
              className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Criar Sala 1v1
            </Button>
          )}
        </div>

        {/* Join Room */}
        <div className="bg-gradient-to-b from-cobble-800/90 to-cobble-900/90 border border-cobble-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                <Play className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Entrar em uma Sala</h3>
                <p className="text-xs text-cobble-400">Cole o código recebido do seu amigo</p>
              </div>
            </div>

            <p className="text-sm text-cobble-300 mb-4">
              Digite o código de 5 dígitos da sala ou cole o link que você recebeu para entrar na batalha.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={joinCodeInput}
                  onChange={(e) => {
                    let val = e.target.value.trim().toUpperCase();
                    if (val.includes('sala=')) {
                      val = val.split('sala=')[1].split('&')[0];
                    }
                    setJoinCodeInput(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && joinCodeInput.trim() && playerName.trim() && !isConnecting) {
                      onJoinRoom(joinCodeInput.trim());
                    }
                  }}
                  placeholder="Ex: K8F9Z"
                  maxLength={10}
                  className="bg-cobble-950 border-cobble-700 text-center text-xl font-mono uppercase tracking-widest font-black text-white flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePasteCode}
                  className="px-3.5 bg-cobble-800 hover:bg-cobble-700 border-cobble-600 text-yellow-400 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow shrink-0"
                  title="Colar código ou link da área de transferência"
                >
                  <Clipboard className="w-4 h-4" />
                  <span>Colar</span>
                </Button>
              </div>

              {isConnecting && (
                <div className="text-center text-xs text-blue-400 animate-pulse">
                  {statusText || 'Conectando ao Host...'}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => onJoinRoom(joinCodeInput)}
            disabled={isConnecting || !joinCodeInput.trim() || !playerName.trim()}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Entrar na Batalha
          </Button>
        </div>
      </div>

      {/* Singleplayer / Training mode button */}
      <div className="mt-8 text-center">
        <button
          onClick={onPlayBot}
          disabled={!playerName.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cobble-800/80 hover:bg-cobble-700/80 border border-cobble-600/50 text-cobble-300 hover:text-white transition-all text-sm font-semibold shadow-md group"
        >
          <Bot className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Ou teste sozinho jogando contra a **I.A. (Treino)**</span>
        </button>
      </div>
    </div>
  );
}
