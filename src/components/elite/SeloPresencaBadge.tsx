import React, { useState, useEffect } from 'react';
import { obterVerificacaoFisica, confirmarConheciPessoalmente } from '../../services/eliteFeatures';
import { ShieldCheck } from 'lucide-react';

interface Props { targetId: string; meuId: string; }

export function SeloPresencaBadge({ targetId, meuId }: Props) {
  const [status, setStatus] = useState({ total: 0, selo: false, jaAtestei: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obterVerificacaoFisica(targetId, meuId).then(s => {
      setStatus({ total: s.totalConfirmacoes, selo: s.verificadoPelaComunidade, jaAtestei: s.jaConfirmadoPorMim });
      setLoading(false);
    });
  }, [targetId, meuId]);

  const atestar = async () => {
    if (status.jaAtestei || targetId === meuId) return;
    setLoading(true);
    const res = await confirmarConheciPessoalmente(targetId, meuId);
    if (res.ok) setStatus(s => ({ ...s, total: res.novoTotal, jaAtestei: true, selo: res.novoTotal >= 1 }));
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse w-24 h-6 bg-white/5 rounded-full" />;

  return (
    <div className="flex flex-col gap-2">
      {status.selo && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-[10px] font-black tracking-widest uppercase">
          <ShieldCheck size={14} /> Membro Real Verificado
        </div>
      )}
      {targetId !== meuId && !status.jaAtestei && (
        <button onClick={atestar} className="text-[10px] uppercase font-bold text-[var(--libido-accent)] hover:underline text-left">
          + Atestar que conheci pessoalmente
        </button>
      )}
    </div>
  );
}