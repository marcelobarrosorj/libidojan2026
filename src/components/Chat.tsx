import { sanitizarImagem } from '../services/media';
import { isDemoId } from "../demo";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowLeft,
  Send,
  Check,
  CheckCheck,
  Camera,
  Eye,
  EyeOff,
  Smile,
  Mic,
  Phone,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { User, Message } from "../types";
import { ProtectedImage } from "./ProtectedImage";
import { formatUserNumber } from "../utils/formatUserNumber";
import { listenAllUserMessages, sendMessage } from "../services/chat";
import { getUsersByIds } from "../services/users";
import { markMessagesAsDelivered, markMessagesAsRead } from '../services/chat';
import { playMessageSound } from '../services/sounds';
import { supabase } from "../services/supabase";
import { dedupeMensagens } from '../utils/dedupe';

interface ChatProps {
  user?: User;
  userId?: string;
  isPremium?: boolean;
  currentUser?: User | null;
  navigate?: (tab: string, params?: any) => void;
  onShowPremiumModal?: () => void;
}

interface ChatContact {
  userNumber?: number;
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
  online?: boolean;
  isDemo?: boolean;
}

type Confirmacao = { tipo: 'conversa' | 'mensagem'; alvo: string; modo: 'mim' | 'todos' } | null;

export function Chat({ user, userId, isPremium, currentUser, navigate, onShowPremiumModal }: ChatProps) {
  const meuId = userId || currentUser?.id || user?.id || '';

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [menuConversa, setMenuConversa] = useState<string | null>(null);
  const [menuMensagem, setMenuMensagem] = useState<string | null>(null);
  const [fotoAberta, setFotoAberta] = useState<Message | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeContact = contacts.find((c) => c.id === activeChat) || null;

  const activeChatMessages = dedupeMensagens(
    allMessages.filter(
      (m: any) => (m.from === meuId && m.to === activeChat) || (m.from === activeChat && m.to === meuId)
    )
  );

  const contactsFiltrados = busca.trim()
    ? contacts.filter((c) => c.name.toLowerCase().includes(busca.trim().toLowerCase()))
    : contacts;

  function scrollParaFim(force = false) {
    const el = containerRef.current;
    if (!el) return;
    const perto = el.scrollHeight - el.scrollTop - el.clientHeight <= 150;
    if (!perto && !force) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  useEffect(() => {
    if (!meuId) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`from.eq.${meuId},to.eq.${meuId}`)
          .order('created_at', { ascending: false })
          .limit(500);
        if (cancelado) return;
        if (error) throw error;

        const limpas = (data || []).filter((m: any) => m.apagada_para_todos !== true);
        setAllMessages(limpas as Message[]);

        const mapa = new Map<string, ChatContact>();
        for (const m of limpas as any[]) {
          const outro = m.from === meuId ? m.to : m.from;
          if (!outro) continue;
          if (!mapa.has(outro)) {
            mapa.set(outro, {
              id: outro,
              name: outro.slice(0, 8),
              lastMessage: m.content || (m.media_url ? 'Foto' : ''),
              lastMessageTime: m.created_at,
              unread: 0,
            });
          }
          if (m.to === meuId && m.lida !== true) {
            const c = mapa.get(outro)!;
            c.unread = (c.unread || 0) + 1;
          }
        }

        const ids = Array.from(mapa.keys());
        if (ids.length > 0) {
          try {
            const perfis = await getUsersByIds(ids);
            for (const p of perfis || []) {
              const c = mapa.get(p.id);
              if (c) {
                c.name = (p as any).nickname || (p as any).name || c.name;
                c.avatar = (p as any).avatar_url || (p as any).photo_url;
                c.online = (p as any).is_online === true;
              }
            }
          } catch (e) {
            console.error('Erro ao carregar perfis:', e);
          }
        }

        if (!cancelado) setContacts(Array.from(mapa.values()));
      } catch (e: any) {
        if (!cancelado) setErro('Nao foi possivel carregar as conversas.');
        console.error(e);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [meuId]);

  useEffect(() => {
    if (!meuId) return;
    let cancelado = false;

    const parar = listenAllUserMessages(meuId, (msg: Message) => {
      if (cancelado) return;
      const m: any = msg;
      if (m.apagada_para_todos === true) {
        setAllMessages((prev) => prev.filter((x: any) => x.id !== m.id));
        return;
      }
      setAllMessages((prev) => {
        const semDup = prev.filter((x: any) => x.id !== m.id);
        return [...semDup, m];
      });
      if (m.to === meuId && m.from !== activeChat) {
        try { playMessageSound(); } catch {}
      }
    });

    return () => {
      cancelado = true;
      if (typeof parar === 'function') parar();
    };
  }, [meuId, activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    scrollParaFim(true);
    const pendentes = activeChatMessages.filter((m: any) => m.to === meuId && m.lida !== true);
    if (pendentes.length > 0) {
      markMessagesAsRead(meuId, activeChat).catch(() => {});
    }
  }, [activeChat, activeChatMessages.length]);

  async function enviar() {
    const texto = messageInput.trim();
    if (!texto || !activeChat || !meuId || enviando) return;

    if (isPremium === false) {
      const u: any = currentUser || user || {};
      const motivo = u.is_banned === true
        ? 'Sua conta esta suspensa. Fale com o suporte.'
        : u.is_deleted === true
        ? 'Sua conta foi excluida. Crie uma nova ou fale com o suporte.'
        : 'Seu acesso premium nao esta ativo. Ative com um convite ou assinatura.';
      alert(motivo);
      onShowPremiumModal?.();
      return;
    }

    setMessageInput('');
    setEnviando(true);
    try {
      await sendMessage(meuId, activeChat, texto);
      scrollParaFim(true);
    } catch (e: any) {
      setMessageInput(texto);
      alert('Nao foi possivel enviar. Verifique sua conexao.');
      console.error(e);
    } finally {
      setEnviando(false);
    }
  }

  async function abrirFoto(msg: Message) {
    const m: any = msg;
    setFotoAberta(msg);
    if (m.view_once === true && m.id && m.to === meuId && !m.viewed_at) {
      try {
        const agora = new Date().toISOString();
        await supabase.from('messages').update({ viewed_at: agora }).eq('id', m.id);
        setAllMessages((prev) => prev.map((x: any) => (x.id === m.id ? { ...x, viewed_at: agora } : x)));
      } catch (e) {
        console.error('Erro ao marcar visualizacao:', e);
      }
    }
  }

  async function executarExclusao() {
    if (!confirmacao) return;
    const { tipo, alvo, modo } = confirmacao;
    setConfirmacao(null);

    try {
      if (tipo === 'conversa') {
        if (modo === 'mim') {
          const { error } = await supabase.from('conversas_ocultas').upsert(
            { user_id: meuId, outro_id: alvo, ocultada_em: new Date().toISOString() },
            { onConflict: 'user_id,outro_id' }
          );
          if (error) throw error;
          setContacts((prev) => prev.filter((c) => c.id !== alvo));
          if (activeChat === alvo) setActiveChat(null);
        } else {
          const { error } = await supabase.from('messages').update({
            apagada_para_todos: true,
            apagada_em: new Date().toISOString(),
            apagada_por: meuId,
          }).or(`and(from.eq.${meuId},to.eq.${alvo}),and(from.eq.${alvo},to.eq.${meuId})`);
          if (error) throw error;
          setAllMessages((prev) => prev.filter((m: any) => m.from !== alvo && m.to !== alvo));
          setContacts((prev) => prev.filter((c) => c.id !== alvo));
          if (activeChat === alvo) setActiveChat(null);
        }
      } else {
        if (modo === 'todos') {
          const { error } = await supabase.from('messages').update({
            apagada_para_todos: true,
            apagada_em: new Date().toISOString(),
            apagada_por: meuId,
          }).eq('id', alvo);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('messages').update({ apagada_para_mim: true }).eq('id', alvo);
          if (error) throw error;
        }
        setAllMessages((prev) => prev.filter((m: any) => m.id !== alvo));
      }
    } catch (e: any) {
      alert('Nao foi possivel apagar agora. Tente novamente.');
      console.error(e);
    }
  }

  if (!activeChat) {
    return (
      <div style={{ background: '#16161a', minHeight: '100%', color: '#fff', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Conversas</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1f1f24', borderRadius: 999, padding: '10px 16px', marginBottom: 16 }}>
          <Search size={18} color="#9ca3af" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar conversa..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 15, outline: 'none' }}
          />
        </div>

        {erro && (
          <div style={{ background: 'rgba(239,68,68,.12)', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 14 }}>
            {erro}
          </div>
        )}

        {carregando && <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Carregando...</div>}

        {!carregando && contactsFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              {busca ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            <p style={{ fontSize: 13 }}>
              {busca ? 'Tente outro nome.' : 'Abra um perfil no radar para comecar.'}
            </p>
          </div>
        )}

        {contactsFiltrados.map((c) => (
          <div key={c.id} style={{ position: 'relative', marginBottom: 8 }}>
            <button
              onClick={() => setActiveChat(c.id)}
              onContextMenu={(e) => { e.preventDefault(); setMenuConversa(c.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: 'none', background: '#1f1f24', color: '#fff', width: '100%', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative', flex: '0 0 auto', width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {c.avatar ? (
                  <ProtectedImage src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  c.name.slice(0, 2).toUpperCase()
                )}
                {c.online && (
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid #1f1f24' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMessage || ''}
                </div>
              </div>
              {(c.unread || 0) > 0 && (
                <span style={{ background: '#ec4899', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                  {c.unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuConversa(c.id)}
              aria-label="Opcoes"
              style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
            >
              <MoreVertical size={18} />
            </button>
            {menuConversa === c.id && (
              <div style={{ position: 'absolute', top: 44, right: 8, background: '#2a2a30', borderRadius: 10, padding: 6, zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,.5)', minWidth: 180 }}>
                <button
                  onClick={() => { setConfirmacao({ tipo: 'conversa', alvo: c.id, modo: 'mim' }); setMenuConversa(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 14, borderRadius: 6 }}
                >
                  <Trash2 size={16} /> Apagar para mim
                </button>
                <button
                  onClick={() => { setConfirmacao({ tipo: 'conversa', alvo: c.id, modo: 'todos' }); setMenuConversa(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#f87171', textAlign: 'left', cursor: 'pointer', fontSize: 14, borderRadius: 6 }}
                >
                  <Trash2 size={16} /> Apagar para todos
                </button>
              </div>
            )}
          </div>
        ))}

        {confirmacao && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
            <div style={{ background: '#1f1f24', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>
                {confirmacao.modo === 'todos' ? 'Apagar para todos?' : 'Apagar para mim?'}
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#9ca3af', lineHeight: 1.5 }}>
                {confirmacao.modo === 'todos'
                  ? 'A conversa sera removida para voce e para a outra pessoa.'
                  : 'A conversa sera removida apenas da sua lista. A outra pessoa continua vendo.'}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmacao(null)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: '#2a2a30', color: '#fff', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={executarExclusao} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: confirmacao.modo === 'todos' ? '#dc2626' : '#7c3aed', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Apagar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: '#16161a', minHeight: '100%', color: '#fff', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderBottom: '1px solid #2a2a30' }}>
        <button onClick={() => setActiveChat(null)} aria-label="Voltar" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <button
          onClick={() => navigate?.('viewprofile', { user: activeContact })}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer', padding: 0 }}
        >
          {activeContact?.name || activeChat.slice(0, 8)}
        </button>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeChatMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontSize: 14 }}>
            Nenhuma mensagem ainda. Diga oi.
          </div>
        )}

        {activeChatMessages.map((msg: any) => {
          const minha = msg.from === meuId;
          const temFoto = !!msg.media_url;
          const expirada = msg.view_once === true && msg.viewed_at && !minha;

          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: minha ? 'flex-end' : 'flex-start' }}>
              <div
                onContextMenu={(e) => { e.preventDefault(); setMenuMensagem(msg.id); }}
                style={{ maxWidth: '78%', background: minha ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : '#1f1f24', padding: 10, borderRadius: 14, position: 'relative' }}
              >
                {temFoto && !expirada && (
                  <button onClick={() => abrirFoto(msg)} style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <ProtectedImage src={msg.media_url} alt="foto" style={{ maxWidth: 220, borderRadius: 10, display: 'block' }} />
                    {msg.view_once && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                        <EyeOff size={12} /> ver uma vez
                      </span>
                    )}
                  </button>
                )}

                {expirada && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.7, fontStyle: 'italic' }}>
                    <Eye size={14} /> Foto visualizada
                  </div>
                )}

                {msg.content && <div style={{ fontSize: 15, lineHeight: 1.4 }}>{msg.content}</div>}

                {minha && msg.view_once && msg.viewed_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.8, marginTop: 4, justifyContent: 'flex-end' }}>
                    <CheckCheck size={12} /> visualizada
                  </div>
                )}

                {menuMensagem === msg.id && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#2a2a30', borderRadius: 10, padding: 6, zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,.5)', minWidth: 170 }}>
                    <button
                      onClick={() => { setConfirmacao({ tipo: 'mensagem', alvo: msg.id, modo: 'mim' }); setMenuMensagem(null); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}
                    >
                      <Trash2 size={16} /> Apagar para mim
                    </button>
                    {minha && (
                      <button
                        onClick={() => { setConfirmacao({ tipo: 'mensagem', alvo: msg.id, modo: 'todos' }); setMenuMensagem(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#f87171', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}
                      >
                        <Trash2 size={16} /> Apagar para todos
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #2a2a30' }}>
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="Mensagem..."
          disabled={enviando}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 999, border: 'none', background: '#1f1f24', color: '#fff', fontSize: 15, outline: 'none' }}
        />
        <button
          onClick={enviar}
          disabled={enviando || !messageInput.trim()}
          style={{ padding: '12px 20px', borderRadius: 999, border: 'none', background: enviando || !messageInput.trim() ? '#3a3a42' : 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff', fontWeight: 600, cursor: enviando || !messageInput.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {enviando ? '...' : <><Send size={16} /> Enviar</>}
        </button>
      </div>

      {fotoAberta && (
        <div
          onClick={() => setFotoAberta(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
        >
          <ProtectedImage src={(fotoAberta as any).media_url} alt="foto" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12 }} />
        </div>
      )}

      {confirmacao && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#1f1f24', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>
              {confirmacao.modo === 'todos' ? 'Apagar para todos?' : 'Apagar para mim?'}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#9ca3af', lineHeight: 1.5 }}>
              {confirmacao.modo === 'todos'
                ? 'A mensagem sera removida para voce e para a outra pessoa.'
                : 'A mensagem sera removida apenas para voce.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmacao(null)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: '#2a2a30', color: '#fff', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={executarExclusao} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: confirmacao.modo === 'todos' ? '#dc2626' : '#7c3aed', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;