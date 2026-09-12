import axios from 'axios';
import { config } from '../config/env.js';

const PAGBANK_SANDBOX_URL = "https://sandbox.api.pagseguro.com";
const PAGBANK_SANDBOX_TAX_ID = "12345678909";

export function resolvePagBankCustomerTaxId(
  apiUrl: string,
  customerTaxId?: string,
): string {
  if (apiUrl === PAGBANK_SANDBOX_URL) {
    return PAGBANK_SANDBOX_TAX_ID;
  }

  const normalizedTaxId = customerTaxId?.replace(/\D/g, "") ?? "";

  if (!normalizedTaxId) {
    throw new Error("PAGBANK_CUSTOMER_TAX_ID_REQUIRED");
  }

  return normalizedTaxId;
}

export const createPixPayment = async (userId: string, customerTaxId: string) => {
  if (!config.PAGBANK_TOKEN) {
    throw new Error('Credenciais do PagBank não configuradas.');
  }

  const amountCents = config.PREMIUM_PRICE_CENTS;
  const paymentIdLocal = Math.random().toString(36).substring(2, 15);
  const referenceId = `libido-premium_${userId}_${paymentIdLocal}`;

  const payload = {
    reference_id: referenceId,
    customer: {
      name: `User ${userId}`,
      email: "pagamento@libidoapp.com",
      tax_id: resolvePagBankCustomerTaxId(config.PAGBANK_API_URL, customerTaxId)
    },
    items: [
      {
        reference_id: "libido-premium",
        name: "Libido Premium",
        quantity: 1,
        unit_amount: amountCents
      }
    ],
    qr_codes: [
      {
        amount: {
          value: amountCents
        },
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notification_urls: config.PAGBANK_WEBHOOK_URL ? [config.PAGBANK_WEBHOOK_URL] : []
  };

  const response = await axios.post(`${config.PAGBANK_API_URL}/orders`, payload, {
    headers: {
      'Authorization': `Bearer ${config.PAGBANK_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const qrCodeObj = response.data.qr_codes?.[0];
  if (!qrCodeObj) {
    throw new Error('QR Code ausente na resposta do PagBank');
  }
  
  const imageLink = qrCodeObj.links?.find((l: any) => l.rel === 'qr_code')?.href || '';

  return {
    paymentId: response.data.id,
    status: 'WAITING',
    qrCodeText: qrCodeObj.text,
    qrCodeImage: imageLink,
    expirationDate: qrCodeObj.expiration_date,
    amount: amountCents / 100
  };
};

export const verifyPayment = async (paymentId: string) => {
  if (!config.PAGBANK_TOKEN) return null;

  const response = await axios.get(`${config.PAGBANK_API_URL}/orders/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${config.PAGBANK_TOKEN}`
    }
  });
  
  return response.data;
};
