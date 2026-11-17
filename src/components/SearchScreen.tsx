import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Filter, Users, Sparkles, MapPin, ShieldCheck, RotateCcw, ChevronDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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
    sbClient.from('users').select('*').limit(3000)
      .then(({ data }) => {
        if (ativo && data) setTodosPerfis(data);
        if (ativo) setLoading(false);
      })
      .catch(() => {
        if (ativo) setLoading(false);
      });
    return () => { ativo = false; };
  }, []);

  const normalizar = (v: any) => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // FUNÇÃO SALVA-VIDAS: Decodifica JSON sujo do banco e resgata casais ocultos
  const parseProfileData = (u: any) => {
    let bioText = u.bio || u.description || '';
    let isCasal = u.couple_profile === true || normalizar(u.relationship_status).includes('casal');
    let orientacao = normalizar(u.sexual_orientation || u.orientation || '');
    let genero = normalizar(u.gender || '');

    // Se a bio for um JSON cru (como na imagem do erro), extrai isCouple e limpa o texto
    if (typeof u.bio === 'string' && u.bio.trim().startsWith('{')) {
      try {
        const pb = JSON.parse(u.bio);
        if (pb.isCouple === true) isCasal = true;
        if (pb.gender) genero = normalizar(pb.gender);
        if (pb.orientation) orientacao = normalizar(pb.orientation);
        bioText = pb.description || pb.bio || pb.about || pb.text || '';
      } catch (e) {}
    } else if (typeof u.bio === 'object' && u.bio !== null) {
        if (u.bio.isCouple === true) isCasal = true;
        if (u.bio.gender) genero = normalizar(u.bio.gender);
        if (u.bio.orientation) orientacao = normalizar(u.bio.orientation);
        bioText = u.bio.description || u.bio.bio || u.bio.about || u.bio.text || '';
    }

    const statusReal = normalizar(`${u.relationship_status} ${genero} ${u.type} ${u.profile_type}`);
    if (statusReal.includes('casal') || statusReal.includes('casais') || statusReal.includes('couple') || statusReal.includes('casad')) isCasal = true;

    const isHomemSolteiro = !isCasal && (statusReal.includes('solteiro') || statusReal.includes('homem') || statusReal.includes('male') || statusReal.includes('masculino') || genero === 'male' || genero === 'homem');
    const isMulherSolteira = !isCasal && (statusReal.includes('solteira') || statusReal.includes('mulher') || statusReal.includes('female') || statusReal.includes('feminina') || genero === 'female' || genero === 'mulher');

    return { ...u, bioText, isCasal, isHomemSolteiro, isMulherSolteira, orientacao, statusReal };
  };

  const temFiltroAtivo = Boolean(perfilFiltro !== '' || orientacaoFiltro !== '' || objetivoFiltro !== '' || apenasComFoto || termo.trim() !== '');

  const limparFiltros = () => {
    setPerfilFiltro(''); setOrientacaoFiltro(''); setObjetivoFiltro(''); setApenasComFoto(false); setTermo('');
  };

  const resultados = !temFiltroAtivo ? [] : todosPerfis.filter((uOriginal) => {
    const u = parseProfileData(uOriginal);
    const ori = normalizar(`${u.orientacao} ${uOriginal.preferences}`);
    const bio = normalizar(`${u.bioText} ${uOriginal.interests} ${uOriginal.looking_for}`);
    const nick = normalizar(`${uOriginal.nickname} ${uOriginal.name} ${uOriginal.username}`);
    const cid = normalizar(`${uOriginal.city} ${uOriginal.location} ${uOriginal.state}`);
    const foto = uOriginal.photo_url || uOriginal.avatar_url || uOriginal.avatar || (Array.isArray(uOriginal.photos) && uOriginal.photos[0]);

    if (apenasComFoto && !foto) return false;

    if (termo.trim() !== '') {
      const t = normalizar(termo);
      if (!nick.includes(t) && !cid.includes(t) && !bio.includes(t) && !u.statusReal.includes(t)) return false;
    }

    if (perfilFiltro === 'casais' && !u.isCasal) return false;
    if (perfilFiltro === 'solteiros' && !u.isHomemSolteiro) return false;
    if (perfilFiltro === 'solteiras' && !u.isMulherSolteira) return false;

    if (orientacaoFiltro === 'hetero' && !ori.includes('hetero')) return false;
    if (orientacaoFiltro === 'bissexual' && !ori.includes('bi')) return false;
    if (orientacaoFiltro === 'liberal' && !ori.includes('liberal') && !ori.includes('swing') && !bio.includes('swing') && !bio.includes('liberal')) return false;

    if (objetivoFiltro === 'troca' && !bio.includes('troca') && !bio.includes('swing') && !u.isCasal) return false;
    if (objetivoFiltro === 'menage' && !bio.includes('menage') && !bio.includes('tres') && !ori.includes('bi')) return false;
    if (objetivoFiltro === 'festas' && !bio.includes('festa') && !bio.includes('club')) return false;

    return true;
  });

  const perfilParsed = perfilSelecionado ? parseProfileData(perfilSelecionado) : null;

  return (
    <div id="libido-search-screen-root" className="w-full min-h-full bg-[var(--libido-bg,#0b0b0e)] text-[var(--libido-text,#f5f5f7)]">
      <div className="w-full max-w-[430px] mx-auto min-h-[calc(100vh-64px)] border-x border-[var(--libido-border,rgba(255,255,255,0.08))] px-3.5 pt-4 pb-24">
        
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--libido-border,rgba(255,255,255,0.08))]">
          <div className="flex items-center gap-2">
            <Search className="text-[var(--libido-accent,#d86b3f)]" size={18} />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--libido-accent,#d86b3f)]">Busca Avançada</h2>
              <p className="text-[9px] text-[var(--libido-muted,#9ca3af)]">Filtre perfis rapidamente</p>
            </div>
          </div>
          {temFiltroAtivo && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-accent,#d86b3f)]">
                  {resultados.length} perfis
                </span>
                <button type="button" onClick={limparFiltros} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] text-[9px] font-bold uppercase text-[var(--libido-muted,#9ca3af)] hover:text-white">
                  <RotateCcw size={10} /> Limpar
                </button>
              </div>
              {apenasComFoto && <span className="text-[8px] text-amber-500 font-bold">(Sem foto ocultos)</span>}
            </div>
          )}
        </div>

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

        <div className="bg-[var(--libido-surface-2,#16161d)] p-3 rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))] mb-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[var(--libido-accent,#d86b3f)] w-5" />
            <div className="relative flex-1">
              <select value={perfilFiltro} onChange={(e) => setPerfilFiltro(e.target.value)} className="w-full bg-black/50 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-lg px-2.5 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] font-medium appearance-none outline-none focus:border-[var(--libido-accent,#d86b3f)] uppercase tracking-wider">
                <option value="">Todos os Perfis</option>
                <option value="casais">Apenas Casais</option>
                <option value="solteiros">Apenas Solteiros (Ele)</option>
                <option value="solteiras">Apenas Solteiras (Ela)</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--libido-accent,#d86b3f)] w-5" />
            <div className="relative flex-1">
              <select value={orientacaoFiltro} onChange={(e) => setOrientacaoFiltro(e.target.value)} className="w-full bg-black/50 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-lg px-2.5 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] font-medium appearance-none outline-none focus:border-[var(--libido-accent,#d86b3f)] uppercase tracking-wider">
                <option value="">Qualquer Orientação</option>
                <option value="hetero">Hétero</option>
                <option value="bissexual">Bissexuais</option>
                <option value="liberal">Liberal / Swing</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--libido-accent,#d86b3f)] w-5" />
            <div className="relative flex-1">
              <select value={objetivoFiltro} onChange={(e) => setObjetivoFiltro(e.target.value)} className="w-full bg-black/50 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-lg px-2.5 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] font-medium appearance-none outline-none focus:border-[var(--libido-accent,#d86b3f)] uppercase tracking-wider">
                <option value="">Qualquer Interesse</option>
                <option value="troca">Troca de Casais</option>
                <option value="menage">Ménage / A Três</option>
                <option value="festas">Festas & Clubes</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)] pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--libido-border,rgba(255,255,255,0.06))]">
            <label className="text-[10px] font-bold text-[var(--libido-muted,#9ca3af)] uppercase tracking-wider">
              Exigir Foto no Perfil
            </label>
            <button type="button" onClick={() => setApenasComFoto(!apenasComFoto)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${apenasComFoto ? 'bg-[var(--libido-accent,#d86b3f)]' : 'bg-zinc-700'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${apenasComFoto ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {!temFiltroAtivo ? (
          <div className="text-center py-8 px-3 bg-[var(--libido-surface-2,#16161d)]/50 rounded-xl border border-dashed border-[var(--libido-border,rgba(255,255,255,0.1))]">
            <Search size={22} className="mx-auto mb-2 text-[var(--libido-accent,#d86b3f)] opacity-60" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--libido-text,#f5f5f7)] mb-1">Selecione o que você procura</p>
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <div className="py-6 text-center text-[11px] text-[var(--libido-muted,#9ca3af)] animate-pulse">Buscando perfis...</div>
            ) : resultados.length > 0 ? (
              resultados.map((uOriginal, idx) => {
                const u = parseProfileData(uOriginal);
                const foto = u.photo_url || u.avatar_url || u.avatar || (Array.isArray(u.photos) && u.photos[0]);
                const nome = u.nickname || u.name || u.username || 'Perfil Liberal';
                const status = u.isCasal ? 'Casal' : (u.relationship_status || u.gender || 'Membro Liberal');
                const orient = u.orientacao || 'Liberal';
                const cidade = u.city || u.location || '';

                return (
                  <div key={u.user_id || u.id || idx} onClick={() => setPerfilSelecionado(uOriginal)} className="flex items-center justify-between bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.08))] hover:border-[var(--libido-accent,#d86b3f)]/50 p-2.5 rounded-xl cursor-pointer transition-all">
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
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[var(--libido-accent,#d86b3f)]/15 text-[var(--libido-accent,#d86b3f)]">{status}</span>
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--libido-muted,#9ca3af)]">{orient}</span>
                          {cidade && <span className="text-[9px] text-[var(--libido-muted,#9ca3af)] flex items-center gap-0.5"><MapPin size={9} /> {cidade}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase text-[var(--libido-accent,#d86b3f)] px-2 py-1 rounded-lg bg-black/30 border border-[var(--libido-border,rgba(255,255,255,0.1))]">Ver</span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 bg-[var(--libido-surface-2,#16161d)] rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))]">
                <p className="text-[11px] text-[var(--libido-muted,#9ca3af)] mb-1.5">Nenhum perfil encontrado para este filtro.</p>
              </div>
            )}
          </div>
        )}

        {/* MODAL CORRIGIDO: Agora usa perfilParsed.bioText em vez de perfilSelecionado.bio que tinha o JSON quebrado */}
        {perfilParsed && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPerfilSelecionado(null)}>
            <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-accent,#d86b3f)]/40 rounded-2xl p-4 max-w-[340px] w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-[var(--libido-accent,#d86b3f)] mb-0.5">{perfilParsed.nickname || perfilParsed.name || 'Perfil'}</h3>
              <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] uppercase mb-2.5">{perfilParsed.isCasal ? 'Casal' : (perfilParsed.relationship_status || 'Membro')} • {perfilParsed.orientacao || 'Liberal'}</p>
              
              <div className="bg-black/30 p-3 rounded-xl mb-4 border border-[var(--libido-border,rgba(255,255,255,0.05))]">
                <p className="text-xs text-[var(--libido-text,#f5f5f7)] leading-relaxed">
                  {perfilParsed.bioText || 'Este membro ainda não adicionou uma descrição.'}
                </p>
              </div>

              <button type="button" onClick={() => setPerfilSelecionado(null)} className="w-full py-2.5 bg-[var(--libido-accent,#d86b3f)] text-black font-bold text-[10px] uppercase rounded-xl tracking-wider">Fechar</button>
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

    if (txt === 'busca' || txt === 'alertas' || txt === 'notificações' || (dentroDeNav && temIconeLupa)) {
      setTimeout(abrirBusca, 15);
      return;
    }
    if (dentroDeNav && (txt === 'radar' || txt === 'feed' || txt === 'chat' || txt === 'perfil' || txt === 'menu' || txt === 'eventos')) {
      fecharBusca();
    }
  }, true);
}
export default SearchScreen;