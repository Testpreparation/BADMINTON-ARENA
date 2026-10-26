const CACHE_NAME='racket-stars-shell-v1';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('racket-stars-shell-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;if(req.mode==='navigate'){event.respondWith((async()=>{try{return await fetch(req,{cache:'no-store'})}catch(e){const cached=await caches.match('./index.html');if(cached)return cached;throw e}})())}});
