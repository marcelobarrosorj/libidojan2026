
import React, { useEffect, useState, useMemo } from 'react';
import RadarList from './RadarList';
import RadarCircle from './RadarCircle';
import { mockRadarProfiles } from './mockData';
import type { RadarProfile } from './types';
import { MAX_RADIUS_KM, haversineKm, formatDistanceLabel } from './geo';
import { useUserLocation } from '../hooks/useUserLocation';
import { Radio, Layers, Target, Loader2, Info, Search, ZoomIn, Crown, MapPin, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { cache, isPremiumUser } from '../services/authUtils';
import { Plan, Venue } from '../types';
import { venueService } from '../services/venueService';

export default function RadarPage({ 
    onProfileClick, 
    onUpgrade 
}: { 
    onProfileClick?: (p: RadarProfile) => void;
    onUpgrade?: () => void;
}) {
  const { location } = useUserLocation();
  const userPlan = cache.userData?.plan || Plan.FREE;
  const isPremium = isPremiumUser(cache.userData);
  
  const [radiusKm, setRadiusKm] = useState<number>(isPremium ? 50 : 15); 
  const [viewMode, setViewMode] = useState<'circle' | 'list'>('circle');
  const [profiles, setProfiles] = useState<RadarProfile[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  // Check-in state
  const [showVenueSelector, setShowVenueSelector] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentCheckIn, setCurrentCheckIn] = useState(venueService.getCurrentCheckIn());

  const MOCK_CENTER = { lat: -23.5505, lon: -46.6333 };
  const center = useMemo(() => ({
    lat: location?.lat ?? MOCK_CENTER.lat,
    lon: location?.lon ?? MOCK_CENTER.lon
  }), [location]);

  useEffect(() => {
    const loadVenues = async () => {
      const data = await venueService.getVenues();
      setVenues(data);
    };
    loadVenues();
  }, []);

  const handleCheckIn = async (venueId: string) => {
    if (!cache.userData?.id) return;
    const ci = await venueService.checkIn(cache.userData.id, venueId);
    setCurrentCheckIn(ci);
    setShowVenueSelector(false);
  };

  const handleCheckOut = async () => {
    await venueService.checkOut();
    setCurrentCheckIn(null);
  };

  const checkedVenue = venues.find(v => v.id === currentCheckIn?.venueId);

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

      {/* Check-in Section (Conecte Style) */}
      <div className="space-y-4">
        {!currentCheckIn ? (
          <button 
            onClick={() => setShowVenueSelector(true)}
            className="w-full relative overflow-hidden group p-5 bg-gradient-to-r from-pink/5 to-purple-500/5 rounded-[2rem] border border-pink/10 hover:border-pink/30 transition-all flex items-center justify-between"
          >
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-pink/10 rounded-2xl flex items-center justify-center text-pink group-hover:scale-110 transition-transform">
                 <MapPin size={24} />
               </div>
               <div className="text-left">
                 <h3 className="text-white font-bold text-sm">Fazer Check-in</h3>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Encontre pessoas no mesmo local</p>
               </div>
             </div>
             <ChevronRight className="text-slate-700 group-hover:text-pink transition-colors" />
             <div className="absolute top-0 right-0 w-24 h-24 bg-pink/5 blur-3xl rounded-full" />
          </button>
        ) : (
          <div className="p-5 bg-emerald-500/[0.03] rounded-[2rem] border border-emerald-500/10 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <CheckCircle2 size={24} />
               </div>
               <div className="text-left">
                 <h3 className="text-white font-bold text-sm tracking-tight">Presente em: <span className="text-emerald-500">{checkedVenue?.name}</span></h3>
                 <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-widest">Visível na lista de convidados</p>
               </div>
             </div>
             <button 
              onClick={handleCheckOut}
              className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
             >
               <X size={16} />
             </button>
          </div>
        )}
      </div>

      {/* Profile Discovery Logic */}
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
              max={isPremium ? MAX_RADIUS_KM : 15} 
              value={radiusKm} 
              onChange={(e) => setRadiusKm(Number(e.target.value))} 
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink" 
          />
          <div className="flex justify-between mt-2 text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">
            <span>1 KM</span>
            <span>{isPremium ? MAX_RADIUS_KM : 15} KM</span>
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
      
      {/* Venue Selector Modal */}
      {showVenueSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowVenueSelector(false)} />
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4 flex justify-between items-start">
               <div>
                 <h2 className="text-2xl font-black text-white italic tracking-tight">Vibe Locations</h2>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Selecione onde você está agora</p>
               </div>
               <button onClick={() => setShowVenueSelector(false)} className="p-2 bg-white/5 rounded-full text-white">
                 <X size={20} />
               </button>
            </div>
            
            <div className="px-4 pb-8 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {venues.map(venue => (
                <div 
                  key={venue.id}
                  onClick={() => handleCheckIn(venue.id)}
                  className="group relative flex items-center gap-4 p-4 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  <img src={venue.image} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt={venue.name} />
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{venue.name}</h4>
                    <p className="text-[9px] text-slate-500 uppercase font-black">{venue.category}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[10px] text-emerald-500 font-bold">{venue.checkInCount} na Vibe</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-700 group-hover:text-pink transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
