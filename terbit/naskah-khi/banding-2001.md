# Banding naskah KHI dengan salinan edisi Departemen Agama 2001

Dikerjakan 27 November 2026, untuk faraidh 5.19.2.

## Tujuan

Pemilik meminta agar bunyi yang benar untuk salah cetak dalam edisi Kemenag 2018 dicari dan dicocokkan dengan naskah resmi lain sebelum ditampilkan. Contohnya "Hibah dan orang tua" pada Pasal 211 dan "suaminya hutang" pada Pasal 96 ayat (2).

## Sumber yang dicoba

| Sumber | Hasil |
|---|---|
| JDIH BPK, Inpres 1/1991 (`peraturan.bpk.go.id/Download/352679/...`) | 2 halaman batang tubuh Inpres (sumber JDIH Setkab), tanpa lampiran KHI. |
| paralegal.id, Inpres 1/1991 | Hanya metadata; tautan PDF-nya `#`. |
| MariNews MA, artikel tentang Pasal 211 | HTTP 403. Tidak diakali. |
| jdih.mahkamahagung.go.id | Tidak dicoba: robots.txt menutup agen AI (`verifikasi/ATURAN6.md` di repo asisten-regulasi-ma). |
| peraturan.go.id, bphn.go.id, id.wikisource.org | Menolak menurut `verifikasi/ATURAN4.md`. Wikisource juga hanya memuat edisi 2018 yang sama (`KHI_id.pdf`). |
| repo-dosen.ulm.ac.id (salinan KHI) | HTTP 522 lalu 525 (server asal gagal). |
| Buku Panduan aplikasi, Lampiran A | Pindaian edisi 2018 yang sama, jadi bukan pembanding. |
| **JDIH Universitas Sumatera Utara**, "Kompilasi Hukum Islam (KHI)" | Terbaca. Dipakai sebagai pembanding (lihat di bawah). |

## Pembanding yang dipakai

- Halaman: https://jdih.usu.ac.id/id/regulasi/kompilasi-hukum-islam-khi
- Berkas: https://konten.usu.ac.id/storage/year/2025-12/satker/kTQsW/statis/regulation/Kompilasi%20Hukum%20Islam.pdf
- Diambil 27 November 2026 lewat WebFetch. 35 halaman, 220,8 KB, SHA-256 `3f884f63ae069cde40e325ee6c5c0f966a0423489e4d17ea23b06dafca7022cb`.
- Metadata PDF: dibuat 16 Agustus 2007 (WordToPDF 2.2, AFPL Ghostscript 8.13).
- Catatan kaki halaman 1 berbunyi: "Disalin dari ”Kompilasi Hukum Islam di Indonesia”, Direktorat Pembinaan Peradilan Agama Islam Ditjen Pembinaan Kelembagaan Islam Departemen Agama, 2001."
- Jenis sumber: **salinan** (ketik ulang pihak ketiga), bukan naskah resmi. Berkasnya tidak disertakan dalam repo maupun paket.

Karena dibuat pada 2007, salinan ini tidak mungkin berasal dari edisi 2018. Salinan ini memuat banyak salah ketik sendiri, misalnya "kegiatan kegiatan", "pemberiandari", "bersam", dan "sisebut".

## Cara

1. Teks salinan diekstrak dengan PyMuPDF.
2. `banding_2001.py` membagi kedua teks per pasal, menormalkan huruf, tanda baca, dan penomoran ayat/butir, lalu membandingkan kata demi kata (difflib).
3. Hasil awal: 276 selisih kata pada 138 pasal. Setiap selisih dibaca satu per satu. Hampir semuanya salah ketik salinan atau judul Bab/Bagian yang ikut terbaca di blok pasal.
4. Selisih yang bisa berasal dari naskah aplikasi diperiksa pada gambar pindaian `rujukan/KHI_Kemenag_2018_Kompilasi_Hukum_Islam.pdf`.

## Temuan A: cacat penyusunan naskah aplikasi (diperbaiki di 5.19.2)

Semua butir berikut diperiksa pada pindaian. Perbaikannya ada di `koreksi.json`, dengan butir terakhir dan pemisahan butir KMA di `susun_md.py`.

| Pasal | Cacat | Pindaian (pdf) |
|---|---|---|
| 81–82 | Judul "Bagian Kelima — Kewajiban Suami yang Beristeri Lebih Dan Seorang" tergabung ke akhir Pasal 81 ayat (4), sehingga Pasal 82 tampil di Bagian Keempat. | 56 |
| 1 | Huruf j ("Mut'ah adalah …") tergabung ke huruf i dan terbaca "J." | 17 |
| 39 ayat (3) | Huruf b tergabung ke huruf a | 33 |
| 99 | Huruf a dan b tergabung ke kalimat pembuka | 62–63 |
| 113 | Huruf c tergabung ke huruf b | 69 |
| 158 | Huruf a tergabung ke kalimat pembuka | 91 |
| 219 ayat (1) | Huruf f tergabung ke huruf e | 126 |
| KMA 154/1991 | Konsiderans huruf b tergabung ke huruf a, karena dianggap lanjutan paragraf. | 256 |
| 73 huruf a | Noda pindaian sebelum "bawah" terbaca sebagai apostrof ("ke 'bawah") | 50 |
| 75 huruf c | "ber' itikad"; tercetak "ber`itikad" | 51 |
| 119 ayat (2) | "Ba' in"; tercetak "Ba`in" | 71 |
| 127 huruf b | "''tuduhan"; tercetak tanda kutip pembuka | 73 |
| — | Sembilan nomor halaman tidak terbaca OCR ("-") atau salah terbaca ("Ill" untuk 111): pdf 13, 22, 34, 54, 76, 80, 84, 123, 256. Semuanya dibaca pada kaki halaman dan sama dengan pdf − 12. | — |

## Temuan B: salah cetak yang sama dalam salinan 2001

Bunyi berikut terdapat dalam edisi 2018 **dan** salinan 2001:

| Pasal | Tercetak |
|---|---|
| 2 | "hukun Islam" |
| 7 ayat (2) | "Akata Nikah" |
| 70 huruf d angka 4 | "orng tua sesusuan" |
| 70 huruf e | "kemenakan dan isteri" |
| Judul Bab XII | "HAK DAN KEWJIBAN SUAMI ISTERI" |
| 95 ayat (2) | "dikakukan" |
| 96 ayat (2) | "Pembangian … suaminya hutang" |
| 128 | "dilakukann" |
| 175 ayat (1) huruf d | "wahli waris" |
| 197 ayat (1) huruf d | "surat wasiat dan pewasiat" |
| 198 | "haris diberikan" |
| 199 ayat (4) | "berdasartkan" |
| 211 | "Hibah dan orang tua" |
| 215 ayat (6) | "peraturan peraturan" |
| 221 ayat (2) | "Kantor Urutan Agama" |
| 223 ayat (1) | "mewakafkah" |
| Penjelasan | Judul "Pasal 149 s/d 185" lalu "Pasal 187 s/d 228"; Pasal 186 tidak disebut. |
| 124 dan 139 | Tidak dimuat. Salinan 2001 juga melompat dari Pasal 123 ke 125 dan dari 138 ke 140. |

Artinya, salah cetak itu sudah ada dalam teks edisi 2001. Salah cetak ini tidak muncul karena cetakan 2018 dan tidak muncul karena penyusunan naskah aplikasi.

## Temuan C: edisi 2018 berbeda dengan salinan 2001

Di tiga tempat, edisi 2018 mencetak "dari" sedangkan salinan 2001 mencetak "dan":
- Pasal 12 ayat (3): "penolakan dari pihak wanita";
- Pasal 156 huruf a: "hadhanah dari ibunya";
- Pasal 215 ayat (6): "menerima ikrar dari wakif".

Pasal 215 ayat (1) tercetak "ibadah" di edisi 2018 dan "ibadat" di salinan 2001.

Keterangan SEMA 2/1994 bertanda bintang dalam edisi 2018 tercetak di antara ayat (1) dan ayat (2) Pasal 185, dan Pasal 177 tidak bertanda bintang (pdf 105). Dalam salinan 2001, keterangan itu berupa catatan kaki yang tanda bintangnya melekat pada akhir Pasal 177 ("mendapat seperenam bagian. *"). Ini sejalan dengan catatan penyunting Pasal 185, yang kini menyebutnya.

Sebaliknya, kedua teks sama-sama mencetak "dan" pada Pasal 70 huruf e, Pasal 197 ayat (1) huruf d, Pasal 211, dan judul Bagian Kelima Bab XII.

## Temuan D: pembanding resmi untuk Pasal 70 huruf e

Pasal 70 huruf d merujuk "pasal 8 Undang-undang No.1 Tahun 1974". Pasal 8 huruf e UU 1/1974 dimuat dalam Lampiran edisi 2018 (hlm. 138, pdf 150) dengan bunyi: "berhubungan saudara dengan isteri atau sebagai bibi atau kemenakan dari isteri, dalam hal seorang suami beristeri lebih dari seorang". Bunyi ini dibaca pada pindaian. Catatan penyunting Pasal 70 huruf e mengutipnya.

## Yang belum terverifikasi

Bunyi yang benar untuk Pasal 96 ayat (2), 197 ayat (1) huruf d, dan 211 belum dapat dicocokkan dengan naskah resmi lain. Karena itu, aplikasi hanya menampilkan bunyi cetakan beserta catatan penyunting.

Pembanding yang masih perlu dicari:
- edisi Direktorat Pembinaan Badan Peradilan Agama 1991/1992;
- lampiran asli Inpres 1/1991 dari arsip Setneg/Setkab;
- dokumen JDIH MA yang dibuka sendiri oleh pemilik di peramban.
