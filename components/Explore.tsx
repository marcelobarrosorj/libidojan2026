
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_USERS, MOCK_CURRENT_USER } from '../constants';
import { User, RadarProfile, UserType } from '../types';
import { X, Heart, Zap, Radio as RadioIcon, Target, Filter as FilterIcon } from 'lucide-react';
import { SegmentedControl } from './common/SegmentedControl';
import { log, likeProfile, passProfile, showNotification, saveUserData } from '../services/authUtils';
import { soundService } from '../services/soundService';
import { getCurrentPosition, haversineKm } from '../services/geoService';
import RadarPage from '../radar/RadarPage';
import { usageService } from '../services/usageService';
import PaywallModal from './PaywallModal';
import FilterModal, { FilterState } from './FilterModal';

interface ExploreProps {
  onMatch?: (user: User) => void;
  onProfileClick?: (p: RadarProfile) => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}

const Explore: React.FC<ExploreProps> = ({ onMatch, onProfileClick, currentUser, setCurrentUser }) => {
  const [viewMode, setViewMode] = useState<'radar' | 'swipe'>('radar');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | 'up' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'limit' | 'photos' | 'radar' | 'interaction'>('limit');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    types: currentUser?.lookingFor || [UserType.CASAIS, UserType.MULHER, UserType.HOMEM, UserType.GRUPO],
    minTrust: 0,
    maxDistance: 100
  });

  const handleProfileClick = (profile: RadarProfile) => {
    if (usageService.canViewProfile(currentUser)) {
      if (!currentUser?.isSubscriber) {
        usageService.incrementView();
      }
      onProfileClick?.(profile);
    } else {
      setPaywallReason('limit');
      setShowPaywall(true);
    }
  };
  
  const effectiveUser = useMemo(() => {
    const base = currentUser || MOCK_CURRENT_USER;
    return {
      ...base,
      lat: userLocation?.lat ?? base.lat,
      lon: userLocation?.lon ?? base.lon
    };
  }, [currentUser, userLocation]);

  const filteredUsers = useMemo(() => {
    // Embaralhamos a lista base para evitar que os mesmos perfis (ex: Ana e Bruno) apareçam sempre primeiro
    const baseList = [...MOCK_USERS].sort(() => Math.random() - 0.5);

    return baseList.filter(user => {
      // Basic type check
      const typeMatch = filters.types.includes(user.type);
      
      // Trust check
      const trustMatch = (user.vouchScore || 0) >= filters.minTrust;

      // Distance check
      let distanceMatch = true;
      if (effectiveUser.lat && effectiveUser.lon && user.lat && user.lon) {
        const dist = haversineKm(effectiveUser.lat, effectiveUser.lon, user.lat, user.lon);
        distanceMatch = dist <= filters.maxDistance;
      }

      return typeMatch && trustMatch && distanceMatch;
    });
  }, [filters, effectiveUser]);

  const currentSwipeUser = useMemo(() => {
    if (filteredUsers.length === 0) return null;
    return filteredUsers[currentIndex % filteredUsers.length];
  }, [filteredUsers, currentIndex]);

  useEffect(() => {
    getCurrentPosition()
      .then(pos => setUserLocation(pos))
      .catch(err => log('warn', 'Geolocation failed', err));
  }, []);

  const handleLike = async () => {
    if (isProcessing || !currentSwipeUser) return;
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
    if (isProcessing || !currentSwipeUser) return;
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
    if (filteredUsers.length > 0) {
      setCurrentIndex((currentIndex + 1) % filteredUsers.length);
    }
    setIsProcessing(false);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-6 animate-in fade-in duration-500 pb-28">
      <div className="w-full shrink-0 flex items-center gap-3">
        <div className="flex-1">
            <SegmentedControl 
              activeId={viewMode}
              onChange={(id) => setViewMode(id as 'radar' | 'swipe')}
              tabs={[
                { id: 'radar', label: 'Radar', icon: <RadioIcon /> },
                { id: 'swipe', label: 'Swipe', icon: <Zap /> }
              ]}
            />
        </div>
        <button 
            onClick={() => setShowFilter(true)}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-amber-500 shadow-xl transition-all active:scale-95"
        >
            <FilterIcon size={20} />
        </button>
      </div>

      <div className="w-full flex-1">
        {viewMode === 'radar' && <RadarPage onProfileClick={handleProfileClick} />}
        
        {viewMode === 'swipe' && (
          filteredUsers.length > 0 && currentSwipeUser ? (
            <div className="w-full space-y-8 animate-in slide-in-from-bottom-5">
              <div 
                onClick={() => handleProfileClick(currentSwipeUser as any)}
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
          ) : (
            <div className="w-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-900/20 border border-white/5 rounded-[3rem] animate-in fade-in">
              <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-amber-500/20 border border-amber-500/10 mb-2">
                <Target size={48} />
              </div>
              <h3 className="text-xl font-black text-white font-outfit uppercase tracking-tighter italic">Nenhum sinal detectado</h3>
              <p className="text-slate-400 text-sm max-w-[200px] font-medium leading-relaxed">
                Aumente seu radar ou ajuste suas preferências para encontrar novas conexões.
              </p>
            </div>
          )
        )}
      </div>

      {showMatchModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
          <div className="max-w-xs w-full text-center space-y-10">
            <h2 className="text-6xl font-black text-white font-outfit italic tracking-tighter scale-110">MATCH!</h2>
            <div className="flex justify-center -space-x-6">
              <div className="w-32 h-32 rounded-full p-1 bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] rotate-[-5deg]"><img src={effectiveUser.avatar} className="w-full h-full rounded-full object-cover border-4 border-slate-950" /></div>
              <div className="w-32 h-32 rounded-full p-1 bg-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.3)] rotate-[5deg]"><img src={currentSwipeUser?.avatar} className="w-full h-full rounded-full object-cover border-4 border-slate-950" /></div>
            </div>
            <button 
              onClick={() => { setShowMatchModal(false); if (currentSwipeUser) onMatch?.(currentSwipeUser); }} 
              className="w-full bg-amber-500 py-5 rounded-2xl font-black text-black shadow-xl text-lg uppercase tracking-widest active:scale-95 transition-all"
            >
              Mandar Mensagem
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal 
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={setFilters}
        currentFilters={filters}
      />

      {/* Paywall Overlay */}
      <PaywallModal 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason={paywallReason}
        onUpgrade={() => {
            if (currentUser) {
              const updatedUser = { ...currentUser, isSubscriber: true };
              setCurrentUser(updatedUser);
              saveUserData(updatedUser);
              showNotification('Parabéns! Sua conta agora é Premium.', 'success');
            }
        }}
      />

      {/* Indicator for remaining views */}
      <ExploreFooter 
        remaining={usageService.getRemainingViews()} 
        isSubscriber={currentUser?.isSubscriber || false} 
      />
    </div>
  );
};

const ExploreFooter: React.FC<{ remaining: number, isSubscriber: boolean }> = ({ remaining, isSubscriber }) => {
  if (isSubscriber) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-2 z-50">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">
        {remaining} visualizações restantes hoje
      </span>
    </div>
  );
};

export default Explore;
