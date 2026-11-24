// Service worker that stages the "payment service outage" incident.
//
// GitHub Pages can only answer 200/404, so this worker intercepts the
// navigation to 503.html, keeps it pending for a few seconds (the browser tab
// shows its loading spinner the whole time), then answers with the page's
// content and a real "503 Service Unavailable" status, as seen in DevTools.
// Every other request goes to the network untouched.

var DELAY_MS = 5000;

self.addEventListener('install', function () {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    var request = event.request;
    if (request.mode !== 'navigate') return;
    if (!/\/503\.html$/.test(new URL(request.url).pathname)) return;

    event.respondWith(
        new Promise(function (resolve) { setTimeout(resolve, DELAY_MS); })
            .then(function () { return fetch(request.url, { cache: 'no-store' }); })
            .then(function (response) { return response.text(); })
            .then(function (body) {
                return new Response(body, {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3600' }
                });
            })
    );
});
