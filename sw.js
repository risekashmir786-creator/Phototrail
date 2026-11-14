const V='pt-v3';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png',
'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/lite.umd.js',
'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.min.js'];
addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>skipWaiting())));
addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=='tiles').map(x=>caches.delete(x)))).then(()=>clients.claim())));
async function trim(){const c=await caches.open('tiles'),k=await c.keys();if(k.length>3000)for(const r of k.slice(0,k.length-3000))await c.delete(r)}
addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const tile=/tile\.openstreetmap\.org|arcgisonline\.com|opentopomap\.org/.test(new URL(r.url).host);
 if(tile){ // tiles are re-fetched with CORS so they are stored as normal (not opaque) responses
  e.respondWith(caches.match(r.url,{ignoreVary:true}).then(hit=>hit||fetch(r.url,{mode:'cors',credentials:'omit'}).then(res=>{
   if(res.ok){const c=res.clone();caches.open('tiles').then(x=>x.put(r.url,c)).then(()=>{if(Math.random()<.02)trim()})}
   return res}).catch(()=>fetch(r))));
  return;
 }
 if(r.mode==='navigate'){ // always try the network first so app updates arrive
  e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));
  return;
 }
 e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
  if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}
  return res}).catch(()=>hit||Response.error())));
});
