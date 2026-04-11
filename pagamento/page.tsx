import React, { useState } from 'react'

export default function PagamentoPage() {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')

  const links = {
    mensal: "https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403",
    semestral: "https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404",
    anual: "https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405"
  }

  const pagar = () => {
    window.location.href = links[plan]
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '40px' }}>Libido 2026 - Assinatura</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '60px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setPlan('mensal')} style={{ padding: '20px 30px', fontSize: '18px', background: plan === 'mensal' ? '#e63939' : '#222', border: 'none', borderRadius: '10px' }}>
          Mensal<br />R$ 49,90
        </button>
        <button onClick={() => setPlan('semestral')} style={{ padding: '20px 30px', fontSize: '18px', background: plan === 'semestral' ? '#e63939' : '#222', border: 'none', borderRadius: '10px' }}>
          Semestral<br />R$ 269,46
        </button>
        <button onClick={() => setPlan('anual')} style={{ padding: '20px 30px', fontSize: '18px', background: plan === 'anual' ? '#e63939' : '#222', border: 'none', borderRadius: '10px' }}>
          Anual<br />R$ 479,04
        </button>
      </div>

      <button 
        onClick={pagar}
        style={{ 
          padding: '20px 60px', 
          fontSize: '22px', 
          background: '#e63939', 
          color: 'white', 
          border: 'none', 
          borderRadius: '12px',
          cursor: 'pointer'
        }}
      >
        Pagar agora com Stripe
      </button>

      <p style={{ marginTop: '40px', color: '#888' }}>
        Pagamento seguro • Aceita cartão, boleto e Pix
      </p>
    </div>
  )
}
