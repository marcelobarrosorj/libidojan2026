import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  let body: any = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid json body' })
    }
  }

  const userId = body?.userId
  const email = body?.email

  if (!userId || !email) {
    return res.status(400).json({ ok: false, error: 'missing fields: userId, email' })
  }

  const priceId = process.env.STRIPE_PRICE_ID
  const appUrl = process.env.APP_URL
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!priceId || !appUrl || !supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ ok: false, error: 'server env not configured' })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  if (profileErr) {
    return res.status(500).json({ ok: false, error: `supabase profiles read error: ${profileErr.message}` })
  }

  let customerId = (profile?.stripe_customer_id as string | null) ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: userId }
    })
    customerId = customer.id

    const { error: updErr } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (updErr) {
      return res.status(500).json({ ok: false, error: `supabase profiles update error: ${updErr.message}` })
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing/cancel`
  })

  return res.status(200).json({ ok: true, url: session.url })
}
