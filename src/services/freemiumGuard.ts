import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';
const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function checarStatusFreemium(userObj: any) {
  if (!userObj) return { éNovoUsuario: false, acessoRestrito: false, vipAtivo: false };

  // Verifica se a conta tem menos de 7 dias
  const dataCriacao = new Date(userObj.created_at || Date.now());
  const diasDesdeCriacao = (Date.now() - dataCriacao.getTime()) / (1000 * 3600 * 24);
  const éNovoUsuario = diasDesdeCriacao <= 7;

  // Verifica se possui VIP ativo ou verificação real
  const vipAtivo = userObj.vip_expires_at && new Date(userObj.vip_expires_at).getTime() > Date.now();
  const verificado = Boolean(userObj.is_verified || userObj.voice_bio_url);

  // Se for novo usuário e não for verificado/VIP, aplica restrições parciais
  const acessoRestrito = éNovoUsuario && !vipAtivo && !verificado;

  return {
    éNovoUsuario,
    acessoRestrito,
    vipAtivo,
    verificado
  };
}

export async function concederVipTemporarioPorVerificacao(userId: string) {
  try {
    const expiraEm = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(); // 7 dias de VIP grátis por verificação
    await sbClient.from('users').update({ is_verified: true, vip_expires_at: expiraEm }).eq('user_id', userId);
    return true;
  } catch {
    return false;
  }
}