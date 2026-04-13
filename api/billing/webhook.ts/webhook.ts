import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Webhook recebido:', req.body?.type || 'sem tipo');

  // Responde imediatamente com 200 para o Stripe considerar entregue
  return res.status(200).json({ received: true });
}
