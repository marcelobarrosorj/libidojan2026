
import { TrustLevel, UserType, Plan, PresenceStatus, type UserProfile, type RadarProfile } from '../types';
import { MOCK_USERS, MOCK_CURRENT_USER, MOCK_MOMENTS, MOCK_POSTS } from '../constants';
import { mockRadarProfiles as fullMocks } from '../radar/mockData';
import { supabase } from './supabase';
import { cache, log } from './authUtils';

export type Viewer = {
  id: string;
  preferredCategories: string[];
  lookingFor: UserType[];
  city: string;
};

export const mockRadarProfiles: RadarProfile[] = (fullMocks || []).slice(0, 10).map(p => ({
    ...p,
    isMock: true
}));

const viewers: Record<string, Viewer> = {
  viewer1: { 
    id: 'viewer1', 
    preferredCategories: ['casais', 'mulher', 'mulheres', 'trisal', 'homem'], 
    lookingFor: [UserType.MULHER, UserType.CASAIS],
    city: 'Rio de Janeiro' 
  },
  me: { 
    id: 'me', 
    preferredCategories: ['casais', 'mulher', 'mulheres', 'trisal', 'homem', 'homem trans', 'mulher trans'], 
    lookingFor: MOCK_CURRENT_USER.lookingFor || [],
    city: 'Rio de Janeiro' 
  },
};

export function loadViewer(viewerId: string): Viewer | null {
  if (cache.userData && (viewerId === 'me' || viewerId === cache.userData.id)) {
      return {
          id: cache.userData.id,
          preferredCategories: (cache.userData as any).vibes || [],
          lookingFor: (cache.userData as any).lookingFor || [UserType.MULHER, UserType.CASAIS, UserType.HOMEM],
          city: cache.userData.city || 'Rio de Janeiro'
      };
  }
  return viewers[viewerId] || viewers['me'];
}

export async function fetchProfilesByBoundingBox(box: { minLat: number; maxLat: number; minLon: number; maxLon: number }): Promise<UserProfile[]> {
  try {
    const { data: realData, error } = await supabase
      .from('profiles')
      .select('*')
      // Marcello: Otimização de busca JSONB
      .filter('data->lat', 'gte', box.minLat)
      .filter('data->lat', 'lte', box.maxLat)
      .limit(100);

    if (error) throw error;

    let out: any[] = [];
    if (realData && realData.length > 0) {
        out = processProfileData(realData).map(p => ({
            id: p.id,
            name: p.name,
            lat: p.lat,
            lon: p.lon,
            city: p.city,
            neighborhood: (p as any).neighborhood,
            category: (p as any).category || 'Explorador',
            categories: [],
            avatar: p.avatar,
            bio: (p as any).bio || '',
            gallery: (p as any).gallery || [],
            isOnline: (p as any).isOnline,
            statusColor: (p as any).statusColor
        }));
    }
    
    if (out.length < 10) {
        const mocks = mockRadarProfiles.map(p => ({
            ...p,
            categories: []
        } as any));
        return [...out, ...mocks].slice(0, 50);
    }
    
    return out;
  } catch (e) {
    console.warn('Falha ao buscar perfis reais no Supabase:', e);
  }
  return mockRadarProfiles as any;
}

export async function searchProfiles(query: string): Promise<RadarProfile[]> {
    if (!query || query.length < 1) return [];
    const term = query.trim();
    const termLower = term.toLowerCase();
    try {
        // Verifica se o termo parece um UUID válido para evitar erros de sintaxe SQL do campo ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term);
        
        let orQuery = `nickname.ilike.%${term}%`;
        if (isUUID) {
            orQuery += `,id.eq.${term}`;
        }

        // Marcello: Busca Direta (Sintaxe Corrigida Supabase com fallback de busca no JSON)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(orQuery)
            .limit(100);
            
        if (error) throw error;
        
        let realUsers = (data && data.length > 0) ? processProfileData(data) : [];

        // Filtro adicional no cliente para garantir que busca por ID ou Serial ocultos no JSONB também funcione
        realUsers = realUsers.filter(p => {
            const nickMatch = (p.name || '').toLowerCase().includes(termLower);
            const idMatch = (p.id || '').toLowerCase().includes(termLower);
            const serialMatch = (p as any).serialNumber === term || ((p as any).serial_number || '').includes(term);
            return nickMatch || idMatch || serialMatch;
        });

        const mockUsers = MOCK_USERS
            .filter(u => 
                (u.nickname || '').toLowerCase().includes(termLower) ||
                (u.id || '').toLowerCase().includes(termLower) ||
                (u.serialNumber || '').toLowerCase().includes(termLower)
            )
            .map(u => ({ ...u, name: u.nickname } as any));
        
        // Marcello: Protocolo de Hibridização (Real + Mocks se necessário)
        const combined = [...realUsers];
        if (combined.length < 10) {
            combined.push(...mockUsers.filter(m => !combined.some(r => r.id === m.id)));
        }
        
        return combined.slice(0, 20);
    } catch (e) {
        console.warn('[REPO] Falha na busca personalizada de perfis:', e);
        return [];
    }
}

export async function getProfileById(id: string): Promise<any | null> {
    try {
        // 1. Tentar banco real (Supabase)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`[REPO] DETALHE DO ERRO SUPABASE (getProfileById):`, {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                id
            });
        }

        if (data) {
            // Marcello: HARDCODE MANDATÁRIO CASALX (Correção Geográfica Instantânea)
            // Se o ID for o do casalx ou o nickname for casalx, forçamos Campo Grande
            if (data.nickname === 'casalx' || id === '65a8d3a4-24b1-47d6-aec4-6819710abae8') {
                const currentData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                console.log("[AUDITORIA] Forçando coordenadas Campo Grande para Casalx (getProfileById)");
                const forcedData = {
                    ...currentData,
                    lat: -22.9031,
                    lon: -43.5590,
                    city: 'Rio de Janeiro',
                    location: 'Campo Grande'
                };
                return { ...forcedData, id: data.id, nickname: 'casalx' };
            }
            
            const profileData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
            
            // Marcello: TRAVA DE SEGURANÇA CASALX (Teletransporte SP -> RJ)
            // Se o banco retornar coordenadas de São Paulo para o casalx, forçamos Campo Grande.
            if (data.nickname === 'casalx' || id === '65a8d3a4-24b1-47d6-aec4-6819710abae8') {
                if (profileData.lat < -23 || !profileData.lat) {
                    console.log("[SEGURANÇA] Teletransportando Casalx: SP -> Campo Grande (RJ)");
                    profileData.lat = -22.9031;
                    profileData.lon = -43.5590;
                    profileData.city = 'Rio de Janeiro';
                }
            }

            // Determinação de Status Online em tempo real absoluto
            const lastSeen = data.last_seen || data.updated_at;
            const diffMinutes = lastSeen ? (new Date().getTime() - new Date(lastSeen).getTime()) / 60000 : 999;
            const isOnline = diffMinutes < 5;
            const status = isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE;

            return {
                ...profileData,
                id: data.id,
                nickname: data.nickname || profileData.nickname || 'Agente',
                isOnline,
                status
            };
        }
    } catch (e) {
        console.warn("[REPO] Erro ao buscar no Supabase, tentando mocks.");
    }

    // 2. Fallback para Mocks
    const mock = MOCK_USERS.find(u => u.id === id) || 
                 MOCK_USERS.find(u => u.id === `mock-${id}`) ||
                 (id === 'me' ? MOCK_CURRENT_USER : null);
    
    return mock || null;
}

export async function fetchLatestProfiles(limitCount: number = 30): Promise<RadarProfile[]> {
    try {
        // Marcello: Se estivermos no browser, tentamos VIA API própria primeiro (mais estável)
        if (typeof window !== 'undefined') {
            try {
                const resp = await fetch(`/api/profiles/latest?limit=${limitCount}`);
                if (resp.ok) {
                    return await resp.json();
                }
            } catch (e) {
                console.warn('[REPO] Falha na API Proxy, tentando Supabase direto...');
            }
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(limitCount);

        if (error) {
            console.warn('[REPO] Supabase Fetch Warning (fetchLatestProfiles):', error.message);
            throw error;
        }

        const realUsers = (data && data.length > 0) ? processProfileData(data) : [];
        
        // Marcello: Prioridade Real total. Mocks apenas para completar o grid.
        const mocksToInclude = MOCK_USERS.map(u => ({ ...u, name: u.nickname } as RadarProfile));

        // Filtra mocks que já existem na Matriz real
        const uniqueMocks = mocksToInclude.filter(m => !realUsers.some(r => (r.name || '').toLowerCase() === (m.name || '').toLowerCase()));

        return [...realUsers, ...uniqueMocks].slice(0, limitCount);
    } catch (e: any) {
        // Marcello: Log reduzido para 'warn' para não poluir o console com erros de rede inevitáveis
        console.warn('[REPO] Fallback ativado para fetchLatestProfiles:', e?.message || 'Network Error');
        return MOCK_USERS.map(u => ({ ...u, name: u.nickname, is_mock: true } as RadarProfile)).slice(0, limitCount);
    }
}

function processProfileData(data: any[]): RadarProfile[] {
    return data.map(item => {
        let u: any = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});
        
        // Marcello: INTERCEPTAÇÃO DE DADOS (Protocolo Casalx e Bloqueio de Cache Antigo)
        if (item.id === '000001' || item.nickname === 'marcelo') {
            item.nickname = 'CASAL BEIJO';
            u.nickname = 'CASAL BEIJO';
            item.serialNumber = '000001';
        }

        if (item.nickname === 'casalx' || item.id === '65a8d3a4-24b1-47d6-aec4-6819710abae8') {
            u.lat = -22.9031;
            u.lon = -43.5590;
            u.city = 'Rio de Janeiro';
            u.location = 'Campo Grande';
        }

        // Determinação de Status Online
        const lastSeen = item.last_seen || item.updated_at;
        const diffMinutes = lastSeen ? (new Date().getTime() - new Date(lastSeen).getTime()) / 60000 : 999;
        const isOnline = diffMinutes < 5;
        const isAway = diffMinutes >= 5 && diffMinutes < 30;
        const statusColor = isOnline ? '#22c55e' : (isAway ? '#eab308' : '#64748b');

        const name = item.nickname || u.nickname || u.name || 'Agente';
        return {
            id: item.id,
            name: name,
            nickname: name,
            lat: u.lat || 0,
            lon: u.lon || 0,
            city: u.city || 'Matriz',
            avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`,
            trustLevel: u.trustLevel || TrustLevel.BRONZE,
            isOnline,
            status: isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE,
            statusColor,
            plan: u.plan || Plan.FREE,
            xp: u.xp || 0,
            level: u.level || 1
        } as any;
    });
}

export async function fetchMoments(limitNum: number = 20): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .not('data->lastMoment', 'is', null)
            .limit(limitNum);
        
        let realMoments: any[] = [];
        if (!error && data) {
            realMoments = (data || []).map(p => {
                let u = typeof p.data === 'string' ? JSON.parse(p.data) : (p.data || {});
                return {
                    id: p.id,
                    userId: p.id,
                    nickname: p.nickname || u.nickname || 'Agente',
                    avatar: u.avatar || '',
                    imageUrl: u.lastMoment?.imageUrl,
                    timestamp: u.lastMoment?.timestamp,
                    viewed: false
                };
            });
        }
        
        return [...realMoments, ...MOCK_MOMENTS].slice(0, limitNum);
    } catch (e) { return MOCK_MOMENTS; }
}

/**
 * Busca os seguidores de um usuário (Quem segue este usuário)
 */
export async function fetchFollowers(userId: string): Promise<RadarProfile[]> {
    try {
        // Marcello: Busca experimental via JSONB filtering
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .filter('data->following', 'cs', `["${userId}"]`);

        if (error) {
            log('warn', '[REPO] Falha ao filtrar seguidores via JSONB, tentando fetch hibrido.', error);
            // Fallback: Busca os últimos perfis e filtra localmente (limitado aos mais recentes por performance)
            const { data: latest } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(200);
            
            if (!latest) return [];
            
            const filtered = latest.filter(item => {
                const ud = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                return ud?.following?.includes(userId);
            });
            
            return processProfileData(filtered);
        }

        return data ? processProfileData(data) : [];
    } catch (e) {
        console.error('[REPO] Erro crítico ao buscar seguidores:', e);
        return [];
    }
}

/**
 * Busca quem o usuário está seguindo (Lista de perfis seguidos)
 */
export async function fetchFollowing(userId: string, followedIds: string[]): Promise<RadarProfile[]> {
    if (!followedIds || followedIds.length === 0) return [];
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('id', followedIds);

        if (error) throw error;
        return data ? processProfileData(data) : [];
    } catch (e) {
        return [];
    }
}

export async function fetchPosts(limitNum: number = 20): Promise<any[]> {
    // Marcello: Abandono definitivo da tabela 'posts' (Erro 404) para limpar o log e restaurar o Feed
    // O app passa a usar exclusivamente os MOCK_POSTS definidos em constants.tsx
    console.warn('[REPO] Feed em modo de simulação (Mock Only) devido à ausência da tabela no banco.');
    return MOCK_POSTS.slice(0, limitNum);
}

export async function likeProfile(targetUserId: string): Promise<{ success: boolean; isMatch: boolean }> {
    return { success: true, isMatch: Math.random() > 0.8 };
}

export async function passProfile(targetUserId: string): Promise<boolean> {
    return true;
}
