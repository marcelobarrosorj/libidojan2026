import React, { useState } from 'react';
import { useAuth } from '../App';
import { RegistrationFlow } from './RegistrationFlow';
import { PinSetup } from './PinSetup';
import { PinUnlock } from './PinUnlock';
import { saveUserData, setAuthFlag, getUserData, showNotification } from '../services/authUtils';
import { User, Plan, TrustLevel } from '../types';

const Auth: React.FC = () => {
  const { setIsAuthenticated, setIsUnlocked } = useAuth();
  const [view, setView] = useState<'landing' | 'register' | 'pin' | 'unlock'>('landing');
  const [regData, setRegData] = useState<any>(null);

  const handleRegistrationComplete = (payload: any) => {
    setRegData(payload);
    setView('pin');
  };

  const handleAccessWithPin = () => {
    const existing = getUserData();
    if (existing) {
      setView('unlock');
    } else {
      showNotification('Nenhuma conta encontrada neste dispositivo. Crie uma nova conta.', 'info');
    }
  };

  const handlePinDone = () => {
    const data = regData?.data || getUserData();
    if (!data) {
      showNotification('Erro ao recuperar dados do PIN.', 'error');
      return;
    }

    const newUser: User = {
      id: data.id || `u-${Date.now()}`,
      nickname: data.nickname || 'Usuário Premium',
      email: data.email || 'marcelobarrosorj@gmail.com',
      age: data.age || 30,
      plan: Plan.GOLD,
      is_premium: true,
      balance: 0,
      boosts_active: 0,
      trustLevel: TrustLevel.OURO,
      avatar: data.avatar || 'https://picsum.photos/id/64/300/300',
      following: [],
    };

    saveUserData(newUser);
    setIsAuthenticated(true);
    setIsUnlocked(true);
    setAuthFlag(true);
    showNotification('Acesso liberado com PIN!', 'success');
  };

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
    showNotification('Acesso liberado como Premium!', 'success');
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      {view === 'landing' && (
        <>
          <h1 style={{ fontSize: '32px', marginBottom: '50px' }}>Bem-vindo ao Libido 2026</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '340px', margin: '0 auto' }}>
            <button 
              onClick={() => setView('register')}
              style={{ padding: '18px', fontSize: '18px', background: '#ff00aa', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
            >
              Criar Nova Conta
            </button>

            <button 
              onClick={handleAccessWithPin}
              style={{ padding: '18px', fontSize: '18px', background: '#333', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
            >
              Acessar com PIN
            </button>

            <button 
              onClick={handleLoginWithEmail}
              style={{ padding: '18px', fontSize: '18px', background: '#00aa00', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
            >
              Entrar com Email (Acesso Rápido)
            </button>
          </div>
        </>
      )}

      {view === 'register' && <RegistrationFlow onComplete={handleRegistrationComplete} />}
      {view === 'pin' && <PinSetup onComplete={handlePinDone} />}
      {view === 'unlock' && <PinUnlock onSuccess={handlePinDone} />}
    </div>
  );
};

export default Auth;
