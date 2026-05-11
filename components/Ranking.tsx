
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, TrendingUp, Award, Crown, User as UserIcon, MapPin, BadgeCheck, ShieldCheck, MessageCircle } from 'lucide-react';
import { User, TrustLevel } from '../types';
import { cache } from '../services/authUtils';
import { fetchLatestProfiles } from '../services/repo';
import { MOCK_USERS } from '../constants';

interface RankingProps {
  onSelectUser?: (user: any) => void;
  onChat?: (user: any) => void;
}

const Ranking: React.FC<RankingProps> = ({ onSelectUser, onChat }) => {
  const [activeTab, setActiveTab ] = useState<'popular' | 'reputation' | 'new' | 'verified'>('popular');
  const [loading, setLoading] = useState(true);

  // Mock users for ranking (In a real app, this would come from an API)
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadRankingData = async () => {
      setLoading(true);
      
      if (activeTab === 'new') {
        try {
          const latest = await fetchLatestProfiles(20);
          console.log(`[Ranking] Encontrados ${latest.filter(p => !p.isMock).length} usuários reais de ${latest.length} totais.`);
          
          const mappedUsers: User[] = latest.map((p, i) => ({
            id: p.id,
            nickname: p.name,
            avatar: p.avatar,
            age: (p as any).age || 18,
            totalLikes: Math.floor(Math.random() * 50),
            totalViews: Math.floor(Math.random() * 200),
            trustLevel: p.trustLevel || TrustLevel.BRONZE,
            verifiedAccount: p.trustLevel === TrustLevel.OURO,
            verificationScore: p.trustLevel === TrustLevel.OURO ? 100 : 30,
            level: 1,
            rank: i + 1,
            city: p.city || 'Matriz',
            neighborhood: p.neighborhood || '',
            bio: p.bio || '',
            serialNumber: p.serialNumber || `000${100+i}`
          } as any));
          setUsers(mappedUsers);
        } catch (e) {
          console.error('[Ranking] Error loading new users:', e);
        }
      } else {
        // Fallback para outros rankings (mock por enquanto, incluindo MOCK_USERS reais para consistência)
        setTimeout(() => {
          const combinedMocks = [...MOCK_USERS].map((u, i) => ({
            ...u,
            totalLikes: 1000 - (i * 100),
            totalViews: 5000 - (i * 500),
            rank: i + 1
          }));

          const extraMocks = Array.from({ length: 10 }).map((_, i) => ({
            id: `extra-${i}`,
            nickname: `Agente ${i + 10}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 200}`,
            age: 20 + Math.floor(Math.random() * 20),
            totalLikes: 500 - (i * 40),
            totalViews: 2000 - (i * 150),
            trustLevel: TrustLevel.BRONZE,
            verifiedAccount: false,
            verificationScore: 50,
            level: 10,
            rank: combinedMocks.length + i + 1,
            serialNumber: `000${200+i}`,
            city: 'Rio de Janeiro',
          } as any));

          setUsers([...combinedMocks, ...extraMocks]);
        }, 800);
      }
      setLoading(false);
    };

    loadRankingData();
  }, [activeTab]);

  const tabs = [
    { id: 'popular', label: 'Em Alta', icon: Flame },
    { id: 'reputation', label: 'Reputação', icon: ShieldCheck },
    { id: 'new', label: 'Novatos', icon: TrendingUp },
    { id: 'verified', label: 'Verificados', icon: BadgeCheck },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* Header com Tabs */}
      <div className="px-4 py-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Trophy className="text-amber-500" /> Rankings do Momento
        </h2>
        
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl whitespace-nowrap transition-all duration-300 font-black text-[9px] uppercase tracking-wider ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Ranking */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-900/30 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectUser?.(user.id)}
                className="relative group bg-slate-900/40 border border-slate-800/50 rounded-3xl p-3 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer overflow-hidden"
              >
                {/* Indicador de Rank */}
                <div className="w-8 flex flex-col items-center justify-center">
                  {index === 0 && <Crown className="text-amber-500 mb-0.5" size={16} />}
                  <span className={`font-black italic text-lg ${
                    index === 0 ? 'text-amber-500' : 
                    index === 1 ? 'text-slate-300' : 
                    index === 2 ? 'text-amber-700' : 'text-slate-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${
                    index === 0 ? 'border-amber-500' : 'border-slate-800'
                  }`}>
                    <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  {user.verifiedAccount && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 border-2 border-[#050505]">
                      <BadgeCheck size={10} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white truncate">{user.nickname}</span>
                    <span className="text-[8px] font-black font-mono text-amber-500/60 tracking-wider">#{user.serialNumber || '000000'}</span>
                    <span className="text-[10px] text-slate-500 font-mono italic">{user.age}y</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                      <MapPin size={10} />
                      {user.city}
                    </div>
                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      user.trustLevel === TrustLevel.OURO ? 'bg-amber-500/10 text-amber-500' :
                      user.trustLevel === TrustLevel.PRATA ? 'bg-slate-400/10 text-slate-400' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {user.trustLevel}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-pink font-black text-xs">
                      <Flame size={12} fill="currentColor" />
                      {user.totalLikes?.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-tighter">
                      {user.totalViews?.toLocaleString()} visitas
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onChat?.(user);
                    }}
                    className="p-3 bg-white/5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 rounded-2xl transition-all active:scale-90"
                    title="Conversar"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>

                {/* Efeito de destaque para o TOP 1 */}
                {index === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
