"""Bandingkan teks naskah per halaman PDF dengan OCR kedua (Tesseract) dan cetak selisihnya per kata.

Pakai: python3 terbit/naskah-khi/banding_ocr.py naskah/khi-kemenag-2018.md terbit/naskah-khi/tesseract 15 16 ...
Selisih yang tersisa sesudah koreksi 25-11-2026 adalah salah baca Tesseract (mis. "(J1)" untuk "(1)", "agil" untuk "aqil").
"""
import sys, re, difflib
md_path, tess_dir = sys.argv[1], sys.argv[2]
halaman = [int(x) for x in sys.argv[3:]]
t = open(md_path, encoding='utf-8').read()

def seg(p):
    m = re.search(r'<!-- hlm [^·]+· pdf ' + str(p) + r' -->(.*?)(?=<!-- hlm [^·]+· pdf \d+ -->|\Z)', t, re.S)
    return m.group(1) if m else ''

def norm_md(s):
    s = re.sub(r'<!--.*?-->', ' ', s)
    s = re.sub(r'^> .*$', ' ', s, flags=re.M)
    s = re.sub(r'^#+ ', '', s, flags=re.M)
    s = s.replace(' — ', ' ').replace('\\*', '*')
    return s.split()

def norm_t(s):
    baris = [b for b in s.splitlines() if b.strip()]
    baris = [b for b in baris if not re.search(r'K\w*mp\w+\s+\S+\s+\S+\s+d\w\s+\S+', b)]
    baris = [b for b in baris if not re.fullmatch(r'\s*\d{1,3}\s*', b)]
    s = '\n'.join(baris)
    s = re.sub(r'-\n(?=[a-z])', '-', s)       # kata berhubung terpotong baris: masing-\nmasing
    s = s.replace('`', "'").replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return s.split()

for p in halaman:
    a = norm_md(seg(p))
    b = norm_t(open(f'{tess_dir}/p{p:03d}.txt', encoding='utf-8').read())
    an = [re.sub(r'[^\w/()]', '', w.lower()) for w in a]
    bn = [re.sub(r'[^\w/()]', '', w.lower()) for w in b]
    sm = difflib.SequenceMatcher(None, an, bn, autojunk=False)
    out = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal': continue
        x, y = ' '.join(a[i1:i2]), ' '.join(b[j1:j2])
        if re.fullmatch(r'\(\d\)[,.]?', x) and re.fullmatch(r'\((J|Jl|l|I|)\)[,.]?', y): continue   # artefak Tesseract
        if x == '' and y in (':', ';', '.', ','): continue
        # selisih yang hanya berupa pemotongan kata di akhir baris (sebagai-mana / sebagaimana) diberi tanda ~
        tanda = '~' if x.replace('-', '').lower() == y.replace('-', '').lower() else '!'
        kiri = ' '.join(a[max(0, i1 - 3):i1])
        out.append(f'  {tanda} …{kiri} [{x}] ⇄ [{y}]')
    print(f'pdf {p}: {len(a)} kata, rasio {sm.ratio():.3f}, {len(out)} selisih')
    print('\n'.join(out))
