"""Susun naskah KHI (Markdown) dari keluaran markitdown per halaman.

Pakai: python3 terbit/naskah-khi/susun_md.py terbit/naskah-khi/halaman-markitdown.json naskah/khi-kemenag-2018.md

Masukan:
- halaman-markitdown.json: {nomor halaman PDF: teks}, keluaran md_per_halaman.py (markitdown 0.1.9) atas pindaian
  "Kompilasi Hukum Islam di Indonesia" (Kemenag 2018, SHA-256 322fe34a…a2e3);
- koreksi.json: koreksi kata demi kata hasil pencocokan dengan pindaian, [halaman PDF, teks lama, teks baru];
- ganti_halaman.json: halaman yang ditulis ulang dari pindaian karena urutan teks OCR-nya kacau.
Keluaran: Markdown dengan judul Buku/Bab/Bagian/Pasal, penanda halaman, status pencocokan tiap pasal.
Hasilnya byte-identik bila masukan tidak berubah; CI memeriksanya.
"""
import json, re, sys, os, collections

h = {int(k): v for k, v in json.load(open(sys.argv[1])).items()}
out = sys.argv[2]

KHI = range(13, 135)        # Buku I–III (Pasal 1–229)
PENJELASAN = range(135, 141)
INPRES = range(251, 254)
KMA = range(255, 261)

# --- koreksi OCR sistematis (kata utuh) -----------------------------------------------------------
semua = ' '.join(h[p] for p in list(KHI) + list(PENJELASAN))
frek = collections.Counter(w.lower() for w in re.findall(r'[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*', semua))
GANTI = {}
# Salah baca OCR yang berulang. h terbaca untuk b, 1 untuk l, ij/tj untuk rj (teijadi, petjodohan): kata diganti bila bentuk perbaikannya muncul
# jauh lebih sering di naskah yang sama (paling sedikit 3 kali dan 3 kali lipat). rn/m tidak memakai aturan
# frekuensi karena salah bacanya berlaku dua arah (pemah/pernah, suarni/suami); daftarnya ditulis satu per satu.
for w, n in list(frek.items()):
    if len(w) < 3:
        continue
    for a, b2 in (('h', 'b'), ('1', 'l'), ('ij', 'rj'), ('tj', 'rj')):
        i = w.find(a)
        while i >= 0:
            y = w[:i] + b2 + w[i + len(a):]
            if frek.get(y, 0) >= max(3, 3 * n) and w not in GANTI:
                GANTI[w] = y
            i = w.find(a, i + 1)
for w in ('dalarn agarna suarni hukurn bersarna rnempunyai selarna sarna rurnah rnerupakan sarnpai rnungkin rnaksud '
          'rnengucapkan enarn rnengikrarkan perdarnaian rnenjatuhkan rnernpunyai rnenasehati mahkarnah').split():
    GANTI[w] = w.replace('rn', 'm')
GANTI.update({'bemilai': 'bernilai', 'mantaat': 'manfaat', 'lkrar': 'ikrar', 'lsi': 'isi', 'diwakatkannya': 'diwakafkannya', 'umsan': 'urusan',
              'petwalian': 'perwalian', 'petwaliannya': 'perwaliannya', 'hawah': 'bawah', 'pemahuk': 'pemabuk', 'pemhoros': 'pemboros',
              'haiknya': 'baiknya', 'himhingan': 'bimbingan', 'memhehani': 'membebani', 'kerahatnya': 'kerabatnya', 'tetjadinya': 'terjadinya',
              '1ampau': 'lampau', 'pemyataan': 'pernyataan', 'ljab': 'ijab', 'bah': 'bab', 'eaton': 'calon', 'besamya': 'besarnya', 'pemah': 'pernah', 'pemikahan': 'pernikahan', 'lahimya': 'lahirnya',
              # ri terbaca n, u terbaca n/rn, b terbaca h: ditemukan saat pencocokan Buku II dengan pindaian
              'wans': 'waris', 'pewans': 'pewaris', 'wansan': 'warisan', 'barn': 'baru', 'sating': 'saling',
              'masmg': 'masing', 'heherapa': 'beberapa', 'melehihi': 'melebihi', 'diamhil': 'diambil', 'jenazab': 'jenazah',
              'dihuat': 'dibuat', 'mencahut': 'mencabut', 'sehah': 'sebab', 'herdasartkan': 'berdasartkan'})
GANTI.update({'hila': 'bila', 'lbu': 'ibu', 'lsteri': 'isteri', 'lnstruksi': 'instruksi', 'lnstansi': 'instansi',
              'hokum': 'hukum', 'ada1ah': 'adalah', 'peradi1an': 'peradilan', '1ingkungan': 'lingkungan',
              'pe1aksanaan': 'pelaksanaan', 'repub1ik': 'republik', 'kompi1asi': 'kompilasi', 'cukupjelas': 'cukup jelas',
              'temyata': 'ternyata', 'tetjadi': 'terjadi', 'besamya': 'besarnya', 'mahkarnah': 'mahkamah',
              'menyempumakan': 'menyempurnakan', 'hams': 'harus'})


def betulkan_kata(m):
    w = m.group(0)
    y = GANTI.get(w.lower())
    if not y:
        return w
    if w.isupper():
        return y.upper()
    if w[0] == 'l' and y[0] == 'i':     # huruf I besar terbaca l kecil (lbu, lsteri, lnstruksi)
        return y[0].upper() + y[1:]
    if w[0].isupper():
        return y[0].upper() + y[1:]
    return y


def betulkan(s):
    s = re.sub(r'[A-Za-z0-9]+', betulkan_kata, s)
    s = re.sub(r'\(\s*([0-9Il]{1,2})\s*[)}]', lambda m: '(' + m.group(1).replace('I', '1').replace('l', '1') + ')', s)
    s = s.replace('\u200b', '')
    s = re.sub(r'^I\.\s', '1. ', s)
    s = re.sub(r'\bcal on\b', 'calon', s)
    s = re.sub(r'\bNo\.( ?)I\b', r'No.\g<1>1', s)            # nomor 1 terbaca I
    s = re.sub(r'\bI(?=\d)', '1', s)                         # I974, I2
    s = re.sub(r'(?<=\d)I\b', '1', s)
    s = re.sub(r'\b([Pp]asal)(\d)', r'\1 \2', s)              # pasal5 -> pasal 5
    s = re.sub(r'\bN ikah\b', 'Nikah', s)
    s = re.sub(r'\bbel urn\b', 'belum', s)
    s = re.sub(r'\bse(\w+) \1nya\b', r'se\1-\1nya', s)          # sekurang kurangnya -> sekurang-kurangnya
    s = re.sub(r'\blO\b', '10', s)                 # nomor butir 1 terbaca I
    s = re.sub(r'\s+([,;:])(?=\s|$)', r'\1', s)       # spasi sebelum tanda baca
    return s


ROMAWI = r'[IVXL]+'


def angka_ocr(s):
    return int(s.replace(' ', '').replace('i', '1').replace('l', '1').replace('I', '1').replace('O', '0').replace('o', '0'))


# Nomor halaman yang tidak terbaca (atau salah terbaca, "Ill") oleh OCR; dibaca pada kaki halaman pindaian
# (27-11-2026). Semuanya sama dengan halaman PDF dikurangi 12.
HLM_PINDAIAN = {13: '1', 22: '10', 34: '22', 54: '42', 76: '64', 80: '68', 84: '72', 123: '111', 256: '244'}


# --- baca halaman: buang nomor halaman di kaki, catat nomor halaman asli --------------------------
def halaman(rentang):
    for p in rentang:
        baris = [b.strip() for b in h[p].splitlines()]
        baris = [b for b in baris if b]
        asli = None
        if baris and re.fullmatch(r'[0-9IVXlvix]{1,4}', baris[-1]):
            asli = baris.pop()
        asli = HLM_PINDAIAN.get(p, asli)
        yield p, asli, baris


def blok_dari(baris):
    """Gabungkan baris menjadi paragraf; ayat (1), huruf a., dan angka 1. memulai paragraf baru."""
    blok = []
    for b in baris:
        if b.startswith('<!-- hlm '):
            if blok:
                blok[-1] += ' ' + b
            else:
                blok.append(b)
            continue
        b = betulkan(b)
        mulai = (not blok or re.match(r'^\(\d{1,2}\)', b) or re.match(r'^\([a-z]\)\s', b) or re.match(r'^[a-z]\.\s', b) or re.match(r'^\d{1,2}\.\s', b))
        if blok and re.search(r'\b(ayat|Pasal|pasal)$', blok[-1]):   # "... dalam ayat / (1) pasal ini" bukan ayat baru
            mulai = False
        if mulai or blok[-1].startswith('<!-- hlm ') and blok[-1].endswith('-->') and not re.search(r'[A-Za-z]', blok[-1].split('-->')[-1]) and False:
            blok.append(b)
        elif blok[-1].endswith('-->'):
            blok[-1] += ' ' + b
        else:
            blok[-1] = sambung(blok[-1], b)
    return blok


def sambung(a, b):
    """Gabung dua baris. OCR membuang tanda hubung di akhir baris: "masing-/masing" terbaca "masing masing",
    "sebagai-/mana" terbaca "sebagai mana". Kata ulang diberi tanda hubung; kata yang terpotong digabung bila
    bentuk gabungannya muncul di naskah."""
    ma, mb = re.search(r'([A-Za-z]+)$', a), re.match(r'([A-Za-z]+)', b)
    if ma and mb:
        x, y = ma.group(1), mb.group(1)
        if x.lower() == y.lower() or (y.lower().startswith(x.lower()) and y.lower()[len(x):] in ('nya', 'an', 'kan', 'i')) \
                or (len(y) >= 3 and x.lower().endswith(y.lower()) and x.lower()[:-len(y)] in ('ber', 'se', 'ke', 'di', 'me', 'pe')):
            return a + '-' + b
        if frek.get((x + y).lower(), 0) >= 1 and frek.get(y.lower(), 0) == 0 or frek.get((x + y).lower(), 0) >= 2 and len(y) <= 4:
            return a + b
    return a + ' ' + b


# Semua pasal sudah dicocokkan (25-11-2026): Pasal 85–97, 171–214, 228–229 dibaca langsung pada pindaian; pasal lain
# dibandingkan kata demi kata dengan OCR kedua (Tesseract) dan setiap selisih diperiksa pada pindaian.
DICOCOKKAN = set(range(1, 230))

# --- susun bagian KHI ------------------------------------------------------------------------------
md = []
pasal_harap = 1
log = []


def tulis_khi():
    global pasal_harap
    isi = []
    for p, asli, baris in halaman(KHI):
        isi.append(f'<!-- hlm {asli or "-"} · pdf {p} -->')
        i = 0
        while i < len(baris):
            b = baris[i]
            m_buku = re.fullmatch(r'BUKU\s*(I{1,3}|Ill|II|I)', b)
            m_bab = re.fullmatch(r'(?:BAB|BAD|BAH|DAB|Bab|Bah)\s*(' + ROMAWI + r'|[IVX]*l[IVX]*)', b)
            m_pasal = re.fullmatch(r'Pasa[l1I]\s*([0-9lIiOo ]{1,5})', b)
            m_bagian = re.fullmatch(r'Bagian\s+(Kesatu|Pertama|Kedua|Ketiga|Keempat|Kelima|Keenam|Ketujuh|Kedelapan|Kesembilan|Kesepuluh)', b)
            if m_buku or m_bab or m_pasal or m_bagian:
                if isi:
                    md.extend(blok_dari(isi)); isi = []
                if m_buku:
                    nomor = m_buku.group(1).replace('Ill', 'III')
                    judul = betulkan(baris[i + 1]) if i + 1 < len(baris) else ''
                    md.append(f'## BUKU {nomor} — {judul.upper()}'); i += 2; continue
                if m_bab:
                    nomor = m_bab.group(1).replace('l', 'I')
                    judul = betulkan(baris[i + 1]) if i + 1 < len(baris) else ''
                    md.append(f'### BAB {nomor} — {judul}'); i += 2; continue
                if m_bagian:
                    judul = betulkan(baris[i + 1]) if i + 1 < len(baris) else ''
                    md.append(f'#### Bagian {m_bagian.group(1)} — {judul}'); i += 2; continue
                if m_pasal:
                    try:
                        n = angka_ocr(m_pasal.group(1))
                    except ValueError:
                        n = -1
                    if not (pasal_harap <= n <= pasal_harap + 5):
                        log.append(f'pdf {p}: "{b}" dibaca {n}, diharapkan {pasal_harap}; dipakai {pasal_harap}')
                        n = pasal_harap
                    elif n != pasal_harap:
                        log.append(f'pdf {p}: pasal {pasal_harap}–{n - 1} tidak ditemukan sebagai judul')
                        hilang = ', '.join(f'Pasal {k}' for k in range(pasal_harap, n))
                        md.append(f'> Catatan: {hilang} tidak tercantum dalam edisi ini; naskah melompat dari Pasal {pasal_harap - 1} ke Pasal {n} (hlm. {asli}). Salinan edisi Departemen Agama 2001 juga tidak memuatnya.')
                    pasal_harap = n + 1
                    md.append(f'##### Pasal {n}')
                    md.append(f'<!-- pasal {n} · hlm {asli or "-"} · pdf {p} · {"dicocokkan" if n in DICOCOKKAN else "belum dicocokkan"} -->')
                    i += 1; continue
            isi.append(b); i += 1
    if isi:
        md.extend(blok_dari(isi))


GANTI_HAL = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ganti_halaman.json')))


def tulis_bebas(rentang, judul):
    md.append(f'## {judul}')
    for p, asli, baris in halaman(rentang):
        penanda = f'<!-- hlm {asli or "-"} · pdf {p} -->'
        if str(p) in GANTI_HAL:           # ditulis ulang dari pindaian
            blok = [x.strip() for x in GANTI_HAL[str(p)].split('\n\n') if x.strip()]
        else:
            blok = blok_dari(baris)
        # paragraf yang berlanjut dari halaman sebelumnya: penanda halaman disisipkan di dalam paragraf
        # ("b. bahwa ..." adalah butir baru, bukan lanjutan paragraf)
        if blok and re.match(r'[a-z]', blok[0]) and not re.match(r'([a-z]|\d{1,2})\.\s', blok[0]) and md and not md[-1].startswith('#'):
            md[-1] += ' ' + penanda + ' ' + blok.pop(0)
        else:
            md.append(penanda)
        md.extend(blok)


tulis_khi()
tulis_bebas(PENJELASAN, 'PENJELASAN ATAS BUKU KOMPILASI HUKUM ISLAM')
tulis_bebas(INPRES, 'INSTRUKSI PRESIDEN REPUBLIK INDONESIA NOMOR 1 TAHUN 1991 TENTANG PENYEBARLUASAN KOMPILASI HUKUM ISLAM')
tulis_bebas(KMA, 'KEPUTUSAN MENTERI AGAMA REPUBLIK INDONESIA NOMOR 154 TAHUN 1991 TENTANG PELAKSANAAN INSTRUKSI PRESIDEN REPUBLIK INDONESIA NOMOR 1 TAHUN 1991 TANGGAL 10 JUNI 1991')

KEPALA = """# Kompilasi Hukum Islam di Indonesia

<!-- naskah khi-kemenag-2018 · disusun 27-11-2026 -->

**Sumber.** *Kompilasi Hukum Islam di Indonesia*, Direktorat Bina KUA dan Keluarga Sakinah, Direktorat Jenderal Bimbingan Masyarakat Islam, Kementerian Agama RI, November 2018, 262 halaman. Berkas pindaian yang dipakai: `rujukan/KHI_Kemenag_2018_Kompilasi_Hukum_Islam.pdf` (SHA-256 `322fe34a0fc77ba234a2e853e43925d1713b4cc447f95e07ef537bd2a451a2e3`), sama ukuran dan jumlah halamannya dengan berkas di Wikimedia Commons yang dicatat sebagai domain publik menurut Pasal 43 UU 28/2014.

**Cara penyusunan.**

1. Teks diambil dari lapisan OCR berkas PDF dengan markitdown 0.1.9, per halaman. Artefak tabel dibuang, lalu judul Buku, Bab, Bagian, dan Pasal disusun ulang.
2. Salah baca OCR yang berulang dikoreksi otomatis, misalnya "hagian" menjadi "bagian" dan "suarni" menjadi "suami".
3. Pasal 85–97, Pasal 171–214, Pasal 228–229, Penjelasan, Instruksi Presiden Nomor 1 Tahun 1991, dan Keputusan Menteri Agama Nomor 154 Tahun 1991 dicocokkan kata demi kata dengan gambar pindaian pada 25 November 2026. Halaman Penjelasan Pasal demi Pasal, Inpres, dan KMA ditulis ulang dari pindaian karena urutan teks OCR-nya kacau.
4. Pasal lain di Buku I dan Buku III dicocokkan pada 25 November 2026 dengan cara lain. Teksnya dibandingkan kata demi kata dengan OCR kedua yang independen (Tesseract 5, bahasa Indonesia) atas pindaian yang sama. Setiap selisih diperiksa pada gambar pindaian, lalu dikoreksi (`terbit/naskah-khi/koreksi.json`).
5. Salah cetak dalam edisi ini dipertahankan sebagaimana tercetak. Salah cetak yang dapat memengaruhi makna diberi catatan penyunting.
6. Edisi ini tidak mencetak Pasal 124 dan Pasal 139.
7. Spasi sebelum titik dua dan koma dinormalkan.
8. Pada 27 November 2026 naskah ini dibandingkan kata demi kata dengan salinan ketik *Kompilasi Hukum Islam di Indonesia* edisi Direktorat Pembinaan Peradilan Agama Islam, Ditjen Pembinaan Kelembagaan Islam, Departemen Agama, 2001, yang dimuat JDIH Universitas Sumatera Utara (berkas dibuat 2007). Salinan itu memuat salah cetak yang sama dengan edisi ini, antara lain pada Pasal 70 huruf e, Pasal 96 ayat (2), Pasal 197 ayat (1) huruf d, dan Pasal 211, dan juga tidak memuat Pasal 124 dan Pasal 139. Selisih yang ditemukan diperiksa pada pindaian. Hasilnya, satu judul Bagian yang tergabung ke Pasal 81, delapan butir yang tergabung ke paragraf sebelumnya (satu di antaranya dalam KMA Nomor 154 Tahun 1991), tiga tanda baca, satu noda pindaian yang terbaca sebagai apostrof, dan sembilan nomor halaman yang tidak terbaca OCR diperbaiki (`terbit/naskah-khi/banding-2001.md`). Bunyi yang benar untuk salah cetak belum dapat dicocokkan dengan naskah resmi lain, kecuali Pasal 70 huruf e, yang merujuk Pasal 8 UU No. 1 Tahun 1974.

**Penanda.** `<!-- hlm N · pdf P -->` menunjukkan halaman buku (hlm) dan halaman berkas PDF (pdf). Setiap pasal disertai `<!-- pasal N · hlm · pdf · status -->`.

**Tidak dimuat.** Kata Pengantar, Sambutan, Daftar Isi, dan Lampiran buku (UU 1/1974 dan PP 9/1975 beserta penjelasannya, hlm. 129–238). Bagian itu dapat dibaca pada pindaian.
"""

teks = KEPALA + '\n' + '\n\n'.join(md) + '\n'

# Perbaikan yang baru terlihat sesudah baris digabung (kata terpotong di akhir baris).
# Nomor halaman yang terselip di akhir paragraf (angka sama dengan halaman sebelum penanda berikutnya).
teks = re.sub(r' (\d{1,3})(\s*)(<!-- hlm (\d+) · pdf \d+ -->)', lambda m: (m.group(2) or ' ') + m.group(3) if int(m.group(1)) + 1 == int(m.group(4)) else m.group(0), teks)
teks = re.sub(r' (\d{1,3})\n\n(<!-- hlm (\d+) · pdf \d+ -->)', lambda m: '\n\n' + m.group(2) if int(m.group(1)) + 1 == int(m.group(3)) else m.group(0), teks)
teks = re.sub(r'\bse(\w+) \1nya\b', r'se\1-\1nya', teks)
teks = re.sub(r'\bbel urn\b', 'belum', teks)
for pola, ganti in [
        (r'\b(di)?([Pp])e[it]j(anji)', r'\1\2erj\3'),            # petjanjian/peijanjian -> perjanjian
        (r'\b([Pp])ennohon', r'\1ermohon'),                     # pennohonan -> permohonan
        (r'\bke(\w+) \1nya\b', r'ke\1-\1nya'),                  # keempat empatnya -> keempat-empatnya
        (r'\b([Tt])erse ?b ?ut\b', r'\1ersebut'), (r'\b(di)?an tara\b', r'\1antara'), (r'\bse orang\b', 'seorang'),
        (r'\bper kawinan', 'perkawinan'), (r'\bdi mintai\b', 'dimintai'), (r'\bmeng hindari\b', 'menghindari'),
        (r'\b([Pp])erundang undangan', r'\1erundang-undangan'), (r'\bhi lang\b', 'hilang'), (r"\braj' i\b", "raj'i"),
        (r'\bkekuatannya,jika\b', 'kekuatannya, jika'), (r'\byangtetap\b', 'yang tetap'), (r'\bhuruf([a-z])\b', r'huruf \1'),
        (r'\bPengadilanAgama\b', 'Pengadilan Agama'), (r'\badil,jujur\b', 'adil, jujur'), (r'\bA gama \.', 'Agama.'), (r'\( dua\)', '(dua)'),
        (r'\bmem pelajari\b', 'mempelajari'), (r'\bdi hindarkan\b', 'dihindarkan'), (r'\bmemindahkan nya\b', 'memindahkannya'), (r'\ba tau\b', 'atau'),
        (r"\b(li|mut|ba|raj|Li|Mut|Raj)' (an|ah|da|i)\b", r"\1'\2"), (r'\bMufah\b', "Mut'ah"), (r'\btasakh\b', 'fasakh'), (r'\bja1an\b', 'jalan'),
        (r'\bmen damaikan\b', 'mendamaikan'), (r'\bme wilayahi\b', 'mewilayahi'), (r'\bke matian\b', 'kematian'), (r'\bwan ita\b', 'wanita'), (r'\bIa yak\b', 'layak'),
        (r'\b(mewakaf|diwakaf)l<an\b', r'\1kan'),
        (r'\bcaJon\b', 'calon'), (r'\bAgarria\b', 'Agama'), (r'\bPeneegahan\b', 'Pencegahan'), (r'\bsempuma\b', 'sempurna'),
        (r'\bKeUma\b', 'Kelima'), (r'\bnatkah\b', 'nafkah'), (r'\bsuamt\b', 'suami'), (r'\bsesuat\b', 'sesuai')]:
    teks = re.sub(pola, ganti, teks)

# Judul Bab/Bagian yang terpotong atau terbaca salah oleh OCR (diperiksa pada pindaian dan Daftar Isi).
for a, b in [('### BAB II — FUNGSI, UNSUR-UNSUR\n\nDAN SYARAT-SYARAT WAKAF', '### BAB II — FUNGSI, UNSUR-UNSUR DAN SYARAT-SYARAT WAKAF'),
             ('### BAB III — TATA CARA PERWAKAFAN\n\nDANPENDAFTARANBENDAWAKAF', '### BAB III — TATA CARA PERWAKAFAN DAN PENDAFTARAN BENDA WAKAF'),
             ('### BAB IV — PERUBAHAN, PENYELESAIAN DAN\n\nPENGAWASAN BENDA WAKAF', '### BAB IV — PERUBAHAN, PENYELESAIAN DAN PENGAWASAN BENDA WAKAF'),
             ('— RUKUNDANSYARATPERKA~AN', '— RUKUN DAN SYARAT PERKAWINAN'), ('— KAWINHAMIL', '— KAWIN HAMIL'),
             ('— WaliNikah', '— Wali Nikah'), ('— SaksiNikah', '— Saksi Nikah'), ('— AkadNikah', '— Akad Nikah'),
             ('— Urn urn', '— Umum'), ('— Mufah', "— Mut'ah"), ('— AkibatLfan', "— Akibat Li'an")]:
    if a not in teks:
        if b in teks:
            continue                      # sudah diperbaiki oleh koreksi OCR sistematis
        sys.exit('judul tidak ditemukan: ' + a)
    teks = teks.replace(a, b)

# Koreksi kata demi kata hasil pencocokan dengan pindaian: [pdf, lama, baru]; harus tepat satu kali di halaman itu.
import os
berkas_koreksi = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'koreksi.json')
for pdf, lama, baru in (json.load(open(berkas_koreksi)) if os.path.exists(berkas_koreksi) else []):
    m = re.search(r'(<!-- hlm [^·]+· pdf ' + str(pdf) + r' -->)(.*?)(?=<!-- hlm [^·]+· pdf \d+ -->|\Z)', teks, re.S)
    if m and m.group(2).count(lama) == 0 and baru in m.group(2):
        continue                          # sudah diperbaiki oleh koreksi OCR sistematis
    if not m or m.group(2).count(lama) != 1:
        sys.exit(f'koreksi gagal di pdf {pdf}: "{lama}" muncul {m.group(2).count(lama) if m else "?"} kali')
    teks = teks[:m.start(2)] + m.group(2).replace(lama, baru) + teks[m.end(2):]
teks = re.sub(r'\n{3,}', '\n\n', teks)
open(out, 'w').write(teks)
print('pasal terakhir', pasal_harap - 1)
print('\n'.join(log))
print('ganti kata', len(GANTI))
