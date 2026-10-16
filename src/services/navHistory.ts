// NAV-HISTORY: faz o botao voltar do navegador/celular navegar dentro do app
// Em vez de sair do site, o voltar retorna para a tela anterior do Libido.
let navigateFn: ((tab: string, params?: any) => void) | null = null;
let ouvinteInstalado = false;
let stampado = false;
let restaurando = false;
let abaAtual = 'feed';

export const initNavHistory = (fn: (tab: string, params?: any) => void) => {
  navigateFn = fn;
  if (ouvinteInstalado) return;
  ouvinteInstalado = true;
  window.addEventListener('popstate', (e: any) => {
    const st: any = e && e.state;
    if (st && st.libidoTab && navigateFn) {
      restaurando = true;
      try { navigateFn(st.libidoTab, st.libidoParams); } catch (eR) { restaurando = false; }
      return;
    }
    // Sem tela registrada no historico: permanece no app e rearma o voltar
    if (navigateFn) { registrarTela(abaAtual || 'feed'); }
  });
};

export const registrarTela = (tab: string, params?: any) => {
  abaAtual = tab || 'feed';
  if (restaurando) { restaurando = false; return; }
  try {
    const atual: any = window.history.state;
    if (atual && atual.libidoTab === abaAtual && JSON.stringify(atual.libidoParams || null) === JSON.stringify(params || null)) return;
    if (!stampado) {
      window.history.replaceState({ libidoTab: abaAtual, libidoParams: params || null }, '');
      stampado = true;
      return;
    }
    window.history.pushState({ libidoTab: abaAtual, libidoParams: params || null }, '');
  } catch (eH) { console.error('NAV-HISTORY falhou', eH); }
};
