import React, { useState } from 'react'

export default function PagamentoPage() {
  const [plan, setPlan] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const [loading, setLoading] = useState(false)

  const paymentLinks = {
    mensal: "https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403",
    semestral: "https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404",
    anual: "https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405"
  }

  const handleSubscribe = () => {
    setLoading(true)
    const link = paymentLinks[plan]
    if (link) {
      window.location.href = link
    } else {
      alert("Link não configurado")
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', marginBottom: '10px' }}>Libido 2026</h1>
        <p style={{ fontSize: '20px', color: '#aaa', marginBottom: '50px' }}>
          Escolha seu plano de assinatura
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          <button
            onClick={() => setPlan('mensal')}
            disabled={plan === 'mensal'}
            style={{
              padding: '20px 30px',
              borderRadius: '12px',
              backgroundColor: plan === 'mensal' ? '#e63939' : '#1f1f1f',
              color: 'white',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            Mensal<br />R$ 49,90
          </button>

          <button
            onClick={() => setPlan('semestral')}
            disabled={plan === 'semestral'}
            style={{
              padding: '20px 30px',
              borderRadius: '12px',
              backgroundColor: plan === 'semestral' ? '#e63939' : '#1f1f1f',
              color: 'white',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            Semestral<br />R$ 269,46
          </button>

          <button
            onClick={() => setPlan('anual')}
            disabled={plan === 'anual'}
            style={{
              padding: '20px 30px',
              borderRadius: '12px',
              backgroundColor: plan === 'anual' ? '#e63939' : '#1f1f1f',
              color: 'white',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            Anual<br />R$ 479,04
          </button>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            padding: '22px 60px',
            fontSize: '20px',
            backgroundColor: loading ? '#555' : '#e63939',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          {loading ? 'Redirecionando...' : `Pagar agora - ${planLabel}`}
        </button>

        <p style={{ marginTop: '40px', color: '#888', fontSize: '15px' }}>
          Pagamento seguro via Stripe • Cancelamento a qualquer momento
        </p>
      </div>
    </div>
  )
}
