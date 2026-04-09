import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('✅ [CHECKOUT] Requisição recebida');

  if (req.method !== 'POST') {
    console.log('❌ Método não permitido');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, plan, userId } = req.body;
    console.log('📧 Email:', email);
    console.log('📦 Plano:', plan);

    if (!email) {
      console.log('❌ Email não enviado');
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('❌ STRIPE_SECRET_KEY não está configurada no Vercel');
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada' });
    }

    // Criar ou usar customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId: userId || '' }
    });
    console.log('✅ Customer criado:', customer.id);

    // Price ID
    let priceId = '';
    if (plan === 'mensal') priceId = process.env.STRIPE_PRICE_ID_MENSAL || '';
    else if (plan === 'semestral') priceId = process.env.STRIPE_PRICE_ID_SEMESTRAL || '';
    else if (plan === 'anual') priceId = process.env.STRIPE_PRICE_ID_ANUAL || '';

    console.log('💰 Price ID usado:', priceId);

    if (!priceId) {
      console.log('❌ Price ID não encontrado para o plano');
      return res.status(400).json({ error: 'Price ID não encontrado' });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL || 'https://libido2026.vercel.app'}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'https://libido2026.vercel.app'}/planos`,
      metadata: { userId: userId || '', plan },
    });

    console.log('✅ Session criada com sucesso! URL:', session.url);

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('❌ ERRO NO CHECKOUT:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Erro ao criar sessão',
      message: error.message 
    });
  }
}
