
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
const OWNER_EMAIL = 'marcelobarrosorj@gmail.com';

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
    if (!user) return false;
    return user.id === OWNER_ID || 
           user.nickname === 'User_Libido' || 
           user.email === OWNER_EMAIL;
};

/**
 * Verifica se um usuário possui status premium de forma consolidada
 */
export const isPremiumUser = (user: User | null): boolean => {
    if (!user) return false;
    return isOwner(user) || user.is_premium || user.plan === Plan.GOLD || user.plan === Plan.PREMIUM;
};

export const syncWithCloud = async (user: User) => {
    try {
        if (!user || !user.id) return;
        const { error } = await supabase
            .from('profiles')
            .upsert({ 
                id: user.id, 
                nickname: user.nickname, 
                data: user,
                plan: user.plan,
                updated_at: new Date().toISOString()
            });
        if (error) log('warn', 'Cloud Sync Error', error);
    } catch (e) {
        log('warn', 'Cloud Sync Offline ou Erro de Rede', e);
    }
};

const isBrowser = typeof window !== 'undefined';

export function getUserData(): User | null {
  if (!isBrowser) return null;
  const rawNew = localStorage.getItem(STORAGE_KEYS.USER_DATA_NEW);
  if (rawNew) {
    try {
      let user = JSON.parse(safeAtob(rawNew)) as User;
      // Injeção de privilégios de proprietário em tempo de execução
      if (isOwner(user)) {
          user.plan = Plan.GOLD;
          user.is_premium = true;
          user.trustLevel = TrustLevel.OURO;
          user.emailVerified = true;
          user.isSubscriber = true;
      }
      // Garantir que following existe
      if (!user.following) user.following = [];
      if (!user.verificationLevels) {
          user.verificationLevels = { identity: false, photo: false, social: false, trust: false };
      }
      if (user.totalLikes === undefined) user.totalLikes = 0;
      if (user.totalViews === undefined) user.totalViews = 0;
      return user;
    } catch (e) { return null; }
  }
  return null;
}

// Gerenciamento de eventos de atualização de cache
type CacheListener = (user: User | null) => void;
const listeners = new Set<CacheListener>();

export const authEvents = {
    subscribe: (listener: CacheListener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    notify: (user: User | null) => {
        listeners.forEach(l => l(user));
    }
};

export const saveUserData = (userData: Partial<User> | UserData) => {
    const current = cache.userData || {} as User;
    let updated = { ...current, ...userData } as User;
    
    // Garante que o proprietário nunca perca o status GOLD por engano
    if (isOwner(updated)) {
        updated.plan = Plan.GOLD;
        updated.is_premium = true;
        updated.emailVerified = true;
        updated.isSubscriber = true;
    }

    // Proteção Anti-Downgrade: Se o cache diz que é PREMIUM e o novo dado diz que é FREE,
    // mantém o status PREMIUM a menos que seja uma redefinição total.
    if (cache.userData?.is_premium && !updated.is_premium && Object.keys(userData).length < 10) {
        log('warn', '[AUTH] Bloqueado downgrade acidental de plano detectado em salvamento parcial.');
        updated.is_premium = true;
        updated.plan = cache.userData.plan;
    }

    if (!updated.following) updated.following = [];

    cache.userData = updated;
    if (isBrowser) {
        const encoded = safeBtoa(JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, encoded);
    }
    authEvents.notify(updated);
    syncWithCloud(updated);
};

/**
 * Alterna o estado de seguir um usuário.
 */
export const toggleFollow = async (targetUserId: string): Promise<boolean> => {
    const user = cache.userData;
    if (!user) return false;

    const following = user.following || [];
    const isFollowing = following.includes(targetUserId);
    
    const newFollowing = isFollowing 
        ? following.filter(id => id !== targetUserId)
        : [...following, targetUserId];

    saveUserData({ ...user, following: newFollowing });
    log('info', `[FOLLOW] User ${targetUserId} ${isFollowing ? 'unfollowed' : 'followed'}`);
    return !isFollowing;
};

export function getAuthFlag(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem(STORAGE_KEYS.AUTH_FLAG_NEW) === 'true';
}

export function setAuthFlag(v: boolean): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.AUTH_FLAG_NEW, v ? 'true' : 'false');
}

export const syncCaches = async () => {
    try {
        const local = getUserData();
        if (!local || !local.id) return;

        log('info', 'Sincronizando cache com Supabase...');
        const { data, error } = await supabase
            .from('profiles')
            .select('data, plan, is_premium, trust_level, xp, level')
            .eq('id', local.id)
            .single();
        
        if (error) {
            log('warn', 'Falha ao sincronizar com servidor, operando em modo local');
            return;
        }

        if (data) {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            const cloudData = (data.data || {}) as User;
            
            // Sincroniza status de verificação de e-mail do Supabase Auth
            if (supabaseUser) {
                cloudData.emailVerified = !!supabaseUser.email_confirmed_at;
            }
            
            // Prioriza colunas individuais do banco de dados sobre o JSON 'data'
            // Isso garante que mudanças feitas por sistemas externos (Stripe/Webhooks) sejam respeitadas
            if (data.plan) cloudData.plan = data.plan as Plan;
            if (data.is_premium !== undefined) cloudData.is_premium = !!data.is_premium;
            if (data.trust_level) cloudData.trustLevel = data.trust_level as TrustLevel;
            if (data.xp !== undefined) cloudData.xp = data.xp;
            if (data.level !== undefined) cloudData.level = data.level;

            if (isOwner(cloudData)) {
                cloudData.plan = Plan.GOLD;
                cloudData.is_premium = true;
                cloudData.emailVerified = true;
                cloudData.isSubscriber = true;
                cloudData.trustLevel = TrustLevel.OURO;
            }
            if (!cloudData.following) cloudData.following = [];

            // Só atualiza se houver mudança real ou se for a primeira vez
            const cloudStr = JSON.stringify(cloudData);
            const localStr = JSON.stringify(local);

            if (cloudStr !== localStr) {
                log('info', 'Dados novos detectados na nuvem. Atualizando cache local.');
                cache.userData = cloudData;
                if (isBrowser) {
                    localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, safeBtoa(cloudStr));
                }
                authEvents.notify(cloudData);
            } else {
                log('info', 'Cache local já está sincronizado.');
                cache.userData = local;
            }
        }
    } catch (e) {
        log('warn', 'Erro crítico durante sincronização de cache', e);
    }
};

export const showNotification = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    if (!isBrowser) {
        log('info', `[NOTIFICATION] ${message}`);
        return;
    }
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
    if (!isBrowser) return true;
    // Added null check for CONFIG.APP_URL which might be missing in some environments
    if (CONFIG.APP_URL && !window.location.origin.includes(new URL(CONFIG.APP_URL).hostname)) {
        log('error', 'Integridade de origem violada.');
        return false;
    }
    return true;
};

export const sanitizeInput = (i: string) => i.replace(/[<>]/g, '');
export const postShoutout = async (t: string, type: any, u: any) => ({ success: true });
export const likeProfile = async (id: string) => {
    // Ao dar like, automaticamente segue o usuário conforme solicitação
    await toggleFollow(id);
    return { isMatch: Math.random() > 0.8 };
};
export const passProfile = async (id: string) => ({});

export const simulateApiCall = async (tag: string, data: any, delay: number = 1000) => {
    log('info', `[AUDIT][API_REQUEST][${tag}]`, data);
    // Simula uma falha em 5% das vezes para auditoria de tratamento de erro
    if (Math.random() < 0.05) {
        throw new Error('Falha simulada na comunicação com o servidor.');
    }
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const vouchUser = async (targetUserId: string) => {
    log('info', `[VOUCH] User ${targetUserId} vouched`);
    return { success: true };
};

/**
 * Alterna o Modo Ghost (navegação invisível)
 */
export const toggleGhostMode = async (): Promise<boolean> => {
    const user = cache.userData;
    if (!user) return false;

    const newGhostMode = !user.isGhostMode;
    saveUserData({ ...user, isGhostMode: newGhostMode });
    log('info', `[PRIVACY] Ghost Mode ${newGhostMode ? 'enabled' : 'disabled'}`);
    return newGhostMode;
};
