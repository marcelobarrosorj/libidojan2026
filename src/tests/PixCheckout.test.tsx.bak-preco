import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PixCheckout } from '../components/PixCheckout';

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({
        error: null
      }))
    }))
  }
}));

import { supabase } from '../services/supabase';

const originalFetch = global.fetch;

const PLANOS = {
  plans: [
    { id: 'plan-dayuse-1', name: 'Acesso 24 horas', price: 19.90, duration_days: 1 },
    { id: 'plan-mensal-1', name: 'Plano Mensal', price: 49.90, duration_days: 30 }
  ]
};

describe('PixCheckout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('Requires valid CPF before creating payment', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/payment/plans')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(PLANOS)
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
    const onUpgradeMock = vi.fn();
    const onCloseMock = vi.fn();
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          access_token: 'fake-access-token'
        }
      }
    });
    render(
      <PixCheckout
        isOpen={true}
        onClose={onCloseMock}
        onUpgrade={onUpgradeMock}
        userId="user-123"
      />
    );
    expect(screen.getByText('Ative o Premium')).toBeTruthy();
    const generateBtn = screen.getByText('Gerar Pix');
    expect(
      (generateBtn as HTMLButtonElement).disabled
    ).toBe(true);
    const input =
      screen.getByPlaceholderText('000.000.000-00');
    await userEvent.type(
      input,
      '11111111111'
    );
    expect(
      (generateBtn as HTMLButtonElement).disabled
    ).toBe(true);
    await userEvent.clear(input);
    await userEvent.type(
      input,
      '52998224725'
    );
    await waitFor(() => {
      expect(
        (generateBtn as HTMLButtonElement).disabled
      ).toBe(false);
    });
  });

  it('Loads plans, creates Pix for day use with planId, updates to PAID and reloads Premium', async () => {
    let statusCalls = 0;
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/payment/plans')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(PLANOS)
        });
      }
      if (url.includes('/api/payment/create')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              paymentId: 'pag-123',
              amount: 19.90,
              qrCodeImage: 'base64-image-string',
              qrCodeText: 'pix-code-str',
              status: 'WAITING',
              planId: 'plan-dayuse-1'
            })
        });
      }
      if (url.includes('/api/payment/status')) {
        statusCalls++;
        if (statusCalls === 1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'WAITING' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'PAID' })
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
    Object.assign(
      navigator,
      {
        clipboard: {
          writeText: vi.fn()
        }
      }
    );
    const onUpgradeMock = vi.fn();
    const onCloseMock = vi.fn();
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          access_token: 'fake-access-token'
        }
      }
    });
    render(
      <PixCheckout
        isOpen={true}
        onClose={onCloseMock}
        onUpgrade={onUpgradeMock}
        userId="user-123"
      />
    );
    const input =
      screen.getByPlaceholderText('000.000.000-00');
    await userEvent.type(
      input,
      '52998224725'
    );
    const generateBtn = screen.getByText('Gerar Pix');
    await waitFor(() => {
      expect(
        (generateBtn as HTMLButtonElement).disabled
      ).toBe(false);
    });
    await userEvent.click(generateBtn);
    await waitFor(() => {
      expect(global.fetch)
        .toHaveBeenCalledWith(
          '/api/payment/create',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"planId":"plan-dayuse-1"')
          })
        );
    });
    expect(
      await screen.findByText('R$ 19,90')
    ).toBeTruthy();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(
      await screen.findByText(
        'Pagamento confirmado. Premium ativado.'
      )
    ).toBeTruthy();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(
      onUpgradeMock
    ).toHaveBeenCalledTimes(1);
  });

  it('Permite escolher o Plano Mensal e gera PIX de R$ 49,90', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/payment/plans')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(PLANOS)
        });
      }
      if (url.includes('/api/payment/create')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              paymentId: 'pag-456',
              amount: 49.90,
              qrCodeImage: 'base64-image-string',
              qrCodeText: 'pix-mensal-str',
              status: 'WAITING',
              planId: 'plan-mensal-1'
            })
        });
      }
      if (url.includes('/api/payment/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'WAITING' })
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
    const onUpgradeMock = vi.fn();
    const onCloseMock = vi.fn();
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          access_token: 'fake-access-token'
        }
      }
    });
    render(
      <PixCheckout
        isOpen={true}
        onClose={onCloseMock}
        onUpgrade={onUpgradeMock}
        userId="user-123"
      />
    );
    const input =
      screen.getByPlaceholderText('000.000.000-00');
    await userEvent.type(
      input,
      '52998224725'
    );
    await userEvent.click(
      screen.getByText('Plano Mensal')
    );
    const generateBtn = screen.getByText('Gerar Pix');
    await waitFor(() => {
      expect(
        (generateBtn as HTMLButtonElement).disabled
      ).toBe(false);
    });
    await userEvent.click(generateBtn);
    await waitFor(() => {
      expect(global.fetch)
        .toHaveBeenCalledWith(
          '/api/payment/create',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"planId":"plan-mensal-1"')
          })
        );
    });
    expect(
      await screen.findByText('R$ 49,90')
    ).toBeTruthy();
  });
});