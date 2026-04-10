import React, { useState } from 'react'

type Props = {
  userId?: string
  email: string
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')

  const links = {
    mensal: "https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403",
    semestral: "https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404",
    anual: "https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405"
  }

  const handleSubscribe = () => {
    if (!email) {
      alert("Você precisa estar logado para assinar")
      return
    }

    const link = links[plan]
    window.location.href = link
  }

  return (
    <div style={{ padding: '50px 20px', textAlign: 'center' }}>
      <h2>Assinatura Premium - Libido 2026</h2>
      
      <div style={{ margin: '30px 0', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setPlan('mensal')} disabled={plan === 'mensal'} style={{ padding: '15px 25px', borderRadius: '10px' }}>
          Mensal<br />R$ 49,90
        </button>
        <button onClick={() => setPlan('semestral')} disabled={plan === 'semestral'} style={{ padding: '15px 25px', borderRadius: '10px' }}>
          Semestral<br />R$ 269,46
        </button>
        <button onClick={() => setPlan('anual')} disabled={plan === 'anual'} style={{ padding: '15px 25px', borderRadius: '10px' }}>
          Anual<br />R$ 479,04
        </button>
      </div>

      <button 
        onClick={handleSubscribe}
        style={{
          padding: '18px 60px',
          fontSize: '19px',
          backgroundColor: '#e63939',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer'
        }}
      >
        Ir para pagamento - {planLabel}
      </button>

      <p style={{ marginTop: '30px', color: '#666' }}>
        Pagamento seguro via Stripe • Aceita cartão, boleto e Pix
      </p>
    </div>
  )
}
