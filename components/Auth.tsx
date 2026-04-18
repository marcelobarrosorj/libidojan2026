import React, { useState } from 'react';
import { useAuth } from '../App';
import { saveUserData, setAuthFlag, getUserData, showNotification } from '../services/authUtils';
import { User, Plan, TrustLevel } from '../types';

const Auth: React.FC = () => {
  const { setIsAuthenticated, setIsUnlocked } = useAuth();
  const [view, setView] = useState<'landing'>('landing');

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
    showNotification('✅ Acesso liberado como Premium!', 'success');
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '60px' }}>Bem-vindo ao Libido 2026</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '320px', margin: '0 auto' }}>
        <button 
          onClick={() => alert('Funcionalidade em desenvolvimento')}
          style={{ padding: '16px', fontSize: '18px', background: '#ff00aa', color: '#fff', border: 'none', borderRadius: '12px' }}
        >
          Criar Nova Conta
        </button>

        <button 
          onClick={() => alert('Funcionalidade em desenvolvimento')}
          style={{ padding: '16px', fontSize: '18px', background: '#333', color: '#fff', border: 'none', borderRadius: '12px' }}
        >
          Acessar com PIN
        </button>

        <button 
          onClick={handleLoginWithEmail}
          style={{ padding: '16px', fontSize: '18px', background: '#00aa00', color: '#fff', border: 'none', borderRadius: '12px' }}
        >
          Entrar com Email (Acesso Rápido)
        </button>
      </div>
    </div>
  );
};

export default Auth;
