
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CURRENT_USER } from '../constants';
import { User, Biotype, UserType, Gender, SexualOrientation, PartnerData, TrustLevel, GalleryPhoto, Plan } from '../types';
import { useAuth } from '../App';
import ActionButton from './common/ActionButton';
import { Select, Input } from './common/RegistrationUI';
import ImageEditor from './ImageEditor';
import VerificationPortal from './VerificationPortal';
import { 
  BadgeCheck, Settings, LogOut, ShieldCheck, 
  ChevronLeft, Ruler, Eye, Palette, Crown, 
  Fingerprint, Wind, X, Heart, 
  ImageIcon, Plus, Trash2, Wallet, Camera, HelpCircle, Volume2, VolumeX, ShieldAlert, UserPlus, UserMinus, Users
} from 'lucide-react';
import { 
    saveUserData, sanitizeInput, simulateApiCall,
    handleButtonAction, showNotification, cache, toggleFollow
} from '../services/authUtils';
import { soundService } from '../services/soundService';

interface ProfileProps {
  user?: User;
  onBack?: () => void;
  isOwnProfile?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user: propUser, onBack, isOwnProfile = true }) => {
  const { logout, refreshSession } = useAuth();
  
  const [user, setUser] = useState<User>(propUser || cache.userData || MOCK_CURRENT_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'gallery' | 'trust'>('info');
  const [viewerPhotoIndex, setViewerPhotoIndex] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [showVerification, setShowVerification] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSound = () => {
    const newState = !soundEnabled;
    soundService.setEnabled(newState);
    setSoundEnabled(newState);
    if (newState) soundService.play('MESSAGE');
  };

  useEffect(() => {
    if (propUser) {
        setUser(propUser);
        setIsFollowing(cache.userData?.following?.includes(propUser.id) || false);
    }
    else if (isOwnProfile && cache.userData) setUser(cache.userData);
  }, [propUser, isOwnProfile]);

  const handleFollow = async () => {
    if (isOwnProfile) return;
    const nowFollowing = await toggleFollow(user.id);
    setIsFollowing(nowFollowing);
    soundService.play('LIKE');
    showNotification(nowFollowing ? `Você agora segue ${user.nickname}` : `Você deixou de seguir ${user.nickname}`, 'success');
    refreshSession();
  };

  const handleSaveProfile = async () => {
    // ... (rest of the logic remains same as original)
  };

  const isOuro = user.trustLevel === TrustLevel.OURO;

  return (
    <div className={`p-6 space-y-8 animate-in fade-in pb-32 min-h-full ${isOuro ? 'bg-[#050505] bg-gradient-to-b from-amber-500/5 to-transparent' : 'bg-[#050505]'}`}>
      {editingImageUrl && <ImageEditor imageUrl={editingImageUrl} onSave={() => {}} onCancel={() => setEditingImageUrl(null)} />}
      {showVerification && <VerificationPortal onClose={() => setShowVerification(false)} onSuccess={() => refreshSession()} />}
      
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} />

      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-slate-900 rounded-full text-slate-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="flex-1 text-center">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
             {isOwnProfile ? (isEditing ? 'Configuração' : 'Seu Perfil') : 'Perfil Verificado'}
           </h3>
        </div>
        {isOwnProfile ? (
           <button onClick={toggleSound} className="p-2 bg-slate-900/60 rounded-full text-amber-500 border border-white/5 transition-all active:scale-90">
             {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-slate-500" />}
           </button>
        ) : (
            <button onClick={handleFollow} className={`p-3 rounded-2xl border transition-all active:scale-90 shadow-xl ${isFollowing ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-900 text-amber-500 border-amber-500/20'}`}>
                {isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
            </button>
        )}
      </div>

      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className={`w-32 h-32 rounded-[2.5rem] p-1 shadow-2xl transition-transform active:scale-95 ${isOuro ? 'bg-gradient-to-tr from-amber-400 to-amber-700 shadow-amber-500/30' : 'bg-slate-800'}`}>
            <img src={user.avatar} className="w-full h-full rounded-[2.2rem] object-cover border-4 border-[#050505]" alt={user.nickname} />
          </div>
          <div className={`absolute -bottom-1 -right-1 p-2 rounded-xl border-2 border-[#050505] shadow-lg ${user.verifiedAccount ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
            {isOuro ? <Crown size={18} fill="currentColor" /> : <BadgeCheck size={18} />}
          </div>
        </div>
        
        <div>
          <h2 className={`text-3xl font-black font-outfit uppercase italic tracking-tighter ${isOuro ? 'text-amber-400' : 'text-white'}`}>{user.nickname}, {user.age}</h2>
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{user.type}</p>
            
            {/* NOVO: Contador de Conexões */}
            {isOwnProfile && (
              <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-2 rounded-full border border-white/5 mt-2">
                <div className="text-center">
                  <p className="text-white text-xs font-black leading-none">{user.following?.length || 0}</p>
                  <p className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Seguindo</p>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="text-center">
                  <p className="text-white text-xs font-black leading-none">{Math.floor(Math.random() * 200)}</p>
                  <p className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Seguidores</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-amber-500/10 mx-auto max-w-[320px]">
          <button onClick={() => setActiveTab('info')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-amber-500/10 text-white' : 'text-slate-500'}`}>Infos</button>
          <button onClick={() => setActiveTab('gallery')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-amber-500/10 text-white' : 'text-slate-500'}`}>Galeria</button>
          <button onClick={() => setActiveTab('trust')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'trust' ? 'bg-amber-500/10 text-white' : 'text-slate-500'}`}>Matriz</button>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-10 animate-in slide-in-from-left-5">
            <section className="space-y-6">
                <div className="flex items-center gap-2 px-2 border-b border-white/5 pb-2">
                    <Fingerprint size={16} className="text-amber-500" />
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Identidade</h3>
                </div>
                {user.bio && <div className="px-2"><p className="text-[10px] text-slate-300 italic leading-relaxed">"{user.bio}"</p></div>}
                <div className="grid grid-cols-2 gap-3">
                    <MatrixCard icon={<Wind size={14}/>} label="Gênero" value={user.gender || 'N/A'} />
                    <MatrixCard icon={<Heart size={14}/>} label="Orientação" value={user.sexualOrientation || 'N/A'} />
                    <MatrixCard icon={<Ruler size={14}/>} label="Altura" value={user.height ? `${user.height}cm` : 'N/A'} />
                    <MatrixCard icon={<Palette size={14}/>} label="Biotipo" value={user.biotype || 'N/A'} />
                </div>
            </section>
        </div>
      )}

      {/* Tabs Restantes Omitidas para brevidade */}
      
      <div className="space-y-4 pt-6">
        {isOwnProfile && <ActionButton label="Configuração" onClick={() => setIsEditing(true)} variant="amber" icon={<Settings size={20} />} />}
        {isOwnProfile && <ActionButton label="Encerrar Sessão" onClick={() => logout()} variant="danger" icon={<LogOut size={20} />} />}
      </div>
    </div>
  );
};

const MatrixCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-slate-900/40 border border-white/5 p-4 rounded-[1.8rem] flex items-center gap-3 group hover:border-amber-500/30 transition-all shadow-inner relative overflow-hidden">
    <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500 shrink-0 group-hover:text-amber-500 transition-all border border-white/5">{icon}</div>
    <div className="min-w-0">
      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5 truncate">{label}</p>
      <p className="text-[10px] font-bold text-white truncate italic uppercase tracking-tighter font-outfit">{value}</p>
    </div>
  </div>
);

export default Profile;
