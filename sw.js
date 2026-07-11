const CACHE_NAME="wortfit-2.1.0";
const FILES=["./","./index.html","./style.css","./data.js","./storage.js","./speech.js","./stats.js","./app.js","./manifest.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin){e.respondWith(fetch(e.request));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
