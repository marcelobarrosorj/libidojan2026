// CHAT-AVANCADO: camada de mensagens com recursos equivalentes ao WhatsApp.
// Modulo ADITIVO: nao substitui src/services/chat.ts, que continua em uso
// pelo Chat.tsx atual. Migre componente por componente.
import { supabase } from './supabase';

export type TipoMensagem = 'texto' | 'foto' | 'video' | 'audio' | 'documento' | 'localizacao';

export type StatusEnvio = 'enviando' | 'enviado' | 'entregue' | 'lido' | 'falhou';

export interface Mensagem {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
  edited_at: string | null;
  apagada_geral: boolean;
  apagada_para: string[];
  reply_to_id: string | null;
  tipo: TipoMensagem;
  media_url: string | null;
  media_meta: Record<string, unknown> | null;
  fixada: boolean;
  expires_at: string | null;
}

export interface Reacao {
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface AjustesConversa {
  peer_id: string;
  arquivada: boolean;
  fixada: boolean;
  silenciada: boolean;
  marcada_nao_lida: boolean;
  expira_horas: number | null;
}

export interface EnvioMensagem {
  para: string;
  texto?: string;
  tipo?: TipoMensagem;
  mediaUrl?: string;
  mediaMeta?: Record<string, unknown>;
  responderA?: string | null;
  expiraEmHoras?: number | null;
}

let meuIdCache: string | null = null;

export async function meuId(): Promise<string | null> {
  if (meuIdCache) return meuIdCache;

  const sessao = await supabase.auth.getSession();
  const usuario = sessao.data.session?.user ?? null;
  if (!usuario) return null;

  meuIdCache = usuario.id;
  return meuIdCache;
}

export function limparCacheIdentidade(): void {
  meuIdCache = null;
}

function normalizar(bruto: Record<string, unknown>): Mensagem {
  const apagadas = bruto.apagada_para;

  return {
    id: String(bruto.id),
    sender_id: String(bruto.sender_id),
    receiver_id: String(bruto.receiver_id),
    content: typeof bruto.content === 'string' ? bruto.content : null,
    created_at: String(bruto.created_at),
    delivered_at: typeof bruto.delivered_at === 'string' ? bruto.delivered_at : null,
    read_at: typeof bruto.read_at === 'string' ? bruto.read_at : null,
    edited_at: typeof bruto.edited_at === 'string' ? bruto.edited_at : null,
    apagada_geral: bruto.apagada_geral === true,
    apagada_para: Array.isArray(apagadas) ? apagadas.map((v) => String(v)) : [],
    reply_to_id: typeof bruto.reply_to_id === 'string' ? bruto.reply_to_id : null,
    tipo: (typeof bruto.tipo === 'string' ? bruto.tipo : 'texto') as TipoMensagem,
    media_url: typeof bruto.media_url === 'string' ? bruto.media_url : null,
    media_meta:
      bruto.media_meta && typeof bruto.media_meta === 'object'
        ? (bruto.media_meta as Record<string, unknown>)
        : null,
    fixada: bruto.fixada === true,
    expires_at: typeof bruto.expires_at === 'string' ? bruto.expires_at : null,
  };
}

export function statusDe(m: Mensagem): StatusEnvio {
  if (m.read_at) return 'lido';
  if (m.delivered_at) return 'entregue';
  return 'enviado';
}

// ------------------------------------------------------------
// ENVIAR
// ------------------------------------------------------------
export async function enviarMensagem(dados: EnvioMensagem): Promise<Mensagem> {
  const eu = await meuId();
  if (!eu) throw new Error('sem sessao ativa');

  if (!dados.para) throw new Error('destinatario ausente');

  const texto = (dados.texto || '').trim();
  const tipo: TipoMensagem = dados.tipo || 'texto';

  if (tipo === 'texto' && !texto) throw new Error('mensagem vazia');
  if (tipo !== 'texto' && !dados.mediaUrl) throw new Error('midia ausente');

  const agora = new Date();
  const corpo: Record<string, unknown> = {
    sender_id: eu,
    receiver_id: dados.para,
    content: texto,
    tipo,
    media_url: dados.mediaUrl || null,
    media_meta: dados.mediaMeta || null,
    reply_to_id: dados.responderA || null,
    created_at: agora.toISOString(),
  };

  if (dados.expiraEmHoras && dados.expiraEmHoras > 0) {
    corpo.expires_at = new Date(
      agora.getTime() + dados.expiraEmHoras * 3600 * 1000
    ).toISOString();
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(corpo)
    .select('*')
    .single();

  if (error) throw new Error('falha ao enviar: ' + error.message);
  if (!data) throw new Error('envio sem retorno do banco');

  return normalizar(data as Record<string, unknown>);
}

// ------------------------------------------------------------
// LISTAR com paginacao
// ------------------------------------------------------------
export async function listarMensagens(
  com: string,
  limite = 40,
  antesDe?: string
): Promise<Mensagem[]> {
  const eu = await meuId();
  if (!eu) return [];

  let consulta = supabase
    .from('messages')
    .select('*')
    .or(
      'and(sender_id.eq.' + eu + ',receiver_id.eq.' + com + '),' +
      'and(sender_id.eq.' + com + ',receiver_id.eq.' + eu + ')'
    )
    .order('created_at', { ascending: false })
    .limit(limite);

  if (antesDe) consulta = consulta.lt('created_at', antesDe);

  const { data, error } = await consulta;
  if (error) throw new Error('falha ao listar: ' + error.message);
  if (!data) return [];

  const lista = (data as Record<string, unknown>[])
    .map(normalizar)
    .filter((m) => !m.apagada_para.includes(eu))
    .filter((m) => !m.expires_at || new Date(m.expires_at) > new Date());

  return lista.reverse();
}

// ------------------------------------------------------------
// ENTREGA E LEITURA
// ------------------------------------------------------------
export async function marcarEntregue(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const { error } = await supabase
    .from('messages')
    .update({ delivered_at: new Date().toISOString() })
    .in('id', ids)
    .is('delivered_at', null);

  if (error) throw new Error('falha ao marcar entrega: ' + error.message);
}

export async function marcarLida(com: string): Promise<number> {
  const { data, error } = await supabase.rpc('marcar_conversa_lida', {
    p_peer: com,
  });

  if (error) throw new Error('falha ao marcar leitura: ' + error.message);
  return typeof data === 'number' ? data : 0;
}

export async function contarNaoLidas(): Promise<Record<string, number>> {
  const { data, error } = await supabase.rpc('contar_nao_lidas');
  if (error) throw new Error('falha ao contar nao lidas: ' + error.message);

  const mapa: Record<string, number> = {};
  (data as { peer_id: string; qtd: number }[] | null)?.forEach((linha) => {
    mapa[linha.peer_id] = Number(linha.qtd);
  });

  return mapa;
}

// ------------------------------------------------------------
// EDITAR / APAGAR
// ------------------------------------------------------------
export async function editarMensagem(id: string, novoTexto: string): Promise<void> {
  const limpo = (novoTexto || '').trim();
  if (!limpo) throw new Error('texto vazio');

  const eu = await meuId();
  if (!eu) throw new Error('sem sessao ativa');

  const { error } = await supabase
    .from('messages')
    .update({ content: limpo, edited_at: new Date().toISOString() })
    .eq('id', id)
    .eq('sender_id', eu)
    .eq('tipo', 'texto');

  if (error) throw new Error('falha ao editar: ' + error.message);
}

export async function apagarParaTodos(id: string): Promise<void> {
  const eu = await meuId();
  if (!eu) throw new Error('sem sessao ativa');

  const { error } = await supabase
    .from('messages')
    .update({
      apagada_geral: true,
      content: null,
      media_url: null,
      media_meta: null,
    })
    .eq('id', id)
    .eq('sender_id', eu);

  if (error) throw new Error('falha ao apagar para todos: ' + error.message);
}

export async function apagarParaMim(id: string): Promise<void> {
  const { error } = await supabase.rpc('apagar_para_mim', { p_msg: id });
  if (error) throw new Error('falha ao apagar para mim: ' + error.message);
}

// ------------------------------------------------------------
// REACOES
// ------------------------------------------------------------
export async function reagir(messageId: string, emoji: string): Promise<void> {
  const eu = await meuId();
  if (!eu) throw new Error('sem sessao ativa');

  const { error } = await supabase.from('message_reactions').insert({
    message_id: messageId,
    user_id: eu,
    emoji,
  });

  if (error && error.code !== '23505') {
    throw new Error('falha ao reagir: ' + error.message);
  }
}

export async function removerReacao(messageId: string, emoji: string): Promise<void> {
  const eu = await meuId();
  if (!eu) throw new Error('sem sessao ativa');

  const { error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', eu)
    .eq('emoji', emoji);

  if (error) throw new Error('falha ao remover reacao: ' + error.message);
}

export async function carregarReacoes(messageIds: string[]): Promise<Reacao[]> {
  if (messageIds.length === 0) return [];

  const { data, error } = await supabase
    .from('message_reactions')
    .select('message_id, user_id, emoji')
    .in('message_id', messageIds);

  if (error) throw new Error('falha ao carregar reacoes: ' + error.message);
  if (!data) return [];

  return (data as Record<string, unknown>[]).map((linha) => ({
    message_id: String(linha.message_id),
    user_id: String(linha.user_id),
    emoji: String(linha.emoji),
  }));
}

// ------------------------------------------------------------
// FIXAR MENSAGEM
// ------------------------------------------------------------
export async function fixarMensagem(id: string, fixar: boolean): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ fixada: fixar })
    .eq('id', id);

  if (error) throw new Error('falha ao fixar: ' + error.message);
}

export async function mensagensFixadas(com: string): Promise<Mensagem[]> {
  const eu = await meuId();
  if (!eu) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      'and(sender_id.eq.' + eu + ',receiver_id.eq.' + com + '),' +
      'and(sender_id.eq.' + com + ',receiver_id.eq.' + eu + ')'
    )
    .eq('fixada', true)
    .eq('apagada_geral', false)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw new Error('falha ao listar fixadas: ' + error.message);
  if (!data) return [];

  return (data as Record<string, unknown>[]).map(normalizar);
}

// ------------------------------------------------------------
// BUSCA
// ------------------------------------------------------------
export async function buscarMensagens(com: string, termo: string): Promise<Mensagem[]> {
  const limpo = (termo || '').trim();
  if (limpo.length < 2) return [];

  const { data, error } = await supabase.rpc('buscar_mensagens', {
    p_peer: com,
    p_termo: limpo,
  });

  if (error) throw new Error('falha na busca: ' + error.message);
  if (!data) return [];

  return (data as Record<string, unknown>[]).map(normalizar);
}

// ------------------------------------------------------------
// AJUSTES DA CONVERSA
// ------------------------------------------------------------
export async function lerAjustes(com: string): Promise<AjustesConversa> {
  const eu = await meuId();
  const padrao: AjustesConversa = {
    peer_id: com,
    arquivada: false,
    fixada: false,
    silenciada: false,
    marcada_nao_lida: false,
    expira_horas: null,
  };

  if (!eu) return padrao;

  const { data, error } = await supabase
    .from('conversation_settings')
    .select('*')
    .eq('user_id', eu)
    .eq('peer_id', com)
    .maybeSingle();

  if (error) throw new Error('falha ao ler ajustes: ' + error.message);
  if (!data) return padrao;

  const linha = data as Record<string, unknown>;

  return {
    peer_id: com,
    arquivada: linha.arquivada === true,
    fixada: linha.fixada === true,
    silenciada: linha.silenciada === true,
    marcada_nao_lida: linha.marcada_nao_lida === true,
    expira_horas:
      typeof linha.expira_horas === 'number' ? linha.expira_horas : null,
  };
}

export async function salvarAjustes(
  com: string,
  mudancas: Partial<Omit<AjustesConversa, 'peer_id'>>
): Promise<void> {
  const eu = await meuId();
  if (!eu) throw new Error('sem sessao ativa');

  const { error } = await supabase.from('conversation_settings').upsert(
    {
      user_id: eu,
      peer_id: com,
      ...mudancas,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,peer_id' }
  );

  if (error) throw new Error('falha ao salvar ajustes: ' + error.message);
}

export async function listarAjustes(): Promise<AjustesConversa[]> {
  const eu = await meuId();
  if (!eu) return [];

  const { data, error } = await supabase
    .from('conversation_settings')
    .select('*')
    .eq('user_id', eu);

  if (error) throw new Error('falha ao listar ajustes: ' + error.message);
  if (!data) return [];

  return (data as Record<string, unknown>[]).map((linha) => ({
    peer_id: String(linha.peer_id),
    arquivada: linha.arquivada === true,
    fixada: linha.fixada === true,
    silenciada: linha.silenciada === true,
    marcada_nao_lida: linha.marcada_nao_lida === true,
    expira_horas:
      typeof linha.expira_horas === 'number' ? linha.expira_horas : null,
  }));
}

// ------------------------------------------------------------
// "DIGITANDO..." via Realtime broadcast (nao precisa de tabela)
// ------------------------------------------------------------
interface CanalDigitando {
  enviar: () => void;
  encerrar: () => void;
}

export function criarCanalDigitando(com: string): CanalDigitando {
  const canal = supabase.channel('digitando:' + com, {
    config: { broadcast: { self: false } },
  });

  canal.subscribe();

  let ultimoEnvio = 0;

  return {
    enviar: () => {
      const agora = Date.now();
      if (agora - ultimoEnvio < 1800) return;
      ultimoEnvio = agora;

      void canal.send({
        type: 'broadcast',
        event: 'digitando',
        payload: { de: meuIdCache, quando: new Date().toISOString() },
      });
    },
    encerrar: () => {
      void supabase.removeChannel(canal);
    },
  };
}

export function ouvirDigitando(
  com: string,
  callback: (quemEstaDigitando: boolean) => void
): () => void {
  const canal = supabase.channel('digitando:' + com, {
    config: { broadcast: { self: false } },
  });

  let timer: number | null = null;

  canal
    .on(
      'broadcast',
      { event: 'digitando' },
      (recebido: { payload?: { de?: string } }) => {
        const de = recebido.payload?.de;
        if (!de || (meuIdCache && de === meuIdCache)) return;

        callback(true);

        if (timer !== null) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          timer = null;
          callback(false);
        }, 2600);
      }
    )
    .subscribe();

  return () => {
    if (timer !== null) window.clearTimeout(timer);
    void supabase.removeChannel(canal);
  };
}

// ------------------------------------------------------------
// ASSINATURA DE NOVAS MENSAGENS
// ------------------------------------------------------------
export function ouvirConversa(
  com: string,
  aoReceber: (m: Mensagem) => void
): () => void {
  const canal = supabase
    .channel('conversa:' + com + ':' + Math.random().toString(36).slice(2, 8))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (evento: { new?: Record<string, unknown> }) => {
        if (!evento.new) return;

        const m = normalizar(evento.new);
        const eu = meuIdCache;

        const ehDoPar =
          (m.sender_id === eu && m.receiver_id === com) ||
          (m.sender_id === com && m.receiver_id === eu);

        if (!ehDoPar) return;
        aoReceber(m);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(canal);
  };
}