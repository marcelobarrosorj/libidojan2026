
import React from 'react';
import type { RadarProfile } from './types';
import { MapPin, Lock, Crown, Sparkles, ShieldAlert } from 'lucide-react';
import { Plan } from '../types';
import { cache } from '../services/authUtils';
import { formatDistanceLabel } from './geo';

export default function RadarList({ profiles, loading, onSelectProfile, onUpgrade }: { 
  profiles: RadarProfile[]; 
  loading: boolean; 
  onSelectProfile?: (id: string) => void;
  onUpgrade?: () => void;
}) {
  if (loading && profiles.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 animate-pulse">
        <div className="w-10 h-10 border-2 border-pink/20 border-t-pink rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizando frequências...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 w-full">
      {profiles.map((p, idx) => {
        const isLocked = (p as any).isLocked;
        
        return (
          <div 
            key={p.id} 
            onClick={() => isLocked ? onUpgrade?.() : onSelectProfile?.(p.id)}
            className={`flex items-center gap-4 bg-slate-900/40 p-5 rounded-[2.5rem] border transition-all relative overflow-hidden group ${
              isLocked 
                ? 'border-white/5 cursor-default' 
                : 'border-white/5 hover:border-pink/20 cursor-pointer active:scale-[0.98]'
            }`}
          >
            <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-2xl overflow-hidden border border-slate-800 transition-all duration-700 ${isLocked ? 'blur-xl grayscale opacity-50' : ''}`}>
                    <img 
                        src={p.avatar} 
                        className="w-full h-full object-cover" 
                        alt={isLocked ? 'Bloqueado' : p.name} 
                    />
                </div>
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center text-pink">
                        <Lock size={16} className="drop-shadow-lg" />
                    </div>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className={`text-sm font-bold text-white truncate italic ${isLocked ? 'opacity-30' : ''}`}>
                    {isLocked ? 'Sinal não sincronizado' : p.name}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin size={10} className="text-pink/60 shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-widest truncate">
                  {isLocked 
                    ? 'Upgrade necessário' 
                    : `${formatDistanceLabel(p.distanceKm || 0)} • ${p.locationLabel}`
                  }
                </span>
              </div>
            </div>

            {isLocked ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpgrade?.(); }}
                  className="bg-pink/10 text-pink p-2.5 rounded-xl hover:bg-pink hover:text-white transition-all"
                >
                    <Crown size={14} />
                </button>
            ) : (
                <div className="text-slate-700 group-hover:text-pink transition-colors">
                    <Sparkles size={16} />
                </div>
            )}

            {/* Overlay de distorção para perfis bloqueados */}
            {isLocked && (
                <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
            )}
          </div>
        );
      })}
      
      {profiles.some(p => (p as any).isLocked) && (
        <div className="mt-4 p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] text-center space-y-3">
            <div className="flex justify-center text-amber-500">
                <ShieldAlert size={24} />
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">
                Existem mais {profiles.length - 1} conexões próximas
            </p>
            <p className="text-[9px] text-slate-400 leading-relaxed italic">
                Sincronize sua matriz para liberar o radar completo e visualizar todos os perfis no raio de 250km.
            </p>
            <button 
                onClick={onUpgrade}
                className="w-full py-3 gradient-libido rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-pink/20"
            >
                Liberar Radar Completo
            </button>
        </div>
      )}
    </div>
  );
}
