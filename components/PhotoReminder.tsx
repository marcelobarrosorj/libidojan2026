
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, AlertCircle, ArrowRight } from 'lucide-react';

interface PhotoReminderProps {
  isVisible: boolean;
  onUpdate: () => void;
}

export const PhotoReminder: React.FC<PhotoReminderProps> = ({ isVisible, onUpdate }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[90]"
        >
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(225,29,72,0.3)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Camera className="text-rose-500" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={12} className="text-rose-500" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Protocolo de Segurança</h4>
                </div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-tight mb-2">Identidade Incompleta</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  A Matriz detectou que seu perfil não possui foto real. <span className="text-rose-500">O envio é obrigatório</span> para manter seu acesso NoFake ativo.
                </p>
                <button 
                  onClick={onUpdate}
                  className="mt-4 w-full py-3 bg-amber-500 rounded-2xl flex items-center justify-center gap-2 text-black font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-all"
                >
                  Atualizar Agora <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
