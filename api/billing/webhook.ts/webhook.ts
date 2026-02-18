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

export const config = {
  api: { bodyParser: false }
}

async function buffer(readable: any) {
  const chunks = []
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    const rawBody = await buffer(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret as string)
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.mode === 'subscription') {
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'active',
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: subscription.status,
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'inactive',
              subscription_current_period_end: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Encontrar userId pelo customerId
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', profile.id)
        }
        break
      }

      default:
        break
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('❌ Erro ao atualizar Supabase:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
