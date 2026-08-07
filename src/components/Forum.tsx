import { MessageSquare, Lock, Pin, ChevronRight, Plus } from 'lucide-react';

interface ForumProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
}

import { demoThreads } from '../demo';

export function Forum({ isPremium, onShowPremiumModal }: ForumProps) {
  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Fórum</h1>
          <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Discussões da Matriz</p>
        </div>
        <button className="w-10 h-10 bg-[var(--libido-accent)] rounded-xl flex items-center justify-center text-black hover:opacity-90 shadow-lg shadow-[var(--libido-accent)]/10">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {demoThreads.map(thread => {
          const isLocked = thread.vip && !isPremium;
          return (
            <button
              key={thread.id}
              onClick={() => isLocked ? onShowPremiumModal?.() : null}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                isLocked 
                  ? 'bg-[var(--libido-surface-2)]/30 border-[var(--libido-border)] opacity-50 cursor-pointer' 
                  : 'bg-[var(--libido-surface-2)]/60 border-[var(--libido-border)] hover:bg-white/5 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {thread.pinned && <Pin size={10} className="text-[var(--libido-accent)] flex-shrink-0" />}
                    {thread.vip && <Lock size={10} className="text-[var(--libido-accent)] flex-shrink-0" />}
                    <h3 className="text-xs font-black text-[var(--libido-text)] truncate">{thread.title}</h3>
                  </div>
                  <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-semibold">
                    por <span className="text-[var(--libido-muted)] opacity-70">{thread.author}</span> • {thread.replies} respostas • {thread.views} views
                  </p>
                </div>
                <ChevronRight size={14} className="text-[var(--libido-text)]/20 flex-shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
