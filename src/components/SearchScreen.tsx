import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Filter, Users, Sparkles, MapPin, ShieldCheck, Camera, RotateCcw, X, ChevronDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { IntencaoRadarBar } from './elite/IntencaoRadarBar';
import { CofrePrivadoModal } from './elite/CofrePrivadoModal';
import { SeloPresencaBadge } from './elite/SeloPresencaBadge';

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
  
  // Filtros
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
      .limit(1500)
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
    : todosPerfis.filter((u) => {
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

        if (perfilFiltro === 'casais' && !rel.includes('casal') && !rel.includes('casais') && !rel.includes('couple') && !u.couple_profile) return false;
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
    { id: '', label: 'Todos os Perfis' },
    { id: 'casais', label: 'Apenas Casais' },
    { id: 'solteiros', label: 'Apenas Solteiros (Ele)' },
    { id: 'solteiras', label: 'Apenas Solteiras (Ela)' }
  ];

  const OPCOES_ORIENTACAO = [
    { id: '', label: 'Qualquer Orientação' },
    { id: 'hetero', label: 'Hétero' },
    { id: 'bissexual', label: 'Bissexuais' },
    { id: 'liberal', label: 'Liberal / Swing' }
  ];

  const OPCOES_OBJETIVO = [
    { id: '', label: 'Qualquer Interesse' },
    { id: 'troca', label: 'Troca de Casais' },
    { id: 'menage', label: 'Ménage / A Três' },
    { id: 'festas', label: 'Festas & Clubes' }
  ];

  return (
    <div id="libido-search-screen-root" className="w-full min-h-full bg-[var(--libido-bg,#0b0b0e)] text-[var(--libido-text,#f5f5f7)]">
      <div className="w-full max-w-[430px] mx-auto min-h-[calc(100vh-64px)] border-x border-[var(--libido-border,rgba(255,255,255,0.08))] px-3.5 pt-4 pb-24">
        
        {/* Cabecalho Compacto */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--libido-border,rgba(255,255,255,0.08))]">
          <div className="flex items-center gap-2">
            <Search className="text-[var(--libido-accent,#d86b3f)]" size={18} />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--libido-accent,#d86b3f)]">Busca Avançada</h2>
              <p className="text-[9px] text-[var(--libido-muted,#9ca3af)]">Filtre perfis rapidamente</p>
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

        {/* Input de Pesquisa por Texto */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)]" />
          <input
            type="text"
            value={termo}
            onChange={e => setTermo(e.target.value)}
            placeholder="Buscar por apelido, cidade ou texto..."
            className="w-full bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl pl-8 pr-3 py-2.5 text-[11px] text-[var(--libido-text,#f5f5f7)] focus:border-[var(--libido-accent,#d86b3f)] outline-none"
          />
        </div>

        {/* Filtros Dropdown (Select Nativos) */}
        <div className="bg-[var(--libido-surface-2,#16161d)] p-3 rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))] mb-4 space-y-2.5">
          
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[var(--libido-accent,#d86b3f)] w-5" />
            <div className="relative flex-1">
              <select
                value={perfilFiltro}
                onChange={(e) => setPerfilFiltro(e.target.value)}
                className="w-full bg-black/50 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-lg px-2.5 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] font-medium appearance-none outline-none focus:border-[var(--libido-accent,#d86b3f)] uppercase tracking-wider"
              >
                {OPCOES_PERFIL.map(op => (
                  <option key={op.id} value={op.id}>{op.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--libido-accent,#d86b3f)] w-5" />
            <div className="relative flex-1">
              <select
                value={orientacaoFiltro}
                onChange={(e) => setOrientacaoFiltro(e.target.value)}
                className="w-full bg-black/50 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-lg px-2.5 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] font-medium appearance-none outline-none focus:border-[var(--libido-accent,#d86b3f)] uppercase tracking-wider"
              >
                {OPCOES_ORIENTACAO.map(op => (
                  <option key={op.id} value={op.id}>{op.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--libido-accent,#d86b3f)] w-5" />
            <div className="relative flex-1">
              <select
                value={objetivoFiltro}
                onChange={(e) => setObjetivoFiltro(e.target.value)}
                className="w-full bg-black/50 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-lg px-2.5 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] font-medium appearance-none outline-none focus:border-[var(--libido-accent,#d86b3f)] uppercase tracking-wider"
              >
                {OPCOES_OBJETIVO.map(op => (
                  <option key={op.id} value={op.id}>{op.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)] pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--libido-border,rgba(255,255,255,0.06))]">
            <label className="text-[10px] font-bold text-[var(--libido-muted,#9ca3af)] uppercase tracking-wider">
              Exigir Foto no Perfil
            </label>
            <button
              type="button"
              onClick={() => setApenasComFoto(!apenasComFoto)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                apenasComFoto ? 'bg-[var(--libido-accent,#d86b3f)]' : 'bg-zinc-700'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                apenasComFoto ? 'translate-x-4' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Resultados */}
        {!temFiltroAtivo ? (
          <div className="text-center py-8 px-3 bg-[var(--libido-surface-2,#16161d)]/50 rounded-xl border border-dashed border-[var(--libido-border,rgba(255,255,255,0.1))]">
            <Search size={22} className="mx-auto mb-2 text-[var(--libido-accent,#d86b3f)] opacity-60" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--libido-text,#f5f5f7)] mb-1">
              Selecione o que você procura
            </p>
            <p className="text-[10px] text-[var(--libido-muted,#9ca3af)]">
              Use as opções acima para listar os perfis da comunidade.
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
            <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-accent,#d86b3f)]/40 rounded-2xl p-4 max-w-[340px] w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-[var(--libido-accent,#d86b3f)] mb-0.5">{perfilSelecionado.nickname || perfilSelecionado.name || 'Perfil'}</h3>
              <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] uppercase mb-2.5">
                {perfilSelecionado.relationship_status || 'Membro'} • {perfilSelecionado.sexual_orientation || 'Liberal'}
              </p>
              <p className="text-xs text-[var(--libido-text,#f5f5f7)] mb-4">{perfilSelecionado.bio || 'Sem descrição informada.'}</p>
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

if (typeof window !== 'undefined' && !(window as any).__LIBIDO_BUSCA_INTERCEPTOR__) {
  (window as any).__LIBIDO_BUSCA_INTERCEPTOR__ = true;
  let portalDiv: HTMLElement | null = null;
  let portalRoot: any = null;

  const fecharBusca = () => { if (portalDiv) portalDiv.style.display = 'none'; };

  const abrirBusca = () => {
    if (document.getElementById('libido-search-screen-root') && (!portalDiv || portalDiv.style.display === 'none')) return;
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
    if (dentroDeNav && (txt === 'radar' || txt === 'feed' || txt === 'chat' || txt === 'perfil' || txt === 'menu' || txt === 'eventos' || txt === 'top' || txt === 'início' || txt === 'inicio' || txt === 'live')) {
      fecharBusca();
    }
  }, true);
}

export const Alerts = SearchScreen;
export const Notifications = SearchScreen;
export default SearchScreen;