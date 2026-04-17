import React from 'react';

export default function App() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#00ff00',
      color: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 99999
    }}>
      SE VOCÊ VÊ ESTE TEXTO VERDE GRANDE,<br />
      O REACT ESTÁ FUNCIONANDO!
    </div>
  );
}
