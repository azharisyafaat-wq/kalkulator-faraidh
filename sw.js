/* Cache versi ini dibentuk dari isi paket. Ganti identitas saat menerbitkan perubahan.
   Sejak 5.17.2: hanya inti aplikasi yang disimpan saat pemasangan (sekitar 1 MB).
   PDF rujukan, bank contoh, dan berkas lain disimpan saat pertama kali dibuka,
   atau sekaligus lewat tombol "Simpan PDF rujukan" di aplikasi. */
const CACHE='faraidh-5.18.0-20261124';
const DOKUMEN='faraidh-dokumen-1';
const INTI=["./", "./baca-saya.txt", "./fonts/amiri-arabic-400-normal.woff2", "./fonts/amiri-arabic-700-normal.woff2", "./fonts/fonts.css", "./fonts/ibm-plex-mono-latin-400-normal.woff2", "./fonts/ibm-plex-mono-latin-500-normal.woff2", "./fonts/ibm-plex-mono-latin-ext-400-normal.woff2", "./fonts/ibm-plex-mono-latin-ext-500-normal.woff2", "./fonts/ibm-plex-sans-latin-400-normal.woff2", "./fonts/ibm-plex-sans-latin-500-normal.woff2", "./fonts/ibm-plex-sans-latin-600-normal.woff2", "./fonts/ibm-plex-sans-latin-ext-400-normal.woff2", "./fonts/ibm-plex-sans-latin-ext-500-normal.woff2", "./fonts/ibm-plex-sans-latin-ext-600-normal.woff2", "./fonts/license-amiri.txt", "./fonts/license-ibm-plex-mono.txt", "./fonts/license-ibm-plex-sans.txt", "./fonts/license-literata.txt", "./fonts/literata-latin-500-normal.woff2", "./fonts/literata-latin-600-normal.woff2", "./fonts/literata-latin-700-normal.woff2", "./fonts/literata-latin-ext-500-normal.woff2", "./fonts/literata-latin-ext-600-normal.woff2", "./fonts/literata-latin-ext-700-normal.woff2", "./hak-cipta.txt", "./icons/apple-touch-icon.png", "./icons/favicon-16.png", "./icons/favicon-32.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-192.png", "./icons/maskable-512.png", "./index.html", "./lisensi-pihak-ketiga.txt", "./manifest.webmanifest", "./vendor/license-pdfjs.txt"];
const PDF_RUJUKAN=["./rujukan/00_Katalog_Lengkap_Buku_Tautan_PDF_dan_Pembelian.pdf", "./rujukan/01_Koleksi_Buku_Hukum_Waris_Bilateral_Prof_Hazairin.pdf", "./rujukan/02_Koleksi_Buku_Kewarisan_Patrilineal_Mazhab_Syafii.pdf", "./rujukan/03_Kompilasi_Hukum_Islam_KHI_Indonesia_Lengkap.pdf", "./rujukan/04_Ensiklopedia_dan_Katalog_227_Kitab_Kuning_Lengkap.pdf", "./rujukan/05_Pedoman_Sengketa_Waris_Pengadilan_Agama_Yurisprudensi_MA_dan_Faraidh.pdf", "./rujukan/06_Buku_Lengkap_Waris_Patrilineal_Mazhab_Syafii_dan_Faraidh.pdf", "./rujukan/Hazairin_03_Rekonstruksi_Hukum_Waris_Islam_Perspektif_Hazairin.pdf", "./rujukan/Hazairin_04_Menakar_Esensi_Waris_Bilateral_Hazairin.pdf", "./rujukan/PA_01_Buku_II_Pedoman_Pelaksanaan_Tugas_dan_Administrasi_Peradilan_Agama_MA_RI.pdf", "./rujukan/PA_05_Kewenangan_Absolut_Peradilan_Agama_Sengketa_Waris_Komisi_Yudisial.pdf", "./rujukan/PA_06_Yurisprudensi_MA_Pembagian_Ahli_Waris_Pengganti.pdf", "./rujukan/PA_07_Ijtihad_Hakim_Peradilan_Agama_Bidang_Kewarisan_dan_Wasiat.pdf", "./rujukan/PA_09_Putusan_dan_Penetapan_PA_Waris_Beda_Agama_Jurnal_MA.pdf", "./rujukan/SEMA-1-2025.pdf", "./rujukan/SEMA-2-1994.pdf", "./rujukan/SEMA-3-2015.pdf", "./panduan/buku-panduan-faraidh-tiga-versi.pdf"];
const SIMPAN_SAAT_DIPAKAI=/\/(rujukan|panduan|screenshots|vendor)\/|\/bank-kasus\.js$/;
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    try{
      // no-cache memvalidasi respons server, bukan menyalin aset HTTP cache lama.
      await cache.addAll(INTI.map(url=>new Request(url,{cache:'no-cache'})));
    }catch(error){
      await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys(),lama=keys.filter(key=>key.startsWith('faraidh-')&&key!==CACHE&&key!==DOKUMEN);
    // PDF yang sudah tersimpan di versi sebelumnya dipindahkan, agar tidak diunduh ulang.
    try{
      const dok=await caches.open(DOKUMEN);
      for(const key of lama){
        const c=await caches.open(key);
        for(const url of PDF_RUJUKAN){
          if(await dok.match(url))continue;
          const r=await c.match(url);if(r&&r.status===200)await dok.put(url,r);
        }
      }
    }catch(e){}
    // Sejak 5.18.0: PDF yang tidak lagi disertakan paket (diganti tautan ke sumber asli) dihapus dari perangkat.
    try{
      const dok=await caches.open(DOKUMEN),daftar=new Set(PDF_RUJUKAN.map(u=>new URL(u,self.location).href));
      for(const req of await dok.keys()){const u=new URL(req.url);if(u.pathname.startsWith('/rujukan/')&&!daftar.has(u.origin+u.pathname))await dok.delete(req);}
    }catch(e){}
    await Promise.all(lama.map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
async function statusDokumen(){
  const c=await caches.open(DOKUMEN);let ada=0;
  for(const url of PDF_RUJUKAN)if(await c.match(url))ada++;
  return {type:'dokumen',selesai:ada,gagal:0,total:PDF_RUJUKAN.length,berjalan:false};
}
self.addEventListener('message',event=>{
  const pesan=event.data,asal=event.source;
  // Pembaruan hanya mengambil alih setelah pengguna memilih Muat ulang.
  if(pesan==='skipWaiting'){self.skipWaiting();return;}
  if(pesan==='status-dokumen'){event.waitUntil(statusDokumen().then(s=>asal&&asal.postMessage(s)));return;}
  if(pesan==='simpan-dokumen'){
    event.waitUntil((async()=>{
      const c=await caches.open(DOKUMEN);let selesai=0,gagal=0;
      for(const url of PDF_RUJUKAN){
        try{
          if(!(await c.match(url))){
            const r=await fetch(new Request(url,{cache:'no-cache'}));
            if(!r.ok||r.status!==200||r.redirected)throw new Error('HTTP '+r.status);
            await c.put(url,r);
          }
          selesai++;
        }catch(e){gagal++;}
        if(asal)asal.postMessage({type:'dokumen',selesai,gagal,total:PDF_RUJUKAN.length,berjalan:selesai+gagal<PDF_RUJUKAN.length});
      }
    })());
  }
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const response=await fetch(request);
      // Berkas besar disimpan saat pertama kali dipakai; permintaan sebagian (Range) tidak disimpan.
      // Alamat yang tidak ada dialihkan server ke halaman utama; hasil pengalihan tidak disimpan sebagai dokumen.
      if(response.status===200&&!response.redirected&&!request.headers.has('range')&&SIMPAN_SAAT_DIPAKAI.test(url.pathname)){
        const salinan=response.clone();
        event.waitUntil(caches.open(DOKUMEN).then(c=>c.put(request,salinan)).catch(()=>{}));
      }
      return response;
    }catch(error){
      if(request.mode==='navigate'){
        const index=await caches.match('./index.html');
        if(index)return index;
      }
      throw error;
    }
  })());
});
