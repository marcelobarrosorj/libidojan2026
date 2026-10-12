import { useState, useEffect, ChangeEvent } from 'react';
import { Eye, Lock, Camera, Sparkles, Edit3, Plus, Trash2, Check, Users } from 'lucide-react';
import { uploadPhoto } from '../services/uploadPhoto';
import { ImageEditor } from './ImageEditor';
import { User } from '../types';
import { ProtectedImage } from './ProtectedImage';
import { formatUserNumber } from '../utils/formatUserNumber';
import { updateUserProfile } from '../services/users';

interface ProfileProps {
  userId?: string;
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
  onLogout?: () => void;
  navigate?: (tab: string, params?: any) => void;
  currentUser?: User | null;
}

export function Profile({ userId, isPremium, onShowPremiumModal, onLogout, navigate, currentUser }: ProfileProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // States do Perfil de Casal
  const [isCouple, setIsCouple] = useState(false);
  const [maleNickname, setMaleNickname] = useState('');
  const [maleAge, setMaleAge] = useState('');
  const [maleOrientation, setMaleOrientation] = useState('Heterossexual');
  const [maleBiotype, setMaleBiotype] = useState('Padrão');
  const [maleHeight, setMaleHeight] = useState('');
  const [maleWeight, setMaleWeight] = useState('');

  const [femaleNickname, setFemaleNickname] = useState('');
  const [femaleAge, setFemaleAge] = useState('');
  const [femaleOrientation, setFemaleOrientation] = useState('Bissexual');
  const [femaleBiotype, setFemaleBiotype] = useState('Padrão');
  const [femaleHeight, setFemaleHeight] = useState('');
  const [femaleWeight, setFemaleWeight] = useState('');

  // States do Perfil Solteiro
  const [singleAge, setSingleAge] = useState('');
  const [singleGender, setSingleGender] = useState('Masculino');
  const [singleOrientation, setSingleOrientation] = useState('Bissexual');
  const [singleBiotype, setSingleBiotype] = useState('Padrão');
  const [singleHeight, setSingleHeight] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEditNickname(currentUser.nickname || '');
      const rawBio = currentUser.bio || '';
      const relationship = currentUser.relationship_status || 'solteiro';
      
      try {
        const parsed = JSON.parse(rawBio);
        if (parsed && parsed.isCouple) {
          setIsCouple(true);
          setMaleNickname(parsed.maleNickname || '');
          setMaleAge(parsed.maleAge?.toString() || '');
          setMaleOrientation(parsed.maleOrientation || 'Heterossexual');
          setMaleBiotype(parsed.maleBiotype || 'Padrão');
          setMaleHeight(parsed.maleHeight || '');
          setMaleWeight(parsed.maleWeight || '');

          setFemaleNickname(parsed.femaleNickname || '');
          setFemaleAge(parsed.femaleAge?.toString() || '');
          setFemaleOrientation(parsed.femaleOrientation || 'Bissexual');
          setFemaleBiotype(parsed.femaleBiotype || 'Padrão');
          setFemaleHeight(parsed.femaleHeight || '');
          setFemaleWeight(parsed.femaleWeight || '');
          setEditBio(parsed.text || '');
        } else {
          setupSingleData();
        }
      } catch (e) {
        setupSingleData();
      }

      function setupSingleData() {
        setIsCouple(relationship === 'casal');
        setEditBio(rawBio);
        setSingleAge(currentUser.age?.toString() || '');
        setSingleGender(currentUser.gender || 'Masculino');
        setSingleOrientation(currentUser.sexual_orientation || 'Bissexual');
        setSingleBiotype(currentUser.biotype || 'Padrão');
        setSingleHeight(currentUser.height?.toString() || '');
      }
    }
  }, [currentUser]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditingImageUrl(event.target.result as string);
        setIsEditingAvatar(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGalleryUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditingImageUrl(event.target.result as string);
        setIsEditingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const handleImageEdited = async (editedUrl: string) => {
    if (!userId) return;
    setUploading(true);
    try {
      const arr = editedUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      const editedFile = new File([u8arr], `edited_${Date.now()}.jpg`, { type: mime });
      
      const url = await uploadPhoto(editedFile, userId);

      if (isEditingAvatar) {
        await updateUserProfile(userId, { photo_url: url });
        alert("Foto do perfil atualizada!");
      } else {
        const currentPhotos = currentUser?.photos || [];
        const updatedPhotos = [...currentPhotos, url];
        await updateUserProfile(userId, { photos: updatedPhotos });
        alert("Foto editada e adicionada à galeria com sucesso!");
      }
      
      setEditingImageUrl(null);
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err: any) {
      alert("Erro ao salvar foto: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSetAsAvatar = async (url: string) => {
    if (!userId) return;
    try {
      await updateUserProfile(userId, { photo_url: url });
      alert("Sua foto de perfil foi alterada!");
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err: any) {
      alert("Erro ao alterar: " + err.message);
    }
  };

  const handleDeletePhoto = async (urlToDelete: string) => {
    if (!userId || !confirm("Deseja realmente excluir esta foto da sua galeria secreta?")) return;
    try {
      const currentPhotos = currentUser?.photos || [];
      const updatedPhotos = currentPhotos.filter((url: string) => url !== urlToDelete);
      await updateUserProfile(userId, { photos: updatedPhotos });
      alert("Foto excluída!");
      setActivePhotoIndex(null);
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) {
      alert("O apelido não pode ficar vazio.");
      return;
    }
    setSaving(true);
    try {
      let bioContent = editBio;
      let genderVal = singleGender;
      let ageVal = singleAge ? parseInt(singleAge) : null;
      let relationVal = isCouple ? 'casal' : 'solteiro';

      if (isCouple) {
        bioContent = JSON.stringify({
          isCouple: true,
          maleNickname,
          maleAge: parseInt(maleAge),
          maleOrientation,
          maleBiotype,
          maleHeight,
          maleWeight,
          femaleNickname,
          femaleAge: parseInt(femaleAge),
          femaleOrientation,
          femaleBiotype,
          femaleHeight,
          femaleWeight,
          text: editBio
        });
        genderVal = 'Casal';
        ageVal = maleAge ? parseInt(maleAge) : null;
      }

      await updateUserProfile(userId, {
        nickname: editNickname,
        bio: bioContent,
        relationship_status: relationVal,
        gender: genderVal,
        age: ageVal ? ageVal.toString() : undefined,
        height: !isCouple && singleHeight ? parseInt(singleHeight) : undefined,
        biotype: !isCouple ? singleBiotype : undefined,
        sexual_orientation: !isCouple ? singleOrientation : undefined
      });

      alert("Perfil atualizado com sucesso!");
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
      setShowEditModal(false);
    }
  };

  const nickname = currentUser?.nickname || 'Explorador';
  const photoUrl = currentUser?.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
  const userPhotos: string[] = currentUser?.photos || [];

  return (
    <div className="flex-1 flex flex-col p-6 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0">
      <input type="file" id="avatar-input" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input type="file" id="gallery-input" accept="image/*" className="hidden" onChange={handleGalleryUpload} />

      <div className="flex flex-col items-center text-center mt-2 relative">
        <button onClick={onLogout} className="absolute top-0 right-0 text-[var(--libido-muted)] opacity-50 hover:text-[var(--libido-text)] text-xs font-black uppercase tracking-wider">Sair</button>
        
        <div className="relative w-24 h-24 rounded-[2.2rem] p-0.5 border-2 border-[var(--libido-accent)] shadow-[0_0_25px_rgba(255,179,0,0.15)] mb-4">
          <ProtectedImage currentUser={currentUser} src={photoUrl} alt="avatar" className="w-full h-full rounded-[2rem] border border-black" />
          <button 
            disabled={uploading}
            onClick={() => document.getElementById('avatar-input')?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--libido-accent)] rounded-xl flex items-center justify-center border border-black hover:opacity-90 active:scale-95 shadow-md disabled:opacity-55"
          >
            <Camera size={12} className="text-black" />
          </button>
        </div>

        <h2 className="text-lg font-black uppercase tracking-widest text-[var(--libido-text)] italic font-fraunces font-medium flex items-center gap-1.5 justify-center">
          {nickname}
          <Sparkles size={14} className="text-[var(--libido-accent)] fill-[var(--libido-accent)]" />
          {currentUser?.userNumber ? <span className="text-[12px] text-[var(--libido-muted)] opacity-50 ml-1">#{formatUserNumber(currentUser.userNumber)}</span> : null}
        </h2>
        
        <button 
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-1.5 mt-2.5 px-4 py-1.5 bg-white/5 border border-[var(--libido-border)] hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--libido-muted)] opacity-80 hover:text-[var(--libido-text)] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] animate-pulse"
        >
          <Edit3 size={10} className="text-[var(--libido-accent)]" />
          Configurar Perfil
        </button>

        <span className="text-[9px] font-black tracking-widest text-[var(--libido-muted)] opacity-50 uppercase mt-3">Status: {isPremium ? 'Membro Premium' : 'Membro Grátis'}</span>
      </div>

      <div className="h-[1px] bg-white/5 my-6"></div>

      {isCouple ? (
        <section className="mb-6 animate-in fade-in">
          <div className="flex items-center gap-2 px-1 border-b border-[var(--libido-border)] pb-2 mb-4">
            <Users size={14} className="text-[var(--libido-accent)]" />
            <h3 className="text-[10px] font-black text-[var(--libido-muted)] opacity-70 uppercase tracking-widest">Dados do Casal</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-accent)]/20 p-4 rounded-2xl text-left relative overflow-hidden shadow-[0_0_15px_rgba(255,179,0,0.03)]">
              <p className="text-[8px] font-black text-[var(--libido-accent)] tracking-widest uppercase mb-1.5">Ele 👨</p>
              <h4 className="text-sm font-black truncate">{maleNickname || 'Parceiro'}</h4>
              <p className="text-[10px] text-[var(--libido-muted)] opacity-70 font-semibold mt-1">{maleAge ? `${maleAge} anos` : 'Idade n/d'}</p>
              <span className="text-[9px] bg-white/5 text-[var(--libido-muted)] opacity-80 px-2 py-0.5 rounded-md mt-2 inline-block font-bold">{maleOrientation}</span>
              <div className="mt-3 pt-3 border-t border-[var(--libido-border)] text-[9px] text-[var(--libido-muted)] opacity-60 font-bold space-y-1">
                <p>BIOTIPO: <span className="text-[var(--libido-muted)] opacity-80">{maleBiotype}</span></p>
                <p>ALTURA: <span className="text-[var(--libido-muted)] opacity-80">{maleHeight ? `${maleHeight} cm` : 'n/d'}</span></p>
                <p>PESO: <span className="text-[var(--libido-muted)] opacity-80">{maleWeight ? `${maleWeight} kg` : 'n/d'}</span></p>
              </div>
            </div>

            <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-accent)]/20 p-4 rounded-2xl text-left relative overflow-hidden shadow-[0_0_15px_rgba(255,179,0,0.03)]">
              <p className="text-[8px] font-black text-[var(--libido-accent)] tracking-widest uppercase mb-1.5">Ela 👩</p>
              <h4 className="text-sm font-black truncate">{femaleNickname || 'Parceira'}</h4>
              <p className="text-[10px] text-[var(--libido-muted)] opacity-70 font-semibold mt-1">{femaleAge ? `${femaleAge} anos` : 'Idade n/d'}</p>
              <span className="text-[9px] bg-white/5 text-[var(--libido-muted)] opacity-80 px-2 py-0.5 rounded-md mt-2 inline-block font-bold">{femaleOrientation}</span>
              <div className="mt-3 pt-3 border-t border-[var(--libido-border)] text-[9px] text-[var(--libido-muted)] opacity-60 font-bold space-y-1">
                <p>BIOTIPO: <span className="text-[var(--libido-muted)] opacity-80">{femaleBiotype}</span></p>
                <p>ALTURA: <span className="text-[var(--libido-muted)] opacity-80">{femaleHeight ? `${femaleHeight} cm` : 'n/d'}</span></p>
                <p>PESO: <span className="text-[var(--libido-muted)] opacity-80">{femaleWeight ? `${femaleWeight} kg` : 'n/d'}</span></p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl text-left mb-6 relative overflow-hidden">
          <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 tracking-widest uppercase mb-1">Informações Pessoais</p>
          <div className="grid grid-cols-2 gap-4 text-xs font-bold mt-2">
            <p>GÊNERO: <span className="text-[var(--libido-muted)] opacity-90">{currentUser?.gender || 'n/d'}</span></p>
            <p>IDADE: <span className="text-[var(--libido-muted)] opacity-90">{currentUser?.age ? `${currentUser.age} anos` : 'n/d'}</span></p>
            <p>BIOTIPO: <span className="text-[var(--libido-muted)] opacity-90">{currentUser?.biotype || 'n/d'}</span></p>
            <p>ALTURA: <span className="text-[var(--libido-muted)] opacity-90">{currentUser?.height ? `${currentUser.height} cm` : 'n/d'}</span></p>
            <p>ORIENTAÇÃO: <span className="text-[var(--libido-muted)] opacity-90">{currentUser?.sexualOrientation || 'n/d'}</span></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 text-center mb-6">
        <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-3.5 rounded-2xl">
          <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-wider">Visualizações</p>
          <p className="text-sm font-black text-[var(--libido-text)] mt-1 flex items-center justify-center gap-1.5">
            <Eye size={12} className="text-[var(--libido-accent)]" />
            142
          </p>
        </div>
        <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-3.5 rounded-2xl">
          <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-wider">Interações</p>
          <p className="text-sm font-black text-[var(--libido-text)] mt-1">29</p>
        </div>
        <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-3.5 rounded-2xl">
          <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-wider">Seguidores</p>
          <p className="text-sm font-black text-[var(--libido-text)] mt-1">8</p>
        </div>
      </div>

      <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl mb-6 text-left">
        <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-wider mb-1.5">Sobre Nós / Bio</p>
        <p className="text-xs text-[var(--libido-muted)] opacity-90 font-medium leading-relaxed">{editBio || 'Sem biografia cadastrada...'}</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--libido-muted)] opacity-70">Galeria Secreta ({userPhotos.length})</h3>
          <button 
            onClick={() => document.getElementById('gallery-input')?.click()}
            className="flex items-center gap-1 text-[9px] font-bold text-[var(--libido-accent)] tracking-widest uppercase hover:underline"
          >
            <Plus size={10} />
            Postar Foto
          </button>
        </div>
        
        {userPhotos.length === 0 ? (
          <div 
            onClick={() => document.getElementById('gallery-input')?.click()}
            className="w-full aspect-[3/1] border border-dashed border-[var(--libido-border)] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <Plus size={20} className="text-[var(--libido-accent)] mb-1" />
            <span className="text-[9px] font-black uppercase text-[var(--libido-muted)] opacity-50 tracking-widest">Nenhuma foto postada. Clique para enviar!</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 relative">
            {userPhotos.map((imgUrl, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-[var(--libido-border)] relative shadow-md">
                <ProtectedImage currentUser={currentUser} src={imgUrl} alt="gallery" onClick={() => setActivePhotoIndex(idx)} className={`w-full h-full transition-all cursor-pointer hover:scale-105 ${!isPremium && idx > 0 ? "blur-md pointer-events-none" : ""}`} />
                {!isPremium && idx > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock size={12} className="text-[var(--libido-accent)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {activePhotoIndex !== null && userPhotos[activePhotoIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <button onClick={() => setActivePhotoIndex(null)} className="absolute top-6 right-6 text-[var(--libido-muted)] opacity-80 hover:text-[var(--libido-text)] text-lg">✕ Close</button>
          
          <ProtectedImage currentUser={currentUser} src={userPhotos[activePhotoIndex]} className="max-w-full max-h-[60vh] rounded-2xl border border-[var(--libido-border)] shadow-2xl mb-8" alt="Visualização" style={{ objectFit: "contain" }} />
          
          <div className="flex gap-4 w-full max-w-xs">
            <button 
              onClick={() => handleSetAsAvatar(userPhotos[activePhotoIndex])}
              className="flex-1 py-3 bg-[var(--libido-accent)] hover:bg-[#e6a200] text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg"
            >
              <Check size={12} />
              Usar como Perfil
            </button>
            <button 
              onClick={() => handleDeletePhoto(userPhotos[activePhotoIndex])}
              className="flex-1 py-3 bg-red-600/25 border border-red-500/20 hover:bg-red-600/40 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <Trash2 size={12} />
              Excluir Foto
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-[2rem] p-6 max-w-sm w-full relative animate-in fade-in duration-200 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-[var(--libido-muted)] opacity-60 hover:text-[var(--libido-text)] transition-colors">✕</button>
            <h3 className="text-base font-black text-[var(--libido-accent)] mb-4 uppercase tracking-widest italic font-fraunces font-medium">Configurações do Perfil</h3>
            
            <div className="space-y-3.5 text-left">
              <div>
                <label className="text-[8px] font-black uppercase text-[var(--libido-muted)] opacity-50 tracking-widest">Tipo de Perfil</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setIsCouple(false)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border ${!isCouple ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] border-[var(--libido-accent)]' : 'bg-transparent text-[var(--libido-text)] border-[var(--libido-border)]'}`}>Solteiro(a)</button>
                  <button onClick={() => setIsCouple(true)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border ${isCouple ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] border-[var(--libido-accent)]' : 'bg-transparent text-[var(--libido-text)] border-[var(--libido-border)]'}`}>Casal</button>
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-[var(--libido-muted)] opacity-50 tracking-widest">Apelido do Perfil</label>
                <input 
                  type="text" 
                  value={editNickname}
                  onChange={e => setEditNickname(e.target.value)}
                  className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)]"
                />
              </div>

              {isCouple ? (
                <div className="space-y-3 border-t border-[var(--libido-border)] pt-3">
                  <div className="bg-black/25 p-3 rounded-xl border border-[var(--libido-border)] space-y-2">
                    <p className="text-[8px] font-black text-[var(--libido-accent)] tracking-widest uppercase mb-1">Parceiro (Ele)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Apelido" value={maleNickname} onChange={e => setMaleNickname(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                      <input type="number" placeholder="Idade" value={maleAge} onChange={e => setMaleAge(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Altura (cm)" value={maleHeight} onChange={e => setMaleHeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                      <input type="text" placeholder="Peso (kg)" value={maleWeight} onChange={e => setMaleWeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={maleOrientation} onChange={e => setMaleOrientation(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none">
                        <option value="Heterossexual">Heterossexual</option>
                        <option value="Bissexual">Bissexual</option>
                        <option value="Homossexual">Homossexual</option>
                      </select>
                      <select value={maleBiotype} onChange={e => setMaleBiotype(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none">
                        <option value="Padrão">Biotipo: Padrão</option>
                        <option value="Atlético">Atlético</option>
                        <option value="Fortinho">Fortinho</option>
                        <option value="Magro">Magro</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-black/25 p-3 rounded-xl border border-[var(--libido-border)] space-y-2">
                    <p className="text-[8px] font-black text-[var(--libido-accent)] tracking-widest uppercase mb-1">Parceira (Ela)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Apelido" value={femaleNickname} onChange={e => setFemaleNickname(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                      <input type="number" placeholder="Idade" value={femaleAge} onChange={e => setFemaleAge(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Altura (cm)" value={femaleHeight} onChange={e => setFemaleHeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                      <input type="text" placeholder="Peso (kg)" value={femaleWeight} onChange={e => setFemaleWeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--libido-accent)] text-[var(--libido-text)]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={femaleOrientation} onChange={e => setFemaleOrientation(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none">
                        <option value="Bissexual">Bissexual</option>
                        <option value="Heterossexual">Heterossexual</option>
                        <option value="Homossexual">Homossexual</option>
                      </select>
                      <select value={femaleBiotype} onChange={e => setFemaleBiotype(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none">
                        <option value="Padrão">Biotipo: Padrão</option>
                        <option value="Magro">Magro</option>
                        <option value="Atlético">Atlético</option>
                        <option value="Curvilínea">Curvilínea</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-t border-[var(--libido-border)] pt-3 animate-in fade-in">
                  <p className="text-[8px] font-black text-[var(--libido-muted)] opacity-50 tracking-widest uppercase mb-1">Dados Individuais</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-[var(--libido-muted)] opacity-60 font-bold uppercase">Idade</label>
                      <input type="number" placeholder="Idade" value={singleAge} onChange={e => setSingleAge(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-text)] focus:outline-none mt-1"/>
                    </div>
                    <div>
                      <label className="text-[8px] text-[var(--libido-muted)] opacity-60 font-bold uppercase">Gênero</label>
                      <select value={singleGender} onChange={e => setSingleGender(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none mt-1">
                        <option value="Masculino">Homem</option>
                        <option value="Feminino">Mulher</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-[var(--libido-muted)] opacity-60 font-bold uppercase">Altura (cm)</label>
                      <input type="number" placeholder="Altura" value={singleHeight} onChange={e => setSingleHeight(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-text)] focus:outline-none mt-1"/>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-[var(--libido-muted)] opacity-60 font-bold uppercase">Orientação</label>
                      <select value={singleOrientation} onChange={e => setSingleOrientation(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none mt-1">
                        <option value="Bissexual">Bissexual</option>
                        <option value="Heterossexual">Heterossexual</option>
                        <option value="Homossexual">Homossexual</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] text-[var(--libido-muted)] opacity-60 font-bold uppercase">Biotipo</label>
                      <select value={singleBiotype} onChange={e => setSingleBiotype(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-lg px-3 py-2 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none mt-1">
                        <option value="Padrão">Padrão</option>
                        <option value="Atlético">Atlético</option>
                        <option value="Fortinho">Fortinho</option>
                        <option value="Magro">Magro</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[8px] font-black uppercase text-[var(--libido-muted)] opacity-50 tracking-widest">Sobre Nós / Bio</label>
                <textarea 
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] h-14 resize-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-3.5 rounded-2xl mt-6 text-xs uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-[var(--libido-accent)]/10"
            >
              {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
            </button>
          </div>
        </div>
      )}

      {editingImageUrl && (
        <ImageEditor
          imageUrl={editingImageUrl}
          onCancel={() => setEditingImageUrl(null)}
          onSave={handleImageEdited}
        />
      )}
    </div>
  );
}
