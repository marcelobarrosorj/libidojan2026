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

  const { userId, email, priceId, paymentMethodId } = req.body
  if (!userId || !email || !priceId || !paymentMethodId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Buscar ou criar customer
    let customerId = null
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Anexar payment method ao customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

    // Criar subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: { userId, plan: priceId }
    })

    return res.status(200).json({ subscriptionId: subscription.id })
  } catch (error: any) {
    console.error('Erro ao criar subscription:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
