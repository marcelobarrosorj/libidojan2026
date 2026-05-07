
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CURRENT_USER } from '../constants';
import { User, Biotype, UserType, Gender, SexualOrientation, PartnerData, TrustLevel, GalleryPhoto, Plan } from '../types';
import { useAuth } from '../hooks/useAuthContext';
import ActionButton from './common/ActionButton';
import { Select, Input } from './common/RegistrationUI';
import ImageEditor from './ImageEditor';
import VerificationPortal from './VerificationPortal';
import VerificationModal from './VerificationModal';
import { SegmentedControl } from './common/SegmentedControl';
import { 
  BadgeCheck, Settings, LogOut, ShieldCheck, 
  ChevronLeft, Ruler, Eye, Palette, Crown, 
  Fingerprint, Wind, X, Heart, Ghost,
  ImageIcon, Plus, Trash2, Wallet, Camera, HelpCircle, Volume2, VolumeX, ShieldAlert, UserPlus, UserMinus, Users,
  UserCheck, Globe,
  Zap
} from 'lucide-react';
import { 
    saveUserData, sanitizeInput, simulateApiCall,
    handleButtonAction, showNotification, cache, toggleFollow, isPremiumUser, log,
    toggleGhostMode
} from '../services/authUtils';
import { haversineKm, formatDistanceLabel } from '../services/geoService';
import { soundService } from '../services/soundService';
import ConsentMatrix from './ConsentMatrix';
import StealthModeToggle from './StealthModeToggle';
import BlurredImage from './BlurredImage';
import PhotoGridModal from './PhotoGridModal';
import VerificationGate from './VerificationGate';
import { ReportModal } from './ReportModal';
import { useMemo } from 'react';

interface ProfileProps {
  user?: User;
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
  isOwnProfile?: boolean;
  startEditing?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ 
    user: propUser, onBack, onNavigate, isOwnProfile = true, startEditing = false 
}) => {
  const { logout, refreshSession } = useAuth();
  
  const [user, setUser] = useState<User>(propUser || cache.userData || MOCK_CURRENT_USER);
  const [isEditing, setIsEditing] = useState(startEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsEditing(startEditing);
  }, [startEditing]);
  const [activeTab, setActiveTab] = useState<'info' | 'gallery' | 'trust'>('info');
  const [viewerPhotoIndex, setViewerPhotoIndex] = useState<number | null>(null);
  const [showPhotoGrid, setShowPhotoGrid] = useState(false);
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [showVerification, setShowVerification] = useState(false);
  const [showNoFakeModal, setShowNoFakeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
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

  /**
   * Adiciona nova foto à galeria
   */
  const [editingMode, setEditingMode] = useState<'avatar' | 'gallery' | null>(null);

  const handleAddPhoto = (mode: 'avatar' | 'gallery' = 'gallery') => {
    setEditingMode(mode);
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setEditingImageUrl(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handlePhotoSave = async (newImageUrl: string) => {
    if (editingMode === 'avatar') {
        const updatedUser = { ...user, avatar: newImageUrl };
        setUser(updatedUser);
        saveUserData(updatedUser);
        setEditingImageUrl(null);
        setEditingMode(null);
        showNotification('Foto de perfil atualizada!', 'success');
    } else {
        const photoId = `gallery_${Date.now()}`;
        const newPhoto: GalleryPhoto = {
            id: photoId,
            url: newImageUrl,
            timestamp: new Date().toISOString()
        };
        
        const updatedGallery = [...(user.gallery || []), newPhoto];
        const updatedUser = { ...user, gallery: updatedGallery };
        
        setUser(updatedUser);
        saveUserData(updatedUser);
        setEditingImageUrl(null);
        setEditingMode(null);
        showNotification('Foto adicionada à galeria!', 'success');
    }
    soundService.play('MATCH');
    refreshSession();
  };

  const handleDeletePhoto = (id: string) => {
    const updatedGallery = (user.gallery || []).filter(p => p.id !== id);
    const updatedUser = { ...user, gallery: updatedGallery };
    setUser(updatedUser);
    saveUserData(updatedUser);
    showNotification('Foto removida da galeria.', 'info');
  };

  // Efeito para sincronizar parceiros quando muda para tipo CASAL
  useEffect(() => {
    const isCouple = user.type === UserType.CASAIS || 
                    String(user.type).toLowerCase() === 'casais' || 
                    String(user.type).toLowerCase() === 'casal';

    if (isCouple) {
      if (!user.partner1 || !user.partner2) {
        log('info', '[PROFILE] Inicializando parceiros reativamente para tipo:', user.type);
        const updatedUser = {
          ...user,
          partner1: user.partner1 || { 
            nickname: `${user.nickname} (P1)`, 
            age: user.age > 18 ? user.age : 30, 
            gender: Gender.MASCULINO,
            biotype: Biotype.PADRAO,
            height: 175
          },
          partner2: user.partner2 || { 
            nickname: `${user.nickname} (P2)`, 
            age: user.age > 18 ? user.age - 2 : 28, 
            gender: Gender.FEMININO,
            biotype: Biotype.CURVILINEO,
            height: 165
          }
        };
        setUser(updatedUser);
      }
    }
  }, [user.type, user.nickname, user.age]);

  /**
   * Alterna dinamicamente entre status de Solteiro e Casal
   */
  const toggleStatus = () => {
    if (!isOwnProfile) return;
    
    // Simula transição de tipo de perfil
    const nextType = user.type === UserType.CASAIS ? UserType.HOMEM : UserType.CASAIS;
    
    soundService.play('MATCH');
    
    let updatedUser = { ...user, type: nextType };
    
    // Se mudou para casal e não tem dados de parceiros, inicializa com dados base
    if (nextType === UserType.CASAIS) {
      if (!updatedUser.partner1) {
        updatedUser.partner1 = { 
          nickname: `${user.nickname} (P1)`, 
          age: user.age, 
          gender: user.gender,
          biotype: user.biotype,
          height: user.height,
          sexualPreference: user.sexualOrientation
        };
      }
      if (!updatedUser.partner2) {
        updatedUser.partner2 = { 
          nickname: `${user.nickname} (P2)`, 
          age: user.age, 
          gender: user.gender === Gender.MASCULINO ? Gender.FEMININO : Gender.MASCULINO,
          biotype: Biotype.PADRAO,
          height: 165,
          sexualPreference: SexualOrientation.BISSEXUAL
        };
      }
    }
    
    setUser(updatedUser);
    saveUserData(updatedUser);
    showNotification(`Status alterado para: ${nextType === UserType.CASAIS ? 'MODO CASAL' : 'MODO SOLTEIRO'}`, 'success');
  };

  /**
   * Salva os dados do perfil com validação e log de auditoria
   */
  const handleSaveProfile = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    log('info', '[AUDIT][EDIT_PROFILE] Iniciando salvamento de dados', user);

    try {
        // Validação de inputs (Campos obrigatórios e tipos)
        if (!user.nickname || user.nickname.length < 3) {
            throw new Error('Apelido deve ter pelo menos 3 caracteres');
        }
        
        if (!user.age || user.age < 18) {
            throw new Error('Idade mínima permitida é 18 anos');
        }

        // Sanitização e Simulação de API
        const sanitizedNickname = sanitizeInput(user.nickname);
        await simulateApiCall('PROFILE_UPDATE', { ...user, nickname: sanitizedNickname });

        // Persistência
        saveUserData(user);
        setIsEditing(false);
        showNotification('Perfil atualizado com sucesso!', 'success');
        log('info', '[AUDIT][EDIT_PROFILE] Sucesso na persistência de dados');
        
        refreshSession();
        soundService.play('MATCH');
    } catch (err: any) {
        log('error', '[AUDIT][EDIT_PROFILE] Falha na validação ou persistência', err);
        showNotification(err.message || 'Erro ao salvar perfil', 'error');
    } finally {
        setIsSaving(false);
    }
  };

  /**
   * Renderiza o formulário de edição
   */
  const renderEditForm = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-5">
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-2 border-b border-white/5 pb-2">
                <Settings size={16} className="text-amber-500" />
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Edição de Matriz</h3>
            </div>

            {/* Nova Seção: Alterar Avatar */}
            <div className="flex flex-col items-center gap-4 py-4 bg-slate-900/40 rounded-[2rem] border border-white/5">
                <div className="relative group">
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-[1.8rem] object-cover border-2 border-amber-500/30 group-hover:border-amber-500 transition-all shadow-xl"
                    />
                    <button 
                      onClick={() => handleAddPhoto('avatar')}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                        <Camera size={18} />
                    </button>
                </div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Alterar Foto Principal</p>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Status / Tipo</label>
                        <Select 
                            value={user.type || ''}
                            onChange={(val) => {
                                const nextType = val as UserType;
                                log('info', `[PROFILE_EDIT] Alterando tipo para: ${nextType}`);
                                setUser({ ...user, type: nextType });
                            }}
                            options={[
                                { value: UserType.HOMEM, label: 'Homem (Solteiro)' },
                                { value: UserType.MULHER, label: 'Mulher (Solteira)' },
                                { value: UserType.CASAIS, label: 'Casal' },
                            ]}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Nickname</label>
                        <Input 
                            value={user.nickname}
                            onChange={(val) => setUser({...user, nickname: val})}
                            placeholder="Nome de Exibição"
                        />
                    </div>
                </div>

                {/* Bio sempre visível */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Bio / Recado</label>
                    <Input 
                        value={user.bio || ''}
                        onChange={(val) => setUser({...user, bio: val})}
                        placeholder="Uma breve frase sobre você..."
                    />
                </div>

                {/* Campos Individuais - Só aparecem se NÃO for casal */}
                {!(user.type === UserType.CASAIS || 
                  String(user.type).toLowerCase() === 'casais' || 
                  String(user.type).toLowerCase() === 'casal') && (
                  <div className="space-y-6 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Idade</label>
                            <Input 
                                type="number"
                                value={user.age === 0 ? '' : user.age.toString()}
                                onChange={(val) => {
                                    const parsed = parseInt(val);
                                    setUser({...user, age: isNaN(parsed) ? 0 : parsed});
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Gênero</label>
                            <Select 
                                value={user.gender || ''}
                                onChange={(val) => setUser({...user, gender: val as Gender})}
                                options={Object.values(Gender).map(g => ({ value: g, label: g }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Orientação</label>
                            <Select 
                                value={user.sexualOrientation || ''}
                                onChange={(val) => setUser({...user, sexualOrientation: val as SexualOrientation})}
                                options={Object.values(SexualOrientation).map(o => ({ value: o, label: o }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Biotipo</label>
                            <Select 
                                value={user.biotype || ''}
                                onChange={(val) => setUser({...user, biotype: val as Biotype})}
                                options={Object.values(Biotype).map(b => ({ value: b, label: b }))}
                            />
                        </div>
                    </div>
                  </div>
                )}

                {/* Seção Casal Dinâmica - Refatorada para Visibilidade Máxima */}
                {(user.type === UserType.CASAIS || 
                  String(user.type).toLowerCase() === 'casais' || 
                  String(user.type).toLowerCase() === 'casal') && (
                    <div className="space-y-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-xl bg-pink/10 flex items-center justify-center text-pink">
                                <Users size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-[12px] font-black text-white uppercase tracking-widest italic">Protocolo Dual: Integrantes</h3>
                                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Sincronize os dados de ambos (Homem & Mulher)</p>
                            </div>
                        </div>
 
                        <div className="flex flex-col gap-6">
                            {/* Homem */}
                            <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 space-y-5 shadow-2xl relative overflow-hidden group">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                                        <span className="text-[10px] font-black text-white uppercase italic tracking-wider">Homem</span>
                                    </div>
                                    <Heart size={14} className="text-blue-500 group-hover:scale-125 transition-transform" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Idade</label>
                                        <Input 
                                            type="number"
                                            value={user.partner1?.age ? user.partner1.age.toString() : user.age.toString()}
                                            onChange={(val) => {
                                                const age = parseInt(val) || 0;
                                                setUser({...user, partner1: { ...(user.partner1 || { biotype: user.biotype, nickname: user.nickname, age: user.age, gender: user.gender, height: user.height, sexualPreference: user.sexualOrientation }), age }});
                                            }}
                                            placeholder="Ex: 53"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Altura</label>
                                        <Input 
                                            type="number"
                                            value={user.partner1?.height ? user.partner1.height.toString() : user.height.toString()}
                                            onChange={(val) => {
                                                const height = parseInt(val) || 0;
                                                setUser({...user, partner1: { ...(user.partner1 || { biotype: user.biotype, nickname: user.nickname, age: user.age, gender: user.gender, height: user.height, sexualPreference: user.sexualOrientation }), height }});
                                            }}
                                            placeholder="Ex: 180"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Biotipo</label>
                                        <Select 
                                            value={user.partner1?.biotype || user.biotype}
                                            onChange={(val) => setUser({...user, partner1: { ...(user.partner1 || { biotype: user.biotype, nickname: user.nickname, age: user.age, gender: user.gender, height: user.height, sexualPreference: user.sexualOrientation }), biotype: val as Biotype }})}
                                            options={Object.values(Biotype).map(b => ({ value: b, label: b }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Orientação</label>
                                        <Select 
                                            value={user.partner1?.sexualPreference || user.sexualOrientation}
                                            onChange={(val) => setUser({...user, partner1: { ...(user.partner1 || { biotype: user.biotype, nickname: user.nickname, age: user.age, gender: user.gender, height: user.height, sexualPreference: user.sexualOrientation }), sexualPreference: val as SexualOrientation }})}
                                            options={Object.values(SexualOrientation).map(o => ({ value: o, label: o }))}
                                        />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full -z-10 group-hover:bg-blue-500/10 transition-colors" />
                            </div>
 
                            {/* Mulher */}
                            <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-pink-500/20 space-y-5 shadow-2xl relative overflow-hidden group">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-pink shadow-[0_0_8px_#ff1493]" />
                                        <span className="text-[10px] font-black text-white uppercase italic tracking-wider">Mulher</span>
                                    </div>
                                    <Heart size={14} className="text-pink group-hover:scale-125 transition-transform" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Idade</label>
                                        <Input 
                                            type="number"
                                            value={user.partner2?.age ? user.partner2.age.toString() : ''}
                                            onChange={(val) => {
                                                const age = parseInt(val) || 0;
                                                setUser({...user, partner2: { ...(user.partner2 || { biotype: Biotype.PADRAO, nickname: '', age: 0, gender: Gender.FEMININO, height: 165, sexualPreference: SexualOrientation.BISSEXUAL }), age }});
                                            }}
                                            placeholder="Ex: 45"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Altura</label>
                                        <Input 
                                            type="number"
                                            value={user.partner2?.height ? user.partner2.height.toString() : ''}
                                            onChange={(val) => {
                                                const height = parseInt(val) || 0;
                                                setUser({...user, partner2: { ...(user.partner2 || { biotype: Biotype.PADRAO, nickname: '', age: 0, gender: Gender.FEMININO, height: 165, sexualPreference: SexualOrientation.BISSEXUAL }), height }});
                                            }}
                                            placeholder="Ex: 165"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Biotipo</label>
                                        <Select 
                                            value={user.partner2?.biotype || ''}
                                            onChange={(val) => setUser({...user, partner2: { ...(user.partner2 || { biotype: Biotype.PADRAO, nickname: '', age: 0, gender: Gender.FEMININO, height: 165, sexualPreference: SexualOrientation.BISSEXUAL }), biotype: val as Biotype }})}
                                            options={Object.values(Biotype).map(b => ({ value: b, label: b }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">Orientação</label>
                                        <Select 
                                            value={user.partner2?.sexualPreference || ''}
                                            onChange={(val) => setUser({...user, partner2: { ...(user.partner2 || { biotype: Biotype.PADRAO, nickname: '', age: 0, gender: Gender.FEMININO, height: 165, sexualPreference: SexualOrientation.BISSEXUAL }), sexualPreference: val as SexualOrientation }})}
                                            options={Object.values(SexualOrientation).map(o => ({ value: o, label: o }))}
                                        />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-pink/5 blur-3xl rounded-full -z-10 group-hover:bg-pink/10 transition-colors" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>

        <div className="flex gap-4">
            <ActionButton 
                label="Cancelar" 
                onClick={() => setIsEditing(false)} 
                variant="danger" 
                className="bg-slate-900 border-white/5"
            />
            <ActionButton 
                label="Salvar Alterações" 
                onClick={handleSaveProfile} 
                loading={isSaving}
                variant="amber" 
            />
        </div>
    </div>
  );

  const isOuro = user.trustLevel === TrustLevel.OURO;
  const isPremium = isPremiumUser(user);

  return (
    <div className={`p-6 space-y-8 animate-in fade-in pb-32 min-h-full ${isOuro ? 'bg-[#050505] bg-gradient-to-b from-amber-500/5 to-transparent' : 'bg-[#050505]'}`}>
      {editingImageUrl && <ImageEditor imageUrl={editingImageUrl} onSave={handlePhotoSave} onCancel={() => setEditingImageUrl(null)} />}
      {showVerification && <VerificationPortal onClose={() => setShowVerification(false)} onSuccess={() => refreshSession()} />}
      {showNoFakeModal && <VerificationModal isOpen={showNoFakeModal} onClose={() => setShowNoFakeModal(false)} user={user} />}
      
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

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
            <VerificationGate user={cache.userData}>
                <div className="flex items-center gap-2">
                    <button 
                    onClick={async () => {
                        const newValue = !isFollowing;
                        const result = await toggleFollow(user.id);
                        setIsFollowing(result);
                        soundService.play('LIKE');
                        showNotification(result ? `Você agora segue ${user.nickname}` : `Você deixou de seguir ${user.nickname}`, 'success');
                    }} 
                    className={`p-3 rounded-2xl border transition-all active:scale-90 shadow-xl ${isFollowing ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-900 text-amber-500 border-amber-500/20'}`}
                    >
                        {isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
                    </button>
                    <button 
                    onClick={() => {
                        showNotification(`Você deu um Vouch de respeito para ${user.nickname}!`, 'success');
                        soundService.play('MATCH');
                    }}
                    className="p-3 rounded-2xl border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 transition-all active:scale-90 shadow-xl"
                    title="Dar Vouch (Endosso)"
                    >
                        <ShieldCheck size={20} />
                    </button>
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="p-3 rounded-2xl border bg-rose-500/10 text-rose-500 border-rose-500/20 transition-all active:scale-90 shadow-xl"
                      title="Denunciar Perfil"
                    >
                        <ShieldAlert size={20} />
                    </button>
                </div>
            </VerificationGate>
        )}
      </div>

      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div 
            onClick={() => setShowPhotoGrid(true)}
            className={`w-32 h-32 rounded-[2.5rem] p-1 shadow-2xl transition-transform active:scale-95 cursor-pointer relative overflow-hidden ${isOuro ? 'bg-gradient-to-tr from-amber-400 to-amber-700 shadow-amber-500/30' : 'bg-slate-800'}`}
          >
            <BlurredImage 
              src={user.avatar} 
              alt={user.nickname}
              isInitiallyBlurred={!isOwnProfile && user.prefersBlurredPhotos}
              canUnlock={!isOwnProfile}
              className="w-full h-full rounded-[2.2rem] border-4 border-[#050505]"
            />
            
            {!isOwnProfile && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center border-t border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                   <Globe size={10} className={user.isOnline ? "text-emerald-500 animate-pulse" : "text-amber-500"} />
                   <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">
                     {user.city || user.location || 'Localização Oculta'}
                   </span>
                </div>
                {cache.userData?.lat && cache.userData?.lon && user.lat && user.lon ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] leading-none mb-1">
                      {formatDistanceLabel(haversineKm(cache.userData.lat, cache.userData.lon, user.lat, user.lon))} de você
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full ${user.isOnline ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`} />
                      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
                        {user.isOnline ? 'Localização em Tempo Real' : (user.updatedAt ? `Visto em ${new Date(user.updatedAt).toLocaleDateString()}` : 'Posição estimada')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Distância Indisponível</span>
                )}
              </div>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 p-2 rounded-xl border-2 border-[#050505] shadow-lg ${user.verifiedAccount ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
            {isOuro ? <Crown size={18} fill="currentColor" /> : <BadgeCheck size={18} />}
          </div>
        </div>
        
        <div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black font-mono text-amber-500/60 tracking-[0.4em] uppercase">ID: {user.serialNumber || '------'}</span>
            <h2 className={`text-3xl font-black font-outfit uppercase italic tracking-tighter ${isOuro ? 'text-amber-400' : 'text-white'}`}>
              {user.nickname}
              {!(user.type === UserType.CASAIS || 
                String(user.type).toLowerCase() === 'casais' || 
                String(user.type).toLowerCase() === 'casal') && `, ${user.age}`}
            </h2>
          </div>
          
          {(user.type === UserType.CASAIS || 
            String(user.type).toLowerCase() === 'casais' || 
            String(user.type).toLowerCase() === 'casal') && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] font-black text-blue-500 uppercase italic tracking-widest leading-none">H: {user.partner1?.age || user.age}</span>
              <span className="text-slate-700">•</span>
              <span className="text-[10px] font-black text-pink uppercase italic tracking-widest leading-none">M: {user.partner2?.age || 'N/A'}</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-2 mt-2">
            
            {/* Toggle de Status Estilizado */}
            {isOwnProfile && (
                <button 
                    onClick={toggleStatus}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/5 transition-all group active:scale-95 disabled:opacity-50"
                >
                    <div className={`w-2 h-2 rounded-full animate-pulse ${user.type === UserType.CASAIS ? 'bg-pink shadow-[0_0_8px_#ff1493]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none">
                        {user.type === UserType.CASAIS ? 'Modo Casal Ativo' : 'Modo Solteiro Ativo'}
                    </span>
                    <Users size={12} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>
            )}

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

          <div className={`p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex justify-between items-center mt-6`}>
              <div className="text-center group flex-1">
                 <div className="flex items-center justify-center gap-1.5 text-pink">
                    <Heart size={14} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                    <span className="font-black text-lg italic tracking-tighter">{user.totalLikes || 0}</span>
                 </div>
                 <p className="text-[7px] text-slate-500 uppercase font-bold tracking-widest mt-1">Crushes</p>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="text-center group flex-1">
                 <div className="flex items-center justify-center gap-1.5 text-amber-500">
                    <Eye size={14} className="group-hover:scale-125 transition-transform" />
                    <span className="font-black text-lg italic tracking-tighter">{user.totalViews || 0}</span>
                 </div>
                 <p className="text-[7px] text-slate-500 uppercase font-bold tracking-widest mt-1">Visitas</p>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="text-center group flex-1">
                 <div className="flex items-center justify-center gap-1.5 text-blue-400">
                    <ShieldCheck size={14} className="group-hover:scale-125 transition-transform" />
                    <span className="font-black text-lg italic tracking-tighter">{user.vouchScore || 0}%</span>
                 </div>
                 <p className="text-[7px] text-slate-500 uppercase font-bold tracking-widest mt-1">Vouch Score</p>
              </div>
          </div>

          <div className="mx-auto w-full max-w-[340px] pt-4">
          {!isEditing && (
              <SegmentedControl 
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as 'info' | 'gallery' | 'trust')}
                tabs={[
                  { id: 'info', label: 'Infos', icon: <Fingerprint /> },
                  { id: 'gallery', label: 'Galeria', icon: <ImageIcon /> },
                  { id: 'trust', label: 'Matriz', icon: <ShieldCheck /> }
                ]}
              />
          )}
      </div>

      {isEditing ? (
        renderEditForm()
      ) : (
        <>
          {activeTab === 'info' && (
        <div className="space-y-10 animate-in slide-in-from-left-5">
            {isOwnProfile && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-2 border-b border-white/5 pb-2">
                    <ShieldCheck size={16} className="text-amber-500" />
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Segurança Estratégica</h3>
                </div>
                <StealthModeToggle 
                  isActive={user.isStealthMode} 
                  onToggle={() => {
                    const newValue = !user.isStealthMode;
                    setUser(prev => ({ ...prev, isStealthMode: newValue }));
                    saveUserData({ ...user, isStealthMode: newValue });
                    showNotification(newValue ? 'Modo Stealth Ativado' : 'Modo Stealth Desativado', 'success');
                  }} 
                />
                
                <button 
                  onClick={() => {
                    const newValue = !user.prefersBlurredPhotos;
                    setUser(prev => ({ ...prev, prefersBlurredPhotos: newValue }));
                    saveUserData({ ...user, prefersBlurredPhotos: newValue });
                  }}
                  className={`w-full p-4 rounded-3xl border flex items-center justify-between transition-all ${user.prefersBlurredPhotos ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/40 border-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.prefersBlurredPhotos ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                      <Palette size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-white uppercase italic">Blur Automático</h4>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Suas fotos ficam borradas para estranhos</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${user.prefersBlurredPhotos ? 'bg-amber-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${user.prefersBlurredPhotos ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              </section>
            )}

            <section className="space-y-6">
                <div className="flex items-center gap-2 px-2 border-b border-white/5 pb-2">
                    <Fingerprint size={16} className="text-amber-500" />
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Identidade</h3>
                </div>
                {user.bio && <div className="px-2"><p className="text-[10px] text-slate-300 italic leading-relaxed">"{user.bio}"</p></div>}
                
                {(user.type === UserType.CASAIS || 
                  String(user.type).toLowerCase() === 'casais' || 
                  String(user.type).toLowerCase() === 'casal') ? (
                  <div className="space-y-6">
                    {/* Homem Display */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[9px] font-black text-white uppercase italic tracking-widest">Homem</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <MatrixCard icon={<Wind size={14}/>} label="Idade" value={user.partner1?.age || 'N/A'} />
                          <MatrixCard icon={<Heart size={14}/>} label="Orientação" value={user.partner1?.sexualPreference || user.sexualOrientation || 'N/A'} />
                          <MatrixCard icon={<Ruler size={14}/>} label="Altura" value={user.partner1?.height ? `${user.partner1.height}cm` : 'N/A'} />
                          <MatrixCard icon={<Palette size={14}/>} label="Biotipo" value={user.partner1?.biotype || 'N/A'} />
                      </div>
                    </div>

                    {/* Mulher Display */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink" />
                        <span className="text-[9px] font-black text-white uppercase italic tracking-widest">Mulher</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <MatrixCard icon={<Wind size={14}/>} label="Idade" value={user.partner2?.age || 'N/A'} />
                          <MatrixCard icon={<Heart size={14}/>} label="Orientação" value={user.partner2?.sexualPreference || 'N/A'} />
                          <MatrixCard icon={<Ruler size={14}/>} label="Altura" value={user.partner2?.height ? `${user.partner2.height}cm` : 'N/A'} />
                          <MatrixCard icon={<Palette size={14}/>} label="Biotipo" value={user.partner2?.biotype || 'N/A'} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                      <MatrixCard icon={<Wind size={14}/>} label="Gênero" value={user.gender || 'N/A'} />
                      <MatrixCard icon={<Heart size={14}/>} label="Orientação" value={user.sexualOrientation || 'N/A'} />
                      <MatrixCard icon={<Ruler size={14}/>} label="Altura" value={user.height ? `${user.height}cm` : 'N/A'} />
                      <MatrixCard icon={<Palette size={14}/>} label="Biotipo" value={user.biotype || 'N/A'} />
                  </div>
                )}
                
                {isOwnProfile && (
                    <div className="pt-4 px-2">
                        <button 
                            onClick={async () => {
                                const active = await toggleGhostMode();
                                setUser(prev => ({ ...prev, isGhostMode: active }));
                                soundService.play('MATCH');
                                showNotification(active ? 'Modo Ghost Ativado' : 'Modo Ghost Desativado', 'info');
                            }}
                            className={`w-full p-4 rounded-[2rem] border transition-all flex items-center justify-between group ${user.isGhostMode ? 'bg-purple-600/10 border-purple-500/30' : 'bg-slate-900/40 border-white/5'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${user.isGhostMode ? 'bg-purple-500 text-white' : 'bg-slate-950 text-slate-600'}`}>
                                    <Ghost size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className={`text-xs font-black uppercase italic tracking-tight ${user.isGhostMode ? 'text-purple-400' : 'text-white'}`}>Modo Ghost</h4>
                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mt-1">Navegação Invisível</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${user.isGhostMode ? 'bg-purple-600' : 'bg-slate-800'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${user.isGhostMode ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                    </div>
                )}
            </section>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-in slide-in-from-right-5">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-amber-500" />
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
                        {isEditingGallery ? 'Gerenciar Galeria' : 'Galeria Central'}
                    </h3>
                </div>
                {isOwnProfile && (
                    <button 
                        onClick={() => setIsEditingGallery(!isEditingGallery)} 
                        className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isEditingGallery ? 'text-white' : 'text-amber-500'}`}
                    >
                        {isEditingGallery ? 'Concluído' : 'Editar'}
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 px-1">
                {isEditingGallery && (
                    <button 
                        onClick={() => handleAddPhoto('gallery')}
                        className="aspect-square bg-slate-900/40 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:bg-slate-900/60 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Plus size={20} />
                        </div>
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Adicionar</span>
                    </button>
                )}
                {(user.gallery || []).slice(0, isEditingGallery ? 20 : 6).map((photo, i) => (
                    <div 
                        key={photo.id} 
                        onClick={() => !isEditingGallery && setShowPhotoGrid(true)}
                        className="aspect-square bg-slate-900 rounded-2xl overflow-hidden relative border border-white/5 active:scale-95 transition-transform"
                    >
                        <img src={photo.url} className="w-full h-full object-cover" alt="Galeria" />
                        {isEditingGallery && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {!isEditingGallery && (
                <button 
                    onClick={() => setShowPhotoGrid(true)}
                    className="w-full py-4 bg-slate-900/50 border border-white/5 rounded-3xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-900 transition-colors"
                >
                    Ver Galeria Completa
                </button>
            )}
        </div>
      )}

      {activeTab === 'trust' && (
        <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center py-4">
             <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-slate-900 border border-amber-500/10 flex items-center justify-center text-amber-500 shadow-2xl overflow-hidden relative">
                    <ShieldCheck size={48} className={user.vouchScore && user.vouchScore > 70 ? 'text-green-500' : 'text-amber-500'} />
                    {user.vouchScore && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-800">
                             <div className="h-full bg-amber-500" style={{ width: `${user.vouchScore}%` }} />
                        </div>
                    )}
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-500 text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Vouch Score</div>
             </div>
             
             <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left px-2">Matriz de Consentimento</h3>
                <ConsentMatrix items={user.consentMatrix || []} />
             </div>

             <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                    {user.vouchScore ? `Vouch Social: ${user.vouchScore}%` : `Nível ${user.trustLevel}`}
                </h3>
                <p className="text-slate-500 text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
                    Sua reputação é validada pelo sistema **NoFake**. Membros verificados têm acesso à Matriz Gold e eventos exclusivos.
                </p>
                
                {isOwnProfile && (
                    <button 
                        onClick={() => setShowNoFakeModal(true)}
                        className="mt-6 px-8 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-transform shadow-xl"
                    >
                        Aumentar Score
                    </button>
                )}
             </div>

             <div className="grid grid-cols-4 gap-2 px-2 mt-4">
                {['identity', 'photo', 'social', 'trust'].map((lvl) => (
                    <div key={lvl} className={`p-3 rounded-2xl border ${user.verificationLevels?.[lvl as keyof typeof user.verificationLevels] ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-slate-900 border-white/5 text-slate-700'}`}>
                        {lvl === 'identity' && <UserCheck size={18} />}
                        {lvl === 'photo' && <Camera size={18} />}
                        {lvl === 'social' && <Globe size={18} />}
                        {lvl === 'trust' && <ShieldCheck size={18} />}
                    </div>
                ))}
             </div>
        </div>
      )}
      
      <div className="space-y-4 pt-6">
        {showPhotoGrid && (
            <PhotoGridModal 
                photos={user.gallery || []} 
                onClose={() => setShowPhotoGrid(false)} 
                isBlurred={!isOwnProfile && user.hasBlurredGallery}
            />
        )}
        {isOwnProfile && !isPremium && (
            <div className="px-2 mt-4">
                <button 
                    onClick={() => onNavigate?.('assinatura')} 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-3xl flex items-center justify-between group active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                >
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/20 rounded-xl">
                        <Zap size={20} className="text-white animate-pulse" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-black/60 uppercase tracking-widest leading-none">Upgrade Premium</p>
                        <p className="text-sm font-black text-white uppercase italic tracking-tighter">Ativar Plano Gold</p>
                    </div>
                    </div>
                    <ChevronLeft size={20} className="text-white rotate-180 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        )}

        {isOwnProfile && (
            <div className="px-2 mt-4 space-y-4">
                <div className="p-6 rounded-[2.5rem] bg-slate-900/60 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2">
                        <HelpCircle size={16} className="text-amber-500" />
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Suporte à Matriz</h4>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                        Dúvidas sobre sua conta ou pagamentos? Entre em contato:
                    </p>
                    <a 
                        href="mailto:libidoapp@gmail.com"
                        className="block w-full py-3 bg-white/5 rounded-2xl text-center text-amber-500 text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        libidoapp@gmail.com
                    </a>
                </div>
            </div>
        )}

        {isOwnProfile && <ActionButton label="Configuração" onClick={() => setIsEditing(true)} variant="amber" icon={<Settings size={20} />} />}
        {isOwnProfile && <ActionButton label="Encerrar Sessão" onClick={() => logout()} variant="danger" icon={<LogOut size={20} />} />}
      </div>
      
      {!isOwnProfile && (
        <ReportModal 
          isOpen={showReportModal} 
          onClose={() => setShowReportModal(false)}
          reportedUserId={user.id}
          reportedUserName={user.nickname}
        />
      )}
     </>
    )}
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
