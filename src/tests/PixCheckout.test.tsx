import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PixCheckout } from '../components/PixCheckout';

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    }
  }
}));

import { supabase } from '../services/supabase';

const originalFetch = global.fetch;

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
    const onUpgradeMock = vi.fn();
    const onCloseMock = vi.fn();
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { access_token: 'fake-access-token' } }
    });

    render(<PixCheckout isOpen={true} onClose={onCloseMock} onUpgrade={onUpgradeMock} userId="user-123" />);

    expect(screen.getByText('Ative o Premium')).toBeTruthy();
    const generateBtn = screen.getByText('Gerar Pix');
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

    const input = screen.getByPlaceholderText('000.000.000-00');
    
    // Type invalid CPF
    await userEvent.type(input, '11111111111');
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('CPF inválido')).toBeTruthy();

    await userEvent.clear(input);

    // Type valid CPF
    await userEvent.type(input, '52998224725');
    // The mask will apply 529.982.247-25
    expect((generateBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('Renders and successfully loads Pix info, updates to PAID, and reloads Premium', async () => {
    const onUpgradeMock = vi.fn();
    const onCloseMock = vi.fn();

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { access_token: 'fake-access-token' } }
    });

    let fetchCallCount = 0;
    (global.fetch as any).mockImplementation((url: string) => {
      fetchCallCount++;
      if (url.includes('/api/payment/create')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            paymentId: 'pag-123',
            amount: 19.90,
            qrCodeImage: 'base64-image-string',
            qrCodeText: 'pix-code-str',
            status: 'WAITING'
          })
        });
      } else if (url.includes('/api/payment/status')) {
        if (fetchCallCount === 2) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'WAITING', isPremium: false })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'PAID', isPremium: true })
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn() },
    });

    render(<PixCheckout isOpen={true} onClose={onCloseMock} onUpgrade={onUpgradeMock} userId="user-123" />);

    expect(screen.getByText('Ative o Premium')).toBeTruthy();

    const input = screen.getByPlaceholderText('000.000.000-00');
    await userEvent.type(input, '52998224725');

    const generateBtn = screen.getByText('Gerar Pix');
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payment/create', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Authorization': 'Bearer fake-access-token' }),
        body: JSON.stringify({ customerTaxId: '52998224725' })
      }));
    });

    expect(await screen.findByText('R$ 19,90')).toBeTruthy();
    expect(screen.getByText('Copiar código Pix')).toBeTruthy();

    // Advance 5 seconds for first poll
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/payment/status/pag-123', expect.any(Object));

    // Advance 5 seconds for second poll
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(await screen.findByText('Pagamento confirmado. Premium ativado.')).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(onUpgradeMock).toHaveBeenCalledTimes(1);
    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
