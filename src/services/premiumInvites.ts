// PREMIUM-INVITE: codigos de uso unico do dono (prefixo reservado LIB-PREM-)
// VITALICIO-FIX: verifica se o update atingiu o perfil; se o perfil ainda
// nao existe (cadastro em andamento), tenta novamente; se falhar, devolve
// o uso do codigo e avisa - o convite nunca mais e queimado sem efeito.
import { supabase } from './supabase';
export async function resgatarConvitePremium(
  codigoBruto: string,
  userId: string
): Promise<{ ok: boolean; mensagem: string }> {
  const code = (codigoBruto || '').trim().toUpperCase();
  if (!code.startsWith('LIB-PREM-')) return { ok: false, mensagem: '' };
  try {
    const { data: inv } = await (supabase as any)
      .from('premium_invite_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    if (!inv || !inv.active) return { ok: false, mensagem: 'Convite invalido.' };
    if ((inv.used_count || 0) >= (inv.max_uses || 1)) {
      return { ok: false, mensagem: 'Este convite ja foi utilizado.' };
    }
    const { data: usado } = await (supabase as any)
      .from('premium_invite_codes')
      .update({ used_count: (inv.used_count || 0) + 1, used_by: userId, used_at: new Date().toISOString() })
      .eq('code', code)
      .eq('used_count', inv.used_count || 0)
      .select();
    if (!usado || (usado as any[]).length === 0) {
      return { ok: false, mensagem: 'Este convite ja foi utilizado.' };
    }
    const until = inv.duration_hours
      ? new Date(Date.now() + inv.duration_hours * 3600000).toISOString()
      : null;
    // VITALICIO-FIX: aplica o premium verificando se a linha foi atingida
    // VITALICIO-RPC: caminho principal via funcao security definer no banco,
    // que nao depende de policy de UPDATE na tabela users.
    let aplicado = false;
    try {
      const { data: rpcOk } = await (supabase as any).rpc('resgatar_vitalicio', { p_user: userId, p_until: until });
      if (rpcOk === true) aplicado = true;
    } catch (eRpc) { console.error('VITALICIO-RPC falhou', eRpc); }
    for (let tent = 0; tent < 6 && !aplicado; tent++) {
      const { data: upd } = await (supabase as any)
        .from('users')
        .update({ premium: true, plan: 'premium', premium_until: until })
        .eq('user_id', userId)
        .select('user_id');
      if (upd && (upd as any[]).length > 0) { aplicado = true; break; }
      await new Promise((r) => setTimeout(r, 2000));
    }
    if (!aplicado) {
      // VITALICIO-FIX: devolve o uso do codigo - nao queima convite sem efeito
      try {
        await (supabase as any)
          .from('premium_invite_codes')
          .update({ used_count: inv.used_count || 0, used_by: null, used_at: null })
          .eq('code', code);
      } catch (eRb) {}
      return { ok: false, mensagem: 'Seu perfil ainda esta sendo criado. Tente resgatar novamente em alguns segundos.' };
    }
    return {
      ok: true,
      mensagem: until
        ? 'PREMIUM ativado com sucesso! Aproveite.'
        : 'PREMIUM ETERNO ativado! Bem-vindo(a)!',
    };
  } catch (eRes) {
    return { ok: false, mensagem: 'Erro ao resgatar o convite. Tente novamente.' };
  }
}