import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X } from 'lucide-react';
import { User } from '../types';
import { ProtectedImage } from './ProtectedImage';

interface RadarMapProps {
  users: User[];
  currentUser?: User | null;
  userId?: string;
  navigate?: (tab: string, params?: any) => void;
}

// Distancia em metros entre dois pontos (formula de Haversine)
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

// Arredonda a distancia para nunca expor posicao exata
function formatarDistancia(metros: number): string {
  if (metros < 1000) {
    const passo = Math.max(100, Math.round(metros / 100) * 100);
    return `~${passo} m`;
  }
  const km = Math.round((metros / 1000) * 10) / 10;
  return `~${km.toFixed(1).replace('.', ',')} km`;
}

// Deslocamento estavel por usuario (jitter): o pino nunca mostra o ponto exato
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
  const [tick, setTick] = useState(0);
  const [meuPonto, setMeuPonto] = useState<{ lat: number; lon: number } | null>(null);
  const [selecionado, setSelecionado] = useState<{ user: User; dist: number } | null>(null);

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
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (ativo) setMeuPonto({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => usarBanco(),
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      usarBanco();
    }
    return () => {
      ativo = false;
    };
  }, [currentUser, userId]);
  // 2) Cria o mapa escuro (Leaflet + OpenStreetMap/CARTO, sem chave de API)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.clientWidth === 0 || el.clientHeight === 0) return;
    let map: L.Map | null = null;
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
    } catch {
      map = null;
    }
    return () => {
      if (map) map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3) Recentra no usuario quando a posicao chega
  useEffect(() => {
    if (mapRef.current && meuPonto) {
      mapRef.current.setView([meuPonto.lat, meuPonto.lon], 14);
    }
  }, [meuPonto]);

  // 4) Pinos: posicao na tela + distancia real (calculada nas coordenadas verdadeiras)
  const pins = useMemo(() => {
    const map = mapRef.current;
    if (!map || !meuPonto) return [];
    return users
      .map((u: any) => ({
        u,
        lat: u?.lat != null ? Number(u.lat) : null,
        lon: u?.lon != null ? Number(u.lon) : null
      }))
      .filter((d) => d.lat !== null && d.lon !== null)
      .map((d) => {
        const j = jitterPorId(String(d.u.id));
        const ponto = map.latLngToContainerPoint([d.lat! + j.dLat, d.lon! + j.dLon]);
        const dist = distanciaMetros(meuPonto.lat, meuPonto.lon, d.lat!, d.lon!);
        return { user: d.u as User, x: ponto.x, y: ponto.y, dist };
      })
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

// Consulta direta ao banco pela posicao do usuario atual
async function supabaseQuery(userId: string): Promise<any> {
  const { supabase } = await import('../services/supabase');
  const { data } = await supabase
    .from('user_profiles')
    .select('lat, lon')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}