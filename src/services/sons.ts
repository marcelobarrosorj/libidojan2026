// SONS: motor de audio do app (Web Audio API - nao precisa de arquivos mp3)
type Nota = { freq: number; inicio: number; dur: number; vol?: number; tipo?: OscillatorType };

let ctx: AudioContext | null = null;
let desbloqueado = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try { ctx = new AC(); } catch { return null; }
  }
  if (ctx && ctx.state === 'suspended') { ctx.resume().catch(() => {}); }
  return ctx;
}

export function desbloquearAudio(): void {
  if (desbloqueado) return;
  const c = getCtx();
  if (!c) return;
  try {
    const buf = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
    desbloqueado = true;
  } catch {}
}

function tocar(notas: Nota[], volume = 0.16): void {
  const c = getCtx();
  if (!c) return;
  if (c.state !== 'running') { c.resume().catch(() => {}); return; }
  const t0 = c.currentTime;
  notas.forEach((n) => {
    try {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = n.tipo || 'sine';
      osc.frequency.value = n.freq;
      const v = (n.vol ?? 1) * volume;
      g.gain.setValueAtTime(0.0001, t0 + n.inicio);
      g.gain.linearRampToValueAtTime(v, t0 + n.inicio + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.inicio + n.dur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t0 + n.inicio);
      osc.stop(t0 + n.inicio + n.dur + 0.05);
    } catch {}
  });
}

export function tocarMensagem(): void {
  tocar([
    { freq: 880.0, inicio: 0, dur: 0.12 },
    { freq: 1174.7, inicio: 0.11, dur: 0.20 },
  ]);
}

export function tocarProximidade(): void {
  tocar([
    { freq: 523.25, inicio: 0, dur: 0.14, tipo: 'triangle' },
    { freq: 659.25, inicio: 0.13, dur: 0.14, tipo: 'triangle' },
    { freq: 783.99, inicio: 0.26, dur: 0.24, tipo: 'triangle' },
  ]);
}

export function tocarAlerta(): void {
  tocar([
    { freq: 987.77, inicio: 0, dur: 0.10, tipo: 'square', vol: 0.5 },
    { freq: 987.77, inicio: 0.16, dur: 0.10, tipo: 'square', vol: 0.5 },
  ]);
}

// Desbloqueia o audio na primeira interacao (exigencia dos navegadores)
if (typeof document !== 'undefined') {
  const unlock = () => {
    desbloquearAudio();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('touchstart', unlock);
  };
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('keydown', unlock);
  document.addEventListener('touchstart', unlock, { passive: true });
}