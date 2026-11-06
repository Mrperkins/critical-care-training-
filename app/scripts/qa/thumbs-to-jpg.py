"""Centre-crop each captured scene still to 16:9 and save it as a 640x360 JPEG card image."""
import sys, glob, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    im = Image.open(f).convert('RGB'); w, h = im.size
    out = os.path.join(dst, os.path.basename(f)[:-4] + '.jpg')
    if h > w * 0.8:  # tall scene (e.g. the MI Locator pane): fit it whole on its own background instead of cropping the organ
        bg = Image.new('RGB', (640, 360), im.getpixel((4, 4))); t = im.copy(); t.thumbnail((640, 360), Image.LANCZOS)
        bg.paste(t, ((640 - t.width) // 2, (360 - t.height) // 2)); bg.save(out, quality=80, optimize=True, progressive=True); print(out); continue
    th = int(w * 9 / 16)
    box = (0, (h - th) // 2, w, (h - th) // 2 + th) if th <= h else ((w - int(h * 16 / 9)) // 2, 0, (w - int(h * 16 / 9)) // 2 + int(h * 16 / 9), h)
    im.crop(box).resize((640, 360), Image.LANCZOS).save(out, quality=80, optimize=True, progressive=True)
    print(out, os.path.getsize(out) // 1024, 'KB')
