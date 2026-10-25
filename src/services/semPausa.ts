// SEM-PAUSA: remove a tela "conteudo pausado" sem alterar o visual do app.
// Atua so em elementos fixos/absolutos que contenham esse texto,
// e remove a classe is-hidden do body. Nada de CSS global, nada de tema.

var CLASSE = 'is-hidden';
var ID_ESTILO = 'libido-sem-pausa';
var TEXTO = 'conteudo pausado';

var instalado = false;
var observador: any = null;
var relogio: any = null;

function semAcento(v: string): string {
  var t = String(v || '').toLowerCase();
  t = t.split('á').join('a');
  t = t.split('à').join('a');
  t = t.split('â').join('a');
  t = t.split('ã').join('a');
  t = t.split('é').join('e');
  t = t.split('ê').join('e');
  t = t.split('í').join('i');
  t = t.split('ó').join('o');
  t = t.split('ô').join('o');
  t = t.split('õ').join('o');
  t = t.split('ú').join('u');
  t = t.split('ç').join('c');
  return t;
}

function injetarEstilo(): void {
  if (document.getElementById(ID_ESTILO)) return;
  var estilo = document.createElement('style');
  estilo.id = ID_ESTILO;
  estilo.textContent = [
    'body.is-hidden { filter: none !important; opacity: 1 !important; }',
    'body.is-hidden > * { filter: none !important; opacity: 1 !important; visibility: visible !important; }',
    'body.is-hidden::before, body.is-hidden::after { content: none !important; display: none !important; }'
  ].join('\n');
  (document.head || document.body).appendChild(estilo);
}

function limparClasse(): void {
  if (document.body && document.body.classList.contains(CLASSE)) {
    document.body.classList.remove(CLASSE);
  }
}

function esconderOverlays(): void {
  if (!document.body) return;
  var alvos = document.body.querySelectorAll('div, section');
  var limite = alvos.length < 400 ? alvos.length : 400;

  for (var i = 0; i < limite; i++) {
    var el: any = alvos[i];
    if (!el || el.style.display === 'none') continue;
    var texto = String(el.textContent || '');
    if (texto.length > 60) continue;
    if (semAcento(texto).indexOf(TEXTO) < 0) continue;

    var posicao = '';
    try { posicao = window.getComputedStyle(el).position; } catch (e) { posicao = ''; }

    if (posicao === 'fixed' || posicao === 'absolute') {
      el.style.setProperty('display', 'none', 'important');
    }
  }
}

function varrer(): void {
  limparClasse();
  esconderOverlays();
}

export function instalarSemPausa(): void {
  if (instalado) return;
  if (typeof document === 'undefined') return;

  injetarEstilo();
  varrer();

  if (typeof MutationObserver !== 'undefined' && document.body) {
    observador = new MutationObserver(function () { varrer(); });
    observador.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: false
    });
  }

  if (typeof window !== 'undefined') {
    relogio = window.setInterval(varrer, 700);
  }

  instalado = true;
}

export function removerSemPausa(): void {
  if (observador) { try { observador.disconnect(); } catch (e) { /* ignorar */ } observador = null; }
  if (relogio) { window.clearInterval(relogio); relogio = null; }
  instalado = false;
}

instalarSemPausa();