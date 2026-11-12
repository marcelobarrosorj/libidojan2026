import React, { useState, useEffect } from 'react';
import { INTENCOES_RADAR, definirIntencaoDoDia, obterIntencaoDoUsuario, IntencaoRadarId } from '../../services/eliteFeatures';

interface Props { userId: string; userObj?: any; onIntencaoChange?: (i: string) => void; }

export function IntencaoRadarBar({ userId, userObj, onIntencaoChange }: Props) {
  const [ativa, setAtiva] = useState<IntencaoRadarId>('Todos');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setAtiva(obterIntencaoDoUsuario(userObj || { id: userId }));
  }, [userId, userObj]);

  const handleSelect = async (id: IntencaoRadarId) => {
    if (id === ativa) return;
    setSalvando(true);
    setAtiva(id);
    if (onIntencaoChange) onIntencaoChange(id);
    await definirIntencaoDoDia(userId, id);
    setSalvando(false);
  };

  return (
    <div className="w-full overflow-x-auto pb-2 mb-2 flex gap-2 snap-x scrollbar-hide">
      {INTENCOES_RADAR.map(i => (
        <button
          key={i.id}
          onClick={() => handleSelect(i.id)}
          disabled={salvando}
          className={`snap-center shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            ativa === i.id
              ? 'bg-[var(--libido-accent)] text-black shadow-[0_0_10px_rgba(216,107,63,0.3)]'
              : 'bg-[var(--libido-surface-2)] text-[var(--libido-muted)] border border-[var(--libido-border)]'
          }`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}