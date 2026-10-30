/**
 * Remove mensagens duplicadas mantendo a primeira ocorrencia.
 * Duplicata = mesmo id, ou (sem id) mesmo remetente + conteudo + minuto.
 */
export function dedupeMensagens<T extends Record<string, any>>(lista: T[] | null | undefined): T[] {
  if (!Array.isArray(lista)) return [];
  const vistos = new Set<string>();
  const saida: T[] = [];
  for (const m of lista) {
    if (!m) continue;
    let chave: string;
    if (m.id != null) {
      chave = 'id:' + String(m.id);
    } else {
      const ts = m.created_at ? String(m.created_at).slice(0, 16) : '';
      chave = 'c:' + String(m.sender_id ?? '') + '|' + String(m.content ?? m.media_url ?? '') + '|' + ts;
    }
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(m);
  }
  return saida;
}

/** Remove duplicatas de perfis por user_id ou id. */
export function dedupePerfis<T extends Record<string, any>>(lista: T[] | null | undefined): T[] {
  if (!Array.isArray(lista)) return [];
  const vistos = new Set<string>();
  const saida: T[] = [];
  for (const p of lista) {
    if (!p) continue;
    const chave = String(p.user_id ?? p.id ?? '');
    if (!chave || vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(p);
  }
  return saida;
}