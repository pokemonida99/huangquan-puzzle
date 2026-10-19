"""把 art/*.png 轉成 webp，並從劇照切出敵人圖。用法：.venv/bin/python -I tools/assets.py"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent.parent
art = root / "art"
G = root / "src/qimiao-shiguang/assets"
for p in art.glob("*.png"):
    im = Image.open(p).convert("RGB")
    w = 1080 if p.stem.startswith("bg") else 768
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(p.with_suffix(".webp"), quality=84)
# 敵人：(輸出名, 來源, 裁切比例 left,top,right,bottom)
enemies = [
    ("enemy-bat", G / "c/c074.jpg", (0, 0, 1, .74)),
    ("enemy-reaper", G / "g/c072-1.jpg", (0, 0, 1, 1)),
    ("enemy-plague", G / "g/c075-2.jpg", (0, 0, 1, 1)),
    ("enemy-satan", G / "g/c071-3.jpg", (0, 0, 1, 1)),
]
for name, src, (l, t, r, b) in enemies:
    im = Image.open(src).convert("RGB")
    W, H = im.size
    im = im.crop((round(l * W), round(t * H), round(r * W), round(b * H)))
    im.save(art / f"{name}.webp", quality=86)
print(sorted(x.name for x in art.glob("*.webp")))
