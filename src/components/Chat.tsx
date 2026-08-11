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
        id,
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
      text,
      createdAt: Date.now(),
    });
  };

  if (activeChat && activeChatContact) {
    return (
      <div className="flex-1 flex flex-col bg-[var(--libido-bg)] text-[var(--libido-text)] min-h-0 w-full max-w-full overflow-hidden">

        <div className="flex items-center gap-3 px-3 py-3 bg-[var(--libido-surface-2)] border-b border-[var(--libido-border)] flex-shrink-0 w-full">

          <button
            onClick={() => setActiveChat(null)}
            className="text-[var(--libido-muted)] opacity-70 hover:text-[var(--libido-text)] p-1 flex-shrink-0"
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

          <button className="p-1 flex-shrink-0">
            <Phone size={18} />
          </button>

          <button className="p-1 flex-shrink-0">
            <MoreVertical size={18} />
          </button>

        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 min-h-0">
          {activeChatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${
                msg.fromMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 min-w-0 ${
                  msg.fromMe
                    ? "bg-[var(--libido-primary)] text-white"
                    : "bg-[var(--libido-surface-2)] text-[var(--libido-text)]"
                }`}
              >
                <p className="text-sm break-words break-all whitespace-pre-wrap">
                  {msg.text}
                </p>

                <div className="flex justify-end items-center gap-1 mt-1">
                  <span className="text-[10px] opacity-60">
                    {msg.time}
                  </span>

                  {msg.fromMe && (
                    <MessageStatus status={msg.status} />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 p-3 border-t border-[var(--libido-border)] bg-[var(--libido-surface-2)] flex-shrink-0 w-full">

          <button className="p-2 flex-shrink-0">
            <Smile size={20} />
          </button>

          <button className="p-2 flex-shrink-0">
            <Camera size={20} />
          </button>

          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Digite uma mensagem..."
            className="flex-1 min-w-0 bg-transparent text-sm text-[var(--libido-text)] focus:outline-none placeholder:text-[var(--libido-text)]/20"
          />

          {messageInput.trim() ? (
            <button
              onClick={handleSend}
              className="p-2 flex-shrink-0 rounded-full bg-[var(--libido-primary)] text-white"
            >
              <Send size={18} />
            </button>
          ) : (
            <button className="p-2 flex-shrink-0">
              <Mic size={20} />
            </button>
          )}

        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden min-h-0">

      <div className="p-3 border-b border-[var(--libido-border)] flex-shrink-0">
        <div className="flex items-center gap-2 bg-[var(--libido-surface-2)] rounded-xl px-3 py-2">
          <Search size={18} className="flex-shrink-0" />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversas..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">

        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => setActiveChat(contact.id)}
            className="w-full flex items-center gap-3 p-3 hover:bg-[var(--libido-surface-2)]"
          >
            <ProtectedImage
              currentUser={currentUser}
              src={contact.avatar}
              className="w-12 h-12 rounded-full flex-shrink-0"
              alt=""
            />

            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between gap-2">
                <span className="font-semibold truncate">
                  {contact.name}
                </span>

                <span className="text-xs opacity-60 flex-shrink-0">
                  {contact.time}
                </span>
              </div>

              <p className="text-sm opacity-60 truncate">
                {contact.lastMessage}
              </p>
            </div>
          </button>
        ))}

      </div>

    </div>
  );
}