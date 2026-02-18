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

  const { userId, email, priceId } = req.body
  if (!userId || !email || !priceId) {
    return res.status(400).json({ error: 'Missing userId, email, or priceId' })
  }

  try {
    // Buscar ou criar customer no Stripe
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

      // Salvar customer_id no Supabase
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Criar checkout session para assinatura
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/#/assinatura?status=success`,
      cancel_url: `${process.env.APP_URL}/#/assinatura?status=cancel`,
      metadata: { userId, plan: priceId }
    })

    return res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
