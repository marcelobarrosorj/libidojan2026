
import type { RadarProfile } from './types';
import { queryRadar } from '../services/radarService';

export async function fetchRadarProfiles(params: {
  lat: number;
  lon: number;
  viewerId: string;
  signal?: AbortSignal;
}): Promise<RadarProfile[]> {
  const { lat, lon, viewerId, signal } = params;

  try {
    // Marcello: Usa API do servidor para garantir estabilidade e bypassar erros de rede client-side
    const resp = await fetch(`/api/radar?lat=${lat}&lon=${lon}`, {
        headers: {
            'x-user-id': viewerId
        },
        signal
    });

    if (!resp.ok) {
        throw new Error('Falha na resposta da API Radar');
    }

    const data = await resp.json();
    return data as RadarProfile[];
  } catch (error) {
    if ((error as any).name === 'AbortError') return [];
    
    // Fallback local se a API falhar
    console.warn('[RADAR_API] Falha na API Central, tentando modo de redundância local...');
    try {
        const { queryRadar } = await import('../services/radarService');
        const data = await queryRadar({ 
          viewerId, 
          viewerLat: lat, 
          viewerLon: lon 
        });
        return data as RadarProfile[];
    } catch (e) {
        return [];
    }
  }
}
