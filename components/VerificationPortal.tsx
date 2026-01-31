
import React, { useState, useRef, useEffect } from 'react';
import { Camera, ShieldCheck, X, RefreshCw, Loader2, Sparkles, Fingerprint, Eye } from 'lucide-react';
import ActionButton from './common/ActionButton';
import { log, showNotification, saveUserData, cache } from '../services/authUtils';

interface VerificationPortalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const VerificationPortal: React.FC<VerificationPortalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'intro' | 'camera' | 'analyzing' | 'success'>('intro');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep('camera');
    } catch (err) {
      log('error', 'Falha ao acessar câmera', err);
      showNotification('Erro ao acessar câmera. Verifique as permissões.', 'error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndAnalyze = async () => {
    setStep('analyzing');
    // Simulação de progresso de escaneamento facial
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        finalizeVerification();
      }
    }, 150);
  };

  const finalizeVerification = async () => {
    // Fix: Type assertion to any used to avoid TypeScript errors ("Property does not exist on type '{}'") when accessing properties on cache.userData which might be null.
    const currentData = (cache.userData || {}) as any;
    const updated = {
      ...currentData,
      verifiedAccount: true,
      verificationScore: 100,
      badges: [...(currentData.badges || []), 'Verificado'],
      xp: (currentData.xp || 0) + 500
    };
    
    saveUserData(updated);
    stopCamera();
    setStep('success');
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <button 
        onClick={() => { stopCamera(); onClose(); }} 
        className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-sm space-y-8">
        {step === 'intro' && (
          <div className="text-center space-y-8 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-pink/10 rounded-[2.5rem] border border-pink/20 flex items-center justify-center mx-auto text-pink shadow-2xl shadow-pink/20">
              <Fingerprint size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white font-outfit uppercase italic tracking-tighter">Selo de Autenticidade</h2>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Para garantir a segurança da rede, realize o escaneamento facial. Isso aumentará seu <span className="text-pink font-bold">Trust Score</span> para 100%.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0"><ShieldCheck size={20} /></div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-tight">Privacidade Garantida: Imagem usada apenas para validação algorítmica.</p>
              </div>
              <ActionButton label="Iniciar Escaneamento" onClick={startCamera} icon={<Camera size={20} />} />
            </div>
          </div>
        )}

        {step === 'camera' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden border-4 border-pink/30 shadow-[0_0_50px_rgba(255,20,147,0.3)] bg-slate-900">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute inset-0 pointer-events-none border-[1.5rem] border-black/40">
                <div className="w-full h-full border-2 border-dashed border-pink/40 rounded-[2rem] animate-pulse" />
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-pink/50 shadow-[0_0_15px_#ff1493] animate-[scan_3s_ease-in-out_infinite]" />
            </div>
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Posicione seu rosto no centro</p>
              <ActionButton label="Capturar Matriz" onClick={captureAndAnalyze} icon={<Sparkles size={20} />} />
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="text-center space-y-8 animate-in zoom-in-95">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,20,147,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ff1493" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * scanProgress) / 100} className="transition-all duration-300" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Eye className="text-pink animate-pulse" size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Sincronizando...</h3>
              <p className="text-[10px] text-pink font-black uppercase tracking-widest animate-pulse">{scanProgress}% - Analisando pontos biométricos</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-8 animate-in zoom-in-95">
             <div className="w-24 h-24 bg-green-500/20 rounded-full border-2 border-green-500/30 flex items-center justify-center mx-auto text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
               <ShieldCheck size={48} />
             </div>
             <div className="space-y-2">
               <h3 className="text-3xl font-black text-white font-outfit uppercase italic tracking-tighter">PERFIL AUTENTICADO</h3>
               <p className="text-xs text-slate-400 italic">Você recebeu o selo de Verificação e +500 XP.</p>
             </div>
             <ActionButton label="Retornar à Matriz" onClick={() => { onSuccess(); onClose(); }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
};

export default VerificationPortal;
