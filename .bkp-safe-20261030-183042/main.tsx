import './services/antiPrint';
import './services/semPausa';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './services/locationTracker';
import './services/alertasSonoros';
import './services/push';
import './services/pushOff';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// NOCOPY-JS: bloqueia o menu de salvar foto e o arrasto de imagens
document.addEventListener('contextmenu', (e) => {
  const alvo = e.target as HTMLElement;
  if (alvo && alvo.tagName === 'IMG') e.preventDefault();
});
document.addEventListener('dragstart', (e) => {
  const alvo = e.target as HTMLElement;
  if (alvo && alvo.tagName === 'IMG') e.preventDefault();
});

// CONVITE-AUTO: captura o codigo do link /invite/CODIGO e resgata sozinho apos entrar/cadastrar
(async () => {
  try {
    const mPath = window.location.pathname.match(/\/invite\/([A-Za-z0-9\-_]+)/);
    const mHash = window.location.hash.match(/invite\/([A-Za-z0-9\-_]+)/);
    const q = new URLSearchParams(window.location.search);
    const code = (mPath && mPath[1]) || (mHash && mHash[1]) || q.get('convite') || q.get('invite');
    if (code) localStorage.setItem('libido_pending_invite', code);
    const pending = localStorage.getItem('libido_pending_invite');
    if (!pending) return;
    const { supabase } = await import('./services/supabase');
    const mod: any = await import('./services/premiumInvites');
    const resgatar: any = mod.resgatarConvitePremium;
    if (typeof resgatar !== 'function') return;
    let resgatado = false;
    const tentar = async () => {
      if (resgatado) return;
      try {
        const sess: any = await supabase.auth.getSession();
        const user = sess?.data?.session?.user;
        if (user) {
          resgatado = true;
          let falhou = false;
          let motivo = '';
          try {
            const r: any = await resgatar(pending, user.id);
            falhou = !!(r && (r.error || r.success === false || r.ok === false));
            motivo = (r && r.error) || 'codigo invalido ou ja usado';
          } catch (e: any) {
            falhou = true;
            motivo = (e && e.message) || 'codigo invalido ou ja usado';
          }
          localStorage.removeItem('libido_pending_invite');
          if (falhou) alert('Nao foi possivel resgatar o convite: ' + motivo);
          else alert('Convite resgatado! Premium ativado com sucesso.');
        }
      } catch {}
    };
    supabase.auth.onAuthStateChange(() => { tentar(); });
    tentar();
  } catch (e) {
    console.error('CONVITE-AUTO:', e);
  }
})();



// AFILIADO-TRACKING (Item 11): captura links de criadoras (ex: /bibi, ?ref=bibi, ?promo=MAIS18)
(async () => {
  try {
    const rotasReservadas = new Set(['', 'login', 'register', 'invite', 'admin', 'parceiros', 'partners', 'radar', 'chat', 'feed', 'profile']);
    const seg = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || '';
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref') || params.get('afiliado') || params.get('promo') || '';
    const slugDetectado = refParam || (!rotasReservadas.has(seg.toLowerCase()) ? seg : '');

    if (slugDetectado && /^[A-Za-z0-9_\-]{2,40}$/.test(slugDetectado)) {
      localStorage.setItem('libido_affiliate_ref', slugDetectado.toLowerCase());
      if (seg && !rotasReservadas.has(seg.toLowerCase())) {
        window.history.replaceState(null, '', '/');
      }
    }

    const refPendente = localStorage.getItem('libido_affiliate_ref');
    if (!refPendente) return;

    const { supabase } = await import('./services/supabase');
    let gravado = false;
    const vincularAfiliado = async () => {
      if (gravado) return;
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return;
      gravado = true;
      try {
        await supabase.rpc('registrar_indicacao', { p_slug: refPendente });
        localStorage.removeItem('libido_affiliate_ref');
      } catch {}
    };
    supabase.auth.onAuthStateChange(() => { void vincularAfiliado(); });
    void vincularAfiliado();
  } catch {}
})();