import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X } from 'lucide-react';
import { User } from '../types';
import { ProtectedImage } from './ProtectedImage';
import { supabase } from '../services/supabase';

interface RadarMapProps {
  users: User[];
  currentUser?: User | null;
  userId?: string;
  navigate?: (tab: string, params?: any) => void;
}

function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatarDistancia(metros: number): string {
  if (metros < 1000) {
    const passo = Math.max(100, Math.round(metros / 100) * 100);
    return `~${passo} m`;
  }
  const km = Math.round((metros / 1000) * 10) / 10;
  return `~${km.toFixed(1).replace('.', ',')} km`;
}

function jitterPorId(id: string): { dLat: number; dLon: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 1000000;
  }
  return {
    dLat: ((h % 200) - 100) / 100000,
    dLon: ((Math.floor(h / 7) % 200) - 100) / 100000
  };
}

export function RadarMap({ users, currentUser, userId, navigate }: RadarMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const jaCentrouRef = useRef(false);
  const meuPontoRef = useRef<{ lat: number; lon: number } | null>(null);
  const [tick, setTick] = useState(0);
  const [meuPonto, setMeuPonto] = useState<{ lat: number; lon: number } | null>(null);
  const [selecionado, setSelecionado] = useState<{ user: User; dist: number } | null>(null);

  // CENTRO-VOLTA: mantem a posicao atual acessivel dentro do observer
  useEffect(() => {
    meuPontoRef.current = meuPonto;
  }, [meuPonto]);

  // 1) Posicao do usuario: GPS do navegador primeiro, banco como fallback
  useEffect(() => {
    let ativo = true;
    const usarBanco = () => {
      const cu = currentUser as any;
      if (cu?.lat != null && cu?.lon != null) {
        setMeuPonto({ lat: Number(cu.lat), lon: Number(cu.lon) });
        return;
      }
      if (userId) {
        supabaseQuery(userId).then((data: any) => {
          if (!ativo) return;
          if (data && data.lat != null && data.lon != null) {
            setMeuPonto({ lat: Number(data.lat), lon: Number(data.lon) });
          }
        }).catch(() => {});
      }
    };
    let watchIdGPS: number | null = null;
    let ultimaSalva = 0;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchIdGPS = navigator.geolocation.watchPosition(
        (pos) => {
          if (ativo) setMeuPonto({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          if (ativo && Date.now() - ultimaSalva > 30000) {
            ultimaSalva = Date.now();
            (supabase as any).from('users')
              .update({ lat: pos.coords.latitude, lon: pos.coords.longitude })
              .eq('user_id', userId)
              .then(({ error }) => { if (error) console.error('SALVA-COORD falhou', error); });
          }
        },
        () => usarBanco(),
        { timeout: 20000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      usarBanco();
    }
    return () => {
      ativo = false;
      if (watchIdGPS !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdGPS);
      }
    };
  }, [currentUser, userId]);

  // 2) Cria o mapa escuro (Leaflet + Esri Dark Gray)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let map: L.Map | null = null;

    const criarMapa = () => {
      if (map) return;
      if (el.clientWidth === 0 || el.clientHeight === 0) return;
      try {
        map = L.map(el, { center: [-22.9068, -43.1729], zoom: 13, zoomControl: false });
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri',
          subdomains: 'abcd',
          maxZoom: 16
        }).addTo(map);
        const atualizar = () => setTick((t) => t + 1);
        map.on('move', atualizar);
        map.on('zoom', atualizar);
        mapRef.current = map;
        setTick((t) => t + 1);
      } catch {
        map = null;
      }
    };

    criarMapa();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (!map) criarMapa();
        else map.invalidateSize();
      });
      ro.observe(el);
    }

    return () => {
      if (ro) ro.disconnect();
      if (map) map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3) Centraliza UMA vez por montagem
  useEffect(() => {
    if (mapRef.current && meuPonto && !jaCentrouRef.current) {
      mapRef.current.setView([meuPonto.lat, meuPonto.lon], 14);
      jaCentrouRef.current = true;
      setTick((t) => t + 1);
    }
  }, [meuPonto]);

  // 3b) CENTRO-VOLTA: quando a tela do radar volta a ficar visivel, centraliza de novo
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && mapRef.current && meuPontoRef.current) {
            mapRef.current.setView([meuPontoRef.current.lat, meuPontoRef.current.lon], 14);
            setTick((t) => t + 1);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 4) Pinos: posicao na tela + distancia real
  const pins = useMemo(() => {
    const map = mapRef.current;
    if (!map || !meuPonto) return [];
    return users
      .map((u: any) => ({
        u,
        lat: u?.lat != null ? Number(u.lat) : null,
        lon: u?.lon != null ? Number(u.lon) : null
      }))
      .filter((d: any) => (d.lat !== null && d.lon !== null) || !!(d.u && d.u.anelM))
      .map((d) => {
        const u: any = d.u;
        let lat = d.lat!;
        let lon = d.lon!;
        const online = u?.isOnline === true || u?.is_online === true;
        if (!online && u?.anelM && meuPonto) {
          const rad = ((Number(u.angulo) || 0) * Math.PI) / 180;
          const m = Number(u.anelM) || 2000;
          lat = meuPonto.lat + (m * Math.cos(rad)) / 111320;
          lon = meuPonto.lon + (m * Math.sin(rad)) / (111320 * Math.cos((meuPonto.lat * Math.PI) / 180));
        } else {
          const j = jitterPorId(String(u.id));
          lat = lat + j.dLat;
          lon = lon + j.dLon;
        }
        const ponto = map.latLngToContainerPoint([lat, lon]);
        const dist = distanciaMetros(meuPonto.lat, meuPonto.lon, lat, lon);
        return { user: u as User, x: ponto.x, y: ponto.y, dist };
      })
      .filter((p) => p.dist >= 0)
      .sort((a, b) => a.dist - b.dist);
  }, [users, meuPonto, tick]);

  return (
    <div className="flex-1 relative min-h-[300px] rounded-2xl overflow-hidden border border-[var(--libido-border)] bg-[var(--libido-surface)]">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      {(() => {
        const map = mapRef.current;
        if (!meuPonto || !map) return null;
        const p = map.latLngToContainerPoint([meuPonto.lat, meuPonto.lon]);
        return (
          <div
            className="absolute z-30 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: p.x, top: p.y }}
          >
            <div className="w-11 h-11 rounded-full border-2 border-[var(--libido-accent)] shadow-[0_0_20px_rgba(255,179,0,0.35)] overflow-hidden">
              <ProtectedImage
                currentUser={currentUser}
                src={currentUser?.photo_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=64&auto=format&fit=crop'}
                alt="Você"
                className="w-full h-full"
              />
            </div>
            <span className="mt-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[7px] font-black uppercase tracking-wider text-[var(--libido-text)]">
              Você
            </span>
          </div>
        );
      })()}
      {pins.map(({ user, x, y, dist }) => (
        <button
          key={String(user.id)}
          onClick={() => setSelecionado({ user, dist })}
          className="absolute z-20 flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 transition-transform"
          style={{ left: x, top: y }}
        >
          <div className="w-9 h-9 rounded-full border-2 border-[var(--libido-accent)]/60 overflow-hidden shadow-lg">
            <ProtectedImage
              currentUser={currentUser}
              src={user.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=32'}
              style={{ border: (user as any).is_online ? '2.5px solid #22c55e' : 'none', boxShadow: (user as any).is_online ? '0 0 8px rgba(34,197,94,0.8)' : 'none' }}
              alt=""
              className="w-full h-full"
            />
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--libido-bg)]/90 border border-[var(--libido-border)] text-[8px] font-black text-[var(--libido-text)] whitespace-nowrap">
            {formatarDistancia(dist)}
          </span>
        </button>
      ))}
      {meuPonto && pins.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <p className="px-4 py-2 rounded-xl bg-[var(--libido-bg)]/85 border border-[var(--libido-border)] text-[9px] uppercase tracking-widest font-black text-[var(--libido-muted)] text-center">
            Nenhum usuário com localização ativa
          </p>
        </div>
      )}
      {!meuPonto && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--libido-bg)]/70 pointer-events-none">
          <p className="text-[9px] uppercase tracking-widest font-black text-[var(--libido-muted)]">
            Obtendo sua localização...
          </p>
        </div>
      )}
      {selecionado && (
        <div className="absolute bottom-3 left-3 right-3 z-40 bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-2xl p-3 flex items-center gap-3 shadow-2xl">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--libido-border)] shrink-0">
            <ProtectedImage
              currentUser={currentUser}
              src={selecionado.user.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64'}
              alt=""
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--libido-text)] truncate flex items-center gap-1.5">
              {selecionado.user.name}
              {selecionado.user.isOnline && (
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
              )}
            </p>
            <p className="text-[10px] font-black text-[var(--libido-muted)]">
              {formatarDistancia(selecionado.dist)}
            </p>
          </div>
          <button
            onClick={() => navigate?.('viewprofile', { user: selecionado.user })}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] text-xs font-black uppercase tracking-wide shrink-0"
          >
            Ver perfil
          </button>
          <button onClick={() => setSelecionado(null)} className="text-[var(--libido-muted)] p-1 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

async function supabaseQuery(userId: string): Promise<any> {
  const { data } = await supabase
    .from('user_profiles')
    .select('lat, lon')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}