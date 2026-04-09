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
    console.log(`🚀 Iniciando checkout - Plano: ${plan} | Email: ${email}`)

    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          userId, 
          email, 
          plan 
        })
      })

      const data = await response.json()

      console.log('📥 Resposta do servidor:', data)

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP ${response.status}`)
      }

      if (data.url) {
        console.log('✅ Redirecionando para Stripe:', data.url)
        window.location.href = data.url
      } else {
        alert('Erro: O Stripe não retornou o link de pagamento')
      }
    } catch (error: any) {
      console.error('❌ Erro completo no checkout:', error)
      alert(`Falha no pagamento: ${error.message || 'Erro de conexão com o Stripe'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Assinatura Premium</h2>
      
      <div style={{ margin: '30px 0', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {(['mensal', 'semestral', 'anual'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            disabled={plan === p}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              backgroundColor: plan === p ? '#000' : '#f1f1f1',
              color: plan === p ? '#fff' : '#000',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
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
          marginTop: '20px',
          width: '100%',
          maxWidth: '340px'
        }}
      >
        {loading ? 'Processando pagamento...' : `Assinar ${planLabel} agora`}
      </button>

      <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
        Pagamento 100% seguro via Stripe • Cancelamento fácil a qualquer momento
      </p>
    </div>
  )
}
