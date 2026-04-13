import React, { useState } from 'react'

type Props = {
  userId?: string
  email: string
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const [loading, setLoading] = useState(false)

  const planLabel = plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual'

  const handleSubscribe = async () => {
    if (!email) {
      alert("Você precisa estar logado para assinar")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, plan })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Não foi possível gerar o link de pagamento')
      }
    } catch (error: any) {
      console.error('Erro:', error)
      alert('Erro ao conectar com o Stripe. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '50px 20px', textAlign: 'center' }}>
      <h2>Assinatura Premium</h2>
      
      <div style={{ margin: '30px 0', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setPlan('mensal')} disabled={plan === 'mensal'} style={{ padding: '15px 25px', borderRadius: '10px' }}>
          Mensal - R$ 49,90
        </button>
        <button onClick={() => setPlan('semestral')} disabled={plan === 'semestral'} style={{ padding: '15px 25px', borderRadius: '10px' }}>
          Semestral - R$ 269,46
        </button>
        <button onClick={() => setPlan('anual')} disabled={plan === 'anual'} style={{ padding: '15px 25px', borderRadius: '10px' }}>
          Anual - R$ 479,04
        </button>
      </div>

      <button 
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          padding: '20px 60px',
          fontSize: '19px',
          backgroundColor: '#e63939',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processando...' : `Assinar ${planLabel} agora`}
      </button>
    </div>
  )
}
