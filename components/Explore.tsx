
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_USERS, MOCK_CURRENT_USER } from '../constants';
import { User, RadarProfile } from '../types';
import { X, Heart, Zap, Radio as RadioIcon, Target } from 'lucide-react';
import { log, likeProfile, passProfile, showNotification } from '../services/authUtils';
import { soundService } from '../services/soundService';
import { getCurrentPosition } from '../services/geoService';
import RadarPage from '../radar/RadarPage';
import SonarPage from '../sonar/SonarPage';

interface ExploreProps {
  onMatch?: (user: User) => void;
  onProfileClick?: (p: RadarProfile) => void;
}

const Explore: React.FC<ExploreProps> = ({ onMatch, onProfileClick }) => {
  const [viewMode, setViewMode] = useState<'sonar' | 'radar' | 'swipe'>('radar');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | 'up' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const currentSwipeUser = MOCK_USERS[currentIndex];

  useEffect(() => {
    getCurrentPosition()
      .then(pos => setUserLocation(pos))
      .catch(err => log('warn', 'Geolocation failed', err));
  }, []);

  const effectiveUser = useMemo(() => ({
    ...MOCK_CURRENT_USER,
    lat: userLocation?.lat ?? MOCK_CURRENT_USER.lat,
    lon: userLocation?.lon ?? MOCK_CURRENT_USER.lon
  }), [userLocation]);

  const handleLike = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    soundService.play('LIKE');

    try {
        const result = await likeProfile(currentSwipeUser.id);
        setIsSwiping('right');
        setTimeout(() => {
            if (result.isMatch) {
                soundService.play('MATCH');
                setShowMatchModal(true);
            } else {
                proceedToNext();
            }
        }, 450);
    } catch (error: any) {
        setIsProcessing(false);
    }
  };

  const handleSuperLike = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsSwiping('up');
    soundService.play('MATCH');
    
    showNotification('SUPER LIKE ENVIADO! 🔥', 'success');
    setTimeout(() => { proceedToNext(); }, 600);
  };

  const handlePass = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
        await passProfile(currentSwipeUser.id);
        setIsSwiping('left');
        setTimeout(() => proceedToNext(), 450);
    } catch (error: any) {
        setIsProcessing(false);
    }
  };

  const proceedToNext = () => {
    setIsSwiping(null);
    setCurrentIndex((currentIndex + 1) % MOCK_USERS.length);
    setIsProcessing(false);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-6 animate-in fade-in duration-500 pb-28">
      <div className="flex bg-slate-900/50 p-1.5 rounded-3xl border border-amber-500/10 w-full shrink-0 shadow-2xl">
        <button onClick={() => setViewMode('sonar')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'sonar' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}><Target size={14} /> Sonar</button>
        <button onClick={() => setViewMode('radar')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'radar' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}><RadioIcon size={14} /> Radar</button>
        <button onClick={() => setViewMode('swipe')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'swipe' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}><Zap size={14} /> Swipe</button>
      </div>

      <div className="w-full flex-1">
        {viewMode === 'sonar' && <SonarPage />}
        {viewMode === 'radar' && <RadarPage onProfileClick={onProfileClick} />}
        
        {viewMode === 'swipe' && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-5">
            <div 
              onClick={() => onProfileClick?.(currentSwipeUser as any)}
              className={`relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border border-amber-500/10 transition-all duration-700 cursor-pointer ${isSwiping === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : isSwiping === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : isSwiping === 'up' ? '-translate-y-[150%] scale-110 opacity-0' : ''}`}
            >
              <img src={currentSwipeUser.avatar} alt={currentSwipeUser.nickname} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4 z-20">
                <div className="flex items-center gap-2">
                  <h2 className="text-4xl font-black text-white font-outfit italic tracking-tighter">{currentSwipeUser.nickname}</h2>
                  <span className="text-2xl text-white/50 font-outfit">{currentSwipeUser.age}</span>
                </div>
                <p className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">{currentSwipeUser.type}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button onClick={handlePass} disabled={isProcessing} className="w-16 h-16 rounded-full bg-slate-900 border border-amber-500/10 text-slate-400 flex items-center justify-center hover:text-rose-500 transition-all hover:bg-rose-500/10 active:scale-90 shadow-xl"><X size={28} /></button>
              <button onClick={handleLike} disabled={isProcessing} className="w-20 h-20 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl shadow-amber-500/40 hover:scale-110 active:scale-95 transition-all"><Heart size={36} fill="black" /></button>
              <button onClick={handleSuperLike} disabled={isProcessing} className="w-16 h-16 rounded-full bg-slate-900 border border-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500/10 active:scale-90 transition-all shadow-xl"><Zap size={28} fill="currentColor" /></button>
            </div>
          </div>
        )}
      </div>

      {showMatchModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
          <div className="max-w-xs w-full text-center space-y-10">
            <h2 className="text-6xl font-black text-white font-outfit italic tracking-tighter scale-110">MATCH!</h2>
            <div className="flex justify-center -space-x-6">
              <div className="w-32 h-32 rounded-full p-1 bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] rotate-[-5deg]"><img src={effectiveUser.avatar} className="w-full h-full rounded-full object-cover border-4 border-slate-950" /></div>
              <div className="w-32 h-32 rounded-full p-1 bg-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.3)] rotate-[5deg]"><img src={currentSwipeUser.avatar} className="w-full h-full rounded-full object-cover border-4 border-slate-950" /></div>
            </div>
            <button 
              onClick={() => { setShowMatchModal(false); onMatch?.(currentSwipeUser); }} 
              className="w-full bg-amber-500 py-5 rounded-2xl font-black text-black shadow-xl text-lg uppercase tracking-widest active:scale-95 transition-all"
            >
              Mandar Mensagem
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
