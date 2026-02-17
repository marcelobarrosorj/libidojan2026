import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
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

  const plan = body?.plan
  const method = body?.method
  const amountCents = body?.amountCents
  const userId = body?.userId

  if (!plan || !method || !amountCents || !userId) {
    return res.status(400).json({ ok: false, error: 'missing fields: plan, method, amountCents, userId' })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'brl',
      description: `Assinatura ${plan}`,
      metadata: { plan, userId }
    })

    return res.status(200).json({
      ok: true,
      clientSecret: paymentIntent.client_secret
    })
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: `stripe error: ${error.message}`
    })
  }
}
