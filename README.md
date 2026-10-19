# 黃泉燒肉店 轉珠試玩版

《黃泉燒肉店》（棲渺拾光）角色的轉珠三消遊戲試玩版，玩法參考神魔之塔：拖曳符石 5 秒、相連同色算一個 combo、落珠連鎖、隊長／戰友技能、主動技能 CD。

- 預覽：上層 `.claude/launch.json` 的 `huangquan-puzzle`（port 4190）
- 角色 50 位（52 張卡，李國志有三階進化），分 7 個系列；隊伍每一格都能換卡，存在 localStorage `hq-team`
- 主線五章（`story.js`）：〈請給我黑令旗〉語彤魔化、〈刀鋸地獄〉打辣雞、〈大秦右庶長〉月老外傳（古神之眼）、〈魔界的獨角鯨〉利維坦來訪與抓交替的冤魂、〈第三王國入侵〉打撒旦。通關進度存在 `hq-progress`；章節可用 `vn` 指定該時期的立繪造型
- 劇情對話：角色台詞用劇中原句（標集數），旁白只交代劇中發生的事；立繪放 `art/vn/<代號>-<表情>.webp`，沒有立繪的退回卡面
- 劇情特殊行：`["@scene", 圖]` 換場景劇照（`art/scenes/`，取自資料館依原作場景重製的劇照）；`["@intro", 角色]` 人物登場卡（文字在 `INTRO`）。角色第一次說話時會自動補登場卡
- 圖檔壓縮：卡面 600 寬 q76、背景 900 寬、敵人 520 寬、劇照 960 寬 q70、立繪 0.85 倍（`tools/assets.py`）

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` `style.css` `game.js` | 遊戲本體（標題、隊伍、戰鬥、圖鑑） |
| `cards.js` | 第二批 45 位角色的卡片（稱號、屬性、技能、生圖描述） |
| `profiles.js` | 自動產生（`node tools/gen_profiles.js > profiles.js`）：新角色的故事與資料，取自資料館 |
| `story.js` | 三章劇情、對話、波次與新敵人；`VN` 是立繪代號 |
| `tools/vn_prompts.sh` `tools/vn_queue.sh` `tools/vn_cut.py` `tools/vn_norm.py` | 劇情立繪：洋紅底生圖（同角色其他表情拿 normal 當參考）→ 去背 → 統一取景（頭頂往下 4.5 個頭長），輸出 `art/vn/<代號>-<表情>.webp` |
| `tools/queue.js` `tools/run_queue.py` | 產生生圖佇列、平行生圖（已有的跳過） |
| `data.js` | 屬性、系列、卡片數值與技能、敵人、關卡、角色檔案（背景故事、別名、登場集數、關係、台詞） |
| `art/` | 卡面、敵人（GPT 依劇照重繪）、符石 `orb-*`（GPT 生成後去背）、`av/` 預定角色頭像 |
| `refs/` | 生卡面用的劇照參考 |
| `tools/gen.sh` | 用 ChatGPT.app 的 codex 生圖：`tools/gen.sh <名稱> "<提示詞>" 參考圖...` |
| `tools/assets.py` | png → webp；敵人邊緣羽化、符石裁圓去背：`.venv/bin/python -I tools/assets.py` |
| `src/` | 下載的兩個專案 huangquan-novel、qimiao-shiguang（素材來源，不進 git） |

## 新增卡片

1. 從 `src/qimiao-shiguang/assets/g/` 或劇照挑參考圖放進 `refs/`
2. `tools/gen.sh <id> "<提示詞>" refs/<圖>` → 跑 `tools/assets.py`
3. 在 `data.js` 的 `CARDS` 加一筆；進化用 `evo` 串下一階段，同一個 `who` 會在圖鑑排成進化鏈

## 配樂、音效與震動（`audio.js`）

- 配樂音檔：原檔在 `配樂/`（不進 git），壓縮成 AAC 80kbps、音量統一 −18 LUFS、修掉頭尾靜音後放 `audio/`：`title` 標題與選單、`battle1/2` 戰鬥、`boss1/2` 王關。每章用哪首寫在 `story.js` 各章的 `music`。
- 重新壓縮：`ffmpeg -i 配樂/xx.mp3 -vn -af loudnorm=I=-18:TP=-1.5:LRA=11 -c:a aac -b:a 80k audio/xx.m4a`

- 全部用 WebAudio 即時合成，沒有音檔。樂器有太鼓、古箏、二胡、銅管、銅鑼、和聲墊，加一層殘響。
- 配樂三首，都是 8 小節循環：`title` 標題（D 小調慢板，古箏琶音）、`battle` 戰鬥（132 BPM，太鼓＋二胡主旋律）、`boss` 撒旦（148 BPM，C 小調加降 D 和弦，破音貝斯、銅管重音）。旋律寫在 `SONGS` 的 `lead`，格式是 `[音高(MIDI), 長度(十六分音符格數)]`。
- 撒旦登場（`game.js` 的 `bossIntro`）：暗場＋WARNING 警示帶、地鳴、三聲越來越重的重擊（畫面震動＋紅閃）、咆哮現身、名字砸下來，接著王關配樂。撒旦攻擊時也會大震。
- 震動用 `navigator.vibrate`，Android 的 Chrome 可以，iPhone 的瀏覽器都不支援。
- 設定（標題右上、戰鬥畫面的齒輪）：配樂、音效、震動三個開關，存在 localStorage 的 `hq-settings`。

## 平衡（`tools/sim.js`、`tools/tune.js`）

- 隊長＋戰友的倍率相乘，所以隊長技倍率統一壓縮：新倍率 = 1 + (原倍率 − 1) × 0.6（`cards.js`）。同一張卡當隊長與戰友時，掉落機率不疊加。
- `node tools/sim.js`：各隊伍（初始隊、推薦隊、全 3 星隊、最強隊）在每章打王要幾回合、能扛幾下。假設普通回合 4 combo（五屬隊消 4 種顏色，其他隊主色 2 組＋雜色 2 組）。
- `node tools/tune.js`：依初始隊算各章敵人血量（王的目標回合：5、7、8、9、11），實際採用 75%。
- 王的屬性每章不同：暗（語彤）→ 木（陳樂基）→ 光（古神之眼，只受暗屬性傷害）→ 水（利維坦）→ 火（撒旦）。
- 「只能用 3 星卡」挑戰關的敵人生命 30%、攻擊 60%。
