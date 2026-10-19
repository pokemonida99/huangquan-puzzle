"""把 art/*.png（卡面、敵人、背景）轉成 webp。用法：.venv/bin/python -I tools/assets.py"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
root = Path(__file__).resolve().parent.parent
art = root / "art"
for p in art.glob("*.png"):
    if p.stem.startswith("orb-"):
        continue
    if p.stem.startswith("enemy-"):
        # 敵人：邊緣做橢圓羽化透明，直接疊在戰場背景上
        im = Image.open(p).convert("RGB")
        im = im.resize((520, round(im.height * 520 / im.width)), Image.LANCZOS)
        W, H = im.size
        m = Image.new("L", (W // 4, H // 4), 0)
        ImageDraw.Draw(m).ellipse((W // 4 * .08, H // 4 * .04, W // 4 * .92, H // 4 * .98), fill=255)
        m = m.filter(ImageFilter.GaussianBlur(W // 4 * .07)).resize((W, H), Image.LANCZOS)
        im.putalpha(m)
        im.save(p.with_suffix(".webp"), quality=78, method=6)
        continue
    im = Image.open(p).convert("RGB")
    # 壓縮：卡面 600 寬（手機上最大約 2 倍螢幕寬的一半），背景 900 寬
    bg = p.stem.startswith("bg")
    w = 900 if bg else 600
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(p.with_suffix(".webp"), quality=72 if bg else 76, method=6)
# 符石：找出圓球範圍、裁成正方形、加圓形透明遮罩
for p in art.glob("orb-*.png"):
    im = Image.open(p).convert("RGB")
    gray = im.convert("L").point(lambda v: 255 if v > 40 else 0)
    box = gray.getbbox()
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    r = max(box[2] - box[0], box[3] - box[1]) / 2
    im = im.crop((round(cx - r), round(cy - r), round(cx + r), round(cy + r))).resize((192, 192), Image.LANCZOS)
    big = Image.new("L", (768, 768), 0)
    ImageDraw.Draw(big).ellipse((6, 6, 762, 762), fill=255)
    mask = big.resize((192, 192), Image.LANCZOS).filter(ImageFilter.GaussianBlur(.6))
    im.putalpha(mask)
    im.save(p.with_suffix(".webp"), quality=90)
# 劇情立繪：高度 1100（李國志含禮帽 1278）的縮成 0.85 倍，比例不變
for p in (root / "art/vn").glob("*.webp"):
    im = Image.open(p)
    if im.height >= 1000:
        im = im.resize((round(im.width * .85), round(im.height * .85)), Image.LANCZOS)
        im.save(p, quality=78, method=6)
print(sorted(x.name for x in art.glob("*.webp")))
