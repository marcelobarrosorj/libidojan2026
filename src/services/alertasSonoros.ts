// ALERTAS-SOM: som de mensagem nova + alerta de proximidade (app aberto)
import { supabase } from './supabase';
import { tocarMensagem, tocarProximidade } from './sons';

const RAIO_PROXIMIDADE_M = 500;
const COOLDOWN_PROXIMIDADE_MS = 10 * 60 * 1000;
const INTERVALO_CHECAGEM_MS = 45000;

let iniciado = false;
let meuId: string | null = null;
let meuPonto: { lat: number; lon: number } | null = null;
const ultimoAviso: Record<string, number> = {};
const jaTocados: Record<string, boolean> = {};

function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatarDistancia(metros: number): string {
  if (metros < 1000) {
    const passo = Math.max(100, Math.round(metros / 100) * 100);
    return '~' + passo + ' m';
  }
  const km = Math.round((metros / 1000) * 10) / 10;
  return '~' + String(km).replace('.', ',') + ' km';
}

function mostrarAviso(titulo: string, sub: string): void {
  if (typeof document === 'undefined' || !document.body) return;
  try {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99999;' +
      'background:#16161a;border:1px solid #D86B3F;border-radius:16px;padding:12px 16px;' +
      'box-shadow:0 10px 28px rgba(0,0,0,.55);font-family:system-ui,sans-serif;' +
      'color:#FFF9F1;min-width:210px;max-width:88vw;opacity:0;transition:opacity .25s';
    const a = document.createElement('div');
    a.textContent = titulo;
    a.style.cssText = 'font-size:13px;font-weight:800';
    const b = document.createElement('div');
    b.textContent = sub;
    b.style.cssText = 'font-size:11px;color:#CDB8A5;margin-top:3px';
    el.appendChild(a);
    el.appendChild(b);
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { try { el.remove(); } catch (e) { console.error(e); } }, 320);
    }, 5200);
  } catch (e) { console.error(e); }
}

function escutarMensagens(): void {
  try {
    supabase
      .channel('libido-som-mensagens')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        function (payload: any) {
          const linha = payload && payload.new ? payload.new : null;
          if (!linha) return;
          const de = linha.sender_id || linha.de_id || linha.from_user || null;
          if (meuId && de && de === meuId) return;
          const chave = String(linha.id || linha.message_id || Math.random());
          if (jaTocados[chave]) return;
          jaTocados[chave] = true;
          tocarMensagem();
        }
      )
      .subscribe();
  } catch (e) {
    console.warn('ALERTAS-SOM: realtime de mensagens indisponivel', e);
  }
}

async function checarProximidade(): Promise<void> {
  if (!meuPonto || !meuId) return;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, nickname, lat, lon')
      .neq('user_id', meuId)
      .not('lat', 'is', null)
      .not('lon', 'is', null)
      .limit(300);
    if (error || !data) return;
    const agora = Date.now();
    for (let i = 0; i < data.length; i++) {
      const u: any = data[i];
      const id = String(u.user_id || u.id || i);
      const lat = Number(u.lat);
      const lon = Number(u.lon);
      if (!isFinite(lat) || !isFinite(lon)) continue;
      const d = distanciaMetros(meuPonto.lat, meuPonto.lon, lat, lon);
      if (d > RAIO_PROXIMIDADE_M) continue;
      const anterior = ultimoAviso[id] || 0;
      if (agora - anterior > COOLDOWN_PROXIMIDADE_MS) {
        ultimoAviso[id] = agora;
        tocarProximidade();
        mostrarAviso(
          'Você está perto!',
          String(u.name || u.nickname || 'Alguém') + ' está a ' + formatarDistancia(d) + ' de você'
        );
        return;
      }
    }
  } catch (e) { console.error(e); }
}

function iniciarGps(): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return;
  try {
    navigator.geolocation.watchPosition(
      function (pos) {
        meuPonto = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      },
      function () {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  } catch (e) { console.error(e); }
}

export function iniciarAlertasSonoros(): void {
  if (iniciado) return;
  iniciado = true;
  try {
    supabase.auth.getSession().then(function (r: any) {
      meuId = (r && r.data && r.data.session && r.data.session.user && r.data.session.user.id) || null;
    }).catch(function () {});
    supabase.auth.onAuthStateChange(function (_ev: any, sess: any) {
      meuId = (sess && sess.user && sess.user.id) || null;
    });
  } catch (e) { console.error(e); }
  iniciarGps();
  escutarMensagens();
  setTimeout(function () { void checarProximidade(); }, 6000);
  setInterval(function () { void checarProximidade(); }, INTERVALO_CHECAGEM_MS);
  console.log('ALERTAS-SOM ativos');
}

try { iniciarAlertasSonoros(); } catch (e) { console.error(e); }