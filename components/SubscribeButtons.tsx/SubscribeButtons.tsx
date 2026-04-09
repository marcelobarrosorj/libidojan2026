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
    console.log('🚀 Iniciando checkout para plano:', plan)

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

      console.log('Status da resposta:', response.status)

      const data = await response.json()
      console.log('Resposta completa:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido do servidor')
      }

      if (data.url) {
        console.log('Redirecionando para:', data.url)
        window.location.href = data.url
      } else {
        alert('Não foi possível gerar o link de pagamento')
      }
    } catch (error: any) {
      console.error('❌ Erro completo:', error)
      alert(`Erro: ${error.message || 'Falha na conexão com o Stripe'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2>Escolha seu Plano</h2>
      
      <div style={{ margin: '30px 0', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {(['mensal', 'semestral', 'anual'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            disabled={plan === p}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              backgroundColor: plan === p ? '#000' : '#f0f0f0',
              color: plan === p ? '#fff' : '#000',
              border: 'none'
            }}
          >
            {p === 'mensal' ? 'Mensal' : p === 'semestral' ? 'Semestral' : 'Anual'}
          </button>
        ))}
      </div>

      <button 
        onClick={createCheckout}
        disabled={loading}
        style={{
          padding: '18px 50px',
          fontSize: '18px',
          backgroundColor: loading ? '#666' : '#e63939',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '20px'
        }}
      >
        {loading ? 'Processando...' : `Assinar ${planLabel} agora`}
      </button>
    </div>
  )
}
