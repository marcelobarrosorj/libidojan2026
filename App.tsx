import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Plan } from './types';
import { getAuthFlag, setAuthFlag, cache, getUserData, saveUserData } from './services/authUtils';
import { initSecurityLayer } from './services/securityService';

// AuthContext completo (fix erro "must be initialized")
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

  const handleLoginSuccess = (user: Partial<User>) => {
    const premiumUser = { ...user, id: `u-${Date.now()}`, nickname: 'Usuário Premium', age: 30, balance: 0, boosts_active: 0, trustLevel: 'Ouro', avatar: 'https://picsum.photos/id/64/300/300', following: [] } as User;
    if (user.email && (user.email.includes('marcelobarrosorj') || user.email.includes('libidoapp'))) {
      premiumUser.plan = Plan.GOLD;
      premiumUser.is_premium = true;
    }
    setCurrentUser(premiumUser);
    setIsAuthenticated(true);
    setAuthFlag(true);
    cache.userData = premiumUser;
    saveUserData(premiumUser);
  };

  // Stub Auth (completo, usa handleLoginSuccess)
  const AuthComponent = () => (
    <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '60px' }}>Bem-vindo ao Libido 2026</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '320px', margin: '0 auto' }}>
        <button onClick={() => alert('Funcionalidade em desenvolvimento')} style={{ padding: '16px', fontSize: '18px', background: '#ff00aa', color: '#fff', border: 'none', borderRadius: '12px' }}>Criar Nova Conta</button>
        <button onClick={() => alert('Funcionalidade em desenvolvimento')} style={{ padding: '16px', fontSize: '18px', background: '#333', color: '#fff', border: 'none', borderRadius: '12px' }}>Acessar com PIN</button>
        <button onClick={() => handleLoginSuccess({ email: 'marcelobarrosorj@gmail.com' })} style={{ padding: '16px', fontSize: '18px', background: '#00aa00', color: '#fff', border: 'none', borderRadius: '12px' }}>Entrar com Email (Acesso Rápido)</button>
      </div>
    </div>
  );

  // Stub Layout (completo, mobile-first, sem overflow-hidden)
  const LayoutComponent = ({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab: string; setActiveTab: (tab: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '480px', margin: '0 auto', backgroundColor: '#050505', borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
      {/* Header stub */}
      <header style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>LIBIDO</h1>
        <button onClick={() => setActiveTab('profile')} style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}>⚙️</button>
      </header>
      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {children}
      </main>
      {/* Nav stub */}
      <nav style={{ padding: '16px', display: 'flex', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.8)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => setActiveTab('feed')} style={{ color: activeTab === 'feed' ? '#ffd700' : '#aaa' }}>Feed</button>
        <button onClick={() => setActiveTab('assinatura')} style={{ color: activeTab === 'assinatura' ? '#ffd700' : '#aaa' }}>Assinar</button>
        <button onClick={() => setActiveTab('profile')} style={{ color: activeTab === 'profile' ? '#ffd700' : '#aaa' }}>Perfil</button>
      </nav>
    </div>
  );

  if (!isAuthenticated) {
    return <AuthComponent />;
  }

  return (
    <LayoutComponent activeTab={activeTab} setActiveTab={setActiveTab}>
      <div style={{ 
        flex: 1, width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 160px', backgroundColor: '#1a0033', color: '#fff' 
      }}>
        <h1 style={{ fontSize: '38px', marginBottom: '60px', fontWeight: '900', letterSpacing: '-1px' }}>
          Assinatura Premium Libido 2026
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '440px', width: '100%' }}>
          <button onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')} style={{ padding: '24px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '20px', fontWeight: '900', boxShadow: '0 15px 40px rgba(0,255,136,0.5)' }}>Mensal — R$ 49,90</button>
          <button onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc
