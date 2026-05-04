import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, QrCode as QrCodeIcon, Loader2, ShieldCheck, Crown, ArrowLeft } from 'lucide-react';
import { soundService } from '../services/soundService';
import { showNotification } from '../services/authUtils';

interface PixCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: string;
  planName?: string;
}

const PixCheckout: React.FC<PixCheckoutProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount = "29,90",
  planName = "Membro Ouro"
}) => {
  const [step, setStep] = useState<'generate' | 'paying' | 'success'>('generate');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const pixKey = "libidoapp@gmail.com";

  useEffect(() => {
    if (!isOpen) {
      setStep('generate');
      setTimeLeft(600);
      return;
    }

    if (timeLeft > 0 && step === 'paying') {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, timeLeft, step]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    showNotification('Código Pix copiado!', 'success');
    soundService.play('MATCH');
    setStep('paying');
  };

  const simulatePayment = () => {
    setStep('success');
    soundService.play('MATCH');
    setTimeout(() => {
      onSuccess();
    }, 2500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
        >
          {step !== 'success' && (
            <button 
              onClick={onClose}
              className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="p-8 pt-12 flex flex-col items-center text-center">
            {step === 'success' ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center py-12"
              >
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                    <Check size={48} className="text-white" strokeWidth={4} />
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pagamento Confirmado!</h2>
                <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">Bem-vindo à Matriz Premium</p>
                
                <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <Crown size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ACESSO LIBERADO</span>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
                     <QrCodeIcon size={32} className="text-amber-500" />
                </div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Finalizar Assinatura</h2>
                <div className="mt-2 text-slate-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <span className="text-white">{planName}</span>
                    <span className="opacity-20">|</span>
                    <span className="text-amber-500">R$ {amount}</span>
                </div>

                <div className="mt-8 bg-white p-4 rounded-3xl w-full aspect-square flex items-center justify-center relative group">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`} 
                        alt="Pix QR Code" 
                        className="w-full h-full opacity-80"
                    />
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors rounded-3xl" />
                </div>

                <div className="mt-6 w-full space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-left">Chave Copia-e-Cola</p>
                    <div className="flex items-center gap-3">
                         <div className="flex-1 text-[10px] text-slate-300 font-mono truncate text-left">{pixKey}</div>
                         <button 
                            onClick={copyToClipboard}
                            className="p-2 bg-amber-500 rounded-lg text-black hover:bg-amber-400 transition-colors"
                         >
                            <Copy size={14} />
                         </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 size={12} className="animate-spin" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Aguardando Pagamento</span>
                    </div>
                    <div className="text-amber-500 text-[10px] font-black tabular-nums">
                        {formatTime(timeLeft)}
                    </div>
                  </div>

                  <button 
                    onClick={simulatePayment}
                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5"
                  >
                    Já realizei o pagamento
                  </button>
                  
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <div className="flex items-center justify-center gap-2 text-slate-600">
                        <ShieldCheck size={12} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Pagamento 100% Seguro via Pix</span>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[7px] text-slate-500 font-black uppercase tracking-tighter mb-1">Dúvidas ou problemas?</p>
                        <a href="mailto:libidoapp@gmail.com" className="text-[8px] text-amber-500/80 font-black uppercase tracking-widest hover:text-amber-500 transition-colors">
                            libidoapp@gmail.com
                        </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PixCheckout;
