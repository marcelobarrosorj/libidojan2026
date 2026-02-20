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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { userId, email, priceId } = req.body as { userId?: string; email?: string; priceId?: string }
  if (!userId || !email || !priceId) {
    return res.status(400).json({ error: 'Missing userId, email, priceId' })
  }

  try {
    // 1) Busca customer no profile
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

    // 3) Cria Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],

      // URLs
      success_url: `${process.env.APP_URL || 'https://libido2026.vercel.app'}/billing/success`,
      cancel_url: `${process.env.APP_URL || 'https://libido2026.vercel.app'}/billing/cancel`,

      // IMPORTANTÍSSIMO: metadata para o webhook
      metadata: { userId, plan: priceId },

      // IMPORTANTÍSSIMO: metadata na subscription (para eventos customer.subscription.*)
      subscription_data: {
        metadata: { userId, plan: priceId }
      }
    })

    return res.status(200).json({ url: session.url })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'internal_error' })
  }
}
