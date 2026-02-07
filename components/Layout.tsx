
import React from 'react';
import { Heart, MessageCircle, UserCircle, Settings, Crown, LayoutGrid, CreditCard, Radio, CalendarDays, Zap, ShieldAlert } from 'lucide-react';
import { cache } from '../services/authUtils';
import { Plan } from '../types';
import LibidoIcon from './common/LibidoIcon';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const user = cache.userData;
  const isGold = user?.plan === Plan.GOLD;

  return (
    <div className="flex flex-col min-h-[100dvh] h-[100dvh] max-w-md mx-auto relative bg-[#050505] border-x border-slate-900/50 overflow-hidden">
      {/* Top Navigation Premium */}
      <header className="px-6 pt-6 pb-2 flex justify-between items-center z-10 glass-card border-none rounded-b-3xl shadow-xl">
        <div 
          onClick={() => setActiveTab('feed')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <LibidoIcon size={32} />
          <h1 className="text-2xl font-black font-outfit tracking-tighter text-white italic group-hover:text-amber-500 transition-colors">
            LIBIDO
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {user?.plan === Plan.FREE && (
             <button 
                onClick={() => setActiveTab('assinatura')}
                className="bg-amber-500 text-black text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30 animate-bounce uppercase tracking-widest"
             >
                UPGRADE
             </button>
          )}
          
          <button 
            onClick={() => setActiveTab('assinatura')}
            className={`flex items-center gap-1.5 bg-slate-900 border border-white/5 px-3 py-1.5 rounded-full transition-all ${activeTab === 'assinatura' ? 'border-amber-500' : ''}`}
          >
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-white">{user?.boosts_active || 0}</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-full transition-colors ${activeTab === 'profile' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {children}
        
        {/* AVISO DE SEGURANÇA: Barreira de Deterrence */}
        <div className="px-8 py-12 text-center opacity-30 select-none pointer-events-none mb-10">
            <ShieldAlert size={16} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed">
                Ambiente Protegido pela Matriz Libido 2026<br/>
                Captura de tela e cópia de conteúdo estritamente proibidas
            </p>
        </div>
      </main>

      {/* Bottom Navigation: High Visibility 100% Solid Contrast */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0a] border-t-2 border-amber-500 px-2 py-4 pb-10 flex justify-between items-center z-50 rounded-t-[3rem] shadow-[0_-25px_60px_rgba(0,0,0,1)]">
        <NavButton icon={<LayoutGrid size={24} />} isActive={activeTab === 'feed'} onClick={() => setActiveTab('feed')} label="Feed" />
        <NavButton icon={<Radio size={24} />} isActive={activeTab === 'radar'} onClick={() => setActiveTab('radar')} label="Radar" />
        <NavButton icon={<CalendarDays size={24} />} isActive={activeTab === 'events'} onClick={() => setActiveTab('events')} label="Eventos" />
        <NavButton icon={<CreditCard size={24} />} isActive={activeTab === 'assinatura'} onClick={() => setActiveTab('assinatura')} label="Assinar" />
        <NavButton icon={<MessageCircle size={24} />} isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} label="Chats" />
        <NavButton icon={<UserCircle size={24} />} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Me" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, isActive: boolean, onClick: () => void, label: string }> = ({ 
  icon, isActive, onClick, label 
}) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-2 flex-1 transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
    <div className={`p-3.5 rounded-[1.25rem] transition-all shadow-xl border ${isActive ? 'bg-amber-500 text-black border-amber-400 shadow-amber-500/20' : 'bg-slate-900 text-slate-200 border-white/5'}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${isActive ? 'text-amber-500' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default Layout;
