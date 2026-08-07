import { Calendar, MapPin, Clock, Lock, Users } from 'lucide-react';

interface EventsProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
}

import { demoEvents } from '../demo';

export function Events({ isPremium, onShowPremiumModal }: EventsProps) {
  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-4">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Eventos</h1>
        <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Cronograma da Matriz</p>
      </div>

      <div className="space-y-3">
        {demoEvents.map(event => {
          const isLocked = event.type === 'premium' && !isPremium;
          const borderColor = event.type === 'free' ? 'border-cyan-500/20' : 'border-[var(--libido-accent)]/20';
          const tagBg = event.type === 'free' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-[var(--libido-accent)]/10 text-[var(--libido-accent)]';

          return (
            <div
              key={event.id}
              onClick={() => isLocked ? onShowPremiumModal?.() : null}
              className={`p-5 rounded-2xl border ${borderColor} bg-[var(--libido-surface-2)]/60 relative overflow-hidden ${isLocked ? 'opacity-60 cursor-pointer' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${tagBg}`}>
                      {event.type === 'free' ? 'Aberto' : 'VIP'}
                    </span>
                    {isLocked && <Lock size={10} className="text-[var(--libido-accent)]" />}
                  </div>
                  <h3 className="text-sm font-black text-[var(--libido-text)]">{event.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-[9px] text-[var(--libido-muted)] opacity-60 font-bold">
                    <span className="flex items-center gap-1"><Calendar size={10} />{event.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{event.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} />{event.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl px-3 py-2">
                  <Users size={12} className="text-[var(--libido-muted)] opacity-60" />
                  <span className="text-[9px] font-black text-[var(--libido-muted)] opacity-80">{event.attendees}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
