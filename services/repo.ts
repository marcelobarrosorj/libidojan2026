
import { TrustLevel, UserType, type UserProfile, type RadarProfile } from '../types';
import { MOCK_USERS, MOCK_CURRENT_USER } from '../constants';
import { mockRadarProfiles as fullMocks } from '../radar/mockData';

export type Viewer = {
  id: string;
  preferredCategories: string[];
  lookingFor: UserType[];
  city: string;
};

/**
 * Mock de perfis para testes rápidos de UI do radar.
 * Pegamos uma fatia dos mocks completos para o fallback rápido.
 */
export const mockRadarProfiles: RadarProfile[] = fullMocks.slice(0, 10).map(p => ({
    ...p,
    isMock: true
}));

/**
 * Mock de visualizadores com preferências pré-configuradas.
 */
const viewers: Record<string, Viewer> = {
  viewer1: { 
    id: 'viewer1', 
    preferredCategories: ['casais', 'mulher', 'mulheres', 'trisal', 'homem'], 
    lookingFor: [UserType.MULHER, UserType.CASAIS],
    city: 'São Paulo' 
  },
  me: { 
    id: 'me', 
    preferredCategories: ['casais', 'mulher', 'mulheres', 'trisal', 'homem', 'homem trans', 'mulher trans'], 
    lookingFor: MOCK_CURRENT_USER.lookingFor,
    city: 'São Paulo' 
  },
};

export function loadViewer(viewerId: string): Viewer | null {
  return viewers[viewerId] || viewers['me'];
}

import { supabase } from './supabase';

/**
 * Busca perfis reais no banco de dados usando o retângulo envolvente (Bounding Box).
 */
export async function fetchProfilesByBoundingBox(box: { minLat: number; maxLat: number; minLon: number; maxLon: number }): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*') // Pega tudo para processar corretamente
      .gte('data->>lat', box.minLat.toString())
      .lte('data->>lat', box.maxLat.toString())
      .limit(50);

    if (error) throw error;

    if (data && data.length > 0) {
        // Usa a função processProfileData para garantir consistência de nomes e fotos
        return processProfileData(data).map(p => ({
            id: p.id,
            name: p.name,
            lat: p.lat,
            lon: p.lon,
            city: p.city,
            neighborhood: p.neighborhood,
            category: p.category || 'Explorador',
            categories: [], // Campo legado necessário para UserProfile
            avatar: p.avatar,
            bio: p.bio || '',
            serialNumber: p.serialNumber
        }));
    }
  } catch (e) {
    console.warn('Falha ao buscar perfis reais, retornando mocks:', e);
  }

  // Fallback para mocks se o banco estiver vazio ou falhar
  return MOCK_USERS.map(u => ({
      id: u.id,
      name: u.nickname,
      lat: u.lat || 0,
      lon: u.lon || 0,
      city: u.city || '',
      neighborhood: u.neighborhood || '',
      category: u.type,
      categories: [],
      avatar: u.avatar,
      bio: u.bio,
      serialNumber: u.serialNumber
  }));
}

/**
 * Busca perfis globalmente por serialNumber, nickname ou email
 */
export async function searchProfiles(query: string): Promise<RadarProfile[]> {
    if (!query || query.length < 2) return [];

    try {
        const isNumeric = /^\d+$/.test(query);
        let supabaseQuery = supabase.from('profiles').select('*');

        if (isNumeric) {
            // Busca exata por serialNumber se for numérico
            supabaseQuery = supabaseQuery.or(`data->>serialNumber.eq.${query},data->>serialNumber.ilike.%${query}%`);
        } else {
            // Busca parcial por nickname ou email em colunas E dentro do JSON
            supabaseQuery = supabaseQuery.or(`nickname.ilike.%${query}%,email.ilike.%${query}%,data->>nickname.ilike.%${query}%,data->>mainNickname.ilike.%${query}%`);
        }

        const { data, error } = await supabaseQuery.limit(20);
        if (error) throw error;

        return processProfileData(data || []);
    } catch (e) {
        console.error('[REPO] Erro na busca:', e);
        return [];
    }
}

/**
 * Busca os últimos perfis cadastrados no Supabase
 */
export async function fetchLatestProfiles(limitCount: number = 20): Promise<RadarProfile[]> {
    const tryQuery = async (orderBy?: string) => {
        let query = supabase.from('profiles').select('*').limit(limitCount);
        if (orderBy) {
            query = query.order(orderBy, { ascending: false });
        }
        return await query;
    };

    try {
        // Estratégia 1: Ordem de criação (Padrão Supabase)
        let { data, error } = await tryQuery('created_at');
        
        // Estratégia 2: Ordem de atualização manual
        if (error || !data || data.length === 0) {
            const result = await tryQuery('updated_at');
            if (result.data && result.data.length > 0) {
                data = result.data;
                error = result.error;
            }
        }

        // Estratégia 3: Ordem de atualização dentro do JSON data
        if (error || !data || data.length === 0) {
            const result = await supabase
                .from('profiles')
                .select('*')
                .order('data->>updatedAt', { ascending: false })
                .limit(limitCount);
            if (result.data && result.data.length > 0) {
                data = result.data;
                error = result.error;
            }
        }

        // Estratégia 4: Simplesmente pegar os primeiros sem ordem (último recurso real)
        if (error || !data || data.length === 0) {
            const result = await tryQuery(); // Sem order
            data = result.data;
            error = result.error;
        }

        if (error) throw error;
        
        if (!data || data.length === 0) {
            throw new Error('Nenhum dado real no banco');
        }

        return processProfileData(data);
    } catch (e) {
        console.error('[REPO] Falha ao obter novatos reais:', e);
        // Fallback para mocks apenas se o banco estiver inacessível ou vazio
        return MOCK_USERS.slice(0, 10).map(u => ({
            id: u.id,
            name: u.nickname,
            lat: u.lat || 0,
            lon: u.lon || 0,
            city: 'Matriz (Mock)',
            neighborhood: '',
            category: u.type,
            avatar: u.avatar,
            bio: u.bio,
            serialNumber: u.serialNumber,
            trustLevel: TrustLevel.BRONZE,
            isMock: true
        }));
    }
}

/**
 * Função auxiliar para processar dados brutos do Supabase
 */
function processProfileData(data: any[]): RadarProfile[] {
    return data.map(item => {
        // Garante que u seja um objeto, lidando com possíveis retornos em string JSON
        let u: any = {};
        try {
            u = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});
        } catch (e) {
            console.error('Erro ao processar JSON data do usuário:', item.id, e);
            u = {};
        }

        // Resolução agressiva de nome: tenta várias chaves possíveis da Matriz
        const rawName = item.nickname || u.nickname || u.mainNickname || u.name || item.name;
        
        // Se ainda for anônimo, tenta derivar do e-mail (se disponível) ou usa o serial
        let displayName = rawName;
        if (!displayName || displayName === 'Anon' || displayName === 'Agente Anônimo') {
            if (item.email) {
                displayName = item.email.split('@')[0].toUpperCase();
            } else if (u.email) {
                displayName = u.email.split('@')[0].toUpperCase();
            } else {
                displayName = item.serial_number ? `AGENTE ${item.serial_number}` : 'AGENTE ANÔNIMO';
            }
        }

        return {
            id: item.id,
            name: displayName,
            lat: u.lat || 0,
            lon: u.lon || 0,
            city: u.city || u.location?.split(',')[0] || 'Matriz',
            neighborhood: u.neighborhood || '',
            category: u.type || 'Explorador',
            avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`,
            bio: u.bio || '',
            serialNumber: item.serial_number || u.serialNumber,
            trustLevel: u.trustLevel || TrustLevel.BRONZE,
            isMock: false,
            // Campo extra para o ranking usar se disponível
            age: u.age || 18
        } as RadarProfile;
    });
}

/**
 * Busca um perfil específico por ID
 */
export async function getProfileById(id: string): Promise<RadarProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw error;

        return processProfileData([data])[0];
    } catch (e) {
        console.error('[REPO] Erro ao buscar perfil por ID:', e);
        // Fallback para mock
        const mock = MOCK_USERS.find(u => u.id === id);
        if (mock) {
            return {
                id: mock.id,
                name: mock.nickname,
                lat: mock.lat || 0,
                lon: mock.lon || 0,
                city: '',
                neighborhood: '',
                category: mock.type,
                avatar: mock.avatar,
                bio: mock.bio,
                serialNumber: mock.serialNumber,
                trustLevel: TrustLevel.BRONZE
            };
        }
        return null;
    }
}
