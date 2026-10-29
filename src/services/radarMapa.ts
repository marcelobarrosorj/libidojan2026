import { supabase } from './supabase';

export type PerfilRadar = {
  peerId: string;
  nickname: string;
  foto: string | null;
  online: boolean;
  faixa: string;
  ordem: number;
  anelM: number;
  angulo: number;
  latPin: number | null;
  lonPin: number | null;
};

function anguloDeterministico(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 360;
  }
  return h;
}

export async function carregarRadarMapa(raioKm: number = 50): Promise<PerfilRadar[]> {
  const { data: sessao } = await supabase.auth.getSession();
  const meuId = sessao?.session?.user?.id;
  if (!meuId) return [];

  const mapa = new Map<string, PerfilRadar>();

  // 1) Busca da RPC radar_mapa
  try {
    const { data, error } = await supabase.rpc('radar_mapa', { p_raio_km: raioKm });
    if (!error && Array.isArray(data)) {
      data.forEach((r: any) => {
        const foto = r.photo_url ? String(r.photo_url).trim() : '';
        if (!r.peer_id || r.peer_id === meuId || !foto) return;
        mapa.set(r.peer_id, {
          peerId: r.peer_id,
          nickname: r.nickname || 'Usuário',
          foto,
          online: r.online === true,
          faixa: r.faixa || 'Perto de você',
          ordem: r.ordem === null || r.ordem === undefined ? (r.online ? 1 : 50) : r.ordem,
          anelM: r.anel_m === null || r.anel_m === undefined ? 1500 : r.anel_m,
          angulo: Number(r.angulo || anguloDeterministico(r.peer_id)),
          latPin: r.lat_pin === null || r.lat_pin === undefined ? null : Number(r.lat_pin),
          lonPin: r.lon_pin === null || r.lon_pin === undefined ? null : Number(r.lon_pin),
        });
      });
    }
  } catch {}

  // 2) Complementa com leitura direta de user_profiles / users para garantir que NENHUM usuario online com foto fique de fora
  try {
    const { data: perfisDiretos } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('user_id', meuId);

    const janelaMs = 10 * 60 * 1000;
    (perfisDiretos || []).forEach((u: any) => {
      const uid = u.user_id || u.id;
      if (!uid || uid === meuId) return;
      const galeria = Array.isArray(u.photos) ? u.photos : [];
      const foto = String(u.photo_url || galeria[0] || '').trim();
      if (!foto) return; // Proibido usuario sem foto

      const ts = u.last_seen || u.updated_at;
      const recente = ts ? (Date.now() - new Date(ts).getTime()) < janelaMs : true;
      const estaOnline = (u.is_online === true || u.isOnline === true) && recente;

      const existente = mapa.get(uid);
      if (existente) {
        if (estaOnline && !existente.online) {
          existente.online = true;
          existente.ordem = Math.min(existente.ordem, 1);
          existente.faixa = existente.faixa || 'Online perto de você';
        }
        if (existente.latPin === null && u.lat != null && u.lon != null) {
          existente.latPin = Number(u.lat);
          existente.lonPin = Number(u.lon);
        }
      } else {
        mapa.set(uid, {
          peerId: uid,
          nickname: u.nickname || u.name || 'Usuário',
          foto,
          online: estaOnline,
          faixa: estaOnline ? 'Online agora' : 'Na sua região',
          ordem: estaOnline ? 1 : 20,
          anelM: estaOnline ? 1000 : 2000,
          angulo: anguloDeterministico(String(uid)),
          latPin: u.lat != null ? Number(u.lat) : null,
          lonPin: u.lon != null ? Number(u.lon) : null,
        });
      }
    });
  } catch {}

  return Array.from(mapa.values()).sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.ordem - b.ordem;
  });
}

export type PosicaoRadar =
  | { tipo: 'pino'; lat: number; lon: number }
  | { tipo: 'anel'; raioM: number; angulo: number };

export function posicaoNoRadar(p: PerfilRadar): PosicaoRadar {
  if (p.online && p.latPin !== null && p.lonPin !== null) {
    return { tipo: 'pino', lat: p.latPin, lon: p.lonPin };
  }
  return { tipo: 'anel', raioM: p.anelM > 0 ? p.anelM : 1500, angulo: p.angulo };
}

export function rotuloDistancia(p: PerfilRadar): string {
  if (p.online) return p.faixa || 'Online agora';
  return 'offline - ' + (p.faixa || 'na região');
}