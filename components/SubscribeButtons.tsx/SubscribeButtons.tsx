import React, { useState } from 'react'

type Props = {
  userId?: string
  email: string
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const [loading, setLoading] = useState(false)

  const planLabel = plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual'

  // ←←← Seus Payment Links aqui
  const paymentLinks = {
    mensal: "https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403",
    semestral: "https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404",
    anual: "https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405"   // cole o link do Anual aqui quando tiver
  }

  const handleSubscribe = () => {
    if (!email) {
      alert("Você precisa estar logado para assinar")
      return
    }

    const link = paymentLinks[plan]
    if (link) {
      window.location.href = link
    } else {
      alert("Link de pagamento não configurado para este plano")
    }
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Escolha seu Plano</h2>
      
      <div style={{ margin: '30px 0', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setPlan('mensal')} disabled={plan === 'mensal'} style={{ padding: '12px 24px', borderRadius: '8px' }}>
          Mensal - R$ 49,90
        </button>
        <button onClick={() => setPlan('semestral')} disabled={plan === 'semestral'} style={{ padding: '12px 24px', borderRadius: '8px' }}>
          Semestral - R$ 269,46
        </button>
        <button onClick={() => setPlan('anual')} disabled={plan === 'anual'} style={{ padding: '12px 24px', borderRadius: '8px' }}>
          Anual - R$ 479,04
        </button>
      </div>

      <button 
        onClick={handleSubscribe}
        style={{
          padding: '18px 50px',
          fontSize: '18px',
          backgroundColor: '#e63939',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Pagar com Stripe - {planLabel}
      </button>

      <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
        Pagamento seguro via Stripe • Aceita cartão, boleto e Pix (em breve)
      </p>
    </div>
  )
}
