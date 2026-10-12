import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [relationshipStatus, setRelationshipStatus] = useState<'casal' | 'solteiro' | ''>('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Casal
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

  // Solteiro
  const [singleAge, setSingleAge] = useState('');
  const [singleGender, setSingleGender] = useState('');
  const [singleOrientation, setSingleOrientation] = useState('Bissexual');
  const [singleBiotype, setSingleBiotype] = useState('Padrão');
  const [singleHeight, setSingleHeight] = useState('');
  const [singleWeight, setSingleWeight] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

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

    if (relationshipStatus === 'solteiro') {
      if (!singleAge || !singleGender) {
        setMessage('Por favor, informe sua idade e gênero.');
        return;
      }
      const age = parseInt(singleAge);
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
      const mAge = parseInt(maleAge);
      const fAge = parseInt(femaleAge);
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
      const parsedAge = relationshipStatus === 'solteiro' ? parseInt(singleAge) : parseInt(maleAge);

      const payload: any = {
        user_id: userId,
        nickname: nickname,
        age: isNaN(parsedAge) ? null : parsedAge,
        gender: relationshipStatus === 'solteiro' ? singleGender : 'Casal',
        relationship_status: relationshipStatus,
        bio: bio, // Enviando apenas o texto puro (sem JSON.stringify)
        photo_url: photoUrl || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&auto=format&fit=crop",
        photos: [], // Adicionado conforme os campos requeridos
        height: relationshipStatus === 'solteiro' && singleHeight ? parseInt(singleHeight) : null,
        biotype: relationshipStatus === 'solteiro' ? singleBiotype : null,
        sexual_orientation: relationshipStatus === 'solteiro' ? singleOrientation : null,
        status: 'active'
      };

      // Adicionando informações específicas de casais
      if (relationshipStatus === 'casal') {
        payload.couple_profile = {
          maleNickname,
          maleAge: maleAge ? parseInt(maleAge) : null,
          maleOrientation,
          maleBiotype,
          maleHeight: maleHeight ? parseInt(maleHeight) : null,
          femaleNickname,
          femaleAge: femaleAge ? parseInt(femaleAge) : null,
          femaleOrientation,
          femaleBiotype,
          femaleHeight: femaleHeight ? parseInt(femaleHeight) : null
        };
      }

      const { error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      onComplete();
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
                  <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Idade</label>
                  <input type="number" value={singleAge} onChange={e => setSingleAge(e.target.value)} className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none mt-1"/>
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
                  <input type="number" placeholder="Idade" value={maleAge} onChange={e => setMaleAge(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
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
                  <input type="number" placeholder="Idade" value={femaleAge} onChange={e => setFemaleAge(e.target.value)} className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--libido-text)] focus:outline-none"/>
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
