import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20'
})

// Cliente Supabase com Service Role (para atualizar dados)
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
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

        if (userId) {
          console.log(`✅ Checkout concluído para usuário: ${userId}`)
          
          // Atualiza para premium na tabela 'profiles'
          const { error } = await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'active',
              subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) throw error
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId && subscription.status === 'active') {
          console.log(`✅ Assinatura ativa para usuário: ${userId}`)
          
          const { error } = await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'active',
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) throw error
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          console.log(`❌ Assinatura cancelada para usuário: ${userId}`)
          
          const { error } = await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'inactive',
              subscription_current_period_end: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) throw error
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
