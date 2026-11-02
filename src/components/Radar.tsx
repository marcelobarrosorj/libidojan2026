import { carregarRadarMapa } from '../services/radarMapa';
import { useState, useEffect, useMemo } from 'react';
import { Users, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { User } from '../types';
import { getActiveUsers } from '../services/users';
import { ProtectedImage } from './ProtectedImage';
import { RadarMap } from './RadarMap';
import { supabase } from '../services/supabase';

interface RadarProps {
  userId?: string;
  navigate?: (tab: string, params?: any) => void;
  currentUser?: User | null;
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

function coordValida(lat: any, lng: any): boolean {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return false;
  if (la < -90 || la > 90) return false;
  if (ln < -180 || ln > 180) return false;
  if (Math.abs(la) < 0.0001 && Math.abs(ln) < 0.0001) return false;
  return true;
}

export function Radar({ userId, navigate, currentUser }: RadarProps) {
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<'mapa' | 'lista'>('mapa');
  const [minhaPos, setMinhaPos] = useState<{ lat: number; lng: number } | null>(null);
  const [erroGps, setErroGps] = useState<string | null>(null);

  const meuId = userId || currentUser?.id || '';

  useEffect(() => {
    if (!meuId) return;
    let cancelado = false;
    setLoading(true);

    (async () => {
      try {
        const lista = await getActiveUsers(meuId);
        if (!cancelado) setOperators((lista || []) as User[]);
      } catch (e) {
        console.error('Erro ao carregar usuarios:', e);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => { cancelado = true; };
  }, [meuId]);

  useEffect(() => {
    if (!meuId) return;
    if (!navigator.geolocation) {
      setErroGps('Servico de localizacao indisponivel.');
      return;
    }

    let ultimoSalvo = 0;

    const salvarPosicao = async (lat: number, lng: number) => {
      const agora = Date.now();
      if (agora - ultimoSalvo < 30000) return;
      ultimoSalvo = agora;
      const agoraISO = new Date().toISOString();
      try {
        await supabase.from('users').update({
          lat,
          lon: lng,
          is_online: true,
          last_seen: agoraISO,
          updated_at: agoraISO,
        }).eq('id', meuId);
      } catch (e) {
        console.error('Erro ao salvar posicao:', e);
      }
    };

    const aoMudar = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (!coordValida(lat, lng)) {
        setErroGps('Localizacao imprecisa. Aguarde o GPS estabilizar.');
        return;
      }
      setMinhaPos({ lat, lng });
      setErroGps(null);
      void salvarPosicao(lat, lng);
    };

    const aoFalhar = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) setErroGps('Localizacao bloqueada. Autorize o acesso nas configuracoes.');
      else if (err.code === err.POSITION_UNAVAILABLE) setErroGps('Servico de localizacao indisponivel.');
      else setErroGps('Nao foi possivel obter sua localizacao a tempo.');
    };

    navigator.geolocation.getCurrentPosition(aoMudar, aoFalhar, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    const watchId = navigator.geolocation.watchPosition(aoMudar, aoFalhar, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 5000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [meuId]);

  useEffect(() => {
    if (!meuId) return;
    const marcarOffline = () => {
      try {
        supabase.from('users').update({
          is_online: false,
          last_seen: new Date().toISOString(),
        }).eq('id', meuId);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('beforeunload', marcarOffline);
    return () => window.removeEventListener('beforeunload', marcarOffline);
  }, [meuId]);

  const listaComDistancia = useMemo(() => {
    return operators
      .filter((o: any) => {
        const id = o.id ?? o.user_id;
        if (meuId && id === meuId) return false;
        if (o.is_deleted === true || o.is_banned === true) return false;
        return true;
      })
      .map((o: any) => {
        let metros: number | null = null;
        if (minhaPos && coordValida(o.lat, o.lon)) {
          metros = distanciaMetros(minhaPos.lat, minhaPos.lng, Number(o.lat), Number(o.lon));
        }
        return { ...o, _metros: metros };
      })
      .sort((a: any, b: any) => (a._metros ?? 999999) - (b._metros ?? 999999));
  }, [operators, minhaPos, meuId]);

  return (
    <div style={{ background: '#16161a', minHeight: '100%', color: '#fff' }}>
      <div style={{ display: 'flex', gap: 8, padding: 16 }}>
        <button
          onClick={() => setAba('mapa')}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: aba === 'mapa' ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : '#1f1f24', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <MapIcon size={16} /> Mapa
        </button>
        <button
          onClick={() => setAba('lista')}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: aba === 'lista' ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : '#1f1f24', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <ListIcon size={16} /> Lista
        </button>
      </div>

      {erroGps && (
        <div style={{ margin: '0 16px 16px', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.4)', borderRadius: 12, padding: 16, fontSize: 14 }}>
          {erroGps}
        </div>
      )}

      {aba === 'mapa' && (
        <RadarMap users={operators} currentUser={currentUser} userId={meuId} navigate={navigate} />
      )}

      {aba === 'lista' && (
        <div style={{ padding: 16 }}>
          {loading && <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Carregando...</div>}

          {!loading && listaComDistancia.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              <Users size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: 16, marginBottom: 8 }}>Ninguem por perto agora</p>
              <p style={{ fontSize: 13 }}>Volte mais tarde ou amplie o raio.</p>
            </div>
          )}

          {listaComDistancia.map((o: any) => {
            const id = String(o.id ?? o.user_id ?? '');
            const nome = o.nickname || o.name || 'Sem nome';
            const idade = o.idade ?? o.age ?? null;
            const foto = o.avatar_url || o.photo_url || (Array.isArray(o.photos) && o.photos[0]) || null;
            return (
              <button
                key={id}
                onClick={() => navigate?.('viewprofile', { user: o })}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: 'none', background: '#1f1f24', color: '#fff', textAlign: 'left', cursor: 'pointer', width: '100%', marginBottom: 8 }}
              >
                <div style={{ position: 'relative', flex: '0 0 auto', width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {foto ? (
                    <ProtectedImage src={foto} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    nome.slice(0, 2).toUpperCase()
                  )}
                  {o.is_online === true && (
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '2px solid #1f1f24' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {nome}{idade ? `, ${idade}` : ''}
                  </div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>
                    {o._metros != null ? formatarDistancia(o._metros) : 'distancia desconhecida'}
                    {o.is_online === true ? ' · online' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Radar;