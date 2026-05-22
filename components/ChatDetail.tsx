
import React, { useState, useEffect, useRef } from 'react';
import { User, PresenceStatus } from '../types';
import VerificationGate from './VerificationGate';
import { ReportModal } from './ReportModal';
import { PresenceBadge } from './common/PresenceBadge';
import { 
  ChevronLeft, Send, MoreVertical, ShieldCheck, Loader2, Flag, UserX, X, ShieldAlert,
  Clock, Image as ImageIcon, EyeOff, Timer, Check, CheckCheck
} from 'lucide-react';
import { log, handleButtonAction, showNotification, isOwner } from '../services/authUtils';
import { soundService } from '../services/soundService';
import { CONFIG } from '../config';
import { sendMessage, fetchMessages, updateMessageContent, deleteMessagePhysical, subscribeToMessages, markMessagesAsRead } from '../services/chatService';

interface ChatDetailProps {
  user: User;
  currentUser: User | null;
  onBack: () => void;
}

interface Message {
  id: string;
  text?: string;
  image?: string;
  from: 'me' | 'them';
  time: string;
  isSelfDestruct?: boolean;
  isViewed?: boolean;
  is_read?: boolean;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ user, currentUser, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sincronização em tempo real e busca de mensagens via banco de dados
  useEffect(() => {
    if (!currentUser || !user) return;

    let active = true;

    const load = async () => {
      await markMessagesAsRead(currentUser.id, user.id);
      const fetched = await fetchMessages(currentUser.id, user.id);
      if (active) {
        setMessages(fetched as any);
      }
    };

    load();

    // 1. Inicia escuta em tempo real via canal Supabase
    const unsubscribe = subscribeToMessages(currentUser.id, user.id, (newMsg) => {
      if (!active) return;
      setMessages(prev => {
        const exists = prev.some(m => m.id === newMsg.id);
        if (exists) {
          return prev.map(m => m.id === newMsg.id ? (newMsg as any) : m);
        }
        // Se for mensagem de outro usuário, reproduz som imediático de recebido e marca como lida
        if (newMsg.from === 'them') {
          soundService.play('MESSAGE');
          markMessagesAsRead(currentUser.id, user.id);
        }
        return [...prev, newMsg as any];
      });
    });

    // 2. Busca reativa periódica segura (polling de segurança a cada 4 segundos)
    const pollInterval = setInterval(async () => {
      const fetched = await fetchMessages(currentUser.id, user.id);
      if (active) {
        setMessages(prev => {
          // Toca som apenas se detectarmos nova mensagem na consulta que ainda não tínhamos em tela
          const hasNewFromThem = fetched.some(f => f.from === 'them' && !prev.some(p => p.id === f.id));
          if (hasNewFromThem) {
            soundService.play('MESSAGE');
            markMessagesAsRead(currentUser.id, user.id);
          }

          const merged = [...prev];
          fetched.forEach(f => {
            const index = merged.findIndex(m => m.id === f.id);
            if (index !== -1) {
              merged[index] = f as any;
            } else {
              merged.push(f as any);
            }
          });
          return merged.sort((a, b) => new Date((a as any).created_at || 0).getTime() - new Date((b as any).created_at || 0).getTime());
        });
      }
    }, 4000);

    return () => {
      active = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [currentUser?.id, user?.id]);

  const handleSend = async (image?: string, isSelfDestruct: boolean = false) => {
    await handleButtonAction(
        'CHAT_SEND_MESSAGE',
        async () => {
            if (!currentUser || !user) return false;
            const textToSend = inputText.trim();
            const success = await sendMessage(currentUser.id, user.id, textToSend, image, isSelfDestruct);
            
            if (success) {
              if (!image) setInputText('');
              // Carregar imediatamente após enviar para atualizar a UI do usuário de forma ágil
              const fetched = await fetchMessages(currentUser.id, user.id);
              setMessages(fetched as any);
              return true;
            } else {
              showNotification('Falha ao enviar mensagem na matriz.', 'error');
              return false;
            }
        },
        {
            validate: () => (inputText.trim().length > 0 || image) && !isProcessing,
            setLoading: setIsProcessing
        }
    );
  };

  const deleteMessage = async (msgId: string) => {
    if (!msgId) return;
    const success = await deleteMessagePhysical(msgId);
    if (success) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      showNotification('Mensagem removida da matriz.', 'info');
    } else {
      showNotification('Não foi possível excluir a mensagem.', 'error');
    }
  };

  const markAsViewed = async (msgId: string, text: string, image: string, isSelfDestruct: boolean) => {
    if (!msgId) return;
    const payload = {
      text: text || '',
      image: image || '',
      isSelfDestruct: isSelfDestruct,
      isViewed: true
    };
    const success = await updateMessageContent(msgId, JSON.stringify(payload));
    if (success) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isViewed: true } : m));
      showNotification('Foto autodestruída com sucesso.', 'info');
    }
  };

  const handleReport = () => {
    setShowReport(true);
    setShowMenu(false);
  };

  const handleBlock = () => {
    showNotification('Usuário bloqueado.', 'error');
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 absolute inset-0 z-[60] animate-in slide-in-from-right duration-300">
      <header className="px-4 py-3 flex items-center justify-between glass-card border-none relative">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 active:scale-95 transition-transform"><ChevronLeft size={24} /></button>
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                <img src={user.avatar || undefined} className="w-full h-full object-cover" alt={user.nickname} />
            </div>
            <PresenceBadge 
                status={user.status || (user.isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE)} 
                size="sm" 
                className="absolute -top-1 -right-1 z-10 shadow-lg" 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white leading-none italic uppercase tracking-tight">{user.nickname}</h3>
              {user.verifiedAccount && <ShieldCheck size={12} className="text-blue-400" />}
            </div>
            <div className="mt-1">
                <PresenceBadge 
                    status={user.status || (user.isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE)} 
                    size="sm" 
                    showText 
                    className="opacity-80" 
                />
            </div>
          </div>
        </div>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical size={20} /></button>
        {showMenu && (
          <div className="absolute top-16 right-4 bg-slate-900 border border-white/5 rounded-2xl p-2 shadow-2xl z-50 animate-in zoom-in-95 min-w-[180px]">
            <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"><ShieldAlert size={14} /> Analisar Matriz</button>
            <button onClick={handleReport} className="w-full flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Flag size={14} /> Denunciar</button>
            <button onClick={handleBlock} className="w-full flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><UserX size={14} /> Bloquear</button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex group items-end gap-2 ${msg.from === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.from === 'me' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'}`}>
              {msg.image ? (
                <div className="space-y-2">
                  {msg.isSelfDestruct && !msg.isViewed && !isOwner(currentUser) ? (
                    <button 
                      onClick={() => markAsViewed(msg.id, msg.text || '', msg.image || '', msg.isSelfDestruct || false)}
                      className="flex flex-col items-center gap-2 p-4 bg-black/20 rounded-xl border border-white/10"
                    >
                      <Timer size={32} className="text-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Foto Temporária (Clique para ver)</span>
                    </button>
                  ) : msg.isViewed && !isOwner(currentUser) ? (
                    <div className="flex flex-col items-center gap-2 p-4 bg-slate-800/40 rounded-xl blur-[1px] opacity-40">
                      <EyeOff size={32} className="text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Mídia Destruída</span>
                    </div>
                  ) : (
                    <div className="relative group/auditor">
                      <img src={msg.image || undefined} className="rounded-xl w-full max-h-60 object-cover" />
                      {isOwner(currentUser) && msg.isSelfDestruct && (
                        <div className="absolute top-2 right-2 bg-rose-500/90 text-[7px] font-black uppercase px-1.5 py-0.5 rounded italic text-white flex items-center gap-1">
                          <ShieldAlert size={8} /> God Bypass
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
              
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] opacity-50 font-medium tracking-tight">{msg.time}</span>
                {msg.from === 'me' && (
                  <span className="flex items-center ml-0.5" title={msg.is_read ? 'Lida' : (msg.id.startsWith('local_') ? 'Enviando...' : 'Entregue')}>
                    {msg.id.startsWith('local_') ? (
                      <Check size={12} className="text-slate-400" />
                    ) : msg.is_read ? (
                      <CheckCheck size={12} className="text-green-400" />
                    ) : (
                      <CheckCheck size={12} className="text-slate-400" />
                    )}
                  </span>
                )}
              </div>
            </div>
            
            {msg.from === 'me' && (
              <button 
                onClick={() => deleteMessage(msg.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-rose-500 transition-opacity mb-2"
                title="Excluir"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-900 text-slate-400 px-4 py-2 rounded-2xl rounded-bl-none text-xs flex gap-1 items-center">
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-900 space-y-3 pb-8">
        <VerificationGate user={currentUser}>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSend('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', true)}
              className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500/10 transition-all active:scale-90"
              title="Enviar Foto Autodestrutiva"
            >
              <Timer size={22} />
            </button>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={isProcessing} placeholder="Sua mensagem..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50" />
            <button onClick={() => handleSend()} disabled={!inputText.trim() || isProcessing} className="w-12 h-12 gradient-purple rounded-xl flex items-center justify-center text-white shadow-lg disabled:opacity-50 disabled:grayscale transition-all">
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </VerificationGate>
      </div>
      <ReportModal 
        isOpen={showReport} 
        onClose={() => setShowReport(false)} 
        reportedUserId={user.id} 
        reportedUserName={user.nickname}
        chatContextId={`chat_${user.id}`}
      />
    </div>
  );
};

export default ChatDetail;
