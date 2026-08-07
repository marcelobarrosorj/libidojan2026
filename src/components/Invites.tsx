import { UserPlus, Copy, Gift, Trophy } from 'lucide-react';
import { useState } from 'react';

interface InvitesProps {
  currentUser?: any;
  userId?: string;
}

export function Invites({ currentUser, userId }: InvitesProps) {
  const [copied, setCopied] = useState(false);
  const inviteCode = `LIB-${(userId || 'XXXX').slice(0, 4).toUpperCase()}`;
  const inviteLink = `https://libido.app/invite/${inviteCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Convites</h1>
        <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Recrutamento</p>
      </div>

      <div className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] border border-[var(--libido-accent)]/20 rounded-3xl p-6 text-center relative overflow-hidden">
        <UserPlus size={32} className="text-[var(--libido-accent)] mx-auto mb-3" />
        <p className="text-[9px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-widest mb-2">Seu Código de Operador</p>
        <p className="text-2xl font-fraunces font-medium text-[var(--libido-accent)] tracking-[0.3em] mb-4 font-mono">{inviteCode}</p>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 mx-auto bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95"
        >
          <Copy size={12} />
          {copied ? 'COPIADO!' : 'COPIAR LINK DE CONVITE'}
        </button>
      </div>

      <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl">
        <p className="text-[9px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-widest mb-3">Estatísticas</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-black text-[var(--libido-text)]">0</p>
            <p className="text-[8px] text-[var(--libido-muted)] opacity-50 font-bold uppercase">Enviados</p>
          </div>
          <div>
            <p className="text-lg font-black text-[var(--libido-accent)]">0</p>
            <p className="text-[8px] text-[var(--libido-muted)] opacity-50 font-bold uppercase">Aceitos</p>
          </div>
          <div>
            <p className="text-lg font-black text-[var(--libido-text)]">0</p>
            <p className="text-[8px] text-[var(--libido-muted)] opacity-50 font-bold uppercase">Reputação</p>
          </div>
        </div>
      </div>
    </div>
  );
}
