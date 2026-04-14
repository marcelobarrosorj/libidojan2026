import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Explore from './components/Explore';
import ChatList from './components/ChatList';
import Profile from './components/Profile';
import ChatDetail from './components/ChatDetail';
import Feed from './components/Feed';
import EventsPage from './components/EventsPage';
import { TermsGate } from './components/TermsGate';
import { shouldShowTermsGate, recordTermsAcceptance } from './services/termsGate';
import { User, Gender, SexualOrientation, Biotype, Vibes, Plan, TrustLevel, UserType } from './types';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData } from './services/authUtils';
import { isUnlockedWindowValid, clearUnlockedWindow } from './services/pinService';
import { initSecurityLayer } from './services/securityService';
import SubscribeButtons from './components/SubscribeButtons';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'chat' | 'profile' | 'events' | 'assinatura'>('feed');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  // Inicialização mais robusta
  useEffect(() => {
    initSecurityLayer();
    
    const savedAuth = getAuthFlag();
    const savedUser = getUserData();

    if (savedAuth && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
      setIsUnlocked(true);
      syncCaches(); // tenta sincronizar com nuvem
    }

    const shouldShow = shouldShowTermsGate();
    if (shouldShow) setShowTerms(true);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsUnlocked(true);
    setAuthFlag(true);
    cache.userData = user;
    localStorage.setItem('libido_user_data_v2', btoa(JSON.stringify(user)));
    
    // Força premium no login se for o email pago
    if (user.email?.includes('marcelobarrosorj') || user.email?.includes('libidoapp')) {
      user.plan = Plan.GOLD;
      user.is_premium = true;
    }
    
    setActiveTab('feed');
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsUnlocked(false);
    setCurrentUser(null);
    cache.userData = null;
    setActiveTab('feed');
  };

  const handleViewProfile = (user: User) => {
    setViewedProfile(user);
    setActiveTab('view_profile');
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    if (activeTab === 'chat_detail' && selectedUser) {
      return <ChatDetail user={selectedUser} onBack={() => setActiveTab('chat')} />;
    }

    if (activeTab === 'view_profile' && viewedProfile) {
      return <Profile user={viewedProfile} isOwnProfile={false} onBack={() => setActiveTab('radar')} />;
    }

    switch (activeTab) {
      case 'radar':
        return <Explore onMatch={(u) => { setSelectedUser(u); setActiveTab('chat_detail'); }} onProfileClick={handleViewProfile} />;
      case 'events':
        return <EventsPage />;
      case 'feed':
        return <Feed onProfileClick={handleViewProfile} />;
      case 'chat':
        return <ChatList onSelectUser={(u) => { setSelectedUser(u); setActiveTab('chat_detail'); }} onNavigateToSubscription={() => setActiveTab('assinatura')} />;
      case 'profile':
        return <Profile user={currentUser || undefined} isOwnProfile={true} onBack={() => setActiveTab('feed')} />;
      case 'assinatura':
        return <SubscribeButtons userId={currentUser?.id || ''} email={currentUser?.email || ''} />;
      default:
        return <Feed onProfileClick={handleViewProfile} />;
    }
  };

  if (showTerms) {
    return <TermsGate onAccept={() => { recordTermsAcceptance(); setShowTerms(false); }} />;
  }

  return (
    <AuthContext.Provider value={{ logout, setIsAuthenticated, setIsUnlocked, refreshSession: syncCaches }}>
      <div className="relative w-full h-full flex justify-center bg-black text-white">
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </Layout>
      </div>
    </AuthContext.Provider>
  );
}
