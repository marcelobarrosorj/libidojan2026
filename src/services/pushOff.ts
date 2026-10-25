// PUSH-OFF: desliga o push por completo, sem alterar o visual.
// 1) nenhum prompt de permissao e exibido
// 2) window.alert e interceptado apenas para mensagens de push/permissao
// 3) a inscricao push existente e cancelada em silencio

var instalado = false;

function silenciarAlert(): void {
  if (typeof window === 'undefined' || !window.alert) return;
  var original = window.alert;

  window.alert = function (mensagem?: any) {
    var texto = String(mensagem === undefined || mensagem === null ? '' : mensagem);
    if (/push|permiss|denied|negad/i.test(texto)) return;
    return original.call(window, mensagem);
  } as any;
}

function bloquearPermissao(): void {
  if (typeof Notification === 'undefined') return;
  if (!Notification.requestPermission) return;

  (Notification as any).requestPermission = function (cb?: any) {
    if (typeof cb === 'function') {
      try { cb('denied'); } catch (e) { /* ignorar */ }
    }
    return Promise.resolve('denied');
  };
}

function cancelarInscricao(): void {
  try {
    if (typeof navigator === 'undefined') return;
    if (!navigator.serviceWorker) return;
    if (!navigator.serviceWorker.getRegistrations) return;

    navigator.serviceWorker.getRegistrations().then(function (registros) {
      for (var i = 0; i < registros.length; i++) {
        var reg: any = registros[i];
        if (!reg.pushManager || !reg.pushManager.getSubscription) continue;

        reg.pushManager.getSubscription().then(function (sub: any) {
          if (sub && sub.unsubscribe) {
            sub.unsubscribe().catch(function () { /* ignorar */ });
          }
        }).catch(function () { /* ignorar */ });
      }
    }).catch(function () { /* ignorar */ });
  } catch (e) {
    /* silencioso: push desligado, nada a reportar */
  }
}

export function pushDesativado(): boolean {
  return true;
}

export function instalarPushOff(): void {
  if (instalado) return;
  if (typeof window === 'undefined') return;

  silenciarAlert();
  bloquearPermissao();
  cancelarInscricao();
  instalado = true;
}

instalarPushOff();