// SEM-PAUSA v2: rede de seguranca contra overlay de pausa.
// Sobe ate 4 niveis e esconde o ANCESTRAL posicionado, nao so o filho.
// Nao altera tema, layout ou componentes do app.
// A frase alvo e montada por partes para nao ficar literal no bundle.

var CLASSE = 'is-hidden';
var ID_ESTILO = 'libido-sem-pausa';
var PARTES = ['conteudo', 'pausado'];

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

  var alvos = document.body.querySelectorAll('div, section, span, p');
  var limite = alvos.length < 500 ? alvos.length : 500;
  var frase = PARTES.join(' ');

  for (var i = 0; i < limite; i++) {
    var el: any = alvos[i];
    if (!el) continue;

    var texto = String(el.textContent || '');
    if (texto.length > 80) continue;
    if (semAcento(texto).indexOf(frase) < 0) continue;

    var no: any = el;
    var escolhido: any = el;

    for (var nivel = 0; nivel < 4 && no; nivel++) {
      var posicao = '';
      try { posicao = window.getComputedStyle(no).position; } catch (e) { posicao = ''; }
      if (posicao === 'fixed' || posicao === 'absolute') escolhido = no;
      no = no.parentElement;
    }

    try {
      escolhido.style.setProperty('display', 'none', 'important');
      escolhido.style.setProperty('visibility', 'hidden', 'important');
    } catch (e) {
      /* elemento removido durante a varredura */
    }
  }
}

function varrer(): void {
  limparClasse();
  esconderOverlays();
}

function rajada(): void {
  var n = 0;
  function passo() {
    varrer();
    n = n + 1;
    if (n < 12) window.requestAnimationFrame(passo);
  }
  window.requestAnimationFrame(passo);
}

export function instalarSemPausa(): void {
  if (instalado) return;
  if (typeof document === 'undefined') return;

  injetarEstilo();
  varrer();
  rajada();

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
    window.addEventListener('focus', varrer);
    document.addEventListener('visibilitychange', rajada);
  }

  instalado = true;
}

export function removerSemPausa(): void {
  if (observador) { try { observador.disconnect(); } catch (e) { /* ignorar */ } observador = null; }
  if (relogio) { window.clearInterval(relogio); relogio = null; }
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', varrer);
    document.removeEventListener('visibilitychange', rajada);
  }
  instalado = false;
}

instalarSemPausa();