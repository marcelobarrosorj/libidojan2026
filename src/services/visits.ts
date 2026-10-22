// VISITAS: registra e le quem visitou o perfil (numeros reais)
import { supabase } from './supabase';

export async function registrarVisita(visitedId: string): Promise<void> {
  try {
    if (!visitedId) return;
    const { data } = await supabase.auth.getSession();
    const meuId = data?.session?.user?.id;
    if (!meuId || meuId === visitedId) return;

    await supabase
      .from('profile_visits')
      .upsert(
        { visitor_id: meuId, visited_id: visitedId, created_at: new Date().toISOString() },
        { onConflict: 'visitor_id,visited_id' }
      );
  } catch (e) {
    console.warn('VISITAS: falha ao registrar', e);
  }
}

export async function contarVisitas(meuId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('profile_visits')
      .select('*', { count: 'exact', head: true })
      .eq('visited_id', meuId);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function listarVisitantes(meuId: string, limite = 20): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('profile_visits')
      .select('visitor_id, created_at')
      .eq('visited_id', meuId)
      .order('created_at', { ascending: false })
      .limit(limite);
    return data || [];
  } catch {
    return [];
  }
}