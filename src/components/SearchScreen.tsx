import React, { useState } from 'react';
import { Search, Filter, Users, User } from 'lucide-react';
import { supabase } from '../services/supabase';

export function SearchScreen() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  
  // Filtros
  const [tipo, setTipo] = useState('todos'); // casais, homens, mulheres
  const [orientacao, setOrientacao] = useState('todos');

  const realizarBusca = async () => {
    setLoading(true);
    setBuscaAtiva(true);
    
    let query = supabase.from('users').select('user_id, nickname, relationship_status, sexual_orientation, photo_url');
    
    if (tipo === 'casais') query = query.ilike('relationship_status', '%casal%');
    if (tipo === 'homens') query = query.ilike('relationship_status', '%solteiro%');
    if (tipo === 'mulheres') query = query.ilike('relationship_status', '%solteira%');
    
    if (orientacao !== 'todos') query = query.ilike('sexual_orientation', `%${orientacao}%`);

    const { data } = await query.limit(20);
    setResults(data || []);
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[var(--libido-bg)] text-[var(--libido-text)] pt-4 px-4 pb-24 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-[var(--libido-border)] pb-4">
        <Search className="text-[var(--libido-accent)]" size={24} />
        <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--libido-accent)]">Busca Avançada</h2>
      </div>

      {/* Paineis de Filtro */}
      <div className="space-y-4 mb-6">
        <div className="bg-[var(--libido-surface-2)] p-4 rounded-xl border border-[var(--libido-border)]">
          <label className="text-[10px] font-black uppercase text-[var(--libido-muted)] flex items-center gap-2 mb-3">
            <Users size={14} /> O que você procura?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['todos', 'casais', 'homens', 'mulheres'].map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`py-2 px-2 text-[10px] uppercase font-bold rounded-lg transition-all ${tipo === t ? 'bg-[var(--libido-accent)] text-black' : 'bg-black/30 border border-[var(--libido-border)] text-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--libido-surface-2)] p-4 rounded-xl border border-[var(--libido-border)]">
          <label className="text-[10px] font-black uppercase text-[var(--libido-muted)] flex items-center gap-2 mb-3">
            <Filter size={14} /> Orientação Sexual
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['todos', 'hetero', 'bi'].map(o => (
              <button
                key={o}
                onClick={() => setOrientacao(o)}
                className={`py-2 px-2 text-[10px] uppercase font-bold rounded-lg transition-all ${orientacao === o ? 'bg-[var(--libido-accent)] text-black' : 'bg-black/30 border border-[var(--libido-border)] text-gray-400'}`}
              >
                {o === 'hetero' ? 'Hétero' : o.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={realizarBusca}
          className="w-full py-3 bg-[var(--libido-accent)] text-black rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(216,107,63,0.3)] flex justify-center items-center gap-2"
        >
          <Search size={18} /> Buscar Perfis
        </button>
      </div>

      {/* Resultados */}
      {buscaAtiva && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[var(--libido-muted)] mb-3">Resultados ({results.length}):</h3>
          {loading ? (
            <div className="animate-pulse w-full h-16 bg-[var(--libido-surface-2)] rounded-xl" />
          ) : results.length > 0 ? (
            results.map(u => (
              <div key={u.user_id} className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-3 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-black border border-[var(--libido-accent)] overflow-hidden">
                  {u.photo_url ? <img src={u.photo_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-3 opacity-50" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--libido-accent)]">{u.nickname || 'Anônimo'}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{u.relationship_status} {u.sexual_orientation ? `• ${u.sexual_orientation}` : ''}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-gray-500 py-6">Nenhum perfil encontrado com estes filtros.</p>
          )}
        </div>
      )}
    </div>
  );
}