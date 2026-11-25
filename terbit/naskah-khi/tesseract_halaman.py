# OCR kedua (Tesseract 5, bahasa Indonesia, 300 dpi, --psm 4) atas halaman Buku I dan III; hasilnya di tesseract/.
# Pakai: python tesseract_halaman.py <PDF KHI> <folder keluaran>
import pymupdf, sys, subprocess, os
src = pymupdf.open(sys.argv[1]); out = sys.argv[2]
halaman = list(range(13, 99)) + list(range(121, 135))
for p in halaman:
    png = f'{out}/p{p:03d}.png'
    if not os.path.exists(f'{out}/p{p:03d}.txt'):
        src[p - 1].get_pixmap(dpi=300, colorspace=pymupdf.csGRAY).save(png)
        subprocess.run(['tesseract', png, f'{out}/p{p:03d}', '-l', 'ind', '--psm', '4'], capture_output=True)
        os.remove(png)
print('selesai', len(halaman))
