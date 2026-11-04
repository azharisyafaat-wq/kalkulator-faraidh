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

## Rujukan dan panduan

Buku panduan dan folder `rujukan/` tidak disertakan dalam repositori ini. Tautan dokumen di dalam aplikasi mengarah ke situs resmi dan tidak tersedia offline.

## Lisensi

Hak Cipta (c) 2026 Azhari Syafaat, S.H., M.Kn. (Syafaat & Associates Law Firm).

Dilisensikan berdasarkan [GNU Affero General Public License v3.0](LICENSE). Jika Anda mengubah aplikasi ini dan menjalankannya sebagai layanan jaringan, Anda wajib menyediakan kode sumber versi Anda kepada penggunanya. Batasan atas nama dan merek serta daftar komponen pihak ketiga ada di [hak-cipta.txt](hak-cipta.txt) dan [lisensi-pihak-ketiga.txt](lisensi-pihak-ketiga.txt).

## Batasan

Aplikasi ini bukan nasihat hukum. Cakupan tiap perhitungan dan pilihan tafsirnya dijelaskan di dalam aplikasi. Hazairin dan Syafi'i ditampilkan sebagai pembanding, dan penerapannya pada suatu perkara tetap memerlukan pemeriksaan fakta, dokumen, dan hukum yang berlaku.
