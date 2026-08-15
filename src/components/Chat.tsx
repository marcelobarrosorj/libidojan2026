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

interface ChatProps {
  user?: User;
  userId?: string;
  isPremium?: boolean;
  currentUser?: User | null;
  navigate?: (tab: string, params?: any) => void;
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
    return (
      <Check size={14} className="text-[var(--libido-muted)] opacity-50" />
    );
  if (status === "sent")
    return (
      <Check size={14} className="text-[var(--libido-muted)] opacity-60" />
    );
  if (status === "delivered")
    return (
      <CheckCheck size={14} className="text-[var(--libido-muted)] opacity-60" />
    );
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
}: ChatProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && (user.id || user.user_id)) {
      setActiveChat(user.user_id || user.id);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, activeChat]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenAllUserMessages(userId, async (messages) => {
      setAllMessages(messages);

      // Get unique users from messages
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
        id: id,
        name: u.nickname || u.name || "User",
        userNumber: u.userNumber,
        avatar:
          u.photo_url ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
        lastMessage: lastMsg ? lastMsg.text : "Iniciar conversa",
        time: lastMsg
          ? new Date(lastMsg.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        unread: 0,
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

    const text = messageInput;
    setMessageInput("");

    await sendMessage({
      from: userId,
      to: activeChat,
      text: text,
      createdAt: Date.now(),
    });
  };

  if (activeChat && activeChatContact) {
    return (
      <div className="absolute inset-0 flex flex-col h-full w-full bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-hidden">
        <div className="flex-none flex items-center gap-3 px-3 py-3 bg-[var(--libido-surface-2)] border-b border-[var(--libido-border)] w-full">
          <button
            onClick={() => setActiveChat(null)}
            className="text-[var(--libido-muted)] opacity-70 hover:text-[var(--libido-text)] p-1"
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
                : "visto por último recentemente"}
            </p>
          </div>
          <button className="text-[var(--libido-muted)] opacity-60 hover:text-[var(--libido-text)] p-1 flex-shrink-0">
            <Phone size={18} />
          </button>
          <button className="text-[var(--libido-muted)] opacity-60 hover:text-[var(--libido-text)] p-1 flex-shrink-0">
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar px-3 py-4 space-y-1.5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(255,179,0,0.02) 0%, transparent 70%)",
          }}
        >
          {isDemoId(activeChat) && (
            <div className="bg-orange-500/20 text-orange-400 text-[10px] font-bold text-center py-2 px-4 rounded-xl border border-orange-500/30 mb-4 mt-2">
              <p className="uppercase tracking-widest">
                Conversa de Demonstração
              </p>
              <p className="opacity-70 mt-1 font-semibold">
                Respostas automáticas não estão ativas.
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
              className={`flex ${msg.fromMe ? "justify-end" : "justify-start"} w-full`}
            >
              <div
                className={`max-w-[78%] min-w-0 px-3 py-2 rounded-2xl relative flex-shrink-0 ${
                  msg.fromMe
                    ? "bg-[#1a3a2a] rounded-tr-md"
                    : "bg-[#1a1a2e] rounded-tl-md"
                }`}
              >
                <p className="text-[13px] text-[var(--libido-text)]/90 leading-relaxed break-words break-all whitespace-pre-wrap">
                  {msg.text}
                </p>
                <div
                  className={`flex items-center gap-1 mt-1 ${msg.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <span className="text-[10px] text-[var(--libido-muted)] opacity-50">
                    {msg.time}
                  </span>
                  {msg.fromMe && <MessageStatus status={msg.status} />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-none flex items-center gap-2 px-2 py-2 bg-[var(--libido-bg)] border-t border-[var(--libido-border)] w-full">
          <button className="text-[var(--libido-muted)] opacity-50 hover:text-[var(--libido-text)] p-2 flex-shrink-0">
            <Smile size={22} />
          </button>
          <div className="flex-1 flex items-center bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-3xl px-4 py-2.5 gap-2 min-w-0">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Mensagem"
              className="flex-1 bg-transparent text-sm text-[var(--libido-text)] focus:outline-none placeholder:text-[var(--libido-text)]/20 min-w-0"
            />
            <button className="text-[var(--libido-muted)] opacity-50 hover:text-[var(--libido-text)] flex-shrink-0">
              <Camera size={18} />
            </button>
          </div>
          {messageInput.trim() ? (
            <button
              onClick={handleSend}
              className="w-11 h-11 bg-[var(--libido-accent)] rounded-full flex items-center justify-center flex-shrink-0 text-black hover:opacity-90 shadow-lg"
            >
              <Send size={16} />
            </button>
          ) : (
            <button className="w-11 h-11 bg-[var(--libido-accent)] rounded-full flex items-center justify-center flex-shrink-0 text-black hover:opacity-90 shadow-lg">
              <Mic size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col h-full w-full bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-hidden">
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
            className="flex-1 bg-transparent text-xs text-[var(--libido-text)] focus:outline-none placeholder:text-[var(--libido-text)]/20"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar w-full">
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
                  {contact.name}{" "}
                  {contact.userNumber ? (
                    <span className="text-[10px] text-[var(--libido-muted)] opacity-50 ml-1">
                      #{formatUserNumber(contact.userNumber)}
                    </span>
                  ) : null}
                </h3>
                <span
                  className={`text-[10px] flex-shrink-0 ml-2 ${contact.unread > 0 ? "text-[var(--libido-accent)] font-bold" : "text-[var(--libido-muted)] opacity-50"}`}
                >
                  {contact.time}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5 min-w-0">
                <p className="text-[11px] text-[var(--libido-muted)] opacity-60 truncate flex-1 mr-2 min-w-0">
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