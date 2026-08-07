import { useState, useEffect } from 'react';
import { Trophy, Crown, Lock } from 'lucide-react';
import { getAllUsers } from '../services/users';
import { User } from '../types';
import { ProtectedImage } from './ProtectedImage';

interface TopProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
  userId?: string;
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';

export function Top({ isPremium, onShowPremiumModal, userId }: TopProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    getAllUsers().then(fetchedUsers => {
      setUsers(fetchedUsers);
      if (userId) {
        const current = fetchedUsers.find(u => u.user_id === userId || u.id === userId);
        if (current) setCurrentUser(current);
      }
    });
  }, [userId]);

  const topRanked = [...users]
    .filter(u => !u.isBanned && !u.isDeleted)
    .sort((a, b) => (b.followers || 0) - (a.followers || 0));

  const handleProfileClick = (targetId: string) => {
    if (!isPremium && currentUser && targetId !== (currentUser.user_id || currentUser.id)) { 
       onShowPremiumModal?.(); 
       return;
    }
    console.log('View top user profile', targetId);
  };

  return (
    <div className="flex flex-col min-h-0 w-full overflow-y-auto no-scrollbar pb-[40px]">
      <div className="px-4 py-6 text-center">
        <h2 className="text-2xl font-fraunces font-medium text-[var(--libido-text)] mb-2 flex items-center justify-center gap-2">
           <Trophy className="text-[var(--libido-accent)]" size={28} />
           Global Rankings
        </h2>
        <p className="text-[var(--libido-muted)] text-sm">Os agentes mais populares e requisitados da plataforma.</p>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {topRanked.map((user, idx) => {
          const bgClass = idx === 0 ? "bg-gradient-to-r from-[var(--libido-accent)]/20 to-[var(--libido-surface)]" : (idx === 1 ? "bg-gradient-to-r from-gray-300/20 to-[var(--libido-surface)]" : (idx === 2 ? "bg-gradient-to-r from-amber-700/20 to-[var(--libido-surface)]" : "bg-[var(--libido-surface)]"));
          
          const id = user.user_id || user.id || `temp-${idx}`;

          return (
            <div key={id} className={`flex items-center gap-4 ${bgClass} border border-[var(--libido-border)] rounded-2xl p-3 relative cursor-pointer hover:border-[var(--libido-border)] transition-colors`} onClick={() => handleProfileClick(id)}>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#0b0b0b] font-black text-[12px] ${idx === 0 ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] shadow-[0_0_10px_rgba(255,179,0,0.5)]' : (idx === 1 ? 'bg-gray-300 text-black' : (idx === 2 ? 'bg-amber-700 text-[var(--libido-text)]' : 'bg-[var(--libido-border)] text-[var(--libido-muted)]'))}`}>
                  #{idx + 1}
                </div>
              </div>

              <div className="relative pl-4 shrink-0">
                <ProtectedImage currentUser={currentUser} src={user.photo_url || DEFAULT_AVATAR} className="w-14 h-14 rounded-full border-[2px] border-[var(--libido-border)]" alt="avatar" />
                {idx === 0 && <Crown className="absolute -top-3 -right-1 text-[var(--libido-accent)] drop-shadow-[0_0_5px_rgba(255,179,0,0.8)]" fill="var(--libido-accent)" size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--libido-text)] text-[15px] truncate flex items-center gap-1.5">
                  {user.nickname || user.name || 'User'}
                </h3>
                <p className="text-[var(--libido-muted)] text-[12px] truncate">@{user.username || user.nickname || 'user'}</p>
              </div>

              <div className="shrink-0 text-right pr-2">
                 <p className="text-[var(--libido-accent)] font-bold text-[14px] flex items-center justify-end gap-1">
                    {user.followers || 0}
                 </p>
                 <p className="text-[#666] text-[10px] font-medium tracking-wide uppercase">Seguidores</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
