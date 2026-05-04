import React from 'react';
import { motion } from 'motion/react';
import { Shield, EyeOff, Calculator, Newspaper, AppWindow } from 'lucide-react';

interface StealthModeProps {
  isActive: boolean;
  onToggle: () => void;
}

const StealthModeToggle: React.FC<StealthModeProps> = ({ isActive, onToggle }) => {
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isActive ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'} transition-all`}>
            <Shield size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tighter">Modo Disfarce (Stealth)</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Camuflagem do Ícone e Notificações</p>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className={`w-12 h-6 rounded-full relative transition-all ${isActive ? 'bg-amber-500' : 'bg-slate-700'}`}
        >
          <motion.div
            animate={{ x: isActive ? 24 : 4 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-xl"
          />
        </button>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-3 pt-4 border-t border-white/5"
        >
          {[
            { id: 'calc', icon: <Calculator size={18} />, label: 'Calculadora' },
            { id: 'news', icon: <Newspaper size={18} />, label: 'Notícias' },
            { id: 'stock', icon: <AppWindow size={18} />, label: 'Finanças' },
            { id: 'stealth', icon: <EyeOff size={18} />, label: 'Oculto' }
          ].map((mode) => (
            <button
              key={mode.id}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              <div className="text-slate-400">{mode.icon}</div>
              <span className="text-[7px] font-black uppercase text-slate-500 tracking-tighter">{mode.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      <p className="text-[9px] text-slate-600 mt-2 leading-relaxed italic">
        * Quando ativado, o ícone do aplicativo será alterado na tela inicial e as notificações serão mascaradas como "Sistema atualizado".
      </p>
    </div>
  );
};

export default StealthModeToggle;
