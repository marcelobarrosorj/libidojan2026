
import { User, RadarResultItem, UserProfile, TrustLevel, Plan, PresenceStatus } from '../types';
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

        const realUsersFromSupabase = (data || [])
            .filter((item: any) => item.id !== params.viewerId && !item.is_mock && !item.isMock)
            .map((item: any) => {
                const u = item.data || {};
                const itemLat = u.lat || 0;
                const itemLon = u.lon || 0;
                const dist = haversineKm(safeLat, safeLon, itemLat, itemLon);
                
                const lastSeen = item.last_seen || item.updated_at;
                const diffMinutes = lastSeen ? (new Date().getTime() - new Date(lastSeen).getTime()) / 60000 : 999;
                const isOnline = diffMinutes < 5;
                const status = isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE;

                return {
                    id: item.id,
                    name: item.nickname || u.nickname || 'Agente',
                    avatar: u.avatar || '',
                    lat: itemLat,
                    lon: itemLon,
                    distanceKm: dist,
                    distanceLabel: formatDistanceLabel(dist),
                    city: u.city || 'Matriz',
                    isMock: false, 
                    trustLevel: u.trustLevel || TrustLevel.BRONZE,
                    isOnline,
                    status
                } as RadarResultItem;
            });

        const combined = realUsersFromSupabase;
        
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
        // Fallback para array vazio para obedecer a regra de somente usuários reais
        return [];
    }
}
