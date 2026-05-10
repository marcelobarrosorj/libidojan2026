
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
  // Se for um usuário real logado (cache), usamos os dados dele
  if (cache.userData && (viewerId === 'me' || viewerId === cache.userData.id)) {
      return {
          id: cache.userData.id,
          preferredCategories: cache.userData.vibes || [],
          lookingFor: cache.userData.lookingFor || [UserType.MULHER, UserType.CASAIS, UserType.HOMEM],
          city: cache.userData.city || 'São Paulo'
      };
  }
  return viewers[viewerId] || viewers['me'];
}

import { supabase } from './supabase';
import { cache } from './authUtils';

/**
 * Busca perfis reais no banco de dados usando o retângulo envolvente (Bounding Box).
 */
export async function fetchProfilesByBoundingBox(box: { minLat: number; maxLat: number; minLon: number; maxLon: number }): Promise<UserProfile[]> {
  try {
    // Usamos filtros que funcionam melhor com números em JSONB no Supabase
    // O operador ->lat pega o valor numérico se estiver armazenado como número
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .filter('data->lat', 'gte', box.minLat)
      .filter('data->lat', 'lte', box.maxLat)
      .limit(100);

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
            gallery: p.gallery || [],
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
      gallery: u.gallery || [],
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

        if (data && data.length > 0) {
            return processProfileData(data);
        }

        // Fallback para busca nos mocks
        const term = query.toLowerCase();
        return MOCK_USERS.filter(u => 
            u.nickname.toLowerCase().includes(term) || 
            u.serialNumber?.includes(term)
        ).map(u => ({
            id: u.id,
            name: u.nickname,
            avatar: u.avatar,
            category: u.type,
            lat: u.lat,
            lon: u.lon,
            city: u.city || '',
            neighborhood: u.neighborhood || '',
            gallery: u.gallery || [],
            serialNumber: u.serialNumber
        }));
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
        console.log('[REPO] Buscando novatos com limite:', limitCount);
        // Estratégia 1: Ordem de criação (Padrão Supabase)
        let { data, error } = await tryQuery('created_at');
        if (error) console.warn('[REPO] created_at order failed, trying next...');
        
        // Estratégia 2: Ordem de atualização manual
        if (error || !data || data.length === 0) {
            const result = await tryQuery('updated_at');
            if (result.data && result.data.length > 0) {
                data = result.data;
                error = result.error;
            } else if (result.error) {
                console.warn('[REPO] updated_at order failed, trying next...');
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
            } else if (result.error) {
                console.warn('[REPO] JSON updatedAt order failed, trying next...');
            }
        }

        // Estratégia 4: Simplesmente pegar os primeiros sem ordem (último recurso real)
        if (error || !data || data.length === 0) {
            console.log('[REPO] Usando fetch sem ordem como último recurso');
            const result = await tryQuery(); // Sem order
            data = result.data;
            error = result.error;
        }

        if (error) throw error;
        
        if (!data || data.length === 0) {
            console.log('[REPO] Banco de dados vazio, usando fallback de mocks combinados');
            const combined = [
                ...MOCK_USERS,
                ...fullMocks.filter(m => !MOCK_USERS.find(mu => mu.id === m.id))
            ].slice(0, limitCount);

            return combined.map(u => ({
                id: u.id,
                name: (u as any).nickname || (u as any).name,
                lat: u.lat || 0,
                lon: u.lon || 0,
                city: (u as any).city || 'Matriz (Mock)',
                neighborhood: (u as any).neighborhood || '',
                category: (u as any).type || (u as any).category,
                avatar: u.avatar,
                bio: (u as any).bio || '',
                gallery: (u as any).gallery || [],
                serialNumber: u.serialNumber,
                trustLevel: (u as any).trustLevel || TrustLevel.BRONZE,
                isMock: true,
                age: (u as any).age || 25
            })) as RadarProfile[];
        }

        const processed = processProfileData(data);
        console.log('[REPO] Novatos processados:', processed.length);
        return processed;
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
            gallery: u.gallery || [],
            serialNumber: u.serialNumber,
            trustLevel: TrustLevel.BRONZE,
            isMock: true
        })) as any[];
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
            gallery: u.gallery || [],
            serialNumber: item.serial_number || u.serialNumber,
            trustLevel: u.trustLevel || TrustLevel.BRONZE,
            isMock: false,
            // Campo extra para o ranking usar se disponível
            age: u.age || 18
        } as any; // Cast para any pois RadarProfile pode não ter gallery
    });
}

/**
 * Busca um perfil específico por ID com dados completos (User)
 */
export async function getProfileById(id: string): Promise<any | null> {
    // Regex simples para validar formato UUID v4 (padrão Supabase/Postgres)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUuid = uuidRegex.test(id);

    try {
        if (!isValidUuid) {
            // Se não for um UUID válido, assumimos que é um MOCK (ex: "m2", "me")
            // Pulamos a chamada ao Supabase para evitar o erro "invalid input syntax for type uuid"
            throw new Error(`ID ${id} não é um UUID válido, tentando fallback para MOCK.`);
        }

        console.log(`[REPO] getProfileById: Buscando ${id}`);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.warn(`[REPO] Perfil ${id} não encontrado no DB.`);
            throw error || new Error('Not found');
        }

        // Processa o radar profile básico
        const base = processProfileData([data])[0];
        
        // Extrai o JSON completo de data
        let fullData: any = {};
        try {
            fullData = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data || {});
        } catch (e) {
            console.error('Erro ao processar JSON data em getProfileById:', e);
        }

        // Tenta buscar o e-mail real se não estiver no JSON
        const email = data.email || fullData.email;

        return {
            ...fullData,
            ...base,
            id: data.id,
            email: email,
            nickname: data.nickname || fullData.nickname || base.name,
            serialNumber: data.serial_number || fullData.serialNumber || base.serialNumber
        };
    } catch (e) {
        const errorMessage = (e as any).message || '';
        
        // Log discreto para IDs que sabemos ser MOCK ou erros de sintaxe esperados
        if (!isValidUuid || errorMessage.includes('invalid input syntax for type uuid')) {
            console.log(`[REPO] ID ${id} não é DB-UUID. Verificando MOCKS...`);
        } else {
            console.error(`[REPO] Falha real na busca do perfil ${id}:`, errorMessage);
        }
        
        // Fallback para MOCKS: Se falhar ou for ID de mock, tentamos no registro local
        // 1. Tenta no MOCK_USERS (Perfis de destaque/feed)
        let mock: any = MOCK_USERS.find((u: any) => u.id === id || u.id === `mock-${id}`);
        
        // 2. Se não encontrou, tenta nos mocks do radar (fullMocks)
        if (!mock) {
            mock = fullMocks.find((u: any) => u.id === id || u.id === `mock-${id}`);
        }

        if (mock) {
            console.log(`[REPO] Resolvido via MOCK: ${id}`);
            return mock;
        }

        return null;
    }
}

/**
 * Retorna o próximo Serial Number disponível (000001...) vindo do banco de dados
 */
export async function dbGetNextSerialNumber(): Promise<string> {
    try {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        const nextId = (count || 0) + 1;
        return nextId.toString().padStart(6, '0');
    } catch (e) {
        console.error('[REPO] Erro ao gerar Serial Number:', e);
        // Fallback baseado em timestamp se o banco falhar
        return Math.floor(Date.now() / 1000).toString().slice(-6);
    }
}
