import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
})

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function buffer(readable: any) {
  const chunks: Buffer[] = []
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

async function updateProfileByUserId(userId: string, patch: Record<string, any>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw new Error(error.message)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const sig = req.headers['stripe-signature']
  if (!sig || typeof sig !== 'string') return res.status(400).send('Missing stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) return res.status(500).send('Missing STRIPE_WEBHOOK_SECRET')

  let event: Stripe.Event

  try {
    const rawBody = await buffer(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        // Marca como active no momento do completion
        await updateProfileByUserId(userId, {
          subscription_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString()
        })
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = (sub.metadata as any)?.userId
        if (!userId) break

        await updateProfileByUserId(userId, {
          subscription_status: sub.status,
          subscription_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString()
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = (sub.metadata as any)?.userId
        if (!userId) break

        await updateProfileByUserId(userId, {
          subscription_status: 'inactive',
          subscription_current_period_end: null,
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString()
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string | null
        if (!subId) break

        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = (sub.metadata as any)?.userId
        if (!userId) break

        await updateProfileByUserId(userId, {
          subscription_status: 'past_due',
          updated_at: new Date().toISOString()
        })
        break
      }

      default:
        break
    }

    return res.status(200).json({ received: true })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'internal_error' })
  }
}
