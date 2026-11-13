import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Sparkles, MapPin, ShieldCheck, Camera } from 'lucide-react';
import { supabase } from "../services/supabase";

export function SearchScreen(props: any) {
  const [loading, setLoading] = useState(false);
  const [todosPerfis, setTodosPerfis] = useState<any[]>([]);
  const [termo, setTermo] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('todos');
  const [orientacaoFiltro, setOrientacaoFiltro] = useState('todos');
  const [objetivoFiltro, setObjetivoFiltro] = useState('todos');
  const [apenasComFoto, setApenasComFoto] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState<any | null>(null);

  const carregarPerfis = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('users').select('*').limit(150);
      if (data) setTodosPerfis(data);
    } catch (e) {
      console.warn('[BUSCA]', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  const normalizar = (v: any) => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const resultados = todosPerfis.filter(u => {
    const rel = normalizar(u.relationship_status || u.gender || u.type || u.profile_type || u.couple_profile);
    const ori = normalizar(u.sexual_orientation || u.orientation || u.preferences);
    const bio = normalizar(u.bio || u.description || u.interests || u.looking_for);
    const nick = normalizar(u.nickname || u.name || u.username);
    const cid = normalizar(u.city || u.location || u.state);
    const foto = u.photo_url || u.avatar_url || u.avatar || (Array.isArray(u.photos) && u.photos[0]);

    if (apenasComFoto && !foto) return false;

    if (termo.trim() !== '') {
      const t = normalizar(termo);
      if (!nick.includes(t) && !cid.includes(t) && !bio.includes(t)) return false;
    }

    if (perfilFiltro === 'casais' && !rel.includes('casal') && !rel.includes('couple') && !u.couple_profile) return false;
    if (perfilFiltro === 'solteiros' && !rel.includes('solteiro') && !rel.includes('homem') && !rel.includes('male')) return false;
    if (perfilFiltro === 'solteiras' && !rel.includes('solteira') && !rel.includes('mulher') && !rel.includes('female')) return false;

    if (orientacaoFiltro === 'hetero' && !ori.includes('hetero')) return false;
    if (orientacaoFiltro === 'bissexual' && !ori.includes('bi')) return false;
    if (orientacaoFiltro === 'liberal' && !ori.includes('liberal') && !ori.includes('swing') && !bio.includes('swing') && !bio.includes('liberal')) return false;

    if (objetivoFiltro === 'troca' && !bio.includes('troca') && !bio.includes('swing') && !rel.includes('casal')) return false;
    if (objetivoFiltro === 'menage' && !bio.includes('menage') && !bio.includes('tres') && !ori.includes('bi')) return false;
    if (objetivoFiltro === 'festas' && !bio.includes('festa') && !bio.includes('club')) return false;

    return true;
  });

  const OPCOES_PERFIL = [
    { id: 'todos', label: 'Todos' },
    { id: 'casais', label: 'Casais' },
    { id: 'solteiros', label: 'Solteiros (Ele)' },
    { id: 'solteiras', label: 'Solteiras (Ela)' }
  ];

  const OPCOES_ORIENTACAO = [
    { id: 'todos', label: 'Todas' },
    { id: 'hetero', label: 'Hétero' },
    { id: 'bissexual', label: 'Bissexuais' },
    { id: 'liberal', label: 'Liberal / Swing' }
  ];

  const OPCOES_OBJETIVO = [
    { id: 'todos', label: 'Todos os Objetivos' },
    { id: 'troca', label: 'Troca de Casais' },
    { id: 'menage', label: 'Ménage / A Três' },
    { id: 'festas', label: 'Festas & Clubes' }
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[var(--libido-bg)] text-[var(--libido-text)] pt-4 px-4 pb-28 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--libido-border)] pb-3">
        <div className="flex items-center gap-2.5">
          <Search className="text-[var(--libido-accent)]" size={22} />
          <div>
            <h2 className="text-base font-bold uppercase tracking-widest text-[var(--libido-accent)]">Busca Liberal</h2>
            <p className="text-[10px] text-[var(--libido-muted)]">Encontre casais, solteiras e solteiros por perfil e orientação</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-accent)]">
          {resultados.length} perfis
        </span>
      </div>

      {/* Campo de Busca por Apelido ou Cidade */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted)]" />
        <input
          type="text"
          value={termo}
          onChange={e => setTermo(e.target.value)}
          placeholder="Buscar por apelido, cidade ou fetiche..."
          className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--libido-text)] focus:border-[var(--libido-accent)] outline-none"
        />
      </div>

      {/* Painel 1: Quem voce procura */}
      <div className="bg-[var(--libido-surface-2)] p-3.5 rounded-2xl border border-[var(--libido-border)] mb-3">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--libido-muted)] flex items-center gap-1.5 mb-2.5">
          <Users size={13} className="text-[var(--libido-accent)]" /> Busco por:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OPCOES_PERFIL.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => setPerfilFiltro(op.id)}
              className={py-2 px-3 text-[11px] uppercase font-bold rounded-xl transition-all }
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Painel 2: Orientacao Sexual */}
      <div className="bg-[var(--libido-surface-2)] p-3.5 rounded-2xl border border-[var(--libido-border)] mb-3">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--libido-muted)] flex items-center gap-1.5 mb-2.5">
          <Filter size={13} className="text-[var(--libido-accent)]" /> Orientação:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OPCOES_ORIENTACAO.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOrientacaoFiltro(op.id)}
              className={py-2 px-3 text-[11px] uppercase font-bold rounded-xl transition-all }
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Painel 3: Interesses e Filtro de Foto */}
      <div className="bg-[var(--libido-surface-2)] p-3.5 rounded-2xl border border-[var(--libido-border)] mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--libido-muted)] flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--libido-accent)]" /> Vibe & Interesse:
          </label>
          <button
            type="button"
            onClick={() => setApenasComFoto(!apenasComFoto)}
            className={lex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border transition-all }
          >
            <Camera size={11} /> Só com foto
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {OPCOES_OBJETIVO.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => setObjetivoFiltro(op.id)}
              className={py-2 px-3 text-[10px] uppercase font-bold rounded-xl transition-all }
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Perfis Encontrados */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--libido-muted)] animate-pulse">Buscando perfis na comunidade...</div>
        ) : resultados.length > 0 ? (
          resultados.map((u, idx) => {
            const foto = u.photo_url || u.avatar_url || u.avatar || (Array.isArray(u.photos) && u.photos[0]);
            const nome = u.nickname || u.name || u.username || 'Perfil Liberal';
            const status = u.relationship_status || u.gender || 'Membro Liberal';
            const orient = u.sexual_orientation || 'Liberal';
            const cidade = u.city || u.location || '';

            return (
              <div
                key={u.user_id || u.id || idx}
                onClick={() => {
                  if (props?.onSelectUser) props.onSelectUser(u.user_id || u.id);
                  else if (props?.onViewProfile) props.onViewProfile(u.user_id || u.id);
                  else setPerfilSelecionado(u);
                }}
                className="flex items-center justify-between bg-[var(--libido-surface-2)] border border-[var(--libido-border)] hover:border-[var(--libido-accent)]/50 p-3 rounded-2xl cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-black/60 border border-[var(--libido-accent)]/60 overflow-hidden flex items-center justify-center shrink-0">
                    {foto ? (
                      <img src={foto} alt={nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[var(--libido-accent)]">{String(nome).charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[var(--libido-text)]">{nome}</span>
                      {u.age && <span className="text-xs text-[var(--libido-muted)]">{u.age} anos</span>}
                      <ShieldCheck size={13} className="text-amber-500" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--libido-accent)]/15 text-[var(--libido-accent)]">
                        {status}
                      </span>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-[var(--libido-muted)]">
                        {orient}
                      </span>
                      {cidade && (
                        <span className="text-[10px] text-[var(--libido-muted)] flex items-center gap-0.5">
                          <MapPin size={10} /> {cidade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-[var(--libido-accent)] px-2.5 py-1 rounded-lg bg-black/30 border border-[var(--libido-border)]">
                  Ver
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 bg-[var(--libido-surface-2)] rounded-2xl border border-[var(--libido-border)]">
            <p className="text-xs text-[var(--libido-muted)] mb-2">Nenhum perfil corresponde a essa combinação de filtros.</p>
            <button
              type="button"
              onClick={() => { setPerfilFiltro('todos'); setOrientacaoFiltro('todos'); setObjetivoFiltro('todos'); setApenasComFoto(false); setTermo(''); }}
              className="text-[10px] font-bold uppercase text-[var(--libido-accent)] underline"
            >
              Limpar filtros e mostrar todos
            </button>
          </div>
        )}
      </div>

      {perfilSelecionado && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPerfilSelecionado(null)}>
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-accent)]/40 rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--libido-accent)] mb-1">{perfilSelecionado.nickname || perfilSelecionado.name || 'Perfil'}</h3>
            <p className="text-xs text-[var(--libido-muted)] uppercase mb-3">
              {perfilSelecionado.relationship_status || 'Membro'} • {perfilSelecionado.sexual_orientation || 'Liberal'}
            </p>
            <p className="text-xs text-[var(--libido-text)] mb-4">{perfilSelecionado.bio || 'Sem descrição informada.'}</p>
            <button
              type="button"
              onClick={() => setPerfilSelecionado(null)}
              className="w-full py-2.5 bg-[var(--libido-accent)] text-black font-bold text-xs uppercase rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const Alerts = SearchScreen;
export const Notifications = SearchScreen;
export default SearchScreen;