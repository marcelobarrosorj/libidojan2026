import { Search, Zap, Settings, Bell } from "lucide-react";
import { Logo } from "./Logo";

interface HeaderGlobalProps {
  onSearchClick?: () => void;
  onEnergyClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
}

export function HeaderGlobal({ onSearchClick, onEnergyClick, onSettingsClick, onNotificationsClick }: HeaderGlobalProps) {
  return (
    <header className="shrink-0 z-50 bg-[var(--libido-bg)] flex flex-col shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] relative">
      <div className="flex justify-between items-center px-4 h-[65px] border-b border-[var(--libido-border)]">
        <Logo />

        <div className="flex items-center gap-3 text-[var(--libido-muted)]">
          <button 
            onClick={() => onSearchClick?.()}
            className="w-10 h-10 rounded-full bg-[var(--libido-surface-2)] hover:bg-[var(--libido-surface)] border border-[var(--libido-border)] flex items-center justify-center hover:text-[var(--libido-accent)] hover:border-[var(--libido-accent)]/50 transition-all"
          >
            <Search size={18} strokeWidth={2.5}/>
          </button>
          <button 
            onClick={() => onEnergyClick?.()}
            className="w-10 h-10 rounded-full bg-[var(--libido-surface-2)] hover:bg-[var(--libido-surface)] border border-[var(--libido-border)] flex items-center justify-center hover:text-[var(--libido-accent)] hover:border-[var(--libido-accent)]/50 transition-all"
          >
            <Zap size={18} strokeWidth={2.5}/>
          </button>
          <button 
            onClick={() => onSettingsClick?.()}
            className="w-10 h-10 rounded-full bg-[var(--libido-surface-2)] hover:bg-[var(--libido-surface)] border border-[var(--libido-border)] flex items-center justify-center hover:text-[var(--libido-accent)] hover:border-[var(--libido-accent)]/50 transition-all"
          >
            <Settings size={18} strokeWidth={2.5}/>
          </button>
          <button 
            onClick={() => onNotificationsClick?.()}
            className="w-10 h-10 rounded-full bg-[var(--libido-surface-2)] hover:bg-[var(--libido-surface)] border border-[var(--libido-border)] flex items-center justify-center hover:text-[var(--libido-accent)] hover:border-[var(--libido-accent)]/50 transition-all relative"
          >
             <Bell size={18} strokeWidth={2.5}/>
             <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--libido-accent)] rounded-full border-[3px] border-[var(--libido-bg)]"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
