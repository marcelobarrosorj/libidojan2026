
import React, { useEffect, useState, useMemo } from 'react';
import RadarList from './RadarList';
import RadarCircle from './RadarCircle';
import { mockRadarProfiles } from './mockData';
import type { RadarProfile } from './types';
import { MAX_RADIUS_KM, haversineKm, formatDistanceLabel } from './geo';
import { useUserLocation } from '../hooks/useUserLocation';
// Added Crown to imports to fix the error on line 122
import { Radio, Layers, Target, Loader2, Info, Search, ZoomIn, Crown } from 'lucide-react';
import { cache } from '../services/authUtils';
import { Plan } from '../types';

export default function RadarPage({ 
    onProfileClick, 
    onUpgrade 
}: { 
    onProfileClick?: (p: RadarProfile) => void;
    onUpgrade?: () => void;
}) {
  const { location } = useUserLocation();
  const userPlan = cache.userData?.plan || Plan.FREE;
  const isPremium = userPlan !== Plan.FREE;
  
  // Limita o raio máximo do slider se for Free
  const maxSliderRadius = isPremium ? MAX_RADIUS_KM : 15;
  const [radiusKm, setRadiusKm] = useState<number>(isPremium ? 50 : 15); 
  
  const [viewMode, setViewMode] = useState<'circle' | 'list'>('circle');
  const [profiles, setProfiles] = useState<RadarProfile[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const MOCK_CENTER = { lat: -23.5505, lon: -46.6333 };
  const center = useMemo(() => ({
    lat: location?.lat ?? MOCK_CENTER.lat,
    lon: location?.lon ?? MOCK_CENTER.lon
  }), [location]);

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      try {
        const { queryRadar } = await import('../services/radarService');
        const data = await queryRadar({ 
          viewerId: 'me', 
          viewerLat: center.lat, 
          viewerLon: center.lon,
          plan: userPlan
        });
        
        if (data && data.length > 0) {
          setProfiles(data as RadarProfile[]);
        }
      } catch (e) {
        console.error('Radar fetch failed', e);
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [center, userPlan]);

  return (
    <div className="p-6 space-y-8 pb-32 max-w-lg mx-auto bg-[#050505] min-h-screen relative animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-3xl font-black font-outfit text-white tracking-tighter italic flex items-center gap-2">
            <Radio size={24} className="text-pink animate-pulse" /> RADAR
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
            {isFetching ? 'Escaneando Matriz...' : 'Conexões Ativas'}
          </p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setViewMode('circle')} 
            className={`p-2 rounded-xl transition-all ${viewMode === 'circle' ? 'bg-pink text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            title="Visualização em Círculo"
          >
            <Target size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-pink text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            title="Visualização em Lista"
          >
            <Layers size={18} />
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem] border-white/5 space-y-4 shadow-inner relative overflow-hidden group">
        <div className="flex justify-between items-center z-10 relative">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-pink" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Alcance da Matriz</span>
          </div>
          <div className="bg-pink/10 px-3 py-1 rounded-full border border-pink/20">
            <span className="text-xs font-black text-pink italic font-outfit">{radiusKm} km</span>
          </div>
        </div>

        <div className="relative pt-2 pb-1 z-10">
          <input 
              type="range" 
              min="1" 
              max={maxSliderRadius} 
              value={radiusKm} 
              onChange={(e) => setRadiusKm(Number(e.target.value))} 
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink" 
          />
          <div className="flex justify-between mt-2 text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">
            <span>1 KM</span>
            <span>{maxSliderRadius} KM</span>
          </div>
        </div>
        
        {!isPremium && (
          <div 
            onClick={onUpgrade}
            className="flex items-center justify-center gap-2 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-all"
          >
            <Crown size={12} className="text-amber-500" />
            <p className="text-[8px] text-amber-500 font-black uppercase animate-pulse">
                Upgrade para expandir sinal até 250km
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center w-full">
          {viewMode === 'circle' ? (
            <RadarCircle 
                profiles={profiles} 
                radiusKm={radiusKm} 
                onProfileClick={onProfileClick} 
            />
          ) : (
            <RadarList 
                profiles={profiles} 
                loading={isFetching} 
                onSelectProfile={(id) => {
                    const p = profiles.find(x => x.id === id);
                    if (p) onProfileClick?.(p);
                }} 
                onUpgrade={onUpgrade}
            />
          )}
      </div>
    </div>
  );
}
