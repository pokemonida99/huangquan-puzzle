"""立繪統一取景：從頭頂往下裁到「頭長 × 4.5」，每個角色的頭大小與位置才一致。
原檔在 work/vn/full/，輸出覆蓋 art/vn/。用法：.venv/bin/python -I tools/vn_norm.py
HEAD：每個角色的頭長占整張高度的比例（頭頂到下巴，依 normal 圖量測）；None 表示不裁（鼠軍師是整隻倉鼠）。"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent.parent
HEAD = {"bohong": .175, "lee": .245, "leviathan": .195, "linbobo": .208, "yuelao": .208, "yutong": .15, "rat": None}
N = 4.5
for src in sorted((root / "work/vn/full").glob("*.webp")):
    key = src.stem.rsplit("-", 1)[0]
    im = Image.open(src)
    if HEAD.get(key):
        top = im.split()[-1].getbbox()[1]
        h = min(im.height, top + round(im.height * HEAD[key] * N))
        im = im.crop((0, top, im.width, h))
        im = im.resize((round(im.width * 1100 / im.height), 1100), Image.LANCZOS)
    im.save(root / "art/vn" / src.name, quality=85)
    print(src.name, im.size)
