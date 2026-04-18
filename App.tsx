import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { User, Plan } from './types';
import { getAuthFlag, setAuthFlag, cache, getUserData } from './services/authUtils';
import { initSecurityLayer } from './services/securityService';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'assinatura'>('assinatura');

  useEffect(() => {
    initSecurityLayer();
    const savedUser = getUserData();
    if (savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
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
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* FORÇA BRUTA MÁXIMA - resolve tela preta para sempre */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 120px',
        backgroundColor: '#1a0033',
        color: '#fff',
        zIndex: 9999,
        overflow: 'visible'
      }}>
        <h1 style={{ fontSize: '38px', marginBottom: '60px', fontWeight: '900', letterSpacing: '-1px' }}>
          Assinatura Premium Libido 2026
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '440px', width: '100%' }}>
          <button 
            onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')}
            style={{ padding: '24px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '20px', fontWeight: '900', boxShadow: '0 15px 40px rgba(0,255,136,0.5)' }}
          >
            Mensal — R$ 49,90
          </button>
          <button 
            onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')}
            style={{ padding: '24px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '20px', fontWeight: '900', boxShadow: '0 15px 40px rgba(0,255,136,0.5)' }}
          >
            Semestral — R$ 269,46
          </button>
          <button 
            onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')}
            style={{ padding: '24px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '20px', fontWeight: '900', boxShadow: '0 15px 40px rgba(0,255,136,0.5)' }}
          >
            Anual — R$ 479,04
          </button>
        </div>
      </div>
    </Layout>
  );
}
