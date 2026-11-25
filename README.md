# Kalkulator Faraidh

Aplikasi web progresif (PWA) open source untuk menyimulasikan pembagian waris Islam dengan perbandingan Kompilasi Hukum Islam (KHI), bilateral Hazairin, dan patrilineal Syafi'i. Perhitungan berjalan di perangkat pengguna dan dapat dipakai offline. Ditujukan bagi masyarakat, mahasiswa, dan praktisi hukum. Hasil bersifat simulasi dan tidak menggantikan pemeriksaan dokumen atau penetapan pengadilan.

Versi yang berjalan: <https://faraidh.syafaatlawfirm.com>

*An open source progressive web app that simulates Islamic inheritance (faraidh) distribution under Indonesia's Compilation of Islamic Law (KHI), Hazairin's bilateral system, and the patrilineal Syafi'i school. It runs on the user's device and works offline. Results are simulations and do not replace a review of the documents or a court determination.*

## Fitur

- Membandingkan hasil KHI, Hazairin, fikih Syafi'i, dan kaidah yang dirujuk dalam kitab.
- Menghitung di perangkat. Kode kalkulator tidak mengirim isian perkara ke server.
- Dapat dipasang sebagai aplikasi dan dipakai tanpa internet.
- Menampilkan alasan dan tidak mengeluarkan angka jika status keluarga atau bagian belum dapat ditentukan dari data yang tersedia.

## Menjalankan

Aplikasi ini berupa berkas statis, jadi tidak perlu proses build.

```bash
python3 -m http.server 8080
```

Lalu buka <http://localhost:8080>. Fitur offline memerlukan HTTPS atau `localhost`.

Saat pertama kali dibuka, aplikasi hanya menyimpan berkas inti (sekitar 1 MB) untuk dipakai tanpa internet. Bank contoh (`bank-kasus.js`) dimuat saat bagiannya dibuka. PDF rujukan disimpan saat dibuka, atau sekaligus lewat tombol **Simpan semua PDF rujukan**.

## Menguji

```bash
node uji/periksa-mesin.cjs
```

Skrip ini menjalankan mesin hitung di `index.html` tanpa peramban, dengan dua kelompok uji:

- `uji/kasus-baku.json`: 70 perhitungan kasus baku kitab dan buku daras, dalam mode Syafi'i, KHI, dan Hazairin;
- seluruh bank contoh di `bank-kasus.js`.

Skrip keluar dengan kode 1 bila ada hasil yang tidak sesuai.

```bash
node uji/periksa-cerita.cjs
```

Skrip ini menguji pembaca cerita keluarga (`parseCeritaBebas`): bidang yang diusulkan dan pertanyaan yang diajukan untuk tiap cerita contoh.

## Rujukan dan panduan

Buku panduan dan folder `rujukan/` tidak disertakan dalam repositori ini. Keduanya tersedia di situs resmi, dan `sw.js` mencantumkan daftar PDF yang dapat disimpan untuk dipakai tanpa internet (`PDF_RUJUKAN`). Bila aplikasi dijalankan tanpa folder tersebut, tombol penyimpanan PDF akan melaporkan bahwa PDF belum tersimpan. Lisensi tiap dokumen pihak ketiga dicatat di [lisensi-pihak-ketiga.txt](lisensi-pihak-ketiga.txt).

## Menerbitkan ke situs

Situs faraidh.syafaatlawfirm.com dibangun dari repositori ini; berkas di server tidak disunting langsung.

1. Naikkan versi di judul `index.html` (`Pro vX.Y.Z`) dan `CACHE` di `sw.js` (`faraidh-X.Y.Z-tanggal`).
2. Jalankan kedua uji di atas.
3. Bangun paket. Folder dokumen memuat `panduan/` dan `rujukan/`; hanya PDF yang tercantum di `PDF_RUJUKAN` yang ikut paket:

   ```bash
   node terbit/buat-paket.cjs --dokumen <folder-dokumen> --banding <paket-terpasang>
   ```

   Skrip menolak membuat paket bila ada berkas INTI atau PDF yang hilang, PDF yang ditautkan `index.html` tetapi tidak terdaftar, versi `index.html` dan `sw.js` berbeda, atau label ukuran tombol "Simpan semua PDF rujukan" tidak sesuai jumlah ukuran PDF. Dengan `--banding`, skrip mencetak berkas yang perlu diunggah dan berkas yang perlu dihapus dari server.
4. Unggah per berkas (berkas yang berubah saja), hapus berkas yang tidak lagi ikut paket, lalu bersihkan cache hosting.
5. Periksa situs terpasang: tampilan ponsel dan desktop, tiga tab perhitungan, pembaca PDF, mode tanpa internet, dan sematan di syafaatlawfirm.com/faraidh.

## Riwayat versi

- **5.19.1** (25 November 2026):
  - Seluruh pasal naskah KHI kini dicocokkan.
    - Pasal yang sebelumnya bertanda "belum dicocokkan" (Buku I Pasal 1–84 dan 98–170, Buku III Pasal 215–227) dibandingkan kata demi kata dengan OCR kedua yang independen (Tesseract 5, bahasa Indonesia) atas pindaian yang sama.
    - Setiap selisih diperiksa pada gambar pindaian, lalu dikoreksi. Contohnya kalimat yang tertukar urutannya oleh OCR (Pasal 77, 80, 131, 135, 169), salah baca "petjanjian", "pennohonan", "hawah petwaliannya", serta nomor halaman yang terselip ke dalam teks.
    - Salah cetak asli tetap dipertahankan, misalnya "KEWJIBAN", "dikakukan", "Urutan Agama", "orng tua".
  - Hasil OCR kedua dan alat pembandingnya disimpan di `terbit/naskah-khi/` sebagai jejak pencocokan. Pasal yang sudah dicocokkan di 5.19.0, Penjelasan, Inpres, dan KMA tidak berubah.

- **5.19.0** (25 November 2026):
  - Naskah KHI dalam aplikasi. Pindaian resmi *Kompilasi Hukum Islam di Indonesia* (Kemenag 2018, 262 halaman) dikonversi dengan markitdown menjadi `naskah/khi-kemenag-2018.md`. Pasal 85–97, 171–214, 228–229, Penjelasan, Inpres 1/1991, dan KMA 154/1991 dicocokkan kata demi kata dengan pindaian. Pasal lain ditandai "belum dicocokkan". Edisi ini tidak mencetak Pasal 124 dan Pasal 139.
  - Rujukan "Ps. N" di hasil KHI menjadi tautan ke pasal itu. Penampilnya memuat teks, status pencocokan, penjelasan pasal, pencarian nomor atau kata, dan tombol ke halaman pindaiannya.
  - Pindaian utuh disertakan dalam paket (`rujukan/KHI_Kemenag_2018_Kompilasi_Hukum_Islam.pdf`). Dalil KHI membuka halaman pindaian itu dan tombol "Baca Pasal N dalam naskah KHI"; tautan Commons di dalil dan tautan Lampiran A di Pustaka dibuang karena sudah tercakup.
  - Kutipan dalil Pasal 174 kini persis seperti cetakan ("kakek. Golongan perempuan …"). Uji `uji/periksa-naskah-khi.cjs` memeriksa bahwa sebelas kutipan dalil KHI sama kata demi kata dengan naskah.
  - Penyusun naskah di `terbit/naskah-khi/`; CI memeriksa bahwa naskah dapat dibangun ulang byte-identik.

- **5.18.1** (24 November 2026):
  - Naskah KHI hanya dari edisi resmi Kementerian Agama 2018. Tautan "Naskah KHI (BPHN)" pada sepuluh dalil KHI dan kartu KHI Buku II diganti naskah lengkap resmi; berkas BPHN itu (`perkawinan.pdf`) tidak dapat dibuka untuk diperiksa karena dijawab halaman tantangan Cloudflare. Kartu KHI kini juga menautkan pindaian resmi Buku II di Panduan, Lampiran A.
  - Rujukan KHI ganda dibuang: salinan ketik ulang di Internet Archive dan lampiran KHI UIN Malang tidak lagi ditautkan dari katalog Pustaka, kartu Dasar hukum, maupun PDF katalog 00 dan 03 (halaman 5). Alamat lama `rujukan/KHI_02_…` dan `rujukan/KHI_03_…` dijawab 410.
  - Identitas naskah lengkap dicatat dari halaman berkas Wikimedia Commons: Direktorat Bina KUA dan Keluarga Sakinah, November 2018, 262 halaman, domain publik menurut Pasal 43 UU 28/2014.

- **5.18.0** (24 November 2026):
  - Di layar di bawah 600 px, hasil tampil sebagai kartu per ahli waris (bagian, persen, rupiah), termasuk tab Perbandingan. Tabel tetap dipakai di layar lebar dan cetakan.
  - Setelah isian berubah, bilah "Hasil … siap" dengan tombol "Lihat hasil" muncul di bawah layar bila hasilnya berada di luar layar.
  - Area sentuh tombol, isian, dan tautan kecil (Dalil, Baca panduan) minimal 40 px di layar sentuh.
  - Pembaca cerita: "saya adik/kakak (laki-laki/perempuan)-nya" dicatat sebagai saudara pewaris dan jenisnya (kandung, seayah, seibu) ditanyakan; dari sudut anak pewaris, kakek/nenek tanpa keterangan pihak dibaca sebagai orang tua pewaris dengan asumsi yang ditampilkan. Kakak yang meninggal tidak lagi ikut terhitung sebagai saudara.
  - Catatan di hasil KHI: pembacaan Pasal 193 (pasangan ikut radd) dan Pasal 181–182 (anak perempuan menghijab saudara) ditandai sebagai tafsir yang dipakai aplikasi. Pesan "Perhitungan ditahan" untuk cucu pengganti menjelaskan Pasal 185 dan pilihan simulasinya.
  - Rujukan: salinan KHI ketik ulang (insantri.com) dan lampiran KHI UIN Malang diganti tautan ke sumber asli karena tidak berketerangan lisensi. Lisensi artikel yang disertakan diperiksa di halaman jurnal dan dicantumkan; artikel Jurnal Hukum dan Peradilan (CC BY-NC-SA) tetap disertakan karena kalkulator ini nonkomersial.
  - Dasar hukum: Putusan MA 122 K/AG/1995 (anak perempuan menghijab saudara pewaris) dicocokkan dengan pindaian Varia Peradilan No. 150 yang dimuat Komisi Yudisial, lalu dicantumkan di catatan hasil KHI, dalil Pasal 181–182, dan katalog Dasar hukum. Bunyi Pasal 42 UU 28/2014 di `hak-cipta.txt` dicocokkan dengan naskah JDIH Kementerian Keuangan.
  - Header keamanan HSTS dan `frame-ancestors` di `.htaccess`; `.htaccess` kini ikut repositori. Skrip `terbit/buat-paket.cjs` membangun paket situs dari repositori.

- **5.17.2** (24 November 2026):
  - Mode Syafi'i bawaan (muta'akhkhirin) mengembalikan sisa harta kepada suami atau istri bila tidak ada ahli waris lain, sesuai Panduan hlm. 13. Sebelumnya sisa dicatat ke Baitul Mal. Pilihan mutaqaddimin (Baitul Mal) tetap tersedia. Lima kasus bank contoh "pasangan saja" diselaraskan.
  - Unduhan kunjungan pertama turun dari sekitar 10,8 MB menjadi sekitar 2 MB: PDF rujukan dan bank contoh tidak lagi diunduh otomatis.
  - PDF yang sudah tersimpan di versi sebelumnya dipindahkan saat pembaruan, sehingga tidak diunduh ulang.
  - Uji mesin hitung (`uji/`) ditambahkan.

## Lisensi

Hak Cipta (c) 2026 Azhari Syafaat, S.H., M.Kn. (Syafaat & Associates Law Firm).

Dilisensikan berdasarkan [GNU Affero General Public License v3.0](LICENSE). Jika Anda mengubah aplikasi ini dan menjalankannya sebagai layanan jaringan, Anda wajib menyediakan kode sumber versi Anda kepada penggunanya. Batasan atas nama dan merek serta daftar komponen pihak ketiga ada di [hak-cipta.txt](hak-cipta.txt) dan [lisensi-pihak-ketiga.txt](lisensi-pihak-ketiga.txt).

## Batasan

Aplikasi ini bukan nasihat hukum. Cakupan tiap perhitungan dan pilihan tafsirnya dijelaskan di dalam aplikasi. Hazairin dan Syafi'i ditampilkan sebagai pembanding, dan penerapannya pada suatu perkara tetap memerlukan pemeriksaan fakta, dokumen, dan hukum yang berlaku.
