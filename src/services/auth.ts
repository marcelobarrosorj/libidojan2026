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

  const confirmadoNoBanco = data.user.email_confirmed_at != null;
  if (confirmadoNoBanco) {
    try {
      localStorage.removeItem('libido_novo_nao_confirmado_' + data.user.id);
    } catch (e) {
      console.error(e);
    }
  }

  const pendenteNovo = localStorage.getItem('libido_novo_nao_confirmado_' + data.user.id) === '1';

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

  const confirmado = data.user.email_confirmed_at != null;
  if (!confirmado) {
    try {
      localStorage.setItem('libido_novo_nao_confirmado_' + data.user.id, '1');
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      localStorage.removeItem('libido_novo_nao_confirmado_' + data.user.id);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      emailVerified: confirmado && !localStorage.getItem('libido_novo_nao_confirmado_' + data.user.id),
    },
    session: confirmado ? data.session : null
  };
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = (callback: (user: any) => void) => {
  const processSessionUser = (user: any) => {
    if (!user) return null;
    const isUrlConfirmed = window.location.hash.includes('access_token') || window.location.hash.includes('type=signup');
    const isDbConfirmed = user.email_confirmed_at != null;

    if (isUrlConfirmed || isDbConfirmed) {
      try {
        localStorage.removeItem('libido_novo_nao_confirmado_' + user.id);
      } catch (e) {
        console.error(e);
      }
    }

    const bloqueadoNovo = localStorage.getItem('libido_novo_nao_confirmado_' + user.id) === '1';

    return {
      id: user.id,
      email: user.email,
      emailVerified: isDbConfirmed && !bloqueadoNovo,
    };
  };

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback(processSessionUser(session.user));
    } else {
      callback(null);
    }
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      callback(processSessionUser(session.user));
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
