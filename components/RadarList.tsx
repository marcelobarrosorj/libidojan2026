
import React from 'react';
import { MapPin, ChevronRight, Navigation, Loader2, Zap, ShieldCheck, Crown } from 'lucide-react';
import { RadarProfile, RadarResultItem, TrustLevel } from '../types';
import { formatDistanceLabel } from '../radar/geo';

interface RadarListProps {
  profiles: RadarProfile[];
  loading?: boolean;
  onSelectProfile?: (id: string) => void;
}

export function RadarList({ profiles, loading, onSelectProfile }: RadarListProps) {
  // Filtra usuários que estão em modo Ghost (a menos que já sejam matches ou o próprio sistema force a exibição)
  const visibleProfiles = profiles.filter(p => !p.isGhostMode);

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500">
      {loading && (
        <div className="flex items-center gap-2 px-4 py-3 bg-pink/5 rounded-2xl border border-pink/10 mb-4 animate-pulse">
           <Loader2 size={14} className="animate-spin text-pink" />
           <p className="text-[10px] font-black text-pink uppercase tracking-widest">Varrendo frequências próximas...</p>
        </div>
      )}

      {visibleProfiles.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-50">
          <Navigation size={48} className="text-slate-800 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            Frequência Silenciosa...
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleProfiles.map((p) => {
            const item = p as RadarResultItem;
            const bravery = p.braveryLevel || 5;
            const isOuro = p.trustLevel === TrustLevel.OURO;
            
            return (
              <div 
                key={p.id} 
                onClick={() => onSelectProfile?.(p.id)}
                className={`glass-card group flex items-center justify-between p-4 rounded-[2.5rem] border-white/5 transition-all cursor-pointer active:scale-[0.98] shadow-2xl relative overflow-hidden ${
                  isOuro ? 'ring-2 ring-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent' : 'hover:border-pink/20 hover:bg-pink/[0.02]'
                }`}
              >
                {/* Efeito de Brilho Neon para Ouro */}
                {isOuro && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent opacity-50 animate-pulse pointer-events-none" />
                )}

                <div className="flex items-center gap-4 flex-1 min-w-0 z-10">
                  <div className="relative shrink-0">
                    <div className={`w-20 h-20 rounded-[1.8rem] overflow-hidden border shadow-xl ${isOuro ? 'border-amber-500 shadow-amber-500/20' : 'border-slate-800'}`}>
                      <img 
                        src={p.avatar || 'https://picsum.photos/seed/placeholder/400/400'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={p.name} 
                      />
                    </div>
                    {/* Trust Badge Indicator */}
                    <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full bg-slate-950 border flex items-center justify-center shadow-2xl ${
                        isOuro ? 'border-amber-500 text-amber-500' : p.trustLevel === TrustLevel.PRATA ? 'border-slate-300 text-slate-300' : 'border-pink/50 text-pink'
                    }`}>
                        {isOuro ? <Crown size={12} fill="currentColor" /> : <ShieldCheck size={12} />}
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-black font-outfit italic tracking-tight uppercase group-hover:text-pink transition-colors truncate max-w-[120px] ${isOuro ? 'text-amber-400' : 'text-white'}`}>
                        {p.name}
                      </h4>
                      {p.category && (
                        <span className="text-[8px] bg-pink/10 text-pink px-2 py-0.5 rounded-full font-black tracking-widest uppercase shrink-0 border border-pink/10">
                          {p.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={10} className="text-pink/60 shrink-0" />
                      <p className="text-[9px] font-bold uppercase tracking-widest truncate">
                        {formatDistanceLabel(item.distanceKm || 0)} • {item.locationLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full shadow-[0_0_8px_rgba(255,20,147,0.5)] ${isOuro ? 'bg-amber-500 shadow-amber-500/50' : 'bg-pink'}`} 
                                style={{ width: `${bravery * 10}%` }}
                            />
                        </div>
                        <span className={`text-[8px] font-black uppercase ${isOuro ? 'text-amber-500' : 'text-pink'}`}>Audácia</span>
                    </div>
                  </div>
                </div>

                <div className={`p-2 transition-all translate-x-1 group-hover:translate-x-0 shrink-0 z-10 ${isOuro ? 'text-amber-500' : 'text-slate-800 group-hover:text-pink'}`}>
                  <ChevronRight size={20} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
