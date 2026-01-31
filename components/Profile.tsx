
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CURRENT_USER } from '../constants';
import { User, Biotype, UserType, Gender, SexualOrientation, PartnerData, TrustLevel, GalleryPhoto } from '../types';
import { useAuth } from '../App';
import ActionButton from './common/ActionButton';
import { Select, Input } from './common/RegistrationUI';
import ImageEditor from './ImageEditor';
import { 
  BadgeCheck, Settings, LogOut, ShieldCheck, 
  ChevronLeft, Ruler, Eye, Palette, Crown, 
  Fingerprint, Wind, X, Heart, 
  ImageIcon, Plus, Trash2, Wallet, Camera, HelpCircle, Volume2, VolumeX
} from 'lucide-react';
import { 
    saveUserData, sanitizeInput, simulateApiCall,
    handleButtonAction, showNotification, cache
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
  
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSound = () => {
    const newState = !soundEnabled;
    soundService.setEnabled(newState);
    setSoundEnabled(newState);
    if (newState) soundService.play('MESSAGE');
  };

  useEffect(() => {
    if (propUser) setUser(propUser);
    else if (isOwnProfile && cache.userData) setUser(cache.userData);
  }, [propUser, isOwnProfile]);

  const defaultPartner = (nick: string): PartnerData => ({
    nickname: nick, age: 25, gender: Gender.CIS, sexualPreference: SexualOrientation.HETERO,
    biotype: Biotype.PADRAO, height: 170, skinColor: 'Branca', hairColor: 'Pretos', hairType: 'Liso',
    lookingFor: []
  });

  const [editData, setEditData] = useState({
    nickname: user.nickname,
    bio: user.bio,
    type: user.type,
    lookingFor: user.lookingFor || [],
    gender: user.gender,
    sexualOrientation: user.sexualOrientation,
    biotype: user.biotype,
    height: user.height || 0,
    gallery: [...user.gallery],
  });

  const handleSaveProfile = async () => {
    await handleButtonAction(
        'PROFILE_SAVE_FULL',
        async () => {
            const updatedUser: User = {
                ...user,
                nickname: sanitizeInput(editData.nickname),
                bio: sanitizeInput(editData.bio),
                lookingFor: editData.lookingFor,
                gallery: editData.gallery,
                updatedAt: new Date().toISOString()
            };
            await simulateApiCall('SAVE_PROFILE_DATA', updatedUser, 800);
            return updatedUser;
        },
        {
            setLoading: setIsSaving,
            onSuccess: (updatedUser) => {
                saveUserData(updatedUser);
                setUser(updatedUser);
            },
            onUIUpdate: () => {
                refreshSession();
                setIsEditing(false);
                showNotification('Matriz atualizada!', 'success');
            }
        }
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditingImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const onImageSave = async (finalImageUrl: string) => {
    const newPhoto: GalleryPhoto = {
        id: `photo-${Date.now()}`,
        url: finalImageUrl,
        timestamp: new Date().toISOString()
    };
    
    if (!isEditing) {
      await handleButtonAction('QUICK_POST_PHOTO', async () => {
        const updatedGallery = [newPhoto, ...user.gallery];
        const updatedUser = { ...user, gallery: updatedGallery };
        await simulateApiCall('ADD_GALLERY_PHOTO', updatedUser, 600);
        saveUserData(updatedUser);
        setUser(updatedUser);
        return true;
      }, {
        onSuccess: () => {
          showNotification('Foto postada na galeria!', 'success');
          refreshSession();
        }
      });
    } else {
      setEditData(prev => ({ ...prev, gallery: [newPhoto, ...prev.gallery] }));
      showNotification('Foto adicionada à edição!', 'success');
    }
    setEditingImageUrl(null);
  };

  const isOuro = user.trustLevel === TrustLevel.OURO;

  return (
    <div className={`p-6 space-y-8 animate-in fade-in pb-32 min-h-full ${isOuro ? 'bg-[#050505] bg-gradient-to-b from-amber-500/5 to-transparent' : 'bg-[#050505]'}`}>
      {editingImageUrl && <ImageEditor imageUrl={editingImageUrl} onSave={onImageSave} onCancel={() => setEditingImageUrl(null)} />}
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />

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
        {isOwnProfile && (
           <button onClick={toggleSound} className="p-2 bg-slate-900/60 rounded-full text-amber-500 border border-white/5 transition-all active:scale-90">
             {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-slate-500" />}
           </button>
        )}
      </div>

      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className={`w-32 h-32 rounded-[2.5rem] p-1 shadow-2xl transition-transform active:scale-95 ${isOuro ? 'bg-gradient-to-tr from-amber-400 to-amber-700 shadow-amber-500/30' : 'bg-gradient-to-tr from-pink via-purple-500 to-slate-800'}`}>
            <img src={user.avatar} className="w-full h-full rounded-[2.2rem] object-cover border-4 border-[#050505]" alt={user.nickname} />
          </div>
          <div className={`absolute -bottom-1 -right-1 p-2 rounded-xl border-2 border-[#050505] shadow-lg ${isOuro ? 'bg-amber-500 text-black' : 'bg-pink text-white'}`}>
            {isOuro ? <Crown size={18} fill="currentColor" /> : <BadgeCheck size={18} />}
          </div>
        </div>
        
        {!isEditing ? (
          <div>
            <h2 className={`text-3xl font-black font-outfit uppercase italic tracking-tighter ${isOuro ? 'text-amber-400' : 'text-white'}`}>{user.nickname}, {user.age}</h2>
            <div className="flex items-center justify-center gap-3 mt-1"><p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{user.type}</p></div>
          </div>
        ) : (
          <div className="px-6 space-y-4">
             <Input value={editData.nickname} onChange={(v) => setEditData({...editData, nickname: v})} placeholder="NICKNAME" />
             <div className="space-y-1 text-left">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-2">Bio / Descrição</label>
                <textarea value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} className="w-full bg-slate-900/60 border border-white/5 rounded-2xl py-4 px-6 text-[11px] font-bold text-white uppercase outline-none focus:border-pink/30 transition-all placeholder:text-slate-700 min-h-[100px] resize-none" placeholder="SUA BIO..." />
             </div>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-5">
           <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} className="text-pink" /> Galeria Visual</h3>
                <label className="bg-pink/10 text-pink text-[9px] font-black px-3 py-1.5 rounded-xl border border-pink/20 cursor-pointer flex items-center gap-1 active:scale-95 transition-all">
                  <Plus size={12} /> Adicionar
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {editData.gallery.map((photo, idx) => (
                   <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group shadow-lg">
                      <img src={photo.url} className="w-full h-full object-cover" alt="Galeria" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button onClick={() => {
                            const newGallery = editData.gallery.filter((_, i) => i !== idx);
                            setEditData({ ...editData, gallery: newGallery });
                         }} className="p-2 bg-rose-600 rounded-lg text-white hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
           <div className="grid grid-cols-2 gap-4 pt-6">
              <ActionButton label="Descartar" onClick={() => setIsEditing(false)} variant="glass" />
              <ActionButton label="Salvar" onClick={handleSaveProfile} loading={isSaving} icon={<ShieldCheck size={18} />} />
           </div>
        </div>
      ) : (
        <>
          <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 mx-auto max-w-[320px]">
              <button onClick={() => setActiveTab('info')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Infos</button>
              <button onClick={() => setActiveTab('gallery')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Galeria</button>
              <button onClick={() => setActiveTab('trust')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'trust' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Matriz</button>
          </div>

          {activeTab === 'info' && (
            <div className="space-y-10 animate-in slide-in-from-left-5">
                <section className="space-y-6">
                    <div className="flex items-center gap-2 px-2 border-b border-white/5 pb-2">
                        <Fingerprint size={16} className={isOuro ? 'text-amber-500' : 'text-pink'} />
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Identidade</h3>
                    </div>
                    {user.bio && <div className="px-2"><p className="text-[10px] text-slate-300 italic leading-relaxed">"{user.bio}"</p></div>}
                    <div className="grid grid-cols-2 gap-3">
                        <MatrixCard icon={<Wind size={14}/>} label="Gênero" value={user.gender || 'N/A'} />
                        <MatrixCard icon={<Heart size={14}/>} label="Orientação" value={user.sexualOrientation || 'N/A'} />
                        <MatrixCard icon={<Ruler size={14}/>} label="Altura" value={user.height ? `${user.height}cm` : 'N/A'} />
                        <MatrixCard icon={<Palette size={14}/>} label="Biotipo" value={user.biotype || 'N/A'} />
                    </div>
                    {isOwnProfile && (
                      <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 space-y-4 mt-6 shadow-inner">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><HelpCircle size={20} /></div>
                          <div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Canais de Atendimento</h4>
                            <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Sincronização & Dúvidas</p>
                          </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">E-mail para suporte:</p>
                            <div className="flex items-center justify-center gap-2"><span className="text-[12px] font-black text-amber-500 select-all font-mono tracking-tighter">libidoapp@gmail.com</span></div>
                        </div>
                      </div>
                    )}
                </section>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                    {isOwnProfile && (
                      <div onClick={() => fileInputRef.current?.click()} className="relative aspect-[3/4] rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group active:scale-95">
                        <div className="w-12 h-12 rounded-2xl bg-pink/10 flex items-center justify-center text-pink group-hover:scale-110 transition-transform"><Camera size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postar Foto</span>
                      </div>
                    )}
                    {user.gallery.map((photo, i) => (
                        <div key={photo.id} onClick={() => setViewerPhotoIndex(i)} className="relative aspect-[3/4] rounded-[2rem] overflow-hidden glass-card group cursor-pointer active:scale-95 transition-all shadow-xl border border-white/5">
                            <img src={photo.url} className={`w-full h-full object-cover transition-all duration-700 ${photo.isBlurred && !isOwnProfile ? 'blur-2xl scale-110' : 'group-hover:scale-110'}`} alt="Galeria" />
                        </div>
                    ))}
                </div>
            </div>
          )}

          {activeTab === 'trust' && (
            <div className="space-y-8 animate-in slide-in-from-right-5">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2 border-b border-white/5 pb-2">
                        <Wallet size={16} className="text-pink" />
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Plano & Assinatura</h3>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Atual</p>
                        <h4 className={`text-xl font-black font-outfit uppercase italic tracking-tighter ${isOuro ? 'text-amber-400' : 'text-pink'}`}>{user.plan}</h4>
                    </div>
                </section>
            </div>
          )}

          <div className="space-y-4 pt-6">
            {isOwnProfile && <ActionButton label="Configuração" onClick={() => setIsEditing(true)} variant="glass" icon={<Settings size={20} />} />}
            {isOwnProfile && <ActionButton label="Encerrar Sessão" onClick={() => logout()} variant="danger" icon={<LogOut size={20} />} />}
          </div>
        </>
      )}

      {viewerPhotoIndex !== null && user.gallery[viewerPhotoIndex] && (
        <div className="fixed inset-0 z-[1000] bg-black animate-in fade-in duration-300 flex flex-col" onClick={() => setViewerPhotoIndex(null)}>
          <div className="absolute top-12 left-6 right-6 z-[1010] flex items-center justify-between">
            <p className="text-white text-[10px] font-black uppercase tracking-widest">{user.nickname}</p>
            <button onClick={() => setViewerPhotoIndex(null)} className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md"><X size={20} /></button>
          </div>
          <div className="flex-1 w-full flex items-center justify-center p-4">
            <img src={user.gallery[viewerPhotoIndex].url} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

const MatrixCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-slate-900/40 border border-white/5 p-4 rounded-[1.8rem] flex items-center gap-3 group hover:border-pink/30 transition-all shadow-inner relative overflow-hidden">
    <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500 shrink-0 group-hover:text-pink transition-all border border-white/5">{icon}</div>
    <div className="min-w-0">
      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5 truncate">{label}</p>
      <p className="text-[10px] font-bold text-white truncate italic uppercase tracking-tighter font-outfit">{value}</p>
    </div>
  </div>
);

export default Profile;
