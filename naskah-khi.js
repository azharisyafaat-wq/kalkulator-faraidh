/* Naskah KHI dalam aplikasi (sejak 5.19.0).
   Sumber: naskah/khi-kemenag-2018.md, disusun dari pindaian resmi "Kompilasi Hukum Islam di Indonesia" (Kemenag 2018)
   dengan markitdown lalu dirapikan; lihat kepala berkas itu untuk cara penyusunan dan status pencocokan tiap pasal.
   - Penampil pasal: teks, status pencocokan, halaman buku dan PDF, penjelasan pasal, tombol ke pindaian.
   - Rujukan "Pasal N" / "Ps. N" di hasil KHI menjadi tombol yang membuka pasal itu.
   Berkas ini tidak mengubah perhitungan. */
(function () {
  'use strict';
  var NASKAH_URL = './naskah/khi-kemenag-2018.md';
  var PDF_KHI = 'https://faraidh.syafaatlawfirm.com/rujukan/KHI_Kemenag_2018_Kompilasi_Hukum_Islam.pdf';
  var data = null, janji = null, dlg = null, kini = 171;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /* --- membaca naskah -------------------------------------------------------------------------- */
  function urai(md) {
    var pasal = {}, urutan = [], penjelasan = [], buku = '', bab = '', bagian = '', dok = 'kepala', cur = null, pj = null, hlm = '-', pdf = 0;
    md.split(/\n{2,}/).forEach(function (b) {
      b = b.trim(); if (!b) return;
      var m = b.match(/^<!-- hlm (\S+) · pdf (\d+) -->$/);
      if (m) { hlm = m[1]; pdf = +m[2]; return; }
      if (/^<!-- naskah /.test(b)) return;
      if ((m = b.match(/^## (.+)$/))) {
        cur = null; pj = null;
        if (/^BUKU/.test(m[1])) { dok = 'khi'; buku = m[1]; bab = ''; bagian = ''; }
        else if (/^PENJELASAN/.test(m[1])) dok = 'penjelasan';
        else dok = 'lain';
        return;
      }
      if (dok === 'kepala' || dok === 'lain') return;
      if ((m = b.match(/^### (.+)$/))) { bab = m[1]; bagian = ''; cur = null; pj = null; return; }
      if (dok === 'penjelasan') {
        if ((m = b.match(/^#### Pasal (\d+)(?:\s*s\/d\s*(\d+))?$/))) {
          pj = { dari: +m[1], sampai: +(m[2] || m[1]), judul: m[0].slice(5), blok: [], hlm: hlm };
          penjelasan.push(pj);
        } else if (pj) pj.blok.push(b);
        return;
      }
      if ((m = b.match(/^#### (.+)$/))) { bagian = m[1]; cur = null; return; }
      if ((m = b.match(/^##### Pasal (\d+)$/))) {
        cur = { n: +m[1], buku: buku, bab: bab, bagian: bagian, blok: [], hlm: hlm, pdf: pdf, status: '' };
        pasal[cur.n] = cur; urutan.push(cur.n);
        return;
      }
      if (cur && (m = b.match(/^<!-- pasal \d+ · hlm (\S+) · pdf (\d+) · (.+) -->$/))) {
        cur.hlm = m[1]; cur.pdf = +m[2]; cur.status = m[3];
        return;
      }
      if (cur) cur.blok.push(b);
    });
    return { pasal: pasal, urutan: urutan, penjelasan: penjelasan };
  }

  function muat() {
    if (data) return Promise.resolve(data);
    if (!janji) {
      janji = fetch(NASKAH_URL).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (t) { data = urai(t); return data; });
      janji.catch(function () { janji = null; });
    }
    return janji;
  }

  /* --- tampilan --------------------------------------------------------------------------------- */
  function inline(s) {
    // penanda halaman di dalam paragraf menjadi label kecil; teks lain di-escape
    var out = '', last = 0, re = /<!-- hlm (\S+) · pdf (\d+) -->/g, m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index)) + '<span class="khi-hlm" title="Halaman buku ' + esc(m[1]) + ' (PDF ' + m[2] + ')">hlm. ' + esc(m[1]) + '</span>';
      last = re.lastIndex;
    }
    return out + esc(s.slice(last)).replace(/^\\\*/, '*');
  }
  function blokHTML(b) {
    if (/^> /.test(b)) return '<p class="khi-catatan">' + inline(b.slice(2)) + '</p>';
    if (/^- /.test(b)) return '<p class="khi-strip">' + inline(b.slice(2)) + '</p>';
    if (/^(\(\d+\)|[a-z]\.|\d+\.)\s/.test(b)) return '<p class="khi-butir">' + inline(b) + '</p>';
    return '<p>' + inline(b) + '</p>';
  }
  function penjelasanUntuk(n) {
    return data.penjelasan.filter(function (p) { return n >= p.dari && n <= p.sampai; });
  }

  function siapkanDialog() {
    if (dlg) return dlg;
    var st = document.createElement('style');
    st.textContent =
      '#khi-naskah{max-width:680px;width:calc(100vw - 32px);max-height:calc(100vh - 32px);border:1px solid var(--rule-2);border-radius:14px;padding:0;background:var(--sheet);color:var(--ink);box-shadow:0 18px 48px rgba(0,0,0,.25)}' +
      '#khi-naskah::backdrop{background:rgba(15,25,18,.45)}' +
      '#khi-naskah .khi-kop{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px 8px;position:sticky;top:0;background:var(--sheet);z-index:1;border-bottom:1px solid var(--rule)}' +
      '#khi-naskah h3{margin:0;font-size:1.05em}#khi-naskah .khi-x{border:0;background:transparent;font-size:26px;line-height:1;cursor:pointer;color:inherit;padding:2px 8px;min-width:40px;min-height:40px}' +
      '#khi-naskah .khi-cari{display:flex;gap:8px;padding:10px 18px 0;flex-wrap:wrap}#khi-naskah .khi-cari input{flex:1 1 200px;min-height:40px}' +
      '#khi-naskah .khi-isi{padding:6px 18px 18px}#khi-naskah .khi-jalur{font-size:.84em;color:var(--ink-2);margin:10px 0 2px}' +
      '#khi-naskah h4{margin:4px 0 6px;font-size:1.15em}#khi-naskah .khi-status{display:inline-block;font-size:.78em;padding:2px 9px;border-radius:99px;margin-left:6px;vertical-align:middle;font-weight:500}' +
      '#khi-naskah .khi-status.ok{background:var(--pine-soft);color:var(--pine)}#khi-naskah .khi-status.cek{background:var(--brass-soft);color:var(--ink)}' +
      '#khi-naskah .khi-teks p{margin:0 0 8px;line-height:1.6}#khi-naskah .khi-butir{padding-left:1.6em;text-indent:-1.6em}#khi-naskah .khi-strip{padding-left:2.6em;text-indent:-1em}#khi-naskah .khi-strip::before{content:"– "}' +
      '#khi-naskah .khi-catatan{font-size:.88em;color:var(--ink-2);border-left:3px solid var(--brass);padding:4px 10px;background:var(--brass-soft)}' +
      '#khi-naskah .khi-hlm{font-size:.72em;color:var(--ink-3);border:1px solid var(--rule);border-radius:6px;padding:0 4px;margin:0 2px;white-space:nowrap}' +
      '#khi-naskah .khi-pj{margin:12px 0 0;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;font-size:.92em}#khi-naskah .khi-pj b{display:block;margin-bottom:4px}' +
      '#khi-naskah .khi-aksi{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center}#khi-naskah .khi-aksi button{min-height:40px}' +
      '#khi-naskah .khi-sumber{font-size:.8em;color:var(--ink-2);margin:14px 0 0}' +
      '#khi-naskah .khi-hasil{list-style:none;margin:10px 0 0;padding:0}#khi-naskah .khi-hasil li{margin:0 0 6px}#khi-naskah .khi-hasil button{text-align:left;width:100%;min-height:40px;border:1px solid var(--rule);border-radius:10px;background:transparent;color:inherit;padding:8px 10px;cursor:pointer;font:inherit}' +
      '#khi-naskah .khi-hasil small{display:block;color:var(--ink-2)}' +
      '.khi-ps{border:0;background:none;padding:0;font:inherit;color:var(--pine);text-decoration:underline dotted;text-underline-offset:2px;cursor:pointer}.khi-ps:focus-visible{outline:2px solid var(--pine);outline-offset:1px}';
    document.head.appendChild(st);
    dlg = document.createElement('dialog');
    dlg.id = 'khi-naskah';
    dlg.setAttribute('aria-label', 'Naskah Kompilasi Hukum Islam');
    dlg.innerHTML =
      '<div class="khi-kop"><h3>Naskah KHI · Kemenag 2018</h3><button type="button" class="khi-x" aria-label="Tutup naskah">×</button></div>' +
      '<form class="khi-cari" role="search"><input type="search" name="q" placeholder="Nomor pasal atau kata, mis. 185 atau wasiat wajibah" aria-label="Cari pasal atau kata dalam KHI"><button type="submit" class="btn">Cari</button></form>' +
      '<div class="khi-isi" aria-live="polite"></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('.khi-x')) { dlg.close(); return; }
      var b = e.target.closest('[data-khi-ke]'); if (b) { tampil(+b.getAttribute('data-khi-ke')); return; }
      var s = e.target.closest('[data-khi-pindai]');
      if (s) { dlg.close(); if (typeof window.openDoc === 'function') window.openDoc(PDF_KHI, +s.getAttribute('data-khi-pindai')); else window.open(PDF_KHI + '#page=' + s.getAttribute('data-khi-pindai'), '_blank', 'noopener'); }
    });
    dlg.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      cari(dlg.querySelector('input').value);
    });
    return dlg;
  }

  function isi(html) { dlg.querySelector('.khi-isi').innerHTML = html; dlg.querySelector('.khi-isi').scrollTop = 0; }

  function tampil(n) {
    kini = n;
    var p = data.pasal[n], u = data.urutan, i = u.indexOf(n);
    var sebelum = i > 0 ? u[i - 1] : (p ? null : u.filter(function (x) { return x < n; }).pop());
    var sesudah = i >= 0 && i < u.length - 1 ? u[i + 1] : (p ? null : u.filter(function (x) { return x > n; })[0]);
    var nav = '<div class="khi-aksi">' +
      (sebelum ? '<button type="button" class="btn" data-khi-ke="' + sebelum + '">‹ Pasal ' + sebelum + '</button>' : '') +
      (sesudah ? '<button type="button" class="btn" data-khi-ke="' + sesudah + '">Pasal ' + sesudah + ' ›</button>' : '') + '</div>';
    if (!p) {
      isi('<h4>Pasal ' + n + '</h4><p>' + (n === 124 || n === 139
        ? 'Pasal ' + n + ' tidak tercantum dalam edisi Kemenag 2018: naskahnya melompat dari Pasal ' + (n - 1) + ' ke Pasal ' + (n + 1) + '. Salinan edisi Departemen Agama 2001 juga tidak memuatnya.'
        : 'Kompilasi Hukum Islam memuat Pasal 1 sampai Pasal 229.') + '</p>' + nav);
      return;
    }
    var ok = p.status === 'dicocokkan';
    var pj = penjelasanUntuk(n).map(function (x) {
      return '<div class="khi-pj"><b>Penjelasan (' + esc(x.judul) + ')</b>' + x.blok.map(blokHTML).join('') + '</div>';
    }).join('');
    isi('<p class="khi-jalur">' + [p.buku, p.bab, p.bagian].filter(Boolean).map(esc).join(' · ') + '</p>' +
      '<h4>Pasal ' + n + '<span class="khi-status ' + (ok ? 'ok' : 'cek') + '">' + (ok ? 'Dicocokkan dengan pindaian' : 'Belum dicocokkan') + '</span></h4>' +
      '<div class="khi-teks">' + p.blok.map(blokHTML).join('') + '</div>' + pj +
      (ok ? '' : '<p class="khi-catatan">Teks pasal ini berasal dari OCR yang dirapikan dan belum dicocokkan kata demi kata. Periksa pindaiannya sebelum mengutip.</p>') +
      '<div class="khi-aksi"><button type="button" class="btn" data-khi-pindai="' + p.pdf + '">Lihat pindaian (hlm. ' + esc(p.hlm) + ')</button></div>' + nav +
      '<p class="khi-sumber">Kompilasi Hukum Islam di Indonesia, Direktorat Bina KUA dan Keluarga Sakinah, Kemenag RI, 2018, hlm. ' + esc(p.hlm) + '. Teks dalam aplikasi disusun dari pindaian ini; redaksi resmi mengikuti naskah yang disebarluaskan.</p>');
  }

  function cari(q) {
    q = String(q || '').trim();
    var m = q.match(/^(?:pasal|ps\.?)?\s*(\d{1,3})$/i);
    if (m) { tampil(+m[1]); return; }
    if (q.length < 3) { isi('<p>Tulis nomor pasal atau sedikitnya tiga huruf.</p>'); return; }
    var kata = q.toLowerCase(), hasil = [];
    data.urutan.forEach(function (n) {
      var t = data.pasal[n].blok.join(' ').replace(/<!--[^>]*-->/g, ' ').replace(/\s+/g, ' ');
      var i = t.toLowerCase().indexOf(kata);
      if (i >= 0) hasil.push({ n: n, cuplik: (i > 40 ? '…' : '') + t.slice(Math.max(0, i - 40), i + kata.length + 60) + '…' });
    });
    isi('<p>' + (hasil.length ? hasil.length + ' pasal memuat “' + esc(q) + '”' + (hasil.length > 40 ? '; 40 yang pertama ditampilkan' : '') + '.' : 'Tidak ada pasal yang memuat “' + esc(q) + '”.') + '</p>' +
      '<ul class="khi-hasil">' + hasil.slice(0, 40).map(function (h) {
        return '<li><button type="button" data-khi-ke="' + h.n + '"><b>Pasal ' + h.n + '</b><small>' + esc(h.cuplik) + '</small></button></li>';
      }).join('') + '</ul>');
  }

  function buka(n) {
    siapkanDialog();
    isi('<p>Memuat naskah KHI…</p>');
    if (!dlg.open) dlg.showModal();
    muat().then(function () { tampil(n || kini); }).catch(function () {
      isi('<p>Naskah KHI belum dapat dimuat. Periksa sambungan internet, atau buka <a href="' + PDF_KHI + '" target="_blank" rel="noopener">pindaian resmi (PDF)</a>.</p>');
    });
  }

  /* --- rujukan pasal di hasil KHI menjadi tombol ------------------------------------------------- */
  var RE = /\b(Pasal|Ps\.)\s*(\d{1,3})(\s*[–-]\s*(\d{1,3}))?/g;
  function tautkan(akar) {
    if (!akar) return;
    var jalan = document.createTreeWalker(akar, NodeFilter.SHOW_TEXT, {
      acceptNode: function (t) {
        if (!t.nodeValue || !/(Pasal|Ps\.)\s*\d/.test(t.nodeValue)) return NodeFilter.FILTER_REJECT;
        return t.parentElement && t.parentElement.closest('button,a,script,style,.khi-ps') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var simpul = []; while (jalan.nextNode()) simpul.push(jalan.currentNode);
    simpul.forEach(function (t) {
      var s = t.nodeValue, frag = document.createDocumentFragment(), last = 0, m, ada = false;
      RE.lastIndex = 0;
      while ((m = RE.exec(s))) {
        var a = +m[2], b = m[4] ? +m[4] : null, sesudah = s.slice(RE.lastIndex, RE.lastIndex + 24);
        // hanya pasal KHI: bukan pasal undang-undang atau peraturan lain
        if (a < 1 || a > 229 || /^\s*(ayat \(\d+\)\s*(huruf [a-z]\s*)?)?(UU|Undang|PP|Peraturan|Perma|PERMA)/.test(sesudah)) continue;
        frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        frag.appendChild(tombol(m[1] + ' ' + a, a));
        if (b && b > a && b <= 229) {
          frag.appendChild(document.createTextNode(m[3].replace(/\d+$/, '')));
          frag.appendChild(tombol(String(b), b));
        } else if (m[3]) frag.appendChild(document.createTextNode(m[3]));
        last = RE.lastIndex; ada = true;
      }
      if (!ada) return;
      frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  function tombol(label, n) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'khi-ps'; b.textContent = label;
    b.setAttribute('data-khi-pasal', n);
    b.setAttribute('title', 'Baca Pasal ' + n + ' dalam naskah KHI');
    return b;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-khi-pasal]');
    if (b) {
      e.preventDefault();
      var d = b.closest('dialog'); if (d && d.open && d.id !== 'khi-naskah') d.close();
      buka(+b.getAttribute('data-khi-pasal'));
      return;
    }
    var a = e.target.closest('a[href="#naskah-khi"]');
    if (a) { e.preventDefault(); buka(171); }
  });

  function amati() {
    var akar = document.getElementById('out-khi'); if (!akar) return;
    var tunda = null;
    tautkan(akar);
    new MutationObserver(function () {
      clearTimeout(tunda);
      tunda = setTimeout(function () { tautkan(akar); }, 30);
    }).observe(akar, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', amati); else amati();
  if (location.hash === '#naskah-khi') buka(171);

  window.NaskahKHI = { buka: buka, muat: muat, urai: urai, tautkan: tautkan, PDF: PDF_KHI };
})();
