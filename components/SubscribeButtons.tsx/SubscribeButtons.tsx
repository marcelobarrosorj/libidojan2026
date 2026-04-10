import React, { useState } from 'react'

type Props = {
  userId?: string
  email: string
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')

  const paymentLinks = {
    mensal: "https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403",
    semestral: "https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404",
    anual: "https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405"   // substitua pelo seu link real do Anual
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
      alert("Link de pagamento não configurado para este plano. Entre em contato.")
    }
  }

  return (
    <div style={{ padding: '50px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Assinatura Premium - Libido 2026</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Escolha o plano que melhor se encaixa em você</p>
      
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        <button 
          onClick={() => setPlan('mensal')} 
          disabled={plan === 'mensal'}
          style={{ 
            padding: '15px 25px', 
            borderRadius: '10px', 
            backgroundColor: plan === 'mensal' ? '#000' : '#f8f8f8', 
            color: plan === 'mensal' ? '#fff' : '#000',
            border: 'none',
            fontSize: '16px'
          }}
        >
          Mensal<br />R$ 49,90
        </button>

        <button 
          onClick={() => setPlan('semestral')} 
          disabled={plan === 'semestral'}
          style={{ 
            padding: '15px 25px', 
            borderRadius: '10px', 
            backgroundColor: plan === 'semestral' ? '#000' : '#f8f8f8', 
            color: plan === 'semestral' ? '#fff' : '#000',
            border: 'none',
            fontSize: '16px'
          }}
        >
          Semestral<br />R$ 269,46
        </button>

        <button 
          onClick={() => setPlan('anual')} 
          disabled={plan === 'anual'}
          style={{ 
            padding: '15px 25px', 
            borderRadius: '10px', 
            backgroundColor: plan === 'anual' ? '#000' : '#f8f8f8', 
            color: plan === 'anual' ? '#fff' : '#000',
            border: 'none',
            fontSize: '16px'
          }}
        >
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
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(230, 57, 57, 0.3)'
        }}
      >
        Pagar com Stripe - {planLabel}
      </button>

      <p style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        Pagamento seguro • Aceita cartão, boleto e Pix
      </p>
    </div>
  )
}
