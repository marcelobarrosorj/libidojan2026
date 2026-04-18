import React from 'react';

export default function App() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#00ff00',
      color: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '60px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      TESTE FINAL<br /><br />
      SE VOCÊ VÊ ESTE TEXTO VERDE GRANDE<br />
      O REACT ESTÁ FUNCIONANDO
    </div>
  );
}
