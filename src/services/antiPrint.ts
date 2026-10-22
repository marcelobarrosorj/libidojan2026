// ANTI-PRINT v2 — bloqueio de impressao, escudo de foco e marca rastreavel.
//
// O QUE E BLOQUEIO REAL NA WEB (o navegador respeita):
// 1) @media print + beforeprint -> mata Ctrl+P, "Imprimir" e "Salvar como PDF".
// 2) Escudo em blur/visibilitychange -> cobre a tela quando o app sai de foco.
//    Apaga a miniatura do seletor de apps e corta captura por ferramenta
//    externa que rouba o foco.
// 3) Marca d'agua com ID e horario -> o que escapar fica rastreavel.
// 4) Bloqueio de menu de contexto, arrastar e atalhos -> fecha as vias faceis.
//
// O QUE NAO EXISTE NA WEB:
// - Bloquear Print Screen / Volume+Power. O SO captura os pixels antes do JS.
//   Chrome, Safari, Instagram Web e WhatsApp Web: identico. Nao ha API.
// - Detectar captura de tela pelo navegador. Nao existe evento.
// Bloqueio fisico real: FLAG_SECURE em app nativo, ou video com DRM/EME
// (e por isso o print da Netflix sai preto).

import { supabase } from './supabase';

const ID_ESTILO = 'antiprint-estilo';
const ID_ESCUDO = 'antiprint-escudo';
const ID_MARCA = 'antiprint-marca';

const ABAS_PROTEGIDAS = ['chat', 'mensagens', 'notificacoes', 'notificações', 'fotos', 'perfil'];

const TILE_W = 300;
const TILE_H = 150;

let ligado = false;
let escudo: HTMLDivElement | null = null;
let marca: HTMLDivElement | null = null;
let tituloOriginal = '';
let tituloTrocado = false;
let timerBlur: number | null = null;
let textoMarca = 'CONTEUDO PROTEGIDO';

function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function tileSvg(texto: string): string {
  const cx = Math.round(TILE_W / 2);
  const cy = Math.round(TILE_H / 2);

  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='" + TILE_W + "' height='" + TILE_H + "'>" +
    "<text x='" + cx + "' y='" + (cy + 4) + "'" +
    " font-family='Arial, Helvetica, sans-serif' font-size='12' font-weight='700'" +
    " fill='rgba(255,255,255,0.30)' stroke='rgba(0,0,0,0.30)' stroke-width='1.5'" +
    " paint-order='stroke' text-anchor='middle'" +
    " transform='rotate(-28 " + cx + " " + cy + ")'" +
    " textLength='" + (TILE_W - 28) + "' lengthAdjust='spacingAndGlyphs'>" +
    escaparXml(texto) + "</text></svg>";

  return "url(\"data:image/svg+xml;utf8," + encodeURIComponent(svg) + "\")";
}

function garantirEstilo(): void {
  if (document.getElementById(ID_ESTILO)) return;

  const st = document.createElement('style');
  st.id = ID_ESTILO;
  st.textContent =
    // CAMADA 1: impressao e PDF. Este bloco o navegador OBEDECE.
    '@media print{' +
    '@page{margin:0}' +
    'html,body{display:none !important;visibility:hidden !important}' +
    '}' +
    // CAMADA 2: escudo de foco.
    '#' + ID_ESCUDO + '{position:fixed;inset:0;z-index:2147483600;display:none;' +
    'align-items:center;justify-content:center;background:#08080b;color:#26262f;' +
    'font:700 11px/1.5 system-ui,-apple-system,sans-serif;letter-spacing:0.18em;' +
    'text-transform:uppercase;user-select:none;-webkit-user-select:none;touch-action:none;' +
    '-webkit-touch-callout:none}' +
    // CAMADA 3: marca d'agua.
    '#' + ID_MARCA + '{position:fixed;inset:0;z-index:2147483500;pointer-events:none;' +
    'background-repeat:repeat;opacity:0.9;display:none}' +
    // CAMADA 4: midia protegida.
    'img,video{-webkit-user-drag:none;-webkit-touch-callout:none}' +
    '[data-protegido="1"] img,[data-protegido="1"] video{user-select:none;-webkit-user-select:none}';

  document.head.appendChild(st);
}

function criarEscudo(): HTMLDivElement {
  const el = document.createElement('div');
  el.id = ID_ESCUDO;
  el.setAttribute('aria-hidden', 'true');
  el.textContent = 'conteudo pausado';
  document.body.appendChild(el);
  return el;
}

function criarMarca(): HTMLDivElement {
  const el = document.createElement('div');
  el.id = ID_MARCA;
  el.setAttribute('aria-hidden', 'true');
  el.style.backgroundImage = tileSvg(textoMarca);
  document.body.appendChild(el);
  return el;
}

function abaAtual(): string {
  try {
    const estado: unknown = window.history.state;
    if (estado && typeof estado === 'object') {
      const aba = (estado as Record<string, unknown>).libidoTab;
      if (typeof aba === 'string') return aba.toLowerCase();
    }
  } catch {
    return '';
  }
  return '';
}

function deveProteger(): boolean {
  const aba = abaAtual();
  if (!aba) return true;
  return ABAS_PROTEGIDAS.indexOf(aba) >= 0;
}

function atualizarMarca(): void {
  if (!marca) return;
  const ativo = deveProteger();
  marca.style.display = ativo ? 'block' : 'none';
  marca.style.backgroundImage = tileSvg(textoMarca);
}

function mostrarEscudo(): void {
  if (!ligado) return;

  if (!escudo) escudo = criarEscudo();
  escudo.style.display = 'flex';

  try {
    const midias = document.querySelectorAll('audio,video');
    midias.forEach((m) => {
      const el = m as HTMLMediaElement;
      if (!el.paused) el.pause();
    });
  } catch {
    // sem midia ativa
  }

  if (!tituloTrocado) {
    tituloOriginal = document.title;
    tituloTrocado = true;
  }
  document.title = 'Libido';
}

function esconderEscudo(): void {
  if (escudo) escudo.style.display = 'none';

  if (tituloTrocado) {
    document.title = tituloOriginal;
    tituloTrocado = false;
  }
}

function instalarBloqueioImpressao(): void {
  const bloquear = (): void => {
    try {
      window.print = () => {
        mostrarEscudo();
        window.setTimeout(esconderEscudo, 600);
      };
    } catch {
      // property nao sobrescrevivel neste navegador
    }
  };

  window.addEventListener('beforeprint', () => {
    bloquear();
    atualizarMarca();
  });

  window.addEventListener('afterprint', () => {
    if (document.hasFocus()) esconderEscudo();
  });

  try {
    const mq = window.matchMedia('print');
    mq.addEventListener('change', (ev) => {
      if (ev.matches) atualizarMarca();
    });
  } catch {
    // Safari antigo sem matchMedia
  }
}

function instalarEventos(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') mostrarEscudo();
    else esconderEscudo();
  });

  window.addEventListener('pagehide', mostrarEscudo);

  window.addEventListener('blur', () => {
    if (timerBlur !== null) window.clearTimeout(timerBlur);
    timerBlur = window.setTimeout(() => {
      timerBlur = null;
      if (!document.hasFocus()) mostrarEscudo();
    }, 80);
  });

  window.addEventListener('focus', () => {
    if (timerBlur !== null) {
      window.clearTimeout(timerBlur);
      timerBlur = null;
    }
    esconderEscudo();
  });

  document.addEventListener('contextmenu', (e) => {
    const alvo = e.target as HTMLElement | null;
    const emMidia =
      !!alvo &&
      (alvo.tagName === 'IMG' ||
        alvo.tagName === 'VIDEO' ||
        !!alvo.closest('[data-protegido="1"]') ||
        !!alvo.closest('[data-sensivel="1"]'));
    if (emMidia || deveProteger()) e.preventDefault();
  }, { capture: true });

  document.addEventListener('dragstart', (e) => {
    const alvo = e.target as HTMLElement | null;
    if (alvo && (alvo.tagName === 'IMG' || alvo.tagName === 'VIDEO')) e.preventDefault();
  }, { capture: true });

  document.addEventListener('keydown', (e) => {
    const meta = e.ctrlKey || e.metaKey;
    const k = String(e.key || '').toLowerCase();

    // Impressao: bloqueio efetivo.
    if (meta && k === 'p') { e.preventDefault(); e.stopPropagation(); return; }

    // Atalhos de captura e inspecao: dissuasao.
    if (e.key === 'PrintScreen') { e.preventDefault(); return; }
    if (meta && e.shiftKey && (k === 's' || k === '3' || k === '4' || k === '5')) { e.preventDefault(); return; }
  }, { capture: true });
}

function instalarNavegacao(): void {
  try {
    const pushOriginal = window.history.pushState.bind(window.history);
    const replaceOriginal = window.history.replaceState.bind(window.history);

    window.history.pushState = function (
      this: History,
      ...args: Parameters<History['pushState']>
    ): void {
      pushOriginal(...args);
      atualizarMarca();
    } as History['pushState'];

    window.history.replaceState = function (
      this: History,
      ...args: Parameters<History['replaceState']>
    ): void {
      replaceOriginal(...args);
      atualizarMarca();
    } as History['replaceState'];
  } catch {
    // sem hook de navegacao: marca continua fixa
  }

  window.addEventListener('popstate', atualizarMarca);
  window.addEventListener('hashchange', atualizarMarca);
}

async function carregarIdentidade(): Promise<void> {
  try {
    const sessao = await supabase.auth.getSession();
    const usuario = sessao && sessao.data ? sessao.data.session?.user ?? null : null;
    if (!usuario || !usuario.id) return;

    const agora = new Date();
    const p = (n: number): string => (n < 10 ? '0' + n : String(n));
    const carimbo =
      p(agora.getDate()) + '/' + p(agora.getMonth() + 1) + ' ' +
      p(agora.getHours()) + ':' + p(agora.getMinutes());

    textoMarca = ('LIBIDO ' + usuario.id.slice(0, 8) + ' ' + carimbo).toUpperCase();
    atualizarMarca();
  } catch {
    // sem sessao: marca fica no fallback
  }
}

export function iniciarAntiPrint(): void {
  if (typeof document === 'undefined' || ligado) return;

  ligado = true;
  garantirEstilo();

  if (!escudo) escudo = criarEscudo();
  if (!marca) marca = criarMarca();

  instalarBloqueioImpressao();
  instalarEventos();
  instalarNavegacao();
  atualizarMarca();

  void carregarIdentidade();

  try {
    supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (!sessao || !sessao.user || !sessao.user.id) return;
      void carregarIdentidade();
    });
  } catch {
    // sem listener de auth
  }
}

export function pararAntiPrint(): void {
  ligado = false;

  if (escudo && escudo.parentNode) escudo.parentNode.removeChild(escudo);
  if (marca && marca.parentNode) marca.parentNode.removeChild(marca);

  escudo = null;
  marca = null;
  esconderEscudo();
}

export function protegerElemento(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute('data-protegido', '1');
  el.setAttribute('oncontextmenu', 'return false');
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarAntiPrint, { once: true });
  } else {
    iniciarAntiPrint();
  }
}