// PUSH: notificacao com o app fechado (PWA + Web Push)
import { Router } from "express";

const router = Router();

// LIMPEZA: remove \n, \r, espacos e invisiveis das variaveis de ambiente
function limpar(v: any): string {
  if (!v) return "";
  return String(v)
    .replace(/\\n|\\r/g, "")
    .replace(/[\s\u200B-\u200D\uFEFF]/g, "");
}

const SUPABASE_URL = limpar(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
const SERVICE_KEY = limpar(process.env.SUPABASE_SERVICE_ROLE_KEY);
const SECRET = limpar(process.env.PUSH_WEBHOOK_SECRET);
const VAPID_PUBLIC = limpar(process.env.VAPID_PUBLIC_KEY);
const VAPID_PRIVATE = limpar(process.env.VAPID_PRIVATE_KEY);
const ORIGEM = "https://www.libidoapp.com.br";

let wpCache: any = null;
let erroCache: string | null = null;
let tentou = false;

async function carregarWebPush(): Promise<any> {
  if (tentou) return wpCache;
  tentou = true;
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

function urlBase(): string {
  return SUPABASE_URL.replace(/\/+$/, "");
}

// SAUDE: so responde com segredo. Nao expoe host, chave nem erro do banco.
router.get("/", async (req: any, res: any) => {
  if (SECRET && req.headers["x-webhook-secret"] !== SECRET) {
    return res.status(401).json({ ok: false, erro: "segredo invalido" });
  }
  const wp = await carregarWebPush();
  return res.status(200).json({
    ok: true,
    rota: "express",
    webPush: Boolean(wp),
    supabase: Boolean(urlBase() && SERVICE_KEY),
    vapid: Boolean(VAPID_PUBLIC && VAPID_PRIVATE),
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
    if (!urlBase() || !SERVICE_KEY) {
      return res.status(200).json({ ok: false, motivo: "variaveis do Supabase ausentes" });
    }

    const corpo = req.body || {};
    const destinatario = corpo.receiver_id || (corpo.record && corpo.record.receiver_id) || null;
    const remetente = corpo.sender_id || (corpo.record && corpo.record.sender_id) || null;

    if (!destinatario) {
      return res.status(200).json({ ok: false, motivo: "sem receiver_id", chaves: Object.keys(corpo) });
    }

    const r = await fetch(
      urlBase() + "/rest/v1/push_subscriptions?user_id=eq." +
        encodeURIComponent(destinatario) + "&select=endpoint,p256dh,auth",
      { headers: cabecalhos() as any }
    );

    if (!r.ok) {
      let detalhe = "";
      try { detalhe = ((await r.text()) || "").slice(0, 200); } catch {}
      return res.status(200).json({ ok: false, motivo: "falha ao ler inscricoes", status: r.status, detalhe });
    }

    const inscricoes: any = await r.json();
    if (!Array.isArray(inscricoes) || inscricoes.length === 0) {
      return res.status(200).json({ ok: true, enviados: 0, motivo: "usuario sem inscricao ativa" });
    }

    let nome = null;
    if (remetente) {
      try {
        const rn = await fetch(
          urlBase() + "/rest/v1/users?user_id=eq." + encodeURIComponent(remetente) + "&select=name,nickname&limit=1",
          { headers: cabecalhos() as any }
        );
        if (rn.ok) {
          const arr: any = await rn.json();
          if (Array.isArray(arr) && arr.length > 0) nome = arr[0].name || arr[0].nickname || null;
        }
      } catch {}
    }

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
            urlBase() + "/rest/v1/push_subscriptions?endpoint=eq." + encodeURIComponent(item.endpoint),
            { method: "DELETE", headers: cabecalhos() as any }
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