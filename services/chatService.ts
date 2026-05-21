import { supabase } from './supabase';
import { log } from './authUtils';
import { User, PresenceStatus, TrustLevel } from '../types';

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
  from: 'me' | 'them';
  time: string;
  created_at: string;
}

/**
 * Envia uma mensagem real para a matriz do Supabase
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

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: contentString,
        is_read: false
      });

    if (error) {
      log('error', '[CHAT_SERVICE] Erro ao enviar mensagem', error);
      return false;
    }

    return true;
  } catch (err) {
    log('error', '[CHAT_SERVICE] Erro crítico ao enviar mensagem', err);
    return false;
  }
}

/**
 * Busca conversas/mensagens entre o usuário atual e o contato
 */
export async function fetchMessages(currentUserId: string, contactId: string): Promise<ParsedMessage[]> {
  try {
    if (!currentUserId || !contactId) return [];

    // Busca mensagens simplificada envolvendo o usuário atual e filtra no cliente por segurança de sintaxe
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: true });

    if (error) {
      log('error', '[CHAT_SERVICE] Erro ao buscar mensagens', error);
      return [];
    }

    const list = (data || []).filter((msg: any) => 
      (msg.sender_id === currentUserId && msg.receiver_id === contactId) ||
      (msg.sender_id === contactId && msg.receiver_id === currentUserId)
    );
    return list.map((msg: ChatMessage) => {
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
      const msgDate = new Date(msg.created_at);
      const timeLabel = isNaN(msgDate.getTime()) 
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        text,
        image,
        isSelfDestruct,
        isViewed,
        from: msg.sender_id === currentUserId ? 'me' as const : 'them' as const,
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

        // Filtra para garantir que pertence a esta conversa específica
        const isFromPartner = record.sender_id === contactId && record.receiver_id === currentUserId;
        const isFromMe = record.sender_id === currentUserId && record.receiver_id === contactId;

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
            sender_id: record.sender_id,
            receiver_id: record.receiver_id,
            text,
            image,
            isSelfDestruct,
            isViewed,
            from: record.sender_id === currentUserId ? 'me' as const : 'them' as const,
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

    // Busca todas as mensagens enviadas ou recebidas pelo usuário
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    // Mapear contatos únicos e obter sua última mensagem
    const contactsMap = new Map<string, { content: string; created_at: string }>();
    data.forEach((msg: ChatMessage) => {
      const contactId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      if (!contactsMap.has(contactId)) {
        contactsMap.set(contactId, { content: msg.content, created_at: msg.created_at });
      }
    });

    if (contactsMap.size === 0) return [];

    // Buscar perfis correspondentes
    const contactIds = Array.from(contactsMap.keys());
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', contactIds);

    if (pError || !profiles) return [];

    const recentChats = profiles.map((p: any) => {
      const uData = p.data || {};
      
      // Determinação Dinâmica de Status Online idêntica ao processProfileData da matriz
      const lastSeen = p.last_seen || p.updated_at;
      const diffMinutes = lastSeen ? (new Date().getTime() - new Date(lastSeen).getTime()) / 60000 : 999;
      const isOnline = diffMinutes < 5;
      const statusValue = isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE;

      const userObj: User = {
        ...uData,
        id: p.id,
        nickname: p.nickname || uData.nickname || 'Agente',
        avatar: uData.avatar || '',
        verifiedAccount: !!p.verified_account,
        isOnline,
        status: statusValue as PresenceStatus,
        type: uData.type || 'SOLTEIROS',
        trustLevel: uData.trustLevel || TrustLevel.BRONZE,
      };

      const lastMsgObj = contactsMap.get(p.id)!;
      let text = lastMsgObj.content;
      if (typeof text === 'string' && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        try {
          const parsed = JSON.parse(text);
          text = parsed.text || (parsed.image ? '📷 Mídia Protegida' : '');
        } catch {
          text = lastMsgObj.content;
        }
      }

      const msgDate = new Date(lastMsgObj.created_at);
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
