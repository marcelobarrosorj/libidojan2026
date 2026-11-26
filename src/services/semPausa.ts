// SEM-PAUSA v3: rede de seguranca contra overlay de pausa, com custo baixo.
// Mesmo efeito: se existir um bloco com o texto alvo, esconde o ancestral
// posicionado. Muda o custo: portao barato por texto antes da varredura,
// limite menor, intervalo maior, observer com debounce e sem rajada de 12 quadros.

var CLASSE = 'is-hidden';
var ID_ESTILO = 'libido-sem-pausa';
var PARTES = ['conteudo', 'pausado'];
var PORTAO = 'paus';

var instalado = false;
var observador: any = null;
var relogio: any = null;
var agendado: any = null;
var ultimaVarredura = 0;

function semAcento(v: string): string {
  var t = String(v || '').toLowerCase();
  t = t.split('\u00e1').join('a');
  t = t.split('\u00e0').join('a');
  t = t.split('\u00e2').join('a');
  t = t.split('\u00e3').join('a');
  t = t.split('\u00e9').join('e');
  t = t.split('\u00ea').join('e');
  t = t.split('\u00ed').join('i');
  t = t.split('\u00f3').join('o');
  t = t.split('\u00f4').join('o');
  t = t.split('\u00f5').join('o');
  t = t.split('\u00fa').join('u');
  t = t.split('\u00e7').join('c');
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

  // SEM-PAUSA-PORTAO: uma leitura do texto do documento. Se a palavra alvo nao
  // aparece em lugar nenhum, encerra aqui. Este e o caso normal.
  var bruto = '';
  try { bruto = String(document.body.textContent || '').toLowerCase(); } catch (e) { bruto = ''; }
  if (bruto.indexOf(PORTAO) < 0) return;

  var frase = PARTES.join(' ');
  var alvos = document.body.querySelectorAll('div, section, span, p');
  var limite = alvos.length < 300 ? alvos.length : 300;

  for (var i = 0; i < limite; i++) {
    var el: any = alvos[i];
    if (!el) continue;
    if (el.childElementCount > 3) continue;

    var texto = '';
    try { texto = String(el.textContent || ''); } catch (e) { continue; }
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

function varrerAgora(): void {
  ultimaVarredura = Date.now();
  limparClasse();
  esconderOverlays();
}

function varrer(): void {
  if (document.visibilityState === 'hidden') return;
  if (Date.now() - ultimaVarredura < 1000) return;
  varrerAgora();
}

function agendarVarredura(): void {
  if (agendado) return;
  agendado = window.setTimeout(function () { agendado = null; varrer(); }, 400);
}

function rajada(): void {
  varrerAgora();
  window.setTimeout(varrerAgora, 500);
  window.setTimeout(varrerAgora, 1500);
}

function aoVisibilidade(): void {
  if (document.visibilityState === 'visible') rajada();
}

export function instalarSemPausa(): void {
  if (instalado) return;
  if (typeof document === 'undefined') return;

  injetarEstilo();
  rajada();

  if (typeof MutationObserver !== 'undefined' && document.body) {
    observador = new MutationObserver(function () { agendarVarredura(); });
    observador.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: false
    });
  }

  if (typeof window !== 'undefined') {
    relogio = window.setInterval(varrer, 5000);
    window.addEventListener('focus', agendarVarredura);
    document.addEventListener('visibilitychange', aoVisibilidade);
  }

  instalado = true;
}

export function removerSemPausa(): void {
  if (observador) { try { observador.disconnect(); } catch (e) { /* ignorar */ } observador = null; }
  if (relogio) { window.clearInterval(relogio); relogio = null; }
  if (agendado) { window.clearTimeout(agendado); agendado = null; }
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', agendarVarredura);
    document.removeEventListener('visibilitychange', aoVisibilidade);
  }
  instalado = false;
}

instalarSemPausa();