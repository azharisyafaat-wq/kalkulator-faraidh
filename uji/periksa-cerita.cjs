// Uji pembaca cerita keluarga (parseCeritaBebas) di index.html.
// Pakai: node uji/periksa-cerita.cjs [index.html]
// Setiap kasus memeriksa bidang yang diusulkan dan pertanyaan yang diajukan.
// Pembaca cerita hanya mengusulkan; bila ragu ia bertanya, bukan menebak.
'use strict';
const fs = require('fs');
const path = require('path');
const berkas = process.argv[2] || path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(berkas, 'utf8');
const i = html.indexOf('function parseCeritaBebas(');
if (i < 0) { console.error('parseCeritaBebas tidak ditemukan'); process.exit(1); }
let d = 0, j = html.indexOf('{', i), akhir = -1;
for (let k = j; k < html.length; k++) { if (html[k] === '{') d++; else if (html[k] === '}') { d--; if (!d) { akhir = k + 1; break; } } }
const baca = new Function(html.slice(i, akhir) + ';return parseCeritaBebas;')();

const ringkas = r => {
  const f = r.fields;
  return {
    sex: f.sex, wives: f.wives, husband: f.husband, father: f.father, mother: f.mother,
    anak: (f.children || []).map(c => c.sex).join(''),
    saudara: (f.siblings || []).map(x => x.type + x.sex).join(','),
    penulisSaudara: f.selfSib ? (f.selfSib.sex || '?') : undefined,
    tanya: r.questions.map(q => q.id),
    asumsi: r.assumptions.join(' | '),
    bisa: r.canApply
  };
};

const KASUS = [
  { cerita: 'Almarhumah kakak perempuan saya tidak punya anak. Suaminya masih hidup, ibu kami masih hidup, dan saya adik laki-lakinya.',
    harap: { sex: 'P', husband: true, mother: true, saudara: '', penulisSaudara: 'L' },
    tanya: ['father', 'selfSib', 'siblings'], tidakTanya: ['sex'] },
  { cerita: 'Kakak saya meninggal. Ia tidak menikah. Ayah dan ibu kami sudah meninggal. Saya adiknya.',
    harap: { father: false, mother: false, penulisSaudara: '?' }, tanya: ['sex', 'selfSib', 'siblings'] },
  { cerita: 'Kakak laki-laki saya meninggal tanpa istri dan anak. Orang tua kami sudah wafat. Saya adik perempuannya dan ada 1 adik laki-laki lagi.',
    harap: { sex: 'L', wives: 0, father: false, mother: false, saudara: 'KL', penulisSaudara: 'P' }, tanya: ['selfSib'], tidakTanya: ['siblings'] },
  { cerita: 'Ayah saya meninggal dunia. Ia meninggalkan istri (ibu saya), saya anak laki-laki, dan adik perempuan saya. Kakek dan nenek sudah wafat.',
    harap: { sex: 'L', wives: 1, father: false, mother: false, anak: 'LP' }, tidakTanya: ['father', 'mother'], asumsi: /orang tua ayah Anda/ },
  { cerita: 'Ibu saya meninggal. Ayah masih hidup. Kakek dan nenek masih hidup. Saya anak perempuan tunggal.',
    harap: { sex: 'P', husband: true, father: true, mother: true, anak: 'P' }, asumsi: /orang tua ibu Anda/ },
  { cerita: 'Ayah saya meninggal, meninggalkan ibu saya dan saya anak laki-laki. Kakek dari pihak ibu sudah meninggal.',
    harap: { sex: 'L', wives: 1, anak: 'L' }, tanya: ['father', 'mother'] },
  { cerita: 'Ayah saya meninggal bulan lalu. Beliau meninggalkan ibu saya, saya (anak laki-laki), dan dua adik perempuan saya. Kakek dan nenek dari pihak ayah sudah lama meninggal. Rumah senilai Rp800 juta dibeli selama pernikahan, tabungan Rp200 juta, dan utang Rp50 juta.',
    harap: { sex: 'L', wives: 1, father: false, mother: false, anak: 'LPP' }, tidakTanya: ['father', 'mother', 'selfSib'] },
  { cerita: 'Suami saya wafat. Kami punya dua anak perempuan. Mertua laki-laki (ayah suami) masih hidup. Harta rumah 600 juta.',
    harap: { sex: 'L', wives: 1, father: true, anak: 'PP' }, tanya: ['mother', 'siblings', 'hartaType'] }
];

let gagal = 0;
KASUS.forEach((k, n) => {
  const r = ringkas(baca(k.cerita)); const salah = [];
  for (const [kunci, v] of Object.entries(k.harap)) if (r[kunci] !== v) salah.push(`${kunci}: ${JSON.stringify(r[kunci])} ≠ ${JSON.stringify(v)}`);
  for (const q of k.tanya || []) if (!r.tanya.includes(q)) salah.push(`tidak menanyakan ${q}`);
  for (const q of k.tidakTanya || []) if (r.tanya.includes(q)) salah.push(`menanyakan ${q}`);
  if (k.asumsi && !k.asumsi.test(r.asumsi)) salah.push(`asumsi tidak memuat ${k.asumsi}`);
  if (!r.bisa) salah.push('tidak dapat diterapkan');
  if (salah.length) { gagal++; console.log(`GAGAL ${n + 1}: ${k.cerita}\n   ${salah.join('\n   ')}`); }
});
console.log(`Cerita: ${KASUS.length - gagal} / ${KASUS.length} sesuai`);
process.exit(gagal ? 1 : 0);
