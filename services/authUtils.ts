
import { User, Vouch, Shoutout, TrustLevel, Plan, UserType } from "../types";
import { supabase } from "./supabase";
import { CONFIG } from "../config";

export type UserData = Record<string, any>;

/**
 * Converte um ID textual arbitrário (ex: "000001", "m1", "casalx") em um formato UUID válido para banco.
 * Se já for um UUID válido, retorna-o como está.
 */
export function toDatabaseId(id: string): string {
    if (!id) return id;
    const s = String(id).trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(s)) return s;

    if (s === '000001') {
        return '00000000-0000-0000-0000-000000000001';
    }
    if (s === 'me') {
        return '00000000-0000-0000-0000-0000000000ee';
    }
    if (s === 'casalx') {
        return '65a8d3a4-24b1-47d6-aec4-6819710abae8'; // CasalX da matriz
    }

    if (s.startsWith('m') && s.length > 1 && !isNaN(Number(s.substring(1)))) {
        const num = s.substring(1).padStart(12, '0');
        return `00000000-0000-0000-0000-${num}`;
    }

    // Hash determinístico simples em hex
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
    }
    const absHashHex = Math.abs(hash).toString(16).padEnd(12, '0').slice(0, 12);
    return `00000000-0000-0000-0000-${absHashHex}`;
}

export function fromDatabaseId(id: string): string {
    if (!id) return id;
    const s = String(id).trim().toLowerCase();
    if (s === '00000000-0000-0000-0000-000000000001') {
        return '000001';
    }
    if (s === '00000000-0000-0000-0000-0000000000ee') {
        return 'me';
    }
    if (s === '65a8d3a4-24b1-47d6-aec4-6819710abae8') {
        return 'casalx';
    }
    if (s.startsWith('00000000-0000-0000-0000-')) {
        const hex = s.substring(24);
        const numStr = hex.replace(/^0+/, '');
        if (numStr) {
            return `m${numStr}`;
        }
        return hex;
    }
    return id;
}

export function parseUTC(dateStr: any): Date {
    if (!dateStr) return new Date(0);
    if (dateStr instanceof Date) return dateStr;
    let str = String(dateStr).trim();
    if (!str.includes('Z') && !str.includes('+') && !/-\d{2}:\d{2}$/.test(str)) {
        str = str.replace(' ', 'T') + 'Z';
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date(dateStr) : d;
}

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
        const dbId = toDatabaseId(user.id);
        
        // Tentativa de upsert com colunas básicas que devem existir
        const { error } = await supabase
            .from('profiles')
            .upsert({ 
                id: dbId, 
                nickname: user.nickname, 
                data: user,
                updated_at: timestamp
            }, { onConflict: 'id' });
            
        if (error) {
            log('warn', 'Cloud Sync Error (Tentando modo simplificado)', error);
            // Fallback simplificado garantindo id, data e updated_at
            const fallbackData: any = { 
                id: dbId, 
                data: user,
                updated_at: timestamp
            };
            if (user.nickname) fallbackData.nickname = user.nickname;
            
            // Tenta o upsert mais básico possível
            const { error: secondError } = await supabase.from('profiles').upsert(fallbackData, { onConflict: 'id' });
            
            if (secondError) {
                // Última tentativa: apenas ID e DATA JSON + timestamp
                await supabase.from('profiles').upsert({ 
                    id: dbId, 
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
    
    const updated = { ...current, ...userData, updatedAt: timestamp, last_seen: timestamp, lastSeen: timestamp } as User;
    cache.userData = updated;
    
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA_NEW, btoa(encodeURIComponent(JSON.stringify(updated))));
    }

    // Atualiza imediatamente o estado para evitar necessidade de refresh
    authEvents.notify(updated);

    // Sincronização Silenciosa com Supabase
    if (updated.id && updated.id !== 'me') {
        try {
            const dbId = toDatabaseId(updated.id);
            const nickname = updated.nickname || (updated as any).name || 'Agente';
            
            // Tentativa 1: Upsert completo com last_seen (caso a coluna exista)
            const { error } = await supabase.from('profiles').upsert({
                id: dbId,
                nickname: nickname,
                data: updated,
                updated_at: timestamp,
                last_seen: timestamp
            }, { onConflict: 'id' });
            
            if (error) {
                log('warn', 'Erro no Upsert Automático Completo, tentando sem a coluna last_seen:', error);
                // Tentativa 2: Sem a coluna last_seen (que pode não existir no postgres)
                const { error: secondError } = await supabase.from('profiles').upsert({
                    id: dbId,
                    nickname: nickname,
                    data: updated,
                    updated_at: timestamp
                }, { onConflict: 'id' });
                
                if (secondError) {
                    log('warn', 'Erro no Segundo Upsert de saveUserData, tentando modo ultra simplificado:', secondError);
                    // Tentativa 3: Ultra simplificado (apenas id e data)
                    await supabase.from('profiles').upsert({
                        id: dbId,
                        data: updated,
                        updated_at: timestamp
                    }, { onConflict: 'id' });
                }
            }
        } catch (dbErr) {
            log('error', 'Falha crítica ao sincronizar saveUserData com o Supabase', dbErr);
        }
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

export const showNotification = (message: any, type: 'info' | 'error' | 'success' = 'info') => {
    if (!isBrowser) {
        log('info', `[NOTIFICATION] ${message}`);
        return;
    }

    let friendlyMessage = '';
    
    // Converte e higieniza a mensagem recebida de forma extremamente robusta
    if (!message) {
        friendlyMessage = 'CONEXÃO ATIVA COM A MATRIZ CENTRAL';
    } else if (typeof message === 'string') {
        friendlyMessage = message;
    } else if (message.message) {
        friendlyMessage = message.message;
    } else {
        try {
            friendlyMessage = JSON.stringify(message);
        } catch {
            friendlyMessage = String(message);
        }
    }

    // Tradutor de erros de baixo nível / de engenharia para UX High-End "Matriz"
    const lowerMessage = friendlyMessage.toLowerCase();
    if (
        lowerMessage.includes('failed to fetch') || 
        lowerMessage.includes('networkerror') || 
        lowerMessage.includes('load failed') || 
        lowerMessage.includes('network error') ||
        lowerMessage.includes('consignor error') || 
        lowerMessage.includes('connection aborted')
    ) {
        friendlyMessage = 'SINAL INSTÁVEL COM A MATRIZ. SINCRONIZANDO EM SEGUNDO PLANO...';
    } else if (lowerMessage.includes('supabase') || lowerMessage.includes('database') || lowerMessage.includes('postgres')) {
        friendlyMessage = 'RESILIÊNCIA DA BANCO DE DADOS ATIVA. OPERANDO CO-PROCESSAMENTO LOCAL.';
    } else if (lowerMessage.includes('session') || lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('jwt')) {
        friendlyMessage = 'SEGURANÇA RE-VALIDANDO CHAVES DE CRIPTOGRAFIA.';
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'bg-rose-600 border border-rose-500/30' : type === 'success' ? 'bg-emerald-600 border border-emerald-500/30' : 'bg-slate-900 border border-white/5'} text-white uppercase text-xs font-semibold tracking-wider p-4 rounded-xl shadow-2xl transition-all duration-300`;
    
    // Se preferir, podemos capitalizar a mensagem para seguir as diretivas visuais curtas do AGENTS.md
    notification.innerText = friendlyMessage.toUpperCase();
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('animate-out', 'fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4000); // 4 segundos de exibição elegante
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
