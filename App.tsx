import React, { createContext, useContext, useState, useEffect } from 'react';

// Types de types.ts
enum Plan { FREE = 'Free', PREMIUM = 'Premium', GOLD = 'Gold' }
interface User { id: string; email: string; nickname: string; plan: Plan; is_premium: boolean; boosts_active: number; following: string[]; }

// authUtils.ts stubbed
const cache = { userData: null as User | null };
function getUserData(): User | null { 
  const raw = localStorage.getItem('libido_user_data_v2');
  if (raw) {
    try { 
      const user = JSON.parse(atob(raw)) as User;
      cache.userData = user;
      return user;
    } catch { }
  }
  return null;
}
function saveUserData(userData: Partial<User>) {
  const current = cache.userData || {} as User;
  const updated = { ...current, ...userData } as User;
  cache.userData = updated;
  localStorage.setItem('libido_user_data_v2', btoa(JSON.stringify(updated)));
}
function setAuthFlag(v: boolean) { localStorage.setItem('libido_auth_active', v ? 'true' : 'false'); }

// securityService.ts stubbed
function initSecurityLayer() { console.log('Security Layer ativa'); }

// AuthContext completo
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
    const premiumUser: User = { 
      id: `u-${Date.now()}`, 
      email: user.email || '', 
      nickname: 'Usuário Premium', 
      plan: Plan.FREE, 
      is_premium: false, 
      boosts_active: 0, 
      following: [] 
    };
    if (user.email && (user.email.includes('marcelobarrosorj') || user.email.includes('libidoapp'))) {
      premiumUser.plan = Plan.GOLD;
      premiumUser.is_premium = true;
    }
    setCurrentUser(premiumUser);
    setIsAuthenticated(true);
    setAuthFlag(true);
    saveUserData(premiumUser);
  };

  // Stub Auth inline
  const AuthComponent = () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: '#fff', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px' }}>Libido 2026</h1>
        <button onClick={() => handleLoginSuccess({ email: 'marcelobarrosorj@gmail.com' })} 
          style={{ width: '100%', padding: '16px', fontSize: '18px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
          Entrar (Acesso Premium)
        </button>
      </div>
    </div>
  );

  // Stub Layout inline (mobile-first, scroll fix)
  const LayoutComponent = ({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab: string; setActiveTab: (tab: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '480px', margin: '0 auto', backgroundColor: '#050505' }}>
      <header style={{ padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>LIBIDO</h1>
        <button onClick={() => setActiveTab('profile')} style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}>⚙️</button>
      </header>
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
        {children}
      </main>
      <nav style={{ padding: '16px', display: 'flex', justifyContent: 'space-around', backgroundColor: 'rgba(10,10,10,0.95)', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'sticky', bottom: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button onClick={() => setActiveTab('feed')} style={{ color: activeTab === 'feed' ? '#ffd700' : '#aaa' }}>Feed</button>
        <button onClick={() => setActiveTab('assinatura')} style={{ color: activeTab === 'assinatura' ? '#ffd700' : '#aaa' }}>Assinar</button>
        <button onClick={() => setActiveTab('profile')} style={{ color: activeTab === 'profile' ? '#ffd700' : '#aaa' }}>Perfil</button>
      </nav>
    </div>
  );

  if (!isAuthenticated) return <AuthComponent />;

  return (
    <LayoutComponent activeTab={activeTab} setActiveTab={setActiveTab}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 160px', backgroundColor: '#1a0033', color: '#fff', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '38px', marginBottom: '60px', fontWeight: '900', letterSpacing: '-1px', textAlign: 'center' }}>
          Assinatura Premium Libido 2026
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '440px', width: '100%' }}>
          <button onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')} 
            style={{ padding: '24px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '20px', fontWeight: '900', boxShadow: '0 15px 40px rgba(0,255,136,0.5)', cursor: 'pointer' }}>
            Mensal — R$ 49,90
          </button>
          <button onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')} 
            style={{ padding: '24px', fontSize: '24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '20px', fontWeight: '900', boxShadow: '0 15px 40px rgba(0,255,136,0.5)', cursor: 'pointer' }}>
            Semestral
