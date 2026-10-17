'use strict';
const CACHE='fieldkit-shell-1.9.1';
const SHELL=['./','index.html','product.css?v=1.9.1','assets/mark.svg','assets/icon-192.png','assets/icon-512.png','manifest.webmanifest','privacy.html','brand.css?v=1.9.1','release-notes.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fieldkit-shell-')&&k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.location).pathname))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type==='basic'){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)))}return r}).catch(()=>caches.match(e.request).then(r=>r||new Response('FieldKit is offline. Open the app once while online to save it for later.',{status:503,headers:{'Content-Type':'text/plain'}}))));});
