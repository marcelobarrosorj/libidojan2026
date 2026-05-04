
import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { isOwner } from '../services/authUtils';

interface VerificationGateProps {
  user: User | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function VerificationGate({ user, children, fallback }: VerificationGateProps) {
  if (user?.emailVerified || isOwner(user)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20">
        <Lock size={32} />
      </div>
      <div>
        <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">Acesso Restrito</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 max-w-[200px]">
          Confirme seu e-mail para desbloquear esta funcionalidade.
        </p>
      </div>
    </div>
  );
}
