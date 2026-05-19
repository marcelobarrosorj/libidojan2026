import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, MessageCircle, Image, RefreshCw, Trash2, Eye, EyeOff, UserCircle, Flag, AlertTriangle, Lock, Search, User as UserIcon, ZoomIn } from 'lucide-react';
import { adminService, type AdminMessage, type AdminMedia, type AdminReport } from '../services/adminService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuthContext';
import { searchProfiles } from '../services/repo';
import { User, PresenceStatus } from '../types';
import { PresenceBadge } from './common/PresenceBadge';

interface AdminDashboardProps {
  onBack: () => void;
  onInspectUser: (user: User) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onInspectUser }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'media' | 'reports' | 'users'>('messages');
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [media, setMedia] = useState<AdminMedia[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // TRAVA RÍGIDA DE ACESSO
  const isOwner = currentUser?.id === '000001' || currentUser?.nickname === 'CASAL BEIJO' || currentUser?.email === 'marcelobarrosorj@gmail.com';

  const fetchData = async () => {
    if (!isOwner) return;
    setLoading(true);
    try {
      if (activeTab === 'messages') {
        const msgs = await adminService.getRawMessages();
        setMessages(msgs);
      } else if (activeTab === 'media') {
        const mdas = await adminService.getRawMedia();
        setMedia(mdas);
      } else if (activeTab === 'reports') {
        const reps = await adminService.getReportedItems();
        setReports(reps);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (val: string) => {
    setUserQuery(val);
    if (val.length < 2) {
      setFoundUsers([]);
      return;
    }
    const results = await searchProfiles(val);
    setFoundUsers(results);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  if (!isOwner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen p-10 text-center">
        <div className="p-6 bg-rose-500/10 rounded-full text-rose-500 border border-rose-500/20 mb-6">
          <Lock size={48} />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">ACESSO NEGADO</h2>
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-8">Protocolo de Segurança Nível 0 Ativado</p>
        <button 
          onClick={onBack}
          className="px-10 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest italic"
        >
          Voltar para a Superfície
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen">
      {/* Header Central de Governança */}
      <header className="p-6 border-b border-rose-500/20 bg-rose-950/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-500 animate-pulse">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Central de Governança</h2>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Auditoria de Protocolos RLS-BYPASS</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('messages')}
            className={`shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border ${activeTab === 'messages' ? 'bg-rose-500 text-black border-rose-500' : 'bg-slate-900 text-slate-500 border-white/5'}`}
          >
            <MessageCircle size={14} />
            Msgs
          </button>
          <button 
            onClick={() => setActiveTab('media')}
            className={`shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border ${activeTab === 'media' ? 'bg-rose-500 text-black border-rose-500' : 'bg-slate-900 text-slate-500 border-white/5'}`}
          >
            <Image size={14} />
            Mídias
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border ${activeTab === 'reports' ? 'bg-rose-500 text-black border-rose-500' : 'bg-slate-900 text-slate-500 border-white/5'}`}
          >
            <Flag size={14} />
            Denvs
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border ${activeTab === 'users' ? 'bg-rose-500 text-black border-rose-500' : 'bg-slate-900 text-slate-500 border-white/5'}`}
          >
            <UserIcon size={14} />
            Users
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="text-rose-500 animate-spin mb-4" size={32} />
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Infiltrando camadas do Supabase...</p>
          </div>
        )}

        {!loading && activeTab === 'messages' && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-slate-500 text-[10px] py-10 italic uppercase tracking-widest">Nenhum rastro detectado na rede.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[7px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                    <span className="text-rose-500/80">HASH: {msg.id.split('-')[0]}...</span>
                    <span>{format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[7px] text-slate-600 mb-1 uppercase font-black">DE: {msg.sender_id}</p>
                      <p className="text-[7px] text-slate-600 uppercase font-black">PARA: {msg.receiver_id}</p>
                    </div>
                    <div className="flex-[3] bg-black/40 p-4 rounded-2xl border border-white/5">
                      <p className="text-xs text-white/90 leading-relaxed font-medium">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'media' && (
          <div className="grid grid-cols-2 gap-3">
            {media.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 text-[10px] py-10 italic uppercase tracking-widest">Nenhuma mídia capturada da Matriz.</div>
            ) : (
              media.map((item, idx) => (
                <div key={`${item.userId}-${idx}`} className="relative bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 group">
                  <img 
                    src={item.mediaUrl} 
                    alt="Auditoria"
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCircle size={10} className="text-rose-500" />
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter truncate">{item.userNickname}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] text-slate-400">{format(new Date(item.createdAt), "dd/MM HH:mm")}</span>
                      {item.isBlurred && <EyeOff size={10} className="text-amber-500" />}
                    </div>
                  </div>
                  
                  {/* Forensic Badge */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full z-10 border border-white/10">
                     <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter italic">RAW HD DATA</span>
                  </div>
                  
                  {item.isBlurred && (
                    <div className="absolute top-2 right-2 bg-amber-500/80 backdrop-blur-md px-1.5 py-0.5 rounded-full z-10 flex items-center gap-1 border border-white/10">
                      <span className="text-[7px] font-black text-white uppercase italic">BLUR BYPASS</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-center text-slate-500 text-[10px] py-10 italic uppercase tracking-widest">Nenhuma violação de protocolo reportada.</p>
            ) : (
              reports.map(rep => (
                <div key={rep.id} className="p-5 bg-slate-900 border border-rose-500/30 rounded-3xl space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 text-rose-500/20">
                    <AlertTriangle size={40} />
                  </div>
                  <div className="flex justify-between items-center text-[7px] font-black text-rose-500 uppercase tracking-widest">
                    <span>STATUS: {rep.status}</span>
                    <span>{format(new Date(rep.created_at), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic mb-1">{rep.reason}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{rep.description}</p>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex flex-col gap-1">
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">ORIGEM: {rep.reporter_id}</p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest text-rose-500">ALVO: {rep.target_id}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" size={16} />
              <input 
                type="text"
                placeholder="Infiltrar perfil (Nickname ou ID)..."
                className="w-full bg-slate-900 border border-rose-500/10 py-3 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                value={userQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {foundUsers.length === 0 ? (
                <p className="text-center text-slate-600 text-[9px] py-10 uppercase tracking-widest">Aguardando coordenadas...</p>
              ) : (
                foundUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-3 p-3 bg-slate-900/40 border border-white/5 rounded-2xl group hover:border-rose-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white truncate italic uppercase tracking-tighter">{user.nickname || user.name}</h4>
                      <p className="text-[7px] text-slate-600 truncate font-black tracking-widest uppercase">ID: {user.id}</p>
                    </div>
                    <button 
                      onClick={() => onInspectUser(user)}
                      className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-black transition-all"
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 w-full sm:max-w-lg mx-auto p-4 bg-black/80 backdrop-blur-xl border-t border-rose-500/20 flex gap-3 z-[60]">
        <button 
          onClick={onBack}
          className="flex-1 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.3em] italic"
        >
          Retornar à Matriz
        </button>
        <button 
          className="px-6 py-4 bg-rose-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic shadow-[0_0_20px_rgba(244,63,94,0.3)]"
          onClick={() => alert("Protocolo de Purga em Desenvolvimento...")}
        >
          Expurgar
        </button>
      </footer>
    </div>
  );
};

export default AdminDashboard;
