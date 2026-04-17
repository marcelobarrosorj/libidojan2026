import React from 'react';
import { useAuth } from '../App';
import { saveUserData, setAuthFlag } from '../services/authUtils';
import { User, Plan, TrustLevel } from '../types';

const Auth: React.FC = () => {
  const { setIsAuthenticated, setIsUnlocked } = useAuth();

  const handleLoginWithEmail = () => {
    const premiumUser: User = {
      id: `u-${Date.now()}`,
      nickname: 'Usuário Premium',
      email: 'marcelobarrosorj@gmail.com',
      age: 30,
      plan: Plan.GOLD,
      is_premium: true,
      balance: 0,
      boosts_active: 0,
      trustLevel: TrustLevel.OURO,
      avatar: 'https://picsum.photos/id/64/300/300',
      following: [],
    };

    saveUserData(premiumUser);
    setIsAuthenticated(true);
    setIsUnlocked(true);
    setAuthFlag(true);
    alert('✅ Acesso liberado como Premium!');
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '60px' }}>Bem-vindo ao Libido 2026</h1>
      
      <button 
        onClick={handleLoginWithEmail}
        style={{ 
          padding: '20px 40px', 
          fontSize: '22px', 
          background: '#00aa00', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '12px', 
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Entrar com Email (Acesso Rápido)
      </button>
    </div>
  );
};

export default Auth;
