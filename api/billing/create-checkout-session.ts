import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

type Body = {
  userId?: string;
  email?: string;
  plan?: 'mensal' | 'semestral' | 'anual';
  priceId?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { userId, email, plan, priceId }: Body = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    let customerId: string;

    const { data: user } = userId 
      ? await supabase.from('users').select('stripe_customer_id').eq('id', userId).single()
      : { data: null };

    if (user?.stripe_customer_id) {
      customerId = user.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: userId || '' },
      });
      customerId = customer.id;

      if (userId) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      }
    }

    let finalPriceId = priceId;
    if (!finalPriceId) {
      if (plan === 'mensal') finalPriceId = process.env.STRIPE_PRICE_ID_MENSAL;
      else if (plan === 'semestral') finalPriceId = process.env.STRIPE_PRICE_ID_SEMESTRAL;
      else if (plan === 'anual') finalPriceId = process.env.STRIPE_PRICE_ID_ANUAL;
    }

    if (!finalPriceId) {
      return res.status(400).json({ error: 'Plano ou priceId inválido' });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: finalPriceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/planos`,
      metadata: {
        userId: userId || '',
        plan: plan || '',
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Erro create-checkout-session:', error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor',
      message: error.message 
    });
  }
}
