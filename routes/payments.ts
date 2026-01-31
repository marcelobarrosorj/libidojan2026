
import express from 'express';
import { Plan, TrustLevel, TransactionType } from '../types';
import { supabase } from '../services/supabase';

// Nota: Em um ambiente real, você deve importar o 'stripe' e usar a SECRET KEY do .env
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

const PRICES = {
    'Plano Mensal': 4990,     // R$ 49,90
    'Plano Semestral': 26946, // R$ 269,46
    'Plano Anual': 47904,     // R$ 479,04
    'boost_1': 990,           // R$ 9,90
    'boost_5': 3990           // R$ 39,90
};

/**
 * POST /api/payments/create-intent
 * Cria o objeto de cobrança no Stripe.
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { plan, method, userId, userEmail } = req.body;
    const amount = PRICES[plan as keyof typeof PRICES] || 4990;

    // LÓGICA STRIPE (Exemplo Conceitual)
    /*
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      payment_method_types: method === 'pix' ? ['pix'] : ['card'],
      metadata: { userId, plan },
      receipt_email: userEmail
    });
    */

    // Retorno para o Frontend (Simulado para compatibilidade imediata)
    const mockId = `pi_${Math.random().toString(36).substr(2, 12)}`;
    res.json({
      id: mockId,
      amount: amount / 100,
      clientSecret: `${mockId}_secret_live`,
      qrCode: method === 'pix' ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=libidopay-${mockId}` : undefined,
      pixKey: method === 'pix' ? `00020126330014BR.GOV.BCB.PIX0111libidopaykey${mockId}` : undefined,
      status: 'pending'
    });
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao gerar cobrança.' });
  }
});

/**
 * POST /api/payments/webhook
 * Rota crítica onde o Stripe avisa que o pagamento foi confirmado.
 * Deve atualizar o plano do usuário no Supabase.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // 1. Validar assinatura do webhook para segurança
  // 2. Se event.type === 'payment_intent.succeeded'
  // 3. Pegar userId do metadata
  // 4. Atualizar tabela 'profiles' no Supabase: { plan: 'Premium', is_premium: true }
  
  res.json({ received: true });
});

export default router;
