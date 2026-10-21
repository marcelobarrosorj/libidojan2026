// PUSH: rota de notificacao dentro do Express (infra ja comprovada)
import { Router } from "express";

const router = Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SECRET = process.env.PUSH_WEBHOOK_SECRET || "";
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const ORIGEM = "https://www.libidoapp.com.br";

let wpCache: any = null;
let erroCache: string | null = null;
let tentouCarregar = false;

async function carregarWebPush(): Promise<any> {
  if (tentouCarregar) return wpCache;
  tentouCarregar = true;
  try {
    const mod: any = await import("web-push");
    const wp = mod && mod.default ? mod.default : mod;
    if (!wp || typeof wp.sendNotification !== "function") {
      erroCache = "modulo sem sendNotification";
      return null;
    }
    wp.setVapidDetails("mailto:libidoapp@gmail.com", VAPID_PUBLIC, VAPID_PRIVATE);
    wpCache = wp;
    return wp;
  } catch (e: any) {
    erroCache = String((e && e.message) || e);
    return null;
  }
}

function cabecalhos() {
  return { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY };
}

async function nomeDe(uid: string): Promise<string | null> {
  try {
    const r = await fetch(
      SUPABASE_URL + "/rest/v1/users?user_id=eq." + encodeURIComponent(uid) + "&select=name,nickname&limit=1",
      { headers: cabecalhos() }
    );
    if (!r.ok) return null;
    const arr: any = await r.json();
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[0].name || arr[0].nickname || null;
  } catch {
    return null;
  }
}

// DIAGNOSTICO: abrir no navegador mostra o estado da rota
router.get("/", async (_req, res) => {
  const wp = await carregarWebPush();
  res.status(200).json({
    ok: true,
    rota: "express",
    node: process.version,
    temUrlSupabase: Boolean(SUPABASE_URL),
    temServiceKey: Boolean(SERVICE_KEY),
    temVapid: Boolean(VAPID_PUBLIC && VAPID_PRIVATE),
    webPushCarregou: Boolean(wp),
    erroWebPush: erroCache
  });
});

router.post("/", async (req: any, res: any) => {
  try {
    if (SECRET && req.headers["x-webhook-secret"] !== SECRET) {
      return res.status(401).json({ ok: false, erro: "segredo invalido" });
    }

    const wp = await carregarWebPush();
    if (!wp) {
      return res.status(200).json({ ok: false, motivo: "web-push indisponivel", erro: erroCache });
    }
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(200).json({ ok: false, motivo: "variaveis do Supabase ausentes" });
    }

    const corpo = req.body || {};
    const destinatario = corpo.receiver_id || (corpo.record && corpo.record.receiver_id) || null;
    const remetente = corpo.sender_id || (corpo.record && corpo.record.sender_id) || null;

    if (!destinatario) {
      return res.status(200).json({ ok: false, motivo: "sem receiver_id", chaves: Object.keys(corpo) });
    }
    if (remetente && String(remetente) === String(destinatario)) {
      return res.status(200).json({ ok: true, enviados: 0, motivo: "mensagem para si mesmo" });
    }

    const url =
      SUPABASE_URL +
      "/rest/v1/push_subscriptions?user_id=eq." +
      encodeURIComponent(destinatario) +
      "&select=endpoint,p256dh,auth";

    const r = await fetch(url, { headers: cabecalhos() });
    if (!r.ok) {
      return res.status(200).json({ ok: false, motivo: "falha ao ler inscricoes", status: r.status });
    }

    const inscricoes: any = await r.json();
    if (!Array.isArray(inscricoes) || inscricoes.length === 0) {
      return res.status(200).json({ ok: true, enviados: 0, motivo: "usuario sem inscricao ativa" });
    }

    const nome = remetente ? await nomeDe(remetente) : null;
    const payload = JSON.stringify({
      title: "Libido",
      body: nome ? nome + " te enviou uma mensagem" : "Voce recebeu uma nova mensagem",
      url: ORIGEM + "/"
    });

    let enviados = 0;
    for (const item of inscricoes) {
      try {
        await wp.sendNotification(
          { endpoint: item.endpoint, keys: { p256dh: item.p256dh, auth: item.auth } },
          payload
        );
        enviados++;
      } catch (e: any) {
        const st = e && e.statusCode ? e.statusCode : 0;
        if (st === 404 || st === 410) {
          await fetch(
            SUPABASE_URL + "/rest/v1/push_subscriptions?endpoint=eq." + encodeURIComponent(item.endpoint),
            { method: "DELETE", headers: cabecalhos() }
          );
        }
      }
    }

    return res.status(200).json({ ok: true, enviados, inscricoes: inscricoes.length });
  } catch (e: any) {
    return res.status(200).json({ ok: false, motivo: "excecao", erro: String((e && e.message) || e) });
  }
});

export default router;