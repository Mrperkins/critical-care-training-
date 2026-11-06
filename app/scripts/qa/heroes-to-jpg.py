"""Turn raw scene captures into hero stills: 1920x820 (and an 800w copy) with the subject set right of centre
on its own background, edges feathered, so page copy can sit on the left.  usage: heroes-to-jpg.py IN_DIR OUT_DIR"""
import sys, glob, os
from PIL import Image, ImageFilter, ImageChops
import numpy as np
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
W, H = 1920, 820
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert('RGB'); a = np.asarray(im).astype(int)
    corners = np.concatenate([a[:8, :8].reshape(-1, 3), a[:8, -8:].reshape(-1, 3), a[-8:, :8].reshape(-1, 3), a[-8:, -8:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    diff = np.abs(a - bg).sum(axis=2) > 45
    rows = np.where(diff.sum(axis=1) > a.shape[1] * 0.01)[0]; cols = np.where(diff.sum(axis=0) > a.shape[0] * 0.01)[0]
    if not len(rows) or not len(cols): print('empty', name); continue
    t, b, l, r = rows[0], rows[-1], cols[0], cols[-1]
    mh, mw = int((b - t) * 0.12), int((r - l) * 0.12)
    t, b, l, r = max(0, t - mh), min(a.shape[0], b + mh), max(0, l - mw), min(a.shape[1], r + mw)
    crop = im.crop((l, t, r, b))
    ca = np.asarray(crop).astype(int); edge = np.concatenate([ca[:4].reshape(-1, 3), ca[-4:].reshape(-1, 3), ca[:, :4].reshape(-1, 3), ca[:, -4:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)  # match the backdrop where the crop meets the canvas, so no seam shows
    s = min(H * 0.84 / crop.height, W * 0.58 / crop.width); crop = crop.resize((max(1, int(crop.width * s)), max(1, int(crop.height * s))), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), tuple(int(x) for x in bg))
    mask = Image.new('L', crop.size, 0); f_ = max(16, int(min(crop.size) * 0.14))
    mask.paste(255, (f_, f_, crop.width - f_, crop.height - f_)); mask = mask.filter(ImageFilter.GaussianBlur(f_ / 2))
    x = int(W * 0.66 - crop.width / 2); x = min(x, W - crop.width); y = int((H - crop.height) / 2)
    canvas.paste(crop, (x, y), mask)
    canvas.save(os.path.join(out, name + '.jpg'), quality=80, optimize=True, progressive=True)
    canvas.resize((800, int(800 * H / W)), Image.LANCZOS).save(os.path.join(out, name + '-800.jpg'), quality=78, optimize=True, progressive=True)
    print('ok', name)
