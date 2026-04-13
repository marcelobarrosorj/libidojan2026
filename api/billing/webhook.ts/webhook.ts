import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas confirma que recebeu o evento (o mínimo necessário para o Stripe)
  console.log('Webhook recebido - Tipo:', req.body?.type || 'desconhecido');

  // Responde imediatamente com 200 para o Stripe não considerar falha
  return res.status(200).json({ received: true });
}
