// PUSH: rota de notificacao (Express) + diagnostico de credenciais
import { Router } from "express";
import { createHash } from "node:crypto";

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
const REF_ESPERADO = "hkuwlazwtxwfffnpgfdd";

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

function hostDe(u: string): string {
  try { return new URL(u).host; } catch { return "url_invalida"; }
}

function fpDe(s: string): string {
  if (!s) return "vazia";
  return createHash("sha256").update(s, "utf8").digest("hex").slice(0, 10);
}

async function testarLeitura() {
  const out: any = { status: 0, corpo: "", erro: null };
  if (!urlBase() || !SERVICE_KEY) {
    out.erro = "variaveis ausentes";
    return out;
  }
  try {
    const r = await fetch(urlBase() + "/rest/v1/push_subscriptions?select=user_id&limit=1", {
      headers: cabecalhos() as any
    });
    out.status = r.status;
    try { out.corpo = ((await r.text()) || "").slice(0, 300); } catch {}
  } catch (e: any) {
    out.status = -1;
    out.erro = String((e && e.message) || e);
  }
  return out;
}

router.get("/", async (_req, res) => {
  const wp = await carregarWebPush();
  const leitura = await testarLeitura();
  const host = hostDe(SUPABASE_URL);
  const bruto = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  res.status(200).json({
    ok: true,
    rota: "express-diagnostico",
    node: process.version,
    supabaseHost: host,
    refConfere: host.indexOf(REF_ESPERADO) === 0,
    keyLenBruto: bruto.length,
    keyLenLimpo: SERVICE_KEY.length,
    tinhaLixo: bruto.length !== SERVICE_KEY.length,
    keyFp: fpDe(SERVICE_KEY),
    temVapid: Boolean(VAPID_PUBLIC && VAPID_PRIVATE),
    webPushCarregou: Boolean(wp),
    erroWebPush: erroCache,
    leituraStatus: leitura.status,
    leituraCorpo: leitura.corpo,
    leituraErro: leitura.erro
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

    const url = urlBase() + "/rest/v1/push_subscriptions?user_id=eq." +
      encodeURIComponent(destinatario) + "&select=endpoint,p256dh,auth";

    const r = await fetch(url, { headers: cabecalhos() as any });

    if (!r.ok) {
      let detalhe = "";
      try { detalhe = ((await r.text()) || "").slice(0, 300); } catch {}
      return res.status(200).json({
        ok: false,
        motivo: "falha ao ler inscricoes",
        status: r.status,
        detalhe: detalhe,
        keyLenLimpo: SERVICE_KEY.length,
        keyFp: fpDe(SERVICE_KEY)
      });
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