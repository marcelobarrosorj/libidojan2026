import React from 'react';

export default function App() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ff00ff',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '50px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      TESTE FINAL<br /><br />
      FUNDO ROSA FORTE<br /><br />
      SE VOCÊ VÊ ESTE TEXTO, O APP RENDERIZOU
    </div>
  );
}
