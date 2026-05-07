
import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Explore from './components/Explore';
import ChatList from './components/ChatList';
import Profile from './components/Profile';
import Subscription from './components/Subscription';
import ChatDetail from './components/ChatDetail';
import Feed from './components/Feed';
import EventsPage from './components/EventsPage';
import Ranking from './components/Ranking';
import { soundService } from './services/soundService';
import { TermsGate } from './components/TermsGate';
import VerificationBanner from './components/VerificationBanner';
import AdminReports from './components/AdminReports';
import { GlobalSearch } from './components/GlobalSearch';
import { PhotoReminder } from './components/PhotoReminder';
import { shouldShowTermsGate, recordTermsAcceptance } from './services/termsGate';
import { AuthContext } from './hooks/useAuthContext';
import { User, Gender, SexualOrientation, Biotype, Vibes, Plan, TrustLevel, UserType } from './types';
import { MOCK_USERS } from './constants';
import { useAntiPrint } from './hooks/useAntiPrint';
import { Lock } from 'lucide-react';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData, log, authEvents } from './services/authUtils';
import { isUnlockedWindowValid, clearUnlockedWindow } from './services/pinService';
import { initSecurityLayer } from './services/securityService';
import { getProfileById } from './services/repo';

export default function App() {
  const isProtected = useAntiPrint();
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthFlag());
  const [isUnlocked, setIsUnlocked] = useState(isUnlockedWindowValid());
  const [activeTab, setActiveTab] = useState('feed'); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadStep, setLoadStep] = useState('Iniciando Matriz...');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const local = getUserData();
    if (local) cache.userData = local;
    return local;
  });

  const [showTerms, setShowTerms] = useState(false);
  const syncLock = React.useRef(false);
  const hasInitialSynced = React.useRef(false);

  const logout = React.useCallback(() => {
    setAuthFlag(false);
    clearUnlockedWindow();
    setIsAuthenticated(false);
    setIsUnlocked(false);
    setCurrentUser(null);
    localStorage.clear();
  }, []);

  const refreshSession = React.useCallback(async (immediate = false) => {
    if (syncLock.current && !immediate) return;
    syncLock.current = true;
    
    // Só mostra loading visual se for o sync inicial ou imediato
    if (!hasInitialSynced.current || immediate) {
        setIsSyncing(true);
    }

    try {
        await syncCaches();
        const auth = getAuthFlag();
        const unlocked = isUnlockedWindowValid();
        
        setIsAuthenticated(auth);
        setIsUnlocked(unlocked);
        setCurrentUser(cache.userData);
        hasInitialSynced.current = true;
    } finally {
        setIsSyncing(false);
        syncLock.current = false;
    }
  }, []);

  useEffect(() => {
    // Subscreve para atualizações de cache (ex: mudança de plano detectada pelo sync)
    const unsubscribe = authEvents.subscribe((user) => {
      setCurrentUser(user);
    });

    // Re-sincroniza ao ganhar foco (ex: usuário volta da página de pagamento)
    const handleFocus = () => {
       if (getAuthFlag()) refreshSession(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshSession]);

  useEffect(() => {
    setLoadStep('Verificando Camada de Segurança...');
    initSecurityLayer();

    let mounted = true;
    const initApp = async () => {
        const hasAuth = getAuthFlag();
        if (hasAuth && !hasInitialSynced.current) {
            try {
                setLoadStep('Sincronizando Identidade com Cloud...');
                // Aumentamos para 12s para suportar cold starts
                await Promise.race([
                    refreshSession(),
                    new Promise((_, r) => setTimeout(() => r(new Error('Sincronização excedeu tempo limite')), 12000))
                ]);
            } catch (e) {
                log('warn', 'Background Sync Delay', e);
            }
        }
        setLoadStep('Matriz pronta. Descriptografando interface...');
        if (mounted) setIsInitialLoading(false);
    };
    
    // Failsafe: Remove loading screen after 15 seconds no matter what
    const timer = setTimeout(() => {
        if (mounted) setIsInitialLoading(false);
    }, 15000);

    initApp();

    if (shouldShowTermsGate(new Date(), { version: '2026.1' })) {
      setShowTerms(true);
    }

    return () => {
        mounted = false;
        clearTimeout(timer);
    };
  }, [refreshSession]);

  const [radarResetKey, setRadarResetKey] = useState(0);
  const [profileRegistry, setProfileRegistry] = useState<Record<string, User>>({});

  const registerProfiles = React.useCallback((users: User[]) => {
    setProfileRegistry(prev => {
        const next = { ...prev };
        users.forEach(u => {
            if (u.id) next[u.id] = u;
        });
        return next;
    });
  }, []);

  const handleTabChange = (tab: string) => {
    // Limpa estados de detalhe de forma robusta ao trocar de aba principal
    if (typeof soundService?.play === 'function') soundService.play('TAP');
    
    // Se clicar na aba que já está ativa, forçamos um reset visual (efeito Refresh)
    if (tab === activeTab) {
        if (tab === 'radar') setRadarResetKey((prev: number) => prev + 1);
        return;
    }

    setSelectedUser(null);
    setViewedProfile(null);
    setActiveTab(tab);
  };

  const handleAcceptTerms = () => {
    recordTermsAcceptance('2026.1', 'app_entry');
    setShowTerms(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  const authContextValue = React.useMemo(() => ({
    logout,
    refreshSession,
    setIsUnlocked,
    setIsAuthenticated
  }), [logout, refreshSession]);

  const handleViewProfile = async (p: any) => {
    if (!p) return;

    let targetProfile = typeof p === 'object' ? p : null;
    const profileId = typeof p === 'string' ? p : p.id;

    if (!profileId) return;

    // 1. Tenta buscar no registro global (mais atualizado)
    if (profileRegistry[profileId]) {
        targetProfile = profileRegistry[profileId];
    } 
    // 2. Se for um ID de mock conhecido que não está no registro
    else if (profileId.startsWith('mock-')) {
        targetProfile = MOCK_USERS.find(u => u.id === profileId) || null;
    }

    // 3. Se ainda não temos o perfil completo, buscamos no repo
    if (!targetProfile || (!targetProfile.email && !targetProfile.serialNumber)) {
        log('info', `[APP] Buscando perfil completo via Matriz DB: ${profileId}`);
        try {
            const real = await getProfileById(profileId);
            if (real) {
                targetProfile = real;
                // Registra para futuras visualizações rápidas
                registerProfiles([real as any]);
            }
        } catch (e) {
            log('error', `[APP] Erro crítico ao localizar usuário real: ${profileId}`, e);
        }
    }

    if (!targetProfile) {
        log('warn', `[APP] Perfil ${profileId} não encontrado. Abortando navegação.`);
        return;
    }

    // Conversão segura do RadarProfile/Any para User completo
    const fullUser: User = {
      id: targetProfile.id, 
      nickname: targetProfile.nickname || targetProfile.name || 'Agente Anônimo', 
      email: targetProfile.email || `${targetProfile.id}@libido.app`, 
      age: targetProfile.age || 25, 
      avatar: targetProfile.avatar, 
      bio: targetProfile.bio || 'Sem biografia.',
      type: targetProfile.type || targetProfile.category || UserType.HOMEM, 
      birthDate: targetProfile.birthDate || '1995-01-01', 
      biotype: targetProfile.biotype || Biotype.PADRAO,
      gender: targetProfile.gender || Gender.MASCULINO, 
      sexualOrientation: targetProfile.sexualOrientation || SexualOrientation.BISSEXUAL, 
      vibes: targetProfile.vibes || [Vibes.LIBERAL],
      location: targetProfile.location || targetProfile.city || 'Brasil', 
      isOnline: true, 
      verifiedAccount: targetProfile.verifiedAccount || targetProfile.trustLevel === TrustLevel.OURO || false, 
      verificationScore: targetProfile.verificationScore || (targetProfile.trustLevel === TrustLevel.OURO ? 100 : 50), 
      xp: targetProfile.xp || 100, 
      level: targetProfile.level || 1,
      plan: targetProfile.plan || Plan.FREE, 
      matches: targetProfile.matches || [], 
      bookmarks: targetProfile.bookmarks || [], 
      blockedUsers: targetProfile.blockedUsers || [], 
      badges: targetProfile.badges || [], 
      boundaries: targetProfile.boundaries || [],
      behaviors: targetProfile.behaviors || [], 
      bodyMods: targetProfile.bodyMods || [], 
      bodyHair: targetProfile.bodyHair || 'Aparado', 
      bodyArt: targetProfile.bodyArt || [], 
      bondageExp: targetProfile.bondageExp || 'Iniciante',
      bucketList: targetProfile.bucketList || [], 
      bestMoments: targetProfile.bestMoments || [], 
      bestFeature: targetProfile.bestFeature || 'Olhar', 
      beveragePref: targetProfile.beveragePref || 'Gin', 
      bestTime: targetProfile.bestTime || 'Noite', 
      braveryLevel: targetProfile.braveryLevel || 7,
      busyMode: targetProfile.busyMode || false, 
      bookingPolicy: targetProfile.bookingPolicy || 'A combinar', 
      balance: targetProfile.balance || 0, 
      boosts_active: targetProfile.boosts_active || 0, 
      is_premium: targetProfile.is_premium || false, 
      height: targetProfile.height || 170,
      lat: targetProfile.lat || -23.5505, 
      lon: targetProfile.lon || -46.6333, 
      city: targetProfile.city || targetProfile.location || 'São Paulo', 
      neighborhood: targetProfile.neighborhood || 'Centro', 
      seenBy: targetProfile.seenBy || [],
      gallery: targetProfile.gallery || (targetProfile.avatar ? [{ id: `${targetProfile.id}-default`, url: targetProfile.avatar, timestamp: new Date().toISOString() }] : []),
      trustLevel: targetProfile.trustLevel || TrustLevel.BRONZE, 
      isGhostMode: targetProfile.isGhostMode || false, 
      hasBlurredGallery: targetProfile.hasBlurredGallery || (targetProfile.trustLevel === TrustLevel.OURO),
      vouches: targetProfile.vouches || [],
      following: targetProfile.following || [],
      lookingFor: targetProfile.lookingFor || [UserType.HOMEM, UserType.MULHER, UserType.CASAIS],
      rsvps: targetProfile.rsvps || [],
      isSubscriber: targetProfile.isSubscriber || false,
      dailyProfileViews: targetProfile.dailyProfileViews || 0,
      consentMatrix: targetProfile.consentMatrix || [
        { id: 'soft', label: 'Soft Swing', value: 'talvez' as any },
        { id: 'total', label: 'Troca Total', value: 'nao' as any },
        { id: 'menage', label: 'Ménage', value: 'sim' as any }
      ],
      vouchScore: targetProfile.vouchScore || 70,
      isStealthMode: targetProfile.isStealthMode || false,
      prefersBlurredPhotos: targetProfile.prefersBlurredPhotos || false,
      serialNumber: targetProfile.serialNumber || '000000'
    };
    setViewedProfile(fullUser);
    setActiveTab('view_profile');
  };

  const handleSearchSelect = async (profileId: string) => {
    try {
        const profile = await getProfileById(profileId);
        if (profile) {
            handleViewProfile(profile);
        }
    } catch (e) {
        log('error', 'Erro ao carregar perfil da busca', e);
    }
  };

  const renderContent = () => {
    // Rotas de detalhe que sobrepõem abas principais
    if (activeTab === 'chat_detail' && selectedUser) {
      return <ChatDetail user={selectedUser} currentUser={currentUser} onBack={() => handleTabChange('chat')} />;
    }

    if (activeTab === 'view_profile' && viewedProfile) {
      return <Profile user={viewedProfile} isOwnProfile={false} onBack={() => handleTabChange('radar')} />;
    }

    // Abas principais
    switch (activeTab) {
      case 'radar': 
      case 'view_profile': // Fallback se view_profile for atingido sem perfil selecionado
        return <Explore 
          key={`explore-radar-${radarResetKey}`} 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          onMatch={(u) => { setSelectedUser(u); setActiveTab('chat_detail'); }} 
          onProfileClick={handleViewProfile} 
          registerProfiles={registerProfiles}
        />;
      case 'ranking': return <Ranking onSelectUser={handleViewProfile} />;
      case 'events': return <EventsPage />;
      case 'feed': return <Feed onProfileClick={handleViewProfile} registerProfiles={registerProfiles} />;
      case 'chat': return <ChatList onSelectUser={(u) => { setSelectedUser(u); setActiveTab('chat_detail'); }} onNavigateToSubscription={() => handleTabChange('assinatura')} currentUser={currentUser} />;
      case 'admin_moderation': return <AdminReports />;
      case 'profile': 
      case 'profile_settings':
        return <Profile 
          user={currentUser || undefined} 
          isOwnProfile={true} 
          startEditing={activeTab === 'profile_settings'}
          onBack={() => handleTabChange('feed')} 
          onNavigate={handleTabChange} 
        />;
      case 'assinatura': return <Subscription currentUser={currentUser} />;
      default: return <Feed onProfileClick={handleViewProfile} />; 
    }
  };

  if (showTerms) {
    return (
      <div className={isProtected ? 'blurred pointer-events-none' : ''}>
        <TermsGate 
          privacyUrl="/privacy" 
          termsUrl="/terms" 
          onExit={handleExit} 
          onAccept={handleAcceptTerms} 
        />
      </div>
    );
  }

  if (isInitialLoading) {
      return (
          <div className={`min-h-screen bg-black flex flex-col items-center justify-center gap-6 transition-all ${isProtected ? 'blurred pointer-events-none' : ''}`}>
              <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <div className="text-center">
                  <p className="text-[14px] font-black text-amber-500 uppercase tracking-[0.5em] animate-pulse">LIBIDO 2026</p>
                  <p className="text-[8px] text-slate-500 uppercase mt-4 tracking-widest">{loadStep}</p>
              </div>
          </div>
      );
  }

  if (!isAuthenticated || !isUnlocked) {
    return (
      <AuthContext.Provider value={authContextValue}>
        <div className={isProtected ? 'blurred pointer-events-none' : ''}>
          <Auth />
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="relative w-full h-[100dvh] flex justify-center bg-black overflow-hidden">
        <div className={`w-full h-full flex flex-col blur-on-focus-loss transition-all duration-500 ${isProtected ? 'blurred' : ''}`}>
          <Layout 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            user={currentUser}
            onSearch={() => setIsSearchOpen(true)}
          >
            {renderContent()}
          </Layout>
        </div>

        <GlobalSearch 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onSelectProfile={handleSearchSelect} 
        />

        <PhotoReminder 
          isVisible={
            isAuthenticated && 
            !!currentUser && 
            (!currentUser.avatar || currentUser.avatar.includes('picsum.photos/seed')) &&
            activeTab !== 'profile_settings'
          }
          onUpdate={() => setActiveTab('profile_settings')}
        />
        
        {isProtected && (
          <div 
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-500 cursor-pointer"
            onClick={() => window.location.reload()} // Failsafe para resetar o estado se necessário ou apenas instrução
          >
             <div className="p-8 rounded-[3.5rem] bg-slate-900/80 border border-amber-500/30 flex flex-col items-center text-center space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
               <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                 <Lock size={40} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Matriz Blindada</h2>
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mt-2">Protocolo Antiprint</p>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                 Privacidade é nosso ativo mais valioso. Capturas de tela e gravação são proibidas.
               </p>
               <button 
                  onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
                  className="mt-2 px-6 py-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
               >
                 Tentar Novamente
               </button>
             </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}
