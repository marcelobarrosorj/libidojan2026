
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import LibidoIcon from './common/LibidoIcon';
import { User } from '../types';
import { saveUserData } from '../services/authUtils';

import { CityAutocomplete } from './common/CityAutocomplete';

interface CityGateProps {
  user: User;
  onComplete: (user: User) => void;
}

export const CityGate: React.FC<CityGateProps> = ({ user, onComplete }) => {
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se o usuário já tem cidade, não mostra o gate (failsafe)
  if (user.city && user.city.trim().length >= 2) return null;

  const handleSubmit = async () => {
    if (!city || city.trim().length < 2) {
      setError('A cidade é obrigatória para continuar na Matriz.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simula uma pequena latência para efeito visual de "sincronização"
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, city: city.trim().toUpperCase() };
      saveUserData(updatedUser);
      onComplete(updatedUser);
    } catch (err) {
      setError('Falha na sincronização. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-none" />
        
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 relative z-10"
        >
          <div className="space-y-4">
            <div className="mx-auto flex flex-col items-center">
              <LibidoIcon size={64} glow className="mb-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                Protocolo Local
              </h2>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">
                Obrigatório para Todos os Agentes
              </p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] space-y-6 backdrop-blur-xl">
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Para garantir a precisão do Radar e a segurança da comunidade, precisamos saber em qual <span className="text-white font-bold italic">Cidade</span> você opera.
            </p>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-amber-500/60 uppercase block text-left ml-4 tracking-widest">
                Sua Cidade Atual
              </label>
              <div className="relative">
                <CityAutocomplete 
                  value={city}
                  onChange={(val) => setCity(val)}
                  placeholder="DIGITE SUA CIDADE..."
                />
              </div>
              {error && (
                <p className="text-[10px] text-rose-500 font-bold uppercase animate-bounce pt-2">
                  {error}
                </p>
              )}
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full h-16 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:opacity-50 text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Confirmar Localização <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-600">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Dados protegidos pela Matriz
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
