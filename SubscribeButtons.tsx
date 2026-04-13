import React, { useState } from 'react'

export default function SubscribeButtons() {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')

  const links = {
    mensal: "https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403",
    semestral: "https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404",
    anual: "https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405"
  }

  const pagarAgora = () => {
    window.location.href = links[plan]
  }

  return (
    <div style={{ 
      padding: '80px 20px', 
      textAlign: 'center', 
      backgroundColor: '#000', 
      color: '#fff', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '30px' }}>Libido 2026</h1>
      <p style={{ fontSize: '22px', color: '#ccc', marginBottom: '60px' }}>Escolha seu plano de assinatura</p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '70px' }}>
        <button 
          onClick={() => setPlan('mensal')} 
          disabled={plan === 'mensal'}
          style={{ 
            padding: '25px 35px', 
            fontSize: '18px', 
            backgroundColor: plan === 'mensal' ? '#e63939' : '#222', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            minWidth: '180px'
          }}
        >
          Mensal<br />R$ 49,90
        </button>

        <button 
          onClick={() => setPlan('semestral')} 
          disabled={plan === 'semestral'}
          style={{ 
            padding: '25px 35px', 
            fontSize: '18px', 
            backgroundColor: plan === 'semestral' ? '#e63939' : '#222', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            minWidth: '180px'
          }}
        >
          Semestral<br />R$ 269,46
        </button>

        <button 
          onClick={() => setPlan('anual')} 
          disabled={plan === 'anual'}
          style={{ 
            padding: '25px 35px', 
            fontSize: '18px', 
            backgroundColor: plan === 'anual' ? '#e63939' : '#222', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            minWidth: '180px'
          }}
        >
          Anual<br />R$ 479,04
        </button>
      </div>

      <button 
        onClick={pagarAgora}
        style={{
          padding: '25px 90px',
          fontSize: '24px',
          backgroundColor: '#e63939',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          cursor: 'pointer'
        }}
      >
        Pagar agora — {plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual'}
      </button>

      <p style={{ marginTop: '60px', color: '#888' }}>
        Pagamento seguro via Stripe
      </p>
    </div>
  )
}
