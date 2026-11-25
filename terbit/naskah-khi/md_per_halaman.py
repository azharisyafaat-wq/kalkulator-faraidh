# Pakai: python md_per_halaman.py <folder PDF satu-halaman p001.pdf ...> halaman-markitdown.json
# (PDF dipecah per halaman lebih dulu, misalnya dengan PyMuPDF.)
# Konversi setiap halaman PDF KHI dengan markitdown, lalu hapus artefak tabel (baris rata kiri-kanan yang
# dibaca sebagai tabel): sel digabung dengan satu spasi, baris pemisah "| --- |" dibuang.
import sys, os, re, json
from markitdown import MarkItDown
md = MarkItDown()
src, out = sys.argv[1], sys.argv[2]
hasil = {}
for f in sorted(os.listdir(src)):
    p = int(f[1:4])
    t = md.convert(os.path.join(src, f)).text_content
    baris = []
    for b in t.splitlines():
        s = b.strip()
        if re.fullmatch(r'\|?\s*(-{3,}\s*\|\s*)*-{3,}\s*\|?', s):
            continue
        if s.startswith('|') and s.endswith('|'):
            s = ' '.join(c.strip() for c in s.strip('|').split('|') if c.strip())
        s = re.sub(r'\s{2,}', ' ', s)
        baris.append(s)
    hasil[p] = '\n'.join(baris).strip()
json.dump(hasil, open(out, 'w'), ensure_ascii=False, indent=0)
print(len(hasil))
