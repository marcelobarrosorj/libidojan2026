
import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, UserCircle, Settings, Crown, LayoutGrid, CreditCard, Radio, CalendarDays, Zap, ShieldAlert, Trophy, Search } from 'lucide-react';
import { cache, isPremiumUser } from '../services/authUtils';
import { Plan, User } from '../types';
import LibidoIcon from './common/LibidoIcon';
import VerificationBanner from './VerificationBanner';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onSearch?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onSearch }) => {
  const isPremium = isPremiumUser(user);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full sm:max-w-lg mx-auto relative bg-[#050505] border-x border-slate-900/50 overflow-hidden">
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
          <button 
            onClick={onSearch}
            className="p-2 rounded-full bg-slate-900 border border-white/5 text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            <Search size={20} />
          </button>

          {!isPremium && (
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
            onClick={() => setActiveTab('profile_settings')}
            className={`p-2 rounded-full transition-colors ${activeTab === 'profile' || activeTab === 'profile_settings' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'}`}
          >
            <Settings size={20} />
          </button>

          {(user?.id === '000001' || user?.email === 'marcelobarrosorj@gmail.com') && (
            <button 
              onClick={() => setActiveTab('admin_panel')}
              className={`p-2 rounded-full transition-all border ${activeTab === 'admin_panel' ? 'bg-rose-500 text-black border-rose-500 animate-pulse' : 'bg-rose-950 border-rose-500/30 text-rose-500'}`}
              title="Central de Governança"
            >
              <ShieldAlert size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Navigation Reorganized at the TOP of the screen */}
      <nav className="w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 px-1 py-3 flex justify-around items-center z-20 shadow-md shrink-0">
        <NavButton icon={<LayoutGrid size={24} />} isActive={activeTab === 'feed'} onClick={() => setActiveTab('feed')} label="Feed" />
        <NavButton icon={<Radio size={24} />} isActive={activeTab === 'radar'} onClick={() => setActiveTab('radar')} label="Radar" />
        <NavButton icon={<Trophy size={24} />} isActive={activeTab === 'ranking'} onClick={() => setActiveTab('ranking')} label="Top" />
        <NavButton icon={<MessageCircle size={24} />} isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} label="Chat" />
        <NavButton icon={<UserCircle size={24} />} isActive={activeTab === 'profile' || activeTab === 'profile_settings'} onClick={() => setActiveTab('profile')} label="Perfil" />
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-12">
        {user && !user.emailVerified && user.email && (
            <VerificationBanner email={user.email} />
        )}
        {children}
        
        {/* AVISO DE SEGURANÇA: Barreira de Deterrence */}
        <div className="px-8 py-12 text-center opacity-30 select-none pointer-events-none mb-10">
            <ShieldAlert size={16} className="mx-auto mb-2 text-slate-500" />
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed mb-1">
                Ambiente Protegido pela Matriz Libido 2026<br/>
                Captura de tela e cópia de conteúdo estritamente proibidas
            </p>
            {user && (
              <p className="text-[7px] font-black text-amber-500/50 uppercase tracking-[0.4em]">
                {(!user.nickname || user.nickname === 'User_Libido' || user.nickname === 'Agente') ? 'CASAL BEIJO' : user.nickname} | ID: {user.serialNumber || '000001'}
              </p>
            )}
        </div>
      </main>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, isActive: boolean, onClick: () => void, label: string }> = ({ 
  icon, isActive, onClick, label 
}) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1 relative transition-all active:scale-95 py-1">
    <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)]' : 'text-slate-400 hover:text-slate-200'}`}>
      {isActive && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-yellow-400/10 rounded-2xl border border-yellow-400/40 blur-[1px]"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative z-10 transition-transform duration-300" style={{ transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>
        {icon}
      </div>
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-yellow-400 opacity-100' : 'text-slate-500 opacity-60'}`}>
      {label}
    </span>
  </button>
);

export default Layout;
