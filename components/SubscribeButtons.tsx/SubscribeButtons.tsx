import React, { useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

type Props = {
  userId: string
  email: string
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)

function EmbeddedPay({ userId, email, priceId }: { userId: string; email: string; priceId: string }) {
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
        body: JSON.stringify({ userId, email, priceId })
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha ao iniciar pagamento')
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
        confirmParams: {
          return_url: `${window.location.origin}/billing/success`
        }
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
    <div style={{ marginTop: 12 }}>
      <PaymentElement />
      <button onClick={pay} disabled={loading || !stripe || !elements} style={{ marginTop: 12 }}>
        {loading ? 'Processando...' : 'Confirmar pagamento'}
      </button>
    </div>
  )
}

export default function SubscribeButtons({ userId, email }: Props) {
  // ⚠️ TROQUE pelos seus Price IDs LIVE
  const PRICE_MENSAL = 'price_SEU_MENSAL_AQUI'
  const PRICE_ANUAL = 'price_SEU_ANUAL_AQUI'

  const [plan, setPlan] = useState<'mensal' | 'anual'>('mensal')
  const [useEmbedded, setUseEmbedded] = useState(false)

  const priceId = plan === 'mensal' ? PRICE_MENSAL : PRICE_ANUAL

  const elementsOptions = useMemo(() => {
    return clientSecret
      ? ({ clientSecret } as any)
      : undefined
  }, [])

  const createCheckout = async () => {
    const r = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, priceId })
    })
    const j = await r.json()
    if (!r.ok) return alert(j.error || 'Falha ao iniciar checkout')
    window.location.href = j.url
  }

  // Hack simples: Elements precisa do clientSecret; vamos inicializar dentro do EmbeddedPay via init()
  // então aqui só montamos o wrapper.
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const EmbeddedWrapper = () => (
    <Elements stripe={stripePromise} options={clientSecret ? ({ clientSecret } as any) : undefined}>
      <EmbeddedPay userId={userId} email={email} priceId={priceId} />
    </Elements>
  )

  return (
    <div>
      <h3>Assinatura Premium</h3>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setPlan('mensal')} disabled={plan === 'mensal'}>
          Mensal
        </button>
        <button onClick={() => setPlan('anual')} disabled={plan === 'anual'}>
          Anual
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={createCheckout}>Assinar (Checkout)</button>
        <button onClick={() => setUseEmbedded(v => !v)} style={{ marginLeft: 8 }}>
          {useEmbedded ? 'Ocultar modo compatível' : 'Problemas no checkout? Pagar aqui'}
        </button>
      </div>

      {useEmbedded && (
        <div style={{ marginTop: 16, maxWidth: 420 }}>
          <EmbeddedWrapper />
        </div>
      )}
    </div>
  )
}
