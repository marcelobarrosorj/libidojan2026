import { useState } from 'react';
import { calcularIdade } from '../services/idade'; // IDADE-AUTOMATICA
import { Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';
import { uploadPhoto } from '../services/uploadPhoto';
import { createPost } from '../services/posts'; // FOTO-CADASTRO

// FOTO-FIX: comprime a foto antes do envio (menos memoria e menos falha)
async function comprimirFoto(file: File): Promise<File> {
  try {
    const img = await createImageBitmap(file);
    const maxLado = 1280;
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const w = Math.round(img.width * escala);
    const h = Math.round(img.height * escala);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (eComp) {
    return file;
  }
}
interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [relationshipStatus, setRelationshipStatus] = useState<'casal' | 'solteiro' | ''>(() => { try { const vRs = (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}')).relationshipStatus; return vRs === 'casal' || vRs === 'solteiro' ? vRs : ''; } catch (eR_rs) { return ''; } });
  const [nickname, setNickname] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['nickname'] || ''; } catch (eR_nickname) { return ''; } });
  const [bio, setBio] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['bio'] || ''; } catch (eR_bio) { return ''; } });
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Casal
  const [maleNickname, setMaleNickname] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['maleNickname'] || ''; } catch (eR_maleNickname) { return ''; } });
  const [maleAge, setMaleAge] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['maleAge'] || ''; } catch (eR_maleAge) { return ''; } });
  const [maleOrientation, setMaleOrientation] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['maleOrientation'] || 'Heterossexual'; } catch (eR_maleOrientation) { return 'Heterossexual'; } });
  const [maleBiotype, setMaleBiotype] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['maleBiotype'] || 'Padrão'; } catch (eR_maleBiotype) { return 'Padrão'; } });
  const [maleHeight, setMaleHeight] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['maleHeight'] || ''; } catch (eR_maleHeight) { return ''; } });
  const [maleWeight, setMaleWeight] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['maleWeight'] || ''; } catch (eR_maleWeight) { return ''; } });
  const [femaleNickname, setFemaleNickname] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['femaleNickname'] || ''; } catch (eR_femaleNickname) { return ''; } });
  const [femaleAge, setFemaleAge] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['femaleAge'] || ''; } catch (eR_femaleAge) { return ''; } });
  const [femaleOrientation, setFemaleOrientation] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['femaleOrientation'] || 'Bissexual'; } catch (eR_femaleOrientation) { return 'Bissexual'; } });
  const [femaleBiotype, setFemaleBiotype] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['femaleBiotype'] || 'Padrão'; } catch (eR_femaleBiotype) { return 'Padrão'; } });
  const [femaleHeight, setFemaleHeight] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['femaleHeight'] || ''; } catch (eR_femaleHeight) { return ''; } });
  const [femaleWeight, setFemaleWeight] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['femaleWeight'] || ''; } catch (eR_femaleWeight) { return ''; } });

  // Solteiro
  const [singleAge, setSingleAge] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['singleAge'] || ''; } catch (eR_singleAge) { return ''; } });
  const [singleGender, setSingleGender] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['singleGender'] || ''; } catch (eR_singleGender) { return ''; } });
  const [singleOrientation, setSingleOrientation] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['singleOrientation'] || 'Bissexual'; } catch (eR_singleOrientation) { return 'Bissexual'; } });
  const [singleBiotype, setSingleBiotype] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['singleBiotype'] || 'Padrão'; } catch (eR_singleBiotype) { return 'Padrão'; } });
  const [singleHeight, setSingleHeight] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['singleHeight'] || ''; } catch (eR_singleHeight) { return ''; } });
  const [singleWeight, setSingleWeight] = useState<string>(() => { try { return (JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}'))['singleWeight'] || ''; } catch (eR_singleWeight) { return ''; } });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(() => { try { return !!(JSON.parse(localStorage.getItem('libido_rascunho_' + userId) || '{}')).privacyAccepted; } catch (eR_pa) { return false; } });

  const saveProfile = async () => {
    if (!relationshipStatus) {
      setMessage('Selecione o tipo do seu perfil.');
      return;
    }

    if (!nickname) {
      setMessage('O apelido é obrigatório.');
      return;
    }

    if (!privacyAccepted) {
      setMessage('Você deve aceitar as regras de privacidade.');
      return;
    }
    if (!photoFile) {
      setMessage('A foto de perfil é obrigatória.');
      return;
    }

    if (relationshipStatus === 'solteiro') {
      if (!singleAge || !singleGender) {
        setMessage('Por favor, informe sua idade e gênero.');
        return;
      }
      const age = (calcularIdade(singleAge) ?? -1);
      if (isNaN(age) || age < 18 || age > 120) {
        setMessage('Você deve ter 18 anos ou mais.');
        return;
      }
      const height = parseInt(singleHeight);
      if (singleHeight && (isNaN(height) || height < 50 || height > 250)) {
        setMessage('Altura inválida.');
        return;
      }
    } else {
      if (!maleNickname || !maleAge || !femaleNickname || !femaleAge) {
        setMessage('Por favor, preencha os nomes e idades do casal.');
        return;
      }
      const mAge = (calcularIdade(maleAge) ?? -1); // CASAL-DATA
      const fAge = (calcularIdade(femaleAge) ?? -1); // CASAL-DATA
      if (isNaN(mAge) || mAge < 18 || mAge > 120 || isNaN(fAge) || fAge < 18 || fAge > 120) {
        setMessage('Ambos devem ter 18 anos ou mais.');
        return;
      }
      const mHeight = parseInt(maleHeight);
      if (maleHeight && (isNaN(mHeight) || mHeight < 50 || mHeight > 250)) {
        setMessage('Altura inválida do parceiro.');
        return;
      }
      const fHeight = parseInt(femaleHeight);
      if (femaleHeight && (isNaN(fHeight) || fHeight < 50 || fHeight > 250)) {
        setMessage('Altura inválida da parceira.');
        return;
      }
    }

    setSaving(true);
    setMessage('Salvando perfil...');

    try {
      let finalPhotoUrl: string | undefined = undefined;
      if (photoFile) {
        setMessage('Enviando foto...');
        try {
          finalPhotoUrl = await uploadPhoto(await comprimirFoto(photoFile), userId);
        } catch (upErr: any) {
          setMessage('Falha ao enviar a foto. Tente novamente.');
          return;
        }
      }
      const parsedAge = relationshipStatus === 'solteiro' ? (calcularIdade(singleAge) ?? -1) : parseInt(maleAge);

      const payload: any = {
        user_id: userId,
        nickname: nickname,
        age: (calcularIdade(singleAge) ?? calcularIdade(maleAge) ?? null), birth_date: ((singleAge || maleAge) || null), // CASAL-DATA
        gender: relationshipStatus === 'solteiro' ? singleGender : 'Casal',
        relationship_status: relationshipStatus,
        bio: bio, // Enviando apenas o texto puro (sem JSON.stringify)
        photo_url: finalPhotoUrl || photoUrl || undefined,
          photos: finalPhotoUrl ? [finalPhotoUrl] : [], // FOTO-CADASTRO: foto do cadastro vai para a galeria
        height: relationshipStatus === 'solteiro' && singleHeight ? parseInt(singleHeight) : null,
        biotype: relationshipStatus === 'solteiro' ? singleBiotype : null,
        sexual_orientation: relationshipStatus === 'solteiro' ? singleOrientation : null,
        status: 'active'
      };

      // Adicionando informações específicas de casais
      if (relationshipStatus === 'casal') {
        payload.couple_profile = {
          maleNickname,
          maleAge: (calcularIdade(maleAge) ?? null), maleBirthDate: (maleAge || null), // CASAL-DATA
          maleOrientation,
          maleBiotype,
          maleHeight: maleHeight ? parseInt(maleHeight) : null,
          femaleNickname,
          femaleAge: (calcularIdade(femaleAge) ?? null), femaleBirthDate: (femaleAge || null), // CASAL-DATA
          femaleOrientation,
          femaleBiotype,
          femaleHeight: femaleHeight ? parseInt(femaleHeight) : null
        };
      }

      const { error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
          if (finalPhotoUrl) { try { await createPost({ id: '', userId: userId, image: finalPhotoUrl, text: '', likes: 0, createdAt: Date.now() }); } catch (eP) { console.error('ONBOARDING-POST falhou', eP); } } // FOTO-CADASTRO
      try { localStorage.removeItem('libido_rascunho_' + userId); } catch (eLimpa) {} onComplete();
    } catch (err: any) {
      console.error('Erro técnico interno ao salvar:', err);
      setMessage('Não foi possível salvar seu perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--libido-bg)] text-[var(--libido-text)]">
      <div className="max-w-md mx-auto px-5 pb-20">
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--libido-accent)]/10 rounded-full mb-4">
            <Sparkles size={32} className="text-[var(--libido-accent)]" />
          </div>
          <h1 className="text-3xl font-black tracking-wider italic font-fraunces font-medium uppercase">Configurar Conta</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Tipo de Perfil</label>
            <div className="flex gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => setRelationshipStatus('solteiro')}
                className={`flex-1 py-4 border rounded-2xl text-xs font-semibold transition-all ${relationshipStatus === 'solteiro' ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] border-[var(--libido-accent)]' : 'bg-[var(--libido-surface-2)] text-[var(--libido-muted)] opacity-60 border-[var(--libido-border)]'}`}
              >
                Solteiro(a)
              </button>
              <button
                type="button"
                onClick={() => setRelationshipStatus('casal')}
                className={`flex-1 py-4 border rounded-2xl text-xs font-semibold transition-all ${relationshipStatus === 'casal' ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] border-[var(--libido-accent)]' : 'bg-[var(--libido-surface-2)] text-[var(--libido-muted)] opacity-60 border-[var(--libido-border)]'}`}
              >
                Casal
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Apelido do Perfil</label>
            <input 
              type="text" 
              placeholder="Ex: Casal Beijo"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-2xl px-4 py-3.5 text-xs text-[var(--libido-text)] mt-1.5 focus:outline-none focus:border-[var(--libido-accent)]"
            />
          </div>

          {relationshipStatus === 'solteiro' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Data de nascimento</label>
                  <input type="date" value={singleAge} onChange={e => setSingleAge(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none mt-1"/>
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Gênero</label>
                  <select value={singleGender} onChange={e => setSingleGender(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-muted)] opacity-80 focus:outline-none mt-1">
                    <option value="">Selecione</option>
                    <option value="Masculino">Homem</option>
                    <option value="Feminino">Mulher</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Altura (cm)</label>
                  <input type="number" value={singleHeight} onChange={e => setSingleHeight(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none mt-1"/>
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Peso (kg)</label>
                  <input type="number" value={singleWeight} onChange={e => setSingleWeight(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none mt-1"/>
                </div>
              </div>
            </div>
          )}

          {relationshipStatus === 'casal' && (
            <div className="space-y-4">
              <div className="bg-[var(--libido-surface-2)]/50 p-4 rounded-2xl border border-[var(--libido-accent)]/10 space-y-3 relative">
                <h4 className="text-[10px] font-black text-[var(--libido-accent)] uppercase tracking-widest">👨 Parceiro (Ele)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Apelido" value={maleNickname} onChange={e => setMaleNickname(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                  <input type="date" value={maleAge} onChange={e => setMaleAge(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Altura (cm)" value={maleHeight} onChange={e => setMaleHeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                  <input type="number" placeholder="Peso (kg)" value={maleWeight} onChange={e => setMaleWeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                </div>
              </div>

              <div className="bg-[var(--libido-surface-2)]/50 p-4 rounded-2xl border border-[var(--libido-accent)]/10 space-y-3 relative">
                <h4 className="text-[10px] font-black text-[var(--libido-accent)] uppercase tracking-widest">👩 Parceira (Ela)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Apelido" value={femaleNickname} onChange={e => setFemaleNickname(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                  <input type="date" value={femaleAge} onChange={e => setFemaleAge(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Altura (cm)" value={femaleHeight} onChange={e => setFemaleHeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                  <input type="number" placeholder="Peso (kg)" value={femaleWeight} onChange={e => setFemaleWeight(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Biografia / Apresentação</label>
            <textarea 
              placeholder="Fale um pouco sobre você/vocês..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-2xl px-4 py-3.5 text-xs text-[var(--libido-text)] mt-1.5 focus:outline-none focus:border-[var(--libido-accent)] h-16 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Foto de perfil (obrigatória)</label>
            <input type="file" accept="image/*" className="hidden" id="onboarding-photo" onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
            <div className="flex items-center gap-3 mt-1.5">
              <button type="button" onClick={() => { try { localStorage.setItem('libido_rascunho_' + userId, JSON.stringify({ relationshipStatus, nickname, bio, singleAge, singleGender, singleHeight, singleWeight, singleOrientation, singleBiotype, maleNickname, maleAge, maleHeight, maleWeight, maleOrientation, maleBiotype, femaleNickname, femaleAge, femaleHeight, femaleWeight, femaleOrientation, femaleBiotype, privacyAccepted })); } catch (eRasc) {} document.getElementById('onboarding-photo')?.click(); }} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-2xl px-4 py-3 text-xs text-[var(--libido-text)]">
                {photoFile ? 'Trocar foto' : 'Escolher foto'}
              </button>
              {photoPreview && <img src={photoPreview} alt="previa" className="w-12 h-12 rounded-xl object-cover border border-[var(--libido-border)]" />}
            </div>
          </div>
          <label className="flex items-start gap-3 p-4 bg-[var(--libido-surface-2)]/80 border border-[var(--libido-border)] rounded-2xl cursor-pointer">
            <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="mt-1"/>
            <div>
              <p className="text-xs font-bold text-[var(--libido-muted)]">Aceito as regras de privacidade</p>
              <p className="text-[9px] text-[var(--libido-muted)] opacity-60 mt-1">Confirmo que sou maior de 18 anos.</p>
            </div>
          </label>
        </div>

        {message && <p className="text-red-500/80 text-[10px] text-center font-black uppercase tracking-wider bg-red-500/10 py-3 rounded-2xl border border-red-500/20 mt-4">{message}</p>}

        <button 
          onClick={saveProfile}
          disabled={saving || !privacyAccepted}
          className="w-full bg-[var(--libido-accent)] text-[var(--libido-text)] bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] font-bold py-4 mt-6 rounded-[16px] text-sm tracking-wide disabled:opacity-50 transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
        >
          {saving ? 'CRIANDO...' : 'ENTRAR NO RADAR'}
        </button>
      </div>
    </div>
  );
}
