import { User, Plan, TrustLevel } from "../types";
import { supabase } from "./supabase";
import { CONFIG } from "../config";

export const STORAGE_KEYS = {
  USER_DATA_NEW: 'libido_user_data_v2',
  AUTH_FLAG_NEW: 'libido_auth_active',
} as const;

const OWNER_ID = 'me';

export const cache: { userData: User | null } = {
  userData: null
};

export const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  console[level](`[${level.toUpperCase()}] ${message}`, data || '');
};

export const isOwner = (user: User | null): boolean => {
  return user?.id === OWNER_ID || user?.nickname === 'User_Libido';
};

export const syncWithCloud = async (user: User) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        data: user,
        plan: user.plan || Plan.FREE,
        is_premium: user.is_premium || false,
        stripe_subscription_id: user.stripe_subscription_id || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      log('warn', 'Erro ao salvar no Supabase', error);
    } else {
      log('info', `Perfil sincronizado no Supabase para ${user.nickname}`);
    }
  } catch (e) {
    log('warn', 'Cloud Sync falhou', e);
  }
};

export function getUserData(): User | null {
  const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA_NEW);
  if (raw) {
    try {
      let user = JSON.parse(atob(raw)) as User;   // simplificado
      if (isOwner(user)) {
        user.plan = Plan.GOLD;
        user.is_premium = true;
      }
      if (!user.following) user.following = [];
      cache.userData = user;
      return user;
    } catch (e) {
      console.error('Erro ao ler userData', e);
    }
  }
  return null;
}

export const saveUserData = (userData: Partial<User>) => {
  const current = cache.userData || {} as User;
  const updated = { ...current, ...userData } as User;

  if (isOwner(updated)) {
    updated.plan = Plan.GOLD;
    updated.is_premium = true;
  }
  if (!updated.following) updated.following = [];

  cache.userData = updated;
  localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, btoa(JSON.stringify(updated)));

  syncWithCloud(updated);
};

export function getAuthFlag(): boolean {
  return localStorage.getItem(STORAGE_KEYS.AUTH_FLAG_NEW) === 'true';
}

export function setAuthFlag(v: boolean): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_FLAG_NEW, v ? 'true' : 'false');
}

export const syncCaches = async () => {
  const local = getUserData();
  if (local) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', local.id)
      .single();

    if (data) {
      const cloudUser = { ...local, ...data.data, plan: data.plan, is_premium: data.is_premium };
      cache.userData = cloudUser;
      localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, btoa(JSON.stringify(cloudUser)));
    }
  }
};

export const showNotification = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-white text-sm shadow-2xl z-50 ${
    type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-zinc-800'
  }`;
  notification.innerText = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
};
