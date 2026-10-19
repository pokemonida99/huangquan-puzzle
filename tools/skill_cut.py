"""發招姿勢圖去背：work/skill/<id>.png（洋紅底）→ art/skill/<id>.webp（高 900）
用法: .venv/bin/python -I tools/skill_cut.py work/skill/*.png
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import vn_cut
vn_cut.H = 900
OUT = Path(__file__).resolve().parent.parent / "art" / "skill"
for src in sys.argv[1:]:
    p = Path(src)
    print(p.stem, vn_cut.cut(p, OUT / (p.stem + ".webp")))
