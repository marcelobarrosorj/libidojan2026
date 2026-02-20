import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
})

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

type Body = {
  userId?: string
  email?: string
  // você pode mandar priceId do front, mas recomendo usar as env STRIPE_PRICE_ID_*
  plan?: 'mensal' | 'semestral' | 'anual'
  priceId?: string
}

function getPriceId(body: Body) {
  // Prioridade: se vier priceId do front, usa; senão usa env por plano
  if (body.priceId) return body.priceId

  const plan = body.plan || 'mensal'
  if (plan === 'mensal') return process.env.STRIPE_PRICE_ID_MENSAL
  if (plan === 'semestral') return process.env.STRIPE_PRICE_ID_SEMESTRAL
  if (plan === 'anual') return process.env.STRIPE_PRICE_ID_ANUAL
  return process.env.STRIPE_PRICE_ID_MENSAL
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const body = (req.body || {}) as Body
  const userId = body.userId
  const email = body.email
  const priceId = getPriceId(body)

  if (!userId || !email || !priceId) {
    return res.status(400).json({ error: 'Missing userId, email, or priceId/plan' })
  }

  try {
    // 1) Carrega profile e customer
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profileErr) return res.status(500).json({ error: profileErr.message })

    let customerId = profile?.stripe_customer_id || null

    // 2) Cria customer se não existir
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      })
      customerId = customer.id

      const { error: upErr } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)

      if (upErr) return res.status(500).json({ error: upErr.message })
    }

    // 3) Cria checkout session (subscription)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],

      success_url: `${process.env.APP_URL || 'https://libido2026.vercel.app'}/billing/success`,
      cancel_url: `${process.env.APP_URL || 'https://libido2026.vercel.app'}/billing/cancel`,

      // 🔑 MUITO IMPORTANTE: metadata para webhook
      metadata: { userId, plan: priceId },

      // 🔑 MUITO IMPORTANTE: metadata na assinatura (para customer.subscription.*)
      subscription_data: {
        metadata: { userId, plan: priceId }
      },

      // Ajuda a reduzir falhas de autenticação
      payment_method_collection: 'always',
      payment_method_options: {
        card: { request_three_d_secure: 'any' }
      },

      // 1 hora de validade (evita expirar rápido)
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60
    })

    return res.status(200).json({ url: session.url })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'internal_error' })
  }
}
