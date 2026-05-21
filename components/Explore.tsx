
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_USERS, MOCK_CURRENT_USER } from '../constants';
import { User, RadarProfile, UserType, PresenceStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Zap, Radio as RadioIcon, Target, Filter as FilterIcon, Building, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import { PresenceBadge } from './common/PresenceBadge';
import { SegmentedControl } from './common/SegmentedControl';
import { fetchLatestProfiles, likeProfile as dbLikeProfile, passProfile as dbPassProfile } from '../services/repo';
import { log, showNotification, saveUserData, cache } from '../services/authUtils';
import { soundService } from '../services/soundService';
import { getCurrentPosition, haversineKm } from '../services/geoService';
import RadarPage from '../radar/RadarPage';
import { fetchRadarProfiles } from '../radar/radarApi';
import { useUserLocation } from '../hooks/useUserLocation';
import { VenueList } from './VenueList';
import { usageService } from '../services/usageService';
import PaywallModal from './PaywallModal';
import FilterModal, { FilterState } from './FilterModal';

interface ExploreProps {
  onMatch?: (user: User) => void;
  onProfileClick?: (p: RadarProfile) => void;
  onChat?: (p: RadarProfile) => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}

const Explore: React.FC<ExploreProps> = ({ onMatch, onProfileClick, onChat, currentUser, setCurrentUser }) => {
  const [viewMode, setViewMode] = useState<'radar' | 'swipe' | 'venues'>('radar');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | 'up' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [radarProfiles, setRadarProfiles] = useState<RadarProfile[]>([]);
  const [isRadarLoading, setIsRadarLoading] = useState(false);
  const notifiedProfilesRef = React.useRef<Set<string>>(new Set());
  
  const { location: currentGeolocation, loading: isLocLoading } = useUserLocation();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'limit' | 'photos' | 'radar' | 'interaction'>('limit');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => {
    // Marcello: Sincronização Síncrona de Filtros (Protocolo Matrix)
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('libido_explore_filters');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.types && parsed.types.length > 0) return parsed;
            } catch (e) { /* fallback */ }
        }
    }
    return {
      types: [UserType.CASAIS, UserType.MULHER], // Default estratégico
      minTrust: 0,
      maxDistance: 100
    };
  });

  // Persistir filtros sempre que mudarem
  useEffect(() => {
    localStorage.setItem('libido_explore_filters', JSON.stringify(filters));
  }, [filters]);

  const handleProfileClick = (profile: any) => {
    if (!profile) return;
    
    // Suporte robusto para ID string ou Objeto de perfil
    const profileId = typeof profile === 'string' ? profile : (profile.id || profile.uid);
    if (!profileId) return;

    console.log('[EXPLORE] Perfil aberto:', profileId);

    if (usageService.canViewProfile(currentUser)) {
      if (!currentUser?.isSubscriber) {
        usageService.incrementView();
      }
      onProfileClick?.(profileId as any);
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

  const [realUsers, setRealUsers] = useState<RadarProfile[]>([]);

  useEffect(() => {
    const loadRealUsers = async () => {
      try {
        const users = await fetchLatestProfiles(50);
        // Marcello: Fallback para Mocks se o Supabase falhar ou retornar vazio
        if (!users || users.length === 0) {
          console.warn('[EXPLORE] Banco vazio ou erro, acionando MOCKS de segurança.');
          // Marcello: Garante que os mocks tenham a propriedade 'category' mapeada de 'type'
          setRealUsers(MOCK_USERS.map(u => ({ ...u, category: u.type }) as any));
        } else {
          setRealUsers(users);
        }
      } catch (e) {
        console.error('[EXPLORE] Falha crítica ao buscar perfis:', e);
        setRealUsers(MOCK_USERS.map(u => ({ ...u, category: u.type }) as any));
      }
    };
    loadRealUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    // Começamos com os usuários reais buscados
    let baseList = [...realUsers];
    
    // Embaralhamento estatístico
    for (let i = baseList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baseList[i], baseList[j]] = [baseList[j], baseList[i]];
    }

    return baseList.filter(user => {
      if (user.id === currentUser?.id) return false;
      
      const typeMatch = filters.types.includes(user.category as any);
      const trustMatch = (user.vouchScore || 0) >= filters.minTrust;

      let distanceMatch = true;
      if (effectiveUser.lat && effectiveUser.lon && user.lat && user.lon) {
        const dist = haversineKm(effectiveUser.lat, effectiveUser.lon, user.lat, user.lon);
        distanceMatch = dist <= filters.maxDistance;
      }

      return typeMatch && trustMatch && distanceMatch;
    });
  }, [filters, effectiveUser, currentUser?.id, realUsers]);

  const currentSwipeUser = useMemo(() => {
    if (filteredUsers.length === 0) return null;
    return filteredUsers[currentIndex % filteredUsers.length];
  }, [filteredUsers, currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filters]);

  useEffect(() => {
    let abortController = new AbortController();

    if (viewMode === 'radar' && currentGeolocation && currentUser?.id) {
      const loadRadar = async () => {
        setIsRadarLoading(true);
        try {
          const data = await fetchRadarProfiles({
            lat: currentGeolocation.lat,
            lon: currentGeolocation.lon,
            viewerId: currentUser.id,
            signal: abortController.signal
          });
          setRadarProfiles(data);
          if (currentUser?.pushVerifiedRadar5k) {
            data.forEach((p) => {
              const dist = p.distanceKm ?? 999;
              const isVerified = p.trustLevel === 'Ouro' || (p as any).verifiedAccount === true;
              if (isVerified && dist <= 5) {
                if (!notifiedProfilesRef.current.has(p.id)) {
                  notifiedProfilesRef.current.add(p.id);
                  showNotification(`[Radar 5km] ${p.name} (Verificado NoFake) está a ${dist.toFixed(1)}km de você`, 'info');
                }
              }
            });
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error('[EXPLORE] Radar fetch failed', err);
          }
        } finally {
          setIsRadarLoading(false);
        }
      };
      loadRadar();
    }

    return () => {
        abortController.abort();
    };
  }, [viewMode, currentGeolocation, currentUser?.id]);

  useEffect(() => {
    let isMounted = true;
    getCurrentPosition()
      .then(pos => {
        if (!isMounted) return;
        setUserLocation(pos);
        if (currentUser) {
            const updated = { ...currentUser, lat: pos.lat, lon: pos.lon };
            cache.userData = updated;
            // Marcello: saveUserData já notifica o App via AuthEvents
            // Não precisamos chamar setCurrentUser manualmente aqui para evitar loops de render
            saveUserData(updated);
            console.log('[EXPLORE] GPS Fix: Localização global sincronizada via Protocolo de Audit');
        }
      })
      .catch(err => log('warn', 'Geolocation failed', err));
    
    return () => { isMounted = false; };
  }, []);

  const handleLike = async () => {
    if (isProcessing || !currentSwipeUser) return;
    setIsProcessing(true);
    soundService.play('LIKE');

    try {
        const result = await dbLikeProfile(currentSwipeUser.id);
        setIsSwiping('right');
        setTimeout(() => {
            if ((result as any).isMatch) {
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
        await dbPassProfile(currentSwipeUser.id);
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

  const handleViewModeChange = (id: string) => {
    const mode = id as 'radar' | 'swipe' | 'venues';
    setViewMode(mode);
    soundService.play('TAP');
    
    // Se mudar para Lugares, tenta atualizar a posição para ser mais preciso
    if (mode === 'venues') {
        getCurrentPosition()
            .then(pos => {
                setUserLocation(pos);
                console.log('[EXPLORE] Localização atualizada para Check-in');
            })
            .catch(err => console.warn('[EXPLORE] GPS Update failed', err));
    }
  };

  return (
    <div className="p-4 flex flex-col items-center gap-6 animate-in fade-in duration-500 pb-28">
      <div className="w-full shrink-0 flex items-center gap-3">
        <div className="flex-1">
            <SegmentedControl 
              activeId={viewMode}
              onChange={handleViewModeChange}
              tabs={[
                { id: 'radar', label: 'Radar', icon: <RadioIcon /> },
                { id: 'swipe', label: 'Swipe', icon: <Zap /> },
                { id: 'venues', label: 'Vibe Grounds', icon: <Building /> }
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
        {viewMode === 'radar' && (
          <div className="relative">
            {(isRadarLoading || isLocLoading) && (
              <div className="absolute inset-x-0 top-20 flex flex-col items-center justify-center z-50 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border border-pink/20 flex items-center justify-center shadow-2xl shadow-pink/20">
                  <Loader2 className="animate-spin text-pink" size={32} />
                </div>
                <p className="mt-4 text-[10px] font-black text-pink uppercase tracking-[0.3em] animate-pulse">Sincronizando Radar...</p>
              </div>
            )}
            <RadarPage 
              onProfileClick={handleProfileClick} 
              onChat={onChat}
              profiles={radarProfiles}
              isFetching={isRadarLoading}
            />
          </div>
        )}
        
        {viewMode === 'venues' && (
          <VenueList userLocation={userLocation} userId={currentUser?.id || 'anonymous'} />
        )}

        {viewMode === 'swipe' && (
          filteredUsers.length > 0 && currentSwipeUser ? (
            <div className="w-full space-y-8 animate-in slide-in-from-bottom-5">
              <div 
                onClick={() => handleProfileClick(currentSwipeUser as any)}
                className={`relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border border-amber-500/10 transition-all duration-700 cursor-pointer ${isSwiping === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : isSwiping === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : isSwiping === 'up' ? '-translate-y-[150%] scale-110 opacity-0' : ''}`}
              >
                <img src={currentSwipeUser.avatar || undefined} alt={currentSwipeUser.nickname} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4 z-20">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-black text-white font-outfit italic tracking-tighter">{currentSwipeUser.nickname}</h2>
                    <PresenceBadge 
                      status={(currentSwipeUser as any).status || ((currentSwipeUser as any).isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE)} 
                      size="md" 
                    />
                    <span className="text-2xl text-white/50 font-outfit">{currentSwipeUser.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">{currentSwipeUser.type}</p>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} className="text-slate-500" />
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        {currentSwipeUser.city || currentSwipeUser.location || 'MATRIX'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <button onClick={handlePass} disabled={isProcessing} className="w-16 h-16 rounded-full bg-slate-900 border border-amber-500/10 text-slate-400 flex items-center justify-center hover:text-rose-500 transition-all hover:bg-rose-500/10 active:scale-90 shadow-xl"><X size={28} /></button>
                <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={handleLike} 
                    disabled={isProcessing} 
                    className="w-20 h-20 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl shadow-amber-500/40 hover:scale-110 transition-all"
                >
                    <motion.div
                        animate={{ scale: isProcessing && isSwiping === 'right' ? [1, 1.4, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Heart size={36} fill="black" />
                    </motion.div>
                </motion.button>
                <button 
                  onClick={() => currentSwipeUser && onChat?.(currentSwipeUser as any)} 
                  className="w-16 h-16 rounded-full bg-slate-900 border border-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500/10 active:scale-90 shadow-xl"
                  title="Falar na Matriz"
                >
                  <MessageCircle size={28} />
                </button>
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
              <div className="w-32 h-32 rounded-full p-1 bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] rotate-[-5deg]"><img src={effectiveUser.avatar || undefined} className="w-full h-full rounded-full object-cover border-4 border-slate-950" /></div>
              <div className="w-32 h-32 rounded-full p-1 bg-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.3)] rotate-[5deg]"><img src={currentSwipeUser?.avatar || undefined} className="w-full h-full rounded-full object-cover border-4 border-slate-950" /></div>
            </div>
            <button 
              onClick={() => { setShowMatchModal(false); if (currentSwipeUser) onMatch?.(currentSwipeUser as any); }} 
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
