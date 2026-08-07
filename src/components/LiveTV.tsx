import { Tv, Lock, MessageCircle, Users, Send } from 'lucide-react';
import { useState } from 'react';

interface LiveTVProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
}

export function LiveTV({ isPremium, onShowPremiumModal }: LiveTVProps) {
  const [chatMsg, setChatMsg] = useState('');

  if (!isPremium) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--libido-bg)] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
            <Lock size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-fraunces font-medium text-[var(--libido-text)] uppercase tracking-wider italic font-fraunces font-medium">Live TV Bloqueada</h2>
          <p className="text-xs text-[var(--libido-muted)] opacity-60 max-w-xs font-semibold leading-relaxed">
            As transmissões ao vivo são exclusivas para membros Premium da Matriz. Desbloqueie agora e assista em tempo real.
          </p>
          <button
            onClick={onShowPremiumModal}
            className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-4 px-8 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--libido-accent)]/15 mt-2"
          >
            Desbloquear Acesso — R$ 62/mês
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-hidden">
      {/* Player */}
      <div className="relative aspect-video bg-black flex items-center justify-center border-b border-[var(--libido-border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-red-900/10" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Tv size={48} className="text-[var(--libido-text)]/20" />
          <p className="text-xs text-[var(--libido-muted)] opacity-50 font-black uppercase tracking-widest">Nenhuma live ativa no momento</p>
          <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">Offline</span>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--libido-surface-2)]/60 border-b border-[var(--libido-border)]">
        <div>
          <p className="text-xs font-black text-[var(--libido-text)]">Sala Principal</p>
          <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-semibold">Transmissão da Matriz</p>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--libido-muted)] opacity-50">
          <Users size={12} />
          <span className="text-[9px] font-black">0 assistindo</span>
        </div>
      </div>

      {/* Chat da Live */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <MessageCircle size={24} className="text-[var(--libido-text)]/10" />
            <p className="text-[10px] text-[var(--libido-text)]/20 font-bold">O chat será ativado quando a live iniciar</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 border-t border-[var(--libido-border)] bg-[var(--libido-bg)]">
          <input
            type="text"
            value={chatMsg}
            onChange={e => setChatMsg(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] placeholder:text-[var(--libido-text)]/20"
          />
          <button className="w-10 h-10 bg-[var(--libido-accent)] rounded-xl flex items-center justify-center text-black hover:opacity-90 transition-opacity">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
