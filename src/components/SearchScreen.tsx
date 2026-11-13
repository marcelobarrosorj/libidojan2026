import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Filter, Users, Sparkles, MapPin, ShieldCheck, Camera, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';
const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export function SearchScreen(props: any) {
  const [loading, setLoading] = useState(false);
  const [todosPerfis, setTodosPerfis] = useState<any[]>([]);
  const [termo, setTermo] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('todos');
  const [orientacaoFiltro, setOrientacaoFiltro] = useState('todos');
  const [objetivoFiltro, setObjetivoFiltro] = useState('todos');
  const [apenasComFoto, setApenasComFoto] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState<any | null>(null);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    sbClient
      .from('users')
      .select('*')
      .limit(150)
      .then(({ data }) => {
        if (ativo && data) setTodosPerfis(data);
        if (ativo) setLoading(false);
      })
      .catch(() => {
        if (ativo) setLoading(false);
      });
    return () => { ativo = false; };
  }, []);

  const normalizar = (v: any) =>
    String(v || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

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
    { id: 'todos', label: 'Todos os Interesses' },
    { id: 'troca', label: 'Troca de Casais' },
    { id: 'menage', label: 'Ménage / A Três' },
    { id: 'festas', label: 'Festas & Clubes' }
  ];

  return (
    <div id="libido-search-screen-root" className="flex flex-col w-full h-full bg-[var(--libido-bg,#0b0b0e)] text-[var(--libido-text,#f5f5f7)] pt-4 px-4 pb-28 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--libido-border,rgba(255,255,255,0.1))] pb-3">
        <div className="flex items-center gap-2.5">
          <Search className="text-[var(--libido-accent,#d86b3f)]" size={22} />
          <div>
            <h2 className="text-base font-bold uppercase tracking-widest text-[var(--libido-accent,#d86b3f)]">Busca Liberal</h2>
            <p className="text-[10px] text-[var(--libido-muted,#9ca3af)]">Casais, solteiros, solteiras, orientação e interesses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-accent,#d86b3f)]">
            {resultados.length} perfis
          </span>
          {props?.onClose && (
            <button
              type="button"
              onClick={props.onClose}
              className="p-1.5 rounded-full bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Busca por texto */}
      <div className="relative mb-3.5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)]" />
        <input
          type="text"
          value={termo}
          onChange={e => setTermo(e.target.value)}
          placeholder="Buscar por apelido, cidade ou fetiche..."
          className="w-full bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--libido-text,#f5f5f7)] focus:border-[var(--libido-accent,#d86b3f)] outline-none"
        />
      </div>

      {/* Seletor 1: Casais, Solteiros, Solteiras */}
      <div className="bg-[var(--libido-surface-2,#16161d)] p-3.5 rounded-2xl border border-[var(--libido-border,rgba(255,255,255,0.1))] mb-3">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1.5 mb-2.5">
          <Users size={13} className="text-[var(--libido-accent,#d86b3f)]" /> Busco por:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OPCOES_PERFIL.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => setPerfilFiltro(op.id)}
              className={`py-2 px-3 text-[11px] uppercase font-bold rounded-xl transition-all ${
                perfilFiltro === op.id
                  ? 'bg-[var(--libido-accent,#d86b3f)] text-black shadow-[0_0_12px_rgba(216,107,63,0.35)]'
                  : 'bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor 2: Hetero, Bissexuais, Liberal/Swing */}
      <div className="bg-[var(--libido-surface-2,#16161d)] p-3.5 rounded-2xl border border-[var(--libido-border,rgba(255,255,255,0.1))] mb-3">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1.5 mb-2.5">
          <Filter size={13} className="text-[var(--libido-accent,#d86b3f)]" /> Orientação:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OPCOES_ORIENTACAO.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOrientacaoFiltro(op.id)}
              className={`py-2 px-3 text-[11px] uppercase font-bold rounded-xl transition-all ${
                orientacaoFiltro === op.id
                  ? 'bg-[var(--libido-accent,#d86b3f)] text-black shadow-[0_0_12px_rgba(216,107,63,0.35)]'
                  : 'bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor 3: Interesses + Com Foto */}
      <div className="bg-[var(--libido-surface-2,#16161d)] p-3.5 rounded-2xl border border-[var(--libido-border,rgba(255,255,255,0.1))] mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--libido-accent,#d86b3f)]" /> Interesses:
          </label>
          <button
            type="button"
            onClick={() => setApenasComFoto(!apenasComFoto)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border transition-all ${
              apenasComFoto
                ? 'bg-[var(--libido-accent,#d86b3f)]/20 border-[var(--libido-accent,#d86b3f)] text-[var(--libido-accent,#d86b3f)]'
                : 'border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
            }`}
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
              className={`py-2 px-3 text-[10px] uppercase font-bold rounded-xl transition-all ${
                objetivoFiltro === op.id
                  ? 'bg-[var(--libido-accent,#d86b3f)] text-black'
                  : 'bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--libido-muted,#9ca3af)] animate-pulse">Carregando perfis...</div>
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
                onClick={() => setPerfilSelecionado(u)}
                className="flex items-center justify-between bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] hover:border-[var(--libido-accent,#d86b3f)]/50 p-3 rounded-2xl cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-black/60 border border-[var(--libido-accent,#d86b3f)]/60 overflow-hidden flex items-center justify-center shrink-0">
                    {foto ? (
                      <img src={foto} alt={nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[var(--libido-accent,#d86b3f)]">{String(nome).charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[var(--libido-text,#f5f5f7)]">{nome}</span>
                      {u.age && <span className="text-xs text-[var(--libido-muted,#9ca3af)]">{u.age} anos</span>}
                      <ShieldCheck size={13} className="text-amber-500" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--libido-accent,#d86b3f)]/15 text-[var(--libido-accent,#d86b3f)]">
                        {status}
                      </span>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-[var(--libido-muted,#9ca3af)]">
                        {orient}
                      </span>
                      {cidade && (
                        <span className="text-[10px] text-[var(--libido-muted,#9ca3af)] flex items-center gap-0.5">
                          <MapPin size={10} /> {cidade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-[var(--libido-accent,#d86b3f)] px-2.5 py-1 rounded-lg bg-black/30 border border-[var(--libido-border,rgba(255,255,255,0.1))]">
                  Ver
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 bg-[var(--libido-surface-2,#16161d)] rounded-2xl border border-[var(--libido-border,rgba(255,255,255,0.1))]">
            <p className="text-xs text-[var(--libido-muted,#9ca3af)] mb-2">Nenhum perfil encontrado para este filtro.</p>
            <button
              type="button"
              onClick={() => { setPerfilFiltro('todos'); setOrientacaoFiltro('todos'); setObjetivoFiltro('todos'); setApenasComFoto(false); setTermo(''); }}
              className="text-[10px] font-bold uppercase text-[var(--libido-accent,#d86b3f)] underline"
            >
              Limpar filtros e mostrar todos
            </button>
          </div>
        )}
      </div>

      {perfilSelecionado && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPerfilSelecionado(null)}>
          <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-accent,#d86b3f)]/40 rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--libido-accent,#d86b3f)] mb-1">{perfilSelecionado.nickname || perfilSelecionado.name || 'Perfil'}</h3>
            <p className="text-xs text-[var(--libido-muted,#9ca3af)] uppercase mb-3">
              {perfilSelecionado.relationship_status || 'Membro'} • {perfilSelecionado.sexual_orientation || 'Liberal'}
            </p>
            <p className="text-xs text-[var(--libido-text,#f5f5f7)] mb-4">{perfilSelecionado.bio || 'Sem descrição informada.'}</p>
            <button
              type="button"
              onClick={() => setPerfilSelecionado(null)}
              className="w-full py-2.5 bg-[var(--libido-accent,#d86b3f)] text-black font-bold text-xs uppercase rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Interceptador Global: Abre a Busca Avancada ao clicar na Lupa (ou aba Busca/Alertas)
if (typeof window !== 'undefined' && !(window as any).__LIBIDO_BUSCA_INTERCEPTOR__) {
  (window as any).__LIBIDO_BUSCA_INTERCEPTOR__ = true;

  let portalDiv: HTMLElement | null = null;
  let portalRoot: any = null;

  const fecharBusca = () => {
    if (portalDiv) {
      portalDiv.style.display = 'none';
    }
  };

  const abrirBusca = () => {
    if (document.getElementById('libido-search-screen-root') && (!portalDiv || portalDiv.style.display === 'none')) {
      return; // Ja renderizado nativamente pelo roteador
    }
    if (!portalDiv) {
      portalDiv = document.createElement('div');
      portalDiv.id = 'libido-search-portal-overlay';
      portalDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:64px;z-index:45;background:var(--libido-bg,#0b0b0e);overflow-y:auto;';
      document.body.appendChild(portalDiv);
      portalRoot = createRoot(portalDiv);
      portalRoot.render(<SearchScreen onClose={fecharBusca} />);
    } else {
      portalDiv.style.display = 'block';
    }
  };

  document.addEventListener('click', (e) => {
    const alvo = e.target as HTMLElement;
    if (!alvo) return;
    if (portalDiv && portalDiv.contains(alvo)) return;

    const btn = alvo.closest('button, a, [role="button"]');
    if (!btn) return;

    const txt = (btn.textContent || '').trim().toLowerCase();
    const temIconeLupa = !!btn.querySelector('.lucide-search, .lucide-bell');
    const dentroDeNav = !!btn.closest('nav, header, footer, [class*="bottom"], [class*="nav"]');

    if (txt === 'busca' || txt === 'alertas' || txt === 'notificações' || txt === 'notificacoes' || (dentroDeNav && temIconeLupa)) {
      setTimeout(abrirBusca, 20);
      return;
    }

    // Se clicou em qualquer outro botao da barra de navegacao inferior, fecha a busca
    if (dentroDeNav && (txt === 'radar' || txt === 'feed' || txt === 'chat' || txt === 'perfil' || txt === 'eventos' || txt === 'top' || txt === 'parceiros' || txt === 'início' || txt === 'inicio' || txt === 'grupos' || txt === 'fórum' || txt === 'live')) {
      fecharBusca();
    }
  }, true);
}

export const Alerts = SearchScreen;
export const Notifications = SearchScreen;
export default SearchScreen;