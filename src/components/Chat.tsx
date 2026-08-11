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
  id: string;
  userNumber?: number;
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
  if (status === "sending") {
    return <Check size={14} className="opacity-50" />;
  }

  if (status === "sent") {
    return <Check size={14} className="opacity-60" />;
  }

  if (status === "delivered") {
    return <CheckCheck size={14} className="opacity-60" />;
  }

  if (status === "read") {
    return <CheckCheck size={14} className="text-[#53bdeb]" />;
  }

  return null;
}

export function Chat({
  userId,
  currentUser,
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

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenAllUserMessages(
      userId,
      async (messages) => {
        setAllMessages(messages);

        const ids = new Set<string>();

        messages.forEach((m) => {
          if (m.from !== userId) ids.add(m.from);
          if (m.to !== userId) ids.add(m.to);
        });

        const loadedUsers = await getUsersByIds(Array.from(ids));

        setUsers(loadedUsers);
      }
    );

    return () => unsubscribe();

  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [allMessages, activeChat]);


  const contacts: ChatContact[] = users
    .filter((u) => (u.id || u.user_id) !== userId)
    .map((u) => {

      const id = u.id || u.user_id || "";

      const msgs = allMessages.filter(
        (m) =>
          (m.from === id && m.to === userId) ||
          (m.to === id && m.from === userId)
      );

      const last = msgs[msgs.length - 1];

      return {
        id,
        userNumber: u.userNumber,
        name: u.nickname || u.name || "Usuário",
        avatar:
          u.photo_url ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        lastMessage: last?.text || "Iniciar conversa",
        time: last
          ? new Date(last.createdAt).toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : "",
        unread: 0,
        online: !!u.isOnline,
        lastMessageTime: last?.createdAt || 0,
      };
    });


  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const activeContact =
    contacts.find((c) => c.id === activeChat) ||
    (user && activeChat === (user.user_id || user.id)
      ? {
          id: user.user_id || user.id,
          name: user.nickname || user.name || "Usuário",
          avatar:
            user.photo_url ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          lastMessage: "",
          time: "",
          unread: 0,
          online: !!user.isOnline,
          lastMessageTime: Date.now(),
        }
      : null);

  const activeMessages: ChatMessage[] = allMessages
    .filter(
      (m) =>
        (m.from === activeChat && m.to === userId) ||
        (m.to === activeChat && m.from === userId)
    )
    .map((m) => ({
      id: m.id,
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString(
        "pt-BR",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
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


  if (activeChat && activeContact) {

    return (
      <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--libido-bg)] text-[var(--libido-text)]">

        <div className="flex items-center gap-3 px-3 py-3 flex-shrink-0 border-b border-[var(--libido-border)] bg-[var(--libido-surface-2)]">

          <button
            onClick={() => setActiveChat(null)}
            className="flex-shrink-0"
          >
            <ArrowLeft size={20}/>
          </button>


          <ProtectedImage
            currentUser={currentUser}
            src={activeContact.avatar}
            className="w-10 h-10 rounded-full flex-shrink-0"
            alt=""
          />


          <div className="flex-1 min-w-0">
            <h3 className="truncate font-bold text-sm">
              {activeContact.name}
            </h3>

            <p className="text-xs opacity-60">
              {activeContact.online
                ? "online"
                : "visto recentemente"}
            </p>
          </div>


          <Phone size={18}/>
          <MoreVertical size={18}/>

        </div>


        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">

          {activeMessages.map((msg)=>(
            <div
              key={msg.id}
              className={`flex ${
                msg.fromMe
                ? "justify-end"
                : "justify-start"
              }`}
            >

              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 break-all whitespace-pre-wrap ${
                  msg.fromMe
                  ? "bg-[var(--libido-primary)] text-white"
                  : "bg-[var(--libido-surface-2)]"
                }`}
              >

                <p className="text-sm">
                  {msg.text}
                </p>

                <div className="flex justify-end items-center gap-1 text-[10px] opacity-70">

                  {msg.time}

                  {msg.fromMe && (
                    <MessageStatus status={msg.status}/>
                  )}

                </div>

              </div>

            </div>
          ))}

          <div ref={messagesEndRef}/>

        </div>


        <div className="flex items-center gap-2 p-3 flex-shrink-0 border-t border-[var(--libido-border)] bg-[var(--libido-surface-2)]">

          <Smile size={20}/>

          <Camera size={20}/>


          <input
            value={messageInput}
            onChange={(e)=>setMessageInput(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") handleSend();
            }}
            placeholder="Digite uma mensagem..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm"
          />


          {messageInput.trim()
          ?
          (
            <button
              onClick={handleSend}
              className="flex-shrink-0"
            >
              <Send size={20}/>
            </button>
          )
          :
          (
            <Mic size={20}/>
          )}

        </div>

      </div>
    );
  }


  return (

    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">

      <div className="p-3 flex-shrink-0 border-b border-[var(--libido-border)]">

        <div className="flex items-center gap-2 bg-[var(--libido-surface-2)] rounded-xl px-3 py-2">

          <Search size={18}/>

          <input
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            placeholder="Buscar conversas..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm"
          />

        </div>

      </div>


      <div className="flex-1 min-h-0 overflow-y-auto">

        {filteredContacts.map((contact)=>(

          <button
            key={contact.id}
            onClick={()=>setActiveChat(contact.id)}
            className="w-full flex items-center gap-3 p-3"
          >

            <ProtectedImage
              currentUser={currentUser}
              src={contact.avatar}
              className="w-12 h-12 rounded-full flex-shrink-0"
              alt=""
            />


            <div className="flex-1 min-w-0 text-left">

              <div className="flex justify-between">

                <span className="truncate font-semibold">
                  {contact.name}
                </span>

                <span className="text-xs opacity-60">
                  {contact.time}
                </span>

              </div>


              <p className="truncate text-sm opacity-60">
                {contact.lastMessage}
              </p>


            </div>

          </button>

        ))}

      </div>


    </div>

  );

}