
import React, { useState } from 'react';
import { 
  ProfileType, 
  ProfileData, 
  CoupleProfileData, 
  RegistrationPayload, 
  Step, 
  UserType,
  Biotype 
} from '../types';
import { Input, Button, StepHeader } from './common/RegistrationUI';
import { SingleFields } from './SingleFields';
import { CoupleFields } from './CoupleFields';
import { 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  ShieldCheck, 
  Mail, 
  User as UserIcon, 
  Users,
  Camera,
  Trash2,
  Loader2
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegistrationFlow: React.FC<{ 
  onComplete: (payload: RegistrationPayload) => void; 
  onCancel?: () => void; 
}> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<Step>('type');
  const [profileType, setProfileType] = useState<ProfileType>('couple_fxm');
  const [error, setError] = useState<string | null>(null);

  const [singleData, setSingleData] = useState<ProfileData & { password?: string, avatar?: string }>({ 
    nickname: '', email: '', biotype: Biotype.PADRAO, lookingFor: [], password: '', avatar: ''
  });

  const [coupleData, setCoupleData] = useState<CoupleProfileData & { password?: string, avatar?: string }>({
    mainNickname: '', email: '', password: '', avatar: '',
    partner1: { nickname: '', biotype: Biotype.PADRAO }, 
    partner2: { nickname: '', biotype: Biotype.PADRAO },
    lookingFor: [UserType.CASAIS]
  });

  const isCouple = profileType.startsWith('couple');

  const handleNext = () => {
    setError(null);

    if (step === 'type') {
      setStep('details');
      return;
    }

    if (step === 'details') {
      const email = isCouple ? coupleData.email : (singleData.email || '');
      const nickname = isCouple ? coupleData.mainNickname : singleData.nickname;
      const password = isCouple ? coupleData.password : singleData.password;

      if (!nickname || nickname.trim().length < 3) {
        setError('Nickname é obrigatório (mín. 3 caracteres).');
        return;
      }

      if (!email || !EMAIL_REGEX.test(email)) {
        setError('Por favor, insira um e-mail de cadastro válido.');
        return;
      }

      if (!password || password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres para sua segurança.');
        return;
      }

      setStep('physical');
      return;
    }

    if (step === 'physical') {
      setStep('photo');
      return;
    }

    if (step === 'photo') {
      const avatar = isCouple ? coupleData.avatar : singleData.avatar;
      if (!avatar) {
        setError('Obrigatório: Envie pelo menos 1 foto para se cadastrar na Matriz.');
        return;
      }
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      onComplete({
        profileType,
        data: isCouple ? coupleData : singleData,
        acceptedTerms: true
      });
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 'type') onCancel?.();
    else if (step === 'details') setStep('type');
    else if (step === 'physical') setStep('details');
    else if (step === 'photo') setStep('physical');
    else if (step === 'confirm') setStep('photo');
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        if (!base64) return;

        // Criar elemento de imagem para redimensionar via Canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1600;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = (MAX_SIZE / width) * height;
              width = MAX_SIZE;
            } else {
              width = (MAX_SIZE / height) * width;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            
            if (isCouple) {
              setCoupleData(prev => ({...prev, avatar: compressedBase64}));
            } else {
              setSingleData(prev => ({...prev, avatar: compressedBase64}));
            }
          }
          setIsProcessing(false);
        };
        img.onerror = () => {
          setError('Falha ao processar imagem.');
          setIsProcessing(false);
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError('Erro ao ler arquivo.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col p-4 animate-in fade-in duration-500 overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-44 scrollbar-hide">
        {step === 'type' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <StepHeader title="Sua Identidade" subtitle="Escolha seu papel na rede" />
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'couple_fxm', label: 'Casal', icon: <Users />, desc: 'Perfil para casais heterossexuais ou bi' },
                { id: 'woman', label: 'Mulher', icon: <UserIcon />, desc: 'Perfil individual feminino' },
                { id: 'man', label: 'Homem', icon: <UserIcon />, desc: 'Perfil individual masculino' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setProfileType(type.id as ProfileType)}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-5 ${
                    profileType === type.id 
                    ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
                    : 'bg-slate-900 border-white/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${profileType === type.id ? 'bg-amber-500 text-black shadow-lg' : 'bg-slate-800 text-slate-400'}`}>
                    {type.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-black uppercase text-sm tracking-widest">{type.label}</h4>
                    <p className="text-[10px] text-amber-500/70 uppercase tracking-tighter font-bold">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <StepHeader title="Identificadores" subtitle="Seu codinome e contato oficial" />
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-500/60 uppercase ml-4 flex items-center gap-2">
                  <UserIcon size={12} /> Codinome (Nickname)
                </label>
                <Input 
                  value={isCouple ? coupleData.mainNickname : singleData.nickname} 
                  onChange={(v) => isCouple ? setCoupleData({...coupleData, mainNickname: v}) : setSingleData({...singleData, nickname: v})} 
                  placeholder="EX: SAFIRA_SP" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-500/60 uppercase ml-4 flex items-center gap-2">
                  <Mail size={12} /> E-mail de Cadastro
                </label>
                <Input 
                  type="email"
                  value={isCouple ? coupleData.email : (singleData.email || '')} 
                  onChange={(v) => isCouple ? setCoupleData({...coupleData, email: v}) : setSingleData({...singleData, email: v})} 
                  placeholder="NOME@DOMINIO.COM" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-500/60 uppercase ml-4 flex items-center gap-2">
                  <Lock size={12} /> Senha de Acesso
                </label>
                <Input 
                  type="password"
                  value={isCouple ? (coupleData.password || '') : (singleData.password || '')} 
                  onChange={(v) => isCouple ? setCoupleData({...coupleData, password: v}) : setSingleData({...singleData, password: v})} 
                  placeholder="MÍNIMO 6 CARACTERES" 
                />
              </div>
              <div className="bg-amber-500/5 p-4 rounded-3xl border border-amber-500/10">
                <p className="text-[9px] text-amber-500 font-bold uppercase text-center leading-relaxed">
                  ⚠️ O e-mail será usado para recuperação da sua conta e comunicações oficiais.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'physical' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <StepHeader title="Características" subtitle="Sintonize seu perfil físico" />
            {isCouple ? (
              <CoupleFields profileType={profileType} data={coupleData} onChange={(f, v) => setCoupleData(prev => ({...prev, [f]: v}))} />
            ) : (
              <SingleFields data={singleData} onChange={(f, v) => setSingleData(prev => ({...prev, [f]: v}))} />
            )}
          </div>
        )}

        {step === 'photo' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <StepHeader title="Identidade Visual" subtitle="Uma foto é obrigatória para cadastro" />
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className={`w-48 h-48 rounded-[3rem] border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${
                  (isCouple ? coupleData.avatar : singleData.avatar) 
                  ? 'border-amber-500/50 bg-slate-900' 
                  : 'border-white/10 bg-slate-900/50'
                }`}>
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="text-amber-500 animate-spin" size={40} />
                       <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Sincronizando...</p>
                    </div>
                  ) : (isCouple ? coupleData.avatar : singleData.avatar) ? (
                    <img src={isCouple ? coupleData.avatar : singleData.avatar} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="text-center p-6">
                      <Camera size={40} className="text-slate-700 mx-auto mb-2" />
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Toque para enviar</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {(isCouple ? coupleData.avatar : singleData.avatar) && (
                   <button 
                    onClick={() => isCouple ? setCoupleData({...coupleData, avatar: ''}) : setSingleData({...singleData, avatar: ''})}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95"
                   >
                     <Trash2 size={16} />
                   </button>
                )}
              </div>
              <div className="mt-8 space-y-4 max-w-[280px]">
                <div className="flex items-start gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                  <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-500/80 font-bold uppercase leading-relaxed text-left">
                    Sua foto será analisada pela governança. Evite fotos de terceiros ou paisagens.
                  </p>
                </div>
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest text-center leading-relaxed">
                  A Matriz exige pelo menos uma foto nítida para garantir a segurança da comunidade NoFake.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-8 text-center py-10 animate-in zoom-in-95">
            <div className="relative inline-block">
               <ShieldCheck size={80} className="text-amber-500 mx-auto animate-pulse" />
               <div className="absolute inset-0 bg-amber-500/20 blur-[40px] -z-10 rounded-full" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                {isCouple ? coupleData.mainNickname : singleData.nickname}
              </h3>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em]">Cadastro Pré-Aprovado</p>
              <p className="text-slate-500 font-mono text-xs">{isCouple ? coupleData.email : singleData.email}</p>
            </div>
            <div className="w-20 h-20 rounded-2xl border border-white/10 mx-auto overflow-hidden grayscale">
               <img src={isCouple ? coupleData.avatar : singleData.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-slate-400 italic max-w-[250px] mx-auto leading-relaxed pt-4">
              Ao concluir, você confirma ser maior de 18 anos e aceita as políticas de privacidade da Matriz Libido.
            </p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 bg-[#0a0a0a] border-t-2 border-amber-500/40 z-50 shadow-[0_-20px_60px_rgba(0,0,0,1)] rounded-t-[3rem]">
        {error && (
          <div className="bg-rose-500/10 border-2 border-rose-500/20 p-3 rounded-2xl mb-4 animate-bounce">
            <p className="text-[10px] text-rose-500 font-black uppercase text-center">{error}</p>
          </div>
        )}
        <div className="flex gap-4 max-w-md mx-auto">
          <button 
            onClick={handleBack} 
            className="w-16 h-16 bg-slate-900 border-2 border-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-amber-500 hover:border-amber-500/50 transition-all active:scale-95 shadow-xl"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="flex-1">
            <Button onClick={handleNext}>
              {step === 'confirm' ? <>Concluir Cadastro <Lock size={16} /></> : <>Avançar <ChevronRight size={16} /></>}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
