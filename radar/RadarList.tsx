
import React, { useState } from 'react';
import type { RadarProfile } from './types';
import { MapPin, Lock, Crown, Sparkles, ShieldAlert, MessageCircle } from 'lucide-react';
import { Plan, PresenceStatus } from '../types';
import { PresenceBadge } from '../components/common/PresenceBadge';
import { cache } from '../services/authUtils';
import { formatDistanceLabel, haversineKm } from './geo';
import { motion, AnimatePresence } from 'motion/react';

const RadarList: React.FC<{
  profiles: RadarProfile[];
  loading: boolean;
  onSelectProfile?: (p: RadarProfile) => void;
  onUpgrade?: () => void;
  onChat?: (p: RadarProfile) => void;
}> = ({ profiles, loading, onSelectProfile, onUpgrade, onChat }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Marcello: Interceptação de Dados Críticos na Listagem
  const processedProfiles = profiles.map(p => {
    const pName = String(p.name || (p as any).nickname || '').toLowerCase();
    const pId = String(p.id || '');
    
    if (pName.includes('casalx') || pId === '65a8d3a4-24b1-47d6-aec4-6819710abae8') {
        const viewerLat = cache.userData?.lat || -22.5231;
        const viewerLon = cache.userData?.lon || -44.1042;
        const dist = haversineKm(viewerLat, viewerLon, -22.9031, -43.5590);
        return { 
            ...p, 
            distanceKm: dist, 
            locationLabel: 'Campo Grande, RJ' 
        };
    }
    return p;
  });

  if (loading && processedProfiles.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 animate-pulse">
        <div className="w-10 h-10 border-2 border-pink/20 border-t-pink rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizando frequências...</p>
      </div>
    );
  }

  const handleProfilePress = (p: RadarProfile) => {
    const isLocked = (p as any).isLocked;
    if (isLocked) {
        onUpgrade?.();
        return;
    }

    setSelectedId(p.id);
    // Delay navigation to allow selection animation to be visible
    setTimeout(() => {
        onSelectProfile?.(p);
        setSelectedId(null);
    }, 400);
  };

  return (
    <div className="grid gap-4 w-full relative">
      {/* Background Dim Layer when something is selected */}
      <AnimatePresence>
        {selectedId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {processedProfiles.map((p, idx) => {
        const isLocked = (p as any).isLocked;
        const isSelected = selectedId === p.id;
        const isHighlighted = !selectedId && idx === 0; // The first card is the "central focus" by default
        
        return (
          <motion.div 
            key={p.id} 
            layout
            initial={false}
            animate={{
              scale: isSelected ? 1.05 : (selectedId ? 0.95 : (isHighlighted ? 1.02 : 1)),
              opacity: isSelected ? 1 : (selectedId ? 0.3 : 1),
              filter: (selectedId && !isSelected) ? 'blur(4px)' : 'blur(0px)',
              zIndex: isSelected ? 50 : 10
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => handleProfilePress(p)}
            className={`flex items-center gap-4 bg-slate-900/40 p-5 rounded-[2.5rem] border transition-all relative overflow-hidden group ${
              isLocked 
                ? 'border-white/5 cursor-default' 
                : `border-white/5 ${isHighlighted ? 'border-pink/30 shadow-[0_0_20px_rgba(255,20,147,0.1)]' : 'hover:border-pink/20'} cursor-pointer active:scale-[0.98]`
            }`}
          >
            {/* Attraction Effect Glow for Central/Highlighted Card */}
            {isHighlighted && !selectedId && (
              <div className="absolute inset-0 bg-gradient-to-r from-pink/5 to-transparent animate-pulse pointer-events-none" />
            )}

            <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-2xl overflow-hidden border border-slate-800 transition-all duration-700 relative ${isLocked ? 'blur-xl grayscale opacity-50' : ''}`}>
                    <img 
                        src={p.avatar || undefined} 
                        className="w-full h-full object-cover" 
                        alt={isLocked ? 'Bloqueado' : p.name} 
                    />
                    {!isLocked && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md py-0.5 flex items-center justify-center">
                            <span className="text-[6px] font-black text-white uppercase tracking-tighter">
                                {formatDistanceLabel(p.distanceKm || 0)}
                            </span>
                        </div>
                    )}
                </div>
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center text-pink">
                        <Lock size={16} className="drop-shadow-lg" />
                    </div>
                )}
                {!isLocked && (
                    <PresenceBadge 
                      status={p.status || PresenceStatus.OFFLINE} 
                      size="sm" 
                      className="absolute -top-1 -right-1 z-20" 
                    />
                )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col mb-1">
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
              
              {/* Conecte Style: Presence Indicator */}
              {!isLocked && p.status && p.status !== PresenceStatus.OFFLINE && (
                <div className="flex items-center gap-1.5 mt-1.5">
                   <PresenceBadge status={p.status} size="sm" showText className="opacity-80" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isLocked && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onChat?.(p); }}
                  className="p-3 bg-white/5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 rounded-2xl transition-all active:scale-90"
                  title="Conversar"
                >
                  <MessageCircle size={18} />
                </button>
              )}

              {isLocked ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpgrade?.(); }}
                    className="bg-pink/10 text-pink p-2.5 rounded-xl hover:bg-pink hover:text-white transition-all"
                  >
                      <Crown size={14} />
                  </button>
              ) : (
                  <div className={`transition-all duration-300 ${isSelected ? 'text-pink scale-125 rotate-12' : 'text-slate-700 group-hover:text-pink'}`}>
                      <Sparkles size={16} />
                  </div>
              )}
            </div>

            {/* Overlay de distorção para perfis bloqueados */}
            {isLocked && (
                <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
            )}
          </motion.div>
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
};

export default RadarList;
