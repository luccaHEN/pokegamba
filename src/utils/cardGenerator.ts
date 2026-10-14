import type { Pokemon } from '../types/pokemon';

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: '#A8A878', text: '#FFFFFF' },
  fire: { bg: '#F08030', text: '#FFFFFF' },
  water: { bg: '#6890F0', text: '#FFFFFF' },
  electric: { bg: '#F8D030', text: '#000000' },
  grass: { bg: '#78C850', text: '#FFFFFF' },
  ice: { bg: '#98D8D8', text: '#000000' },
  fighting: { bg: '#C03028', text: '#FFFFFF' },
  poison: { bg: '#A040A0', text: '#FFFFFF' },
  ground: { bg: '#E0C068', text: '#000000' },
  flying: { bg: '#A890F0', text: '#FFFFFF' },
  psychic: { bg: '#F85888', text: '#FFFFFF' },
  bug: { bg: '#A8B820', text: '#FFFFFF' },
  rock: { bg: '#B8A038', text: '#FFFFFF' },
  ghost: { bg: '#705898', text: '#FFFFFF' },
  dragon: { bg: '#7038F8', text: '#FFFFFF' },
  dark: { bg: '#705848', text: '#FFFFFF' },
  steel: { bg: '#B8B8D0', text: '#000000' },
  fairy: { bg: '#EE99AC', text: '#000000' },
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function generateLotteryCardImage(
  pokemons: Pokemon[],
  participants?: string[]
): Promise<Blob> {
  const count = pokemons.length;
  const cols = count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);

  const uniqueTrainers = Array.from(new Set((participants || []).map(p => p?.trim()).filter(Boolean)));
  const singleTrainer = uniqueTrainers.length === 1 ? uniqueTrainers[0] : null;
  const multiTrainers = uniqueTrainers.length > 1 ? uniqueTrainers.join(', ') : null;
  const sessionTrainerText = singleTrainer
    ? `👑 Treinador: ${singleTrainer.toUpperCase()}`
    : multiTrainers
    ? `👥 Treinadores: ${multiTrainers.toUpperCase()}`
    : null;

  const cardWidth = 260;
  const cardHeight = 250;
  const padding = 30;
  const headerHeight = sessionTrainerText ? 96 : 74;
  const footerHeight = 30;

  const width = padding * 2 + cols * cardWidth + (cols - 1) * 20;
  const height = headerHeight + rows * cardHeight + (rows - 1) * 20 + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível inicializar canvas');

  // Background degradê
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#131822');
  bgGradient.addColorStop(1, '#0b0e14');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Moldura externa
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(6, 6, width - 12, height - 12);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#eab308';
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Header Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#facc15';
  ctx.font = '900 24px "Pixelify Sans", "Segoe UI", sans-serif';
  ctx.fillText('🎲 POKEGAMBA • SORTEIO COBBLEMON 🎰', width / 2, 40);

  // Session Trainer Header (Encompasses all pokemons in the draw!)
  if (sessionTrainerText) {
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 15px sans-serif';
    ctx.fillText(sessionTrainerText, width / 2, 66);
  }

  // Linha divisória
  const dividerY = sessionTrainerText ? 80 : 58;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, dividerY);
  ctx.lineTo(width - padding, dividerY);
  ctx.stroke();

  // Load all images in parallel
  const images = await Promise.all(
    pokemons.map((p) => {
      const src =
        p.sprites.other?.['official-artwork']?.front_default ||
        p.sprites.front_default ||
        '';
      return loadImage(src);
    })
  );

  // Render cards
  for (let idx = 0; idx < count; idx++) {
    const pokemon = pokemons[idx];
    const img = images[idx];

    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x = padding + col * (cardWidth + 20);
    const y = headerHeight + row * (cardHeight + 20);

    const primaryType = pokemon.types[0]?.type.name || 'normal';
    const typeColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

    // Card background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, cardWidth, cardHeight);

    // Card Border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    const contentStartY = y + 14;

    // Number tag
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`#${String(pokemon.id).padStart(4, '0')}`, x + 16, contentStartY + 14);

    // Sprite image
    const imgSize = 120;
    const imgX = x + (cardWidth - imgSize) / 2;
    const imgY = contentStartY + 15;

    // Sprite glow background
    const glow = ctx.createRadialGradient(
      imgX + imgSize / 2,
      imgY + imgSize / 2,
      10,
      imgX + imgSize / 2,
      imgY + imgSize / 2,
      imgSize / 2 + 10
    );
    glow.addColorStop(0, `${typeColor.bg}40`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.fill();

    if (img) {
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
    } else {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pokemon Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px sans-serif';
    ctx.textAlign = 'center';
    const nameCap = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    ctx.fillText(nameCap, x + cardWidth / 2, imgY + imgSize + 22);

    // Type badges
    const totalTypes = pokemon.types.length;
    const badgeW = 75;
    const badgeH = 22;
    const gap = 8;
    const badgesTotalW = totalTypes * badgeW + (totalTypes - 1) * gap;
    let badgeStartX = x + (cardWidth - badgesTotalW) / 2;
    const badgeY = imgY + imgSize + 32;

    pokemon.types.forEach((t) => {
      const tInfo = TYPE_COLORS[t.type.name] || TYPE_COLORS.normal;
      ctx.fillStyle = tInfo.bg;
      ctx.fillRect(badgeStartX, badgeY, badgeW, badgeH);

      ctx.fillStyle = tInfo.text;
      ctx.font = '800 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.type.name.toUpperCase(), badgeStartX + badgeW / 2, badgeY + 15);

      badgeStartX += badgeW + gap;
    });
  }


  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Falha ao gerar imagem blob do canvas'));
    }, 'image/png');
  });
}

export async function copyImageBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Não foi possível copiar imagem direto, acionando download:', err);
    return false;
  }
}

export async function copyShareToClipboard(
  text: string,
  imageBlob: Blob
): Promise<{ success: boolean; fallbackTextOnly?: boolean; fallbackImageOnly?: boolean }> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        const textBlob = new Blob([text], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'image/png': imageBlob,
          }),
        ]);
        return { success: true };
      } catch (errBoth) {
        console.warn('Clipboard conjunto não aceito, tentando enviar imagem e baixar/copiar texto:', errBoth);
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': imageBlob,
            }),
          ]);
          return { success: true, fallbackImageOnly: true };
        } catch {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
          }
          downloadImageBlob(imageBlob, 'sorteio-cobblemon.png');
          return { success: true, fallbackTextOnly: true };
        }
      }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
    downloadImageBlob(imageBlob, 'sorteio-cobblemon.png');
    return { success: true, fallbackTextOnly: true };
  } catch (err) {
    console.error('Falha ao compartilhar:', err);
    return { success: false };
  }
}

export function downloadImageBlob(blob: Blob, filename = 'sorteio-pokemon.png'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
