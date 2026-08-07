import { useState } from 'react';
import { Home, Rss, Radio, MessageCircle, Menu, X, Users, Trophy, Calendar, UserPlus, Settings, User, Shield } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

export function BottomNavGlobal({ activeTab, onTabChange, isAdmin }: BottomNavProps) {
  const [showMenu, setShowMenu] = useState(false);

  const mainTabs = [
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'radar', label: 'Radar', icon: Radio },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const menuItems = [
    { id: 'forum', label: 'Fórum', icon: Users, premium: false },
    { id: 'top', label: 'Ranking', icon: Trophy, premium: false },
    { id: 'events', label: 'Eventos', icon: Calendar, premium: false },
    { id: 'groups', label: 'Grupos', icon: Users, premium: true },
    { id: 'invites', label: 'Convites', icon: UserPlus, premium: false },
    { id: 'settings', label: 'Configurações', icon: Settings, premium: false },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Shield, premium: false });
  }

  return (
    <>
      {showMenu && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
          <div className="relative ml-auto w-72 h-full bg-[var(--libido-bg)] border-l border-[var(--libido-border)] flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[var(--libido-border)]">
              <h2 className="text-sm font-black text-[var(--libido-accent)] uppercase tracking-widest italic">Menu da Matriz</h2>
              <button onClick={() => setShowMenu(false)} className="text-[var(--libido-muted)] opacity-60 hover:text-[var(--libido-text)]"><X size={18} /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); setShowMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                    activeTab === item.id 
                      ? 'bg-[var(--libido-accent)]/10 text-[var(--libido-accent)] border border-[var(--libido-accent)]/20' 
                      : 'text-[var(--libido-muted)] opacity-70 hover:text-[var(--libido-text)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                  {item.premium && (
                    <span className="ml-auto text-[7px] font-black bg-[var(--libido-accent)]/20 text-[var(--libido-accent)] px-1.5 py-0.5 rounded">VIP</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <nav className="flex-shrink-0 flex items-center justify-around bg-[var(--libido-bg)] backdrop-blur-xl border-t border-[var(--libido-border)]/50 px-2 py-2 relative z-50">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-[var(--libido-accent)]' : 'text-[var(--libido-muted)]/50 hover:text-[var(--libido-muted)]/80'
            }`}
          >
            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
            <span className="text-[8px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMenu(true)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            showMenu ? 'text-[var(--libido-accent)]' : 'text-[var(--libido-muted)]/50 hover:text-[var(--libido-muted)]/80'
          }`}
        >
          <Menu size={18} strokeWidth={1.5} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Menu</span>
        </button>
      </nav>
    </>
  );
}
