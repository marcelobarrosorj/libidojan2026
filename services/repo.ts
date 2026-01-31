
import type { UserProfile, RadarProfile } from '../types';
import { MOCK_USERS } from '../constants';
import { mockRadarProfiles as fullMocks } from '../radar/mockData';

export type Viewer = {
  id: string;
  preferredCategories: string[];
  city: string;
};

/**
 * Base de perfis indexada para o radar.
 * Converte MOCK_USERS para o formato UserProfile.
 */
const profiles: UserProfile[] = MOCK_USERS.map(u => ({
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
  viewer1: { id: 'viewer1', preferredCategories: ['casais', 'mulher', 'mulheres', 'trisal', 'homem'], city: 'São Paulo' },
  me: { id: 'me', preferredCategories: ['casais', 'mulher', 'mulheres', 'trisal', 'homem', 'homem trans', 'mulher trans'], city: 'São Paulo' },
};

export function loadViewer(viewerId: string): Viewer | null {
  return viewers[viewerId] || viewers['me'];
}

export function fetchProfilesByBoundingBox(box: { minLat: number; maxLat: number; minLon: number; maxLon: number }): UserProfile[] {
  return profiles.filter(
    (p) => p.lat >= box.minLat && p.lat <= box.maxLat && p.lon >= box.minLon && p.lon <= box.maxLon
  );
}
