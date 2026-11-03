/**
 * Moderacao do chat: exclusao estilo WhatsApp + midia de visualizacao unica.
 * Toda regra e aplicada no banco (RPC + RLS). Este modulo apenas chama as funcoes.
 */
import { supabase } from "./supabase";

export type ConversaResumo = {
  peerId: string;
  ultimaMensagem: string;
  ultimaEm: string;
  ultimoDe: string;
  naoLidas: number;
  midiaPendente: boolean;
};

export type MensagemServidor = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  status: string | null;
  delivered_at: string | null;
  read_at: string | null;
  media_url: string | null;
  media_type: string | null;
  view_once: boolean;
  viewed_at: string | null;
  apagada_para_todos: boolean;
  apagada_em: string | null;
  midia_disponivel: boolean;
};

function comoErro(e: unknown): Error {
  if (e && typeof e === "object" && "message" in e) {
    return new Error(String((e as { message: unknown }).message));
  }
  return new Error(String(e));
}

function linhas(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data) return [data];
  return [];
}

export async function listarConversas(): Promise<ConversaResumo[]> {
  const r = await supabase.rpc("listar_conversas");
  if (r.error) throw comoErro(r.error);
  return linhas(r.data).map((x) => ({
    peerId: String(x.peer_id),
    ultimaMensagem: String(x.ultima_mensagem == null ? "" : x.ultima_mensagem),
    ultimaEm: String(x.ultima_em == null ? "" : x.ultima_em),
    ultimoDe: String(x.ultimo_de == null ? "" : x.ultimo_de),
    naoLidas: Number(x.nao_lidas == null ? 0 : x.nao_lidas),
    midiaPendente: Boolean(x.midia_pendente),
  }));
}

export async function listarMensagens(peerId: string, limite = 300): Promise<MensagemServidor[]> {
  const r = await supabase.rpc("listar_mensagens", { p_peer: peerId, p_limit: limite });
  if (r.error) throw comoErro(r.error);
  return linhas(r.data).map((x) => ({
    id: String(x.id),
    sender_id: String(x.sender_id),
    receiver_id: String(x.receiver_id),
    content: String(x.content == null ? "" : x.content),
    created_at: String(x.created_at),
    status: x.status == null ? null : String(x.status),
    delivered_at: x.delivered_at == null ? null : String(x.delivered_at),
    read_at: x.read_at == null ? null : String(x.read_at),
    media_url: x.media_url == null ? null : String(x.media_url),
    media_type: x.media_type == null ? null : String(x.media_type),
    view_once: Boolean(x.view_once),
    viewed_at: x.viewed_at == null ? null : String(x.viewed_at),
    apagada_para_todos: Boolean(x.apagada_para_todos),
    apagada_em: x.apagada_em == null ? null : String(x.apagada_em),
    midia_disponivel: Boolean(x.midia_disponivel),
  }));
}

export async function apagarParaMim(messageId: string): Promise<boolean> {
  const r = await supabase.rpc("apagar_para_mim", { p_message: String(messageId) });
  if (r.error) throw comoErro(r.error);
  return r.data === true;
}

export async function apagarParaTodos(messageId: string): Promise<boolean> {
  const r = await supabase.rpc("apagar_para_todos", { p_message: String(messageId) });
  if (r.error) throw comoErro(r.error);
  return r.data === true;
}

export async function limparConversa(peerId: string): Promise<void> {
  const r = await supabase.rpc("limpar_conversa", { p_peer: peerId, p_ocultar: false });
  if (r.error) throw comoErro(r.error);
}

export async function apagarConversa(peerId: string): Promise<void> {
  const r = await supabase.rpc("limpar_conversa", { p_peer: peerId, p_ocultar: true });
  if (r.error) throw comoErro(r.error);
}

export async function abrirMidiaUnica(
  messageId: string
): Promise<{ url: string | null; jaAberta: boolean }> {
  const r = await supabase.rpc("abrir_midia_unica", { p_message: String(messageId) });
  if (r.error) throw comoErro(r.error);
  const x = linhas(r.data)[0];
  return {
    url: x && x.url ? String(x.url) : null,
    jaAberta: Boolean(x && x.ja_aberta),
  };
}

export async function confirmarMidiaConsumida(messageId: string): Promise<void> {
  const r = await supabase.rpc("confirmar_midia_consumida", { p_message: String(messageId) });
  if (r.error) {
    console.warn("[midia] falha ao confirmar consumo:", r.error.message);
  }
}

export function podeApagarParaTodos(
  msg: { sender_id?: string; created_at?: string },
  userId: string
): boolean {
  if (!msg || !msg.sender_id || String(msg.sender_id) !== String(userId)) return false;
  if (!msg.created_at) return false;
  const t = new Date(msg.created_at).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 48 * 60 * 60 * 1000;
}