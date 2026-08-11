import { supabase } from './supabase';
import { Message } from '../types';
import { isDemoId } from '../demo/index';

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
  listeners.forEach(cb => cb(msgs));
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

  } catch (err: any) {
    console.error('Error sending message:', err.message || err);

    const newMsg: Message = {
      ...message,
      id: 'fallback:msg:' + Date.now(),
      status: 'sent'
    };

    demoMessages.push(newMsg);
    fetchAndNotifyAll();
  }
};

let lastUserId = '';

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
      .limit(100);

    if (error) throw error;

    if (data) {
      let msgs = data.map(mapSupabaseToMessage).reverse();

      const relevantDemo = demoMessages.filter(
        m => m.from === lastUserId || m.to === lastUserId
      );

      msgs = [...msgs, ...relevantDemo];

      notifyListeners(msgs);
    }

  } catch (err: any) {
    console.error(
      'Error fetching all user messages from supabase:',
      err.message || err
    );

    const relevantDemo = demoMessages.filter(
      m => m.from === lastUserId || m.to === lastUserId
    );

    notifyListeners(relevantDemo);
  }
};

export const listenAllUserMessages = (
  userId: string,
  callback: (messages: Message[]) => void
) => {
  lastUserId = userId;
  listeners.push(callback);

  fetchAndNotifyAll();

  const channel = supabase
    .channel(`all_messages_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        if (
          payload.new &&
          (
            payload.new.sender_id === userId ||
            payload.new.receiver_id === userId
          )
        ) {
          fetchAndNotifyAll();
        }
      }
    )
    .subscribe();

  return () => {
    listeners = listeners.filter(cb => cb !== callback);
    supabase.removeChannel(channel);
  };
};

export const listenMessages = (
  userId1: string,
  userId2: string,
  callback: (messages: Message[]) => void
) => {
  return () => {};
};