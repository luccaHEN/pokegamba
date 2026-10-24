import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TrainerWheelProps {
  trainers: string[];
  isSpinning: boolean;
  onSpinStart?: () => void;
  onSpinComplete: (winner: string, winnerIndex: number) => void;
  disabled?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  className?: string;
  size?: number;
}

// Vibrant, contrasting color palette for wheel sectors
const SLICE_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#E11D48', // Rose
];

// Web Audio API singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

function playTick(speedFactor: number = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const freq = 650 + Math.min(speedFactor * 300, 400);
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch {}
}

function playVictorySound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [
      { freq: 523.25, time: 0, dur: 0.12 },     // C5
      { freq: 659.25, time: 0.1, dur: 0.12 },   // E5
      { freq: 783.99, time: 0.2, dur: 0.14 },   // G5
      { freq: 1046.50, time: 0.32, dur: 0.4 },  // C6
    ];
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.time);
      osc.stop(ctx.currentTime + n.time + n.dur);
    });
  } catch {}
}

export function TrainerWheel({
  trainers,
  isSpinning = false,
  onSpinStart,
  onSpinComplete,
  disabled = false,
  soundEnabled = true,
  onToggleSound,
  className,
  size = 420,
}: TrainerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current rotation in radians
  const rotationRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastPegIndexRef = useRef<number>(-1);
  const needleAngleRef = useRef<number>(0); // Flapper angle deflection

  // Local state for UI indicators
  const [internalSpinning, setInternalSpinning] = useState(false);
  const isCurrentlySpinning = isSpinning || internalSpinning;
  const [selectedPreview, setSelectedPreview] = useState<string>('');

  // Fallback trainers if none provided
  const displayTrainers = useMemo(() => {
    return trainers.length > 0 ? trainers : ['Treinador 1', 'Treinador 2'];
  }, [trainers]);
  const numSlices = displayTrainers.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw the entire wheel onto the canvas
  const drawWheel = useCallback((currentRotation: number, needleTilt: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 24; // Leave room for border & needle

    ctx.clearRect(0, 0, width, height);

    // Save context for wheel rotation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(currentRotation);

    // 1. Draw outer shadow ring
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // 2. Draw Wheel Slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Sector fill with subtle gradient
      const gradient = ctx.createRadialGradient(0, 0, 30, 0, 0, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustColor(color, -25));
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sector border line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw Trainer Label Text
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);

      const trainerName = displayTrainers[i];
      // Adaptive font sizing based on slice count and name length
      const baseFontSize = numSlices > 12 ? 11 : numSlices > 8 ? 13 : 15;
      ctx.font = `bold ${baseFontSize}px "Minecraft", "Montserrat", system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Truncate if exceptionally long
      let textToDraw = trainerName;
      if (textToDraw.length > 14 && numSlices > 8) {
        textToDraw = textToDraw.slice(0, 12) + '…';
      }

      // Strong text shadow / outline for 100% legibility
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.strokeText(textToDraw, radius - 20, 0);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(textToDraw, radius - 20, 0);

      ctx.restore();
    }

    // 3. Draw Outer Rim / Tire
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f59e0b'; // Amber-500
    ctx.lineWidth = 8;
    ctx.stroke();

    // Outer dark casing
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#292524'; // Stone-800
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Draw Rim Pegs / Pins at each boundary
    for (let i = 0; i < numSlices; i++) {
      const angle = i * sliceAngle;
      const px = Math.cos(angle) * (radius - 1);
      const py = Math.sin(angle) * (radius - 1);

      // Peg circle (golden stud)
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a'; // Yellow-200
      ctx.fill();
      ctx.strokeStyle = '#78350f'; // Amber-900
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore(); // Restore back to non-rotated canvas coords

    // 5. Center Hub (Pokéball styling or golden button)
    ctx.save();
    ctx.translate(cx, cy);

    // Hub drop shadow
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Outer Hub Ring (Gold)
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#eab308'; // Yellow-500
    ctx.fill();
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner Hub Disc
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#1c1917'; // Stone-900
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center "GIRAR" / Pokéball core
    ctx.fillStyle = '#facc15';
    ctx.font = '900 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GIRAR', 0, 0);

    ctx.restore();

    // 6. Needle / Flapper at Top (pointing down at angle 1.5 * PI)
    ctx.save();
    ctx.translate(cx, cy - radius - 2);

    // Apply needle flapper tilt
    ctx.rotate((needleTilt * Math.PI) / 180);

    // Needle shadow
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(10, -18);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Needle body (Vibrant Red & Gold)
    ctx.beginPath();
    ctx.moveTo(-9, -20);
    ctx.lineTo(9, -20);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fillStyle = '#ef4444'; // Red-500
    ctx.fill();
    ctx.strokeStyle = '#fbbf24'; // Amber-400
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Needle top cap hinge
    ctx.beginPath();
    ctx.arc(0, -20, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }, [displayTrainers, numSlices, sliceAngle]);

  // Redraw when trainers or size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    drawWheel(rotationRef.current, needleAngleRef.current);
  }, [drawWheel, size]);

  // Compute winning trainer at current rotation
  const getWinnerAtRotation = useCallback((rot: number) => {
    // Top pointer is at 1.5 * PI (270 degrees)
    const pointerAngle = 1.5 * Math.PI;
    const normalized = (((pointerAngle - (rot % (2 * Math.PI))) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const index = Math.floor(normalized / sliceAngle) % numSlices;
    return {
      trainer: displayTrainers[index],
      index,
    };
  }, [displayTrainers, numSlices, sliceAngle]);

  // Trigger spin animation
  const handleSpin = useCallback(() => {
    if (internalSpinning || disabled || displayTrainers.length === 0) return;

    onSpinStart?.();
    setInternalSpinning(true);

    const startRot = rotationRef.current;
    // 5 to 8 full rotations + random angle
    const minRotations = 5;
    const extraRotations = Math.random() * 3;
    const totalExtraAngle = (minRotations + extraRotations) * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const targetRot = startRot + totalExtraAngle;

    const duration = 5200; // 5.2 seconds for realistic suspense
    const startTime = performance.now();

    // Custom cubic-bezier / power-4 deceleration curve
    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentRot = startRot + (targetRot - startRot) * easedProgress;
      rotationRef.current = currentRot;

      // Peg tick detection
      const pointerAngle = 1.5 * Math.PI;
      const normalized = (((pointerAngle - (currentRot % (2 * Math.PI))) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentPeg = Math.floor(normalized / sliceAngle);

      if (currentPeg !== lastPegIndexRef.current) {
        lastPegIndexRef.current = currentPeg;
        // Flapper deflection
        needleAngleRef.current = -18;
        if (soundEnabled) {
          const speedFactor = 1 - progress;
          playTick(speedFactor);
        }
      } else {
        // Spring needle back to 0
        needleAngleRef.current *= 0.85;
      }

      drawWheel(currentRot, needleAngleRef.current);

      // Realtime preview of trainer passing under needle
      const currentWinner = getWinnerAtRotation(currentRot);
      setSelectedPreview(currentWinner.trainer);

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished
        needleAngleRef.current = 0;
        drawWheel(targetRot, 0);

        const finalResult = getWinnerAtRotation(targetRot);
        setInternalSpinning(false);
        if (soundEnabled) {
          playVictorySound();
        }
        onSpinComplete(finalResult.trainer, finalResult.index);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
  }, [
    internalSpinning,
    disabled,
    displayTrainers.length,
    onSpinStart,
    sliceAngle,
    drawWheel,
    getWinnerAtRotation,
    soundEnabled,
    onSpinComplete,
  ]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("flex flex-col items-center justify-center select-none relative", className)}>
      {/* Sound Toggle Header */}
      <div className="w-full flex items-center justify-between mb-2 px-2 max-w-[420px]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cobble-300">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>{displayTrainers.length} Treinadores na Roleta</span>
        </div>

        {onToggleSound && (
          <button
            onClick={onToggleSound}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-cobble-700 text-[11px] font-bold text-cobble-300 hover:text-white cursor-pointer transition-colors"
            title={soundEnabled ? 'Silenciar som da roleta' : 'Ativar som da roleta'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-green-400" />
                <span>Som Ligado</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
                <span>Mudo</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Wheel Canvas Container */}
      <div className="relative cursor-pointer group" onClick={handleSpin}>
        <canvas
          ref={canvasRef}
          className="rounded-full shadow-2xl filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
        />

        {/* Center Spin Hover Effect */}
        {!isCurrentlySpinning && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full border-2 border-yellow-400/50 animate-ping opacity-30" />
          </div>
        )}
      </div>

      {/* Big Action Button */}
      <div className="mt-4 w-full max-w-[320px]">
        <button
          onClick={handleSpin}
          disabled={isCurrentlySpinning || disabled || displayTrainers.length === 0}
          className={cn(
            "w-full py-3.5 px-6 rounded-xl font-black text-base uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer",
            isCurrentlySpinning
              ? "bg-cobble-700 text-cobble-400 border-2 border-cobble-600 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-cobble-950 border-2 border-yellow-300 shadow-yellow-500/20 active:scale-95"
          )}
        >
          {isCurrentlySpinning ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-yellow-400" />
              <span>Girando Roleta...</span>
            </>
          ) : (
            <>
              <span>🎯 GIRAR ROLETA!</span>
            </>
          )}
        </button>

        {selectedPreview && isCurrentlySpinning && (
          <p className="text-center text-xs font-bold text-yellow-400 mt-2 truncate animate-pulse">
            Passando por: <strong>{selectedPreview}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

// Helper function to darken/lighten hex colors
function adjustColor(color: string, amount: number): string {
  const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x000f) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
