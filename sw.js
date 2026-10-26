const CACHE_NAME='racket-stars-shell-v2';
const INDEX_URL=new URL('./index.html',self.registration.scope).href;

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    // 初回のみ現在のHTMLを退避。通常の表示は常にネットワークを優先する。
    try{
      const response=await fetch(INDEX_URL,{cache:'no-store'});
      if(response.ok){
        const cache=await caches.open(CACHE_NAME);
        await cache.put(INDEX_URL,response.clone());
      }
    }catch(e){}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('racket-stars-shell-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(req,{cache:'no-store'});
        if(response.ok){
          const cache=await caches.open(CACHE_NAME);
          await cache.put(INDEX_URL,response.clone());
        }
        return response;
      }catch(e){
        const cached=await caches.match(INDEX_URL);
        if(cached)return cached;
        return new Response('インターネットに接続できません。接続を確認して再読み込みしてください。',{
          status:503,
          headers:{'Content-Type':'text/plain; charset=utf-8'}
        });
      }
    })());
  }
});
