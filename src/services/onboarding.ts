// ONBOARDING: grava o perfil por RPC e CONFIRMA que persistiu.
// Se ok = false, a tela NAO pode navegar nem limpar o rascunho.
import { supabase } from './supabase';

export type ResultadoPerfil = {
  ok: boolean;
  motivo?: string;
  campos?: string;
  detalhe?: string;
};

export async function salvarPerfil(
  payload: Record<string, unknown>
): Promise<ResultadoPerfil> {
  const { data: sessao, error: erroSessao } = await supabase.auth.getSession();

  if (erroSessao || !sessao || !sessao.session || !sessao.session.user) {
    return { ok: false, motivo: 'sem_sessao' };
  }

  const { data, error } = await supabase.rpc('salvar_perfil', {
    p_payload: payload,
  });

  if (error) {
    return { ok: false, motivo: 'rpc', detalhe: error.message };
  }

  const r = data as ResultadoPerfil | null;

  if (r && r.ok === true) return { ok: true };

  return {
    ok: false,
    motivo: r && r.motivo ? r.motivo : 'desconhecido',
    campos: r ? r.campos : undefined,
    detalhe: r ? r.detalhe : undefined,
  };
}

export function mensagemPerfil(r: ResultadoPerfil): string {
  if (r.ok) return '';

  if (r.motivo === 'sem_sessao') return 'Sess\u00e3o expirada. Entre novamente.';
  if (r.motivo === 'bloqueado') {
    return 'O servidor recusou gravar: ' + (r.campos || 'campos do perfil') + '.';
  }
  if (r.motivo === 'rpc') {
    return 'Erro ao gravar o perfil: ' + (r.detalhe || 'falha no servidor');
  }
  if (r.motivo === 'erro_banco') {
    return 'Erro no banco: ' + (r.detalhe || 'falha');
  }
  if (r.motivo === 'payload_vazio') {
    return 'Nenhum campo v\u00e1lido para gravar.';
  }
  if (r.motivo === 'payload_invalido') {
    return 'Dados do perfil inv\u00e1lidos.';
  }

  return 'N\u00e3o foi poss\u00edvel gravar o perfil. Tente novamente.';
}