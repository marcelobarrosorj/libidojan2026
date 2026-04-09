import React, { useState } from 'react'

type Props = {
  userId: string
  email: string
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const [loading, setLoading] = useState(false)

  const planLabel = plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual'

  const createCheckout = async () => {
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

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar o pagamento')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Não foi possível gerar o link de pagamento')
      }
    } catch (error: any) {
      console.error('Erro completo:', error)
      alert('Erro de conexão com o pagamento. Tente novamente em alguns segundos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '30px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h3>Assinatura Premium</h3>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '25px 0', flexWrap: 'wrap' }}>
        <button onClick={() => setPlan('mensal')} disabled={plan === 'mensal'} style={{ padding: '12px 20px' }}>
          Mensal
        </button>
        <button onClick={() => setPlan('semestral')} disabled={plan === 'semestral'} style={{ padding: '12px 20px' }}>
          Semestral
        </button>
        <button onClick={() => setPlan('anual')} disabled={plan === 'anual'} style={{ padding: '12px 20px' }}>
          Anual
        </button>
      </div>

      <button 
        onClick={createCheckout}
        disabled={loading}
        style={{
          padding: '16px 40px',
          fontSize: '18px',
          backgroundColor: loading ? '#666' : '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          maxWidth: '320px'
        }}
      >
        {loading ? 'Processando...' : `Assinar ${planLabel} agora`}
      </button>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Pagamento seguro processado pelo Stripe
      </p>
    </div>
  )
}
