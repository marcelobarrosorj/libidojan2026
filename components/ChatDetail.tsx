
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { ChevronLeft, Send, MoreVertical, ShieldCheck, Loader2, Flag, UserX, X, ShieldAlert } from 'lucide-react';
import { log, handleButtonAction, showNotification } from '../services/authUtils';
import { soundService } from '../services/soundService';
import { CONFIG } from '../config';

interface ChatDetailProps {
  user: User;
  onBack: () => void;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState([
    { text: "Olá! Vi seu perfil e senti que nossas vibes batem bastante. Topa conversar?", from: 'them', time: '14:20' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    await handleButtonAction(
        'CHAT_SEND_MESSAGE',
        async () => {
            const textToSend = inputText.trim();
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await new Promise(r => setTimeout(r, 600));
            setMessages(prev => [...prev, { text: textToSend, from: 'me', time: timestamp }]);
            setInputText('');
            
            // Simulação de resposta da Matriz
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // GATILHO SONORO: Recebimento de mensagem
                soundService.play('MESSAGE');

                setMessages(prev => [...prev, { 
                    text: "Com certeza! O que mais te chamou atenção?", 
                    from: 'them', 
                    time: replyTime 
                }]);
            }, 2000);
            return true;
        },
        {
            validate: () => inputText.trim().length > 0 && !isProcessing,
            setLoading: setIsProcessing
        }
    );
  };

  const handleReport = () => {
    showNotification(`Denúncia registrada.`, 'info');
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
          <button onClick={onBack} className="p-1 hover:bg-slate-800 rounded-full text-slate-400"><ChevronLeft size={24} /></button>
          <div className="relative">
            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-bold text-white leading-none">{user.nickname}</h3>
              {user.verifiedAccount && <ShieldCheck size={12} className="text-blue-400" />}
            </div>
            <span className="text-[10px] text-green-500 font-medium uppercase tracking-tighter">Sincronizado</span>
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
          <div key={idx} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.from === 'me' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'}`}>
              <p>{msg.text}</p>
              <span className="text-[10px] opacity-50 block text-right mt-1">{msg.time}</span>
            </div>
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
        <div className="flex gap-2">
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} disabled={isProcessing} placeholder="Sua mensagem..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50" />
          <button onClick={handleSend} disabled={!inputText.trim() || isProcessing} className="w-12 h-12 gradient-purple rounded-xl flex items-center justify-center text-white shadow-lg disabled:opacity-50 disabled:grayscale transition-all">
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
