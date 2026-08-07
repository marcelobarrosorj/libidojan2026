import { Users, Lock, ChevronRight } from 'lucide-react';

interface GroupsProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
}

import { demoGroups } from '../demo';

export function Groups({ isPremium, onShowPremiumModal }: GroupsProps) {
  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-4">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Grupos</h1>
        <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Sub-comunidades da Matriz</p>
      </div>

      <div className="space-y-2">
        {demoGroups.map(group => {
          const isLocked = group.vip && !isPremium;
          return (
            <button
              key={group.id}
              onClick={() => isLocked ? onShowPremiumModal?.() : null}
              className={`w-full text-left p-4 rounded-2xl border bg-[var(--libido-surface-2)]/60 transition-all flex items-center gap-4 ${
                isLocked ? 'border-[var(--libido-border)] opacity-50' : 'border-[var(--libido-border)] hover:bg-white/5'
              }`}
            >
              <div className="w-12 h-12 bg-[var(--libido-accent)]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                {isLocked ? <Lock size={16} className="text-[var(--libido-accent)]" /> : <Users size={16} className="text-[var(--libido-accent)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-black text-[var(--libido-text)] truncate">{group.name}</h3>
                <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-semibold mt-0.5">{group.desc}</p>
                <p className="text-[8px] text-[var(--libido-text)]/20 font-bold mt-1">{group.members} membros</p>
              </div>
              <ChevronRight size={14} className="text-[var(--libido-text)]/20 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
