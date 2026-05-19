
import { User, RadarResultItem, UserProfile, TrustLevel, Plan } from '../types';
import { haversineKm, formatDistanceLabel, boundingBox } from './geoService';
import { matchesPreferences } from './prefs';
import { loadViewer, fetchProfilesByBoundingBox, mockRadarProfiles } from './repo';
import { MOCK_USERS } from '../constants';
import { supabase } from './supabase';

const MIN_KM = 0.1; 
const MAX_KM_FREE = 15;
const MAX_KM_PREMIUM = 250; 

export async function queryRadar(params: { viewerId: string; viewerLat: number; viewerLon: number; plan?: Plan }): Promise<RadarResultItem[]> {
    // Forçar fallback para Volta Redonda caso coordenadas estejam zeradas ou ausentes
    const safeLat = (params.viewerLat && Math.abs(params.viewerLat) > 0.01) ? params.viewerLat : -22.5231;
    const safeLon = (params.viewerLon && Math.abs(params.viewerLon) > 0.01) ? params.viewerLon : -44.1042;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(100); 

        if (error) {
            console.error('[RADAR] Erro ao buscar perfis reais:', error);
        }

        const realUsersFromSupabase = (data || []).map((item: any) => {
            const u = item.data || {};
            const itemLat = u.lat || 0;
            const itemLon = u.lon || 0;
            const dist = haversineKm(safeLat, safeLon, itemLat, itemLon);
            
            return {
                id: item.id,
                name: item.nickname || u.nickname || 'Agente',
                avatar: u.avatar || '',
                lat: itemLat,
                lon: itemLon,
                distanceKm: dist,
                distanceLabel: formatDistanceLabel(dist),
                city: u.city || 'Matriz',
                isMock: item.is_mock || false, 
                trustLevel: u.trustLevel || TrustLevel.BRONZE
            } as RadarResultItem;
        });

        // HÍBRIDO: Injeção de Mocks para evitar "deserto"
        // Marcello, aqui garantimos que os mocks fiquem espalhados perto de Volta Redonda (Raio de ~10km)
        const mockResults = MOCK_USERS.map((m: any, idx: number) => {
            // Marcello: Protocolo Casalx - Preservar coordenadas e ID para interceptor
            if (m.nickname === 'casalx' || m.id === '65a8d3a4-24b1-47d6-aec4-6819710abae8') {
                const dist = haversineKm(safeLat, safeLon, -22.9031, -43.5590);
                return { 
                    ...m, 
                    name: m.nickname, 
                    lat: -22.9031, 
                    lon: -43.5590, 
                    distanceKm: dist,
                    distanceLabel: formatDistanceLabel(dist),
                    isMock: true,
                    trustLevel: m.trustLevel || TrustLevel.BRONZE
                } as RadarResultItem;
            }
            const angle = (idx / MOCK_USERS.length) * Math.PI * 2;
            const mLat = -22.5231 + (Math.cos(angle) * 0.05);
            const mLon = -44.1042 + (Math.sin(angle) * 0.05);
            const dist = haversineKm(safeLat, safeLon, mLat, mLon);

            return {
                ...m,
                id: `mock-${m.id}`,
                name: m.nickname,
                lat: mLat,
                lon: mLon,
                distanceKm: dist,
                distanceLabel: formatDistanceLabel(dist),
                isMock: true,
                trustLevel: m.trustLevel || TrustLevel.BRONZE
            } as RadarResultItem;
        });

        const combined = [...realUsersFromSupabase, ...mockResults];
        
        // Marcello: De-duplicação agressiva por ID (Mantendo o primeiro encontrado)
        const uniqueData: RadarResultItem[] = [];
        const seenIds = new Set<string>();
        
        for (const item of combined) {
            const id = String(item.id || '').trim();
            if (id && !seenIds.has(id)) {
                seenIds.add(id);
                uniqueData.push({ ...item, id });
            }
        }

        const finalData = uniqueData.sort((a, b) => a.distanceKm - b.distanceKm);
        return finalData;
    } catch (e) {
        console.error('[RADAR] Falha na varredura total (Network Error?):', e);
        // Fallback total para mocks se o fetch falhar
        return MOCK_USERS.map((m, idx) => ({
            ...m,
            id: `err-fallback-${m.id}-${idx}`,
            name: m.nickname,
            distanceKm: 999,
            distanceLabel: 'Offline',
            isMock: true
        } as RadarResultItem));
    }
}
