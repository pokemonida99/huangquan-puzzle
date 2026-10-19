"""洋紅 #FF00FF 去背 → art/vn/<name>.webp（純 Pillow）
用法: .venv/bin/python -I tools/vn_cut.py work/vn/vn-yutong-normal.png [...]  (輸出名去掉 'vn-' 前綴)
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "art" / "vn"
H = 1100
LO, HI = 90, 150   # 洋紅度(min(R,B)-G)門檻：<LO 不透明，>HI 全透明

def cut(src, dst):
    im = Image.open(src).convert("RGB")
    r, g, b = im.split()
    m = ImageChops.subtract(ImageChops.darker(r, b), g)            # 洋紅度
    A = m.point(lambda v: int(255 * min(1, max(0, 1 - (v - LO) / (HI - LO)))))
    A = A.filter(ImageFilter.MinFilter(5))                          # 吃掉一圈殘邊
    A = A.filter(ImageFilter.GaussianBlur(0.8))                     # 輕微羽化
    # 邊緣去色溢：靠近透明處把洋紅分量從 R、B 扣掉
    edge = A.point(lambda v: 255 if v < 250 else 0).filter(ImageFilter.MaxFilter(15))
    spill = ImageChops.multiply(m, edge)
    r2, b2 = ImageChops.subtract(r, spill), ImageChops.subtract(b, spill)
    out = Image.merge("RGB", (r2, g, b2)).convert("RGBA")
    out.putalpha(A)
    bbox = A.point(lambda v: 255 if v > 8 else 0).getbbox()
    out = out.crop(bbox)
    out = out.resize((round(out.width * H / out.height), H), Image.LANCZOS)
    out.save(dst, "WEBP", quality=85, method=6)
    return out.size

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for s in sys.argv[1:]:
        name = Path(s).stem.removeprefix("vn-")
        print(name, cut(s, OUT / f"{name}.webp"))
