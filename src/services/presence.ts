// Presenca: mantem o campo is_online verdadeiro enquanto o app estiver aberto
const INTERVALO_MS = 2 * 60 * 1000; // avisa o banco a cada 2 minutos

let timer: ReturnType<typeof setInterval> | null = null;
let usuarioAtual: string | null = null;

async function gravar(userId: string, online: boolean): Promise<void> {
  try {
    const { supabase } = await import('./supabase');
    await supabase
      .from('users')
      .update(online ? { is_online: true, updated_at: new Date().toISOString() } : { is_online: false }) // B2-FIX: heartbeat grava updated_at
      .eq('user_id', userId);
    void (async () => {
      try {
        await (supabase as any)
          .from('user_profiles')
          .update(online ? { is_online: true, updated_at: new Date().toISOString() } : { is_online: false })
          .eq('user_id', userId);
      } catch (ePresPerfil1: any) {
        try {
          await (supabase as any)
            .from('user_profiles')
            .update({ is_online: online })
            .eq('user_id', userId);
        } catch (ePresPerfil2: any) {
          console.warn('PRES-ALERT: heartbeat em user_profiles falhou', (ePresPerfil2 && ePresPerfil2.message) || ePresPerfil2);
        }
      }
    })(); // B4-FIX: espelha o heartbeat na tabela que o radar le (user_profiles)
  } catch {
    // silencioso: presenca nunca deve travar o app
  }
}

export async function startPresence(userId: string): Promise<void> {
  if (usuarioAtual === userId && timer) return;
  await stopPresence();
  usuarioAtual = userId;
  await gravar(userId, true);
  timer = setInterval(() => { gravar(userId, true); }, INTERVALO_MS);
}

export async function stopPresence(): Promise<void> {
  if (timer) { clearInterval(timer); timer = null; }
  if (usuarioAtual) {
    const uid = usuarioAtual;
    usuarioAtual = null;
    await gravar(uid, false);
  }
}

// Ao fechar ou recarregar a pagina, avisa que o usuario saiu
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (usuarioAtual) gravar(usuarioAtual, false);
  });
}
