import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, plan, userId } = req.body || {};

  if (!email || !plan) {
    return res.status(400).json({ error: 'Email e plano são obrigatórios' });
  }

  try {
    const pagseguroEmail = process.env.PAGSEGURO_EMAIL;
    const pagseguroToken = process.env.PAGSEGURO_TOKEN;

    if (!pagseguroEmail || !pagseguroToken) {
      return res.status(500).json({ error: 'Credenciais do PagSeguro não configuradas' });
    }

    // Por enquanto, vamos retornar um link de teste (vamos substituir pela integração real depois)
    // Para agilizar, estamos usando um link de pagamento direto do PagSeguro (você pode criar depois)
    const paymentUrl = `https://pagseguro.uol.com.br/checkout/v2/payment.html?email=${encodeURIComponent(pagseguroEmail)}&token=${pagseguroToken}&currency=BRL&itemId1=1&itemDescription1=Assinatura ${plan}&itemAmount1=49.90&itemQuantity1=1&reference=libido_${userId || 'anon'}_${Date.now()}`;

    return res.status(200).json({ 
      url: paymentUrl,
      message: 'Redirecionando para PagSeguro' 
    });

  } catch (error: any) {
    console.error('Erro PagSeguro:', error);
    return res.status(500).json({ error: error.message });
  }
}
