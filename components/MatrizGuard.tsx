
import React from 'react';
import { Lock, Crown, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import ActionButton from './common/ActionButton';
import { Plan } from '../types';

interface MatrizGuardProps {
  featureName: string;
  requiredPlan: Plan;
  onUpgrade: () => void;
  onClose: () => void;
}

const MatrizGuard: React.FC<MatrizGuardProps> = ({ featureName, requiredPlan, onUpgrade, onClose }) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm glass-card rounded-[3.5rem] p-10 border-pink/20 shadow-[0_0_50px_rgba(255,20,147,0.2)] text-center space-y-8 relative overflow-hidden">
        
        {/* Efeito de Luz de Fundo */}
        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-pink/10 blur-[80px] rounded-full animate-pulse" />
        
        <div className="relative space-y-4">
          <div className="w-20 h-20 bg-pink/10 rounded-[2rem] border border-pink/20 flex items-center justify-center mx-auto text-pink shadow-2xl">
            <Lock size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white font-outfit uppercase italic tracking-tighter">ACESSO RESTRITO</h3>
            <p className="text-[10px] text-pink font-black uppercase tracking-[0.3em]">Recurso de Matriz Nível {requiredPlan}</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed italic">
            O recurso <span className="text-white font-bold">"{featureName}"</span> é exclusivo para membros da elite. Sincronize sua matriz para desbloquear o poder total.
          </p>
          
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 space-y-2 text-left">
            <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-green-500" /> Criptografia de Ponta
            </div>
            <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <Sparkles size={14} className="text-amber-500" /> Vantagem Competitiva
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <ActionButton 
            label={`Upgrade para ${requiredPlan}`} 
            onClick={onUpgrade} 
            icon={<Crown size={18} />} 
          />
          <button 
            onClick={onClose}
            className="w-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            Talvez mais tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatrizGuard;
