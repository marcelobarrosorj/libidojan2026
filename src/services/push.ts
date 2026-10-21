// PUSH: inscricao para notificacoes com o app fechado (PWA + Web Push)
import { supabase } from './supabase';
import { VAPID_PUBLIC_KEY } from './pushConfig';

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
    console.warn('PUSH: falha ao registrar service worker', e);
  }
}

export async function ativarPush(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return false;
    }

    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') return false;

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
    if (!p256dh || !auth) return false;

    const sess = await supabase.auth.getSession();
    const uid = sess && sess.data && sess.data.session && sess.data.session.user ? sess.data.session.user.id : null;
    if (!uid) return false;

    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await supabase.from('push_subscriptions').insert({
      user_id: uid,
      endpoint: sub.endpoint,
      p256dh: p256dh,
      auth: auth
    });

    return true;
  } catch (e) {
    console.warn('PUSH: falha ao ativar', e);
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

  // se o usuario entrar depois do primeiro toque, tenta de novo
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