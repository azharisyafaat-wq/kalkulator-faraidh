#!/usr/bin/env node
// Membangun paket situs faraidh.syafaatlawfirm.com dari repositori ini.
//
// Repositori adalah satu-satunya sumber kode. Buku panduan dan PDF rujukan tidak disimpan di
// repositori; keduanya diambil dari folder dokumen terpisah (--dokumen) yang memuat panduan/ dan
// rujukan/. Hanya PDF yang tercantum di PDF_RUJUKAN (sw.js) yang ikut paket.
//
// Pakai:
//   node terbit/buat-paket.cjs --dokumen <folder> [--keluar <folder>] [--banding <paket-lama>]
//
// Pemeriksaan (paket tidak dibuat bila ada yang gagal):
//   - setiap berkas INTI di sw.js ada di repositori;
//   - setiap PDF di PDF_RUJUKAN ada di folder dokumen;
//   - setiap PDF yang ditautkan index.html dari situs sendiri tercantum di PDF_RUJUKAN;
//   - versi di judul index.html sama dengan versi CACHE di sw.js;
//   - label ukuran tombol "Simpan semua PDF rujukan (± X MB)" sesuai jumlah ukuran PDF.
// Hasil: folder paket, SHA256SUMS, dan (dengan --banding) daftar berkas yang berubah, baru, atau
// perlu dihapus dari server.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const AKAR = path.resolve(__dirname, '..');
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const dokumen = arg('--dokumen');
if (!dokumen) { console.error('Wajib: --dokumen <folder berisi panduan/ dan rujukan/>'); process.exit(2); }
const DOK = path.resolve(dokumen);

const html = fs.readFileSync(path.join(AKAR, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(AKAR, 'sw.js'), 'utf8');
const ambilDaftar = nama => { const m = sw.match(new RegExp('const ' + nama + '=(\\[[^\\]]*\\]);')); if (!m) throw new Error(nama + ' tidak ditemukan di sw.js'); return JSON.parse(m[1]); };
const INTI = ambilDaftar('INTI'), PDF = ambilDaftar('PDF_RUJUKAN');
const versiHtml = (html.match(/<title>[^<]*Pro v(\d+\.\d+\.\d+)/) || [])[1];
const versiSw = (sw.match(/const CACHE='faraidh-(\d+\.\d+\.\d+)-/) || [])[1];
const keluar = path.resolve(arg('--keluar') || path.join(AKAR, 'dist', 'paket-' + (versiHtml || 'x')));

// Berkas repositori yang ikut paket (selain dokumen). Folder disalin seluruhnya.
const REPO = ['.htaccess', 'index.html', 'sw.js', 'bank-kasus.js', 'manifest.webmanifest', 'sumber-hukum.json',
  'baca-saya.txt', 'hak-cipta.txt', 'lisensi-pihak-ketiga.txt', 'LICENSE', 'fonts', 'icons', 'vendor', 'screenshots'];

const galat = [], catatan = [];
const rel = u => u === './' ? 'index.html' : u.replace(/^\.\//, '');

for (const u of INTI) if (!fs.existsSync(path.join(AKAR, rel(u)))) galat.push('INTI tidak ada di repositori: ' + rel(u));
for (const u of PDF) if (!fs.existsSync(path.join(DOK, rel(u)))) galat.push('PDF_RUJUKAN tidak ada di folder dokumen: ' + rel(u));
const tertaut = new Set([...html.matchAll(/https:\/\/faraidh\.syafaatlawfirm\.com\/((?:rujukan|panduan)\/[^"'\s<>)]+\.pdf)/g)].map(m => m[1]));
const terdaftar = new Set(PDF.map(rel));
for (const t of tertaut) if (!terdaftar.has(t)) galat.push('index.html menautkan PDF yang tidak ada di PDF_RUJUKAN: ' + t);
for (const t of terdaftar) if (!tertaut.has(t)) catatan.push('PDF_RUJUKAN memuat PDF yang tidak ditautkan index.html: ' + t);
if (!versiHtml || versiHtml !== versiSw) galat.push(`Versi berbeda: judul index.html ${versiHtml}, CACHE sw.js ${versiSw}`);

let total = 0;
for (const u of PDF) { const f = path.join(DOK, rel(u)); if (fs.existsSync(f)) total += fs.statSync(f).size; }
const label = '± ' + (Math.round(total / 1e5) / 10).toFixed(1).replace('.', ',') + ' MB';
const labelHtml = [...html.matchAll(/Simpan semua PDF rujukan \((± [\d,]+ MB)\)/g)].map(m => m[1]);
if (!labelHtml.length) galat.push('Label tombol "Simpan semua PDF rujukan" tidak ditemukan di index.html');
else if (labelHtml.some(l => l !== label)) galat.push(`Label ukuran di index.html ${[...new Set(labelHtml)].join(', ')}; seharusnya ${label} (${total} byte)`);

for (const sub of ['rujukan', 'panduan']) {
  const d = path.join(DOK, sub); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (!terdaftar.has(sub + '/' + f)) catatan.push('Tidak ikut paket (tidak ada di PDF_RUJUKAN): ' + sub + '/' + f);
}

if (galat.length) { console.error('Paket tidak dibuat:\n- ' + galat.join('\n- ')); process.exit(1); }

fs.rmSync(keluar, { recursive: true, force: true });
fs.mkdirSync(keluar, { recursive: true });
const salin = (dari, ke) => {
  const st = fs.statSync(dari);
  if (st.isDirectory()) { fs.mkdirSync(ke, { recursive: true }); for (const f of fs.readdirSync(dari)) salin(path.join(dari, f), path.join(ke, f)); }
  else fs.copyFileSync(dari, ke);
};
for (const f of REPO) if (fs.existsSync(path.join(AKAR, f))) salin(path.join(AKAR, f), path.join(keluar, f));
for (const u of PDF) { const r = rel(u); fs.mkdirSync(path.dirname(path.join(keluar, r)), { recursive: true }); fs.copyFileSync(path.join(DOK, r), path.join(keluar, r)); }

const daftar = [];
const jelajah = d => { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) jelajah(p); else daftar.push(path.relative(keluar, p).split(path.sep).join('/')); } };
jelajah(keluar);
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(keluar, f))).digest('hex');
const sums = daftar.map(f => hash(f) + '  ' + f);
fs.writeFileSync(path.join(keluar, 'SHA256SUMS'), sums.join('\n') + '\n');

console.log(`Paket ${versiHtml} → ${keluar}`);
console.log(`${daftar.length} berkas; ${PDF.length} PDF (${label}); CACHE sw.js ${(sw.match(/const CACHE='([^']+)'/) || [])[1]}`);
for (const c of catatan) console.log('Catatan: ' + c);

const banding = arg('--banding');
if (banding) {
  const B = path.resolve(banding), lama = new Set();
  const jl = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) jl(p); else lama.add(path.relative(B, p).split(path.sep).join('/')); } };
  jl(B);
  const sama = f => lama.has(f) && crypto.createHash('sha256').update(fs.readFileSync(path.join(B, f))).digest('hex') === hash(f);
  const ubah = daftar.filter(f => f !== 'SHA256SUMS' && !sama(f));
  const hapus = [...lama].filter(f => !daftar.includes(f) && !['SHA256SUMS', 'daftar.txt', 'BACA.txt'].includes(f)).sort();
  console.log(`\nDibanding ${B}:`);
  console.log(`Unggah (${ubah.length} berkas baru/berubah):\n` + ubah.map(f => '  ' + f).join('\n'));
  console.log(`Hapus dari server (${hapus.length}):\n` + (hapus.map(f => '  ' + f).join('\n') || '  -'));
}
