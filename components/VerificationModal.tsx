
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserCheck, Smartphone, Globe, X, Check, Lock, Info, Fingerprint, Camera, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { saveUserData, showNotification } from '../services/authUtils';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, user }) => {
  const [step, setStep ] = useState<'menu' | 'identity' | 'photo' | 'social'>('menu');
  const [loading, setLoading] = useState(false);

  const levels = [
    { 
      id: 'identity', 
      title: 'Identidade Real', 
      desc: 'Verificação via documento oficial para garantir que você é quem diz ser.', 
      icon: UserCheck, 
      status: user.verificationLevels?.identity,
      color: 'bg-blue-500',
      points: 40
    },
    { 
      id: 'photo', 
      title: 'Selfie ao Vivo', 
      desc: 'Validação biométrica facial para confirmar que as fotos do perfil são suas.', 
      icon: Camera, 
      status: user.verificationLevels?.photo,
      color: 'bg-amber-500',
      points: 30
    },
    { 
      id: 'social', 
      title: 'Vínculo Social', 
      desc: 'Conexão com redes sociais externas para aumentar sua confiabilidade.', 
      icon: Globe, 
      status: user.verificationLevels?.social,
      color: 'bg-indigo-500',
      points: 20
    },
    { 
      id: 'trust', 
      title: 'Selo de Confiança', 
      desc: 'Receba "vouches" de outros membros verificados da comunidade.', 
      icon: ShieldCheck, 
      status: user.verificationLevels?.trust,
      color: 'bg-pink',
      points: 10,
      readOnly: true
    }
  ];

  const handleVerify = (id: string) => {
    if (id === 'trust') return;
    setLoading(true);
    // Simulate verification process
    setTimeout(() => {
      const newLevels = { ...user.verificationLevels, [id]: true };
      const newScore = (user.verificationScore || 0) + (levels.find(l => l.id === id)?.points || 0);
      
      saveUserData({ 
        ...user, 
        verificationLevels: newLevels as any,
        verificationScore: Math.min(100, newScore),
        verifiedAccount: Object.values(newLevels).filter(v => v).length >= 2
      });
      
      setLoading(false);
      showNotification(`${id === 'identity' ? 'Identidade' : id === 'photo' ? 'Foto' : 'Rede Social'} verificada com sucesso!`, 'success');
    }, 2000);
  };

  const totalScore = user.verificationScore || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-gradient-to-br from-slate-900/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <ShieldCheck className="text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">NoFake Verification</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Aumente sua credibilidade na rede</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Trust Score Gauge */}
              <div className="relative h-4 w-full bg-slate-900 rounded-full overflow-hidden mb-8 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalScore}%` }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                />
                <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest drop-shadow-md">
                    Trust Score: {totalScore}%
                  </span>
                </div>
              </div>

              {/* Levels */}
              <div className="space-y-4">
                {levels.map((level) => (
                  <div 
                    key={level.id}
                    className={`group relative p-4 rounded-3xl border transition-all duration-300 ${
                      level.status 
                        ? 'bg-slate-900/20 border-green-500/20' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${level.status ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                        <level.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold transition-colors ${level.status ? 'text-green-500' : 'text-slate-200'}`}>
                            {level.title}
                          </h4>
                          {level.status && <Check size={14} className="text-green-500" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {level.desc}
                        </p>
                      </div>
                      
                      {!level.status && !level.readOnly && (
                        <button
                          onClick={() => handleVerify(level.id)}
                          disabled={loading}
                          className="px-4 py-1.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                        >
                          Verificar
                        </button>
                      )}
                      
                      {level.readOnly && !level.status && (
                        <div className="p-2 text-slate-600">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Info */}
              <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 items-start">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-500/80 leading-relaxed italic">
                  O sistema NoFake utiliza criptografia ponta-a-ponta e não armazena cópias de seus documentos após a validação. Membros com score acima de 80% têm 5x mais engajamento.
                </p>
              </div>
            </div>
          </motion.div>

          {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-black text-xs uppercase mt-4 tracking-widest animate-pulse">Processando dados...</p>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default VerificationModal;
