import { isDemoId } from "../demo";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowLeft,
  Send,
  Check,
  CheckCheck,
  Camera,
  Smile,
  Mic,
  Phone,
  MoreVertical,
} from "lucide-react";
import { User, Message } from "../types";
import { ProtectedImage } from "./ProtectedImage";
import { formatUserNumber } from "../utils/formatUserNumber";
import { listenAllUserMessages, sendMessage } from "../services/chat";
import { getUsersByIds } from "../services/users";
import { markMessagesAsDelivered, markMessagesAsRead } from '../services/chat';
import { playMessageSound } from '../services/sounds';
import { supabase } from "../services/supabase";

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
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  lastMessageTime: number;
}

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  fromMe: boolean;
  status: "sending" | "sent" | "delivered" | "read";
}

function MessageStatus({ status }: { status: string }) {
  if (status === "sending")
    return <Check size={14} className="text-[var(--libido-muted)] opacity-50" />;
  if (status === "sent")
    return <Check size={14} className="text-[var(--libido-muted)] opacity-60" />;
  if (status === "delivered")
    return <CheckCheck size={14} className="text-[var(--libido-muted)] opacity-60" />;
  if (status === "read")
    return <CheckCheck size={14} className="text-[#53bdeb]" />;
  return null;
}

export function Chat({
  userId,
  isPremium,
  currentUser,
  navigate,
  user,
  onShowPremiumModal,
}: ChatProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // CHAT6-FONTE: tamanho da letra ajustavel, salvo no navegador
  const [fontSize, setFontSize] = useState(() =>
    Number(localStorage.getItem("libido_chat_font") || 15)
  );
  // CHAT6-FOTO: estado de envio de foto
  const [sendingPhoto, setSendingPhoto] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastReceivedAt = useRef(0); // SOM-NOVA

  useEffect(() => {
    if (user && (user.id || user.user_id)) {
      setActiveChat(user.user_id || user.id);
    }
  }, [user]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, activeChat]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = listenAllUserMessages(userId, async (messages) => {
      setAllMessages(messages);
      // SOM-NOVA: toca quando chega mensagem nova de outra pessoa
      const recebidas = messages.filter((m) => m.to === userId);
      if (recebidas.length > 0) {
        const maxT = Math.max(...recebidas.map((m) => m.createdAt));
        if (lastReceivedAt.current > 0 && maxT > lastReceivedAt.current) playMessageSound();
        lastReceivedAt.current = maxT;
      }
      const uniqueUserIds = new Set<string>();
      messages.forEach((m) => {
        if (m.from !== userId) uniqueUserIds.add(m.from);
        if (m.to !== userId) uniqueUserIds.add(m.to);
      });
      const newUsers = await getUsersByIds(Array.from(uniqueUserIds));
      setUsers(newUsers);
    });
    return () => unsubscribe();
  }, [userId]);

  const otherUsers = users.filter((u) => (u.user_id || u.id) !== userId);

  // TICKS-EFEITO: enquanto o chat esta aberto, marca recebidas como entregues
  useEffect(() => {
    if (!userId) return;
    markMessagesAsDelivered(userId);
    const t = setInterval(() => markMessagesAsDelivered(userId), 4000);
    return () => clearInterval(t);
  }, [userId]);

  // TICKS-LEITURA: com a conversa aberta, marca as mensagens recebidas como LIDAS
  useEffect(() => {
    if (!userId || !activeChat) return;
    markMessagesAsRead(userId, activeChat);
  }, [userId, activeChat, allMessages]);

  const contacts: ChatContact[] = otherUsers
    .map((u) => {
      const id = u.user_id || u.id || "";
      const userMsgs = allMessages.filter(
        (m) =>
          (m.from === id && m.to === userId) ||
          (m.to === id && m.from === userId),
      );
      const lastMsg =
        userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null;
      return {
        id,
        name: u.nickname || u.name || "User",
        userNumber: u.userNumber,
        avatar:
          u.photo_url ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
        lastMessage: lastMsg
          ? (lastMsg.text.startsWith("[FOTO]") ? "Foto" : lastMsg.text)
          : "Iniciar conversa",
        time: lastMsg
          ? new Date(lastMsg.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        unread: userMsgs.filter((m) => m.to === userId && m.status !== "read").length,
        online: !!u.isOnline,
        lastMessageTime: lastMsg ? lastMsg.createdAt : 0,
      };
    })
    .filter((c) => c.lastMessageTime > 0 || searchQuery.trim() !== "");

  contacts.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  let activeChatContact = contacts.find((c) => c.id === activeChat);

  // TELA-PRETA-FIX: garante que a conversa aberta sempre tenha um contato (ex: aberta pelo Radar/perfil sem historico)
  if (!activeChatContact && activeChat) {
    const uFb = users.find((u) => (u.user_id || u.id) === activeChat) || ((user && (user.user_id || user.id) === activeChat) ? user : null);
    activeChatContact = {
      id: activeChat,
      name: (uFb as any)?.nickname || (uFb as any)?.name || 'Usuario',
      userNumber: (uFb as any)?.userNumber,
      avatar: (uFb as any)?.photo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback',
      lastMessage: 'Iniciar conversa',
      time: '',
      unread: 0,
      online: !!(uFb as any)?.isOnline,
      lastMessageTime: 0,
    };
  }

  if (!activeChatContact && user && activeChat === (user.user_id || user.id)) {
    activeChatContact = {
      id: user.user_id || user.id,
      name: user.nickname || user.name || "User",
      avatar:
        user.photo_url ||
        "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
      lastMessage: "",
      time: "",
      unread: 0,
      online: !!user.isOnline,
      lastMessageTime: Date.now(),
    };
  }

  const activeChatMessages: ChatMessage[] = allMessages
    .filter(
      (m) =>
        (m.from === activeChat && m.to === userId) ||
        (m.to === activeChat && m.from === userId),
    )
    .map((m) => ({
      id: m.id,
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fromMe: m.from === userId,
      status: (m.status as any) || "sent",
    }));

  const handleSend = async () => {
    if (!messageInput.trim() || !activeChat || !userId) return;
    if (!isPremium) {
      onShowPremiumModal?.();
      return;
    }
    const text = messageInput;
    setMessageInput("");
    await sendMessage({
      from: userId,
      to: activeChat,
      text: text,
      createdAt: Date.now(),
    });
  };

  // CHAT6-FONTE: cicla o tamanho da letra e salva a escolha
  const FONT_SIZES = [13, 15, 17, 19];
  const cycleFont = () => {
    const next = FONT_SIZES[(FONT_SIZES.indexOf(fontSize) + 1) % FONT_SIZES.length];
    setFontSize(next);
    localStorage.setItem("libido_chat_font", String(next));
  };

  // CHAT6-FOTO: sobe a foto no Storage e envia como mensagem [FOTO]url
  const handlePhoto = async (file: File) => {
    if (!userId || !activeChat) return;
    if (isDemoId(activeChat)) return;
    if (!isPremium) {
      onShowPremiumModal?.();
      return;
    }
    setSendingPhoto(true);
    try {
      const path = `${userId}/chat-${Date.now()}-${file.name}`;
      const { error } = await supabase
        .storage
        .from("photos")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("photos").getPublicUrl(path);
      await sendMessage({
        from: userId,
        to: activeChat,
        text: `[FOTO]${data.publicUrl}`,
        createdAt: Date.now(),
      });
    } catch (e: any) {
      alert("Falha ao enviar foto: " + (e?.message || e));
    } finally {
      setSendingPhoto(false);
    }
  };

  if (activeChat && activeChatContact) {
    return (
      <div className="fixed top-0 left-0 w-full h-[100dvh] z-[200] md:static md:w-full md:h-full md:flex-1 md:z-auto flex flex-col bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-hidden pb-[env(safe-area-inset-bottom)] md:pb-0">
        {/* HEADER DA CONVERSA */}
        <div className="flex-none flex items-center gap-3 px-3 py-3 bg-[var(--libido-surface-2)] border-b border-[var(--libido-border)] w-full">
          <button
            onClick={() => setActiveChat(null)}
            className="text-[var(--libido-muted)] opacity-60 hover:text-[var(--libido-text)] p-1 flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative flex-shrink-0">
            <ProtectedImage
              currentUser={currentUser}
              src={activeChatContact.avatar}
              className="w-10 h-10 rounded-full border border-[var(--libido-border)]"
              alt=""
            />
            {activeChatContact.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#12121a]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[var(--libido-text)] truncate">
              {activeChatContact.name}
            </h3>
            <p className="text-[10px] text-[var(--libido-muted)] opacity-60">
              {activeChatContact.online
                ? "online"
                : "visto por ultimo recentemente"}
            </p>
          </div>
          {/* CHAT6-FONTE: botao Aa para mudar o tamanho da letra */}
          <button
            onClick={cycleFont}
            title="Tamanho da letra"
            className="flex-shrink-0 w-9 h-9 rounded-full border border-[var(--libido-border)] text-[11px] font-bold text-[var(--libido-muted)] hover:text-[var(--libido-text)] flex items-center justify-center"
          >
            Aa
          </button>
        </div>
        {/* AREA DE MENSAGENS */}
        <div
          ref={messagesEndRef}
          className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-1.5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(255,179,0,0.02) 0%, transparent 70%)",
          }}
        >
          {isDemoId(activeChat) && (
            <div className="bg-orange-500/20 text-orange-400 text-[10px] font-bold text-center py-2 px-4 rounded-xl border border-orange-500/30 mb-4 mt-2">
              <p className="uppercase tracking-widest">
                Conversa de Demonstracao
              </p>
              <p className="opacity-70 mt-1 font-semibold">
                Respostas automaticas nao estao ativas.
              </p>
            </div>
          )}
          <div className="flex items-center justify-center my-3">
            <span className="bg-[#1a1a2e] text-[var(--libido-muted)] opacity-60 text-[10px] font-bold px-3 py-1 rounded-lg">
              Hoje
            </span>
          </div>
          {activeChatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.fromMe ? "justify-end" : "justify-start"
              } w-full`}
            >
              <div
                className={`max-w-[78%] min-w-0 px-3 py-2 rounded-3xl relative flex-shrink-0 ${
                  msg.fromMe
                    ? "bg-gradient-to-br from-[#7b2ff7] to-[#f107a3] rounded-br-md"
                    : "bg-[#26262e] rounded-bl-md"
                }`}
              >
                {msg.text.startsWith("[FOTO]") ? (
                  <ProtectedImage
                    currentUser={currentUser}
                    src={msg.text.substring(6)}
                    className="w-[220px] max-h-[300px] object-cover rounded-xl mb-1"
                    alt="foto"
                  />
                ) : (
                  <p
                    className="text-[var(--libido-text)]/90 leading-relaxed break-words break-all whitespace-pre-wrap"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {msg.text}
                  </p>
                )}
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    msg.fromMe
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span className="text-[10px] text-[var(--libido-muted)] opacity-50">
                    {msg.time}
                  </span>
                  {msg.fromMe && (
                    <MessageStatus status={msg.status} />
                  )}
                </div>
              </div>
            </div>
          ))}
          {sendingPhoto && (
            <div className="text-center text-[10px] text-[var(--libido-muted)] opacity-70 font-bold">
              Enviando foto...
            </div>
          )}
        </div>
        {/* CAMPO DE ENVIO */}
        <div className="flex-none flex items-center gap-2 px-2 py-2 bg-[var(--libido-bg)] border-t border-[var(--libido-border)] w-full">
          {/* CHAT6-FOTO: camera para enviar foto */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePhoto(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            title="Enviar foto"
            className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-[var(--libido-muted)] hover:text-[var(--libido-text)]"
          >
            <Camera size={20} />
          </button>
          <div className="flex-1 flex items-center bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-3xl px-4 py-2.5 gap-2 min-w-0">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Mensagem"
              className="flex-1 bg-transparent text-[16px] text-[var(--libido-text)] focus:outline-none placeholder:text-[var(--libido-text)]/20 min-w-0"
            />
          </div>
            <button
              onClick={handleSend}
              className="w-11 h-11 bg-[var(--libido-accent)] rounded-full flex items-center justify-center flex-shrink-0 text-black hover:opacity-90 shadow-lg"
            >
              <Send size={16} />
            </button>
        </div>
      </div>
    );
  }
  // TELA DE LISTA DE CONTATOS
  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-hidden">
      {/* HEADER LISTA */}
      <div className="flex-none px-5 pt-5 pb-3 w-full">
        <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">
          Conversas
        </h1>
        <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">
          Criptografia Ponta-a-Ponta
        </p>
      </div>
      <div className="flex-none px-4 pb-3 w-full">
        <div className="flex items-center gap-2 bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-2xl px-4 py-2.5">
          <Search
            size={14}
            className="text-[var(--libido-muted)] opacity-50 flex-shrink-0"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar conversas..."
            className="flex-1 bg-transparent text-[16px] text-[var(--libido-text)] focus:outline-none placeholder:text-[var(--libido-text)]/20"
          />
        </div>
      </div>
      {/* AREA DE LISTA CONTATOS */}
      <div className="flex-1 overflow-y-auto no-scrollbar w-full">
        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => setActiveChat(contact.id)}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] text-left"
          >
            <div className="relative flex-shrink-0">
              <ProtectedImage
                currentUser={currentUser}
                src={contact.avatar}
                className="w-12 h-12 rounded-full border border-[var(--libido-border)]"
                alt=""
              />
              {contact.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--libido-bg)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between min-w-0">
                <h3 className="text-[13px] font-bold text-[var(--libido-text)] truncate">
                  {contact.name}
                  {contact.userNumber ? (
                    <span className="text-[10px] text-[var(--libido-muted)] opacity-50 ml-1">
                      #{formatUserNumber(contact.userNumber)}
                    </span>
                  ) : null}
                </h3>
                <span
                  className={`text-[10px] flex-shrink-0 ml-2 ${
                    contact.unread > 0
                      ? "text-[var(--libido-accent)] font-bold"
                      : "text-[var(--libido-muted)] opacity-50"
                  }`}
                >
                  {contact.time}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5 min-w-0">
                <p className={`text-[11px] truncate flex-1 mr-2 min-w-0 ${contact.unread > 0 ? "text-[var(--libido-text)] font-bold" : "text-[var(--libido-muted)] opacity-60"}`}>
                  {contact.lastMessage}
                </p>
                {contact.unread > 0 && (
                  <span className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 flex-shrink-0">
                    {contact.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
