
import { log } from './authUtils';

const SOUND_STORAGE_KEY = 'libido_settings_sound';

// Assets de áudio (Sons curtos e discretos)
const SOUNDS = {
  MESSAGE: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', // Ping discreto
  LIKE: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',    // Pop sutil
  MATCH: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'   // Brilho/Sucesso
};

class SoundService {
  private enabled: boolean = true;
  private lastPlayed: number = 0;
  private minInterval: number = 800; // Throttling de 800ms
  private audioCache: Record<string, HTMLAudioElement> = {};

  constructor() {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    this.enabled = saved !== null ? saved === 'true' : true;
    this.preload();
  }

  private preload() {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.load();
      this.audioCache[key] = audio;
    });
  }

  public setEnabled(v: boolean) {
    this.enabled = v;
    localStorage.setItem(SOUND_STORAGE_KEY, String(v));
    log('info', `Feedback sonoro: ${v ? 'Ativado' : 'Desativado'}`);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public play(soundKey: keyof typeof SOUNDS) {
    if (!this.enabled) return;

    const now = Date.now();
    if (now - this.lastPlayed < this.minInterval) return;

    try {
      const audio = this.audioCache[soundKey];
      if (audio) {
        audio.currentTime = 0;
        // O play() pode falhar se não houver interação prévia, mas como o app 
        // requer login/PIN, a interação inicial já ocorreu.
        audio.play().catch(() => {});
        this.lastPlayed = now;
      }
    } catch (e) {
      log('error', 'Falha ao reproduzir sinal sonoro', e);
    }
  }
}

export const soundService = new SoundService();
