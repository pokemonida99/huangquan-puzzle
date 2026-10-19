"""把 art/*.png（卡面、敵人、背景）轉成 webp。用法：.venv/bin/python -I tools/assets.py"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent.parent
art = root / "art"
for p in art.glob("*.png"):
    im = Image.open(p).convert("RGB")
    w = 1080 if p.stem.startswith("bg") else 768
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(p.with_suffix(".webp"), quality=84)
print(sorted(x.name for x in art.glob("*.webp")))
