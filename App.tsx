
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
import { TermsGate } from './components/TermsGate';
import { shouldShowTermsGate, recordTermsAcceptance } from './services/termsGate';
import { AuthContext } from './hooks/useAuthContext';
import { User, Gender, SexualOrientation, Biotype, Vibes, Plan, TrustLevel, UserType } from './types';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData, log } from './services/authUtils';
import { isUnlockedWindowValid, clearUnlockedWindow } from './services/pinService';
import { initSecurityLayer } from './services/securityService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthFlag());
  const [isUnlocked, setIsUnlocked] = useState(isUnlockedWindowValid());
  const [activeTab, setActiveTab] = useState('feed'); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const local = getUserData();
    if (local) cache.userData = local;
    return local;
  });
  const [showTerms, setShowTerms] = useState(false);
  const syncLock = React.useRef(false);
  const hasInitialSynced = React.useRef(false);

  useEffect(() => {
    initSecurityLayer();

    let mounted = true;
    const initApp = async () => {
        const hasAuth = getAuthFlag();
        if (hasAuth && !hasInitialSynced.current) {
            try {
                await refreshSession();
            } catch (e) {
                log('error', 'Critical Init Failure', e);
            }
        }
        if (mounted) setIsInitialLoading(false);
    };
    
    // Failsafe: Remove loading screen after 8 seconds no matter what
    const timer = setTimeout(() => {
        if (mounted) setIsInitialLoading(false);
    }, 8000);

    initApp();

    if (shouldShowTermsGate(new Date(), { version: '2026.1' })) {
      setShowTerms(true);
    }

    const handleVisibility = () => {
        const isSafeZone = document.body.classList.contains('navigating-out') || 
                          document.body.classList.contains('payment-active');
        
        if (isSafeZone) {
            document.body.classList.remove('is-hidden');
            return;
        }

        if (document.hidden) {
            document.body.classList.add('is-hidden');
        } else {
            document.body.classList.remove('is-hidden');
        }
    };

    const onBlur = () => {
        const isSafeZone = document.body.classList.contains('navigating-out') || 
                          document.body.classList.contains('payment-active');
        if (isSafeZone) return;
        document.body.classList.add('is-hidden');
    };

    const onFocus = () => {
        document.body.classList.remove('is-hidden');
    };

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
        mounted = false;
        clearTimeout(timer);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    // Limpa estados de detalhe ao trocar de aba principal
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

  const authContextValue = React.useMemo(() => ({
    logout,
    refreshSession,
    setIsUnlocked,
    setIsAuthenticated
  }), [logout, refreshSession]);

  useEffect(() => {
    // Escuta mudanças de aba e outras lógicas se necessário
  }, []);

  if (showTerms) {
    return (
      <TermsGate 
        privacyUrl="/privacy" 
        termsUrl="/terms" 
        onExit={handleExit} 
        onAccept={handleAcceptTerms} 
      />
    );
  }

  if (isInitialLoading) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando Matriz</p>
          </div>
      );
  }

  if (!isAuthenticated || !isUnlocked) {
    return (
      <AuthContext.Provider value={authContextValue}>
        <Auth />
      </AuthContext.Provider>
    );
  }

  const handleViewProfile = (p: any) => {
    // Adding following: p.following || [] to satisfy User type
    const fullUser: User = {
      id: p.id, nickname: p.name || p.nickname, email: p.email || `${p.id}@libido.app`, age: p.age || 25, avatar: p.avatar, bio: p.bio || 'Sem biografia.',
      type: p.category || p.type || UserType.HOMEM, birthDate: p.birthDate || '1995-01-01', biotype: p.biotype || Biotype.PADRAO,
      gender: p.gender || Gender.CIS, sexualOrientation: p.sexualOrientation || SexualOrientation.BISSEXUAL, vibes: p.vibes || [Vibes.LIBERAL],
      location: p.city || p.location || 'Brasil', isOnline: true, verifiedAccount: p.verifiedAccount || false, verificationScore: p.verificationScore || 50, xp: p.xp || 100, level: p.level || 1,
      plan: p.plan || Plan.FREE, matches: p.matches || [], bookmarks: p.bookmarks || [], blockedUsers: p.blockedUsers || [], badges: p.badges || [], boundaries: p.boundaries || [],
      behaviors: p.behaviors || [], bodyMods: p.bodyMods || [], bodyHair: p.bodyHair || 'Aparado', bodyArt: p.bodyArt || [], bondageExp: p.bondageExp || 'Iniciante',
      bucketList: p.bucketList || [], bestMoments: p.bestMoments || [], bestFeature: p.bestFeature || 'Olhar', beveragePref: p.beveragePref || 'Gin', bestTime: p.bestTime || 'Noite', braveryLevel: p.braveryLevel || 7,
      busyMode: p.busyMode || false, bookingPolicy: p.bookingPolicy || 'A combinar', balance: p.balance || 0, boosts_active: p.boosts_active || 0, is_premium: p.is_premium || false, height: p.height || 170,
      lat: p.lat || -23.5505, lon: p.lon || -46.6333, city: p.city || 'São Paulo', neighborhood: p.neighborhood || 'Centro', seenBy: p.seenBy || [],
      gallery: p.gallery || [{ id: `${p.id}-default`, url: p.avatar, timestamp: new Date().toISOString() }],
      trustLevel: p.trustLevel || TrustLevel.BRONZE, isGhostMode: p.isGhostMode || false, hasBlurredGallery: p.hasBlurredGallery || (p.trustLevel === TrustLevel.OURO),
      vouches: p.vouches || [],
      following: p.following || [],
      lookingFor: p.lookingFor || [UserType.HOMEM, UserType.MULHER, UserType.CASAIS],
      rsvps: p.rsvps || []
    };
    setViewedProfile(fullUser);
    setActiveTab('view_profile');
  };

  const renderContent = () => {
    if (activeTab === 'chat_detail' && selectedUser) {
      return <ChatDetail user={selectedUser} onBack={() => setActiveTab('chat')} />;
    }
    
    if (activeTab === 'view_profile' && viewedProfile) {
      return <Profile user={viewedProfile} isOwnProfile={false} onBack={() => setActiveTab('radar')} />;
    }

    switch (activeTab) {
      case 'radar': return <Explore onMatch={(u) => { setSelectedUser(u); setActiveTab('chat_detail'); }} onProfileClick={handleViewProfile} />;
      case 'events': return <EventsPage />;
      case 'feed': return <Feed onProfileClick={handleViewProfile} />;
      case 'chat': return <ChatList onSelectUser={(u) => { setSelectedUser(u); setActiveTab('chat_detail'); }} onNavigateToSubscription={() => setActiveTab('assinatura')} />;
      case 'profile': return <Profile user={currentUser || undefined} isOwnProfile={true} onBack={() => setActiveTab('feed')} onNavigate={setActiveTab} />;
      case 'assinatura': return <Subscription />;
      default: return <Feed onProfileClick={handleViewProfile} />; 
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="relative w-full h-full flex justify-center">
        <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
          {renderContent()}
        </Layout>
      </div>
    </AuthContext.Provider>
  );
}
