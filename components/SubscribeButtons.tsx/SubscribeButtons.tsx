import React, { useState } from 'react'

type Props = {
  userId?: string
  email: string
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const [loading, setLoading] = useState(false)

  const planLabel = plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual'

  const paymentLinks = {
    mensal: 'https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403',
    semestral: 'https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404',
    anual: 'https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405'
  }

  const handleSubscribe = () => {
    if (!email) {
      alert("Você precisa estar logado para assinar")
      return
    }

    setLoading(true)

    // Redireciona direto para o Payment Link do Stripe
    const link = paymentLinks[plan]
    window.location.href = link
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Escolha seu Plano Premium</h2>
      
      <div style={{ margin: '30px 0', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setPlan('mensal')} 
          disabled={plan === 'mensal'}
          style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: plan === 'mensal' ? '#000' : '#f0f0f0', color: plan === 'mensal' ? '#fff' : '#000' }}
        >
          Mensal - R$ 49,90
        </button>
        <button 
          onClick={() => setPlan('semestral')} 
          disabled={plan === 'semestral'}
          style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: plan === 'semestral' ? '#000' : '#f0f0f0', color: plan === 'semestral' ? '#fff' : '#000' }}
        >
          Semestral - R$ 269,46
        </button>
        <button 
          onClick={() => setPlan('anual')} 
          disabled={plan === 'anual'}
          style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: plan === 'anual' ? '#000' : '#f0f0f0', color: plan === 'anual' ? '#fff' : '#000' }}
        >
          Anual - R$ 479,04
        </button>
      </div>

      <button 
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          padding: '18px 50px',
          fontSize: '18px',
          backgroundColor: loading ? '#666' : '#e63939',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '20px',
          width: '100%',
          maxWidth: '340px'
        }}
      >
        {loading ? 'Redirecionando...' : `Assinar ${planLabel} agora`}
      </button>

      <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
        Pagamento seguro via Stripe • Cancelamento fácil a qualquer momento
      </p>
    </div>
  )
}
