// RADAR-MAPA: distancia sempre em faixa, nunca o numero exato.
// REGRA: offline NAO tem coordenada. Recebe anel (1 km ou 2 km) + angulo fixo.
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

export async function carregarRadarMapa(raioKm: number = 50): Promise<PerfilRadar[]> {
  const { data: sessao } = await supabase.auth.getSession();

  if (!sessao || !sessao.session || !sessao.session.user) return [];

  const { data, error } = await supabase.rpc('radar_mapa', { p_raio_km: raioKm });

  if (error || !data) return [];

  return (data as any[]).map(function (r) {
    return {
      peerId: r.peer_id,
      nickname: r.nickname || '',
      foto: r.photo_url || null,
      online: r.online === true,
      faixa: r.faixa || '',
      ordem: r.ordem === null || r.ordem === undefined ? 99 : r.ordem,
      anelM: r.anel_m === null || r.anel_m === undefined ? 0 : r.anel_m,
      angulo: Number(r.angulo || 0),
      latPin: r.lat_pin === null || r.lat_pin === undefined ? null : Number(r.lat_pin),
      lonPin: r.lon_pin === null || r.lon_pin === undefined ? null : Number(r.lon_pin),
    };
  });
}

// Onde desenhar: online usa pino aproximado; offline usa anel + angulo.
export type PosicaoRadar =
  | { tipo: 'pino'; lat: number; lon: number }
  | { tipo: 'anel'; raioM: number; angulo: number };

export function posicaoNoRadar(p: PerfilRadar): PosicaoRadar {
  if (p.online && p.latPin !== null && p.lonPin !== null) {
    return { tipo: 'pino', lat: p.latPin, lon: p.lonPin };
  }
  return { tipo: 'anel', raioM: p.anelM > 0 ? p.anelM : 2000, angulo: p.angulo };
}

export function rotuloDistancia(p: PerfilRadar): string {
  if (p.online) return p.faixa;
  return 'offline - ' + p.faixa;
}