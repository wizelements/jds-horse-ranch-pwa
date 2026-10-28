/* JD's Horse Ranch: safe public-assets-only offline support.
   Do not store private rider records, messages, calendar details, or checkout responses. */
const CACHE_NAME="jds-public-assets-v3";
const OFFLINE_PAGE="/offline.html";
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.add(OFFLINE_PAGE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("jds-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(/^\/(admin|api|ranch-login)(\/|$)/.test(url.pathname))return;
  if(request.mode==="navigate"){
    event.respondWith(fetch(request).catch(()=>caches.match(OFFLINE_PAGE)));
    return;
  }
  const publicAsset=url.pathname.startsWith("/_next/static/")||
    /^\/(icon-[0-9]+\.png|favicon\.ico|logo\.png|og-image\.jpg|manifest\.json|offline\.html)$/.test(url.pathname);
  if(!publicAsset)return;
  event.respondWith(caches.match(request).then(existing=>existing||fetch(request).then(response=>{
    if(response.ok && response.type==="basic") {
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));
    }
    return response;
  })));
});
