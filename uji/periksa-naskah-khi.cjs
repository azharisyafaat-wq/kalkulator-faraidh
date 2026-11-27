// Uji naskah KHI dalam aplikasi (naskah/khi-kemenag-2018.md) dan pembacanya (naskah-khi.js).
// Pakai: node uji/periksa-naskah-khi.cjs
// - Pasal 1–229 ada tepat sekali dan berurutan; Pasal 124 dan 139 memang tidak dicetak dalam edisi Kemenag 2018.
// - Semua pasal berstatus "dicocokkan" (sejak 5.19.1); halaman PDF = halaman buku + 12 di bagian KHI.
// - Kutipan dalil KHI di index.html sama kata demi kata dengan teks pasal di naskah.
// - Penjelasan Pasal demi Pasal mencakup Pasal 1–229 (kecuali 186, sesuai cetakan).
'use strict';
const fs = require('fs');
const path = require('path');
const AKAR = path.join(__dirname, '..');
const md = fs.readFileSync(path.join(AKAR, 'naskah', 'khi-kemenag-2018.md'), 'utf8');
const js = fs.readFileSync(path.join(AKAR, 'naskah-khi.js'), 'utf8');
const html = fs.readFileSync(path.join(AKAR, 'index.html'), 'utf8');

const ambilFungsi = (src, nama) => {
  const i = src.indexOf('function ' + nama + '(');
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (!d) return src.slice(i, k + 1); } }
  throw new Error(nama + ' tidak ditemukan');
};
const urai = new Function(ambilFungsi(js, 'urai') + ';return urai;')();
const N = urai(md);

let gagal = 0, n = 0;
const cek = (nama, ok, rinci) => { n++; if (!ok) { gagal++; console.log('GAGAL: ' + nama + (rinci ? '\n   ' + rinci : '')); } };

const harap = []; for (let k = 1; k <= 229; k++) if (k !== 124 && k !== 139) harap.push(k);
cek('Pasal 1–229 berurutan, tanpa 124 dan 139', JSON.stringify(N.urutan) === JSON.stringify(harap),
  'urutan: ' + N.urutan.filter((x, i) => x !== harap[i]).slice(0, 10).join(', '));
cek('catatan Pasal 124 dan 139 tidak tercantum ada di naskah', /Pasal 124 tidak tercantum/.test(md) && /Pasal 139 tidak tercantum/.test(md));

const DIC = new Set(harap);   // sejak 5.19.1 semua pasal dicocokkan
const salahStatus = N.urutan.filter(k => (N.pasal[k].status === 'dicocokkan') !== DIC.has(k));
cek('semua pasal berstatus dicocokkan', !salahStatus.length, 'pasal: ' + salahStatus.slice(0, 10).join(', '));
const tanpaStatus = N.urutan.filter(k => !/^(dicocokkan|belum dicocokkan)$/.test(N.pasal[k].status));
cek('setiap pasal punya status', !tanpaStatus.length, tanpaStatus.join(', '));
const halamanSalah = N.urutan.filter(k => { const p = N.pasal[k]; return !/^\d+$/.test(p.hlm) || p.pdf - +p.hlm !== 12; });
cek('setiap pasal berhalaman buku berupa angka dan = halaman PDF − 12', !halamanSalah.length, halamanSalah.map(k => k + ' (hlm ' + N.pasal[k].hlm + ')').join(', '));
const penandaSalah = [...md.matchAll(/<!-- (?:pasal \d+ · )?hlm (\S+) · pdf (\d+)/g)].filter(m => !/^\d+$/.test(m[1]) || +m[2] - +m[1] !== 12);
cek('setiap penanda halaman berupa angka dan = halaman PDF − 12', !penandaSalah.length, penandaSalah.map(m => m[0]).join(' | '));
cek('Pasal 171 di hlm. 89 / pdf 101', N.pasal[171].hlm === '89' && N.pasal[171].pdf === 101);
cek('Pasal 215 di hlm. 111 / pdf 123', N.pasal[215].hlm === '111' && N.pasal[215].pdf === 123);

// struktur: judul Bagian tidak tergabung ke teks pasal; butir a./b./1./(1) tidak tergabung ke paragraf sebelumnya
cek('Pasal 82 berada di Bagian Kelima (judulnya tidak tergabung ke Pasal 81)', /^Bagian Kelima — Kewajiban Suami yang Beristeri/.test(N.pasal[82].bagian) && !N.pasal[81].blok.some(b => /Bagian Kelima/.test(b)));
const isiPasal = N.urutan.flatMap(k => N.pasal[k].blok.filter(b => !/^> /.test(b)).map(b => [k, b]));
const tergabung = isiPasal.filter(([, b]) => /(?:[:;]|-->)\s(?:\(\d{1,2}\)|[a-z]\.|\d{1,2}\.)\s[A-Za-z]|\bdan\s[a-z]\.\s[A-Za-z]/.test(b));
cek('tidak ada butir yang tergabung ke paragraf sebelumnya', !tergabung.length, tergabung.map(([k, b]) => 'Pasal ' + k + ': ' + b.slice(0, 80)).join(' | '));
cek('Pasal 1 huruf j berdiri sendiri', N.pasal[1].blok.some(b => /^j\. Mut'ah adalah/.test(b)));
// tanda baca hasil OCR: apostrof ganda, apostrof di awal kata, spasi sesudah apostrof di tengah kata
const apostrof = [...md.matchAll(/''|\s'[a-z]|\w' (?:in|itikad|an|ah|da|i)\b/g)].map(m => md.slice(Math.max(0, m.index - 20), m.index + 20));
cek('tidak ada apostrof hasil salah baca OCR', !apostrof.length, apostrof.join(' | '));
// catatan penyunting: salah cetak yang dapat memengaruhi makna
const CATATAN = { 70: 'kemenakan dan isteri', 96: 'Pembangian', 185: 'keterangan bertanda bintang', 197: 'surat wasiat dan pewasiat', 211: 'Hibah dan orang tua' };
for (const [k, kata] of Object.entries(CATATAN))
  cek('catatan penyunting Pasal ' + k, N.pasal[k].blok.some(b => /^> Catatan penyunting:/.test(b) && b.includes(kata)));
cek('catatan Pasal 70 huruf e mengutip Pasal 8 huruf e UU 1/1974', /kemenakan dari isteri, dalam hal seorang suami beristeri lebih dari seorang/.test(N.pasal[70].blok.join(' ')));

// kutipan dalil
const i = html.indexOf('const DALIL_ENTRIES={'); let d0 = 0, j = -1;
for (let k = i + 'const DALIL_ENTRIES='.length; k < html.length; k++) {
  const c = html[k];
  if (c === "'") { k = html.indexOf("'", k + 1); while (html[k - 1] === '\\') k = html.indexOf("'", k + 1); continue; }
  if (c === '{') d0++; else if (c === '}') { d0--; if (!d0) { j = k + 1; break; } }
}
const D = new Function('return ' + html.slice(i + 'const DALIL_ENTRIES='.length, j))();
const norm = s => s.replace(/<!--[^>]*-->/g, ' ').replace(/(^|\s)- /g, ' ').replace(/\s+/g, ' ').trim();
const teksPasal = k => norm(N.pasal[k].blok.filter(b => !/^(> |\\\*)/.test(b)).join(' '));
let dalil = 0;
for (const [kunci, d] of Object.entries(D)) {
  const m = kunci.match(/^khi(\d+)$/); if (!m) continue; dalil++;
  const a = norm(d.q), b = teksPasal(+m[1]);
  let x = 0; while (x < a.length && a[x] === b[x]) x++;
  cek('kutipan dalil ' + kunci + ' sama dengan naskah', a === b, 'berbeda mulai: «' + a.slice(x, x + 60) + '» / «' + b.slice(x, x + 60) + '»');
  cek('dalil ' + kunci + ' berhalaman buku yang sama dengan naskah', d.asli && parseInt(d.asli, 10) === +N.pasal[+m[1]].hlm, d.asli + ' / ' + N.pasal[+m[1]].hlm);
}
cek('ada kutipan dalil KHI yang diuji', dalil >= 10);

// penjelasan
const tertutup = new Set(); N.penjelasan.forEach(p => { for (let k = p.dari; k <= p.sampai; k++) tertutup.add(k); });
const takTertutup = []; for (let k = 1; k <= 229; k++) if (!tertutup.has(k)) takTertutup.push(k);
cek('Penjelasan Pasal demi Pasal mencakup 1–229 kecuali 186', JSON.stringify(takTertutup) === '[186]', takTertutup.join(', '));

// alamat PDF sama di index.html, naskah-khi.js, sw.js
const pdf = (js.match(/PDF_KHI = '([^']+)'/) || [])[1];
cek('alamat PDF KHI sama di index.html dan naskah-khi.js', pdf && html.includes("const KHI_PDF_URL='" + pdf + "'"));
cek('PDF KHI dan naskah tercantum di sw.js', /KHI_Kemenag_2018_Kompilasi_Hukum_Islam\.pdf/.test(fs.readFileSync(path.join(AKAR, 'sw.js'), 'utf8')) && /naskah\/khi-kemenag-2018\.md/.test(fs.readFileSync(path.join(AKAR, 'sw.js'), 'utf8')));

console.log(`Naskah KHI: ${n - gagal} / ${n} lulus (${N.urutan.length} pasal, ${[...DIC].length} dicocokkan, ${dalil} kutipan dalil)`);
process.exit(gagal ? 1 : 0);
