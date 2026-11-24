// Menguji mesin hitung di index.html tanpa peramban:
//  1. kasus baku dari kitab dan buku daras (uji/kasus-baku.json), mode Syafi'i, KHI, dan Hazairin;
//  2. seluruh bank contoh bawaan (bank-kasus.js).
// Pakai: node uji/periksa-mesin.cjs   (keluar dengan kode 1 bila ada yang tidak sesuai)
const fs = require('fs'), vm = require('vm'), path = require('path');
const akar = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(akar, 'index.html'), 'utf8');
const mesin = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('MESIN FARAIDH'));
if (!mesin) { console.error('Mesin hitung tidak ditemukan di index.html'); process.exit(1); }
const ctx = { window: {}, console }; vm.createContext(ctx);
vm.runInContext(mesin + '\n;this.fiqhEngine=fiqhEngine;this.hazairinEngine=hazairinEngine;', ctx);
vm.runInContext(fs.readFileSync(path.join(akar, 'bank-kasus.js'), 'utf8'), ctx);
const OPSI = { khi: { replacement: 'telaah', cap: 'ketat', raddSpouse: true, ayahRadd: false, musyarakah: true, sibMode: 'sema' }, haz: { gharrawain: false, raddSpouse: false }, syafii: { baitulmal: false, gharrawain: true } };
let nomor = 0; const id = p => p + (++nomor);
function keluarga(p) {
  const x = Object.assign({ sex: 'L', wives: 0, husband: false, father: false, mother: false, pgf: false, pgm: false, mgf: false, mgm: false, uncles: { pkK: 0, pkA: 0, apkK: 0, apkA: 0, bibiA: 0, pamanI: 0, bibiI: 0 } }, p);
  x.children = (p.children || []).map(c => Object.assign({ id: id('c'), alive: true, kL: 0, kP: 0 }, c));
  x.siblings = (p.siblings || []).map(s => Object.assign({ id: id('s'), alive: true, kL: 0, kP: 0 }, s));
  return x;
}
let gagal = 0, jumlah = 0;
for (const k of JSON.parse(fs.readFileSync(path.join(__dirname, 'kasus-baku.json'), 'utf8'))) {
  for (const [mode, harap] of Object.entries(k.harap)) {
    jumlah++; let r = null, galat = null;
    const opsi = Object.assign({}, OPSI[mode], k.opt && k.opt[mode]);
    try { r = mode === 'haz' ? ctx.hazairinEngine(keluarga(k.p), opsi) : ctx.fiqhEngine(keluarga(k.p), mode, opsi); } catch (e) { galat = e.message; }
    let cocok;
    if (harap === 'ditahan') cocok = !!galat;
    else {
      const dapat = {}; if (r) for (const row of r.rows) if (row.total.isPos) dapat[row.label] = (dapat[row.label] ? dapat[row.label].add(row.total) : row.total).toString();
      cocok = !galat && Object.keys(harap).length === Object.keys(dapat).length && Object.entries(harap).every(([a, v]) => dapat[a] === v);
      if (!cocok) console.log('TIDAK SESUAI', k.id, '[' + mode + ']', galat || JSON.stringify(dapat), 'harapan', JSON.stringify(harap));
    }
    if (!cocok) gagal++;
  }
}
console.log('Kasus baku:', jumlah - gagal, '/', jumlah, 'sesuai');
const bank = ctx.window.WARIS_CASES; let gagalBank = 0;
for (const k of bank) {
  let r; try { r = k.mode === 'hazairin' ? ctx.hazairinEngine(JSON.parse(JSON.stringify(k.input)), k.options) : ctx.fiqhEngine(JSON.parse(JSON.stringify(k.input)), k.mode, k.options); } catch (e) { gagalBank++; console.log('DITAHAN', k.id, e.message.slice(0, 120)); continue; }
  const dapat = {}; for (const i in r.alloc) if (r.alloc[i].isPos) dapat[i] = r.alloc[i].toString();
  const harap = Object.fromEntries(Object.entries(k.expected).map(([a, v]) => [a, v.total]).filter(([, v]) => v !== '0'));
  if (JSON.stringify(Object.keys(dapat).sort()) !== JSON.stringify(Object.keys(harap).sort()) || Object.keys(harap).some(a => dapat[a] !== harap[a])) { gagalBank++; console.log('TIDAK SESUAI', k.id, JSON.stringify(dapat), 'harapan', JSON.stringify(harap)); }
}
console.log('Bank contoh:', bank.length - gagalBank, '/', bank.length, 'sesuai');
process.exit(gagal || gagalBank ? 1 : 0);
