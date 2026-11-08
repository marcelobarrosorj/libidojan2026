import { supabase } from './supabase';
import { Message } from '../types';
import { isDemoId } from '../demo';

const mapSupabaseToMessage = (row: any): Message => ({
  id: String(row.id),
  from: row.sender_id,
  to: row.receiver_id,
  text: row.content,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  status: row.status || 'sent'
});

let demoMessages: Message[] = [];
let listeners: Array<(msgs: Message[]) => void> = [];

const notifyListeners = (msgs: Message[]) => {
  listeners.forEach(cb => {
    try {
      cb(msgs);
    } catch (e) {
      console.warn('[CHAT] Erro ao notificar listener:', e);
    }
  });
};

export const sendMessage = async (message: Omit<Message, 'id'>) => {
  message.status = message.status || 'sending';

  if (isDemoId(message.from) || isDemoId(message.to)) {
    const newMsg: Message = {
      ...message,
      id: 'demo:msg:' + Date.now()
    };
    demoMessages.push(newMsg);
    fetchAndNotifyAll();
    setTimeout(() => {
      newMsg.status = 'read';
      fetchAndNotifyAll();
    }, 1500);
    return;
  }

  try {
    const { error } = await supabase.from('messages').insert({
      sender_id: message.from,
      receiver_id: message.to,
      content: message.text,
      created_at: new Date(message.createdAt).toISOString()
    });
    if (error) throw error;
    fetchAndNotifyAll();
  } catch (err: any) {
    console.error('Error sending message:', err?.message || err);
    const newMsg: Message = {
      ...message,
      id: 'falha:msg:' + Date.now(),
      status: 'failed'
    };
    demoMessages.push(newMsg);
    fetchAndNotifyAll();
  }
};

let lastUserId = '';

let _ocultasCache: { uid: string; at: number; ids: Set<string> } = { uid: "", at: 0, ids: new Set<string>() };
export const invalidarOcultas = () => { _ocultasCache = { uid: "", at: 0, ids: new Set<string>() }; };

const ocultasDoUsuario = async (uid: string): Promise<Set<string>> => {
  const agora = Date.now();
  if (_ocultasCache.uid === uid && agora - _ocultasCache.at < 3000) return _ocultasCache.ids;
  try {
    const ids = await mensagensOcultasIds(uid);
    _ocultasCache = { uid, at: agora, ids: new Set<string>(ids.map(String)) };
  } catch {
    _ocultasCache = { uid, at: agora, ids: _ocultasCache.ids };
  }
  return _ocultasCache.ids;
};

const fetchAndNotifyAll = async () => {
  if (!lastUserId) return;

  if (isDemoId(lastUserId)) {
    const relevantDemo = demoMessages.filter(
      m => m.from === lastUserId || m.to === lastUserId
    );
    notifyListeners(relevantDemo);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${lastUserId},receiver_id.eq.${lastUserId}`)
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) throw error;

    if (data) {
      const ocultas = await ocultasDoUsuario(lastUserId);
      let msgs = data
        .filter((r: any) => !r.apagada_para_todos)
        .map(mapSupabaseToExpandida)
        .filter((m: any) => !ocultas.has(String(m.id)))
        .reverse();
      const relevantDemo = demoMessages.filter(
        m => m.from === lastUserId || m.to === lastUserId
      );
      msgs = [...msgs, ...relevantDemo];
      notifyListeners(msgs);
    }
  } catch (err: any) {
    console.warn('[CHAT-FETCH] falha ao buscar mensagens (possivel erro de rede):', err?.message || err);
    const relevantDemo = demoMessages.filter(
      m => m.from === lastUserId || m.to === lastUserId
    );
    if (relevantDemo.length) notifyListeners(relevantDemo);
  }
};

export const listenAllUserMessages = (
  userId: string,
  callback: (messages: Message[]) => void
) => {
  lastUserId = userId;
  listeners.push(callback);
  fetchAndNotifyAll();

  let channel: any = null;
  try {
    channel = supabase
      .channel(`all_messages_${userId}_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          if (
            payload?.new &&
            (
              payload.new.sender_id === userId ||
              payload.new.receiver_id === userId
            )
          ) {
            fetchAndNotifyAll();
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[CHAT] Realtime channel error');
        }
      });
  } catch (err: any) {
    console.warn('[CHAT] Erro ao subscrever canal realtime:', err?.message || err);
  }

  const poll = setInterval(() => {
    fetchAndNotifyAll().catch(e => console.warn('[CHAT] Poll error:', e?.message || e));
  }, 5000);

  return () => {
    listeners = listeners.filter(cb => cb !== callback);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('[CHAT] Erro ao remover canal realtime:', e);
      }
    }
    clearInterval(poll);
  };
};

export const listenMessages = (
  userId1: string,
  userId2: string,
  callback: (messages: Message[]) => void
) => {
  console.warn('[CHAT] listenMessages nao implementado - use listenAllUserMessages');
  void userId1; void userId2; void callback;
  return () => {};
};

export const markMessagesAsDelivered = async (userId: string) => {
  if (!userId) return;
  try {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .eq('status', 'sent');
    if (error) console.error('TICKS-MARK delivered falhou:', error?.message || error);
  } catch (err: any) {
    console.warn('TICKS-MARK delivered rede falhou:', err?.message || err);
  }
};

export const markMessagesAsRead = async (userId: string, partnerId?: string) => {
  if (!userId) return;
  try {
    let q = supabase
      .from('messages')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .in('status', ['sent', 'delivered']);

    if (partnerId) q = q.eq('sender_id', partnerId);

    const { error } = await q;
    if (error) console.error('TICKS-MARK read falhou:', error?.message || error);
  } catch (err: any) {
    console.warn('TICKS-MARK read rede falhou:', err?.message || err);
  }
};

// ============================================================
// EXTENSOES: visualizacao unica, midia e exclusao
// ============================================================

export interface MensagemExpandida extends Message {
  mediaUrl?: string;
  mediaType?: string;
  viewOnce?: boolean;
  viewedAt?: string | null;
  apagadaParaTodos?: boolean;
}

export const mapSupabaseToExpandida = (row: any): MensagemExpandida => ({
  ...mapSupabaseToMessage(row),
  mediaUrl: row.media_url || undefined,
  mediaType: row.media_type || undefined,
  viewOnce: row.view_once === true,
  viewedAt: row.viewed_at || null,
  apagadaParaTodos: row.apagada_para_todos === true,
});

export const listarMensagensExpandidas = async (
  userId: string
): Promise<MensagemExpandida[]> => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;
    if (!data) return [];

    return data.map(mapSupabaseToExpandida).reverse();
  } catch (err: any) {
    console.error('listarMensagensExpandidas falhou:', err?.message || err);
    return [];
  }
};

export const sendMessageComMidia = async (
  base: Omit<Message, 'id'>,
  extras: { mediaUrl?: string; mediaType?: string; viewOnce?: boolean }
) => {
  if (isDemoId(base.from) || isDemoId(base.to)) {
    return sendMessage(base);
  }

  const payload: any = {
    sender_id: base.from,
    receiver_id: base.to,
    content: base.text || '',
    created_at: new Date(base.createdAt).toISOString()
  };

  if (extras.mediaUrl) payload.media_url = extras.mediaUrl;
  if (extras.mediaType) payload.media_type = extras.mediaType;
  if (extras.viewOnce) payload.view_once = true;

  try {
    const { error } = await supabase.from('messages').insert(payload);
    if (error) {
      console.error('sendMessageComMidia falhou:', error?.message || error);
      throw error;
    }
    fetchAndNotifyAll();
  } catch (err: any) {
    console.error('sendMessageComMidia rede falhou:', err?.message || err);
    throw err;
  }
};

export const marcarVisualizada = async (id: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('abrir_midia_unica', {
      p_message: String(id),
    });
    if (error) {
      console.error('marcarVisualizada: abrir_midia_unica falhou:', error.message || error);
      return null;
    }
    const linha = Array.isArray(data) ? data[0] : data;
    if (linha && linha.ja_aberta) {
      console.warn('marcarVisualizada: foto ja consumida — acesso negado pela RPC');
      return null;
    }
    return linha && linha.url ? String(linha.url) : null;
  } catch (err: any) {
    console.error('marcarVisualizada erro de rede:', err?.message || err);
    return null;
  }
};

export const apagarMensagem = async (
  id: string,
  modo: 'mim' | 'todos',
  userId?: string
) => {
  try {
    if (modo === 'todos') {
      const { error } = await supabase
        .from('messages')
        .update({
          apagada_para_todos: true,
          apagada_em: new Date().toISOString(),
          apagada_por: userId || null
        })
        .eq('id', id);
      if (error) throw error;
      fetchAndNotifyAll();
      return;
    }

    if (!userId) throw new Error('userId obrigatorio para apagar para mim');

    const { error } = await supabase
      .from('mensagens_ocultas')
      .upsert(
        { user_id: userId, message_id: String(id), ocultada_em: new Date().toISOString() },
        { onConflict: 'user_id,message_id' }
      );
    if (error) throw error;
  } catch (err: any) {
    console.error('apagarMensagem falhou:', err?.message || err);
    throw err;
  }
};

export const mensagensOcultasIds = async (userId: string): Promise<string[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('mensagens_ocultas')
      .select('message_id')
      .eq('user_id', userId);
    if (error) {
      console.error('mensagensOcultasIds falhou:', error?.message || error);
      return [];
    }
    return (data || []).map((r: any) => String(r.message_id));
  } catch (err: any) {
    console.warn('mensagensOcultasIds erro de rede:', err?.message || err);
    return [];
  }
};

export const ocultarConversa = async (userId: string, outroId: string) => {
  try {
    const { error } = await supabase
      .from('conversas_ocultas')
      .upsert(
        { user_id: userId, outro_id: outroId, ocultada_em: new Date().toISOString() },
        { onConflict: 'user_id,outro_id' }
      );
    if (error) throw error;
  } catch (err: any) {
    console.error('ocultarConversa falhou:', err?.message || err);
    throw err;
  }
};

export const desocultarConversa = async (userId: string, outroId: string) => {
  try {
    const { error } = await supabase
      .from('conversas_ocultas')
      .delete()
      .eq('user_id', userId)
      .eq('outro_id', outroId);
    if (error) throw error;
  } catch (err: any) {
    console.error('desocultarConversa falhou:', err?.message || err);
    throw err;
  }
};

export const conversasOcultas = async (userId: string): Promise<string[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('conversas_ocultas')
      .select('outro_id')
      .eq('user_id', userId);
    if (error) {
      console.error('conversasOcultas falhou:', error?.message || error);
      return [];
    }
    return (data || []).map((r: any) => String(r.outro_id));
  } catch (err: any) {
    console.warn('conversasOcultas erro de rede:', err?.message || err);
    return [];
  }
};

export const apagarConversa = async (
  userId: string,
  outroId: string,
  modo: 'mim' | 'todos'
) => {
  try {
    if (modo === 'mim') {
      await ocultarConversa(userId, outroId);
      return;
    }

    const { error } = await supabase
      .from('messages')
      .update({
        apagada_para_todos: true,
        apagada_em: new Date().toISOString(),
        apagada_por: userId
      })
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${outroId}),and(sender_id.eq.${outroId},receiver_id.eq.${userId})`);

    if (error) throw error;
    fetchAndNotifyAll();
  } catch (err: any) {
    console.error('apagarConversa falhou:', err?.message || err);
    throw err;
  }
};
