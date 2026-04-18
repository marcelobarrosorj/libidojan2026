import React, { useState } from 'react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginWithEmail = () => {
    setIsAuthenticated(true);
    alert('✅ Acesso liberado como Premium! (teste)');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center', 
        backgroundColor: '#000', 
        color: '#fff', 
        minHeight: '100vh' 
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '60px' }}>Bem-vindo ao Libido 2026</h1>
        
        <button 
          onClick={handleLoginWithEmail}
          style={{ 
            padding: '20px 50px', 
            fontSize: '22px', 
            backgroundColor: '#00aa00', 
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
  }

  return (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center', 
      backgroundColor: '#1a0033', 
      color: '#fff', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '50px' }}>Assinatura Premium Libido 2026</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '420px', margin: '0 auto' }}>
        <button 
          onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403', '_blank')}
          style={{ padding: '22px', fontSize: '22px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}
        >
          Mensal — R$ 49,90
        </button>
        <button 
          onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404', '_blank')}
          style={{ padding: '22px', fontSize: '22px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}
        >
          Semestral — R$ 269,46
        </button>
        <button 
          onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405', '_blank')}
          style={{ padding: '22px', fontSize: '22px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}
        >
          Anual — R$ 479,04
        </button>
      </div>
    </div>
  );
}
