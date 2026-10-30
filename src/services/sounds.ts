// SOM-NOTIF: sons gerados pelo proprio navegador (sem arquivos externos)
let audioCtx: AudioContext | null = null;

const pegarContexto = (): AudioContext | null => {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AC();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
};

const tocar = (freq: number, duracao: number, atraso: number, tipo: OscillatorType = 'sine', volume = 0.12) => {
  try { if (localStorage.getItem('libido_notifications') === 'off') return; } catch (eN) { console.error(eN); } // NOTIF-CHECK
  const ctx = pegarContexto();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + atraso;
    ganho.gain.setValueAtTime(volume, t0);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);
    osc.connect(ganho);
    ganho.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duracao);
  } catch (e) {
    // som e opcional - nunca quebra o app
  }
};

// Mensagem nova recebida (pop de dois tons)
export const playMessageSound = () => {
  tocar(880, 0.12, 0);
  tocar(1318, 0.16, 0.09);
};

// Curtida recebida (tom agudo e alegre)
export const playLikeSound = () => {
  tocar(659, 0.1, 0, 'triangle');
  tocar(987, 0.14, 0.08, 'triangle');
};

// Confirmacao sutil de envio
export const playSentSound = () => {
  tocar(523, 0.07, 0, 'sine', 0.06);
};
// SOM-MATCH: fanfarra curta para match (os dois se curtiram)
export const playMatchSound = () => {
  tocar(523, 0.12, 0, 'triangle', 0.14);
  tocar(659, 0.12, 0.1, 'triangle', 0.14);
  tocar(784, 0.2, 0.2, 'triangle', 0.14);
};

// SOM-FOLLOW: novo seguidor (tom ascendente curto)
export const playFollowSound = () => {
  tocar(440, 0.1, 0, 'sine', 0.12);
  tocar(587, 0.1, 0.09, 'sine', 0.12);
  tocar(740, 0.16, 0.18, 'sine', 0.12);
};
