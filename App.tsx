import React, { useState } from 'react';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#050505',color:'#fff',padding:'20px'}}>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontSize:'32px',marginBottom:'40px'}}>Libido 2026</h1>
          <button onClick={() => setAuthenticated(true)} style={{width:'100%',padding:'16px',fontSize:'18px',background:'#00ff88',color:'#000',border:'none',borderRadius:'12px',fontWeight:'bold'}}>
            Entrar Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',maxWidth:'480px',margin:'0 auto',background:'#050505'}}>
      <header style={{padding:'24px 20px',background:'rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <h1 style={{fontSize:'28px',color:'#fff'}}>LIBIDO</h1>
      </header>
      <main style={{flex:1,padding:'80px 20px 160px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#1a0033',color:'#fff',overflowY:'auto'}}>
        <h1 style={{fontSize:'38px',marginBottom:'60px',fontWeight:'900',textAlign:'center'}}>Assinatura Premium</h1>
        <div style={{display:'flex',flexDirection:'column',gap:'28px',maxWidth:'440px',width:'100%'}}>
          <button onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403','_blank')} style={{padding:'24px',fontSize:'24px',background:'#00ff88',color:'#000',border:'none',borderRadius:'20px',fontWeight:'900',boxShadow:'0 15px 40px rgba(0,255,136,0.5)'}}>
            Mensal — R$ 49,90
          </button>
          <button onClick={() => window.open('https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404','_blank')} style={{padding:'24px',fontSize:'24px',background:'#00ff88',color:'#000',border:'none',borderRadius:'20px',fontWeight:'900',boxShadow:'0 15px 40px rgba(0,255,136,0.5)'}}>
            Semestral — R$ 269,46
          </button>
          <button onClick={() => window.open('https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405','_blank')} style={{padding:'24px',fontSize:'24px',background:'#00ff88',color:'#000',border:'none',borderRadius:'20px',fontWeight:'900',boxShadow:'0 15px 40px rgba(0,255,136,0.5)'}}>
            Anual — R$ 479,04
          </button>
        </div>
      </main>
    </div>
  );
}
