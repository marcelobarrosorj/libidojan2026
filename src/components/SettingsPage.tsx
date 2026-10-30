import { Bell, Shield, LogOut, Moon, ChevronRight, Sun } from 'lucide-react';
import { useState } from 'react';
import { OwnerInvites } from './OwnerInvites'; // OWNER-INVITES
interface SettingsPageProps {
  onLogout?: () => void;
  currentUser?: any;
  isPremium?: boolean;
}
export function SettingsPage({ onLogout, currentUser, isPremium }: SettingsPageProps) {
  const [ghostMode, setGhostMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  // TEMA-TOGGLE: tema claro/escuro salvo no navegador e aplicado em todo o app
  const [temaClaro, setTemaClaro] = useState<boolean>(() => {
    try { return localStorage.getItem('libido_tema') === 'claro'; } catch (eTema) { return false; }
  });
  const alternarTema = () => {
    const novo = !temaClaro;
    setTemaClaro(novo);
    try { localStorage.setItem('libido_tema', novo ? 'claro' : 'escuro'); } catch (eTema) { console.error(eTema); }
    document.documentElement.classList.toggle('tema-claro', novo);
  };
  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-4">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Configurações</h1>
        <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Ajustes do Sistema</p>
      </div>
      <div className="space-y-2">
        <p className="text-[9px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-widest px-1 mt-2">Privacidade</p>
        <OwnerInvites />
        <div className="flex items-center justify-between bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center"><Bell size={14} className="text-blue-400" /></div>
            <div>
              <p className="text-xs font-black text-[var(--libido-text)]">Notificações</p>
              <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-semibold">Alertas sonoros e de vibração</p>
            </div>
          </div>
          <button
            onClick={() => { const novo = !notifications; setNotifications(novo); try { localStorage.setItem('libido_notifications', novo ? 'on' : 'off'); } catch (eN) { console.error(eN); } }} // NOTIF-TOGGLE
            className={`w-12 h-7 rounded-full transition-all flex items-center px-1 ${notifications ? 'bg-[var(--libido-accent)] justify-end' : 'bg-white/10 justify-start'}`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-md transition-all" />
          </button>
        </div>
        <div className="flex items-center justify-between bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center"><Sun size={14} className="text-amber-400" /></div>
            <div>
              <p className="text-xs font-black text-[var(--libido-text)]">Tema claro</p>
              <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-semibold">Alternar entre claro e escuro</p>
            </div>
          </div>
          <button
            onClick={alternarTema}
            className={`w-12 h-7 rounded-full transition-all flex items-center px-1 ${temaClaro ? 'bg-[var(--libido-accent)] justify-end' : 'bg-black/10 justify-start'}`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-md transition-all" />
          </button>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 p-4 rounded-2xl mt-4 transition-colors"
      >
        <LogOut size={14} className="text-red-400" />
<span className="text-xs font-black text-red-400 uppercase tracking-widest">Sair</span>
      </button>
    </div>
  );
}