// PUSH-SEND v2: carrega web-push via createRequire (evita erro de interop ESM/CJS)
import { createRequire } from 'node:module';

const ORIGEM = 'https://www.libidoapp.com.br';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SECRET = process.env.PUSH_WEBHOOK_SECRET || '';

let webpush = null;
let erroWebPush = null;

try {
  const require = createRequire(import.meta.url);
  webpush = require('web-push');
} catch (e) {
  erroWebPush = String((e && e.message) || e);
}

function cabecalhos() {
  return { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY };
}

async function nomeDe(uid) {
  try {
    if (!uid) return null;
    const r = await fetch(
      SUPABASE_URL + '/rest/v1/users?user_id=eq.' + encodeURIComponent(uid) + '&select=name,nickname&limit=1',
      { headers: cabecalhos() }
    );
    if (!r.ok) return null;
    const arr = await r.json();
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[0].name || arr[0].nickname || null;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  // DIAGNOSTICO: abre no navegador e mostra o estado real da funcao
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      rota: 'ativa',
      node: process.version,
      temUrlSupabase: Boolean(SUPABASE_URL),
      temServiceKey: Boolean(SERVICE_KEY),
      temVapid: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      webPushCarregou: Boolean(webpush),
      erroWebPush: erroWebPush
    });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, erro: 'metodo nao permitido' });
    }
    if (SECRET && req.headers['x-webhook-secret'] !== SECRET) {
      return res.status(401).json({ ok: false, erro: 'segredo invalido' });
    }
    if (!webpush) {
      return res.status(200).json({ ok: false, motivo: 'web-push indisponivel', erro: erroWebPush });
    }
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(200).json({ ok: false, motivo: 'variaveis do Supabase ausentes' });
    }

    const corpo = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const destinatario = corpo.receiver_id || (corpo.record && corpo.record.receiver_id) || null;
    const remetente = corpo.sender_id || (corpo.record && corpo.record.sender_id) || null;

    if (!destinatario) {
      return res.status(200).json({ ok: false, motivo: 'sem receiver_id', chaves: Object.keys(corpo) });
    }
    if (remetente && String(remetente) === String(destinatario)) {
      return res.status(200).json({ ok: true, enviados: 0, motivo: 'mensagem para si mesmo' });
    }

    try {
      webpush.setVapidDetails(
        'mailto:libidoapp@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } catch (e) {
      return res.status(200).json({ ok: false, motivo: 'VAPID invalido', erro: String(e && e.message ? e.message : e) });
    }

    const url = SUPABASE_URL + '/rest/v1/push_subscriptions?user_id=eq.' + encodeURIComponent(destinatario) + '&select=endpoint,p256dh,auth';
    const r = await fetch(url, { headers: cabecalhos() });
    if (!r.ok) {
      return res.status(200).json({ ok: false, motivo: 'falha ao ler inscricoes', status: r.status });
    }

    const inscricoes = await r.json();
    if (!Array.isArray(inscricoes) || inscricoes.length === 0) {
      return res.status(200).json({ ok: true, enviados: 0, motivo: 'usuario sem inscricao ativa' });
    }

    const nome = await nomeDe(remetente);
    const payload = JSON.stringify({
      title: 'Libido',
      body: nome ? nome + ' te enviou uma mensagem' : 'Voce recebeu uma nova mensagem',
      url: ORIGEM + '/'
    });

    let enviados = 0;
    for (let i = 0; i < inscricoes.length; i++) {
      const item = inscricoes[i];
      try {
        await webpush.sendNotification(
          { endpoint: item.endpoint, keys: { p256dh: item.p256dh, auth: item.auth } },
          payload
        );
        enviados++;
      } catch (e) {
        const status = e && e.statusCode ? e.statusCode : 0;
        if (status === 404 || status === 410) {
          await fetch(
            SUPABASE_URL + '/rest/v1/push_subscriptions?endpoint=eq.' + encodeURIComponent(item.endpoint),
            { method: 'DELETE', headers: cabecalhos() }
          );
        }
      }
    }

    return res.status(200).json({ ok: true, enviados: enviados, inscricoes: inscricoes.length });
  } catch (e) {
    return res.status(200).json({ ok: false, motivo: 'excecao', erro: String(e && e.message ? e.message : e) });
  }
}