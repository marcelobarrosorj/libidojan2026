
import React, { useMemo } from 'react';
import type { RadarProfile } from './types';
import { TrustLevel, HeatZone } from '../types';
import { Lock } from 'lucide-react';

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

  const visibleProfiles = profiles.filter(p => !(p as any).isGhostMode);

  const points = useMemo(() => {
    return visibleProfiles.map((p) => {
      const angle = hashToUnit(p.id) * Math.PI * 2;
      const dist = p.distanceKm ?? 0;
      const r = Math.min(dist / radiusKm, 1);
      const rr = 0.12 + r * 0.76;
      
      const x = 50 + Math.cos(angle) * rr * 50;
      const y = 50 + Math.sin(angle) * rr * 50;
      return { p, x, y };
    });
  }, [visibleProfiles, radiusKm]);

  return (
    <div style={{
      width: 'min(90vw, 420px)',
      aspectRatio: '1/1',
      borderRadius: '50%',
      border: '1px solid rgba(255, 20, 147, 0.2)',
      background: 'radial-gradient(circle at center, #0a0a0a 0%, #050505 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
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

      {[0.25, 0.5, 0.75].map(v => (
        <div key={v} style={{ 
          position: 'absolute', 
          inset: `${(1 - v) * 50}%`, 
          borderRadius: '50%', 
          border: '1px solid rgba(255, 20, 147, 0.05)',
          pointerEvents: 'none' 
        }} />
      ))}
      
      <div style={{ 
        position: 'absolute', 
        left: '50%', 
        top: '50%', 
        width: 12, 
        height: 12, 
        marginLeft: -6, 
        marginTop: -6, 
        borderRadius: '50%', 
        background: '#ff1493', 
        boxShadow: '0 0 20px #ff1493', 
        zIndex: 20,
        border: '2px solid white'
      }} />

      {points.map(({ p, x, y }) => {
          const isLocked = (p as any).isLocked;
          const isOuro = (p as any).trustLevel === TrustLevel.OURO;
          
          return (
            <button
              key={p.id}
              onClick={() => !isLocked && onProfileClick?.(p)}
              disabled={isLocked}
              className={`group transition-all duration-500 ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
              style={{ 
                position: 'absolute', 
                left: `${x}%`, 
                top: `${y}%`, 
                width: 32, 
                height: 32, 
                marginLeft: -16, 
                marginTop: -16, 
                zIndex: 15,
              }}
            >
              <div className="relative w-full h-full">
                <div className={`
                  w-full h-full rounded-full border-2 flex items-center justify-center transition-all overflow-hidden
                  ${isLocked 
                    ? 'border-white/5 bg-slate-900/50' 
                    : (isOuro ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'border-pink bg-slate-900')}
                `}>
                  {isLocked ? (
                    <Lock size={10} className="text-slate-700" />
                  ) : (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  )}
                </div>
                
                {!isLocked && (
                  <div className={`
                    absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-30
                    ${isOuro ? 'bg-amber-500' : 'bg-pink'}
                  `} />
                )}
                
                {!isLocked && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[8px] text-white font-black uppercase tracking-widest transition-opacity pointer-events-none">
                    {p.name.split(' ')[0]} • {p.distanceLabel}
                  </div>
                )}
              </div>
            </button>
          );
      })}
    </div>
  );
}
