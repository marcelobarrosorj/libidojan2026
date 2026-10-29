// GPS-GLOBAL-MOD: salva a posicao continuamente com o app aberto, em qualquer tela
// Assim todo usuario logado fica visivel no mapa/radar (quem nunca abriu o Radar tambem).
import { supabase } from './supabase';

export function iniciarGpsGlobal(userId: string): () => void {
  let ultimaSalva = 0;
  let watchId: number | null = null;

  const salvar = (lat: number, lon: number) => {
    const agora = Date.now();
    if (agora - ultimaSalva < 30000) return;
    ultimaSalva = agora;
    (supabase as any)
      .from('users')
      .update({ lat, lon })
      .eq('user_id', userId)
      .then(({ error }: any) => { if (error) console.error('GPS-GLOBAL falhou', error); });
  };

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (pos: GeolocationPosition) => salvar(pos.coords.latitude, pos.coords.longitude),
      (erroGps: any) => console.error('GPS-LOG erro de GPS:', erroGps?.code || erroGps?.message || erroGps), // GPS-LOG
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  }

  return () => {
    if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
  };
}
