import React, { useState } from 'react';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #050505 0%, #1a0033 100%)',color:'#fff',padding:'20px'}}>
        <div style={{textAlign:'center',maxWidth:'400px',width:'100%'}}>
          <h1 style={{fontSize:'36px',marginBottom:'40px',fontWeight:'900',background:'linear-gradient(45deg, #00ff88, #ff00aa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            Libido 2026
          </h1>
          <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <button onClick={() => setAuthenticated(true)} style={{padding:'20px',fontSize:'20px',background:'linear-gradient(45deg, #00ff88, #00cc66)',color:'#000',border:'none',borderRadius:'16px',fontWeight:'bold',boxShadow:'0 12px 32px rgba(0,255,136,0.4)',cursor:'pointer',transition:'all 0.3s ease'}}>
              Login com Email/PIN
            </button>
            <button onClick={() => alert('Cadastro em desenvolvimento')} style={{padding:'20px',fontSize:'20px',background:'linear-gradient(45deg, #ff00aa, #cc0099)',color:'#fff',border:'none',borderRadius:'16px',fontWeight:'bold',boxShadow:'0 12px 32px rgba(255,0,170,0.4)',cursor:'pointer',transition:'all 0.3s ease'}}>
              Criar Nova Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',maxWidth:'480px',margin:'0 auto',background:'linear-gradient(180deg, #050505 0%, #1a0033 100%)'}}>
      <header style={{padding:'24px 20px',background:'rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.1)',position:'sticky',top:0,zIndex:50}}>
        <h1 style={{fontSize:'28px',color:'#fff',fontWeight:'900'}}>LIBIDO</h1>
      </header>
      <main style={{flex:1,padding:'80px 20px 160px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #1a0033 0%, #2a0044 100%)',color:'#fff',overflowY:'auto'}}>
        <h1 style={{fontSize:'38px',marginBottom:'60px',fontWeight:'900',textAlign:'center',background:'linear-gradient(45deg, #00ff88, #ff00aa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          Assinatura Premium
        </h1>
        <div style={{display:'flex',flexDirection:'column',gap:'28px',maxWidth:'440px',width:'100%'}}>
          <button onClick={() => window.open('https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403','_blank')} style={{padding:'24px',fontSize:'24px',background:'linear-gradient(45deg, #00ff88, #00cc66)',color:'#000',border:'none',borderRadius:'20px',fontWeight:'900',boxShadow:'0 20px 48px rgba(0,255,136,0.4)',cursor:'pointer',transition:'all 0.3s ease'}}>
            Mensal — R$ 49,90
          </button>
          <button onClick={() => window.open('https://buy.stripe.com/3cI6o
