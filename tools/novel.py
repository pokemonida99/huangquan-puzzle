"""查小說原文（src/huangquan-novel/src/novel.md），寫劇情對話時核對說話的人。
用法：
  .venv/bin/python -I tools/novel.py 14            # 印出小說第 14 章全文（去掉插圖行）
  .venv/bin/python -I tools/novel.py grep 忘憂耳機   # 全書搜尋，印出所在章與前後各 3 行
小說章節 ↔ 劇集對照見 src/huangquan-novel/src/appendix.md（小說一章包含好幾話）。
"""
import re, sys
from pathlib import Path
md = (Path(__file__).resolve().parent.parent / "src/huangquan-novel/src/novel.md").read_text()
lines = [l for l in md.split("\n") if not l.startswith("![")]
chap = []   # 每行所屬章
cur = ""
for l in lines:
    m = re.match(r"## 第(\d+)章", l)
    if m: cur = m.group(1)
    chap.append(cur)
if sys.argv[1] == "grep":
    kw = sys.argv[2]
    for i, l in enumerate(lines):
        if kw in l:
            print(f"--- 第{chap[i]}章 (行 {i})")
            print("\n".join(x for x in lines[max(0, i - 3):i + 4] if x.strip()))
else:
    n = sys.argv[1].zfill(2)
    print("\n".join(l for i, l in enumerate(lines) if chap[i] == n and l.strip()))
