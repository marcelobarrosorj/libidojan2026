import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import { User, Plan } from './types';
import { setAuthFlag, cache, getUserData } from './services/authUtils';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
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

  // Tela de assinatura FORÇADA e VISÍVEL
  const PaymentScreen = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#4b0082',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '40px', textAlign: 'center' }}>
        LIBIDO 2026<br />PREMIUM
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>
        <button
          onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')}
          style={{ padding: '25px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Mensal — R$ 49,90
        </button>
        <button
          onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')}
          style={{ padding: '25px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Semestral — R$ 269,46
        </button>
        <button
          onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')}
          style={{ padding: '25px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
        >
          Anual — R$ 479,04
        </button>
      </div>

      <p style={{ marginTop: '50px', fontSize: '18px', opacity: 0.8 }}>
        Pagamento abre em nova aba • Seguro via Stripe
      </p>
    </div>
  );

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return <PaymentScreen />;
}
