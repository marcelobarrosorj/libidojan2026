
import { RadarProfile, RadarResultItem } from '../types';
import { queryRadar } from '../services/radarService';
import { log } from '../services/authUtils';

/**
 * fetchRadarProfiles
 * Realiza a busca de perfis próximos usando o motor interno de geolocalização.
 */
export async function fetchRadarProfiles(params: {
  lat: number;
  lon: number;
  viewerId: string;
  signal?: AbortSignal;
}): Promise<RadarProfile[]> {
  const { lat, lon, viewerId, signal } = params;

  log('info', `[RADAR_SENSORS] Escaneando coordenadas: ${lat}, ${lon}`);

  try {
    // Simula latência de rede
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (signal?.aborted) return [];

    // Em vez de fetch(api/radar), usamos o serviço local que processa a geolocalização
    const data = await queryRadar({ 
      viewerId, 
      viewerLat: lat, 
      viewerLon: lon 
    });

    return data as RadarProfile[];
  } catch (error) {
    log('error', 'Falha nos sensores do radar', error);
    return [];
  }
}
