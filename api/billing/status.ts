import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' })

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { userId, email, priceId } = req.body as { userId?: string; email?: string; priceId?: string }
  if (!userId || !email || !priceId) return res.status(400).json({ error: 'Missing userId, email, priceId' })

  try {
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()
    if (pErr) throw pErr

    let customerId = profile?.stripe_customer_id || null
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { userId } })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId, plan: priceId }
    })

    const pi = (subscription.latest_invoice as any).payment_intent as Stripe.PaymentIntent
    return res.status(200).json({ subscriptionId: subscription.id, clientSecret: pi.client_secret })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
