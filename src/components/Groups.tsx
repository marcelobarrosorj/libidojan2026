import { supabase } from '../services/supabase';
import { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';

interface GroupsProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
  userId?: string;
}

interface Grupo {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export function Groups({ isPremium, onShowPremiumModal, userId }: GroupsProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setGrupos(data);
      else setGrupos([]);
    } catch {
      setGrupos([]);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const criar = async () => {
    if (!nome.trim() || !userId || salvando) return;
    setSalvando(true);
    const { error } = await supabase
      .from('groups')
      .insert({ owner_id: userId, name: nome.trim(), description: descricao.trim() || null });
    if (!error) {
      setNome(''); setDescricao('');
      setShowForm(false);
      await carregar();
    }
    setSalvando(false);
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Grupos</h1>
          <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Tribos da comunidade</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="w-10 h-10 bg-[var(--libido-accent)] rounded-xl flex items-center justify-center text-black hover:opacity-90 shadow-lg shadow-[var(--libido-accent)]/10">
          <Plus size={16} />
        </button>
      </div>
      {showForm && (
        <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] rounded-2xl p-3 flex flex-col gap-2">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do grupo..." className="bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]" />
          <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descricao (opcional)..." className="bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]" />
          <button onClick={criar} disabled={salvando || !nome.trim()} className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-black font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-widest disabled:opacity-40">
            {salvando ? 'Criando...' : 'Criar grupo'}
          </button>
        </div>
      )}
      <div className="space-y-2">
        {loading && <p className="text-[var(--libido-muted)] text-xs opacity-60 text-center py-4">Carregando grupos...</p>}
        {!loading && grupos.length === 0 && (
          <div className="text-center py-10 px-4 bg-white/5 rounded-2xl border border-[var(--libido-border)]">
            <p className="text-[var(--libido-muted)] opacity-80 text-sm">Nenhum grupo ainda.</p>
            <p className="text-[var(--libido-text)] font-semibold mt-2 text-sm">Toque no + para criar o primeiro.</p>
          </div>
        )}
        {grupos.map(g => (
          <div key={g.id} className="p-4 rounded-2xl border bg-[var(--libido-surface-2)]/60 border-[var(--libido-border)]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--libido-accent)]/20 flex items-center justify-center shrink-0">
                <Users size={16} className="text-[var(--libido-accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-black text-[var(--libido-text)] truncate">{g.name}</h3>
                {g.description && <p className="text-[9px] text-[var(--libido-muted)] opacity-70 mt-1">{g.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}