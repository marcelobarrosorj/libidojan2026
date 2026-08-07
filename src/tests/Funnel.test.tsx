import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { Onboarding } from '../components/Onboarding';

// Mock dependencies
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn()
    }
  }
}));

vi.mock('../services/users', () => ({
  getUserById: vi.fn(),
  updateUserProfile: vi.fn()
}));

vi.mock('../services/auth', async (importOriginal) => {
  const mod = await importOriginal() as any;
  return {
    ...mod,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn((cb) => { cb(null); return () => {}; }),
    resendVerification: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updatePassword: vi.fn()
  };
});

import * as auth from '../services/auth';
import { getUserById } from '../services/users';

describe('Monetization Funnel Final Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    document.body.className = '';
  });

  it('cadastro sem sessão', async () => {
    (auth.register as Mock).mockResolvedValueOnce({ user: { id: '1', email: 'test@test.com', emailVerified: false }, session: null });
    render(<App />);
    fireEvent.click(screen.getByText(/Criar meu perfil/i));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText(/CRIAR CONTA/i));
    await waitFor(() => {
      expect(screen.getByText(/Confirme seu E-mail/i)).toBeInTheDocument();
    });
  });

  it('usuário ainda não confirmado', async () => {
    (auth.getCurrentUser as Mock).mockImplementationOnce((cb: any) => {
       cb({ id: '1', email: 'test@test.com', emailVerified: false });
       return () => {};
    });
    render(<App />);
    await waitFor(() => {
       expect(screen.getByText(/Confirme seu E-mail/i)).toBeInTheDocument();
    });
  });

  it('usuário confirmado', async () => {
    (auth.getCurrentUser as Mock).mockImplementationOnce((cb: any) => {
       cb({ id: '1', email: 'test@test.com', emailVerified: true });
       return () => {};
    });
    (getUserById as Mock).mockResolvedValueOnce({ nickname: 'Test', status: 'active', plan: 'free', is_banned: false, is_deleted: false });
    
    render(<App />);
    await waitFor(() => {
       expect(screen.queryByText(/Confirme seu E-mail/i)).not.toBeInTheDocument();
    });
  });

  it('retorno pelo link de confirmação', () => {
    window.location.hash = '#access_token=123&type=signup';
    render(<App />);
    expect(window.location.hash).toBe('#access_token=123&type=signup');
  });

  it('recuperação de senha', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Já tenho uma conta/i));
    fireEvent.click(screen.getByText(/Esqueci/i));
    expect(screen.getByText(/Esqueci minha senha/i)).toBeInTheDocument();
  });
});
