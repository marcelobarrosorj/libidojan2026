import axios from 'axios';
import { config } from '../config/env.js';

const PAGBANK_SANDBOX_URL = "https://sandbox.api.pagseguro.com";
const PAGBANK_SANDBOX_TAX_ID = "12345678909";

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

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

export const createPixPayment = async (
  userId: string,
  customerTaxId: string,
  plan: PlanInfo
) => {
  if (!config.PAGBANK_TOKEN) {
    throw new Error('Credenciais do PagBank nao configuradas.');
  }
  const amountCents = Math.round(plan.price * 100);
  const paymentIdLocal = Math.random().toString(36).substring(2, 15);
  const referenceId = 'libido-premium_' + userId + '_' + paymentIdLocal;
  const payload = {
    reference_id: referenceId,
    customer: {
      name: 'User ' + userId,
      email: 'pagamento@libidoapp.com',
      tax_id: resolvePagBankCustomerTaxId(config.PAGBANK_API_URL, customerTaxId)
    },
    items: [
      {
        reference_id: 'libido-premium',
        name: 'Libido Premium - ' + plan.name,
        quantity: 1,
        unit_amount: amountCents
      }
    ],
    charges: [
      {
        reference_id: 'libido-premium-charge',
        description: 'Libido Premium - ' + plan.name,
        amount: {
          value: amountCents,
          currency: 'BRL'
        },
        payment_method: {
          type: 'PIX',
          pix: {
            expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      }
    ],
    notification_urls: config.PAGBANK_WEBHOOK_URL ? [config.PAGBANK_WEBHOOK_URL] : []
  };
  const response = await axios.post(config.PAGBANK_API_URL + '/orders', payload, {
    headers: {
      'Authorization': 'Bearer ' + config.PAGBANK_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  const charge = response.data.charges?.[0];
  if (!charge) {
    throw new Error('Cobranca ausente na resposta do PagBank');
  }
  const qrCode = charge.qr_code;
  if (!qrCode) {
    throw new Error('QR Code ausente na resposta do PagBank');
  }
  const imageLink = charge.links?.find((l: any) => l.rel === 'QRCODE.PNG')?.href || '';
  return {
    paymentId: response.data.id,
    status: charge.status || 'WAITING',
    qrCodeText: qrCode.text,
    qrCodeImage: imageLink,
    expirationDate: charge.payment_method?.pix?.expiration_date,
    amount: amountCents / 100,
    planId: plan.id
  };
};

export const verifyPayment = async (paymentId: string) => {
  if (!config.PAGBANK_TOKEN) return null;
  const response = await axios.get(config.PAGBANK_API_URL + '/orders/' + paymentId, {
    headers: {
      'Authorization': 'Bearer ' + config.PAGBANK_TOKEN
    }
  });
  return response.data;
};
