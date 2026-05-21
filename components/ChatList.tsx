import React, { useState, useEffect } from 'react';
import { User, PresenceStatus } from '../types';
import { MessageCircle, Heart, Search, Lock, Sparkles, MessageSquare } from 'lucide-react';
import { showNotification, cache, isPremiumUser, isOwner } from '../services/authUtils';
import { PresenceBadge } from './common/PresenceBadge';
import { fetchLatestProfiles } from '../services/repo';
import { fetchRecentConversations, RecentChat } from '../services/chatService';

interface ChatListProps {
  onSelectUser: (user: User) => void;
  onNavigateToSubscription?: () => void;
  currentUser: User | null;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectUser, onNavigateToSubscription, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<RecentChat[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isPremium = isPremiumUser(currentUser);
  const ownerMode = isOwner(currentUser);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        let recent: RecentChat[] = [];
        if (currentUser?.id) {
          recent = await fetchRecentConversations(currentUser.id);
        }
        
        const latestProfiles = await fetchLatestProfiles(30);
        
        if (active) {
          setConversations(recent);
          
          const activeContactIds = new Set(recent.map(c => c.user.id));
          const recs = (latestProfiles as any[]).filter(p => !activeContactIds.has(p.id) && p.id !== currentUser?.id);
          setRecommendedUsers(recs);
        }
      } catch (e) {
        console.error('[CHAT_LIST] Erro ao obter dados do chat:', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();

    // Polling rápido e seguro de sincronia instantânea
    const pollInterval = setInterval(loadData, 4000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [currentUser?.id]);

  const filteredConversations = conversations.filter(c => {
    const nick = c.user.nickname || '';
    return nick.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredRecommended = filteredRecommendedUsers();

  function filteredRecommendedUsers(): User[] {
    return recommendedUsers.filter(u => {
      const nick = u.nickname || '';
      return nick.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  return (
    <div className="p-4 space-y-6">
      {/* Barra de Busca de Conexões */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar conexões ou usuários..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
        />
      </div>

      {/* SESSÃO 1: CONVERSAS RECENTES (ATIVAS NO SUPABASE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversas Ativas</h3>
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full">Sincronizado</span>
        </div>

        {filteredConversations.length > 0 ? (
          <div className="space-y-3">
            {filteredConversations.map((chat, idx) => {
              // Paywall no Chat: Usuários free só acessam os 2 primeiros chats ativos
              const isChatLocked = !ownerMode && !isPremium && idx >= 2;
              const contactUser = chat.user;

              return (
                <div 
                  key={contactUser.id} 
                  onClick={() => isChatLocked ? onNavigateToSubscription?.() : onSelectUser(contactUser)}
                  className={`glass-card p-4 rounded-[2.5rem] flex items-center gap-4 transition-all relative overflow-hidden group ${
                    isChatLocked ? 'opacity-40 grayscale blur-[1px]' : 'hover:bg-slate-800/50 cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/5">
                      <img src={contactUser.avatar || undefined} className="w-full h-full object-cover" alt={contactUser.nickname} />
                    </div>
                    {!isChatLocked && (
                      <PresenceBadge 
                        status={contactUser.status || (contactUser.isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE)} 
                        size="sm" 
                        className="absolute -top-1 -right-1 z-10" 
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-white truncate italic">{isChatLocked ? 'Canal Encriptado' : contactUser.nickname}</h4>
                      {!isChatLocked && <span className="text-[8px] font-black text-amber-500 uppercase">{chat.timeLabel}</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate font-medium">
                      {isChatLocked ? "Sincronize sua matriz para ler" : chat.lastMessage}
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
        ) : (
          !isLoading && (
            <div className="py-6 text-center border border-white/5 bg-slate-900/10 rounded-[2.5rem] p-4 text-slate-500 italic text-xs">
              Nenhuma conversa ativa na matriz. Toque em um perfil recomendado para iniciar!
            </div>
          )
        )}
      </div>

      {/* SESSÃO 2: INICIAR NOVO PAPO (RECOMENDADOS ADICIONAIS) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Iniciar Nova Conversa</h3>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-full">Explore</span>
        </div>

        <div className="space-y-3 pb-24">
          {filteredRecommended.length > 0 ? (
            filteredRecommended.map((user, idx) => {
              // Mantém regra de paywall para recomendados ativos extras se necessário, ou libera a abertura e cobra dentro
              const isChatLocked = !ownerMode && !isPremium && (filteredConversations.length + idx) >= 2;

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
                        status={user.status || (user.isOnline ? PresenceStatus.ONLINE : PresenceStatus.OFFLINE)} 
                        size="sm" 
                        className="absolute -top-1 -right-1 z-10" 
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-white truncate italic">{isChatLocked ? 'Canal Encriptado' : user.nickname}</h4>
                      {!isChatLocked && <span className="text-[8px] font-black text-amber-500 uppercase">Novo</span>}
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
                      <MessageSquare size={16} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-600 italic text-xs">
              Nenhuma nova conexão sugerida no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
