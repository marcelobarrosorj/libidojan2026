import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log para debug
  console.log('🔥 Checkout chamado - Body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, plan, userId } = req.body || {};

  if (!email || !plan) {
    console.log('❌ Email ou plano não enviado');
    return res.status(400).json({ error: 'Email e plano são obrigatórios' });
  }

  try {
    let priceId = '';
    if (plan === 'mensal') priceId = process.env.STRIPE_PRICE_ID_MENSAL || '';
    else if (plan === 'semestral') priceId = process.env.STRIPE_PRICE_ID_SEMESTRAL || '';
    else if (plan === 'anual') priceId = process.env.STRIPE_PRICE_ID_ANUAL || '';

    if (!priceId) {
      console.log('❌ Price ID não encontrado para plano:', plan);
      return res.status(400).json({ error: 'Price ID não encontrado' });
    }

    console.log('💰 Usando Price ID:', priceId);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://libido2026.vercel.app/sucesso?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://libido2026.vercel.app/planos',
      customer_email: email,
      metadata: { userId: userId || '', plan },
      // Força o Stripe a não usar dados sensíveis desnecessários
      billing_address_collection: 'auto',
    });

    console.log('✅ Sessão criada com sucesso! URL:', session.url);

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('❌ ERRO STRIPE:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Erro ao criar sessão no Stripe',
      message: error.message 
    });
  }
}
