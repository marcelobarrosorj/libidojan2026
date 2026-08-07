import { resolvePagBankCustomerTaxId } from '../services/pagbank.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import crypto from 'crypto';

const {
  mockRpc,
  mockInsert,
  mockSelect,
  mockEq,
  mockSingle,
  mockGetUser,
  mockCreatePixPayment,
  mockVerifyPayment
} = vi.hoisted(() => {
  return {
    mockRpc: vi.fn(),
    mockInsert: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockGetUser: vi.fn(),
    mockCreatePixPayment: vi.fn(),
    mockVerifyPayment: vi.fn()
  };
});

vi.mock('../config/env', () => ({
  config: { PAGBANK_TOKEN: 'mock-pagbank-token' },
  validateProductionEnvironment: vi.fn(),
  getBackendAvailability: vi.fn(() => true),
}));

vi.mock('../config/supabase', () => {
  const supabase = {
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
    from: vi.fn((table) => {
      if (table === 'payment_transactions') {
        return {
          insert: mockInsert,
          select: mockSelect,
        };
      }
      return {};
    })
  };
  return { getAdminSupabase: () => supabase };
});

vi.mock('../services/pagbank', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/pagbank.js')>();
  return {
    ...actual,
    createPixPayment: mockCreatePixPayment,
    verifyPayment: mockVerifyPayment,
  };
});

import app from '../app.js';


describe('resolvePagBankCustomerTaxId', () => {
  it('Sandbox uses 12345678909', () => {
    expect(resolvePagBankCustomerTaxId('https://sandbox.api.pagseguro.com')).toBe('12345678909');
  });

  it('Sandbox uses 12345678909 even if 00000000000 is provided', () => {
    expect(resolvePagBankCustomerTaxId('https://sandbox.api.pagseguro.com', '00000000000')).toBe('12345678909');
  });

  it('Production removes non-numeric chars from valid taxId', () => {
    expect(resolvePagBankCustomerTaxId('https://api.pagseguro.com', '123.456.789-09')).toBe('12345678909');
  });

  it('Production without taxId throws PAGBANK_CUSTOMER_TAX_ID_REQUIRED', () => {
    expect(() => resolvePagBankCustomerTaxId('https://api.pagseguro.com', '')).toThrow('PAGBANK_CUSTOMER_TAX_ID_REQUIRED');
    expect(() => resolvePagBankCustomerTaxId('https://api.pagseguro.com', undefined)).toThrow('PAGBANK_CUSTOMER_TAX_ID_REQUIRED');
  });
});

describe('Payment API Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
  });

  describe('POST /api/payment/create', () => {
    it('1. Returns 401 without authentication', async () => {
      const res = await request(app).post('/api/payment/create').send();
      expect(res.status).toBe(401);
      expect(mockCreatePixPayment).not.toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('2 & 3. Authenticated user creates payment successfully', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const mockedPixData = {
        paymentId: 'pag-123',
        amount: 19.90,
        qrCode: 'qr-code-str',
        qrCodeText: 'pix-copia-cola'
      };
      mockCreatePixPayment.mockResolvedValue(mockedPixData);
      mockInsert.mockResolvedValue({ error: null });

      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '52998224725' });

      expect(res.status).toBe(200);
      expect(mockCreatePixPayment).toHaveBeenCalledWith('user-123', '52998224725');
      expect(mockCreatePixPayment).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        payment_id: 'pag-123',
        provider: 'pagbank',
        status: 'WAITING',
        amount: 19.90
      });
      expect(res.body.paymentId).toBe('pag-123');
      expect(res.body.qrCodeText).toBe('pix-copia-cola');
    });

    it('PagBank HTTP 400 generates sanitized log without exposing token', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const mockError = new Error('Request failed with status code 400') as any;
      mockError.response = {
        status: 400,
        data: {
          error_messages: [
            {
              code: 'INVALID_PARAMETER',
              description: 'must match the regex',
              parameter_name: 'customer.tax_id',
              error: 'BAD_REQUEST'
            }
          ]
        },
        config: {
          headers: {
            Authorization: 'Bearer SENSITIVE_TOKEN_123'
          },
          data: '{"full_payload":"here"}'
        }
      };
      mockCreatePixPayment.mockRejectedValue(mockError);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '52998224725' });
        
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Erro interno ao criar pagamento' });
      
      expect(consoleSpy).toHaveBeenCalledWith('PAGBANK_REQUEST_ERROR', {
        status: 400,
        errors: [
          {
            code: 'INVALID_PARAMETER',
            error: 'BAD_REQUEST',
            description: 'must match the regex',
            parameter_name: 'customer.tax_id'
          }
        ]
      });
      
      const allCalls = consoleSpy.mock.calls.map(call => JSON.stringify(call)).join(' ');
      expect(allCalls).not.toContain('SENSITIVE_TOKEN_123');
      expect(allCalls).not.toContain('Authorization');
      expect(allCalls).not.toContain('full_payload');
      
      consoleSpy.mockRestore();
    });

    it('4. PagBank returns response without QR Code', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockCreatePixPayment.mockRejectedValue(new Error('PagBank error'));
      
      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '52998224725' });
        
      expect(res.status).toBe(500);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('5. Fails to save transaction', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const mockedPixData = { paymentId: 'pag-123', amount: 19.90 };
      mockCreatePixPayment.mockResolvedValue(mockedPixData);
      mockInsert.mockResolvedValue({ error: { message: 'DB Error' } });

      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '52998224725' });
        
      expect(res.status).toBe(500);
    });
  });

  
    it('Fails if no CPF is provided', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({});
        
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('CPF inválido');
    });

    it('Fails if invalid CPF is provided', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '11111111111' });
        
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('CPF inválido');
    });
    
    it('Creates payment if valid CPF is provided', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const mockedPixData = { paymentId: 'pag-123', amount: 19.90 };
      mockCreatePixPayment.mockResolvedValue(mockedPixData);
      mockInsert.mockResolvedValue({ error: null });
      
      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '52998224725' });
        
      expect(res.status).toBe(200);
    });


  describe('POST /api/webhook/pagbank', () => {
    it('1. Header missing', async () => {
      const res = await request(app).post('/api/webhook/pagbank').send({ id: 'ord-123' });
      expect(res.status).toBe(401);
    });

    it('2. Invalid signature', async () => {
      const payload = { id: 'ord-123' };
      const res = await request(app)
        .post('/api/webhook/pagbank')
        .set('Content-Type', 'application/json')
        .set('x-authenticity-token', 'invalid-signature')
        .send(payload);

      expect(res.status).toBe(401);
    });

    it('3, 8 & 9. Valid signature -> PAID', async () => {
      const payload = { id: 'ord-123' };
      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHash('sha256').update(`mock-pagbank-token-${rawBody}`).digest('hex');

      mockVerifyPayment.mockResolvedValue({
        id: 'ord-123',
        reference_id: 'ref_user-123',
        charges: [{ status: 'PAID', amount: { value: 1990 } }]
      });
      mockRpc.mockResolvedValue({ data: true, error: null });

      const res = await request(app)
        .post('/api/webhook/pagbank')
        .set('Content-Type', 'application/json')
        .set('x-authenticity-token', signature)
        .send(payload);

      expect(res.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('process_payment', {
        p_user_id: 'user-123',
        p_payment_id: 'ord-123',
        p_provider: 'pagbank',
        p_status: 'PAID',
        p_amount: 19.90
      });
    });

    it('3 & 9. Webhook idempotency', async () => {
      const payload = { id: 'ord-123' };
      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHash('sha256').update(`mock-pagbank-token-${rawBody}`).digest('hex');

      mockVerifyPayment.mockResolvedValue({
        id: 'ord-123',
        reference_id: 'ref_user-123',
        charges: [{ status: 'PAID', amount: { value: 1990 } }]
      });
      mockRpc.mockResolvedValue({ data: false, error: null });

      const res = await request(app)
        .post('/api/webhook/pagbank')
        .set('Content-Type', 'application/json')
        .set('x-authenticity-token', signature)
        .send(payload);

      expect(res.status).toBe(200);
    });

    it('4. Re-formatted payload fails signature', async () => {
      const rawBodyOriginal = '{"id":"ord-123"}';
      const rawBodyReformatted = '{\n  "id": "ord-123"\n}';
      const signature = crypto.createHash('sha256').update(`mock-pagbank-token-${rawBodyOriginal}`).digest('hex');

      const res = await request(app)
        .post('/api/webhook/pagbank')
        .set('Content-Type', 'application/json')
        .set('x-authenticity-token', signature)
        .send(rawBodyReformatted);

      expect(res.status).toBe(401);
    });

    it('5. Unknown order', async () => {
      const payload = { id: 'ord-123' };
      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHash('sha256').update(`mock-pagbank-token-${rawBody}`).digest('hex');

      mockVerifyPayment.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/webhook/pagbank')
        .set('Content-Type', 'application/json')
        .set('x-authenticity-token', signature)
        .send(payload);

      expect(res.status).toBe(400);
    });

    it('WAITING status', async () => {
      const payload = { id: 'ord-123' };
      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHash('sha256').update(`mock-pagbank-token-${rawBody}`).digest('hex');

      mockVerifyPayment.mockResolvedValue({
        id: 'ord-123',
        reference_id: 'ref_user-123',
        charges: [{ status: 'WAITING', amount: { value: 1990 } }]
      });

      const res = await request(app)
        .post('/api/webhook/pagbank')
        .set('Content-Type', 'application/json')
        .set('x-authenticity-token', signature)
        .send(payload);

      expect(res.status).toBe(200);
      expect(mockRpc).not.toHaveBeenCalled();
    });
    
    it('CANCELED status', async () => {
      const payload = { id: 'ord-123' };
      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHash('sha256').update(`mock-pagbank-token-${rawBody}`).digest('hex');

      mockVerifyPayment.mockResolvedValue({
        id: 'ord-123',
        reference_id: 'ref_user-123',
        charges: [{ status: 'CANCELED', amount: { value: 1990 } }]
      });

      const res = await request(app)
        .post('/api/webhook/pagbank')
        .set('Content-Type', 'application/json')
        .set('x-authenticity-token', signature)
        .send(payload);

      expect(res.status).toBe(200);
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/payment/status/:paymentId', () => {
    it('1. Returns 401 without authentication', async () => {
      const res = await request(app).get('/api/payment/status/pag-123').send();
      expect(res.status).toBe(401);
    });

    it('2. Fails when transaction belongs to another user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockSingle.mockResolvedValue({ data: { status: 'WAITING', user_id: 'user-456' }, error: null });

      const res = await request(app)
        .get('/api/payment/status/pag-123')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(res.status).toBe(403);
    });

    it('3 & 4. Returns WAITING status', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockSingle.mockResolvedValue({ data: { status: 'WAITING', user_id: 'user-123' }, error: null });

      const res = await request(app)
        .get('/api/payment/status/pag-123')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('WAITING');
      expect(res.body.isPremium).toBe(false);
    });

    it('5. Returns PAID status', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockSingle.mockResolvedValue({ data: { status: 'PAID', user_id: 'user-123' }, error: null });

      const res = await request(app)
        .get('/api/payment/status/pag-123')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PAID');
      expect(res.body.isPremium).toBe(true);
    });
    
    it('6. Returns EXPIRED status', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      mockSingle.mockResolvedValue({ data: { status: 'EXPIRED', user_id: 'user-123' }, error: null });

      const res = await request(app)
        .get('/api/payment/status/pag-123')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(res.status).toBe(200);
    });
  });
});

describe('Health Check API Test', () => {
  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health').send();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('libido-api');
  });
});
