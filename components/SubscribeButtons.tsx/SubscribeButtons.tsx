import React, { useState } from 'react'

type Props = {
  userId: string
  email: string
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const [loading, setLoading] = useState(false)

  const planLabel =
    plan === 'mensal' ? 'Mensal' :
    plan === 'semestral' ? 'Semestral' : 'Anual'

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
        body: JSON.stringify({
          userId,
          email,
          plan
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar assinatura')
      }

      if (data.url) {
        window.location.href = data.url  // Redireciona para o Stripe
      } else {
        alert('Erro: Link de pagamento não gerado')
      }
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Assinatura Premium</h3>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
        <button 
          onClick={() => setPlan('mensal')} 
          disabled={plan === 'mensal'}
          style={{ padding: '10px 16px' }}
        >
          Mensal
        </button>
        <button 
          onClick={() => setPlan('semestral')} 
          disabled={plan === 'semestral'}
          style={{ padding: '10px 16px' }}
        >
          Semestral
        </button>
        <button 
          onClick={() => setPlan('anual')} 
          disabled={plan === 'anual'}
          style={{ padding: '10px 16px' }}
        >
          Anual
        </button>
      </div>

      <button 
        onClick={createCheckout} 
        disabled={loading}
        style={{ 
          padding: '14px 32px', 
          fontSize: '16px', 
          backgroundColor: '#000', 
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Carregando...' : `Assinar ${planLabel}`}
      </button>

      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Pagamento seguro via Stripe • Cancelamento a qualquer momento
      </p>
    </div>
  )
}
