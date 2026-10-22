// PUSH: inscricao para notificacoes com o app fechado (PWA + Web Push)
import { supabase } from './supabase';
import { VAPID_PUBLIC_KEY } from './pushConfig';

let pushStatus = '';
let jaAvisou = false;

function avisar(msg: string) {
  pushStatus = msg;
  console.warn('PUSH: ' + msg);
  if (jaAvisou) return;
  jaAvisou = true;
  try {
    if (typeof window !== 'undefined') {
      window.setTimeout(function () {
        try { window.alert('PUSH -> ' + msg); } catch (e) {}
      }, 2000);
    }
  } catch (e) {}
}

export function lerStatusPush(): string {
  return pushStatus || 'sem registro';
}

function base64ParaUint8(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function registrarServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (e) {
    avisar('falha ao registrar service worker');
  }
}

export async function ativarPush(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (!('serviceWorker' in navigator)) { avisar('sem serviceWorker neste navegador'); return false; }
    if (!('PushManager' in window)) { avisar('sem PushManager neste navegador'); return false; }
    if (!('Notification' in window)) { avisar('sem Notification neste navegador'); return false; }

    const permissao = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permissao !== 'granted') { avisar('permissao negada (' + permissao + ')'); return false; }

    await registrarServiceWorker();
    const reg = await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ParaUint8(VAPID_PUBLIC_KEY) as any
      });
    }

    const json: any = sub.toJSON();
    const p256dh = json && json.keys ? json.keys.p256dh : null;
    const auth = json && json.keys ? json.keys.auth : null;
    if (!p256dh || !auth) { avisar('inscricao sem chaves p256dh/auth'); return false; }

    const sess = await supabase.auth.getSession();
    const uid = sess && sess.data && sess.data.session && sess.data.session.user ? sess.data.session.user.id : null;
    if (!uid) { avisar('sem sessao ativa'); return false; }

    // PUSH-SEM-BURACO: atualiza se ja existe, cria se nao existe.
    // Antes era delete + insert: se o insert falhasse, a inscricao sumia de vez.
    const { data: existente } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', sub.endpoint)
      .limit(1);

    if (existente && existente.length > 0) {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ user_id: uid, p256dh: p256dh, auth: auth })
        .eq('id', existente[0].id);
      if (error) { avisar('banco recusou (update): ' + error.message); return false; }
      avisar('OK inscricao atualizada');
      return true;
    }

    const { error } = await supabase.from('push_subscriptions').insert({
      user_id: uid,
      endpoint: sub.endpoint,
      p256dh: p256dh,
      auth: auth,
      created_at: new Date().toISOString()
    });

    if (error) { avisar('banco recusou: ' + error.message); return false; }
    avisar('OK inscricao gravada');
    return true;
  } catch (e: any) {
    avisar('excecao: ' + (e && e.message ? e.message : String(e)));
    return false;
  }
}

export function iniciarPush(): void {
  if (typeof document === 'undefined') return;
  void registrarServiceWorker();

  let pediu = false;
  const tentar = () => {
    if (pediu) return;
    pediu = true;
    void ativarPush();
    document.removeEventListener('pointerdown', tentar);
    document.removeEventListener('touchstart', tentar);
  };
  document.addEventListener('pointerdown', tentar, { passive: true });
  document.addEventListener('touchstart', tentar, { passive: true });

  try {
    supabase.auth.onAuthStateChange(function (_ev: any, sess: any) {
      if (typeof Notification === 'undefined') return;
      if (sess && sess.user && sess.user.id && Notification.permission === 'granted') {
        void ativarPush();
      }
    });
  } catch (e) {}
}

try { iniciarPush(); } catch (e) {}