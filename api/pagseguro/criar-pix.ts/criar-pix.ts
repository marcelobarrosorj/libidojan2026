import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { plan } = req.body;
  const token = process.env.PAGSEGURO_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Token PagSeguro não configurado' });
  }

  // Valores dos planos
  const valores = {
    mensal: 4990,
    semestral: 26946,
    anual: 47904
  };

  const valor = valores[plan as keyof typeof valores] || 4990;

  try {
    const response = await fetch('https://ws.pagseguro.uol.com.br/pix/v2/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reference_id: `libido-${Date.now()}`,
        customer: {
          name: "Cliente Libido 2026",
          email: "libidoapp@gmail.com"
        },
        items: [{
          name: `Assinatura ${plan} - Libido 2026`,
          quantity: 1,
          unit_amount: valor
        }],
        notification_urls: ["https://libido2026.vercel.app/api/pagseguro/webhook"]
      })
    });

    const data = await response.json();

    if (data.qr_codes && data.qr_codes[0]) {
      return res.status(200).json({
        success: true,
        qrCode: data.qr_codes[0].text,
        expiration: data.qr_codes[0].expiration_date
      });
    } else {
      return res.status(400).json({ error: 'Não foi possível gerar o Pix' });
    }
  } catch (error: any) {
    console.error('Erro PagSeguro Pix:', error);
    return res.status(500).json({ error: 'Erro ao conectar com PagSeguro' });
  }
}
