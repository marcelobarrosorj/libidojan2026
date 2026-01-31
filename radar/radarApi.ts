
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
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (signal?.aborted) return [];

    const data = await queryRadar({ 
      viewerId, 
      viewerLat: lat, 
      viewerLon: lon 
    });

    return data as RadarProfile[];
  } catch (error) {
    if ((error as any).name === 'AbortError') return [];
    throw error;
  }
}
