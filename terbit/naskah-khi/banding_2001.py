"""Banding kata demi kata: naskah aplikasi (edisi Kemenag 2018) dengan salinan ketik edisi Departemen Agama 2001.

Pakai: python3 -I terbit/naskah-khi/banding_2001.py naskah/khi-kemenag-2018.md <teks-salinan.txt> <keluaran.json>

<teks-salinan.txt> adalah teks PDF salinan JDIH Universitas Sumatera Utara (lihat banding-2001.md), diekstrak dengan
PyMuPDF (page.get_text() per halaman, digabung baris baru). PDF salinan tidak disertakan dalam repo.
Keluaran: daftar [pasal, rasio kemiripan, [[op, kata naskah, kata salinan], ...]] untuk pasal yang berbeda.
Hampir semua selisih adalah salah ketik salinan atau judul yang ikut terbaca; selisih lain diperiksa pada pindaian.
"""
import re, sys, difflib, json
md = open(sys.argv[1], encoding='utf8').read()
usu = open(sys.argv[2], encoding='utf8').read()

def blok_md(md):
    out = {}
    body = md.split('## PENJELASAN')[0] if '## PENJELASAN' in md else md
    parts = re.split(r'^##### Pasal (\d+)\s*$', body, flags=re.M)
    for i in range(1, len(parts), 2):
        k = int(parts[i]); t = parts[i+1]
        t = re.sub(r'<!--.*?-->', ' ', t, flags=re.S)
        t = '\n'.join(l for l in t.split('\n') if not l.startswith('> ') and not l.startswith('#'))
        out[k] = t
    return out

def blok_usu(u):
    # potong sebelum Penjelasan
    m = re.search(r'^\s*PENJELASAN', u, flags=re.M)
    u = u[:m.start()] if m else u
    out = {}
    parts = re.split(r'^\s*Pasal (\d+)\s*$', u, flags=re.M)
    for i in range(1, len(parts), 2):
        k = int(parts[i]); t = parts[i+1]
        t = re.sub(r'^\s*(BUKU|BAB|Bagian|BAGIAN)\b.*$', ' ', t, flags=re.M)
        if k not in out: out[k] = t
    return out

def norm(t):
    t = t.replace('`', "'").replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    t = t.lower()
    t = re.sub(r'\(\s*(\d+|[a-z])\s*\)', ' ', t)          # (1) (a)
    t = re.sub(r'(?m)^\s*(\d+|[a-z])\s*[.)]\s', ' ', t)      # 1. a.
    t = re.sub(r"[^\w'\-/]+", ' ', t)
    t = re.sub(r'(?<!\w)-|-(?!\w)', ' ', t)
    return t.split()

A, B = blok_md(md), blok_usu(usu)
hasil = []
for k in sorted(set(A) | set(B)):
    if k not in A or k not in B:
        hasil.append((k, 'hanya di ' + ('naskah' if k in A else 'USU'), []))
        continue
    a, b = norm(A[k]), norm(B[k])
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    d = [(op, ' '.join(a[i1:i2]), ' '.join(b[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    if d: hasil.append((k, '%.3f' % sm.ratio(), d))
json.dump(hasil, open(sys.argv[3], 'w'), ensure_ascii=False, indent=0)
print('pasal naskah', len(A), 'pasal USU', len(B), 'pasal berbeda', len(hasil))
print('hanya satu sisi:', [(k, r) for k, r, d in hasil if not d])
