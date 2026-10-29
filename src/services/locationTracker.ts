// RASTREIO-GLOBAL: GPS continuo em qualquer tela do app.
// Inicia sozinho quando existe sessao ativa e para no logout.
// Salvamento no banco limitado a 1 vez a cada 30 segundos.
import { supabase } from './supabase';

let watchId: number | null = null;
let ultimaSalva = 0;
let usuarioAtivo: string | null = null;

const salvarCoordenada = (lat: number, lon: number) => {
  if (!usuarioAtivo) return;
  if (Date.now() - ultimaSalva < 30000) return;
  ultimaSalva = Date.now();
  (supabase as any)
    .from('users')
    .update({ lat, lon })
    .eq('user_id', usuarioAtivo)
    .then(({ error }: any) => {
      if (error) console.error('RASTREIO-GLOBAL falhou', error);
    });
};

const comecar = (uid: string) => {
  if (watchId !== null) return;
  if (typeof navigator === 'undefined' || !navigator.geolocation) return;
  usuarioAtivo = uid;
  watchId = navigator.geolocation.watchPosition(
    (pos) => salvarCoordenada(pos.coords.latitude, pos.coords.longitude),
    () => {},
    { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 }
  );
};

const parar = () => {
  if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
  watchId = null;
  usuarioAtivo = null;
};

supabase.auth.getSession().then(({ data }: any) => {
  const uid = data?.session?.user?.id;
  if (uid) comecar(uid);
});

supabase.auth.onAuthStateChange((_evento: string, sessao: any) => {
  if (sessao?.user?.id) comecar(sessao.user.id);
  else parar();
});
