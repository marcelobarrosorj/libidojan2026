// PWA-INSTALL-MOD v5: aviso gerado de acordo com o dispositivo (Android, iPhone ou computador)
let promptAdiado: any = null;
let iniciado = false;
let banner: HTMLDivElement | null = null;
let modoAtual: string | null = null;
let aguardandoEvento = true;
let promptEmAndamento = false;

const CHAVE_INSTALADO = 'libido-pwa-instalado';
const CHAVE_DISPENSADO = 'libido-pwa-dispensado-em';
const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

type Dispositivo = 'ios' | 'android' | 'desktop';

function tipoDispositivo(): Dispositivo {
  const ua = navigator.userAgent || '';
  const iOSClassico = /iphone|ipad|ipod/i.test(ua);
  const iPadModerno = /Macintosh/i.test(ua) && (navigator as any).maxTouchPoints > 1;
  if (iOSClassico || iPadModerno) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

function jaInstalado(): boolean {
  try {
    if (localStorage.getItem(CHAVE_INSTALADO) === '1') return true;
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if ((window.navigator as any).standalone === true) return true;
  } catch (e) { console.error(e); }
  return false;
}

async function instaladoViaApi(): Promise<boolean> {
  try {
    const nav: any = navigator;
    if (typeof nav.getInstalledRelatedApps === 'function') {
      const apps = await nav.getInstalledRelatedApps();
      if (Array.isArray(apps) && apps.length > 0) return true;
    }
  } catch (e) { console.error(e); }
  return false;
}

function dispensadoRecentemente(): boolean {
  try {
    const t = Number(localStorage.getItem(CHAVE_DISPENSADO) || '0');
    if (t > 0 && Date.now() - t < SETE_DIAS) return true;
  } catch (e) { console.error(e); }
  return false;
}

function esconderBanner() {
  if (banner) { banner.remove(); banner = null; modoAtual = null; }
}

function abrirInstrucoes(disp: Dispositivo) {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
    background: 'rgba(0,0,0,0.65)', zIndex: '100000',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  } as any);
  const card = document.createElement('div');
  Object.assign(card.style, {
    background: '#1e1e24', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '16px',
    padding: '22px', maxWidth: '380px', width: '100%', boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  } as any);
  const titulo = document.createElement('div');
  titulo.textContent = disp === 'ios' ? 'Adicionar à Tela de Início' : disp === 'android' ? 'Instalar o Libido no celular' : 'Instalar o Libido no computador';
  Object.assign(titulo.style, { color: '#ffffff', fontSize: '18px', fontWeight: '800', marginBottom: '14px' } as any);
  card.appendChild(titulo);
  let passos: string[] = [];
  if (disp === 'ios') {
    passos = [
      '1. Toque no botão Compartilhar (o quadrado com a seta)',
      '2. Toque em "Adicionar à Tela de Início"',
      '3. Toque em "Adicionar" para confirmar',
    ];
  } else if (disp === 'android') {
    passos = [
      '1. Toque no menu do navegador (os 3 pontinhos no canto)',
      '2. Toque em "Instalar aplicativo" (ou "Adicionar à tela inicial")',
      '3. Confirme tocando em "Instalar"',
    ];
  } else {
    passos = [
      '1. Procure o ícone de instalar na barra de endereço (do lado do endereço do site) e clique nele',
      '2. Ou abra o menu do navegador (os 3 pontinhos no canto superior direito)',
      '3. Escolha "Instalar Libido..." (ou "Salvar e compartilhar" > "Instalar página como app") e confirme',
    ];
  }
  for (let i = 0; i < passos.length; i++) {
    const linha = document.createElement('div');
    linha.textContent = passos[i];
    Object.assign(linha.style, { color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' } as any);
    card.appendChild(linha);
  }
  const dica = document.createElement('div');
  dica.textContent = 'Dica: se a opção ainda não aparecer, feche este aviso e toque no banner de novo em alguns segundos.';
  Object.assign(dica.style, { color: '#9ca3af', fontSize: '12px', lineHeight: '1.5', marginTop: '10px' } as any);
  card.appendChild(dica);
  const botao = document.createElement('button');
  botao.textContent = 'Entendi';
  Object.assign(botao.style, {
    marginTop: '16px', width: '100%', background: 'linear-gradient(135deg, #a855f7, #ec4899)',
    color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px',
    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
  } as any);
  botao.addEventListener('click', () => overlay.remove());
  card.appendChild(botao);
  overlay.appendChild(card);
  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function acionarInstalacao() {
  if (promptAdiado && !promptEmAndamento) {
    promptEmAndamento = true;
    const evento = promptAdiado;
    try { evento.prompt(); } catch (e) { promptAdiado = null; promptEmAndamento = false; return; }
    try {
      evento.userChoice.then((escolha: any) => {
        if (escolha && escolha.outcome === 'accepted') {
          try { localStorage.setItem(CHAVE_INSTALADO, '1'); } catch (e) { console.error(e); }
        } else {
          try { localStorage.setItem(CHAVE_DISPENSADO, String(Date.now())); } catch (e) { console.error(e); }
        }
        promptAdiado = null;
        promptEmAndamento = false;
        esconderBanner();
      });
    } catch (e) {
      promptAdiado = null;
      promptEmAndamento = false;
      esconderBanner();
    }
    return;
  }
  abrirInstrucoes(tipoDispositivo());
}

function montarBanner(modo: 'prompt' | 'hint' | 'ios') {
  if (banner && modoAtual === modo) return;
  esconderBanner();
  const disp = tipoDispositivo();
  banner = document.createElement('div');
  const ehMobile = typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 768px)').matches : false; // MATCHMEDIA-GUARD
  Object.assign(banner.style, {
    position: 'fixed', left: '50%', transform: 'translateX(-50%)',
    bottom: ehMobile ? '78px' : '16px',
    zIndex: '99999', maxWidth: '420px', width: 'calc(100% - 24px)', boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
    background: '#1e1e24', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '14px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    cursor: 'pointer',
  } as any);

  const icone = document.createElement('img');
  icone.src = '/icon-192.png';
  Object.assign(icone.style, {
    width: '44px', height: '44px', borderRadius: '10px', flexShrink: '0',
    border: '1px solid rgba(255,255,255,0.18)', objectFit: 'cover', background: '#1a1207',
  } as any);
  icone.onerror = () => {
    const fb = document.createElement('div');
    Object.assign(fb.style, {
      width: '44px', height: '44px', borderRadius: '10px', flexShrink: '0',
      background: 'linear-gradient(135deg, #d4a017, #8a5a00)',
      color: '#1a1207', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: '800', fontSize: '22px',
    } as any);
    fb.textContent = 'L';
    icone.replaceWith(fb);
  };
  banner.appendChild(icone);

  const texto = document.createElement('div');
  Object.assign(texto.style, { flex: '1', minWidth: '0' } as any);
  const titulo = document.createElement('div');
  const sub = document.createElement('div');
  const onde = disp === 'desktop' ? 'no seu computador' : 'no seu celular';
  if (modo === 'ios') {
    titulo.textContent = 'Adicione o Libido à tela inicial';
    sub.textContent = 'Toque aqui para ver o passo a passo';
  } else if (modo === 'hint') {
    titulo.textContent = 'Instale o Libido ' + onde;
    sub.textContent = 'Toque aqui para ver o passo a passo';
  } else {
    titulo.textContent = 'Instale o Libido ' + onde;
    sub.textContent = 'Toque aqui para instalar agora';
  }
  Object.assign(titulo.style, { color: '#ffffff', fontSize: '14px', fontWeight: '700', lineHeight: '1.2' } as any);
  Object.assign(sub.style, { color: '#9ca3af', fontSize: '12px', lineHeight: '1.3', marginTop: '2px' } as any);
  texto.appendChild(titulo);
  texto.appendChild(sub);
  banner.appendChild(texto);

  if (modo === 'prompt') {
    const botao = document.createElement('button');
    botao.textContent = '📲 Instalar';
    Object.assign(botao.style, {
      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
      color: '#ffffff', border: 'none', borderRadius: '10px',
      padding: '9px 14px', fontWeight: '700', fontSize: '13px',
      cursor: 'pointer', flexShrink: '0',
    } as any);
    botao.addEventListener('click', (ev) => { ev.stopPropagation(); acionarInstalacao(); });
    banner.appendChild(botao);
  }

  const fechar = document.createElement('button');
  fechar.textContent = '✕';
  fechar.setAttribute('aria-label', 'Fechar');
  Object.assign(fechar.style, {
    background: 'transparent', color: '#9ca3af', border: 'none',
    fontSize: '16px', cursor: 'pointer', flexShrink: '0', padding: '4px',
  } as any);
  fechar.addEventListener('click', (ev) => {
    ev.stopPropagation();
    try { localStorage.setItem(CHAVE_DISPENSADO, String(Date.now())); } catch (e) { console.error(e); }
    esconderBanner();
  });
  banner.appendChild(fechar);

  banner.addEventListener('click', () => acionarInstalacao());
  modoAtual = modo;
  document.body.appendChild(banner);
}

async function talvezMostrar() {
  if (jaInstalado()) {
    try { localStorage.setItem(CHAVE_INSTALADO, '1'); } catch (e) { console.error(e); }
    esconderBanner();
    return;
  }
  if (await instaladoViaApi()) {
    try { localStorage.setItem(CHAVE_INSTALADO, '1'); } catch (e) { console.error(e); }
    esconderBanner();
    return;
  }
  if (dispensadoRecentemente()) return;
  if (!promptAdiado && aguardandoEvento && tipoDispositivo() !== 'ios') return;
  const alvo: 'prompt' | 'hint' | 'ios' = promptAdiado ? 'prompt' : (tipoDispositivo() === 'ios' ? 'ios' : 'hint');
  montarBanner(alvo);
}

export function iniciarInstalarApp() {
  if (iniciado) return;
  iniciado = true;

  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    promptAdiado = e;
    aguardandoEvento = false;
    talvezMostrar();
  });

  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem(CHAVE_INSTALADO, '1');
      localStorage.removeItem(CHAVE_DISPENSADO);
    } catch (e) { console.error(e); }
    esconderBanner();
  });

  const comecar = () => {
    talvezMostrar();
    setTimeout(() => { aguardandoEvento = false; talvezMostrar(); }, 4000);
  };
  if (document.body) comecar();
  else document.addEventListener('DOMContentLoaded', comecar);
}