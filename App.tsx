import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './Auth';
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
      <div className="flex-1 min-h-0 pt-24 pb-28 px-4 overflow-y-auto bg-[#1a0033]">
        <h1 className="text-4xl font-black mb-16 text-center text-white tracking-tight">Assinatura Premium Libido 2026</h1>
        <div className="flex flex-col gap-7 max-w-md mx-auto w-full">
          <button onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')} 
            className="p-6 text-2xl bg-[#00ff88] text-black font-black rounded-3xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all">
            Mensal — R$ 49,90
          </button>
          <button onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')} 
            className="p-6 text-2xl bg-[#00ff88] text-black font-black rounded-3xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all">
            Semestral — R$ 269,46
          </button>
          <button onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')} 
            className="p-6 text-2xl bg-[#00ff88] text-black font-black rounded-3xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all">
            Anual — R$ 479,04
          </button>
        </div>
      </div>
    </Layout>
  );
}
