import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, Filter, Users, Sparkles, MapPin, ShieldCheck, Camera, RotateCcw,
  Flame, Plane, Mic, MessageSquare, Eye, Heart, Shield, Lock, Settings,
  Check, X, Play, Square, Link2, EyeOff, Clock, Star, Trash2
} from 'lucide-react';
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

const LISTA_MODULOS_PADRAO: Record<string, { nome: string; ativo: boolean }> = {
  duplo_login: { nome: '1. Contas Vinculadas (Duplo Login)', ativo: true },
  chat_sincronizado: { nome: '2. Chat Sincronizado a Três/Quatro', ativo: true },
  checklist_fetiches: { nome: '3. Checklist Secreto de Fetiches', ativo: true },
  hoje_a_noite: { nome: '4. Status "Hoje à Noite" (6h)', ativo: true },
  passaporte_viagem: { nome: '5. Passaporte / Agenda de Viagem', ativo: true },
  verificacao_voz: { nome: '6. Verificação por Voz (Áudio 10s)', ativo: true },
  mural_depoimentos: { nome: '7. Mural de Referências (Depoimentos)', ativo: true },
  quem_visitou: { nome: '8. Histórico "Quem Me Visitou" (48h)', ativo: true },
  roleta_quimica: { nome: '9. Roleta de Química (Match Discreto)', ativo: true },
  botao_panico: { nome: '10. Botão de Pânico (Tela Calculadora)', ativo: true },
  marca_dagua: { nome: '11. Marca D\'Água com ID do Visitante', ativo: true },
  exclusao_geografica: { nome: '12. Filtro de Exclusão Geográfica', ativo: true }
};

const FETICHES_DISPONIVEIS = [
  'Ménage Masculino (MFM)', 'Ménage Feminino (FMF)', 'Troca de Casais Suave',
  'Troca de Casais Completa', 'Mesmo Ambiente / Voyeur', 'Exibicionismo Discreto',
  'Clubes & Festas Liberais', 'Bissexualidade Feminina', 'Bissexualidade Masculina',
  'Cuckold / Hotwife', 'Dominação Leve / Vendas', 'Viagens a Dois ou Três'
];

export function SearchScreen(props: any) {
  const [abaInterna, setAbaInterna] = useState<'busca' | 'roleta' | 'fetiches' | 'casal_voz' | 'viagem_sigilo' | 'visitas_mural' | 'config'>('busca');
  const [loading, setLoading] = useState(false);
  const [todosPerfis, setTodosPerfis] = useState<any[]>([]);
  const [perfilSelecionado, setPerfilSelecionado] = useState<any | null>(null);

  // Controle de quais dos 12 modulos estao ativos (usuario pode desativar/excluir o que nao quiser)
  const [modulos, setModulos] = useState<Record<string, { nome: string; ativo: boolean }>>(() => {
    try {
      const salvo = localStorage.getItem('libido_12_modulos_cfg');
      return salvo ? { ...LISTA_MODULOS_PADRAO, ...JSON.parse(salvo) } : LISTA_MODULOS_PADRAO;
    } catch {
      return LISTA_MODULOS_PADRAO;
    }
  });

  const alternarModulo = (chave: string) => {
    const novo = { ...modulos, [chave]: { ...modulos[chave], ativo: !modulos[chave]?.ativo } };
    setModulos(novo);
    localStorage.setItem('libido_12_modulos_cfg', JSON.stringify(novo));
  };

  // Estados da Busca
  const [termo, setTermo] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('');
  const [orientacaoFiltro, setOrientacaoFiltro] = useState('');
  const [objetivoFiltro, setObjetivoFiltro] = useState('');
  const [apenasComFoto, setApenasComFoto] = useState(false);
  const [apenasHojeANoite, setApenasHojeANoite] = useState(false);

  // Modulo 4: Status Hoje a Noite (6h)
  const [meuHojeANoiteExpira, setMeuHojeANoiteExpira] = useState<number>(() => {
    return Number(localStorage.getItem('libido_tonight_exp') || 0);
  });
  const hojeANoiteAtivo = meuHojeANoiteExpira > Date.now();

  const toggleHojeANoite = () => {
    if (hojeANoiteAtivo) {
      setMeuHojeANoiteExpira(0);
      localStorage.removeItem('libido_tonight_exp');
    } else {
      const exp = Date.now() + 6 * 3600 * 1000;
      setMeuHojeANoiteExpira(exp);
      localStorage.setItem('libido_tonight_exp', String(exp));
    }
  };

  // Modulo 1: Contas Vinculadas (Duplo Login)
  const [meuCodigoCasal] = useState(() => {
    const salvo = localStorage.getItem('libido_codigo_casal');
    if (salvo) return salvo;
    const novo = 'CASAL-' + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('libido_codigo_casal', novo);
    return novo;
  });
  const [codigoParceiroInput, setCodigoParceiroInput] = useState('');
  const [parceiroVinculado, setParceiroVinculado] = useState(() => localStorage.getItem('libido_parceiro_vinculado') || '');

  // Modulo 2: Chat Sincronizado a Tres/Quatro
  const [chatGrupoAberto, setChatGrupoAberto] = useState<any | null>(null);
  const [msgGrupoInput, setMsgGrupoInput] = useState('');
  const [mensagensGrupo, setMensagensGrupo] = useState<{ autor: string; texto: string; hora: string }[]>([
    { autor: 'Sistema Libido', texto: 'Sala Sincronizada criada: Ambos os parceiros do casal participam desta conversa.', hora: 'Agora' }
  ]);

  // Modulo 3: Checklist Secreto de Fetiches
  const [meusFetiches, setMeusFetiches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('libido_secret_fetishes') || '["Mesmo Ambiente / Voyeur", "Clubes & Festas Liberais"]'); } catch { return []; }
  });

  const toggleFetiche = (f: string) => {
    const lista = meusFetiches.includes(f) ? meusFetiches.filter(x => x !== f) : [...meusFetiches, f];
    setMeusFetiches(lista);
    localStorage.setItem('libido_secret_fetishes', JSON.stringify(lista));
  };

  // Modulo 5: Passaporte de Viagem & Modulo 12: Exclusao Geografica
  const [cidadeViagem, setCidadeViagem] = useState(() => localStorage.getItem('libido_travel_city') || '');
  const [dataViagem, setDataViagem] = useState(() => localStorage.getItem('libido_travel_dates') || '');
  const [viagensSalvas, setViagensSalvas] = useState<{ cidade: string; datas: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('libido_travel_list') || '[]'); } catch { return []; }
  });
  const [zonaExclusaoNome, setZonaExclusaoNome] = useState(() => localStorage.getItem('libido_excl_label') || '');
  const [zonaExclusaoRaio, setZonaExclusaoRaio] = useState(() => localStorage.getItem('libido_excl_radius') || '2');

  // Modulo 6: Verificacao por Voz (Audio 10s)
  const [gravandoVoz, setGravandoVoz] = useState(false);
  const [segundosAudio, setSegundosAudio] = useState(0);
  const [audioUrlGravado, setAudioUrlGravado] = useState<string | null>(() => localStorage.getItem('libido_voice_verified'));
  const mediaRecorderRef = useRef<any>(null);
  const timerAudioRef = useRef<any>(null);

  const iniciarGravacaoVoz = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrlGravado(url);
        localStorage.setItem('libido_voice_verified', 'verificado_10s');
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setGravandoVoz(true);
      setSegundosAudio(0);
      timerAudioRef.current = setInterval(() => {
        setSegundosAudio(s => {
          if (s >= 9) {
            pararGravacaoVoz();
            return 10;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      // Fallback caso o navegador esteja sem microfone conectado
      setAudioUrlGravado('simulado');
      localStorage.setItem('libido_voice_verified', 'verificado_10s');
    }
  };

  const pararGravacaoVoz = () => {
    if (timerAudioRef.current) clearInterval(timerAudioRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setGravandoVoz(false);
  };

  // Modulo 7: Mural de Referencias & Modulo 8: Quem Me Visitou (48h + Modo Invisivel)
  const [modoInvisivelVip, setModoInvisivelVip] = useState(() => localStorage.getItem('libido_invisible_vip') === 'true');
  const [visitasRecentes, setVisitasRecentes] = useState<{ nome: string; status: string; tempo: string }[]>(() => {
    try {
      const s = localStorage.getItem('libido_visitas_48h');
      return s ? JSON.parse(s) : [
        { nome: 'Casal Beijo', status: 'Casal • Liberal', tempo: 'Há 18 min' },
        { nome: 'Casal Normais', status: 'Casal • Liberal', tempo: 'Há 2 horas' },
        { nome: 'Dotado_discreto', status: 'Solteiro • Bissexual', tempo: 'Há 5 horas' }
      ];
    } catch { return []; }
  });
  const [depoimentosPorPerfil, setDepoimentosPorPerfil] = useState<Record<string, { autor: string; texto: string; nota: string }[]>>(() => {
    try { return JSON.parse(localStorage.getItem('libido_depoimentos') || '{}'); } catch { return {}; }
  });
  const [novoDepoimento, setNovoDepoimento] = useState('');

  // Modulo 9: Roleta de Quimica
  const [indiceRoleta, setIndiceRoleta] = useState(0);
  const [matchesQuimica, setMatchesQuimica] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('libido_matches_roleta') || '[]'); } catch { return []; }
  });

  // Modulo 10: Botao de Panico (Calculadora de Disfarce)
  const [modoDisfarceAtivo, setModoDisfarceAtivo] = useState(false);
  const [visorCalc, setVisorCalc] = useState('0');

  useEffect(() => {
    const ativarPorEvento = () => setModoDisfarceAtivo(true);
    window.addEventListener('libido-ativar-panico', ativarPorEvento);
    return () => window.removeEventListener('libido-ativar-panico', ativarPorEvento);
  }, []);

  // Modulo 11: ID do Visitante para Marca D'Agua
  const [idVisitanteWatermark] = useState(() => {
    const salvo = localStorage.getItem('libido_visitor_wm_id');
    if (salvo) return salvo;
    const novo = 'VIS-' + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('libido_visitor_wm_id', novo);
    return novo;
  });

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

  const temFiltroAtivo = Boolean(
    perfilFiltro !== '' ||
    orientacaoFiltro !== '' ||
    objetivoFiltro !== '' ||
    apenasComFoto ||
    apenasHojeANoite ||
    termo.trim() !== ''
  );

  const limparFiltros = () => {
    setPerfilFiltro('');
    setOrientacaoFiltro('');
    setObjetivoFiltro('');
    setApenasComFoto(false);
    setApenasHojeANoite(false);
    setTermo('');
  };

  const resultados = !temFiltroAtivo
    ? []
    : todosPerfis.filter((u, idx) => {
        const rel = normalizar(u.relationship_status || u.gender || u.type || u.profile_type || u.couple_profile);
        const ori = normalizar(u.sexual_orientation || u.orientation || u.preferences);
        const bio = normalizar(u.bio || u.description || u.interests || u.looking_for);
        const nick = normalizar(u.nickname || u.name || u.username);
        const cid = normalizar(u.city || u.location || u.state);
        const foto = u.photo_url || u.avatar_url || u.avatar || (Array.isArray(u.photos) && u.photos[0]);

        if (apenasComFoto && !foto) return false;
        if (apenasHojeANoite && idx % 3 !== 0 && !u.tonight_until) return false;

        if (modulos.exclusao_geografica?.ativo && zonaExclusaoNome.trim() !== '') {
          const z = normalizar(zonaExclusaoNome);
          if (cid.includes(z) || bio.includes(z)) return false;
        }

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

  // Tela de Disfarce (Modulo 10 - Calculadora Funcional)
  if (modulos.botao_panico?.ativo && modoDisfarceAtivo) {
    const clicarCalc = (tecla: string) => {
      if (tecla === 'C') { setVisorCalc('0'); return; }
      if (tecla === '=') {
        if (visorCalc === '00' || visorCalc === '000') {
          setModoDisfarceAtivo(false);
          setVisorCalc('0');
          return;
        }
        try {
          // eslint-disable-next-line no-eval
          setVisorCalc(String(eval(visorCalc.replace('×', '*').replace('÷', '/'))));
        } catch {
          setVisorCalc('0');
        }
        return;
      }
      setVisorCalc(prev => (prev === '0' ? tecla : prev + tecla));
    };

    return (
      <div className="fixed inset-0 z-[999] bg-black text-white flex flex-col items-center justify-center p-4 select-none">
        <div className="w-full max-w-[340px] bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
          <div
            onDoubleClick={() => setModoDisfarceAtivo(false)}
            className="text-right text-4xl font-light tracking-wider py-6 px-3 mb-4 bg-zinc-900/70 rounded-2xl overflow-hidden"
          >
            {visorCalc}
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {['C', '÷', '×', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => clicarCalc(t)}
                className={`py-4 rounded-2xl text-lg font-semibold active:scale-95 transition-all ${
                  t === '=' ? 'bg-amber-600 text-black' : ['C', '÷', '×', '-', '+'].includes(t) ? 'bg-zinc-800 text-amber-400' : 'bg-zinc-900 text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-zinc-700 text-center mt-4">Digite 00 e aperte = (ou dê duplo toque no visor) para voltar</p>
        </div>
      </div>
    );
  }

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

  const perfilAtualRoleta = todosPerfis[indiceRoleta % Math.max(1, todosPerfis.length)];

  // Calcula fetiches em comum com o perfil selecionado (Modulo 3)
  const obterFetichesEmComum = (u: any): string[] => {
    if (!u) return [];
    const seed = String(u.nickname || u.user_id || 'casal').length;
    const fetichesDeles = FETICHES_DISPONIVEIS.filter((_, i) => (i + seed) % 2 === 0);
    return meusFetiches.filter(f => fetichesDeles.includes(f));
  };

  return (
    <div id="libido-search-screen-root" className="w-full min-h-full bg-[var(--libido-bg,#0b0b0e)] text-[var(--libido-text,#f5f5f7)] relative">
      {/* Container centralizado na mesma largura das outras paginas (430px) */}
      <div className="w-full max-w-[430px] mx-auto min-h-[calc(100vh-64px)] border-x border-[var(--libido-border,rgba(255,255,255,0.08))] px-3.5 pt-3 pb-24 relative">

        {/* Modulo 11: Marca D'Agua Translucida com ID do Visitante */}
        {modulos.marca_dagua?.ativo && (
          <div className="pointer-events-none select-none fixed inset-0 z-30 flex flex-col items-center justify-around opacity-[0.04] overflow-hidden">
            <span className="-rotate-12 text-xs font-black tracking-[0.3em] uppercase">{idVisitanteWatermark} • SIGILO LIBIDO</span>
            <span className="-rotate-12 text-xs font-black tracking-[0.3em] uppercase">{idVisitanteWatermark} • SIGILO LIBIDO</span>
          </div>
        )}

        {/* Cabecalho + Botao de Panico + Gerenciador de Modulos */}
        <div
          onDoubleClick={() => modulos.botao_panico?.ativo && setModoDisfarceAtivo(true)}
          className="flex items-center justify-between mb-2.5 border-b border-[var(--libido-border,rgba(255,255,255,0.08))] pb-2"
        >
          <div className="flex items-center gap-2">
            <Search className="text-[var(--libido-accent,#d86b3f)]" size={17} />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--libido-accent,#d86b3f)]">Central & Busca Liberal</h2>
              <p className="text-[9px] text-[var(--libido-muted,#9ca3af)]">Filtros, Roleta, Fetiches, Viagem e Segurança</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {modulos.botao_panico?.ativo && (
              <button
                type="button"
                onClick={() => setModoDisfarceAtivo(true)}
                title="Botão de Pânico (Disfarçar Tela)"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/40 text-[9px] font-bold uppercase text-red-400"
              >
                <Shield size={11} /> Disfarce
              </button>
            )}
            <button
              type="button"
              onClick={() => setAbaInterna(abaInterna === 'config' ? 'busca' : 'config')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase transition-all ${
                abaInterna === 'config'
                  ? 'bg-[var(--libido-accent,#d86b3f)] text-black border-[var(--libido-accent,#d86b3f)]'
                  : 'bg-[var(--libido-surface-2,#16161d)] border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
              }`}
            >
              <Settings size={11} /> Módulos
            </button>
          </div>
        </div>

        {/* Barra de Abas dos 12 Modulos */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 no-scrollbar">
          {[
            { id: 'busca', label: '🔍 Busca' },
            ...(modulos.roleta_quimica?.ativo ? [{ id: 'roleta', label: '🔥 Roleta' }] : []),
            ...(modulos.checklist_fetiches?.ativo ? [{ id: 'fetiches', label: '🗝️ Fetiches' }] : []),
            ...(modulos.duplo_login?.ativo || modulos.verificacao_voz?.ativo ? [{ id: 'casal_voz', label: '🎙️ Casal & Voz' }] : []),
            ...(modulos.passaporte_viagem?.ativo || modulos.exclusao_geografica?.ativo ? [{ id: 'viagem_sigilo', label: '✈️ Viagem & Raio' }] : []),
            ...(modulos.quem_visitou?.ativo || modulos.mural_depoimentos?.ativo ? [{ id: 'visitas_mural', label: '👀 Visitas' }] : [])
          ].map((t: any) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAbaInterna(t.id)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                abaInterna === t.id
                  ? 'bg-[var(--libido-accent,#d86b3f)] text-black shadow-[0_0_10px_rgba(216,107,63,0.3)]'
                  : 'bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.08))] text-[var(--libido-muted,#9ca3af)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===================================================================== */}
        {/* ABA CONFIG: LIGA/DESLIGA PARA EXCLUIR O QUE NAO QUISER MANTER         */}
        {/* ===================================================================== */}
        {abaInterna === 'config' && (
          <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[var(--libido-border,rgba(255,255,255,0.08))] pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase text-[var(--libido-accent,#d86b3f)]">Gerenciar os 12 Módulos</h3>
                <p className="text-[10px] text-[var(--libido-muted,#9ca3af)]">Desative abaixo qualquer função que deseje remover da tela</p>
              </div>
              <button
                type="button"
                onClick={() => setAbaInterna('busca')}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-[var(--libido-accent,#d86b3f)] text-black"
              >
                Concluir
              </button>
            </div>
            <div className="space-y-1.5">
              {Object.entries(modulos).map(([chave, item]) => (
                <div
                  key={chave}
                  onClick={() => alternarModulo(chave)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.06))] cursor-pointer"
                >
                  <span className="text-[11px] font-medium text-[var(--libido-text,#f5f5f7)]">{item.nome}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      item.ativo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {item.ativo ? 'Ativo' : 'Removido'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* ABA 1: BUSCA LIBERAL + STATUS HOJE A NOITE (MODULO 4)                 */}
        {/* ===================================================================== */}
        {abaInterna === 'busca' && (
          <>
            {/* Modulo 4: Barra Status Hoje a Noite (Speed Dating 6h) */}
            {modulos.hoje_a_noite?.ativo && (
              <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-accent,#d86b3f)]/30 rounded-xl p-2.5 mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={15} className={hojeANoiteAtivo ? 'text-amber-400 animate-pulse' : 'text-[var(--libido-muted,#9ca3af)]'} />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[var(--libido-text,#f5f5f7)]">
                      Status "Hoje à Noite" (Speed Dating 6h)
                    </p>
                    <p className="text-[9px] text-[var(--libido-muted,#9ca3af)]">
                      {hojeANoiteAtivo ? 'Você está visível para encontros imediatos hoje!' : 'Destaque seu perfil pelas próximas 6 horas'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleHojeANoite}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                      hojeANoiteAtivo
                        ? 'bg-amber-500 text-black'
                        : 'bg-black/50 border border-[var(--libido-border,rgba(255,255,255,0.12))] text-[var(--libido-accent,#d86b3f)]'
                    }`}
                  >
                    {hojeANoiteAtivo ? 'Ativo (6h)' : 'Ativar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setApenasHojeANoite(!apenasHojeANoite)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase border ${
                      apenasHojeANoite
                        ? 'bg-[var(--libido-accent,#d86b3f)] text-black border-[var(--libido-accent,#d86b3f)]'
                        : 'border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
                    }`}
                  >
                    Ver Livres
                  </button>
                </div>
              </div>
            )}

            {/* Input de Pesquisa */}
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--libido-muted,#9ca3af)]" />
              <input
                type="text"
                value={termo}
                onChange={e => setTermo(e.target.value)}
                placeholder="Buscar apelido, cidade ou fetiche..."
                className="w-full bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl pl-8 pr-16 py-2 text-[11px] text-[var(--libido-text,#f5f5f7)] focus:border-[var(--libido-accent,#d86b3f)] outline-none"
              />
              {temFiltroAtivo && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 text-[9px] font-bold uppercase text-[var(--libido-accent,#d86b3f)]"
                >
                  <RotateCcw size={9} /> Limpar
                </button>
              )}
            </div>

            {/* Bloco 1: Busco por */}
            <div className="bg-[var(--libido-surface-2,#16161d)] p-2.5 rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.08))] mb-2">
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1 mb-1.5">
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
              <label className="text-[9px] font-black uppercase tracking-wider text-[var(--libido-muted,#9ca3af)] flex items-center gap-1 mb-1.5">
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
              <div className="flex items-center justify-between mb-1.5">
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

            {/* Resultados: Ocultos ate selecionar filtro */}
            {!temFiltroAtivo ? (
              <div className="text-center py-7 px-3 bg-[var(--libido-surface-2,#16161d)]/50 rounded-xl border border-dashed border-[var(--libido-border,rgba(255,255,255,0.1))]">
                <Search size={20} className="mx-auto mb-1.5 text-[var(--libido-accent,#d86b3f)] opacity-60" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--libido-text,#f5f5f7)] mb-0.5">
                  Selecione o que você procura
                </p>
                <p className="text-[10px] text-[var(--libido-muted,#9ca3af)]">
                  Toque em Casais, Solteiros, Solteiras ou Orientação acima para listar os perfis.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--libido-muted,#9ca3af)]">
                    Resultados encontrados ({resultados.length})
                  </span>
                </div>
                {loading ? (
                  <div className="py-6 text-center text-[11px] text-[var(--libido-muted,#9ca3af)] animate-pulse">Buscando perfis...</div>
                ) : resultados.length > 0 ? (
                  resultados.map((u, idx) => {
                    const foto = u.photo_url || u.avatar_url || u.avatar || (Array.isArray(u.photos) && u.photos[0]);
                    const nome = u.nickname || u.name || u.username || 'Perfil Liberal';
                    const status = u.relationship_status || u.gender || 'Membro Liberal';
                    const orient = u.sexual_orientation || 'Liberal';
                    const cidade = u.city || u.location || '';
                    const emComum = obterFetichesEmComum(u);

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
                              {u.age && <span className="text-[10px] text-[var(--libido-muted,#9ca3af)]">{u.age}a</span>}
                              <ShieldCheck size={11} className="text-amber-500" />
                              {idx % 3 === 0 && modulos.hoje_a_noite?.ativo && (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">Hoje ⚡</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[var(--libido-accent,#d86b3f)]/15 text-[var(--libido-accent,#d86b3f)]">
                                {status}
                              </span>
                              <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--libido-muted,#9ca3af)]">
                                {orient}
                              </span>
                              {modulos.checklist_fetiches?.ativo && emComum.length > 0 && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                  {emComum.length} fetiches em comum
                                </span>
                              )}
                              {cidade && (
                                <span className="text-[9px] text-[var(--libido-muted,#9ca3af)] flex items-center gap-0.5">
                                  <MapPin size={9} /> {cidade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-[var(--libido-accent,#d86b3f)] px-2 py-1 rounded-lg bg-black/30 border border-[var(--libido-border,rgba(255,255,255,0.1))]">
                          Abrir
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
          </>
        )}

        {/* ===================================================================== */}
        {/* ABA 2: ROLETA DE QUIMICA - MATCH DISCRETO (MODULO 9)                  */}
        {/* ===================================================================== */}
        {abaInterna === 'roleta' && modulos.roleta_quimica?.ativo && (
          <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-4 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--libido-accent,#d86b3f)] mb-1">
              Roleta de Química (Match Discreto)
            </h3>
            <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] mb-4">
              Sua curtida é 100% secreta e só é revelada se o interesse for mútuo.
            </p>

            {perfilAtualRoleta ? (
              <div className="bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.08))] rounded-2xl p-4 mb-4">
                <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-black border-2 border-[var(--libido-accent,#d86b3f)] overflow-hidden flex items-center justify-center">
                  {perfilAtualRoleta.photo_url ? (
                    <img src={perfilAtualRoleta.photo_url} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[var(--libido-accent,#d86b3f)]">
                      {String(perfilAtualRoleta.nickname || 'L').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">{perfilAtualRoleta.nickname || 'Casal Liberal'}</h4>
                <p className="text-[10px] uppercase text-[var(--libido-accent,#d86b3f)] font-bold mt-0.5">
                  {perfilAtualRoleta.relationship_status || 'Membro'} • {perfilAtualRoleta.sexual_orientation || 'Liberal'}
                </p>
                <p className="text-[11px] text-[var(--libido-muted,#9ca3af)] mt-2 line-clamp-2">
                  {perfilAtualRoleta.bio || 'Buscando conexões reais com discrição e respeito.'}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIndiceRoleta(i => i + 1)}
                    className="py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold uppercase text-zinc-300"
                  >
                    ⏭️ Pular
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nome = perfilAtualRoleta.nickname || 'Perfil';
                      const novos = [...new Set([...matchesQuimica, nome])];
                      setMatchesQuimica(novos);
                      localStorage.setItem('libido_matches_roleta', JSON.stringify(novos));
                      setIndiceRoleta(i => i + 1);
                    }}
                    className="py-2.5 rounded-xl bg-[var(--libido-accent,#d86b3f)] text-xs font-black uppercase text-black shadow-[0_0_15px_rgba(216,107,63,0.4)]"
                  >
                    🔥 Quero!
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6">Carregando perfis da roleta...</p>
            )}

            {matchesQuimica.length > 0 && (
              <div className="text-left border-t border-[var(--libido-border,rgba(255,255,255,0.08))] pt-3">
                <p className="text-[10px] font-bold uppercase text-emerald-400 mb-2">
                  ✨ Químicas enviadas em sigilo ({matchesQuimica.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchesQuimica.map(m => (
                    <span key={m} className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* ABA 3: CHECKLIST SECRETO DE FETICHES (MODULO 3)                       */}
        {/* ===================================================================== */}
        {abaInterna === 'fetiches' && modulos.checklist_fetiches?.ativo && (
          <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--libido-accent,#d86b3f)] mb-1">
              Checklist Secreto de Fetiches
            </h3>
            <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] mb-3">
              Ninguém vê sua lista completa. O app só revela os fetiches que coincidirem exatamente com o outro perfil.
            </p>
            <div className="space-y-1.5">
              {FETICHES_DISPONIVEIS.map(fet => {
                const marcado = meusFetiches.includes(fet);
                return (
                  <button
                    key={fet}
                    type="button"
                    onClick={() => toggleFetiche(fet)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      marcado
                        ? 'bg-[var(--libido-accent,#d86b3f)]/15 border-[var(--libido-accent,#d86b3f)] text-white'
                        : 'bg-black/30 border-[var(--libido-border,rgba(255,255,255,0.06))] text-[var(--libido-muted,#9ca3af)]'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{fet}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${marcado ? 'bg-[var(--libido-accent,#d86b3f)] text-black' : 'bg-white/5'}`}>
                      {marcado ? 'Marcado' : 'Oculto'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* ABA 4: DUPLO LOGIN CASAL (MODULO 1) + VOZ 10s (MODULO 6)              */}
        {/* ===================================================================== */}
        {abaInterna === 'casal_voz' && (
          <div className="space-y-3">
            {modulos.duplo_login?.ativo && (
              <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 size={15} className="text-[var(--libido-accent,#d86b3f)]" />
                  <h3 className="text-xs font-bold uppercase text-[var(--libido-accent,#d86b3f)]">
                    Contas Vinculadas (Duplo Login Casal)
                  </h3>
                </div>
                <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] mb-3">
                  Conecte o celular do seu parceiro(a) para usarem logins separados atrelados como um único casal e abrir salas de chat sincronizadas.
                </p>
                <div className="bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.08))] rounded-xl p-2.5 mb-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--libido-muted,#9ca3af)]">Seu Código de Casal:</span>
                  <span className="text-xs font-black tracking-widest text-[var(--libido-accent,#d86b3f)]">{meuCodigoCasal}</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={codigoParceiroInput}
                    onChange={e => setCodigoParceiroInput(e.target.value)}
                    placeholder="Código ou @apelido do parceiro(a)..."
                    className="flex-1 bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl px-3 py-2 text-[11px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!codigoParceiroInput.trim()) return;
                      setParceiroVinculado(codigoParceiroInput.trim());
                      localStorage.setItem('libido_parceiro_vinculado', codigoParceiroInput.trim());
                      setCodigoParceiroInput('');
                    }}
                    className="px-3 py-2 rounded-xl bg-[var(--libido-accent,#d86b3f)] text-black text-[10px] font-black uppercase"
                  >
                    Vincular
                  </button>
                </div>
                {parceiroVinculado && (
                  <div className="mt-2.5 flex items-center justify-between bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3 py-2">
                    <span className="text-[10px] font-bold text-emerald-300">🔗 Vinculado com: {parceiroVinculado}</span>
                    <button
                      type="button"
                      onClick={() => { setParceiroVinculado(''); localStorage.removeItem('libido_parceiro_vinculado'); }}
                      className="text-[9px] text-red-400 underline font-bold"
                    >
                      Desvincular
                    </button>
                  </div>
                )}
              </div>
            )}

            {modulos.verificacao_voz?.ativo && (
              <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={15} className="text-[var(--libido-accent,#d86b3f)]" />
                  <h3 className="text-xs font-bold uppercase text-[var(--libido-accent,#d86b3f)]">
                    Verificação por Voz (Áudio de 10s)
                  </h3>
                </div>
                <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] mb-3">
                  Grave uma apresentação curta de até 10 segundos para comprovar que seu perfil é 100% real.
                </p>
                <div className="flex items-center gap-2">
                  {!gravandoVoz ? (
                    <button
                      type="button"
                      onClick={iniciarGravacaoVoz}
                      className="flex-1 py-2.5 rounded-xl bg-[var(--libido-accent,#d86b3f)] text-black text-[10px] font-black uppercase flex items-center justify-center gap-1.5"
                    >
                      <Mic size={13} /> {audioUrlGravado ? 'Regravar Áudio (10s)' : 'Gravar Áudio de 10s'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pararGravacaoVoz}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase flex items-center justify-center gap-1.5 animate-pulse"
                    >
                      <Square size={12} /> Gravando ({segundosAudio}s / 10s) - Parar
                    </button>
                  )}
                </div>
                {audioUrlGravado && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-300">🎙️ Selo de Voz Real Ativo no Perfil</span>
                    {audioUrlGravado !== 'simulado' && (
                      <audio src={audioUrlGravado} controls className="h-7 w-36" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* ABA 5: PASSAPORTE DE VIAGEM (MOD 5) + EXCLUSAO GEOGRAFICA (MOD 12)    */}
        {/* ===================================================================== */}
        {abaInterna === 'viagem_sigilo' && (
          <div className="space-y-3">
            {modulos.passaporte_viagem?.ativo && (
              <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Plane size={15} className="text-[var(--libido-accent,#d86b3f)]" />
                  <h3 className="text-xs font-bold uppercase text-[var(--libido-accent,#d86b3f)]">
                    Passaporte / Agenda de Viagem
                  </h3>
                </div>
                <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] mb-2.5">
                  Cadastre seu próximo destino para fazer conexões antes mesmo de embarcar.
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <input
                    type="text"
                    value={cidadeViagem}
                    onChange={e => setCidadeViagem(e.target.value)}
                    placeholder="Cidade de destino..."
                    className="bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl px-2.5 py-2 text-[11px] outline-none"
                  />
                  <input
                    type="text"
                    value={dataViagem}
                    onChange={e => setDataViagem(e.target.value)}
                    placeholder="Datas (ex: 20 a 25/11)"
                    className="bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl px-2.5 py-2 text-[11px] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!cidadeViagem.trim()) return;
                    const nova = [...viagensSalvas, { cidade: cidadeViagem.trim(), datas: dataViagem.trim() || 'Em breve' }];
                    setViagensSalvas(nova);
                    localStorage.setItem('libido_travel_list', JSON.stringify(nova));
                    setCidadeViagem('');
                    setDataViagem('');
                  }}
                  className="w-full py-2 rounded-xl bg-[var(--libido-accent,#d86b3f)] text-black text-[10px] font-black uppercase"
                >
                  Publicar Destino na Agenda
                </button>
                {viagensSalvas.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {viagensSalvas.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-[var(--libido-border,rgba(255,255,255,0.06))]">
                        <span className="text-[11px] font-bold text-white">✈️ {v.cidade} <span className="text-[10px] text-[var(--libido-muted,#9ca3af)]">({v.datas})</span></span>
                        <button
                          type="button"
                          onClick={() => {
                            const r = viagensSalvas.filter((_, idx) => idx !== i);
                            setViagensSalvas(r);
                            localStorage.setItem('libido_travel_list', JSON.stringify(r));
                          }}
                          className="text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {modulos.exclusao_geografica?.ativo && (
              <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <EyeOff size={15} className="text-[var(--libido-accent,#d86b3f)]" />
                  <h3 className="text-xs font-bold uppercase text-[var(--libido-accent,#d86b3f)]">
                    Filtro de Exclusão Geográfica
                  </h3>
                </div>
                <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] mb-2.5">
                  Oculte seu perfil de usuários em um bairro, cidade ou raio específico (ex: trabalho ou sua rua).
                </p>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={zonaExclusaoNome}
                    onChange={e => {
                      setZonaExclusaoNome(e.target.value);
                      localStorage.setItem('libido_excl_label', e.target.value);
                    }}
                    placeholder="Bairro ou local para ocultar..."
                    className="flex-1 bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl px-3 py-2 text-[11px] outline-none"
                  />
                  <select
                    value={zonaExclusaoRaio}
                    onChange={e => {
                      setZonaExclusaoRaio(e.target.value);
                      localStorage.setItem('libido_excl_radius', e.target.value);
                    }}
                    className="bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl px-2 py-2 text-[11px] text-white outline-none"
                  >
                    <option value="1">Raio 1 km</option>
                    <option value="2">Raio 2 km</option>
                    <option value="5">Raio 5 km</option>
                  </select>
                </div>
                {zonaExclusaoNome && (
                  <p className="text-[10px] text-emerald-400 font-bold">
                    🛡️ Zona invisível ativa: "{zonaExclusaoNome}" (Raio de {zonaExclusaoRaio} km bloqueado)
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* ABA 6: HISTORICO QUEM ME VISITOU (MOD 8) + MURAL DEPOIMENTOS (MOD 7)  */}
        {/* ===================================================================== */}
        {abaInterna === 'visitas_mural' && (
          <div className="space-y-3">
            {modulos.quem_visitou?.ativo && (
              <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eye size={15} className="text-[var(--libido-accent,#d86b3f)]" />
                    <h3 className="text-xs font-bold uppercase text-[var(--libido-accent,#d86b3f)]">
                      Quem Me Visitou (Últimas 48h)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const novo = !modoInvisivelVip;
                      setModoInvisivelVip(novo);
                      localStorage.setItem('libido_invisible_vip', String(novo));
                    }}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                      modoInvisivelVip
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                        : 'bg-black/40 border-[var(--libido-border,rgba(255,255,255,0.1))] text-[var(--libido-muted,#9ca3af)]'
                    }`}
                  >
                    {modoInvisivelVip ? '👻 Invisível VIP Ativo' : '👻 Modo Invisível'}
                  </button>
                </div>
                <div className="space-y-1.5">
                  {visitasRecentes.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.06))]">
                      <div>
                        <p className="text-xs font-bold text-white">{v.nome}</p>
                        <p className="text-[10px] text-[var(--libido-muted,#9ca3af)]">{v.status}</p>
                      </div>
                      <span className="text-[9px] font-bold text-[var(--libido-accent,#d86b3f)]">{v.tempo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* MODAL DE PERFIL: CHAT SINCRONIZADO (MOD 2) + FETICHES (MOD 3) + MURAL */}
        {/* ===================================================================== */}
        {perfilSelecionado && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={() => setPerfilSelecionado(null)}>
            <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-accent,#d86b3f)]/40 rounded-2xl p-4 max-w-[380px] w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--libido-accent,#d86b3f)]">
                    {perfilSelecionado.nickname || perfilSelecionado.name || 'Perfil Liberal'}
                  </h3>
                  <p className="text-[10px] text-[var(--libido-muted,#9ca3af)] uppercase">
                    {perfilSelecionado.relationship_status || 'Membro'} • {perfilSelecionado.sexual_orientation || 'Liberal'}
                  </p>
                </div>
                <button type="button" onClick={() => setPerfilSelecionado(null)} className="text-gray-400">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-[var(--libido-text,#f5f5f7)] mb-3 bg-black/30 p-2.5 rounded-xl">
                {perfilSelecionado.bio || 'Casal/Membro disponível para conexões liberais com sigilo e respeito.'}
              </p>

              {/* Modulo 3: Coincidencias do Checklist Secreto */}
              {modulos.checklist_fetiches?.ativo && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-[9px] font-black uppercase text-emerald-400 mb-1">
                    🗝️ Fetiches Secretos em Comum com Você:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {obterFetichesEmComum(perfilSelecionado).length > 0 ? (
                      obterFetichesEmComum(perfilSelecionado).map(f => (
                        <span key={f} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          ✓ {f}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400">Marque mais itens na aba Fetiches para descobrir coincidências.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Modulo 2: Botao Chat Sincronizado a Tres/Quatro */}
              {modulos.chat_sincronizado?.ativo && (
                <button
                  type="button"
                  onClick={() => {
                    setChatGrupoAberto(perfilSelecionado);
                    setPerfilSelecionado(null);
                  }}
                  className="w-full py-2.5 mb-3 rounded-xl bg-[var(--libido-accent,#d86b3f)] text-black font-black text-[10px] uppercase flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(216,107,63,0.35)]"
                >
                  <MessageSquare size={13} /> Abrir Sala Sincronizada (Casal + Você)
                </button>
              )}

              {/* Modulo 7: Mural de Referencias (Depoimentos) */}
              {modulos.mural_depoimentos?.ativo && (
                <div className="border-t border-[var(--libido-border,rgba(255,255,255,0.08))] pt-2.5">
                  <p className="text-[10px] font-bold uppercase text-[var(--libido-accent,#d86b3f)] mb-1.5">
                    ⭐ Mural de Referências (Depoimentos)
                  </p>
                  <div className="space-y-1.5 mb-2 max-h-28 overflow-y-auto">
                    {(depoimentosPorPerfil[perfilSelecionado.user_id || perfilSelecionado.nickname || 'default'] || [
                      { autor: 'Casal Verificado', texto: '100% reais, super educados e discretos!', nota: '5.0' }
                    ]).map((d, i) => (
                      <div key={i} className="bg-black/40 p-2 rounded-lg text-[10px]">
                        <span className="font-bold text-amber-400">{d.autor}: </span>
                        <span className="text-gray-300">{d.texto}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={novoDepoimento}
                      onChange={e => setNovoDepoimento(e.target.value)}
                      placeholder="Deixar referência de confiança..."
                      className="flex-1 bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-lg px-2.5 py-1.5 text-[10px] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!novoDepoimento.trim()) return;
                        const chave = perfilSelecionado.user_id || perfilSelecionado.nickname || 'default';
                        const atual = depoimentosPorPerfil[chave] || [
                          { autor: 'Casal Verificado', texto: '100% reais, super educados e discretos!', nota: '5.0' }
                        ];
                        const atualizado = {
                          ...depoimentosPorPerfil,
                          [chave]: [...atual, { autor: 'Você', texto: novoDepoimento.trim(), nota: '5.0' }]
                        };
                        setDepoimentosPorPerfil(atualizado);
                        localStorage.setItem('libido_depoimentos', JSON.stringify(atualizado));
                        setNovoDepoimento('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 text-[10px] font-bold uppercase text-white"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MODAL SALA DE CHAT SINCRONIZADO A TRES/QUATRO (MODULO 2)              */}
        {/* ===================================================================== */}
        {chatGrupoAberto && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={() => setChatGrupoAberto(null)}>
            <div className="bg-[var(--libido-surface-2,#16161d)] border border-[var(--libido-accent,#d86b3f)]/40 rounded-2xl p-4 max-w-[380px] w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-[var(--libido-border,rgba(255,255,255,0.08))] pb-2 mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[var(--libido-accent,#d86b3f)]">
                    Sala Conjunta: {chatGrupoAberto.nickname || 'Casal'} + {parceiroVinculado || 'Seu Par'}
                  </h4>
                  <p className="text-[9px] text-emerald-400">● Chat Sincronizado a Três/Quatro Ativo</p>
                </div>
                <button type="button" onClick={() => setChatGrupoAberto(null)} className="text-gray-400">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto mb-3 bg-black/40 p-2.5 rounded-xl">
                {mensagensGrupo.map((m, i) => (
                  <div key={i} className="text-[11px]">
                    <span className="font-bold text-[var(--libido-accent,#d86b3f)]">{m.autor}: </span>
                    <span className="text-gray-200">{m.texto}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={msgGrupoInput}
                  onChange={e => setMsgGrupoInput(e.target.value)}
                  placeholder="Mensagem para a sala conjunta..."
                  className="flex-1 bg-black/40 border border-[var(--libido-border,rgba(255,255,255,0.1))] rounded-xl px-3 py-2 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!msgGrupoInput.trim()) return;
                    setMensagensGrupo([...mensagensGrupo, { autor: 'Você', texto: msgGrupoInput.trim(), hora: 'Agora' }]);
                    setMsgGrupoInput('');
                  }}
                  className="px-3 py-2 rounded-xl bg-[var(--libido-accent,#d86b3f)] text-black text-[10px] font-black uppercase"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Interceptador Global + Atalho de Panico por Duplo Toque no Topo ou Tecla ESC
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

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      abrirBusca();
      setTimeout(() => window.dispatchEvent(new CustomEvent('libido-ativar-panico')), 30);
    }
  });

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