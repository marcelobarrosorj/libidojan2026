
import type { UserProfile, RadarProfile } from '../types';
import { MOCK_USERS, MOCK_CURRENT_USER } from '../constants';
import { mockRadarProfiles as fullMocks } from '../radar/mockData';
import { UserType } from '../types';

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
      .select('id, nickname, data')
      .gte('data->>lat', box.minLat.toString())
      .lte('data->>lat', box.maxLat.toString())
      // Nota: Filtragem de lon e outros critérios seriam feitos aqui em um app escala real.
      // Simplificando para retorno de todos os perfis ativos para o radar.
      .limit(50);

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(item => {
        const u = item.data as any;
        return {
            id: item.id,
            name: item.nickname || u.nickname,
            lat: u.lat || 0,
            lon: u.lon || 0,
            city: u.city || '',
            neighborhood: u.neighborhood || '',
            category: u.type || 'Explorador',
            categories: [],
            avatar: u.avatar || `https://picsum.photos/seed/${item.id}/400`,
            bio: u.bio || ''
        };
      });
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
      bio: u.bio
  }));
}
