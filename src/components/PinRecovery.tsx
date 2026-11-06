import React, { useState } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';

type Props = { onDone: () => void; onCancel: () => void };

export function PinRecovery({ onDone, onCancel }: Props) {
  const [etapa, setEtapa] = useState<'auth' | 'novo'>('auth');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [pin, setPin] = useState('');
  const [conf, setConf] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const confirmar = async () => {
    setErro('');
    if (!email.trim() || !senha) { setErro('Informe e-mail e senha.'); return; }
    setCarregando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
      if (error) { setErro('E-mail ou senha incorretos.'); }
      else { setEtapa('novo'); setSenha(''); }
    } catch (e: any) {
      setErro(e?.message || 'Falha ao confirmar identidade.');
    } finally { setCarregando(false); }
  };

  const salvar = async () => {
    setErro('');
    if (!/^\d{4}$/.test(pin)) { setErro('O PIN deve ter 4 digitos.'); return; }
    if (pin !== conf) { setErro('Os PINs nao coincidem.'); return; }
    setCarregando(true);
    try {
      const { data, error } = await (supabase as any).rpc('definir_pin', { p_pin: pin });
      if (error) { setErro('Erro ao salvar: ' + error.message); }
      else if (data && data.ok === false) { setErro(data.erro || 'Nao foi possivel salvar.'); }
      else { onDone(); }
    } catch (e: any) {
      setErro(e?.message || 'Erro ao salvar o PIN.');
    } finally { setCarregando(false); }
  };

  const campo = 'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[var(--libido-accent)]';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 bg-[var(--libido-bg)] text-[var(--libido-text)] min-h-screen">
      <div className="w-full max-w-xs flex flex-col items-center gap-5">
        <div className="w-20 h-20 bg-[var(--libido-accent)]/10 rounded-[1.8rem] flex items-center justify-center border border-[var(--libido-accent)]/20">
          <Shield size={36} className="text-[var(--libido-accent)]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-medium uppercase tracking-wider italic">{etapa === 'auth' ? 'Recuperar acesso' : 'Novo PIN'}</h1>
          <p className="text-xs text-[var(--libido-muted)] opacity-60 mt-2 font-semibold">
            {etapa === 'auth' ? 'Confirme e-mail e senha para definir um novo PIN' : 'Escolha 4 digitos para o novo PIN'}
          </p>
        </div>
        {etapa === 'auth' ? (
          <>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" className={campo} autoComplete="email" />
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" className={campo} autoComplete="current-password" />
            <button onClick={confirmar} disabled={carregando} className="w-full py-3 rounded-2xl bg-[var(--libido-accent)] text-black font-black text-[11px] uppercase tracking-widest disabled:opacity-40">
              {carregando ? 'Confirmando...' : 'Confirmar identidade'}
            </button>
          </>
        ) : (
          <>
            <input type="text" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="Novo PIN" className={campo + ' text-center tracking-[0.5em] text-lg'} />
            <input type="text" inputMode="numeric" maxLength={4} value={conf} onChange={(e) => setConf(e.target.value.replace(/\D/g, ''))} placeholder="Repita o PIN" className={campo + ' text-center tracking-[0.5em] text-lg'} />
            <button onClick={salvar} disabled={carregando} className="w-full py-3 rounded-2xl bg-[var(--libido-accent)] text-black font-black text-[11px] uppercase tracking-widest disabled:opacity-40">
              {carregando ? 'Salvando...' : 'Salvar novo PIN'}
            </button>
          </>
        )}
        {erro && <p className="text-red-400 text-[10px] font-black uppercase tracking-wider bg-red-500/10 py-3 px-4 rounded-2xl border border-red-500/20 text-center w-full">{erro}</p>}
        <button onClick={onCancel} className="flex items-center gap-2 text-[10px] text-[var(--libido-muted)] opacity-50 hover:text-[var(--libido-text)] font-bold uppercase tracking-widest">
          <ArrowLeft size={12} /> Voltar
        </button>
      </div>
    </div>
  );
}