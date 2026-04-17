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
import { User, Plan, TrustLevel } from './types';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData } from './services/authUtils';
import { initSecurityLayer } from './services/securityService';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'chat' | 'profile' | 'events' | 'assinatura'>('feed');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    initSecurityLayer();
    const savedAuth = getAuthFlag();
    const savedUser = getUserData();

    if (savedAuth && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
      syncCaches();
    }

    const shouldShow = shouldShowTermsGate();
    if (shouldShow) setShowTerms(true);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthFlag(true);
    cache.userData = user;
    localStorage.setItem('libido_user_data_v2', btoa(JSON.stringify(user)));
    
    if (user.email && (user.email.includes('marcelobarrosorj') || user.email.includes('libidoapp'))) {
      user.plan = Plan.GOLD;
      user.is_premium = true;
    }
    
    setActiveTab('assinatura');   // ← Força ir direto para a aba de assinatura após login
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentUser(null);
    cache.userData = null;
    setActiveTab('feed');
  };

  // Componente de assinatura simples e visível
  const PaymentScreen = () => (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center', 
      backgroundColor: '#1a0033', 
      color: '#fff', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '40px' }}>Assinatura Premium Libido 2026</h1>
      
      <div style={{ marginBottom: '50px' }}>
        <button 
          onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')}
          style={{ 
            padding: '18px 50px', 
            fontSize: '20px', 
            margin: '10px', 
            background: '#00ff88', 
            color: '#000', 
            border: 'none', 
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          Mensal - R$ 49,90
        </button>
        
        <button 
          onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')}
          style={{ 
            padding: '18px 50px', 
            fontSize: '20px', 
            margin: '10px', 
            background: '#00ff88', 
            color: '#000', 
            border: 'none', 
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          Semestral - R$ 269,46
        </button>
        
        <button 
          onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')}
          style={{ 
            padding: '18px 50px', 
            fontSize: '20px', 
            margin: '10px', 
            background: '#00ff88', 
            color: '#000', 
            border: 'none', 
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          Anual - R$ 479,04
        </button>
      </div>

      <p style={{ color: '#aaa' }}>Clique em um dos botões acima. O pagamento abre em nova aba.</p>
    </div>
  );

  const renderContent = () => {
    if (!isAuthenticated) {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    if (activeTab === 'assinatura') {
      return <PaymentScreen />;
    }

    // Para as outras abas, mostramos uma tela simples para não ficar preta
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
        <h2>Bem-vindo ao Libido 2026</h2>
        <p>Você está logado como {currentUser?.nickname || 'Usuário'}</p>
        <p>Plano: {currentUser?.is_premium ? 'PREMIUM' : 'FREE'}</p>
        <button onClick={() => setActiveTab('assinatura')} style={{ marginTop: '30px', padding: '12px 30px', background: '#ff00aa', color: '#fff', border: 'none', borderRadius: '8px' }}>
          Ir para Assinatura
        </button>
      </div>
    );
  };

  if (showTerms) {
    return <TermsGate onAccept={() => { recordTermsAcceptance(); setShowTerms(false); }} />;
  }

  return (
    <AuthContext.Provider value={{ logout, setIsAuthenticated, refreshSession: syncCaches }}>
      <div className="relative w-full h-full flex justify-center bg-black text-white min-h-screen">
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </Layout>
      </div>
    </AuthContext.Provider>
  );
}
