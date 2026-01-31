import React, { useEffect, useState, useRef } from 'react';
import { fetchRadarProfiles } from '../radar/radarApi';
import type { RadarProfile } from '../radar/types';
import { useUserLocation } from '../hooks/useUserLocation';
import { RadarList } from './RadarList';
import { mockRadarProfiles } from '../radar/mockData';
import { Loader2, Map, Info } from 'lucide-react';

export function RadarPage({ viewerId = 'me' }: { viewerId?: string }) {
  const { location, loading: geoLoading } = useUserLocation();
  
  // Inicializa com mocks para garantir conteúdo imediato
  const [profiles, setProfiles] = useState<RadarProfile[]>(mockRadarProfiles);
  const [isFetching, setIsFetching] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!location) return;

    const loadRadar = async () => {
        const rid = ++requestIdRef.current;
        
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsFetching(true);

        try {
            const data = await fetchRadarProfiles({
              lat: location.lat,
              lon: location.lon,
              viewerId,
              signal: controller.signal
            });

            if (rid !== requestIdRef.current || controller.signal.aborted) return;

            // PROTEÇÃO ANTI-ZERAMENTO: Só atualiza se houver resultados reais.
            // Se a API retornar vazio (ex: local sem usuários), mantemos os mocks/recomendações.
            if (data && data.length > 0) {
              setProfiles(data);
            } else {
              console.log('[RADAR_UI] Nenhum usuário real próximo. Mantendo recomendações.');
            }
        } catch (e) {
            console.error('[RADAR_UI] Falha na busca real. Exibindo modo offline.');
        } finally {
            if (rid === requestIdRef.current) setIsFetching(false);
        }
    };

    loadRadar();
    return () => abortControllerRef.current?.abort();
  }, [location, viewerId]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
            <Map size={16} className="text-pink" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Radar Ativo</span>
        </div>
        {isFetching && <Loader2 size={12} className="animate-spin text-pink/50" />}
      </div>

      {profiles.length > 0 && profiles[0].id.includes('mock') && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10 mb-2">
            <Info size={12} className="text-amber-500" />
            <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest leading-tight">
                {geoLoading ? 'Sincronizando GPS...' : 'Exibindo recomendações (Buscando conexões reais...)'}
            </p>
        </div>
      )}
      
      <RadarList profiles={profiles} loading={isFetching} />
    </div>
  );
}