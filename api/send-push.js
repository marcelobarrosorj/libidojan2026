// PUSH-SEND v3: zero imports estaticos - elimina crash no carregamento
const ORIGEM = 'https://www.libidoapp.com.br';

async function carregarWebPush() {
  try {
    const mod = await import('web-push');
    const wp = mod && mod.default ? mod.default : mod;
    if (!wp || typeof wp.sendNotification !== 'function') {
      return { wp: null, erro: 'modulo carregado mas sem sendNotification' };
    }
    return { wp: wp, erro: null };
  } catch (e) {
    return { wp: null, erro: String((e && e.message) || e) };
  }
}

function cabecalhos(chave) {
  return { apikey: chave, Authorization: 'Bearer ' + chave };
}

export default async function handler(req, res) {
  const urlSupabase = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const secret = process.env.PUSH_WEBHOOK_SECRET || '';
  const vapidPub = process.env.VAPID_PUBLIC_KEY || '';
  const vapidPriv = process.env.VAPID_PRIVATE_KEY || '';

  const carregado = await carregarWebPush();
  const wp = carregado.wp;
  const erro = carregado.erro;

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      versao: 'v3',
      rota: 'ativa',
      node: process.version,
      temUrlSupabase: Boolean(urlSupabase),
      temServiceKey: Boolean(serviceKey),
      temVapid: Boolean(vapidPub && vapidPriv),
      webPushCarregou: Boolean(wp),
      erroWebPush: erro
    });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, erro: 'metodo nao permitido' });
    }
    if (secret && req.headers['x-webhook-secret'] !== secret) {
      return res.status(401).json({ ok: false, erro: 'segredo invalido' });
    }
    if (!wp) {
      return res.status(200).json({ ok: false, motivo: 'web-push indisponivel', erro: erro });
    }
    if (!urlSupabase || !serviceKey) {
      return res.status(200).json({ ok: false, motivo: 'variaveis do Supabase ausentes' });
    }
    if (!vapidPub || !vapidPriv) {
      return res.status(200).json({ ok: false, motivo: 'VAPID ausente' });
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

    wp.setVapidDetails('mailto:libidoapp@gmail.com', vapidPub, vapidPriv);

    const url = urlSupabase + '/rest/v1/push_subscriptions?user_id=eq.' + encodeURIComponent(destinatario) + '&select=endpoint,p256dh,auth';
    const r = await fetch(url, { headers: cabecalhos(serviceKey) });
    if (!r.ok) {
      return res.status(200).json({ ok: false, motivo: 'falha ao ler inscricoes', status: r.status });
    }

    const inscricoes = await r.json();
    if (!Array.isArray(inscricoes) || inscricoes.length === 0) {
      return res.status(200).json({ ok: true, enviados: 0, motivo: 'usuario sem inscricao ativa' });
    }

    let nome = null;
    if (remetente) {
      try {
        const rn = await fetch(
          urlSupabase + '/rest/v1/users?user_id=eq.' + encodeURIComponent(remetente) + '&select=name,nickname&limit=1',
          { headers: cabecalhos(serviceKey) }
        );
        if (rn.ok) {
          const arr = await rn.json();
          if (Array.isArray(arr) && arr.length > 0) {
            nome = arr[0].name || arr[0].nickname || null;
          }
        }
      } catch (e) {}
    }

    const payload = JSON.stringify({
      title: 'Libido',
      body: nome ? nome + ' te enviou uma mensagem' : 'Voce recebeu uma nova mensagem',
      url: ORIGEM + '/'
    });

    let enviados = 0;
    for (let i = 0; i < inscricoes.length; i++) {
      const item = inscricoes[i];
      try {
        await wp.sendNotification(
          { endpoint: item.endpoint, keys: { p256dh: item.p256dh, auth: item.auth } },
          payload
        );
        enviados++;
      } catch (e) {
        const st = e && e.statusCode ? e.statusCode : 0;
        if (st === 404 || st === 410) {
          await fetch(
            urlSupabase + '/rest/v1/push_subscriptions?endpoint=eq.' + encodeURIComponent(item.endpoint),
            { method: 'DELETE', headers: cabecalhos(serviceKey) }
          );
        }
      }
    }

    return res.status(200).json({ ok: true, enviados: enviados, inscricoes: inscricoes.length });
  } catch (e) {
    return res.status(200).json({ ok: false, motivo: 'excecao', erro: String((e && e.message) || e) });
  }
}