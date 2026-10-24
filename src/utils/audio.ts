// Utility to play custom voice lines for the 27 Starter Pokémon
let currentAudio: HTMLAudioElement | null = null;
let isVoiceMuted: boolean = typeof window !== 'undefined' 
  ? window.localStorage.getItem('cobblemon-starter-voice-muted') === 'true'
  : false;

/**
 * Checks if starter Pokémon voice audio is currently muted.
 */
export function isStarterVoiceMuted(): boolean {
  return isVoiceMuted;
}

/**
 * Toggles or sets the starter Pokémon voice audio mute state.
 */
export function setStarterVoiceMuted(muted: boolean): void {
  isVoiceMuted = muted;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cobblemon-starter-voice-muted', String(muted));
  }
  if (muted) {
    stopStarterSound();
  }
}

/**
 * Plays the custom recorded audio for a starter Pokémon.
 * Audio files are expected at: /sounds/starters/{id}.mp3
 * (e.g., /sounds/starters/1.mp3, /sounds/starters/4.mp3, etc.)
 *
 * If muted or the file does not exist yet (404), it fails silently without errors.
 */
export function playStarterSound(starterId: number, volume: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (isVoiceMuted) {
      resolve();
      return;
    }

    try {
      // Stop any currently playing starter sound to avoid overlapping screams
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }

      const audio = new Audio(`/sounds/starters/${starterId}.mp3`);
      audio.volume = Math.max(0, Math.min(1, volume));
      currentAudio = audio;

      audio.onended = () => {
        if (currentAudio === audio) {
          currentAudio = null;
        }
        resolve();
      };

      audio.onerror = () => {
        // Audio file not yet added or invalid format — fail silently
        if (currentAudio === audio) {
          currentAudio = null;
        }
        resolve();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => resolve())
          .catch(() => {
            // Browser autoplay policy blocked or file 404
            resolve();
          });
      }
    } catch {
      resolve();
    }
  });
}

/**
 * Stops any currently playing starter voice audio.
 */
export function stopStarterSound(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}
