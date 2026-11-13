import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Filter, Users, Sparkles, MapPin, ShieldCheck, Camera, RotateCcw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { IntencaoRadarBar } from './elite/IntencaoRadarBar';
import { CofrePrivadoModal } from './elite/CofrePrivadoModal';
import { SeloPresencaBadge } from './elite/SeloPresencaBadge';

// Blindagem global contra ReferenceError em runtime
if (typeof window !== 'undefined') {
  (window as any).IntencaoRadarBar = IntencaoRadarBar;
  (window as any).CofrePrivadoModal = CofrePrivadoModal;
  (window as any).SeloPresencaBadge = SeloPresencaBadge;
  (window as any).Bell = Search;
}

const SUPABASE_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';
const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export function SearchScreen(props: any) {
  const [loading, setLoading] = useState(false);
  const [todosPerfis, setTodosPerfis] = useState<any[]>([]);
  const [termo, setTermo] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('');
  const [orientacaoFiltro, setOrientacaoFiltro] = useState('');
  const [objetivoFiltro, setObjetivoFiltro] = useState('');
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

  // So exibe resultados quando o usuario seleciona pelo menos um filtro
  const temFiltroAtivo = Boolean(
    perfilFiltro !== '' ||
    orientacaoFiltro !== '' ||
    objetivoFiltro !== '' ||
    apenasComFoto ||
    termo.trim() !== ''
  );

  const limparFiltros = () => {
    setPerfilFiltro('');
    setOrientacaoFiltro('');
    setObjetivoFiltro('');
    setApenasComFoto(false);
    setTermo('');
  };

  const resultados = !temFiltroAtivo
    ? []
    : todosPerfis.filter(u => {
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
    { id: 'casais', label: 'Casais' },
    { id: 'solteiros', label: 'Solteiros (Ele)' },
    { id: 'solteiras', label: 'Solteiras (Ela)' },
    { id: 'todos', label: 'Ver Todos' }
  ];

  const OPCOES_ORIENTACAO = [
    { id: 'hetero', label: 'Hétero' },
    { id: 'bissexual', label: 'Bissexuais' },
    { id: 'liberal', label: 'Liberal / Swing' },
    { id: 'todos', label: 'Todas' }
  ];

  const OPCOES_OBJETIVO = [
    { id: 'troca', label: 'Troca de Casais' },
    { id: 'menage', label: 'Ménage / A Três' },
    { id: 'festas', label: 'Festas & Clubes' },
    { id: 'todos', label: 'Todos Interesses' }
  ];

  return (
    <div id="libido-search-screen-root" className="w-full min-h-full bg-[var(--libido-bg,#0b0b0e)] text-[var(--libido-text,#f5f5f7)]">
      {/* Container centralizado na mesma largura das outras paginas (430px) */}
      <div className="w-full max-w-[430px] mx-auto min-h-[calc(100vh-64px)] border-x border-[var(--libido-border,rgba(255,255,255,0.08))] px-3.5 pt-3.5 pb-20">
        
        {/* Cabecalho Compacto */}
        <div className="flex items-center justify-between mb-3 border-b border-[var(--libido-border,rgba(255,255,255,0.08))] pb-2.5">
          <div className="flex items-center gap-2">
            <Search className="text-[var(--libido-accent,#d86b3f)]" size={18} />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--libido-accent,#d86b3f)]">Busca Liberal</h2>
              <p className="text-[9px] text-[var(--libido-muted,#9ca3af)]">Escolha os filtros para listar perfis</p>
            </div>
          </div>
          {temFiltroAtivo && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-accent,#d86b3f)]">
                {resultados.length} perfis
              </span>
              <button
                type="button"
                onClick={limparFiltros}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[9px] font-bold uppercase text-[var(--libido-muted,#9ca3af)] hover:text-white"
              >
                <RotateCcw size={10} /> Limpar
              </button>
            </div>
          )}
        </div>

        {/* Input de Pesquisa */}
        <div className="relative mb-2.5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)]" />
          <input
            type="text"
            value={termo}
            onChange={e => setTermo(e.target.value)}
            placeholder="Buscar apelido, cidade ou fetiche..."
            className="w-full bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl pl-8 pr-3 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] focus:border-[var(--libido-accent,#d86b3f)] outline-none"
          />
        </div>

        {/* Bloco 1: Busco por */}
        <div className="bg-[var(--libido-surface-2,#16161d)] p-2.5 rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))] mb-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1 mb-2">
            <Users size={11} className="text-[var(--libido-accent,#d86b3f)]" /> Busco por:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {OPCOES_PERFIL.map(op => (
              <button
                key={op.id}
                type="button"
                onClick={() => setPerfilFiltro(prev => (prev === op.id ? '' : op.id))}
                className={`py-1.5 px-2 text-[10px] uppercase font-bold rounded-lg transition-all ${
                  perfilFiltro === op.id
                    ? 'bg-[var(--libido-accent,#d86b3f)] text-black shadow-[0_0_10px_rgba(216,107,63,0.3)]'
                    : 'bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.08))] text-[var(--libido-muted,#9ca3af)]'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bloco 2: Orientacao */}
        <div className="bg-[var(--libido-surface-2,#16161d)] p-2.5 rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))] mb-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1 mb-2">
            <Filter size={11} className="text-[var(--libido-accent,#d86b3f)]" /> Orientação:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {OPCOES_ORIENTACAO.map(op => (
              <button
                key={op.id}
                type="button"
                onClick={() => setOrientacaoFiltro(prev => (prev === op.id ? '' : op.id))}
                className={`py-1.5 px-2 text-[10px] uppercase font-bold rounded-lg transition-all ${
                  orientacaoFiltro === op.id
                    ? 'bg-[var(--libido-accent,#d86b3f)] text-black shadow-[0_0_10px_rgba(216,107,63,0.3)]'
                    : 'bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.08))] text-[var(--libido-muted,#9ca3af)]'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bloco 3: Interesses */}
        <div className="bg-[var(--libido-surface-2,#16161d)] p-2.5 rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))] mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1">
              <Sparkles size={11} className="text-[var(--libido-accent,#d86b3f)]" /> Interesses:
            </label>
            <button
              type="button"
              onClick={() => setApenasComFoto(!apenasComFoto)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border transition-all ${
                apenasComFoto
                  ? 'bg-[var(--libido-accent,#d86b3f)]/20 border-[var(--libido-accent,#d86b3f)] text-[var(--libido-accent,#d86b3f)]'
                  : 'border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
              }`}
            >
              <Camera size={10} /> Só com foto
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {OPCOES_OBJETIVO.map(op => (
              <button
                key={op.id}
                type="button"
                onClick={() => setObjetivoFiltro(prev => (prev === op.id ? '' : op.id))}
                className={`py-1.5 px-2 text-[9px] uppercase font-bold rounded-lg transition-all ${
                  objetivoFiltro === op.id
                    ? 'bg-[var(--libido-accent,#d86b3f)] text-black'
                    : 'bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.08))] text-[var(--libido-muted,#9ca3af)]'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados: Ocultos ate o usuario selecionar uma opcao */}
        {!temFiltroAtivo ? (
          <div className="text-center py-8 px-3 bg-[var(--libido-surface-2,#16161d)]/50 rounded-xl border border-dashed border-[var(--libido-border,rgba(255,255,255,0.1))]">
            <Search size={22} className="mx-auto mb-2 text-[var(--libido-accent,#d86b3f)] opacity-60" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--libido-text,#f5f5f7)] mb-1">
              Selecione o que você procura
            </p>
            <p className="text-[10px] text-[var(--libido-muted,#9ca3af)]">
              Toque em Casais, Solteiros, Solteiras ou Orientação acima para exibir os perfis compatíveis.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <div className="py-6 text-center text-[11px] text-[var(--libido-muted,#9ca3af)] animate-pulse">Buscando perfis...</div>
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
                    className="flex items-center justify-between bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.08))] hover:border-[var(--libido-accent,#d86b3f)]/50 p-2.5 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-black/60 border border-[var(--libido-accent,#d86b3f)]/60 overflow-hidden flex items-center justify-center shrink-0">
                        {foto ? (
                          <img src={foto} alt={nome} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[var(--libido-accent,#d86b3f)]">{String(nome).charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-[var(--libido-text,#f5f5f7)]">{nome}</span>
                          {u.age && <span className="text-[10px] text-[var(--libido-muted,#9ca3af)]">{u.age} anos</span>}
                          <ShieldCheck size={12} className="text-amber-500" />
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[var(--libido-accent,#d86b3f)]/15 text-[var(--libido-accent,#d86b3f)]">
                            {status}
                          </span>
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--libido-muted,#9ca3af)]">
                            {orient}
                          </span>
                          {cidade && (
                            <span className="text-[9px] text-[var(--libido-muted,#9ca3af)] flex items-center gap-0.5">
                              <MapPin size={9} /> {cidade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase text-[var(--libido-accent,#d86b3f)] px-2 py-1 rounded-lg bg-black/30 border border-[var(--libido-border,rgba(255,255,255,0.1))]">
                      Ver
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 bg-[var(--libido-surface-2,#16161d)] rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))]">
                <p className="text-[11px] text-[var(--libido-muted,#9ca3af)] mb-1.5">Nenhum perfil encontrado para este filtro.</p>
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="text-[9px] font-bold uppercase text-[var(--libido-accent,#d86b3f)] underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {perfilSelecionado && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPerfilSelecionado(null)}>
            <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-accent,#d86b3f)]/40 rounded-2xl p-4 max-w-xs w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-[var(--libido-accent,#d86b3f)] mb-0.5">{perfilSelecionado.nickname || perfilSelecionado.name || 'Perfil'}</h3>
              <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] uppercase mb-2.5">
                {perfilSelecionado.relationship_status || 'Membro'} • {perfilSelecionado.sexual_orientation || 'Liberal'}
              </p>
              <p className="text-xs text-[var(--libido-text,#f5f5f7)] mb-3.5">{perfilSelecionado.bio || 'Sem descrição informada.'}</p>
              <button
                type="button"
                onClick={() => setPerfilSelecionado(null)}
                className="w-full py-2 bg-[var(--libido-accent,#d86b3f)] text-black font-bold text-[10px] uppercase rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Interceptador Global ajustado para respeitar a barra do topo (top: 64px) e cobrir até o fim da tela (bottom: 0)
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
      return;
    }
    if (!portalDiv) {
      portalDiv = document.createElement('div');
      portalDiv.id = 'libido-search-portal-overlay';
      portalDiv.style.cssText = 'position:fixed;top:64px;left:0;right:0;bottom:0;z-index:40;background:var(--libido-bg,#0b0b0e);overflow-y:auto;';
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
      setTimeout(abrirBusca, 15);
      return;
    }

    if (dentroDeNav && (txt === 'radar' || txt === 'feed' || txt === 'chat' || txt === 'perfil' || txt === 'menu' || txt === 'eventos' || txt === 'top' || txt === 'parceiros' || txt === 'início' || txt === 'inicio' || txt === 'grupos' || txt === 'fórum' || txt === 'live')) {
      fecharBusca();
    }
  }, true);
}

export const Alerts = SearchScreen;
export const Notifications = SearchScreen;
export default SearchScreen;