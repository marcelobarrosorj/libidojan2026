import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, plan } = req.body || {};

  if (!email || !plan) {
    return res.status(400).json({ error: 'Email e plano são obrigatórios' });
  }

  try {
    const priceMap: Record<string, string> = {
      mensal: process.env.STRIPE_PRICE_ID_MENSAL || '',
      semestral: process.env.STRIPE_PRICE_ID_SEMESTRAL || '',
      anual: process.env.STRIPE_PRICE_ID_ANUAL || '',
    };

    const priceId = priceMap[plan];

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID não encontrado para o plano' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://libido2026.vercel.app/sucesso',
      cancel_url: 'https://libido2026.vercel.app/planos',
      customer_email: email,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Erro Stripe Checkout:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
