import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { User, Plan } from './types';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData } from './services/authUtils';
import { initSecurityLayer } from './services/securityService';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    initSecurityLayer();
    const savedAuth = getAuthFlag();
    const savedUser = getUserData();

    if (savedAuth && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
      syncCaches();
      setActiveTab('assinatura'); // força ir para assinatura após login
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    const premiumUser = { ...user };
    if (user.email && (user.email.includes('marcelobarrosorj') || user.email.includes('libidoapp'))) {
      premiumUser.plan = Plan.GOLD;
      premiumUser.is_premium = true;
    }
    setCurrentUser(premiumUser);
    setIsAuthenticated(true);
    setAuthFlag(true);
    cache.userData = premiumUser;
    localStorage.setItem('libido_user_data_v2', btoa(JSON.stringify(premiumUser)));
    setActiveTab('assinatura');
  };

  // Tela de assinatura visível dentro do Layout
  const PaymentScreen = () => (
    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#1a0033', color: '#fff', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '40px' }}>Assinatura Premium Libido 2026</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <button
          onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')}
          style={{ padding: '18px', fontSize: '20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Mensal — R$ 49,90
        </button>
        <button
          onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')}
          style={{ padding: '18px', fontSize: '20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Semestral — R$ 269,46
        </button>
        <button
          onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')}
          style={{ padding: '18px', fontSize: '20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Anual — R$ 479,04
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!isAuthenticated) {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
    if (activeTab === 'assinatura') {
      return <PaymentScreen />;
    }
    return <div style={{ padding: '40px', color: '#fff' }}>Bem-vindo ao Libido 2026</div>;
  };

  return (
    <AuthContext.Provider value={{ logout: () => window.location.reload() }}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </AuthContext.Provider>
  );
}
