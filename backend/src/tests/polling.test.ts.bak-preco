import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
vi.mock('../config/env.js', () => ({ config: { PAGBANK_TOKEN: 'pagbank-test-token', PREMIUM_PRICE_CENTS: 1990 }, getBackendAvailability: () => true }));
const mockVerifyPayment = vi.fn();
vi.mock('../services/pagbank.js', () => ({
  verifyPayment: (...args: any[]) => mockVerifyPayment(...args)
}));
const mockSelect = vi.fn();
const mockEqProvider = vi.fn();
const mockEqPaymentId = vi.fn();
const mockSingle = vi.fn();
const mockRpc = vi.fn();
vi.mock('../config/supabase.js', () => ({
  getAdminSupabase: () => ({
    from: () => ({
      select: mockSelect.mockReturnValue({
        eq: mockEqPaymentId.mockReturnValue({
          eq: mockEqProvider.mockReturnValue({
            single: mockSingle
          })
        })
      })
    }),
    rpc: (...args: any[]) => mockRpc(...args)
  })
}));
vi.mock('../middleware/authMiddleware.js', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (auth === 'Bearer user1-token') {
      req.user = { id: 'user1' };
      return next();
    } else if (auth === 'Bearer user2-token') {
      req.user = { id: 'user2' };
      return next();
    }
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }
}));
describe('Polling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('usuário não pode consultar paymentId de outro usuário', async () => {
    mockSingle.mockResolvedValue({
      data: { status: 'WAITING', user_id: 'user2' },
      error: null
    });
    const res = await request(app)
      .get('/api/payment/status/order_123')
      .set('Authorization', 'Bearer user1-token');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Não autorizado.');
  });
  it('status WAITING é devolvido sem ativar Premium', async () => {
    mockSingle.mockResolvedValue({
      data: { status: 'WAITING', user_id: 'user1' },
      error: null
    });
    const res = await request(app)
      .get('/api/payment/status/order_123')
      .set('Authorization', 'Bearer user1-token');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('WAITING');
    expect(res.body.isPremium).toBe(false);
    expect(mockVerifyPayment).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });
  it('status WAITING no banco não consulta PagBank (somente o webhook ativa Premium)', async () => {
    mockSingle.mockResolvedValue({
      data: { status: 'WAITING', user_id: 'user1' },
      error: null
    });
    const res = await request(app)
      .get('/api/payment/status/order_123')
      .set('Authorization', 'Bearer user1-token');
    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
    expect(mockVerifyPayment).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });
  it('nenhuma consulta ao PagBank ocorre na rota de status', async () => {
    mockSingle.mockResolvedValue({
      data: { status: 'WAITING', user_id: 'user1' },
      error: null
    });
    await request(app)
      .get('/api/payment/status/order_123')
      .set('Authorization', 'Bearer user1-token');
    expect(mockVerifyPayment).not.toHaveBeenCalled();
  });
  it('status PAID duplicado permanece idempotente', async () => {
    mockSingle.mockResolvedValue({
      data: { status: 'PAID', user_id: 'user1' },
      error: null
    });
    const res = await request(app)
      .get('/api/payment/status/order_123')
      .set('Authorization', 'Bearer user1-token');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PAID');
    expect(res.body.isPremium).toBe(true);
    expect(mockVerifyPayment).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });
  it('status EXPIRED devolve isPremium false', async () => {
    mockSingle.mockResolvedValue({
      data: { status: 'EXPIRED', user_id: 'user1' },
      error: null
    });
    const res = await request(app)
      .get('/api/payment/status/order_123')
      .set('Authorization', 'Bearer user1-token');
    expect(res.status).toBe(200);
    expect(res.body.isPremium).toBe(false);
    expect(mockVerifyPayment).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
