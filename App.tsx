
import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import RadarPage from './radar/RadarPage';
import ChatList from './components/ChatList';
import Profile from './components/Profile';
import Subscription from './components/Subscription';
import ChatDetail from './components/ChatDetail';
import Feed from './components/Feed';
import EventsPage from './components/EventsPage';
import { TermsGate } from './components/TermsGate';
import { shouldShowTermsGate, recordTermsAcceptance } from './services/termsGate';
import { User, Gender, SexualOrientation, Biotype, Vibes, Plan, TrustLevel, UserType } from './types';
import { getAuthFlag, setAuthFlag, syncCaches, cache } from './services/authUtils';
import { isUnlockedWindowValid, clearUnlockedWindow } from './services/pinService';
import { initSecurityLayer } from './services/securityService';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthFlag());
  const [isUnlocked, setIsUnlocked] = useState(isUnlockedWindowValid());
  const [activeTab, setActiveTab] = useState('feed'); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(cache.userData);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    initSecurityLayer();

    if (shouldShowTermsGate(new Date(), { version: '2026.1' })) {
      setShowTerms(true);
    }

    const handleVisibility = () => {
        // EXCEÇÃO DE SEGURANÇA: Não escurece a tela se estivermos em pagamento ou redirecionamento autorizado
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
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleAcceptTerms = () => {
    recordTermsAcceptance('2026.1', 'app_entry');
    setShowTerms(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  const logout = () => {
    setAuthFlag(false);
    clearUnlockedWindow();
    setIsAuthenticated(false);
    setIsUnlocked(false);
    setCurrentUser(null);
    localStorage.clear();
  };

  const refreshSession = async (immediate = false) => {
    await syncCaches();
    setIsAuthenticated(getAuthFlag());
    setIsUnlocked(isUnlockedWindowValid());
    setCurrentUser(cache.userData);
  };

  useEffect(() => {
    const initApp = async () => {
        if (isAuthenticated) {
            await syncCaches(); 
            setIsUnlocked(isUnlockedWindowValid());
            setCurrentUser(cache.userData);
        }
        setIsSyncing(false);
    };
    initApp();
  }, [isAuthenticated]);

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

  if (isSyncing) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando Matriz</p>
          </div>
      );
  }

  if (!isAuthenticated || !isUnlocked) {
    return (
      <AuthContext.Provider value={{ logout, refreshSession, setIsUnlocked, setIsAuthenticated }}>
        <Auth />
      </AuthContext.Provider>
    );
  }

  const handleViewRadarProfile = (p: any) => {
    // Adding missing rsvps property to fully satisfy the User interface
    const fullUser: User = {
      id: p.id, nickname: p.name, email: `${p.id}@libido.app`, age: 25, avatar: p.avatar, bio: p.bio || 'Sem biografia.',
      type: p.category as any, birthDate: '1995-01-01', biotype: Biotype.PADRAO,
      gender: Gender.CIS, sexualOrientation: SexualOrientation.BISSEXUAL, vibes: [Vibes.LIBERAL],
      location: p.city, isOnline: true, verifiedAccount: true, verificationScore: 100, xp: 1200, level: 10,
      plan: Plan.FREE, matches: [], bookmarks: [], blockedUsers: [], badges: [], boundaries: p.boundaries || [],
      behaviors: p.behaviors || [], bodyMods: [], bodyHair: 'Aparado', bodyArt: [], bondageExp: 'Iniciante',
      bucketList: [], bestMoments: [], bestFeature: 'Olhar', beveragePref: 'Gin', bestTime: 'Noite', braveryLevel: p.braveryLevel || 7,
      busyMode: false, bookingPolicy: 'A combinar', balance: 0, boosts_active: 0, is_premium: false, height: 170,
      lat: p.lat, lon: p.lon, city: p.city, neighborhood: p.neighborhood, seenBy: [],
      gallery: p.gallery || [{ id: `${p.id}-default`, url: p.avatar, timestamp: new Date().toISOString() }],
      trustLevel: p.trustLevel || TrustLevel.BRONZE, isGhostMode: p.isGhostMode || false, hasBlurredGallery: p.hasBlurredGallery || (p.trustLevel === TrustLevel.OURO),
      vouches: [],
      lookingFor: p.lookingFor || [UserType.HOMEM, UserType.MULHER, UserType.CASAIS],
      rsvps: []
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
      case 'radar': return <RadarPage onProfileClick={handleViewRadarProfile} onUpgrade={() => setActiveTab('assinatura')} />;
      case 'events': return <EventsPage />;
      case 'feed': return <Feed />;
      case 'chat': return <ChatList onSelectUser={(u) => { setSelectedUser(u); setActiveTab('chat_detail'); }} onNavigateToSubscription={() => setActiveTab('assinatura')} />;
      case 'profile': return <Profile user={currentUser || undefined} isOwnProfile={true} onBack={() => setActiveTab('feed')} />;
      case 'assinatura': return <Subscription />;
      default: return <Feed />; 
    }
  };

  return (
    <AuthContext.Provider value={{ logout, refreshSession, setIsUnlocked, setIsAuthenticated }}>
      <div className="relative w-full h-full flex justify-center">
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </Layout>
      </div>
    </AuthContext.Provider>
  );
}
