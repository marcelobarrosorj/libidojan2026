
export const MAX_RADIUS_KM = 250;
export const MAX_KM_ALLOWED = 250;
export const MIN_KM_DISPLAY = 0.1;

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine.
 * Implementação resiliente a coordenadas zero e instabilidades de ponto flutuante.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 9999;
  
  // Se forem exatamente o mesmo ponto
  if (lat1 === lat2 && lon1 === lon2) return 0.05;

  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formata o label de distância seguindo a regra:
 * - Menor que 1km: exibe em metros (m)
 * - Maior ou igual a 1km: exibe em quilômetros (km)
 */
export function formatDistanceLabel(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    // Garante um valor mínimo visual para não parecer 0m
    return `${Math.max(meters, 1)} m`;
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
