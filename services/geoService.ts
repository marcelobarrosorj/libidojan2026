
/**
 * Calculates the Haversine distance between two points in kilometers.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0; // Distância real zero se a posição for idêntica
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Pre-filter efficient by bounding box (reduces cost before Haversine).
 */
export function boundingBox(
  lat: number,
  lon: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = radiusKm / 111.32;
  const lonDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

/**
 * Formats a distance in km for human reading.
 */
export function formatDistanceLabel(distanceKm: number): string {
  if (distanceKm <= 0.005) return "Aqui agora"; // Menos de 5 metros
  
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    if (meters < 50) return "Muito perto";
    // Arredonda para os 50m mais próximos para manter alguma privacidade mas ser mais preciso que 100m
    const roundedMeters = Math.max(50, Math.ceil(meters / 50) * 50);
    return `${roundedMeters} m`;
  }
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
