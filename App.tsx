import React, { useState } from 'react';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  // Tela de login
  if (!authenticated) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif',
      }}>
        <h1 style={{ color: 'white', marginBottom: '20px' }}>Login</h1>
        <button
          onClick={() => setAuthenticated(true)}
          style={{
            padding: '12px 24px',
            margin: '10px',
            fontSize: '18px',
            background: 'linear-gradient(135deg, #00ff88 0%, #ff00aa 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
        >
          Login Email/PIN
        </button>
        <button
          onClick={() => alert('Cadastro em desenvolvimento')}
          style={{
            padding: '12px 24px',
            margin: '10px',
            fontSize: '18px',
            background: 'linear-gradient(135deg, #ffaa00 0%, #aa00ff 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
        >
          Cadastro
        </button>
      </div>
    );
  }

  // Tela premium
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, #00ff88 0%, #ff00aa 100%)',
          color: 'white',
          padding: '16px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1,
        }}
      >
        LIBIDO
      </header>
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px',
        }}
      >
        <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '28px' }}>Assinatura Premium</h1>
        <a
          href="https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '24px',
            margin: '10px 0',
            fontSize: '24px',
            background: 'linear-gradient(135deg, #00ff88 0%, #ff00aa 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          Mensal
        </a>
        <a
          href="https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '24px',
            margin: '10px 0',
            fontSize: '24px',
            background: 'linear-gradient(135deg, #00ff88 0%, #ff00aa 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          Semestral
        </a>
        <a
          href="https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '24px',
            margin: '10px 0',
            fontSize: '24px',
            background: 'linear-gradient(135deg, #00ff88 0%, #ff00aa 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          Anual
        </a>
      </main>
    </div>
  );
}

export default App;
