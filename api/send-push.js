// PUSH-SEND: envia a notificacao para o destinatario da mensagem
import webpush from 'web-push';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SECRET = process.env.PUSH_WEBHOOK_SECRET;
const ORIGEM = 'https://www.libidoapp.com.br';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:libidoapp@gmail.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
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
  // rota de teste: abrir no navegador mostra se ela esta no ar
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      rota: 'ativa',
      temUrlSupabase: Boolean(SUPABASE_URL),
      temServiceKey: Boolean(SERVICE_KEY),
      temVapid: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
    });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, erro: 'metodo nao permitido' });
    }
    if (SECRET && req.headers['x-webhook-secret'] !== SECRET) {
      return res.status(401).json({ ok: false, erro: 'segredo invalido' });
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
    const texto = nome ? nome + ' te enviou uma mensagem' : 'Voce recebeu uma nova mensagem';

    const payload = JSON.stringify({
      title: 'Libido',
      body: texto,
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
    return res.status(500).json({ ok: false, erro: String(e && e.message ? e.message : e) });
  }
}