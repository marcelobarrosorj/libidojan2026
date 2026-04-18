import React from 'react';

export default function App() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #4b0082, #1a0033)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      zIndex: 999999
    }}>
      <h1 style={{ fontSize: '42px', marginBottom: '60px', fontWeight: 'bold' }}>
        ASSINATURA PREMIUM LIBIDO 2026
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%', maxWidth: '420px' }}>
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

      <p style={{ marginTop: '60px', fontSize: '18px', color: '#ddd' }}>
        Pagamento abre em nova aba • Seguro via Stripe
      </p>
    </div>
  );
}
