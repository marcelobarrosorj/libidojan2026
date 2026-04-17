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

  useEffect(() => {
    initSecurityLayer();
    
    const savedAuth = getAuthFlag();
    const savedUser = getUserData();

    if (savedAuth && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
      setIsUnlocked(true);
      syncCaches();
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
    
    if (user.email && (user.email.includes('marcelobarrosorj') || user.email.includes('libidoapp'))) {
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

  // SubscribeButtons embutido diretamente (sem import)
  const SubscribeButtonsEmbedded = ({ userId, email }: { userId: string; email: string }) => {
    const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal');
    const [loading, setLoading] = useState(false);

    const planLabel = plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual';

    const createCheckout = () => {
      if (!email) {
        alert("Você precisa estar logado para assinar");
        return;
      }
      setLoading(true);
      const links = {
        mensal: 'https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403',
        semestral: 'https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404',
        anual: 'https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405'
      };
      window.open(links[plan], '_blank');
      setLoading(false);
    };

    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Assinatura Premium - Libido 2026</h2>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button onClick={() => setPlan('mensal')} disabled={plan === 'mensal'} style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: plan === 'mensal' ? '#fff' : '#333', color: plan === 'mensal' ? '#000' : '#fff' }}>
            Mensal - R$ 49,90
          </button>
          <button onClick={() => setPlan('semestral')} disabled={plan === 'semestral'} style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: plan === 'semestral' ? '#fff' : '#333', color: plan === 'semestral' ? '#000' : '#fff' }}>
            Semestral - R$ 269,46
          </button>
          <button onClick={() => setPlan('anual')} disabled={plan === 'anual'} style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: plan === 'anual' ? '#fff' : '#333', color: plan === 'anual' ? '#000' : '#fff' }}>
            Anual - R$ 479,04
          </button>
        </div>

        <button
          onClick={createCheckout}
          disabled={loading}
          style={{ padding: '16px 40px', fontSize: '18px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Abrindo...' : `Assinar ${planLabel} Agora`}
        </button>

        <p style={{ marginTop: '30px', fontSize: '14px', color: '#888' }}>
          Pagamento seguro via Stripe • Abre em nova aba
        </p>
      </div>
    );
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
        return <SubscribeButtonsEmbedded userId={currentUser?.id || ''} email={currentUser?.email || ''} />;
      default:
        return <Feed onProfileClick={handleViewProfile} />;
    }
  };

  if (showTerms) {
    return <TermsGate onAccept={() => { recordTermsAcceptance(); setShowTerms(false); }} />;
  }

  return (
    <AuthContext.Provider value={{ logout: logout, setIsAuthenticated, setIsUnlocked, refreshSession: syncCaches }}>
      <div className="relative w-full h-full flex justify-center bg-black text-white min-h-screen">
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </Layout>
      </div>
    </AuthContext.Provider>
  );
}
