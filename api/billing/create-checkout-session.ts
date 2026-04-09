import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, plan, userId } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    let priceId = '';
    if (plan === 'mensal') priceId = process.env.STRIPE_PRICE_ID_MENSAL || '';
    else if (plan === 'semestral') priceId = process.env.STRIPE_PRICE_ID_SEMESTRAL || '';
    else if (plan === 'anual') priceId = process.env.STRIPE_PRICE_ID_ANUAL || '';

    if (!priceId) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://libido2026.vercel.app/sucesso?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://libido2026.vercel.app/planos',
      customer_email: email,
      metadata: { userId: userId || '', plan },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Erro no checkout:', error);
    return res.status(500).json({ 
      error: 'Erro ao criar sessão',
      message: error.message 
    });
  }
}
