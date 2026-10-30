// FONTE UNICA DE VERDADE para quem aparece no app.
// Toda tela (Feed, Radar, Mapa, Perfil) deve usar estas funcoes.

export type PerfilBruto = Record<string, any>;

/** Perfil valido para aparecer em QUALQUER tela. */
export function perfilVisivel(p: PerfilBruto | null | undefined): boolean {
  if (!p) return false;
  if (p.is_deleted === true) return false;
  if (p.is_banned === true) return false;
  if (p.deleted_at) return false;
  return true;
}

/** Considera online se qualquer um dos campos indicar atividade recente. */
export function estaOnline(p: PerfilBruto | null | undefined, janelaMin = 5): boolean {
  if (!p) return false;
  if (p.is_online === true) return true;
  const agora = Date.now();
  const limite = janelaMin * 60 * 1000;
  for (const campo of ['online_at', 'last_seen', 'last_active', 'last_seen_at']) {
    const v = p[campo];
    if (!v) continue;
    const t = new Date(v).getTime();
    if (!isNaN(t) && agora - t <= limite) return true;
  }
  return false;
}

/** Lista de fotos normalizada, nunca vazia se houver ao menos uma. */
export function fotosDe(p: PerfilBruto | null | undefined): string[] {
  if (!p) return [];
  const saida: string[] = [];
  if (Array.isArray(p.photos)) {
    for (const f of p.photos) {
      if (typeof f === 'string' && f.trim()) saida.push(f.trim());
      else if (f && typeof f === 'object' && typeof f.url === 'string' && f.url.trim()) saida.push(f.url.trim());
    }
  }
  for (const campo of ['avatar_url', 'photo_url', 'foto', 'imagem']) {
    const v = p[campo];
    if (typeof v === 'string' && v.trim() && !saida.includes(v.trim())) saida.push(v.trim());
  }
  return saida;
}

/** Filtra uma lista aplicando visibilidade. */
export function filtrarVisiveis<T extends PerfilBruto>(lista: T[] | null | undefined): T[] {
  if (!Array.isArray(lista)) return [];
  return lista.filter(perfilVisivel);
}