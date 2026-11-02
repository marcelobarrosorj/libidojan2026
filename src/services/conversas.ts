import { supabase } from '../lib/supabase';

export async function apagarParaMim(userId: string, outroId: string): Promise<void> {
  const { error } = await supabase.from('conversas_ocultas').upsert(
    { user_id: userId, outro_id: outroId, ocultada_em: new Date().toISOString() },
    { onConflict: 'user_id,outro_id' }
  );
  if (error) throw error;
}

export async function restaurarConversa(userId: string, outroId: string): Promise<void> {
  const { error } = await supabase.from('conversas_ocultas').delete().eq('user_id', userId).eq('outro_id', outroId);
  if (error) throw error;
}

export async function apagarParaTodos(userId: string, outroId: string): Promise<void> {
  const { error } = await supabase.from('messages').update({
    apagada_para_todos: true,
    apagada_em: new Date().toISOString(),
    apagada_por: userId,
  }).or(`and("from".eq.${userId},"to".eq.${outroId}),and("from".eq.${outroId},"to".eq.${userId})`);
  if (error) throw error;
}

export async function conversasOcultas(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('conversas_ocultas').select('outro_id').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((r: any) => String(r.outro_id));
}