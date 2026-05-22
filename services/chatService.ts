import { supabase } from './supabase';
import { log, toDatabaseId, fromDatabaseId, parseUTC } from './authUtils';
import { User, PresenceStatus, TrustLevel, Plan } from '../types';

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ParsedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  text?: string;
  image?: string;
  isSelfDestruct?: boolean;
  isViewed?: boolean;
  is_read?: boolean;
  from: 'me' | 'them';
  time: string;
  created_at: string;
}

// Local Fallback Storage Helpers and Duplicate Prevention
const LOCAL_MESSAGES_KEY = 'libido_local_messages_v1';

function getLocalFallbackMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFallbackMessage(msg: ChatMessage) {
  if (typeof window === 'undefined') return;
  try {
    const msgs = getLocalFallbackMessages();
    msgs.push(msg);
    // Limita o cache local para as últimas 500 mensagens para evitar consumo excessivo de storage
    if (msgs.length > 500) {
      msgs.shift();
    }
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(msgs));
  } catch (err) {
    console.warn('[CHAT_SERVICE] Erro ao salvar mensagem no cache local:', err);
  }
}

function mergeAndDeduplicateMessages(dbMessages: ChatMessage[], localMessages: ChatMessage[]): ChatMessage[] {
  const merged: ChatMessage[] = [...dbMessages];
  
  localMessages.forEach((localMsg) => {
    // Verificamos se ela já existe nas mensagens do banco
    const isDuplicate = dbMessages.some((dbMsg) => {
      if (dbMsg.sender_id === localMsg.sender_id && dbMsg.receiver_id === localMsg.receiver_id) {
        if (dbMsg.content === localMsg.content || dbMsg.id === localMsg.id) {
          const dbTime = new Date(dbMsg.created_at).getTime();
          const localTime = new Date(localMsg.created_at).getTime();
          if (isNaN(dbTime) || isNaN(localTime) || Math.abs(dbTime - localTime) < 45000) {
            return true;
          }
        }
      }
      return false;
    });

    if (!isDuplicate) {
      merged.push(localMsg);
    }
  });

  return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Envia uma mensagem real para a matriz do Supabase, com salvamento offline resiliente instantâneo
 */
export async function sendMessage(
  senderId: string, 
  receiverId: string, 
  text?: string, 
  image?: string, 
  isSelfDestruct: boolean = false
): Promise<boolean> {
  try {
    if (!senderId || !receiverId) return false;

    // Serializar dados complexos para caber na coluna 'content' de texto de forma compatível
    const payload = {
      text: text || '',
      image: image || '',
      isSelfDestruct,
      isViewed: false
    };

    const contentString = JSON.stringify(payload);

    const dbSenderId = toDatabaseId(senderId);
    const dbReceiverId = toDatabaseId(receiverId);
    const timestamp = new Date().toISOString();

    const localMsg: ChatMessage = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender_id: dbSenderId,
      receiver_id: dbReceiverId,
      content: contentString,
      is_read: false,
      created_at: timestamp
    };

    // Salva no localStorage como fallback para garantir entrega visual imediata sem travas
    saveLocalFallbackMessage(localMsg);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: dbSenderId,
        receiver_id: dbReceiverId,
        content: contentString,
        is_read: false
      });

    if (error) {
      log('warn', '[CHAT_SERVICE] Erro ao salvar mensagem no Supabase, mantendo cópia local offline', error);
      // Retornar true para liberar o chat e exibir a mensagem enviada a partir do cache local
      return true;
    }

    return true;
  } catch (err) {
    log('warn', '[CHAT_SERVICE] Falha crítica ao enviar mensagem, servindo a partir do cache local', err);
    return true; // Retorna true graças ao cache local offline-first
  }
}

/**
 * Busca conversas/mensagens entre o usuário atual e o contato mesclando fontes de dados
 */
export async function fetchMessages(currentUserId: string, contactId: string): Promise<ParsedMessage[]> {
  try {
    if (!currentUserId || !contactId) return [];

    const dbCurrentUserId = toDatabaseId(currentUserId);
    const dbContactId = toDatabaseId(contactId);

    // 1. Busca do Banco Real (Supabase)
    let dbMsgs: ChatMessage[] = [];
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${dbCurrentUserId},receiver_id.eq.${dbCurrentUserId}`)
        .order('created_at', { ascending: true });

      if (error) {
        log('warn', '[CHAT_SERVICE] Erro ao buscar mensagens no Supabase, usando fallback local', error);
      } else {
        dbMsgs = data || [];
      }
    } catch (e) {
      log('warn', '[CHAT_SERVICE] Exceção de rede na busca de mensagens no Supabase, usando fallback local', e);
    }

    // Filtra as mensagens do banco correspondentes a esta conversa específica
    const dbList = dbMsgs.filter((msg: any) => 
      (msg.sender_id === dbCurrentUserId && msg.receiver_id === dbContactId) ||
      (msg.sender_id === dbContactId && msg.receiver_id === dbCurrentUserId)
    );

    // 2. Busca do Cache Local
    const localMsgs = getLocalFallbackMessages().filter((msg: any) => 
      (msg.sender_id === dbCurrentUserId && msg.receiver_id === dbContactId) ||
      (msg.sender_id === dbContactId && msg.receiver_id === dbCurrentUserId)
    );

    // 3. Mesclar e Deduplicar
    const finalMessages = mergeAndDeduplicateMessages(dbList, localMsgs);

    return finalMessages.map((msg: ChatMessage) => {
      let text = msg.content;
      let image = '';
      let isSelfDestruct = false;
      let isViewed = false;

      // Tenta fazer o parse de conteúdo serializado como JSON
      if (typeof msg.content === 'string' && (msg.content.trim().startsWith('{') || msg.content.trim().startsWith('['))) {
        try {
          const parsed = JSON.parse(msg.content);
          text = parsed.text || '';
          image = parsed.image || '';
          isSelfDestruct = !!parsed.isSelfDestruct;
          isViewed = !!parsed.isViewed;
        } catch {
          // Fallback para texto plano
          text = msg.content;
        }
      }

      // Converte timestamp para formato amigável lido pelo JSX
      const msgDate = parseUTC(msg.created_at);
      const timeLabel = isNaN(msgDate.getTime()) 
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: msg.id,
        sender_id: fromDatabaseId(msg.sender_id),
        receiver_id: fromDatabaseId(msg.receiver_id),
        text,
        image,
        isSelfDestruct,
        isViewed,
        is_read: msg.is_read,
        from: fromDatabaseId(msg.sender_id) === currentUserId ? 'me' as const : 'them' as const,
        time: timeLabel,
        created_at: msg.created_at
      };
    });
  } catch (err) {
    log('error', '[CHAT_SERVICE] Erro crítico ao carregar mensagens', err);
    return [];
  }
}

/**
 * Marca uma mensagem específica como lida ou visualizada (ex: autodestruição)
 */
export async function updateMessageContent(messageId: string, updatedContent: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ content: updatedContent })
      .eq('id', messageId);

    if (error) {
       log('error', '[CHAT_SERVICE] Erro ao atualizar status da mensagem', error);
       return false;
    }
    return true;
  } catch (err) {
    log('error', '[CHAT_SERVICE] Erro crítico ao atualizar mensagem', err);
    return false;
  }
}

/**
 * Exclui uma mensagem física da matriz
 */
export async function deleteMessagePhysical(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      log('error', '[CHAT_SERVICE] Erro ao excluir mensagem', error);
      return false;
    }
    return true;
  } catch (err) {
    log('error', '[CHAT_SERVICE] Erro crítico ao excluir mensagem', err);
    return false;
  }
}

/**
 * Subscreve de forma real-time para alterações de chat entre dois usuários
 */
export function subscribeToMessages(
  currentUserId: string, 
  contactId: string, 
  onNewMessage: (msg: ParsedMessage) => void
) {
  // Configura o canal de subscrição no Supabase
  const channel = supabase
    .channel(`chat_${currentUserId}_${contactId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const record = payload.new as ChatMessage;
        if (!record) return;

        const recSender = fromDatabaseId(record.sender_id);
        const recReceiver = fromDatabaseId(record.receiver_id);

        // Filtra para garantir que pertence a esta conversa específica
        const isFromPartner = recSender === contactId && recReceiver === currentUserId;
        const isFromMe = recSender === currentUserId && recReceiver === contactId;

        if (isFromPartner || isFromMe) {
          let text = record.content;
          let image = '';
          let isSelfDestruct = false;
          let isViewed = false;

          if (typeof record.content === 'string' && (record.content.trim().startsWith('{') || record.content.trim().startsWith('['))) {
            try {
              const parsed = JSON.parse(record.content);
              text = parsed.text || '';
              image = parsed.image || '';
              isSelfDestruct = !!parsed.isSelfDestruct;
              isViewed = !!parsed.isViewed;
            } catch {
              text = record.content;
            }
          }

          const msgDate = new Date(record.created_at);
          const timeLabel = isNaN(msgDate.getTime()) 
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          onNewMessage({
            id: record.id,
            sender_id: recSender,
            receiver_id: recReceiver,
            text,
            image,
            isSelfDestruct,
            isViewed,
            is_read: record.is_read,
            from: recSender === currentUserId ? 'me' as const : 'them' as const,
            time: timeLabel,
            created_at: record.created_at
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export interface RecentChat {
  user: User;
  lastMessage: string;
  timeLabel: string;
  created_at: string;
}

/**
 * Retorna as conversas recentes do usuário de forma ordenada no banco do Supabase
 */
export async function fetchRecentConversations(currentUserId: string): Promise<RecentChat[]> {
  try {
    if (!currentUserId) return [];

    const dbCurrentUserId = toDatabaseId(currentUserId);

    // 1. Busca de mensagens no Supabase
    let dbMsgs: ChatMessage[] = [];
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${dbCurrentUserId},receiver_id.eq.${dbCurrentUserId}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbMsgs = data;
      }
    } catch (e) {
      log('warn', '[CHAT_SERVICE] Erro ao recuperar conversas do Supabase, tentando fallback', e);
    }

    // 2. Mesclar mensagens com banco e local
    const localMsgs = getLocalFallbackMessages().filter((msg: any) => 
      msg.sender_id === dbCurrentUserId || msg.receiver_id === dbCurrentUserId
    );

    // Mesclar e deduplicar todas
    const allMsgs = mergeAndDeduplicateMessages(dbMsgs, localMsgs);
    // Ordena de forma decrescente para conversas recentes
    allMsgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Mapear contatos únicos e obter sua última mensagem
    const contactsMap = new Map<string, { content: string; created_at: string }>();
    allMsgs.forEach((msg: ChatMessage) => {
      const msgSender = fromDatabaseId(msg.sender_id);
      const msgReceiver = fromDatabaseId(msg.receiver_id);
      const contactId = msgSender === currentUserId ? msgReceiver : msgSender;
      if (!contactsMap.has(contactId)) {
        contactsMap.set(contactId, { content: msg.content, created_at: msg.created_at });
      }
    });

    if (contactsMap.size === 0) return [];

    // Buscar perfis correspondentes
    const contactIds = Array.from(contactsMap.keys());
    const dbContactIds = contactIds.map(toDatabaseId);
    
    // Obter perfis do Supabase
    let profiles: any[] = [];
    try {
      const { data: pData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', dbContactIds);

      if (!pError && pData) {
        profiles = pData;
      }
    } catch (e) {
      log('warn', '[CHAT_SERVICE] Erro ao buscar perfis das conversas recentes', e);
    }

    // Se algum perfil de contato não existir no banco, adiciona uma entrada visual fallback segura
    const profilesWithFallback = [...profiles];
    contactIds.forEach(cId => {
      const dbCId = toDatabaseId(cId);
      const exists = profiles.some(p => p.id === dbCId);
      if (!exists) {
        profilesWithFallback.push({
          id: dbCId,
          nickname: cId === 'casalx' ? 'CasalX' : cId === '000001' ? 'CASAL BEIJO' : `Agente ${cId.substring(0, 5)}`,
          data: {
             nickname: cId === 'casalx' ? 'CasalX' : cId === '000001' ? 'CASAL BEIJO' : `Agente ${cId.substring(0, 5)}`,
             avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cId}`
          },
          updated_at: new Date().toISOString()
        });
      }
    });

    const recentChats = profilesWithFallback.map((p: any) => {
      const uData = p.data || {};
      const profileId = fromDatabaseId(p.id);
      
      // Determinação Dinâmica de Status Online idêntica ao processProfileData da matriz
      const lastSeen = p.last_seen || uData.last_seen || uData.lastSeen || p.updated_at || uData.updatedAt || uData.updated_at;
      const diffMinutes = lastSeen ? (new Date().getTime() - parseUTC(lastSeen).getTime()) / 60000 : 999;
      const isOnline = lastSeen ? (Math.abs(diffMinutes) < 15) : false;
      const statusValue = isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE;

      const userObj: User = {
        ...uData,
        id: profileId,
        nickname: p.nickname || uData.nickname || 'Agente',
        avatar: uData.avatar || '',
        verifiedAccount: !!p.verified_account,
        isOnline,
        status: statusValue as PresenceStatus,
        type: uData.type || 'SOLTEIROS',
        trustLevel: uData.trustLevel || TrustLevel.BRONZE,
      };

      const lastMsgObj = contactsMap.get(profileId)!;
      let text = lastMsgObj.content;
      if (typeof text === 'string' && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        try {
          const parsed = JSON.parse(text);
          text = parsed.text || (parsed.image ? '📷 Mídia Protegida' : '');
        } catch {
          text = lastMsgObj.content;
        }
      }

      const msgDate = parseUTC(lastMsgObj.created_at);
      const timeLabel = isNaN(msgDate.getTime())
        ? 'Agora'
        : msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        user: userObj,
        lastMessage: text,
        timeLabel,
        created_at: lastMsgObj.created_at
      };
    });

    return recentChats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    console.error('[CHAT_SERVICE] Falha ao recuperar conversas recentes:', err);
    return [];
  }
}

/**
 * Marca as mensagens recebidas de um contato específico como lidas
 */
export async function markMessagesAsRead(currentUserId: string, contactId: string): Promise<boolean> {
  try {
    if (!currentUserId || !contactId) return false;
    const dbCurrentUserId = toDatabaseId(currentUserId);
    const dbContactId = toDatabaseId(contactId);

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', dbContactId)
      .eq('receiver_id', dbCurrentUserId)
      .eq('is_read', false);

    if (error) {
      log('warn', '[CHAT_SERVICE] Erro ao marcar mensagens como lidas', error);
      return false;
    }
    return true;
  } catch (err) {
    log('warn', '[CHAT_SERVICE] Erro crítico ao marcar mensagens como lidas', err);
    return false;
  }
}
