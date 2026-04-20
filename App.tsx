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
      <div style={{ 
        flex: 1, 
        width: '100%', 
        minHeight: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '80px 20px 160px', 
        backgroundColor: '#1a0033', 
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '38px', marginBottom: '60px', fontWeight: '900',
