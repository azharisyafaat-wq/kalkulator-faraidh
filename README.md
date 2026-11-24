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

## Rujukan dan panduan

Buku panduan dan folder `rujukan/` tidak disertakan dalam repositori ini. Keduanya tersedia di situs resmi, dan `sw.js` mencantumkan daftar PDF yang dapat disimpan untuk dipakai tanpa internet. Bila aplikasi dijalankan tanpa folder tersebut, tombol penyimpanan PDF akan melaporkan bahwa PDF belum tersimpan.

## Riwayat versi

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
