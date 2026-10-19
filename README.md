# 黃泉燒肉店 轉珠試玩版

《黃泉燒肉店》（棲渺拾光）角色的轉珠三消遊戲試玩版，玩法參考神魔之塔：拖曳符石 5 秒、相連同色算一個 combo、落珠連鎖、隊長／戰友技能、主動技能 CD。

- 預覽：上層 `.claude/launch.json` 的 `huangquan-puzzle`（port 4190）
- 試玩隊伍：業鏡羅漢 李國志（隊長）＋ 吳小白、小雨、大寶、阿副 ＋ 業鏡羅漢 李國志（戰友）
- 關卡：三途川「第三王國入侵」3 波（蝙蝠惡魔 → 瘟疫、第三王國惡魔 → 撒旦）

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` `style.css` `game.js` | 遊戲本體（標題、隊伍、戰鬥、圖鑑） |
| `data.js` | 屬性、系列、卡片數值與技能、敵人、關卡 |
| `art/` | 卡面（GPT 依劇照重繪）、敵人（劇照裁切）、`av/` 預定角色頭像 |
| `refs/` | 生卡面用的劇照參考 |
| `tools/gen.sh` | 用 ChatGPT.app 的 codex 生圖：`tools/gen.sh <名稱> "<提示詞>" 參考圖...` |
| `tools/assets.py` | png → webp、切敵人圖：`.venv/bin/python -I tools/assets.py` |
| `src/` | 下載的兩個專案 huangquan-novel、qimiao-shiguang（素材來源，不進 git） |

## 新增卡片

1. 從 `src/qimiao-shiguang/assets/g/` 或劇照挑參考圖放進 `refs/`
2. `tools/gen.sh <id> "<提示詞>" refs/<圖>` → 跑 `tools/assets.py`
3. 在 `data.js` 的 `CARDS` 加一筆；進化用 `evo` 串下一階段，同一個 `who` 會在圖鑑排成進化鏈
