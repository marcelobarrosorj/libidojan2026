import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
})

export const config = { api: { bodyParser: false } }

function buffer(readable: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = []
    readable.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)))
    readable.on('end', () => resolve(Buffer.concat(chunks)))
    readable.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!sig || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return res.status(400).send('Missing webhook signature/secret or supabase env')
  }

  const rawBody = await buffer(req)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  const updateByCustomer = async (customerId: string, status: string, periodEnd: string | null) => {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: status,
        subscription_current_period_end: periodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId)

    if (error) throw new Error(error.message)
  }

  try {
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = String(invoice.customer)
      const subscriptionId = (invoice.subscription as string | null) ?? null

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null

        await updateByCustomer(customerId, 'active', periodEnd)
      } else {
        await updateByCustomer(customerId, 'active', null)
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = String(invoice.customer)
      await updateByCustomer(customerId, 'past_due', null)
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const customerId = String(sub.customer)
      await updateByCustomer(customerId, 'canceled', null)
    }

    return res.status(200).json({ received: true })
  } catch (e: any) {
    return res.status(500).send(`Webhook handler failed: ${e.message}`)
  }
}
