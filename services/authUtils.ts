
import { User, Vouch, Shoutout, TrustLevel, Plan, UserType } from "../types";
import { supabase } from "./supabase";
import { CONFIG } from "../config";

export type UserData = Record<string, any>;

export const STORAGE_KEYS = {
  USER_DATA_NEW: 'libido_user_data_v2',
  AUTH_FLAG_NEW: 'libido_auth_active',
} as const;

export const cache: { userData: User | null } = {
    userData: null
};

// Decodificação segura para o LocalStorage
const safeAtob = (str: string) => {
    try { 
        return decodeURIComponent(atob(str)); 
    }
    catch (e) { 
        try { return atob(str); } catch (e2) { return null; }
    }
};

export const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    console[level](`[${level.toUpperCase()}] ${message}`, data || '');
};

/**
 * Verifica se um usuário possui status premium de forma consolidada
 */
export const isPremiumUser = (user: User | null): boolean => {
    if (isOwner(user)) return true; // Proprietário tem acesso total
    return user?.is_premium || user?.plan === Plan.GOLD || user?.plan === Plan.PREMIUM || false;
};

/**
 * Verifica privilégios de Proprietário (God Mode)
 */
export const isOwner = (user: User | null): boolean => {
    if (!user) return false;
    return user.id === '000001' || user.email === 'marcelobarrosorj@gmail.com';
};

export const syncWithCloud = async (user: User) => {
    try {
        if (!user || !user.id) return;
        
        const timestamp = new Date().toISOString();
        
        // Tentativa de upsert com colunas básicas que devem existir
        const { error } = await supabase
            .from('profiles')
            .upsert({ 
                id: user.id, 
                nickname: user.nickname, 
                data: user,
                updated_at: timestamp
            }, { onConflict: 'id' });
            
        if (error) {
            log('warn', 'Cloud Sync Error (Tentando modo simplificado)', error);
            // Fallback simplificado garantindo id, data e updated_at
            const fallbackData: any = { 
                id: user.id, 
                data: user,
                updated_at: timestamp
            };
            if (user.nickname) fallbackData.nickname = user.nickname;
            
            // Tenta o upsert mais básico possível
            const { error: secondError } = await supabase.from('profiles').upsert(fallbackData, { onConflict: 'id' });
            
            if (secondError) {
                // Última tentativa: apenas ID e DATA JSON + timestamp
                await supabase.from('profiles').upsert({ 
                    id: user.id, 
                    data: user,
                    updated_at: timestamp
                }, { onConflict: 'id' });
            }
        }
    } catch (e) {
        log('warn', 'Cloud Sync Offline ou Erro de Rede', e);
    }
};

const isBrowser = typeof window !== 'undefined';

export const getUserData = (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA_NEW);
    if (!raw) return null;
    const data = safeAtob(raw);
    return data ? JSON.parse(data) : null;
};

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

export const saveUserData = async (userData: Partial<User>) => {
    const current = cache.userData || getUserData() || {} as User;
    const timestamp = new Date().toISOString();
    
    const updated = { ...current, ...userData, updatedAt: timestamp } as User;
    cache.userData = updated;
    
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, btoa(encodeURIComponent(JSON.stringify(updated))));
    }

    // Atualiza imediatamente o estado para evitar necessidade de refresh
    authEvents.notify(updated);

    // Sincronização Silenciosa com Supabase
    if (updated.id && updated.id !== 'me') {
        const { error } = await supabase.from('profiles').upsert({
            id: updated.id,
            nickname: updated.nickname || (updated as any).name || 'Agente',
            data: updated,
            updated_at: timestamp,
            last_seen: timestamp // Atualiza bolinha de status
        }, { onConflict: 'id' });
        
        if (error) log('warn', 'Erro no Upsert Automático (saveUserData)', error);
    }
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
        // Simplificado para 'select(*)' para evitar erro 400 se colunas não existirem
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', local.id)
            .single();
        
        if (error) {
            log('warn', 'Falha ao sincronizar com servidor, operando em modo local', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                id: local.id
            });
            
            // Marcello: Protocolo de Blindagem Autoritária - NUNCA resetamos o cache local por erro de rede/banco
            return;
        }

        if (data) {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            const rawCloudData = data.data || {};
            const cloudData = (typeof rawCloudData === 'string' ? JSON.parse(rawCloudData) : rawCloudData) as User;
            
            // Sincroniza status de verificação de e-mail do Supabase Auth
            if (supabaseUser) {
                cloudData.emailVerified = !!supabaseUser.email_confirmed_at;
            }
            
            // Marcello: Toda a informação agora é lida estritamente de DENTRO do JSON 'data'
            // conforme orientações de schema simplificado (id, nickname, data)
            cloudData.id = data.id;
            if (data.nickname) cloudData.nickname = data.nickname;
            
            if (!cloudData.following) cloudData.following = [];

            // Só atualiza se houver mudança real ou se for a primeira vez
            const cloudStr = JSON.stringify(cloudData);
            const localStr = JSON.stringify(local);

            if (cloudStr !== localStr) {
                log('info', 'Dados novos detectados na nuvem. Sincronizando de forma segura.');
                
                // Marcello: Fusão Inteligente para prevenir perda de dados
                // Priorizamos dados do local para campos críticos durante a sessão (como galeria recém alterada)
                // Se a nuvem for mais nova (baseado em updatedAt), poderíamos confiar nela
                const cloudTimestamp = cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0;
                const localTimestamp = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
                
                let mergedData: User;
                if (localTimestamp > cloudTimestamp) {
                    log('info', '[SYNC] Cache local é mais recente. Preservando estado local.');
                    mergedData = { ...cloudData, ...local };
                } else {
                    log('info', '[SYNC] Dados da nuvem são mais recentes. Atualizando cache.');
                    mergedData = { ...local, ...cloudData };
                }

                // Garante que campos essenciais nunca sumam
                mergedData.id = data.id || local.id;
                mergedData.nickname = data.nickname || mergedData.nickname || local.nickname;
                
                const mergedStr = JSON.stringify(mergedData);
                if (mergedStr !== localStr) {
                    cache.userData = mergedData;
                    if (isBrowser) {
                        localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, btoa(encodeURIComponent(mergedStr)));
                    }
                    authEvents.notify(mergedData);
                }
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
    if (CONFIG.APP_URL && !window.location.origin.includes(new URL(CONFIG.APP_URL).hostname)) {
        log('error', 'Integridade de origem violada.');
        return false;
    }
    return true;
};

export const getNextSerialNumber = () => {
    return `LX-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const sanitizeInput = (i: string) => i.replace(/[<>]/g, '');
export const postShoutout = async (t: string, type: any, u: any) => ({ success: true });
export const likeProfile = async (id: string) => {
    await toggleFollow(id);
    return { isMatch: Math.random() > 0.8 };
};
export const passProfile = async (id: string) => ({});

export const simulateApiCall = async (tag: string, data: any, delay: number = 1000) => {
    log('info', `[AUDIT][API_REQUEST][${tag}]`, data);
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
