/* All paths are relative to this repository's GitHub Pages directory. */
const CACHE = "geld-legen-pwa-v3.1";
const PREFIX = "geld-legen-pwa-";
const FILES = [
  "./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable.png",
  ...[1,2,5,10,20,50].flatMap(n=>["./assets/"+n+"-euro.png","./assets/"+n+"-cent.png"])
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if(event.request.method!=="GET"||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match("./index.html"))));
    return;
  }
  const known=FILES.slice(1).some(path=>new URL(path,self.registration.scope).pathname===url.pathname);
  if(known)event.respondWith(caches.open(CACHE).then(cache=>cache.match(url.pathname).then(cached=>cached||fetch(event.request))));
});
