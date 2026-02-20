import React, { useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

type Props = {
  userId: string
  email: string
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)

function EmbeddedPay({ userId, email, plan }: { userId: string; email: string; plan: 'mensal' | 'semestral' | 'anual' }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const init = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/billing/create-subscription-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, plan })
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha ao iniciar pagamento (modo compatível)')
      setClientSecret(j.clientSecret)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const pay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/billing/success` }
      })
      if (error) alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!clientSecret) {
    return (
      <div style={{ marginTop: 12 }}>
        <button onClick={init} disabled={loading}>
          {loading ? 'Carregando...' : 'Pagar aqui (modo compatível)'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 12, maxWidth: 420 }}>
      <PaymentElement />
      <button onClick={pay} disabled={loading || !stripe || !elements} style={{ marginTop: 12 }}>
        {loading ? 'Processando...' : 'Confirmar pagamento'}
      </button>
    </div>
  )
}

export default function SubscribeButtons({ userId, email }: Props) {
  const [plan, setPlan] = useState&lt;'mensal' | 'semestral' | 'anual'>('mensal')
  const [showEmbedded, setShowEmbedded] = useState(false)

  const createCheckout = async () => {
    const r = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, plan })
    })
    const j = await r.json()
    if (!r.ok) return alert(j.error || 'Falha ao iniciar checkout')
    window.location.href = j.url
  }

  const planLabel =
    plan === 'mensal' ? 'Mensal' : plan === 'semestral' ? 'Semestral' : 'Anual'

  return (
    <div>
      <h3>Assinatura Premium</h3>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setPlan('mensal')} disabled={plan === 'mensal'}>Mensal</button>
        <button onClick={() => setPlan('semestral')} disabled={plan === 'semestral'}>Semestral</button>
        <button onClick={() => setPlan('anual')} disabled={plan === 'anual'}>Anual</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={createCheckout}>Assinar ({planLabel})</button>
        <button onClick={() => setShowEmbedded(v => !v)} style={{ marginLeft: 8 }}>
          {showEmbedded ? 'Ocultar modo compatível' : 'Problemas no checkout? Pagar aqui'}
        </button>
      </div>

      {showEmbedded && (
        <div style={{ marginTop: 16 }}>
          <Elements stripe={stripePromise} options={useMemo(() => ({}), []) as any}>
            <EmbeddedPay userId={userId} email={email} plan={plan} />
          </Elements>
        </div>
      )}
    </div>
  )
}
