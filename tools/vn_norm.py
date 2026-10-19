"""立繪統一取景：從頭頂往下裁到「頭長 × 4.5」，每個角色的頭大小與位置才一致。
原檔在 work/vn/full/，輸出覆蓋 art/vn/。用法：.venv/bin/python -I tools/vn_norm.py
HEAD：每個角色的頭長占整張高度的比例（頭頂到下巴，依 normal 圖量測）；None 表示不裁（鼠軍師是整隻倉鼠）。"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent.parent
HEAD = {"bohong": .175, "lee": .157, "leviathan": .195, "linbobo": .208, "yuelao": .208, "yutong": .15, "rat": None,
        "yutongh": .257, "youshuzhang": .171, "liudaniu": .142, "guanyin": .185, "qianliyan": .18, "yangzi": .184, "nova": .132,
        "baizhu": .24, "shushi": .18, "cherub": .16, "gyxiaoqing": .128, "lucifer": .17, "zhurong": .15, "gengyin": .16}
N = 4.5
# 帽子高度（占整張高度比例，帽頂到髮際線）：帽子不算頭長，額外加在上方，輸出會比 1100 高
HAT = {"lee": .114, "yangzi": .069, "liudaniu": .08, "youshuzhang": .035, "nova": .189, "gyxiaoqing": .125}
for src in sorted((root / "work/vn/full").glob("*.webp")):
    key = src.stem.rsplit("-", 1)[0]
    im = Image.open(src)
    if HEAD.get(key):
        top = im.split()[-1].getbbox()[1]
        body = im.height * HEAD[key] * N
        hat = im.height * HAT.get(key, 0)
        im = im.crop((0, top, im.width, min(im.height, top + round(body + hat))))
        k = 1100 / body
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(root / "art/vn" / src.name, quality=85)
    print(src.name, im.size)
