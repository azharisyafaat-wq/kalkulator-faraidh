/* Cache versi ini dibentuk dari isi paket. Ganti identitas saat menerbitkan perubahan. */
const CACHE='faraidh-5.17.1-oss-1';
const ASSETS=["./", "./baca-saya.txt", "./fonts/amiri-arabic-400-normal.woff2", "./fonts/amiri-arabic-700-normal.woff2", "./fonts/fonts.css", "./fonts/ibm-plex-mono-latin-400-normal.woff2", "./fonts/ibm-plex-mono-latin-500-normal.woff2", "./fonts/ibm-plex-mono-latin-ext-400-normal.woff2", "./fonts/ibm-plex-mono-latin-ext-500-normal.woff2", "./fonts/ibm-plex-sans-latin-400-normal.woff2", "./fonts/ibm-plex-sans-latin-500-normal.woff2", "./fonts/ibm-plex-sans-latin-600-normal.woff2", "./fonts/ibm-plex-sans-latin-ext-400-normal.woff2", "./fonts/ibm-plex-sans-latin-ext-500-normal.woff2", "./fonts/ibm-plex-sans-latin-ext-600-normal.woff2", "./fonts/license-amiri.txt", "./fonts/license-ibm-plex-mono.txt", "./fonts/license-ibm-plex-sans.txt", "./fonts/license-literata.txt", "./fonts/literata-latin-500-normal.woff2", "./fonts/literata-latin-600-normal.woff2", "./fonts/literata-latin-700-normal.woff2", "./fonts/literata-latin-ext-500-normal.woff2", "./fonts/literata-latin-ext-600-normal.woff2", "./fonts/literata-latin-ext-700-normal.woff2", "./hak-cipta.txt", "./icons/apple-touch-icon.png", "./icons/favicon-16.png", "./icons/favicon-32.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-192.png", "./icons/maskable-512.png", "./index.html", "./bank-kasus.js", "./lisensi-pihak-ketiga.txt", "./manifest.webmanifest", "./screenshots/layar-lebar.png", "./screenshots/ponsel-hasil.png", "./screenshots/ponsel-isian.png", "./vendor/license-pdfjs.txt", "./vendor/pdf.min.js", "./vendor/pdf.worker.min.js"];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    try{
      // no-cache memvalidasi respons server, bukan menyalin aset HTTP cache lama.
      await cache.addAll(ASSETS.map(url=>new Request(url,{cache:'no-cache'})));
    }catch(error){
      await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('faraidh-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
// Pembaruan hanya mengambil alih setelah pengguna memilih Muat ulang.
self.addEventListener('message',event=>{if(event.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(request,{ignoreSearch:true});
    if(cached)return cached;
    try{return await fetch(request);}
    catch(error){
      if(request.mode==='navigate'){
        const index=await cache.match('./index.html');
        if(index)return index;
      }
      throw error;
    }
  })());
});
