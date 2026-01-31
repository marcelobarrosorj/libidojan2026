
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Mic, Volume2, Sparkles, Loader2, StopCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { log } from '../services/authUtils';

interface VibeVoiceProps {
  onClose: () => void;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VibeVoice: React.FC<VibeVoiceProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [vibeStatus, setVibeStatus] = useState("Pronto para conectar");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      try { 
        sessionRef.current.close(); 
      } catch(e) {
        log('warn', 'Error closing session', e);
      }
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    // Safety check to prevent "Cannot close a closed AudioContext"
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => log('warn', 'Error closing audioContext', err));
      }
      audioContextRef.current = null;
    }

    if (outputContextRef.current) {
      if (outputContextRef.current.state !== 'closed') {
        outputContextRef.current.close().catch(err => log('warn', 'Error closing outputContext', err));
      }
      outputContextRef.current = null;
    }
    
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setVibeStatus("Solicitando acesso...");

      // 1. Solicitar permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      setVibeStatus("Abrindo túnel neural...");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 2. Inicializar contextos de áudio
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Crucial para navegadores mobile: resumir após interação
      await inputCtx.resume();
      await outputCtx.resume();

      audioContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            log('info', 'Vibe Concierge session opened successfully');
            setVibeStatus("Sincronizado. Pode falar.");
            setIsActive(true);
            setIsConnecting(false);

            // Iniciar streaming do microfone
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              // Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, do not add other condition checks.
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current && outputContextRef.current.state !== 'closed') {
              const ctx = outputContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                // Fix: Access Set via .current property
                sourcesRef.current.add(source);
              } catch (e) {
                log('error', 'Audio decoding error', e);
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            log('error', 'Vibe Concierge connection error', e);
            setVibeStatus("Falha na Matriz B");
            cleanup();
          },
          onclose: (e) => {
            log('info', 'Vibe Concierge connection closed', e);
            setVibeStatus("Sessão Encerrada");
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'Você é o Vibe Concierge da Libido, uma rede social premium de lifestyle liberal. Sua voz deve ser sedutora, sofisticada, discreta e acolhedora. Ajude os usuários a entender as regras da comunidade, dê dicas de etiqueta liberal e como melhorar o perfil para atrair mais matches. Respostas curtas e envolventes.',
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (error: any) {
      log('error', 'Microphone or Session Access Denied', error);
      setIsConnecting(false);
      setVibeStatus("Acesso Negado (Microfone?)");
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-between p-12 animate-in fade-in zoom-in-95 duration-500">
      <button 
        onClick={() => { cleanup(); onClose(); }} 
        className="absolute top-8 right-8 p-3 bg-slate-900/50 rounded-full text-slate-500 hover:text-white transition-all hover:rotate-90"
      >
        <X size={24} />
      </button>

      <div className="text-center space-y-2 mt-12 animate-in slide-in-from-top-4">
        <h2 className="text-4xl font-black font-outfit text-white tracking-tighter italic flex items-center justify-center gap-3">
          <Sparkles className="text-pink animate-pulse" size={24} />
          VIBE CONCIERGE
        </h2>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${vibeStatus.includes('Falha') || vibeStatus.includes('Negado') ? 'text-rose-500' : 'text-slate-500'}`}>
          {vibeStatus}
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        <div className={`absolute w-72 h-72 rounded-full border-2 border-pink/5 transition-all duration-1000 ${isActive ? 'animate-ping opacity-20' : 'scale-0'}`} />
        <div className={`absolute w-64 h-64 rounded-full bg-pink/20 blur-[80px] transition-all duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
        
        <div className={`w-48 h-48 rounded-[3rem] border-2 flex items-center justify-center transition-all duration-700 ${isActive ? 'scale-110 border-pink shadow-[0_0_60px_rgba(255,20,147,0.4)]' : 'scale-100 border-white/5 bg-slate-900/50'}`}>
          <div className="w-32 h-32 rounded-[2.5rem] gradient-libido flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Volume2 size={48} className={`text-white z-10 ${isActive ? 'animate-bounce' : ''}`} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-8 text-center animate-in slide-in-from-bottom-4">
        <div className="space-y-3">
           <p className="text-slate-200 text-sm font-medium leading-relaxed italic px-4">
            {isActive ? "Túnel de voz seguro. O Concierge aguarda sua voz." : "Consultoria privativa por voz para elevar seu nível no lifestyle."}
          </p>
          <div className="flex justify-center gap-1">
            {isActive && [1,2,3,4,5].map(i => (
              <div key={i} className="w-1 bg-pink rounded-full animate-wave" style={{ height: '12px', animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isActive ? (
            <button 
              onClick={startSession}
              disabled={isConnecting}
              className="w-24 h-24 rounded-full gradient-libido flex items-center justify-center text-white shadow-[0_0_40px_rgba(255,20,147,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group"
            >
              {isConnecting ? (
                <Loader2 className="animate-spin" size={36} />
              ) : (
                <Mic size={36} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          ) : (
            <button 
              onClick={cleanup}
              className="w-24 h-24 rounded-full bg-slate-900 border-2 border-pink/30 flex items-center justify-center text-pink shadow-2xl hover:bg-pink/10 transition-all active:scale-95 group"
            >
              <StopCircle size={36} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {isActive ? "Encerrar Consultoria" : isConnecting ? "Codificando..." : "Toque para Falar"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 12px; }
          50% { height: 24px; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VibeVoice;
