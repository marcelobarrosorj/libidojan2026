import { supabase } from "./supabase";

const DOMINIOS_DESCARTAVEIS = new Set([
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com',
  'mailinator.com', 'sharklasers.com', 'trashmail.com', 'getnada.com',
  'mohmal.com', 'temp-mail.org', 'fakeinbox.com', 'maildrop.cc',
  'dispostable.com', 'mailnesia.com', 'tempmailo.com', 'teste.com',
  'exemplo.com', 'example.com', 'email.com', 'fake.com'
]);

export function validarEmailReal(email: string): { valido: boolean; erro?: string } {
  const limpo = String(email || '').trim().toLowerCase();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!regex.test(limpo)) {
    return { valido: false, erro: 'Informe um endereço de e-mail válido.' };
  }
  const partes = limpo.split('@');
  const usuario = partes[0];
  const dominio = partes[1];
  if (!dominio || DOMINIOS_DESCARTAVEIS.has(dominio)) {
    return { valido: false, erro: 'E-mails temporários ou fictícios não são permitidos. Use seu e-mail real.' };
  }
  if (usuario.length < 2 || /^(\d+|teste|admin|asd|qwe)$/i.test(usuario)) {
    return { valido: false, erro: 'Informe um e-mail pessoal válido para receber o link de confirmação.' };
  }
  return { valido: true };
}

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("No user data returned");

  const pendenteNovo = localStorage.getItem('libido_novo_nao_confirmado_' + data.user.id) === '1';
  const confirmadoNoBanco = data.user.email_confirmed_at != null;

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      emailVerified: confirmadoNoBanco && !pendenteNovo,
    },
    session: data.session
  };
};

export const register = async (email: string, password: string) => {
  const validacao = validarEmailReal(email);
  if (!validacao.valido) {
    throw new Error(validacao.erro);
  }

  const emailLimpo = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: emailLimpo,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
  if (!data.user) throw new Error("No user data returned");

  // Se o Supabase estiver com autoconfirm desligado, data.session sera null (correto).
  // Mesmo se o servidor retornar sessao sem o clique no link, exigimos a confirmacao para novos cadastros:
  const confirmado = !!(data.user.email_confirmed_at && !data.session);
  if (!data.user.email_confirmed_at) {
    try { localStorage.setItem('libido_novo_nao_confirmado_' + data.user.id, '1'); } catch (e) { console.error(e); }
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      emailVerified: data.user.email_confirmed_at != null && !localStorage.getItem('libido_novo_nao_confirmado_' + data.user.id),
    },
    session: data.user.email_confirmed_at ? data.session : null
  };
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = (callback: (user: any) => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (window.location.hash.includes('access_token') || window.location.hash.includes('type=signup')) {
          try { localStorage.removeItem('libido_novo_nao_confirmado_' + session.user.id); } catch (e) { console.error(e); }
        }
      }
      const bloqueadoNovo = localStorage.getItem('libido_novo_nao_confirmado_' + session.user.id) === '1';
      callback({
        id: session.user.id,
        email: session.user.email,
        emailVerified: session.user.email_confirmed_at != null && !bloqueadoNovo,
      });
    } else {
      callback(null);
    }
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      if (window.location.hash.includes('access_token') || window.location.hash.includes('type=signup')) {
        try { localStorage.removeItem('libido_novo_nao_confirmado_' + session.user.id); } catch (e) { console.error(e); }
      }
      const bloqueadoNovo = localStorage.getItem('libido_novo_nao_confirmado_' + session.user.id) === '1';
      callback({
        id: session.user.id,
        email: session.user.email,
        emailVerified: session.user.email_confirmed_at != null && !bloqueadoNovo,
      });
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

export const resendVerification = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

export const resetPasswordForEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: window.location.origin
  });
  if (error) throw error;
};

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};