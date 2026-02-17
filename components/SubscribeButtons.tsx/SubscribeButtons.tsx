import React, { useState } from 'react'

type Props = {
  userId: string
  email: string
}

export function SubscribeButtons({ userId, email }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId?: string) => {
    try {
      setLoading(priceId ?? 'mensal')

      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, priceId })
      })

      const data = await response.json()

      if (!response.ok || !data?.ok || !data?.url) {
        alert(data?.error ?? 'Falha ao criar sessão de checkout')
        return
      }

      window.location.href = data.url
    } catch (e: any) {
      alert(e?.message ?? 'Erro inesperado')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <button disabled={!!loading} onClick={() => handleSubscribe()}>
        {loading === 'mensal' ? 'Redirecionando...' : 'Assinar Mensal (R$ 49,90)'}
      </button>

      <button disabled={!!loading} onClick={() => handleSubscribe('price_1SubyDEqSklIuetZHbet7AUe')}>
        {loading === 'price_1SubyDEqSklIuetZHbet7AUe' ? 'Redirecionando...' : 'Assinar Semestral (R$ 269,46)'}
      </button>

      <button disabled={!!loading} onClick={() => handleSubscribe('price_1SubyxEqSklIuetZbolIi7RF')}>
        {loading === 'price_1SubyxEqSklIuetZbolIi7RF' ? 'Redirecionando...' : 'Assinar Anual (R$ 479,04)'}
      </button>
    </div>
  )
}
