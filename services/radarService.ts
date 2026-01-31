
import { User, RadarResultItem, UserProfile, TrustLevel, Plan } from '../types';
import { haversineKm, formatDistanceLabel, boundingBox } from './geoService';
import { matchesPreferences } from './prefs';
import { loadViewer, fetchProfilesByBoundingBox, mockRadarProfiles } from './repo';

const MIN_KM = 0.1; 
const MAX_KM_FREE = 15;
const MAX_KM_PREMIUM = 250; 

export async function queryRadar(params: { viewerId: string; viewerLat: number; viewerLon: number; plan?: Plan }): Promise<RadarResultItem[]> {
  const { viewerId, viewerLat, viewerLon, plan = Plan.FREE } = params;

  const viewer = loadViewer(viewerId);
  if (!viewer) throw new Error('Usuário não encontrado.');

  const isPremium = plan !== Plan.FREE;
  const activeMaxKm = isPremium ? MAX_KM_PREMIUM : MAX_KM_FREE;

  const box = boundingBox(viewerLat, viewerLon, activeMaxKm);
  const candidates = fetchProfilesByBoundingBox(box);

  let out: RadarResultItem[] = [];

  for (const p of candidates) {
    if (p.id === viewerId) continue;
    if (!matchesPreferences(p, viewer.preferredCategories)) continue;

    const rawDistanceKm = haversineKm(viewerLat, viewerLon, p.lat, p.lon);
    if (rawDistanceKm > activeMaxKm) continue;

    const distanceKm = Math.max(rawDistanceKm, MIN_KM);
    const locationLabel = p.city === viewer.city ? (p.neighborhood || p.city) : p.city;

    out.push({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      bio: p.bio,
      category: p.category,
      distanceKm,
      distanceLabel: formatDistanceLabel(distanceKm),
      locationLabel,
      city: p.city,
      neighborhood: p.neighborhood,
      lat: p.lat,
      lon: p.lon,
      trustLevel: (p as any).trustLevel || TrustLevel.BRONZE
    });
  }

  // Se o radar estiver vazio, usamos os mocks
  if (out.length === 0) {
    out = mockRadarProfiles.map((m, idx) => {
      const angle = (idx / mockRadarProfiles.length) * Math.PI * 2;
      const randomDist = 2 + Math.random() * (activeMaxKm - 2); 
      
      const offsetLat = (randomDist / 111) * Math.cos(angle);
      const offsetLon = (randomDist / (111 * Math.cos(viewerLat * Math.PI / 180))) * Math.sin(angle);

      return {
        ...m,
        lat: viewerLat + offsetLat,
        lon: viewerLon + offsetLon,
        distanceKm: randomDist,
        distanceLabel: formatDistanceLabel(randomDist),
        locationLabel: 'Descoberta VIP',
        isMock: true
      };
    }) as any;
  }

  out.sort((a, b) => a.distanceKm - b.distanceKm);

  // APLICAÇÃO DA RESTRIÇÃO FREE
  if (!isPremium) {
    return out.map((profile, index) => {
      if (index === 0) return profile; // Primeiro perfil é liberado

      // Perfis subsequentes são ofuscados
      return {
        ...profile,
        id: `locked-${profile.id}`,
        name: 'Perfil Oculto',
        avatar: 'https://www.libidoapp.com.br/placeholder-locked.png', // URL de mock distorcido
        bio: 'Assine para visualizar esta biografia.',
        isLocked: true, // Flag para o frontend
        trustLevel: TrustLevel.BRONZE
      } as any;
    });
  }

  return out;
}
