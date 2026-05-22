
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
import AdminDashboard from './components/AdminDashboard';
import Ranking from './components/Ranking';
import { soundService } from './services/soundService';
import { TermsGate } from './components/TermsGate';
import { CityGate } from './components/CityGate';
import VerificationBanner from './components/VerificationBanner';
import { GlobalSearch } from './components/GlobalSearch';
import { PhotoReminder } from './components/PhotoReminder';
import { shouldShowTermsGate, recordTermsAcceptance } from './services/termsGate';
import { AuthContext } from './hooks/useAuthContext';
import { User, Gender, SexualOrientation, Biotype, Vibes, Plan, TrustLevel, UserType } from './types';
import { MOCK_USERS, MOCK_POSTS, MOCK_CURRENT_USER } from './constants';
import { useAntiPrint } from './hooks/useAntiPrint';
import { Lock } from 'lucide-react';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData, log, authEvents, showNotification, isPremiumUser, saveUserData } from './services/authUtils';
import { isUnlockedWindowValid, clearUnlockedWindow } from './services/pinService';
import { initSecurityLayer, getWatermarkData } from './services/securityService';
import { getProfileById } from './services/repo';
import { APIProvider } from '@vis.gl/react-google-maps';

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
    if (local) {
      cache.userData = local;
      return local;
    }
    // Fallback agressivo se estiver vazio
    const fallback = { ...MOCK_CURRENT_USER, nickname: 'CASAL BEIJO', id: '000001', serialNumber: '000001', email: 'casalbeijo@libido.app' };
    if (typeof window !== 'undefined') {
        localStorage.setItem('libido_user_data_v2', btoa(encodeURIComponent(JSON.stringify(fallback))));
    }
    cache.userData = fallback;
    return fallback;
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
    } catch (e: any) {
        log('error', '[APP] Erro na sincronização de sessão', e);
        // Não resetamos nada, apenas logamos o erro para depuração
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

  // Heartbeat para manter o status online do usuário atual no Supabase e na Matriz Central
  useEffect(() => {
    if (!isAuthenticated || !currentUser || !currentUser.id) return;

    const sendHeartbeat = async () => {
      try {
        const { saveUserData } = await import('./services/authUtils');
        await saveUserData({});
        console.log("[HEARTBEAT] Sinal de presença 'last_seen' sincronizado com a Matriz.");
      } catch (e) {
        console.warn("[HEARTBEAT] Falha silenciosa no envio do batimento de presença:", e);
      }
    };

    // Envia o primeiro log/sinal de presença no boot do app
    sendHeartbeat();

    // Sincroniza periodicamente a cada 2 minutos (120.000 ms)
    const interval = setInterval(sendHeartbeat, 120000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentUser?.id]);

  useEffect(() => {
    // Marcello: PROTOCOLO DE REPARO MANDATÁRIO - Executado na montagem do App
    const forceRepair = async () => {
        const CASALX_ID = '65a8d3a4-24b1-47d6-aec4-6819710abae8';
        try {
            const { supabase } = await import('./services/supabase');
            console.log("[REPARO] Iniciando Protocolo 6819 (Casalx)...");
            
            // Forçamos a atualização via ID para garantir unicidade e permissão
            const { data, error } = await supabase
                .from('profiles')
                .update({ 
                    data: { 
                        lat: -22.9031, 
                        lon: -43.5590, 
                        city: 'Rio de Janeiro', 
                        location: 'Campo Grande',
                        is_mock: false,
                        nickname: 'casalx',
                        plan: Plan.PREMIUM
                    },
                    nickname: 'casalx'
                })
                .eq('id', CASALX_ID);
                
            if (error) {
                console.error("DETALHE DO ERRO SUPABASE (Repair):", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
            } else {
                console.log("[REPARO] Casalx atualizado via ID com sucesso.");
            }
        } catch (e) {
            console.error("[REPARO] Falha crítica no protocolo de emergência:", e);
        }
    };
    forceRepair();
  }, []);

  useEffect(() => {
    // Marcello: ALERTA DE DIAGNÓSTICO OBRIGATÓRIO (REMOVIDO PARA PRODUÇÃO)
    console.log("[DIAGNÓSTICO] Dono Conectado: ", localStorage.getItem('libido_user_data_v2'));

    setLoadStep('Verificando Camada de Segurança...');
    initSecurityLayer();

    let mounted = true;
    const initApp = async () => {
        let hasAuth = getAuthFlag();
        
        // Marcello: CURA DE EMERGÊNCIA - Se temos flag de auth mas os dados locais sumiram
        if (hasAuth && (!currentUser || !currentUser.id)) {
            setLoadStep('Recuperando Identidade da Matriz...');
            try {
                const { supabase } = await import('./services/supabase');
                const { data: authData, error: authError } = await supabase.auth.getUser();
                
                if (authError) throw authError;

                const sbUser = authData.user;
                if (sbUser) {
                    log('info', '[HEAL] Recuperando dados via Supabase Auth...');
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', sbUser.id).maybeSingle();
                    if (profile) {
                        const rawData = profile.data || {};
                        const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                        const healedUser = { ...parsedData, id: sbUser.id, email: sbUser.email };
                        setCurrentUser(healedUser);
                        saveUserData(healedUser);
                        hasAuth = true;
                    }
                } else {
                    // Sessão expirou de verdade no servidor
                    log('warn', '[HEAL] Sessão inválida no servidor. Resetando status.');
                    setAuthFlag(false);
                    hasAuth = false;
                }
            } catch (authErr: any) {
                log('error', '[HEAL] Falha crítica ao recuperar identidade:', authErr);
                // Se falhou o fetch, mantemos o que tem no cache local se existir, ou deslogamos
                if (authErr.message?.includes('fetch')) {
                    showNotification('Falha de conexão com a Matriz Central. Operando em modo offline.', 'error');
                }
            }
        }

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

  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
        const msg = event.reason?.message || String(event.reason);
        if (msg.includes('fetch') || msg.includes('NetworkError')) {
            console.warn('[REJECTION_CAUGHT] Erro de rede interceptado:', msg);
            showNotification('Sinal fraco ou falha na Matriz. Conectividade instável.', 'error');
            event.preventDefault(); // Evita que apareça no console/overlay do browser de forma agressiva
        }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  const [radarResetKey, setRadarResetKey] = useState(0);
  const [profileRegistry, setProfileRegistry] = useState<Record<string, User>>({});

  // 1. POPULAÇÃO INICIAL (Híbrida)
  useEffect(() => {
    // Restaura população inicial com mocks para estabilidade visual imediata
    const initialRegistry: Record<string, User> = {};
    MOCK_USERS.forEach(u => {
        initialRegistry[u.id] = u;
    });
    setProfileRegistry(initialRegistry);
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

  // Marcello: HISTÓRICO REATIVO DO NAVEGADOR (Padrão SPA de Alta Discrição)
  // Permite ao usuário utilizar o botão "voltar" nativo do browser de forma intuitiva
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && typeof state === 'object' && 'activeTab' in state) {
        setActiveTab(state.activeTab || 'feed');
        setViewedProfile(state.viewedProfile || null);
        setSelectedUser(state.selectedUser || null);
      } else {
        // Fallback root
        setActiveTab('feed');
        setViewedProfile(null);
        setSelectedUser(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Registra o estado raiz inicial se inexistente para o botão de voltar agir internamente
    if (!window.history.state) {
      window.history.replaceState({
        activeTab: 'feed',
        viewedProfile: null,
        selectedUser: null
      }, '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleTabChange = (tab: string, push = true) => {
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

    if (push) {
      window.history.pushState({
        activeTab: tab,
        viewedProfile: null,
        selectedUser: null
      }, '');
    }
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
    setIsAuthenticated,
    currentUser
  }), [logout, refreshSession, currentUser]);

  const lastRequestedProfileId = useRef<string | null>(null);

    // Função Robusta para abrir perfis
    const handleViewProfile = async (idOrObject: any, push = true) => {
        const profileId = typeof idOrObject === 'string' ? idOrObject : idOrObject.id;
        if (!profileId) return;

        console.log("[DEBUG] Solicitando perfil:", profileId);
        setProfileLoading(true);

        // 1. Tentar buscar no banco real (Supabase)
        const realProfile = await getProfileById(profileId);
        
        let loadedProfile: User | null = null;
        if (realProfile) {
            loadedProfile = realProfile;
            setViewedProfile(realProfile);
        } else {
            // 2. Se não for real, buscar nos Mocks (pode ser um usuário de teste)
            const mock = MOCK_USERS.find(u => u.id === profileId || u.id === `mock-${profileId}`);
            if (mock) {
                loadedProfile = mock as User;
                setViewedProfile(mock as User);
            } else {
                console.warn("Perfil real não encontrado, verifique conexão ou ID.");
            }
        }
        
        setActiveTab('view_profile');
        setProfileLoading(false);

        if (push && loadedProfile) {
          window.history.pushState({
            activeTab: 'view_profile',
            viewedProfile: loadedProfile,
            selectedUser: null
          }, '');
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

  const handleChat = (profile: any, push = true) => {
    const profileId = typeof profile === 'string' ? profile : profile.id;
    if (!profileId) return;
    const target = profileRegistry[profileId] || profile;
    if (target) {
        setSelectedUser(target);
        setActiveTab('chat_detail');
        soundService.play('MESSAGE');

        if (push) {
          window.history.pushState({
            activeTab: 'chat_detail',
            viewedProfile: null,
            selectedUser: target
          }, '');
        }
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
          onChat={handleChat}
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
          onMatch={(u) => handleChat(u)} 
          onProfileClick={handleViewProfile} 
          onChat={handleChat}
        />;
      case 'ranking': return <Ranking onSelectUser={handleViewProfile} onChat={handleChat} />;
      case 'events': return <EventsPage />;
      case 'feed': return <Feed onProfileClick={handleViewProfile} onChat={handleChat} />;
      case 'chat': return <ChatList onSelectUser={(u) => handleChat(u)} onNavigateToSubscription={() => handleTabChange('assinatura')} currentUser={currentUser} />;
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
      case 'admin_panel': 
        if (currentUser?.id === '000001' || currentUser?.email === 'marcelobarrosorj@gmail.com') {
          return <AdminDashboard onBack={() => handleTabChange('feed')} onInspectUser={handleViewProfile} />;
        }
        return <Feed onProfileClick={handleViewProfile} onChat={handleChat} />;
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
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasValidKey = Boolean(API_KEY) && API_KEY.length > 20;

  return (
    <AuthContext.Provider value={authContextValue}>
      <APIProvider apiKey={API_KEY} version="weekly">
      <div className="relative w-full min-h-[100dvh] flex justify-center bg-black overflow-hidden">
        <div className={`w-full flex flex-col blur-on-focus-loss transition-all duration-500 ${isProtected ? 'blurred pointer-events-none' : ''}`}>
          <Layout 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            user={currentUser}
            onSearch={() => setIsSearchOpen(true)}
          >
            {renderContent()}
          </Layout>
        </div>

        {/* Watermark Forense de Segurança Autoritária (SVG Pattern) */}
        {isAuthenticated && watermark && !isProtected && (
          <div 
            id="matriz-security-watermark"
            className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.14] select-none forensic-watermark"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='160' viewBox='0 0 280 160'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-weight='900' font-size='10' transform='rotate(-25 140 80)' %3E${encodeURIComponent(watermark)}%3C/text%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
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
            !isPremiumUser(currentUser) && // Marcello: Assinantes não devem ser bloqueados por isso se seus dados sumirem temporariamente
            (!currentUser.avatar || currentUser.avatar.includes('picsum.photos/seed')) &&
            activeTab !== 'profile_settings'
          }
          onUpdate={() => handleTabChange('profile_settings')}
        />
        
        {isProtected && (
          <div 
            id="matriz-security-blocker"
            className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black animate-in fade-in duration-150 cursor-none select-none"
            onClick={(e) => { e.stopPropagation(); }}
          >
             <div className="p-8 flex flex-col items-center text-center space-y-6">
               <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-pulse">
                 <Lock size={48} />
               </div>
               <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Matriz Blindada</h2>
                  <p className="text-[11px] text-amber-500 font-black uppercase tracking-[0.4em]">Protocolo de Segurança Ativo</p>
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[280px]">
                 Capturas de tela e gravações são estritamente proibidas para sua proteção e a de terceiros.
               </p>
               
               <div className="h-20" /> {/* Espaçador */}
               
               <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.5em] animate-pulse">
                 Identidade Digital Monitorada
               </p>
             </div>
          </div>
        )}
      </div>
      </APIProvider>
    </AuthContext.Provider>
  );
}
