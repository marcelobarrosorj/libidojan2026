
export const MAX_RADIUS_KM = 250;
export const MAX_KM_ALLOWED = 250;
export const MIN_KM_DISPLAY = 0.1;

export const EARTH_RADIUS_KM = 6371.0088; // WGS84 mean earth radius
export const KM_PER_LAT_DEGREE = 111.195;

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine.
 * Implementação resiliente a coordenadas zero e instabilidades de ponto flutuante.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) return 9999;
  
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return Number.isFinite(distance) ? distance : 9999;
}

/**
 * Formata o label de distância seguindo a regra:
 * - Menor que 1km: exibe em metros (m)
 * - Maior ou igual a 1km: exibe em quilômetros (km)
 */
export function formatDistanceLabel(km: number): string {
  if (km === undefined || km >= 9999) return "Sinal fraco";
  if (km <= 0.01) return "Aqui agora"; // Menos de 10 metros
  
  if (km < 1) {
    const meters = Math.round(km * 1000);
    if (meters < 50) return "Muito perto";
    // Arredonda para os 50m mais próximos para manter equilíbrio entre precisão e privacidade
    const roundedMeters = Math.max(50, Math.ceil(meters / 50) * 50);
    return `${roundedMeters} m`;
  }
  
  if (km > 1000) return "+999 km";
  
  // Formata com 1 casa decimal usando vírgula como separador (padrão PT-BR)
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function computeLocationLabel(viewerCity: string, profileCity: string, neighborhood: string): string {
  if (!profileCity) return 'Localização Privada';
  if (viewerCity.toLowerCase() === profileCity.toLowerCase()) {
    return neighborhood || profileCity;
  }
  return profileCity;
}

export function clampMinDistanceKm(km: number): number {
  return Math.max(km, MIN_KM_DISPLAY);
}

export function normalizeRadiusKm(radius: number): number {
  return Math.min(Math.max(radius, 1), MAX_RADIUS_KM);
}
