// Migration worker for installations of the old cache. New releases do not register it.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
    await self.registration.unregister();
    // Do not delete origin-wide caches: other installations may still use them.
})()));
// No fetch handler: all requests use normal HTTP caching.
