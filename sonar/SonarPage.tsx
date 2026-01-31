import React, { useEffect, useRef, useState, useCallback } from 'react';
import SonarList from './SonarList';
import type { RadarProfile, ViewerLocation } from '../radar/types';
import { mockRadarProfiles } from '../radar/mockData';
import {
  haversineKm,
  clampMinDistanceKm,
  formatDistanceLabel,
  computeLocationLabel,
  normalizeRadiusKm,
  MAX_KM_ALLOWED,
} from '../radar/geo';
import { queryRadar } from '../services/radarService';
import { Radio, Navigation, Layers, Loader2, Zap, Sparkles } from 'lucide-react';
import { log } from '../services/authUtils';

async function getGeoOnce(): Promise<{ lat: number; lon: number }> {
  const FALLBACK = { lat: -23.5505, lon: -46.6333 };
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(FALLBACK);

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(FALLBACK),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

function getViewerCity(): string {
  return 'São Paulo';
}

function enrichAndFilterByRadius(base: RadarProfile[], viewer: ViewerLocation, radiusKm: number): RadarProfile[] {
  const radius = normalizeRadiusKm(radiusKm);
  const out: RadarProfile[] = [];

  for (const p of base) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) continue;

    const rawKm = haversineKm(viewer.lat, viewer.lon, p.lat, p.lon);
    if (rawKm > MAX_KM_ALLOWED) continue;
    if (rawKm > radius) continue;

    const km = clampMinDistanceKm(rawKm);

    out.push({
      ...p,
      avatar: p.avatar || `https://picsum.photos/seed/${p.id}/800/600`,
      distanceKm: km,
      distanceLabel: formatDistanceLabel(km),
      locationLabel: computeLocationLabel(viewer.city, p.city, p.neighborhood),
    });
  }

  out.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  return out;
}

export default function SonarPage() {
  const [loading, setLoading] = useState(false);
  const [bannerText, setBannerText] = useState<string | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [profiles, setProfiles] = useState<RadarProfile[]>([]);

  const baseProfilesRef = useRef<RadarProfile[]>(mockRadarProfiles);
  const viewerRef = useRef<ViewerLocation | null>(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const filterLocally = useCallback(() => {
    if (!viewerRef.current) return;
    const enriched = enrichAndFilterByRadius(baseProfilesRef.current, viewerRef.current, radiusKm);
    
    if (enriched.length > 0) {
      setProfiles(enriched);
      setBannerText(undefined);
    } else {
      setBannerText(`Nenhum perfil encontrado num raio de ${Math.round(radiusKm)}km.`);
    }
  }, [radiusKm]);

  useEffect(() => {
    (async () => {
      const geo = await getGeoOnce();
      const viewer: ViewerLocation = { lat: geo.lat, lon: geo.lon, city: getViewerCity() };
      viewerRef.current = viewer;
      filterLocally();
    })();
  }, [filterLocally]);

  useEffect(() => {
    const run = async () => {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const geo = await getGeoOnce();
        const viewer: ViewerLocation = { lat: geo.lat, lon: geo.lon, city: getViewerCity() };
        viewerRef.current = viewer;

        setLoading(true);

        // Chamada direta ao serviço local para evitar 404 da API inexistente
        const data = await queryRadar({ 
          viewerId: 'me', 
          viewerLat: geo.lat, 
          viewerLon: geo.lon 
        });

        if (requestId !== requestIdRef.current || controller.signal.aborted) return;

        if (Array.isArray(data) && data.length > 0) {
          baseProfilesRef.current = data as RadarProfile[];
          filterLocally();
        } else {
          setBannerText('Buscando conexões reais... Exibindo sugestões premium.');
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          log('error', 'Sonar internal search failed', err);
          setBannerText('Sonar operando em modo offline.');
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    };

    run();
    return () => abortRef.current?.abort();
  }, [filterLocally]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black font-outfit text-white tracking-tighter italic flex items-center gap-3">
            <Radio size={24} className="text-pink animate-pulse" />
            SONAR
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] flex items-center gap-1">
            <Zap size={10} className="fill-pink text-pink" /> 
            Alta Precisão Ativa
          </p>
        </div>
        {loading && (
          <div className="bg-pink/10 px-4 py-2 rounded-full border border-pink/20 backdrop-blur-xl flex items-center gap-2">
            <Loader2 size={14} className="text-pink animate-spin" />
            <span className="text-[10px] font-black text-pink uppercase tracking-widest">Scanning</span>
          </div>
        )}
      </div>

      <div className="glass-card p-6 rounded-[2.5rem] border-white/5 shadow-2xl space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-pink" />
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Intensidade de Busca</h3>
          </div>
          <span className="text-sm font-black text-pink font-outfit">{Math.round(radiusKm)} km</span>
        </div>
        <div className="relative pt-2 pb-1">
          <input 
            type="range" 
            min={1} 
            max={MAX_KM_ALLOWED} 
            value={radiusKm} 
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink"
          />
        </div>
        <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <span>Próximo (1km)</span>
          <span>Amplo ({MAX_KM_ALLOWED}km)</span>
        </div>
      </div>

      <div className="glass-card p-5 rounded-[2rem] border-pink/20 bg-gradient-to-r from-pink/5 to-transparent flex items-center gap-4 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles size={40} className="text-pink" />
        </div>
        <div className="w-10 h-10 rounded-2xl bg-pink/10 flex items-center justify-center text-pink shrink-0 relative z-10">
          <Zap size={20} className="fill-pink" />
        </div>
        <div className="space-y-1 relative z-10">
          <p className="text-xs font-black text-white uppercase tracking-widest">Sonar Vibe Insight</p>
          <p className="text-[11px] font-medium text-slate-400 italic leading-tight">
            Seu sonar está rastreando perfis compatíveis com sua vibe lifestyle atual.
          </p>
        </div>
      </div>

      <SonarList profiles={profiles} loading={loading} bannerText={bannerText} />
    </div>
  );
}
