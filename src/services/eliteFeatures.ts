import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type IntencaoRadarId = 'Todos' | 'Drinks' | 'Festa' | 'Agora' | 'Viagem' | 'Discreto' | string;

export const INTENCOES_RADAR: { id: IntencaoRadarId; label: string }[] = [
  { id: 'Todos', label: '🔥 Todos' },
  { id: 'Agora', label: '⚡ Livre Agora' },
  { id: 'Drinks', label: '🥂 Bons Drinks' },
  { id: 'Festa', label: '🎭 Festa / Club' },
  { id: 'Viagem', label: '✈️ Em Viagem' },
  { id: 'Discreto', label: '🤫 Sigilo Total' }
];

export function obterIntencaoDoUsuario(userObj: any): IntencaoRadarId {
  if (!userObj) return 'Todos';
  const salvo = typeof localStorage !== 'undefined' ? localStorage.getItem(`libido_intencao_${userObj.id || userObj.user_id || 'me'}`) : null;
  return (userObj.daily_intent || salvo || 'Todos') as IntencaoRadarId;
}

export async function definirIntencaoDoDia(userId: string, intencao: IntencaoRadarId): Promise<boolean> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`libido_intencao_${userId || 'me'}`, String(intencao));
    }
    if (userId) {
      await supabase.from('users').update({ daily_intent: intencao } as any).eq('user_id', userId);
    }
    return true;
  } catch {
    return false;
  }
}

export async function obterVerificacaoFisica(targetId: string, meuId: string) {
  try {
    const key = `libido_vouch_${targetId}`;
    const lista: string[] = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(key) || '[]') : [];
    return {
      totalConfirmacoes: lista.length,
      verificadoPelaComunidade: lista.length >= 1,
      jaConfirmadoPorMim: Boolean(meuId && lista.includes(meuId))
    };
  } catch {
    return { totalConfirmacoes: 0, verificadoPelaComunidade: false, jaConfirmadoPorMim: false };
  }
}

export async function confirmarConheciPessoalmente(targetId: string, meuId: string) {
  try {
    const key = `libido_vouch_${targetId}`;
    const lista: string[] = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(key) || '[]') : [];
    if (meuId && !lista.includes(meuId)) {
      lista.push(meuId);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(lista));
      }
    }
    return { ok: true, novoTotal: lista.length };
  } catch {
    return { ok: false, novoTotal: 0 };
  }
}

export function obterCofreDoUsuario(donoId: string, donoObj?: any): { fotosCofre: string[]; pin?: string } {
  const fotos = Array.isArray(donoObj?.vault_photos)
    ? donoObj.vault_photos
    : Array.isArray(donoObj?.private_photos)
    ? donoObj.private_photos
    : [];
  return { fotosCofre: fotos, pin: donoObj?.vault_pin || '0000' };
}

export function verificarAcessoCofre(donoId: string, visitanteId: string, senha: string, donoObj?: any): boolean {
  if (donoId && visitanteId && donoId === visitanteId) return true;
  if (!senha) return false;
  const cofre = obterCofreDoUsuario(donoId, donoObj);
  return senha === cofre.pin;
}

export interface CheckinDiscreto {
  userId: string;
  nickname: string;
  timestamp?: string;
}

export function listarCheckinsDoLocal(eventId: string): CheckinDiscreto[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    return JSON.parse(localStorage.getItem(`libido_checkin_${eventId}`) || '[]');
  } catch {
    return [];
  }
}

export async function alternarCheckinDiscreto(
  eventId: string,
  user: { id: string; nickname: string }
): Promise<{ ativo: boolean; lista: CheckinDiscreto[] }> {
  const atual = listarCheckinsDoLocal(eventId);
  const existe = atual.some(c => c.userId === user.id);
  const novaLista = existe
    ? atual.filter(c => c.userId !== user.id)
    : [...atual, { userId: user.id, nickname: user.nickname || 'Membro', timestamp: new Date().toISOString() }];

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`libido_checkin_${eventId}`, JSON.stringify(novaLista));
  }
  return { ativo: !existe, lista: novaLista };
}

export function ofuscarCoordenadasParaMapa(lat: number, lng: number, seedId?: string): { lat: number; lng: number } {
  const nLat = Number(lat) || -22.9068;
  const nLng = Number(lng) || -43.1729;
  const s = String(seedId || 'libido');
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  const offsetLat = ((hash % 100) / 100) * 0.004 - 0.002;
  const offsetLng = (((hash >> 4) % 100) / 100) * 0.004 - 0.002;
  return { lat: nLat + offsetLat, lng: nLng + offsetLng };
}

export function formatarDistanciaOfuscada(distanceKm?: number, privacyLevel: string = 'faixa_segura'): string {
  const d = Number(distanceKm);
  if (isNaN(d) || d < 0) return 'Próximo a você';
  if (privacyLevel === 'oculto') return 'Localização discreta';
  if (d < 1) return 'A menos de 1 km';
  if (d < 5) return 'Entre 1 e 5 km';
  if (d < 15) return 'Entre 5 e 15 km';
  return `Aprox. ${Math.round(d)} km`;
}

export function filtrarEOrdenarVitrineCasais(usuarios: any[], currentUser?: any): any[] {
  if (!Array.isArray(usuarios)) return [];
  return [...usuarios].sort((a, b) => {
    const aCasal = String(a?.relationship_status || '').toLowerCase().includes('casal') ? 1 : 0;
    const bCasal = String(b?.relationship_status || '').toLowerCase().includes('casal') ? 1 : 0;
    return bCasal - aCasal;
  });
}

export async function ativarSinalizadorLocal(userId: string, horas: number = 2): Promise<boolean> {
  try {
    const expiraEm = new Date(Date.now() + horas * 3600 * 1000).toISOString();
    if (userId) {
      await supabase.from('users').update({ spotlight_expires_at: expiraEm } as any).eq('user_id', userId);
    }
    return true;
  } catch {
    return false;
  }
}