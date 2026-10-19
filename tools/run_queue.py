"""依 work/queue.json 平行生圖（已經有 art/<name>.png 的跳過）。用法：python3 tools/run_queue.py [並行數]"""
import json, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
root = Path(__file__).resolve().parent.parent
q = [x for x in json.load(open(root / "work/queue.json")) if not (root / "art" / f"{x['name']}.png").exists()]
print(f"待生 {len(q)} 張", flush=True)
def run(x):
    for attempt in range(2):
        r = subprocess.run([str(root / "tools/gen.sh"), x["name"], x["prompt"], *x["refs"]], cwd=root, capture_output=True, text=True)
        if (root / "art" / f"{x['name']}.png").exists():
            print("OK", x["name"], flush=True); return
    print("FAIL", x["name"], r.stdout.strip(), flush=True)
with ThreadPoolExecutor(int(sys.argv[1]) if len(sys.argv) > 1 else 6) as ex:
    list(ex.map(run, q))
print("DONE", flush=True)
