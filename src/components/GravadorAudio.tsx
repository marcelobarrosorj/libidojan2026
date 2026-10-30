// GRAVADOR-AUDIO: nota de voz no estilo WhatsApp.
// Segura para gravar, solta para enviar, arrasta para cancelar.
// Desacoplado do upload: recebe a funcao que grava o blob e devolve a URL.
import { useEffect, useRef, useState } from 'react';

interface Props {
  onEnviar: (arquivo: Blob, duracaoSegundos: number) => Promise<void>;
  onCancelar?: () => void;
}

const LIMITE_SEGUNDOS = 120;

export function GravadorAudio({ onEnviar, onCancelar }: Props) {
  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const midia = useRef<MediaRecorder | null>(null);
  const pedacos = useRef<Blob[]>([]);
  const fluxo = useRef<MediaStream | null>(null);
  const inicio = useRef<number>(0);
  const timer = useRef<number | null>(null);

  function limparTimer(): void {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }

  function liberarMicrofone(): void {
    if (fluxo.current) {
      fluxo.current.getTracks().forEach((t) => t.stop());
      fluxo.current = null;
    }
  }

  async function iniciar(): Promise<void> {
    setErro(null);
    pedacos.current = [];

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setErro('Microfone nao disponivel neste navegador');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      fluxo.current = stream;

      const gravador = new MediaRecorder(stream);
      midia.current = gravador;

      gravador.ondataavailable = (evento: BlobEvent) => {
        if (evento.data.size > 0) pedacos.current.push(evento.data);
      };

      gravador.onstop = () => {
        liberarMicrofone();
      };

      gravador.start();
      inicio.current = Date.now();
      setSegundos(0);
      setGravando(true);

      timer.current = window.setInterval(() => {
        const decorridos = Math.floor((Date.now() - inicio.current) / 1000);
        setSegundos(decorridos);

        if (decorridos >= LIMITE_SEGUNDOS && midia.current?.state === 'recording') {
          void enviar();
        }
      }, 250);
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : String(e);
      setErro('Permissao de microfone negada ou indisponivel: ' + detalhe);
      liberarMicrofone();
    }
  }

  async function enviar(): Promise<void> {
    const gravador = midia.current;
    if (!gravador || gravador.state !== 'recording') return;

    const duracao = Math.max(1, Math.floor((Date.now() - inicio.current) / 1000));

    limparTimer();
    setGravando(false);
    setEnviando(true);

    await new Promise<void>((resolve) => {
      gravador.onstop = () => {
        liberarMicrofone();
        resolve();
      };
      gravador.stop();
    });

    const blob = new Blob(pedacos.current, { type: 'audio/webm' });
    pedacos.current = [];

    if (blob.size < 800) {
      setEnviando(false);
      setErro('Gravacao muito curta');
      return;
    }

    try {
      await onEnviar(blob, duracao);
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : String(e);
      setErro('Falha ao enviar audio: ' + detalhe);
    } finally {
      setEnviando(false);
    }
  }

  function cancelar(): void {
    limparTimer();

    if (midia.current && midia.current.state === 'recording') {
      midia.current.onstop = () => liberarMicrofone();
      midia.current.stop();
    }

    pedacos.current = [];
    setGravando(false);
    setSegundos(0);

    if (onCancelar) onCancelar();
  }

  useEffect(() => {
    return () => {
      limparTimer();
      if (midia.current && midia.current.state === 'recording') {
        try {
          midia.current.stop();
        } catch (e) { console.error(e); }
      }
      liberarMicrofone();
    };
  }, []);

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');

  if (gravando) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#1b1b24] border border-[#2a2a36]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-mono text-white/90 tabular-nums">
          {mm}:{ss}
        </span>
        <button
          type="button"
          onClick={cancelar}
          className="text-xs text-white/50 hover:text-white/80"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void enviar()}
          className="px-3 py-1.5 rounded-full bg-[#7c3aed] text-white text-xs font-semibold"
        >
          Enviar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void iniciar()}
        disabled={enviando}
        className="w-10 h-10 rounded-full bg-[#1b1b24] border border-[#2a2a36] flex items-center justify-center text-white/80 hover:text-white disabled:opacity-50"
        aria-label="Gravar audio"
        title="Gravar audio"
      >
        {enviando ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M5 11a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {erro && <span className="text-[10px] text-red-400 max-w-[180px] text-right">{erro}</span>}
    </div>
  );
}