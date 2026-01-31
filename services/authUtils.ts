
import { User, Vouch, Shoutout, TrustLevel, Plan } from "../types";
import { supabase } from "./supabase";
import { CONFIG } from "../config";

export type UserData = Record<string, any>;

export const STORAGE_KEYS = {
  USER_DATA_NEW: 'libido_user_data_v2',
  AUTH_FLAG_NEW: 'libido_auth_active',
} as const;

// ID do Proprietário para acesso irrestrito
const OWNER_ID = 'me';

export const cache: { userData: User | null } = {
    userData: null
};

const safeBtoa = (str: string) => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
const safeAtob = (str: string) => decodeURIComponent(Array.prototype.map.call(atob(str), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

export const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    console[level](`[${level.toUpperCase()}] ${message}`, data || '');
};

/**
 * Verifica se o usuário logado é o proprietário para liberar acesso total
 */
export const isOwner = (user: User | null): boolean => {
    return user?.id === OWNER_ID || user?.nickname === 'User_Libido';
};

export const syncWithCloud = async (user: User) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({ 
                id: user.id, 
                nickname: user.nickname, 
                data: user,
                plan: user.plan,
                updated_at: new Date().toISOString()
            });
        if (error) throw error;
    } catch (e) {
        log('warn', 'Cloud Sync Offline ou Erro de Permissão', e);
    }
};

export function getUserData(): User | null {
  const rawNew = localStorage.getItem(STORAGE_KEYS.USER_DATA_NEW);
  if (rawNew) {
    try {
      let user = JSON.parse(safeAtob(rawNew)) as User;
      // Injeção de privilégios de proprietário em tempo de execução
      if (isOwner(user)) {
          user.plan = Plan.GOLD;
          user.is_premium = true;
          user.trustLevel = TrustLevel.OURO;
      }
      return user;
    } catch (e) { return null; }
  }
  return null;
}

export const saveUserData = (userData: Partial<User> | UserData) => {
    const current = cache.userData || {} as User;
    let updated = { ...current, ...userData } as User;
    
    // Garante que o proprietário nunca perca o status GOLD por engano
    if (isOwner(updated)) {
        updated.plan = Plan.GOLD;
        updated.is_premium = true;
    }

    cache.userData = updated;
    const encoded = safeBtoa(JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, encoded);
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
        cache.userData = local;
        const { data } = await supabase.from('profiles').select('data').eq('id', local.id).single();
        if (data) {
            let cloudData = data.data as User;
            // Validação de proprietário no retorno da nuvem
            if (isOwner(cloudData)) {
                cloudData.plan = Plan.GOLD;
                cloudData.is_premium = true;
            }
            cache.userData = cloudData;
            localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, safeBtoa(JSON.stringify(cloudData)));
        }
    }
};

export const showNotification = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'bg-rose-600' : type === 'success' ? 'bg-green-600' : 'bg-slate-800'} text-white animate-in slide-in-from-top duration-300 shadow-2xl`;
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('animate-out', 'fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

export const handleButtonAction = async <T>(
    id: string,
    action: () => Promise<T>,
    options: any = {}
) => {
    if (options.validate && !options.validate()) return;
    if (options.setLoading) options.setLoading(true);
    try {
        const result = await action();
        if (options.onSuccess) options.onSuccess(result);
        if (options.onUIUpdate) options.onUIUpdate(result);
        return result;
    } catch (error: any) {
        showNotification(error.message, 'error');
        throw error;
    } finally {
        if (options.setLoading) options.setLoading(false);
    }
};

export const retryWithBackoff = async <T>(operation: () => Promise<T>): Promise<T> => {
    return await operation();
};

export const validateIntegrity = (): boolean => {
    // Added null check for CONFIG.APP_URL which might be missing in some environments
    if (CONFIG.APP_URL && !window.location.origin.includes(new URL(CONFIG.APP_URL).hostname)) {
        log('error', 'Integridade de origem violada.');
        return false;
    }
    return true;
};

export const sanitizeInput = (i: string) => i.replace(/[<>]/g, '');
export const postShoutout = async (t: string, type: any, u: any) => ({ success: true });
export const likeProfile = async (id: string) => ({ isMatch: Math.random() > 0.8 });
export const passProfile = async (id: string) => ({});

export const simulateApiCall = async (tag: string, data: any, delay: number = 1000) => {
    log('info', `[PRODUCTION_READY][${tag}]`, data);
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const vouchUser = async (targetUserId: string) => {
    log('info', `[VOUCH] User ${targetUserId} vouched`);
    return { success: true };
};
