// NOTIF-GLOBAL-MOD: escuta global de notificacoes (mensagens, curtidas, seguidores)
// Sons por evento + aviso na tela + notificacao do sistema quando a aba esta em segundo plano.
import { listenAllUserMessages } from './chat';
import { supabase } from './supabase';
import { playMessageSound, playLikeSound, playFollowSound } from './sounds';

export function iniciarNotificacoesGlobais(
  userId: string,
  pegarTab: () => string,
  onUnread: (n: number) => void
): () => void {
  let lastMsg = 0;

  const mostrarToast = (msg: string) => {
    try {
      let t = document.getElementById('libido-toast') as HTMLElement | null;
      if (!t) {
        t = document.createElement('div');
        t.id = 'libido-toast';
        t.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);background:var(--libido-accent);color:#fff;padding:10px 18px;border-radius:999px;font-weight:800;font-size:13px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.45);transition:opacity .3s;opacity:0';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.style.opacity = '1';
      const w = window as any;
      clearTimeout(w.__libidoToastT);
      w.__libidoToastT = setTimeout(() => { if (t) t.style.opacity = '0'; }, 4000);
    } catch (eT) {}
  };

  const notificarSistema = (titulo: string, corpo: string) => {
    try {
      const N = (window as any).Notification;
      if (!N || N.permission !== 'granted') return;
      if (!document.hidden) return;
      const opts: any = { body: corpo, tag: 'libido-' + Date.now() };
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg: any) => {
          try { reg.showNotification(titulo, opts); } catch (eN) {}
        }).catch(() => { try { new N(titulo, opts); } catch (eN2) {} });
      } else {
        try { new N(titulo, opts); } catch (eN3) {}
      }
    } catch (eN4) {}
  };

  const pedirPermissao = () => {
    try {
      const N = (window as any).Notification;
      if (N && N.permission === 'default') { N.requestPermission(); }
      if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }
    } catch (eP) {}
    window.removeEventListener('click', pedirPermissao);
  };
  window.addEventListener('click', pedirPermissao);

  const unsub = listenAllUserMessages(userId, (messages: any[]) => {
    const recebidas = (messages || []).filter((m: any) => m.to === userId);
    const nl = recebidas.filter((m: any) => m.status !== 'read').length;
    onUnread(nl);
    document.title = nl > 0 ? '(' + nl + ') Libido' : 'Libido';
    if (recebidas.length > 0) {
      const maxT = Math.max(...recebidas.map((m: any) => m.createdAt));
      if (lastMsg > 0 && maxT > lastMsg && pegarTab() !== 'chat') {
        playMessageSound();
        mostrarToast('Nova mensagem recebida!');
        notificarSistema('Libido', 'Voce recebeu uma nova mensagem!');
      }
      lastMsg = maxT;
    }
  });

  const chFollow = supabase.channel('notif-follows-' + userId + '_' + Math.random().toString(36).slice(2, 8)) // CANAL-UNICO
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follows' }, (p: any) => {
      const alvo = String(p.new?.following_id ?? '');
      if (alvo === String(userId)) {
        playFollowSound();
        mostrarToast('Voce tem um novo seguidor!');
        notificarSistema('Libido', 'Voce tem um novo seguidor!');
      }
    })
    .subscribe();

  const chLike = supabase.channel('notif-likes-' + userId + '_' + Math.random().toString(36).slice(2, 8)) // CANAL-UNICO
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (p: any) => {
      if (String(p.new?.user_id) === String(userId) && (p.new?.likes || 0) > (p.old?.likes || 0)) {
        playLikeSound();
        mostrarToast('Sua foto foi curtida!');
        notificarSistema('Libido', 'Sua foto foi curtida!');
      }
    })
    .subscribe();

  return () => {
    unsub();
    supabase.removeChannel(chFollow);
    supabase.removeChannel(chLike);
    window.removeEventListener('click', pedirPermissao);
  };
}
