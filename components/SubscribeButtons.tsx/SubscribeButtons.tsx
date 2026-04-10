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
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, plan })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Não foi possível gerar o link de pagamento')
      }
    } catch (error: any) {
      console.error('Erro:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Assinatura Premium</h2>
      
      <div style={{ margin: '30px 0', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setPlan('mensal')} 
          disabled={plan === 'mensal'}
          style={{ padding: '12px 24px', borderRadius: '8px' }}
        >
          Mensal - R$ 49,90
        </button>
        <button 
          onClick={() => setPlan('semestral')} 
          disabled={plan === 'semestral'}
          style={{ padding: '12px 24px', borderRadius: '8px' }}
        >
          Semestral - R$ 269,46
        </button>
        <button 
          onClick={() => setPlan('anual')} 
          disabled={plan === 'anual'}
          style={{ padding: '12px 24px', borderRadius: '8px' }}
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
          backgroundColor: '#e63939',
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
