import { supabase } from "./supabase";

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("No user data returned");
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      emailVerified: data.user.email_confirmed_at != null,
    },
    session: data.session
  };
};

export const register = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
  if (!data.user) throw new Error("No user data returned");
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      emailVerified: data.user.email_confirmed_at != null,
    },
    session: data.session
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
      callback({
        id: session.user.id,
        email: session.user.email,
        emailVerified: session.user.email_confirmed_at != null,
      });
    } else {
      callback(null);
    }
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email,
        emailVerified: session.user.email_confirmed_at != null,
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
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

export const resetPasswordForEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  if (error) throw error;
};

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};
