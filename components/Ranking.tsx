
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, TrendingUp, Award, Crown, User as UserIcon, MapPin, BadgeCheck, ShieldCheck } from 'lucide-react';
import { User, TrustLevel } from '../types';
import { cache } from '../services/authUtils';

interface RankingProps {
  onSelectUser?: (userId: string) => void;
}

const Ranking: React.FC<RankingProps> = ({ onSelectUser }) => {
  const [activeTab, setActiveTab ] = useState<'popular' | 'reputation' | 'new' | 'verified'>('popular');
  const [loading, setLoading] = useState(true);

  // Mock users for ranking (In a real app, this would come from an API)
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Simulate API fetch based on tab
    setLoading(true);
    setTimeout(() => {
      const mockUsers: User[] = Array.from({ length: 15 }).map((_, i) => ({
        id: `user-${i}`,
        nickname: `Destaque ${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`,
        age: 20 + Math.floor(Math.random() * 20),
        totalLikes: 1000 - (i * 50) + Math.floor(Math.random() * 20),
        totalViews: 5000 - (i * 200),
        trustLevel: i < 3 ? TrustLevel.OURO : i < 7 ? TrustLevel.PRATA : TrustLevel.BRONZE,
        verifiedAccount: i % 3 === 0,
        verificationScore: 70 + Math.floor(Math.random() * 30),
        level: 25 - i,
        rank: i + 1,
        city: 'Rio de Janeiro',
        neighborhood: 'Copacabana',
      } as any));
      setUsers(mockUsers);
      setLoading(false);
    }, 800);
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
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800'
              }`}
            >
              <tab.icon size={14} />
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
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate">{user.nickname}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{user.age}y</span>
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
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-pink font-black text-xs">
                    <Flame size={12} fill="currentColor" />
                    {user.totalLikes?.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-tighter">
                    {user.totalViews?.toLocaleString()} visitas
                  </div>
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
