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
  const [activeTab, setActiveTab] = useState<'assinatura'>('assinatura'); // Força direto para assinatura

  useEffect(() => {
    initSecurityLayer();

    const savedAuth = getAuthFlag();
    const savedUser = getUserData();

    if (savedAuth && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
      syncCaches();
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

  const PaymentScreen = () => (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a0033',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '50px' }}>Assinatura Premium</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>
        <button 
          onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')}
          style={{ padding: '20px', fontSize: '20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Mensal — R$ 49,90
        </button>

        <button 
          onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')}
          style={{ padding: '20px', fontSize: '20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Semestral — R$ 269,46
        </button>

        <button 
          onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')}
          style={{ padding: '20px', fontSize: '20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Anual — R$ 479,04
        </button>
      </div>

      <p style={{ marginTop: '50px', color: '#aaa' }}>
        Pagamento abre em nova aba • Seguro via Stripe
      </p>
    </div>
  );

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AuthContext.Provider value={{ logout: () => window.location.reload() }}>
      <div style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          <PaymentScreen />
        </Layout>
      </div>
    </AuthContext.Provider>
  );
}
