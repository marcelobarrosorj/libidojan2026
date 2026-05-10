
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import LibidoIcon from './components/common/LibidoIcon';
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
import { CityGate } from './components/CityGate';
import VerificationBanner from './components/VerificationBanner';
import AdminReports from './components/AdminReports';
import { GlobalSearch } from './components/GlobalSearch';
import { PhotoReminder } from './components/PhotoReminder';
import { shouldShowTermsGate, recordTermsAcceptance } from './services/termsGate';
import { AuthContext } from './hooks/useAuthContext';
import { User, Gender, SexualOrientation, Biotype, Vibes, Plan, TrustLevel, UserType } from './types';
import { MOCK_USERS, MOCK_POSTS } from './constants';
import { useAntiPrint } from './hooks/useAntiPrint';
import { Lock } from 'lucide-react';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData, log, authEvents, showNotification } from './services/authUtils';
import { isUnlockedWindowValid, clearUnlockedWindow } from './services/pinService';
import { initSecurityLayer, getWatermarkData } from './services/securityService';
import { getProfileById } from './services/repo';

export default function App() {
  const isProtected = useAntiPrint();
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthFlag());
  const [isUnlocked, setIsUnlocked] = useState(isUnlockedWindowValid());
  const [activeTab, setActiveTab] = useState('feed'); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
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

  // 1. POPULAÇÃO INICIAL DO REGISTRO (Garante que Mocks tenham dados completos)
  useEffect(() => {
    setProfileRegistry(prev => {
        const next = { ...prev };
        
        // Adiciona Mocks Base
        if (MOCK_USERS) {
            MOCK_USERS.forEach(u => {
                if (u.id) next[u.id] = u;
            });
        }

        // Adiciona usuários dos Posts (se não existirem)
        if (MOCK_POSTS) {
            MOCK_POSTS.forEach(p => {
                if (!p.userId) return;
                if (!next[p.userId]) {
                    next[p.userId] = {
                        id: p.userId,
                        nickname: p.user,
                        avatar: p.avatar,
                        age: p.age,
                        type: UserType.HOMEM,
                        gallery: []
                    } as any;
                }
            });
        }

        return next;
    });
  }, []);

  const registerProfiles = React.useCallback((users: User[]) => {
    setProfileRegistry(prev => {
        const next = { ...prev };
        users.forEach(u => {
            if (!u.id) return;
            const existing = next[u.id];
            
            // Nunca destrua um cache com fotos usando um parcial sem fotos
            const hasLib = (usr: any) => usr?.gallery && usr.gallery.length > 0;
            
            if (!existing || (hasLib(u) && !hasLib(existing))) {
                next[u.id] = { ...existing, ...u };
            } else if (!hasLib(existing)) {
                // Sincroniza dados básicos se nenhum tem galeria
                next[u.id] = { ...existing, ...u };
            }
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

  const lastRequestedProfileId = useRef<string | null>(null);

  const handleViewProfile = async (p: any) => {
    if (!p) return;

    // 1. EXTRAÇÃO DE ID
    const profileId = typeof p === 'string' ? p : (p.id || p.uid);
    if (!profileId) return;

    lastRequestedProfileId.current = profileId;
    
    // 2. BUSCA NO CACHE (Resposta Instantânea)
    const cached = profileRegistry[profileId];
    if (cached) {
        setViewedProfile({ ...cached, gallery: cached.gallery || [] });
        setActiveTab('view_profile');
        setProfileLoading(false);
    } else {
        setProfileLoading(true);
        setViewedProfile(null);
        setActiveTab('view_profile');
    }

    try {
        // 3. SINCRONIZAÇÃO COM A MATRIZ
        const real = await getProfileById(profileId);
        
        if (lastRequestedProfileId.current !== profileId) return;

        if (real) {
            const finalProfile = { ...real, gallery: real.gallery || [] } as User;
            setViewedProfile(finalProfile);
            setProfileRegistry(prev => ({ 
                ...prev, 
                [profileId]: finalProfile
            }));
        } else if (!cached) {
            // Fallback para mock se nao temos nada
            const mock = MOCK_USERS.find(u => u.id === profileId || u.id === `mock-${profileId}`);
            if (mock) {
                setViewedProfile({ ...mock, gallery: mock.gallery || [] } as User);
            }
        }
    } catch (e) {
        console.warn('[APP] Sincronização falhou:', profileId);
    } finally {
        if (lastRequestedProfileId.current === profileId) {
            setProfileLoading(false);
        }
    }
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

    if (activeTab === 'view_profile') {
      if (viewedProfile && !profileLoading) {
        return <Profile 
          user={viewedProfile} 
          isOwnProfile={viewedProfile?.id === currentUser?.id} 
          onBack={() => handleTabChange('radar')} 
        />;
      }
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-black">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] animate-pulse">Sincronizando com a Matriz...</p>
        </div>
      );
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

  // City Gate - Obrigatório para todos os agentes logados sem registro de cidade
  if (!showTerms && isAuthenticated && currentUser && (!currentUser.city || currentUser.city.trim().length < 2)) {
    return (
      <div className={isProtected ? 'blurred pointer-events-none' : ''}>
        <CityGate 
          user={currentUser} 
          onComplete={(updatedUser) => setCurrentUser(updatedUser)} 
        />
      </div>
    );
  }

  if (isInitialLoading) {
      return (
          <div className={`min-h-screen bg-black flex flex-col items-center justify-center gap-6 transition-all ${isProtected ? 'blurred pointer-events-none' : ''}`}>
              <LibidoIcon size={64} glow />
              <div className="text-center">
                  <p className="text-[14px] font-black text-amber-500 uppercase tracking-[0.5em] mt-4">LIBIDO 2026</p>
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

  const watermark = currentUser ? getWatermarkData(currentUser) : null;

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

        {/* Watermark Forense */}
        {isAuthenticated && watermark && !isProtected && (
          <div className="fixed inset-0 z-[40] pointer-events-none opacity-[0.03] flex flex-wrap items-center justify-center gap-20 overflow-hidden rotate-[-25deg] scale-150">
             {Array.from({ length: 24 }).map((_, i) => (
               <span key={i} className="text-[12px] font-black tracking-[0.5em] whitespace-nowrap text-white">
                 {watermark}
               </span>
             ))}
          </div>
        )}

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
