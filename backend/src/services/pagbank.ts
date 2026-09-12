import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config/env.js';

const PAGBANK_SANDBOX_URL = "https://sandbox.api.pagseguro.com";
const PAGBANK_SANDBOX_TAX_ID = "12345678909";

const REQUEST_TIMEOUT_MS = 7000;
const TOTAL_BUDGET_MS = 9000;
const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 400;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const client: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

function authHeader(): Record<string, string> {
  const token = config.PAGBANK_TOKEN?.trim();
  if (!token) {
    throw new Error('Credenciais do PagBank nao configuradas.');
  }
  return { Authorization: `Bearer ${token}` };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: AxiosError, retryWithoutResponse: boolean): boolean {
  const status = error.response?.status;
  if (status !== undefined) {
    return status === 429 || status >= 500;
  }
  return retryWithoutResponse;
}

function describePagBankError(error: AxiosError): Error {
  if (error.code === 'ECONNABORTED') {
    return new Error(`PagBank nao respondeu em ${REQUEST_TIMEOUT_MS}ms (timeout).`);
  }
  const status = error.response?.status;
  if (status === undefined) {
    return new Error(`Falha de rede ao chamar o PagBank: ${error.message}`);
  }
  const body = error.response.data;
  const detail = typeof body === 'string' ? body : JSON.stringify(body);
  return new Error(`PagBank respondeu HTTP ${status}: ${detail}`);
}

async function callPagBank<T>(
  operation: string,
  retryWithoutResponse: boolean,
  fn: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      if (!axios.isAxiosError(axiosError) || !isRetryable(axiosError, retryWithoutResponse)) {
        break;
      }
      if (attempt === MAX_RETRIES) break;
      const wait = BASE_BACKOFF_MS * 2 ** attempt;
      const wouldSpend = Date.now() - startedAt + wait + REQUEST_TIMEOUT_MS;
      if (wouldSpend > TOTAL_BUDGET_MS) break;
      await sleep(wait);
    }
  }

  const axiosError = lastError as AxiosError;
  const described = axios.isAxiosError(axiosError)
    ? describePagBankError(axiosError)
    : (lastError as Error);

  console.error(`[PagBank] ${operation} falhou: ${described.message}`);
  throw described;
}

export function resolvePagBankCustomerTaxId(
  apiUrl: string,
  customerTaxId?: string,
): string {
  if (normalizeBaseUrl(apiUrl) === PAGBANK_SANDBOX_URL) {
    return PAGBANK_SANDBOX_TAX_ID;
  }
  const normalizedTaxId = customerTaxId?.replace(/\D/g, "") ?? "";
  if (!normalizedTaxId) {
    throw new Error("PAGBANK_CUSTOMER_TAX_ID_REQUIRED");
  }
  return normalizedTaxId;
}

export const createPixPayment = async (userId: string, customerTaxId: string) => {
  const amountCents = config.PREMIUM_PRICE_CENTS;
  const paymentIdLocal = Math.random().toString(36).substring(2, 15);
  const referenceId = `libido-premium_${userId}_${paymentIdLocal}`;
  const baseUrl = normalizeBaseUrl(config.PAGBANK_API_URL);

  const payload = {
    reference_id: referenceId,
    customer: {
      name: `User ${userId}`,
      email: "pagamento@libidoapp.com",
      tax_id: resolvePagBankCustomerTaxId(baseUrl, customerTaxId),
    },
    items: [
      {
        reference_id: "libido-premium",
        name: "Libido Premium",
        quantity: 1,
        unit_amount: amountCents,
      },
    ],
    qr_codes: [
      {
        amount: { value: amountCents },
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    notification_urls: config.PAGBANK_WEBHOOK_URL ? [config.PAGBANK_WEBHOOK_URL] : [],
  };

  const response = await callPagBank('createPixPayment', false, () =>
    client.post(`${baseUrl}/orders`, payload, { headers: authHeader() }),
  );

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
    amount: amountCents / 100,
  };
};

export const verifyPayment = async (paymentId: string) => {
  if (!config.PAGBANK_TOKEN) return null;
  const baseUrl = normalizeBaseUrl(config.PAGBANK_API_URL);
  const response = await callPagBank('verifyPayment', true, () =>
    client.get(`${baseUrl}/orders/${paymentId}`, { headers: authHeader() }),
  );
  return response.data;
};
