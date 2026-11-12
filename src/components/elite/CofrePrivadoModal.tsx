import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { verificarAcessoCofre, obterCofreDoUsuario } from '../../services/eliteFeatures';

interface Props { donoId: string; visitanteId: string; donoObj?: any; }

export function CofrePrivadoModal({ donoId, visitanteId, donoObj }: Props) {
  const [senha, setSenha] = useState('');
  const [liberado, setLiberado] = useState(() => verificarAcessoCofre(donoId, visitanteId, '', donoObj));
  const [erro, setErro] = useState('');

  const cofre = obterCofreDoUsuario(donoId, donoObj);
  const temFotos = cofre.fotosCofre.length > 0;

  if (!temFotos && donoId !== visitanteId) return null;

  const tentarAbrir = () => {
    if (verificarAcessoCofre(donoId, visitanteId, senha, donoObj)) {
      setLiberado(true);
      setErro('');
    } else {
      setErro('Chave incorreta');
    }
  };

  if (liberado) {
    return (
      <div className="w-full p-4 border border-[var(--libido-accent)]/30 rounded-2xl bg-[var(--libido-surface-2)] mt-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--libido-accent)] mb-3 flex items-center gap-2">
          <Unlock size={14} /> Cofre Aberto
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {cofre.fotosCofre.map((url, i) => (
            <img key={i} src={url} alt="Cofre" className="w-full h-24 object-cover rounded-xl border border-[var(--libido-border)]" />
          ))}
          {cofre.fotosCofre.length === 0 && <span className="text-xs text-[var(--libido-muted)]">Cofre vazio.</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 border border-[var(--libido-border)] rounded-2xl bg-[var(--libido-surface)] mt-4 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
        <Lock size={32} className="text-[var(--libido-muted)] opacity-50" />
        <h3 className="text-xs font-bold text-[var(--libido-text)] uppercase tracking-wider">Cofre Privado</h3>
        <p className="text-[10px] text-[var(--libido-muted)] mb-2">Este perfil possui fotos protegidas por senha.</p>
        <div className="flex gap-2 w-full max-w-[200px]">
          <input
            type="password"
            maxLength={4}
            value={senha}
            onChange={e => setSenha(e.target.value.replace(/\D/g, ''))}
            placeholder="PIN"
            className="w-1/2 bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-center tracking-[0.5em] text-sm focus:border-[var(--libido-accent)] outline-none"
          />
          <button onClick={tentarAbrir} className="w-1/2 bg-[var(--libido-accent)] text-black font-bold text-[10px] uppercase rounded-xl">
            Abrir
          </button>
        </div>
        {erro && <p className="text-red-400 text-[10px] mt-1 font-bold">{erro}</p>}
      </div>
    </div>
  );
}