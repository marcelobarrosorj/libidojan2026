
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
  const candidates = await fetchProfilesByBoundingBox(box);

  let out: RadarResultItem[] = [];

  for (const p of candidates) {
    if (p.id === viewerId) continue;
    
    // Filtro por categorias/interesses
    if (!matchesPreferences(p, viewer.preferredCategories)) continue;
    
    // Filtro por Preferência 'lookingFor' (tipo do perfil deve estar na lista do visualizador)
    // No mapping do repo.ts, p.category recebe o UserType (Homem, Mulher, Casais)
    if (viewer.lookingFor && viewer.lookingFor.length > 0) {
      if (!viewer.lookingFor.includes(p.category as any)) continue;
    }

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

  // Se o radar estiver vazio, usamos os mocks formatados e embaralhados
  if (out.length === 0) {
    const shuffledMocks = [...mockRadarProfiles].sort(() => Math.random() - 0.5);
    out = shuffledMocks.map((m, idx) => {
      const angle = (idx / shuffledMocks.length) * Math.PI * 2;
      const randomDist = 2 + Math.random() * (activeMaxKm - 2); 
      
      const offsetLat = (randomDist / 111) * Math.cos(angle);
      const offsetLon = (randomDist / (111 * Math.cos(viewerLat * Math.PI / 180))) * Math.sin(angle);

      return {
        ...m,
        lat: viewerLat + offsetLat,
        lon: viewerLon + offsetLon,
        distanceKm: randomDist,
        distanceLabel: formatDistanceLabel(randomDist),
        locationLabel: 'Sinal Matriz',
        isMock: true
      };
    }) as any;
  }

  out.sort((a, b) => a.distanceKm - b.distanceKm);

  // APLICAÇÃO DA RESTRIÇÃO FREE
  if (!isPremium) {
    // Definimos um índice de desbloqueio determinístico baseado no ID do usuário ou aleatório para a sessão
    // Aqui usaremos aleatório para dar dinamismo conforme solicitado para "expert fix"
    const unlockIndex = Math.floor(Math.random() * out.length);

    return out.map((profile, index) => {
      if (index === unlockIndex) return profile; // Um perfil aleatório é liberado para dar dinamismo

      // Perfis subsequentes são ofuscados
      return {
        ...profile,
        id: `locked-${profile.id}`,
        name: 'Sinal Oculto',
        avatar: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400', // Arte abstrata
        bio: 'Assine para sincronizar esta biografia.',
        isLocked: true, 
        trustLevel: TrustLevel.BRONZE
      } as any;
    });
  }

  return out;
}
