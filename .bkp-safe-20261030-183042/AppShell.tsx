// ATENDIMENTO-EMAIL: barra de contato global - aparece em todas as telas do app
import { ReactNode } from "react";

// TEMA-INIT: aplica o tema salvo antes do primeiro render (roda 1x, ao carregar o app)
try {
  if (typeof window !== 'undefined' && localStorage.getItem('libido_tema') === 'claro') {
    document.documentElement.classList.add('tema-claro');
  }
} catch (eTema) {}

// SCROLL-RESET: impede o navegador de restaurar a rolagem antiga ao abrir o app
try {
  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
} catch (eScroll) {}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        w-full
        max-w-full
        h-screen
        bg-[var(--libido-bg)]
        text-[var(--libido-text)]
        flex
        flex-col
        md:max-w-md
        md:mx-auto
        md:border-x
        md:border-[var(--libido-border)]
        relative
        overflow-hidden
        font-sans
      "
      style={{
        // TOPO-FIX: 100dvh = altura realmente visivel no celular (o h-screen acima fica como fallback)
        height: '100dvh',
        // TOPO-FIX: reserva o espaco do notch/barra de status para os botoes do topo aparecerem
        paddingTop: 'env(safe-area-inset-top)',
        // TOPO-FIX: reserva o espaco da barra inferior do iPhone
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
      <a
        href="mailto:libidoapp@gmail.com"
        className="flex-shrink-0 w-full text-center py-1.5 text-[10px] font-bold tracking-wide bg-[var(--libido-surface)] border-t border-[var(--libido-border)] text-[var(--libido-muted)] hover:text-[var(--libido-text)] transition-colors"
      >
        Atendimento: libidoapp@gmail.com
      </a>
    </div>
  );
}