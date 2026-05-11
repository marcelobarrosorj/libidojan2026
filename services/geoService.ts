
export const EARTH_RADIUS_KM = 6371.0088; // WGS84 mean earth radius
export const KM_PER_LAT_DEGREE = 111.195; // EarthRadius * PI / 180

/**
 * Calculates the Haversine distance between two points in kilometers.
 * Uses a precise earth radius and checks for edge cases.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) return 9999;
  
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return Number.isFinite(distance) ? distance : 9999;
}

/**
 * Pre-filter efficient by bounding box (reduces cost before Haversine).
 */
export function boundingBox(
  lat: number,
  lon: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = radiusKm / KM_PER_LAT_DEGREE;
  const lonDelta = radiusKm / (KM_PER_LAT_DEGREE * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

/**
 * Formats a distance in km for human reading with high precision for short distances.
 */
export function formatDistanceLabel(distanceKm: number): string {
  if (distanceKm === undefined || distanceKm >= 9999) return "Sinal fraco";
  if (distanceKm <= 0.01) return "Aqui agora"; // Menos de 10 metros
  
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    if (meters < 50) return "Muito perto";
    // Arredonda para os 50m mais próximos para manter equilíbrio entre precisão e privacidade
    const roundedMeters = Math.max(50, Math.ceil(meters / 50) * 50);
    return `${roundedMeters} m`;
  }
  
  if (distanceKm > 1000) return "+999 km";
  
  // Formata com 1 casa decimal usando vírgula como separador (padrão PT-BR)
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

/**
 * Retrieves user current coordinates using the browser's Geolocation API.
 */
export function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}
