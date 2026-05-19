
import React, { useState, useEffect } from 'react';
import { User, Plan, PresenceStatus } from '../types';
import { MessageCircle, Heart, Search, Filter, Sparkles, ChevronRight, X, Check, Lock } from 'lucide-react';
import { showNotification, cache, isPremiumUser, isOwner } from '../services/authUtils';
import { PresenceBadge } from './common/PresenceBadge';
import { fetchLatestProfiles } from '../services/repo';

interface ChatListProps {
  onSelectUser: (user: User) => void;
  onNavigateToSubscription?: () => void;
  currentUser: User | null;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectUser, onNavigateToSubscription, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [realUsers, setRealUsers] = useState<User[]>([]);
  
  const isPremium = isPremiumUser(currentUser);
  const ownerMode = isOwner(currentUser);

  useEffect(() => {
    const loadUsers = async () => {
      const latest = await fetchLatestProfiles(20);
      setRealUsers(latest as any);
    };
    loadUsers();
  }, []);

  const matches = realUsers.filter(u => {
    const nick = u.nickname || '';
    const search = searchTerm || '';
    return u.id !== currentUser?.id && nick.toLowerCase().includes(search.toLowerCase());
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
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mensagens Recentes</h3>
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full">Matriz Ativa</span>
        </div>
        <div className="space-y-3 pb-24">
          {matches.map((user, idx) => {
            // Paywall no Chat: Usuários free só acessam os 2 primeiros chats ativos
            // Marcello: Bypass total para o proprietário auditor
            const isChatLocked = !ownerMode && !isPremium && idx >= 2;

            return (
              <div 
                key={user.id} 
                onClick={() => isChatLocked ? onNavigateToSubscription?.() : onSelectUser(user)}
                className={`glass-card p-4 rounded-[2.5rem] flex items-center gap-4 transition-all relative overflow-hidden group ${
                  isChatLocked ? 'opacity-40 grayscale blur-[1px]' : 'hover:bg-slate-800/50 cursor-pointer active:scale-[0.98]'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/5">
                    <img src={user.avatar || undefined} className="w-full h-full object-cover" alt={user.nickname} />
                  </div>
                  {!isChatLocked && (
                    <PresenceBadge 
                      status={user.status || PresenceStatus.OFFLINE} 
                      size="sm" 
                      className="absolute -top-1 -right-1 z-10" 
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-white truncate italic">{isChatLocked ? 'Canal Encriptado' : user.nickname}</h4>
                    {!isChatLocked && <span className="text-[7px] font-black text-slate-500 uppercase">2m</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate font-medium">
                    {isChatLocked ? "Sincronize sua matriz para ler" : "Toque para abrir a matriz de chat."}
                  </p>
                </div>
                {isChatLocked ? (
                  <div className="p-3 bg-pink/10 rounded-2xl text-pink">
                    <Lock size={16} />
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 rounded-2xl text-slate-700 group-hover:text-amber-500 transition-colors">
                    <MessageCircle size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
