self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow('/');
  }));
});

// PWA-MOD: pass-through de fetch (criterio de instalabilidade do PWA)
self.addEventListener('fetch', (event) => {});
/* ===== LIBIDO-PUSH: notificacoes com o app fechado ===== */
self.addEventListener('push', function (event) {
  var dados = {};
  try { dados = event.data ? event.data.json() : {}; } catch (e) { dados = {}; }
  var titulo = dados.title || 'Libido';
  var corpo = dados.body || 'Você tem uma nova mensagem.';
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: corpo,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: dados.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
      for (var i = 0; i < lista.length; i++) {
        if ('focus' in lista[i]) { lista[i].focus(); return; }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
