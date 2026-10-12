// PREMIUM-INVITE: codigos de uso unico do dono (prefixo reservado LIB-PREM-)
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
    await (supabase as any)
      .from('users')
      .update({ premium: true, plan: 'premium', premium_until: until })
      .eq('user_id', userId);

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