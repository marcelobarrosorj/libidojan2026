import { supabase } from './supabase';

const ID_ESTILO = 'antiprint-estilo';
const ID_MARCA = 'antiprint-marca';

const ABAS_PROTEGIDAS = ['chat', 'mensagens', 'notificacoes', 'notificações', 'fotos', 'perfil'];

const TILE_W = 300;
const TILE_H = 150;

let ligado = false;
let marca: HTMLDivElement | null = null;
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
    '@media print{' +
    '@page{margin:0}' +
    'html,body{display:none !important;visibility:hidden !important}' +
    '}' +
    '#' + ID_MARCA + '{position:fixed;inset:0;z-index:2147483500;pointer-events:none;' +
    'background-repeat:repeat;opacity:0.9;display:none}' +
    'img,video{-webkit-user-drag:none;-webkit-touch-callout:none}' +
    '[data-protegido="1"] img,[data-protegido="1"] video{user-select:none;-webkit-user-select:none}';

  document.head.appendChild(st);
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
  if (!aba) return false;
  return ABAS_PROTEGIDAS.indexOf(aba) >= 0;
}

function atualizarMarca(): void {
  if (!marca) return;
  const ativo = deveProteger();
  marca.style.display = ativo ? 'block' : 'none';
  marca.style.backgroundImage = tileSvg(textoMarca);
}

function removerEscudoResidual(): void {
  const residual = document.getElementById('antiprint-escudo');
  if (residual && residual.parentNode) {
    residual.parentNode.removeChild(residual);
  }
}

function instalarBloqueioImpressao(): void {
  window.addEventListener('beforeprint', () => {
    atualizarMarca();
  });
}

function instalarEventos(): void {
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
    if (meta && k === 'p') { e.preventDefault(); e.stopPropagation(); return; }
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
  } catch {}

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
  } catch {}
}

export function iniciarAntiPrint(): void {
  if (typeof document === 'undefined' || ligado) return;

  ligado = true;
  removerEscudoResidual();
  garantirEstilo();

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
  } catch {}
}

export function pararAntiPrint(): void {
  ligado = false;
  removerEscudoResidual();
  if (marca && marca.parentNode) marca.parentNode.removeChild(marca);
  marca = null;
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