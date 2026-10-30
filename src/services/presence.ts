const INTERVALO_MS = 60 * 1000; // Heartbeat a cada 60 segundos para precisao no Radar

let timer: ReturnType<typeof setInterval> | null = null;
let usuarioAtual: string | null = null;

async function gravar(userId: string, online: boolean): Promise<void> {
  try {
    const { supabase } = await import('./supabase');
    const agora = new Date().toISOString();
    const payload = online
      ? { is_online: true, updated_at: agora }
      : { is_online: false, updated_at: agora };

    await supabase
      .from('users')
      .update(payload)
      .eq('user_id', userId);

    try {
      await (supabase as any)
        .from('user_profiles')
        .update(payload)
        .eq('user_id', userId);
    } catch {
      try {
        await (supabase as any)
          .from('user_profiles')
          .update({ is_online: online })
          .eq('user_id', userId);
      } catch (e) { console.error(e); }
    }
  } catch (e) { console.error(e); }
}

export async function startPresence(userId: string): Promise<void> {
  if (!userId) return;
  if (usuarioAtual === userId && timer) return;
  await stopPresence();
  usuarioAtual = userId;
  await gravar(userId, true);
  timer = setInterval(() => { void gravar(userId, true); }, INTERVALO_MS);
}

export async function stopPresence(): Promise<void> {
  if (timer) { clearInterval(timer); timer = null; }
  if (usuarioAtual) {
    const uid = usuarioAtual;
    usuarioAtual = null;
    await gravar(uid, false);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (usuarioAtual) void gravar(usuarioAtual, false);
  });
}