import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Explore from './components/Explore';
import ChatList from './components/ChatList';
import Profile from './components/Profile';
import ChatDetail from './components/ChatDetail';
import Feed from './components/Feed';
import EventsPage from './components/EventsPage';
import { TermsGate } from './components/TermsGate';
import { shouldShowTermsGate, recordTermsAcceptance } from './services/termsGate';
import { User, Gender, SexualOrientation, Biotype, Vibes, Plan, TrustLevel, UserType } from './types';
import { getAuthFlag, setAuthFlag, syncCaches, cache, getUserData } from './services/authUtils';
import { isUnlockedWindowValid, clearUnlockedWindow } from './services/pinService';
import { initSecurityLayer } from './services/securityService';

// Componente SubscribeButtons embutido (sem import externo)
const SubscribeButtons = ({ userId, email }: { userId: string; email: string }) => {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal');
  const [loading, setLoading] = useState(false);

  const planLabel = plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual';

  const createCheckout = async () => {
    if (!email) {
      alert("Você precisa estar logado para assinar");
      return;
    }
    setLoading(true);
    try {
      // Links diretos do Stripe (funcionaram antes)
      const links = {
        mensal: 'https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403',
        semestral: 'https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404',
        anual: 'https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405'
      };
      window.open(links[plan], '_blank');
    } catch (error) {
      alert('Erro ao abrir link de pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Assinatura Premium - Libido 2026</h2>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        <button
          onClick={() => setPlan('mensal')}
          disabled={plan === 'mensal'}
          style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: plan === 'mensal' ? '#fff' : '#333', color: plan === 'mensal' ? '#000' : '#fff' }}
        >
          Mensal - R$ 49,90
        </button>
        <button
          onClick={() => setPlan('semestral')}
          disabled={plan === 'semestral'}
          style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: plan === 'semestral' ? '#fff' : '#333', color: plan === 'semestral' ? '#000' : '#fff' }}
        >
          Semestral - R$ 269,46
        </button>
        <button
          onClick={() => setPlan('anual')}
          disabled={plan === 'anual'}
          style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: plan === 'anual' ? '#fff' : '#333', color: plan === 'anual' ? '#000' : '#fff' }}
        >
          Anual - R$ 479,04
        </button>
      </div>

      <button
        onClick={createCheckout}
        disabled={loading}
        style={{
          padding: '16px 40px',
          fontSize: '18px',
          backgroundColor: '#fff',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Abrindo...' : `Assinar ${planLabel} Agora`}
      </button>

      <p style={{ marginTop:
