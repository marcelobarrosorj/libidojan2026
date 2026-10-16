// NAV-HISTORY: faz o botao voltar do navegador/celular navegar dentro do app
// AVISO-SAIDA: na tela inicial, o voltar mostra o aviso "Deseja mesmo sair?" antes de sair
let navigateFn: ((tab: string, params?: any) => void) | null = null;
let ouvinteInstalado = false;
let restaurando = false;
let aguardandoDecisao = false;
let saindoDeVerdade = false;
let abaAtual = 'feed';
let initEm = 0;

const rearmaGuarda = () => {
  try { window.history.pushState({ libidoTab: abaAtual, libidoGuarda: true }, ''); } catch (eG) { console.error('NAV-HISTORY guarda falhou', eG); }
};

const mostrarAvisoSaida = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let decidido = false;
    const decidir = (v: boolean) => {
      if (decidido) return;
      decidido = true;
      try { const el = document.getElementById('libido-aviso-saida'); if (el) el.remove(); } catch (eR) {}
      resolve(v);
    };
    try {
      const antigo = document.getElementById('libido-aviso-saida');
      if (antigo) antigo.remove();
      const overlay = document.createElement('div');
      overlay.id = 'libido-aviso-saida';
      overlay.style.cssText = 'position:fixed;left:0;right:0;top:0;bottom:0;z-index:99999;background:rgba(12,9,18,0.88);display:flex;align-items:center;justify-content:center;padding:24px;';
      const caixa = document.createElement('div');
      caixa.style.cssText = 'background:var(--libido-surface,#221d2c);border:1px solid var(--libido-border,#3d3549);border-radius:24px;padding:28px 24px;max-width:340px;width:100%;text-align:center;';
      const titulo = document.createElement('p');
      titulo.style.cssText = 'color:var(--libido-text,#f5f2fa);font-size:18px;font-weight:800;margin:0 0 8px 0;';
      titulo.textContent = 'Deseja mesmo sair?';
      const texto = document.createElement('p');
      texto.style.cssText = 'color:var(--libido-muted,#9a92ab);font-size:13px;line-height:1.5;margin:0 0 20px 0;';
      texto.textContent = 'Voc\u00ea est\u00e1 saindo do Libido. Se preferir ficar, tudo continua no lugar.';
      const linha = document.createElement('div');
      linha.style.cssText = 'display:flex;gap:10px;';
      const bFicar = document.createElement('button');
      bFicar.style.cssText = 'flex:1;background:var(--libido-surface-2,#2b2536);color:var(--libido-text,#f5f2fa);border:1px solid var(--libido-border,#3d3549);border-radius:14px;padding:12px 8px;font-weight:800;font-size:13px;cursor:pointer;';
      bFicar.textContent = 'Ficar no app';
      bFicar.onclick = () => decidir(false);
      const bSair = document.createElement('button');
      bSair.style.cssText = 'flex:1;background:linear-gradient(90deg,var(--libido-accent,#b14bf4),var(--libido-accent-hover,#8f2fd0));color:#ffffff;border:none;border-radius:14px;padding:12px 8px;font-weight:800;font-size:13px;cursor:pointer;';
      bSair.textContent = 'Sair';
      bSair.onclick = () => decidir(true);
      linha.appendChild(bFicar);
      linha.appendChild(bSair);
      caixa.appendChild(titulo);
      caixa.appendChild(texto);
      caixa.appendChild(linha);
      overlay.appendChild(caixa);
      overlay.onclick = (ev) => { if (ev.target === overlay) decidir(false); };
      document.body.appendChild(overlay);
    } catch (eM) {
      decidir(window.confirm('Deseja mesmo sair do Libido?'));
    }
  });
};

export const initNavHistory = (fn: (tab: string, params?: any) => void) => {
  navigateFn = fn;
  if (ouvinteInstalado) return;
  ouvinteInstalado = true;
  initEm = Date.now();
  window.addEventListener('popstate', (e: any) => {
    if (saindoDeVerdade) { return; }
    if (aguardandoDecisao) { return; }
    const st: any = e && e.state;
    if (st && st.libidoTab && navigateFn) {
      restaurando = true;
      try { navigateFn(st.libidoTab, st.libidoParams); } catch (eR) { restaurando = false; }
      return;
    }
    // AVISO-SAIDA: entrada sem tela do app = usuario na borda de saida
    if (Date.now() - initEm < 1500) { rearmaGuarda(); return; }
    rearmaGuarda();
    aguardandoDecisao = true;
    mostrarAvisoSaida().then((querSair: boolean) => {
      aguardandoDecisao = false;
      if (querSair) {
        saindoDeVerdade = true;
        try { window.history.go(-2); } catch (eB) { try { window.history.back(); } catch (eB2) {} }
        setTimeout(() => { saindoDeVerdade = false; }, 800);
      }
    });
  });
};

export const registrarTela = (tab: string, params?: any) => {
  abaAtual = tab || 'feed';
  if (restaurando) { restaurando = false; return; }
  try {
    const atual: any = window.history.state;
    if (atual && atual.libidoTab === abaAtual && atual.libidoGuarda === true && JSON.stringify(atual.libidoParams || null) === JSON.stringify(params || null)) return;
    window.history.pushState({ libidoTab: abaAtual, libidoParams: params || null, libidoGuarda: true }, '');
  } catch (eH) { console.error('NAV-HISTORY falhou', eH); }
};
