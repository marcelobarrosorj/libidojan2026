
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';
import { User, Plan } from '../types';
import { MessageCircle, Heart, Search, Filter, Sparkles, ChevronRight, X, Check, Lock } from 'lucide-react';
import { showNotification, cache } from '../services/authUtils';

interface ChatListProps {
  onSelectUser: (user: User) => void;
  onNavigateToSubscription?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectUser, onNavigateToSubscription }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const userPlan = cache.userData?.plan || Plan.FREE;
  const isPremium = userPlan !== Plan.FREE;

  const matches = MOCK_USERS.filter(u => {
    return u.id !== 'me' && u.nickname.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar conexões..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mensagens Recentes</h3>
        <div className="space-y-3 pb-24">
          {matches.map((user, idx) => {
            // Paywall no Chat: Usuários free só acessam os 2 primeiros chats ativos
            const isChatLocked = !isPremium && idx >= 2;

            return (
              <div 
                key={user.id} 
                onClick={() => isChatLocked ? onNavigateToSubscription?.() : onSelectUser(user)}
                className={`glass-card p-4 rounded-[2rem] flex items-center gap-4 transition-all relative overflow-hidden ${
                  isChatLocked ? 'opacity-40 grayscale blur-[1px]' : 'hover:bg-slate-800/50 cursor-pointer'
                }`}
              >
                <div className="relative">
                  <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover" />
                  {!isChatLocked && idx === 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{isChatLocked ? 'Chat Bloqueado' : user.nickname}</h4>
                  </div>
                  <p className="text-xs text-slate-400 truncate italic">
                    {isChatLocked ? "Sincronize sua matriz para ler" : "Olá! Adorei sua vibe no radar."}
                  </p>
                </div>
                {isChatLocked ? <Lock size={16} className="text-pink" /> : <MessageCircle size={16} className="text-slate-700" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
