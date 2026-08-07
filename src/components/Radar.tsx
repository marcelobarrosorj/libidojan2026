import { useState, useEffect } from 'react';
import { Radio, Users } from 'lucide-react';
import { User } from '../types';
import { getActiveUsers } from '../services/users';
import { ProtectedImage } from './ProtectedImage';

interface RadarProps {
  userId?: string;
  navigate?: (tab: string, params?: any) => void;
  currentUser?: User | null;
}

export function Radar({ userId, navigate, currentUser }: RadarProps) {
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperators = async () => {
      if (!userId) return;
      try {
        const users = await getActiveUsers(userId);
        setOperators(users);
      } catch (err) {
        console.error("Falha ao buscar usuários no Radar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, [userId]);

  return (
    <div className="flex-1 flex flex-col bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-hidden p-5 relative min-h-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Radar NoFake</h1>
          <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Operadores em Proximidade</p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--libido-surface-2)] border border-[var(--libido-border)] px-3 py-1.5 rounded-full">
          <Users size={12} className="text-[var(--libido-accent)]" />
          <span className="text-[10px] font-black text-[var(--libido-muted)]">{operators.length} ativos</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
        <div className="absolute w-72 h-72 rounded-full border border-[var(--libido-border)] flex items-center justify-center">
          <div className="w-52 h-52 rounded-full border border-[var(--libido-border)] flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-[var(--libido-border)]" />
          </div>
        </div>

        <div className="absolute w-72 h-72 rounded-full overflow-hidden pointer-events-none">
          <div className="w-full h-full bg-gradient-to-tr from-[var(--libido-accent)]/10 to-transparent origin-center rotate-sweep animate-[spin_5s_linear_infinite]" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-14 h-14 rounded-full border-2 border-[var(--libido-accent)] shadow-[0_0_25px_rgba(255,179,0,0.3)] overflow-hidden">
            <ProtectedImage currentUser={currentUser} src={currentUser?.photo_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=64&auto=format&fit=crop"} alt="Você" className="w-full h-full" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            Você
          </div>
        </div>

        {loading ? (
          <div className="text-[10px] text-[var(--libido-muted)] opacity-50 uppercase tracking-widest font-black">Escaneando...</div>
        ) : (
          operators.map((u, i) => {
            const angle = (i * 360) / Math.max(1, operators.length) + 45;
            const dist = 70 + (i % 3) * 35; 
            const rad = (angle * Math.PI) / 180;
            const left = `calc(50% + ${Math.cos(rad) * dist}px)`;
            const top = `calc(50% + ${Math.sin(rad) * dist}px)`;

            return (
              <button
                key={u.id}
                onClick={() => navigate?.('viewprofile', { user: u })}
                className="absolute w-8 h-8 rounded-full border border-[var(--libido-accent)]/40 overflow-hidden shadow-lg hover:scale-110 active:scale-95 transition-transform z-10"
                style={{ left, top, transform: 'translate(-50%, -50%)' }}
              >
                <ProtectedImage currentUser={currentUser} src={u.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=32"} alt="" className="w-full h-full" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
