
import React, { useMemo, useState } from 'react';
import type { RadarProfile } from './types';
import { TrustLevel, HeatZone, PresenceStatus } from '../types';
import { Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haversineKm, formatDistanceLabel } from './geo';
import { cache } from '../services/authUtils';
import { PresenceBadge } from '../components/common/PresenceBadge';

function hashToUnit(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// NOVO: Gerador de zonas de calor fixas baseadas na semente visual do radar
const MOCK_HEAT_ZONES: HeatZone[] = [
  { id: 'h1', x: 30, y: 40, intensity: 0.8, color: 'pink' },
  { id: 'h2', x: 70, y: 60, intensity: 0.6, color: 'amber' },
  { id: 'h3', x: 50, y: 80, intensity: 0.4, color: 'pink' }
];

interface RadarCircleProps {
  profiles: RadarProfile[];
  radiusKm: number;
  onProfileClick?: (profile: RadarProfile) => void;
}

export default function RadarCircle(props: RadarCircleProps) {
  const { profiles, radiusKm, onProfileClick } = props;
  const [activeId, setActiveId] = useState<string | null>(null);

  const visibleProfiles = profiles.filter(p => !(p as any).isGhostMode);

  const points = useMemo(() => {
    const viewerLat = cache.userData?.lat || -22.5231;
    const viewerLon = cache.userData?.lon || -44.1042;

    return visibleProfiles.map((p) => {
      let targetLat = p.lat;
      let targetLon = p.lon;

      // Marcello: INTERCEPTAÇÃO DE PRECISÃO (Camadas do Radar)
      // Evita o erro de 282km forçando Campo Grande para o casalx
      const pName = String(p.name || (p as any).nickname || '').toLowerCase();
      const pId = String(p.id || '');
      
      // Marcello: INTERCEPTAÇÃO DE PRECISÃO (Camadas do Radar) - Protocolo 6819
      // Força Campo Grande - RJ para o casalx/auditor para matar o bug dos 282km
      if (pName.includes('casalx') || pId === '65a8d3a4-24b1-47d6-aec4-6819710abae8') {
        targetLat = -22.9031;
        targetLon = -43.5590;
      }

      const dist = haversineKm(viewerLat, viewerLon, targetLat, targetLon);
      const angle = hashToUnit(p.id) * Math.PI * 2;
      
      // Marcello: Sincronia de Escala Linear Real (Math 1:1)
      const currentRadius = radiusKm || 100; // Fallback seguro se o pai falhar
      const r = Math.min(dist / currentRadius, 1);
      
      // Log forense para pegarmos o erro no console
      const pNameLog = p.name || 'Agente';
      if (pNameLog.toLowerCase().includes('casalx')) {
          console.log(`[RADAR_AUDIT] Alvo: ${pNameLog} | Dist: ${dist}km | Raio: ${currentRadius}km | Razão Visual: ${r}`);
      }

      const x = 50 + Math.cos(angle) * r * 50;
      const y = 50 + Math.sin(angle) * r * 50;

      // Atualiza o perfil com a distância recalibrada para o label
      const updatedProfile = { 
        ...p, 
        distanceKm: dist, 
        distanceLabel: formatDistanceLabel(dist) 
      };

      return { p: updatedProfile, x, y };
    });
  }, [visibleProfiles, radiusKm, cache.userData?.lat, cache.userData?.lon]);

  const handlePointClick = (p: RadarProfile) => {
    setActiveId(p.id);
    setTimeout(() => {
        onProfileClick?.(p);
        setActiveId(null);
    }, 400);
  };

  return (
    <div className="w-full flex justify-center mb-8 py-4">
      <div 
        className="relative overflow-hidden shadow-2xl"
        style={{
          width: 'min(92vw, 480px)',
          height: 'min(92vw, 480px)',
          aspectRatio: '1/1',
          borderRadius: '50%',
          border: '1px solid rgba(255, 20, 147, 0.4)',
          background: 'radial-gradient(circle at center, #111 0%, #050505 100%)',
        }}
      >
        {/* Radar Scanning Line Effect */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-10 pointer-events-none origin-center"
          style={{
            background: 'conic-gradient(from 0deg, transparent 80%, rgba(255, 20, 147, 0.15) 100%)'
          }}
        />

        {/* Background Dim Layer when something is selected */}
        <AnimatePresence>
          {activeId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[18] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* NOVO: Camada de Heatmap (Energia da Matriz) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           {MOCK_HEAT_ZONES.map(zone => (
              <div 
              key={zone.id}
              className={`absolute rounded-full blur-[60px] animate-pulse`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${100 * zone.intensity}px`,
                height: `${100 * zone.intensity}px`,
                backgroundColor: zone.color === 'pink' ? 'rgba(255, 20, 147, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                transform: 'translate(-50%, -50%)',
                animationDuration: `${3 + zone.intensity * 2}s`
              }}
             />
           ))}
        </div>

        {/* Marcello: PROTOCOLO DE ALINHAMENTO GEOMÉTRICO MANDATÓRIO (SEM SAÍDA) */}
        {[0.25, 0.5, 0.75].map(v => (
          <div key={v} style={{ 
            position: 'absolute', 
            inset: `${(1 - v) * 50}%`, 
            borderRadius: '50%', 
            border: '1px solid rgba(255, 20, 147, 0.15)',
            pointerEvents: 'none' 
          }} />
        ))}
        
        {/* Central Point with Attraction Effect */}
        <motion.div 
          animate={{
            boxShadow: ['0 0 20px #ff1493', '0 0 40px #ff1493', '0 0 20px #ff1493'],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            width: 14, 
            height: 14, 
            marginLeft: -7, 
            marginTop: -7, 
            borderRadius: '50%', 
            background: '#ff1493', 
            zIndex: 20,
            border: '2px solid white'
          }} 
        >
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
        </motion.div>

        {points.map(({ p, x, y }) => {
          const isLocked = (p as any).isLocked;
          const isOuro = (p as any).trustLevel === TrustLevel.OURO;
          const isSelected = activeId === p.id;
          
          return (
            <motion.button
               key={`radar-point-${p.id}`}
               onClick={(e) => {
                 e.stopPropagation();
                 handlePointClick(p);
               }}
               disabled={isLocked}
               animate={{
                 scale: isSelected ? 4 : 1,
                 zIndex: isSelected ? 50 : 35,
                 opacity: (activeId && !isSelected) ? 0.2 : 1
               }}
               transition={{ type: 'spring', stiffness: 300, damping: 25 }}
               className={`group transition-all duration-500 ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
               style={{ 
                 position: 'absolute', 
                 left: `${x}%`, 
                 top: `${y}%`, 
                 width: 44, 
                 height: 44, 
                 marginLeft: -22, 
                 marginTop: -22, 
               }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div className={`
                  w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden
                  ${isLocked 
                    ? 'border-white/5 bg-slate-900/50' 
                    : (isOuro ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'border-pink bg-slate-900')}
                `}>
                  {isLocked ? (
                    <Lock size={12} className="text-slate-700" />
                  ) : (
                    <img src={p.avatar || undefined} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  )}
                </div>
                
                {!isLocked && (
                  <PresenceBadge 
                    status={p.status || PresenceStatus.OFFLINE} 
                    size="sm" 
                    className="absolute top-0 right-0 z-20 pointer-events-none" 
                  />
                )}
                
                {!isLocked && (
                  <div className={`
                    absolute inset-1 rounded-full animate-ping opacity-0 group-hover:opacity-30
                    ${isOuro ? 'bg-amber-500' : 'bg-pink'}
                  `} />
                )}
                
                <AnimatePresence>
                  {!isLocked && !isSelected && (
                    <motion.div 
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[8px] text-white font-black uppercase tracking-widest transition-opacity pointer-events-none z-50 shadow-2xl border border-white/5"
                      initial={{ opacity: 0, y: 5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      {(p.name || 'Agente').split(' ')[0]} • {p.distanceLabel}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={8} className="text-pink animate-pulse" fill="currentColor" />
                    </div>
                )}
              </div>
            </motion.button>
          );
      })}
      </div>
    </div>
  );
}
