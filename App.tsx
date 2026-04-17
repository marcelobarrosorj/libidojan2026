import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './components/Auth';
import { User, Plan } from './types';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData } from './services/authUtils';
import { initSecurityLayer } from './services/securityService';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
  };

  // Tela de pagamento VISÍVEL E FORTE (sem Layout nenhum)
  const PaymentScreen = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4b0082, #1a0033)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '42px', marginBottom: '60px', fontWeight: 'bold' }}>
        ASSINATURA PREMIUM LIBIDO 2026
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%', maxWidth: '420px' }}>
        <button
          onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')}
          style={{ padding: '22px', fontSize: '22px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,255,136,0.4)' }}
        >
          Mensal — R$ 49,90
        </button>
        <button
          onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')}
          style={{ padding: '22px', fontSize: '22px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,255,136,0.4)' }}
        >
          Semestral — R$ 269,46
        </button>
        <button
          onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')}
          style={{ padding: '22px', fontSize: '22px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,255,136,0.4)' }}
        >
          Anual — R$ 479,04
        </button>
      </div>

      <p style={{ marginTop: '60px', fontSize: '18px', color: '#ddd' }}>
        Pagamento abre em nova aba • Seguro via Stripe
      </p>
    </div>
  );

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return <PaymentScreen />;
}
