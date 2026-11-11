/* =========================================================================
   黃泉燒肉店 轉珠 ‧ 第二批卡片（45 位角色）
   每列：[id, 角色, 稱號, 屬性, 種族, 系列, 型, 隊長技名, 隊長技效果, 主動技名, CD, 主動技效果, 生圖描述]
   型：atk 攻擊型、hp 生命型、rec 回復型、bal 平均型
   星數與生命／攻擊／回復不寫在這裡，統一由下方「戰力階級」區塊依階級、型、屬性算出
   稱號、技能名取自劇中出現過的稱呼、事件與台詞；卡面描述只拿來生圖。
   ========================================================================= */
/* 自動排版的版面（新版主動技 arrange）：w 水、f 火、g 木、l 光、d 暗、h 心；game.js 照字母排盤 */
window.ARRANGE = {
  "water-rows": ["wwwwww", "hhhhhh", "wwwwww", "ffffff", "wwwwww"],
  "water-heart": ["wwwwww", "wwwwww", "hhhhhh", "wwwwww", "hhhhhh"],
  "water-all": ["wwwwww", "wwwwww", "wwwwww", "wwwwww", "wwwwww"],
  "water-cross": ["hwwwwh", "hwwwwh", "wwwwww", "hwwwwh", "hwwwwh"],
  "dark-rows": ["dddddd", "llllll", "dddddd", "hhhhhh", "dddddd"],
  "dark-heart": ["dddddd", "dddddd", "hhhhhh", "dddddd", "hhhhhh"],
  "dark-all": ["dddddd", "dddddd", "dddddd", "dddddd", "dddddd"],
  "light-all": ["llllll", "llllll", "llllll", "llllll", "llllll"],
  "fire-all": ["ffffff", "ffffff", "ffffff", "ffffff", "ffffff"],
  "wood-cross": ["hggggh", "hggggh", "gggggg", "hggggh", "hggggh"],
  "six": ["wwwfff", "ggglll", "dddhhh", "wwwfff", "ggglll"]
};
window.ARRANGE_DESC = {
  "water-rows": "水符石排成三橫排（中間夾心、火各一排）", "water-heart": "水符石與心符石整排排好", "water-all": "整版水符石",
  "water-cross": "水符石排成一個大十字，四角是心符石", "dark-rows": "暗符石排成三橫排（中間夾光、心各一排）", "dark-heart": "暗符石與心符石整排排好",
  "dark-all": "整版暗符石", "light-all": "整版光符石", "fire-all": "整版火符石", "wood-cross": "木符石排成一個大十字，四角是心符石",
  "six": "五屬性與心符石排成一組組三連，一次可以消出 10 combo、六種顏色"
};
(() => {
// 進化鏈的階段（同一角色在圖鑑、換卡器依這個排序）
const STAGE_OF = { yutong1: 1, yutong: 2, yutong3: 3, yutong4: 4, yutong5: 5, xiaoyu2: 2, dabao2: 2, dabao3: 3, afu2: 2, dabao4: 4 };
const ROWS = [
  /* 黃泉燒肉店 */
  // 語彤是主角，四階進化依劇中衣著的時期：高中生 → 燒肉店 → 狐姬改造後 → 實習月老 → 覺醒（EP5-13 同一套漢服外加白紗）
  ["yutong1", "語彤", "呆丸高中生", "dark", "半魔", "shop", "atk", "黑令旗", { attrAtk: { dark: 2 } }, "魔氣", 6, { convert: ["heart", "dark"] }, null],
  ["yutong", "語彤", "燒肉店的乾女兒", "dark", "半魔", "shop", "bal", "胎記是神的印章", { attrAtk: { dark: 2 }, allRec: 1.3 }, "巧克力醬菜單", 5, { convert: ["light", "dark"], healPct: .2 },
    "Lin Yutong, a teenage girl with a short mint-green bob with dark roots and blunt bangs, round black glasses, a dark red birthmark around one eye, wearing the dark grey Huangquan Yakiniku staff shirt with a small gold embroidered shop name on the chest, standing in the warm yakiniku restaurant. No robe, no red thread"],
  ["yutong3", "語彤", "赤戀星空", "dark", "半魔", "shop", "bal", "赤戀星空", { attrAtk: { dark: 2.5 } }, "暈船雷達", 7, { convert: ["heart", "dark"], buff: 1.3 }, null],
  ["yutong4", "語彤", "實習月老", "dark", "半魔", "shop", "atk", "恨之歌", { attrAtk: { dark: 2.5 }, allHp: 1.2 }, "月老廟的香火", 8, { convert: ["light", "dark"], nuke: 15 }, null],
  ["yutong5", "語彤", "有了神性的小月老", "dark", "半魔", "shop", "atk", "是你嗎？林語彤", { attrAtk: { dark: 3 }, allHp: 1.3 }, "愛戀文印", 6, { convert: ["light", "dark"], nuke: 30, buff: 1.8 }, null],
  ["baimei", "白妹", "碧落髮廊", "wood", "人類", "shop", "rec", "等了幾十年", { allRec: 2 }, "百元快剪", 5, { convert: ["dark", "wood"] },
    "Bai Mei, a woman with long purple hair and big black glasses, black kimono-style barber outfit, holding scissors and a comb, old-fashioned underworld hair salon with warm lamps"],
  /* 呆丸消防隊 */
  ["akasaka", "赤坂", "消防隊長", "fire", "人類", "fire", "hp", "隊長與小隊長", { attrAtk: { fire: 2 } }, "替我擋住火勢", 6, { guard: 1, buff: 1.5 },
    "Akasaka, the fire captain: dark hair with red streaks tied back, black rectangular glasses, wearing a plain white polo shirt, calm and reliable expression, fire station office at night"],
  ["samurai", "紅衣武士", "赤坂的前世", "fire", "人類", "fire", "atk", "三輩子的約定", { attrAtk: { fire: 2.5 } }, "救下白狐", 8, { nuke: 18 },
    "a samurai warrior with long black hair and glasses in red lacquered Japanese armor, katana drawn, cherry blossoms and embers, a small white fox at his feet"],
  /* 人間 */
  ["linbobo", "林伯伯", "木雕師傅", "wood", "人類", "human", "hp", "最好的爸爸", { attrAtk: { wood: 2 } }, "第六十一籤", 7, { healPct: .4 },
    "Uncle Lin, a middle-aged Taiwanese father with short graying hair, holding a walking cane and a wood-carving chisel beside a half-carved wooden goddess statue, warm workshop full of wood shavings"],
  ["bohong", "王柏宏", "百米冠軍", "fire", "人類", "human", "atk", "跑進十秒", { attrAtk: { fire: 2 } }, "就算我跑的再快", 6, { buff: 1.8 },
    "Wang Bohong, a teenage sprinter with short spiky black hair, wearing a black zip-up athletic track jacket with white stripes, determined face, running track at dusk"],
  ["xiaoqing", "筱晴", "杜先生的未婚妻", "water", "人類", "human", "rec", "巧克力牛奶", { allRec: 2 }, "醫院志工", 6, { healPct: .5 },
    "Xiaoqing, a young woman with light brown hair under a straw sun hat, gentle smile, wearing a hospital volunteer vest and holding a carton of chocolate milk, soft sunlight"],
  ["afugf", "阿副的女友", "戴紅毛帽的女孩", "wood", "人類", "human", "bal", "叫了救護車", { allHp: 1.5 }, "已經叫警察了", 6, { healPct: .2, buff: 1.5 },
    "a young woman with a short black bob wearing a red knit beanie and a casual jacket, determined look, harbor at night with city lights"],
  ["moti", "茉蒂", "龐克女孩", "dark", "人類", "human", "atk", "樂團同伴", { attrAtk: { dark: 2 } }, "我坐火車來看你", 6, { convert: ["light", "dark"] },
    "Moti, a girl with a black bob with bangs under a white knit beanie, a small lip ring, wearing a black tank top and a silver cross necklace, night street"],
  ["daniu", "大牛", "老闆生前的兄弟", "light", "人類", "human", "hp", "傻兄弟", { attrAtk: { light: 2 } }, "輪迴許可", 6, { healPct: .3, selfBuff: 2 },
    "Da Niu, a bald stocky man in a white tank top with a rugged kind face, holding a wooden reincarnation permit plaque, 1940s Taiwanese village street"],
  /* 三途川居民 */
  ["mimi", "咪咪", "917號引渡貓", "water", "貓", "sanzu", "bal", "記得多喝水", { attrAtk: { water: 2 } }, "三花幫", 6, { convert: ["fire", "water"] },
    "Mimi, a girl with long straight black hair, wearing a navy-and-white sailor school uniform with a navy neckerchief, gentle sad eyes, old train station platform of the underworld. Human ears only, no cat ears, nothing in her hands"],
  ["heitang", "黑糖", "慰靈犬", "wood", "犬", "sanzu", "rec", "托夢之恩", { attrAtk: { wood: 2 } }, "別吃綠色的糖", 6, { convert: ["dark", "wood"] },
    "Heitang, a black-and-white border collie dog with a white blaze on his face and white chest, tongue out happily, sitting on a stone path in the underworld. No scarf, no collar accessories"],
  ["huji", "狐姬", "萬能打工王", "fire", "妖", "sanzu", "atk", "等了三輩子", { attrAtk: { fire: 2.5 } }, "百年妖狐", 7, { nuke: 15 },
    "Huji, a fox spirit girl with long dark hair, a pink cat-ear headband and a fluffy pink fox tail, pink outfit, pink fox fire floating around her, night street of lanterns"],
  ["no7", "七號", "戲之魂偶", "water", "魂偶", "sanzu", "rec", "開心而哭", { attrAtk: { water: 2 } }, "推薦甜點", 6, { healPct: .35 },
    "No.7, a handsome soul-puppet young man with dark purple hair in a topknot, white shirt, one elegant mechanical arm, holding a glowing blue pendant, small theater stage with curtains"],
  ["no2", "二號", "女魂偶", "dark", "魂偶", "sanzu", "bal", "對戲", { attrAtk: { dark: 2 } }, "很想很想他", 6, { buff: 1.6 },
    "No.2, a female soul puppet with a dark bob and an ornate jeweled headpiece, porcelain-smooth skin with subtle doll joints, mechanical fingers, rehearsal room with soft spotlight"],
  ["du", "杜先生", "紋身師", "dark", "人類", "sanzu", "atk", "愛戀文印", { attrAtk: { dark: 2.5 } }, "一天兩次文印", 8, { convert: ["water", "dark"], buff: 1.5 },
    "Mr. Du, a middle-aged man with short grey hair and round thin-framed glasses, wearing a plain cream t-shirt, warm tired smile, a dim tattoo parlor with faint glowing red rune tattoos floating in the air"],
  ["paofu", "泡芙", "刀鋸使領班", "dark", "地府官差", "sanzu", "hp", "刀鋸地獄同事", { attrAtk: { dark: 2 } }, "帶走", 6, { selfBuff: 2.5 },
    "Paofu, a Black man with very short hair, wearing a red Chinese-style tunic with black trim and frog buttons (the Saw Hell foreman uniform), expressive face, blue-black hell cavern with an old steam train behind"],
  ["mi", "謎", "守宮精靈", "wood", "精靈", "sanzu", "rec", "健康的守宮", { allRec: 2 }, "甘露寶瓶", 5, { healPct: .4 },
    "Mi, a small cute white gecko spirit wearing a yellow construction hard hat, standing on a sketchbook beside pencils, Gecko Plaza full of drawings"],
  ["xiaomi", "小米", "市役所櫃台", "light", "人類", "sanzu", "hp", "對付奧客的專家", { allHp: 1.5 }, "還不能申請", 6, { guard: 1, buff: 1.5 },
    "Xiaomi, a young woman with a neat black bob and a call-center headset, office uniform, standing at the counter of the underworld city hall"],
  ["gu", "辜老師", "戲劇天才", "dark", "人類", "sanzu", "atk", "幻想的美好", { attrAtk: { dark: 2.5 } }, "穿界門", 8, { nuke: 18 },
    "Teacher Gu, an older man with a grey goatee, dark sunglasses and a tall black top hat, burgundy coat, holding several colorful glowing soul cores, theater stage with red curtains"],
  ["cat918", "918號引渡貓", "灰色引渡貓", "water", "貓", "sanzu", "bal", "隔壁的", { attrAtk: { water: 2 } }, "被圍毆", 5, { convert: ["heart", "water"] },
    "a grey British shorthair cat with round orange eyes and a collar tag numbered 918, sitting on a train station bench of the underworld"],
  ["gongwan", "貢丸君", "295號引渡貓", "dark", "貓", "sanzu", "bal", "引渡", { attrAtk: { dark: 1.5 }, allRec: 1.5 }, "車站值班", 5, { timeUp: 3 },
    "Gongwan, a round black cat with half-closed eyes wearing an orange collar with a tag, sitting by a lantern on a misty underworld train platform"],
  ["maoguai", "毛怪", "下輩子還要當你的狗", "wood", "犬", "sanzu", "rec", "喜歡穿圍裙的人", { allRec: 2 }, "明天的雞腿", 5, { healPct: .3 },
    "Maoguai, a black dog spirit in the form of a gentle girl with short black hair, wearing a purple kimono, sitting at a cozy yakiniku table, soft warm light"],
  /* 神明與天族 */
  ["guanyin", "觀音菩薩", "三途川最強的神", "light", "神", "gods", "atk", "觀音娘娘", { allAtk: 3.5, allHp: 1.5, openStrike: 60 }, "又快又狠", 8, { nuke: 45, buff: 2 },
    "Guanyin, a woman with silver-white and purple hair and thin glasses, wearing a sharp white suit, serene but powerful, a halo of lotus light behind her"],
  ["yuelao", "月老", "月下老人", "light", "神", "gods", "bal", "讓受過傷的人再相信", { attrAtk: { light: 3.5, wood: 3.5 }, allHp: 1.3 }, "紅線", 7, { board: ["lglglg", "lglglg", "lglglg", "lglglg", "lglglg"], boardDesc: "光符石與木符石一直排一直排交錯", buff: 1.5 },
    "Yue Lao, a handsome young man with tousled brown hair, red and white traditional Chinese robe, red threads of fate wrapped around his hand, moonlit temple with hanging red threads"],
  ["huatuo", "華佗", "醫神", "wood", "神", "gods", "rec", "忘憂舞", { attrAtk: { wood: 3 }, allRec: 2, allHp: 1.3, regen: .1 }, "忘憂耳機", 6, { healPct: .5, buff: 1.8 },
    "Hua Tuo, the god of medicine as a hip-hop DJ: knit beanie, round dark sunglasses, gold chain, earrings, big headphones, herbal smoke and neon lights of an underground club"],
  ["yangzi", "陽滋公主", "孟婆", "water", "鬼", "gods", "bal", "孟婆湯", { attrAtk: { water: 2.5 } }, "遺忘之法", 8, { delay: 2, buff: 1.5 },
    "Princess Yangzi who became Meng Po, an elegant woman with black hair in a Qin dynasty updo with silver ornaments, white and pale blue hanfu, holding a bowl of soup, misty bridge over a river"],
  ["jiuwei", "九尾", "藍色九尾狐", "water", "妖", "gods", "hp", "護妹狂魔", { attrAtk: { water: 2.5 } }, "結界術", 7, { guard: 2, selfBuff: 2 },
    "Jiuwei, a woman with lavender-silver hair and glasses, nine flowing blue fox tails behind her, holding a smoking incense stick, blue fox fire and barrier runes"],
  ["qianliyan", "千里眼", "千里眼將軍", "wood", "神", "gods", "hp", "媽祖部將", { attrAtk: { wood: 2 }, allHp: 1.2 }, "Silence", 6, { delay: 1, buff: 1.6 },
    "Qianliyan, the far-seeing general: a deity wearing a green feathered mask and a green feather war robe, Taiwanese temple guardian, sea and sky behind him"],
  ["hathor", "哈索爾", "埃及愛神", "fire", "神", "gods", "atk", "歐西里斯的天秤", { attrAtk: { fire: 3 }, vsDemon: 2 }, "一掌打死", 8, { nuke: 30 },
    "Hathor, the Egyptian love goddess with black bangs, a golden horned headdress with a sun disk, wide gold collar, holding the golden scales of Osiris, desert temple at sunset"],
  ["aphrodite", "阿芙羅黛蒂", "希臘愛神", "light", "神", "gods", "rec", "月桂冠", { attrAtk: { light: 3 }, allRec: 2, regen: .1 }, "豎琴", 7, { healPct: .6, buff: 1.8 },
    "Aphrodite, the Greek love goddess with short dark hair and a flower-and-laurel crown, white Greek dress, holding a golden harp, marble columns and roses"],
  ["aizen", "愛染明王", "日本愛神", "fire", "神", "gods", "atk", "無我境界", { attrAtk: { fire: 2.5 } }, "浮世繪", 7, { convert: ["wood", "fire"] },
    "Aizen Myoo, the Japanese love god: blond man with a golden crown and pearl necklaces, red wrathful-king Buddhist robes, painting ukiyo-e with a large brush, red flames"],
  ["shencha", "神差", "柴犬神", "light", "神", "gods", "bal", "埃及死神", { attrAtk: { light: 2 } }, "排隊買和菓子", 5, { buff: 2 },
    "Shencha, a Shiba Inu-headed Egyptian god of death with a striped golden nemes headdress and a curved khopesh sword, friendly face, Egyptian pillars"],
  ["cherub", "基路伯", "智天使", "light", "天族", "gods", "hp", "責任天使", { allAtk: 3, allHp: 2, regen: .15, survive: 1 }, "解除咫尺天涯", 8, { healPct: 1, guard: 2, convert: ["heart", "light"] },
    "Cherub, a man with short dark hair, wearing a white hooded robe and a gold pendant necklace, kind confident smile, soft heavenly light behind him. No wings"],
  ["zhurong", "祝融", "赤帝", "fire", "半神", "gods", "atk", "半神隊長", { attrAtk: { fire: 3 }, allHp: 1.3, skyfall: { fire: .45 } }, "赤帝之火", 9, { boardTo: "fire", nuke: 20 },
    "Zhurong, the Red Emperor demigod: long wild blond hair, burning eyes, red and gold divine armor, flames swirling, ancient war battlefield"],
  /* 魔界 */
  ["leviathan", "利維坦", "嫉妒魔王", "water", "魔族", "demon", "atk", "無上戰技", { attrAtk: { water: 2.5 }, allHp: 1.3, allAs: "water" }, "剪刀石頭石頭石頭", 8, { nuke: 35, buff: 1.5 },
    "Leviathan, a pale man with long silver hair with blue tips, glittery blue makeup on one cheek, black jacket, black headphones hanging around his neck, cool smile, ice crystals and a dark sea behind him"],
  ["nova", "諾瓦", "獨角鯨惡魔", "water", "魔族", "demon", "bal", "鯨落", { attrAtk: { water: 2 }, allRec: 1.3 }, "從漫畫開始學藝術", 6, { rowTo: "water" },
    "Nova, a small demon girl with short black hair and heterochromia eyes, wearing a blue narwhal-shaped hood hat, holding a paintbrush, painting of a whale fall glowing underwater"],
  ["rat", "鼠軍師", "第二王國總參謀", "dark", "魔族", "demon", "bal", "幫本軍師抬轎", { allAtk: 2 }, "麻將拳", 6, { nuke: 12 },
    "the Rat Strategist, a hamster wearing a Chinese military advisor hat with a yin-yang emblem and a little robe, riding a pink tricycle, mahjong tiles flying"],
  ["lucifer", "路西法", "傲慢魔王", "light", "天族", "demon", "atk", "天族最強戰士", { allAtk: 4, comboUp: .25 }, "殲滅邪神帝", 9, { nuke: 40, buff: 2 },
    "Lucifer, the strongest warrior of heaven turned Demon King of Pride: long white hair, stern face, golden ornate armor, huge white wings, light and shadow split"],
  /* 異時空（大秦、庚寅地球） */
  ["youshuzhang", "岳夏澤", "朱雀將軍", "fire", "人類", "other", "atk", "楚墨宗主", { attrAtk: { fire: 2.5 } }, "去月下慶祝", 7, { buff: 2 },
    "Yue Xiaze, a young man with long messy black hair, a dirt-smudged face, wearing a dark worn Qin dynasty robe, resolute expression, torch-lit prison corridor. No armor"],
  ["liudaniu", "劉大牛", "伍長", "wood", "人類", "other", "hp", "楚國沛縣人", { attrAtk: { wood: 2 } }, "快逃", 5, { selfBuff: 2, guard: 1 },
    "Liu Daniu, a stocky Qin dynasty soldier with a topknot and a rough honest face, holding a ring of prison keys, torch-lit prison corridor"],
  ["liangan", "梁安恆", "月老借住的身體", "light", "人類", "other", "rec", "難過就哭", { allRec: 2 }, "三層愛戀文印", 6, { convert: ["dark", "light"] },
    "Liang Anheng, a high school boy with messy black hair with light streaks, white school shirt, gentle smile, faint red glowing threads around his hand, school rooftop at sunset"],
  ["yiman", "林怡曼", "藍泉高中", "water", "人類", "other", "rec", "神明不能說謊", { allRec: 1.5, allHp: 1.2 }, "打勾勾", 6, { healPct: .25, timeUp: 2 },
    "Lin Yiman, a high school girl with long black hair and bangs, white school uniform, holding out her pinky finger for a promise, classroom window light"],
  ["tiedan", "鐵蛋", "高中生靈媒", "dark", "人類", "other", "bal", "看得到鬼", { attrAtk: { dark: 2 }, vsDemon: 1.5 }, "鹽城月老廟", 6, { fixedDmg: 30000 },
    "Tiedan, a teenage spirit-medium girl with black bangs and sharp eyes, school uniform with paper talismans, faint ghosts around her, temple at night"],
  ["gengyin", "庚寅月老", "月老爺爺", "wood", "神", "other", "rec", "月下老人", { attrAtk: { wood: 2 } }, "牽線", 6, { convert: ["water", "wood"] },
    "the Gengyin Yue Lao, an old matchmaker god with long white hair and a long white beard, red and gold robe, holding a book of marriages and red threads, under the moon"],
  /* ---- 第三批：再 20 位（2026-10-19） ---- */
  ["satanc", "撒旦", "憤怒魔王", "fire", "魔族", "demon", "atk", "憤怒魔王", { attrAtk: { fire: 3 }, allHp: 1.2 }, "辛辣天塞", 8, { board: ["fffddd", "fffddd", "fffddd", "fffddd", "fffddd"], boardDesc: "左半邊火符石、右半邊暗符石", buff: 1.5 }, null],
  ["plaguec", "瘟疫", "第三王國總參謀", "wood", "魔族", "demon", "rec", "撒旦的軍師", { attrAtk: { wood: 2.5 }, allRec: 1.3 }, "瘟疫蔓延", 7, { board: ["gggggg", "hhhhhh", "gggggg", "hhhhhh", "gggggg"], boardDesc: "木符石與心符石一排一排交錯" }, null],
  ["reaperc", "第三王國惡魔", "第五軍團百夫長", "dark", "魔族", "demon", "atk", "搜捕高品質靈魂", { attrAtk: { dark: 2 } }, "百年妖狐", 6, { selfBuff: 2.5 }, null],
  ["lajic", "辣雞", "議員之子", "wood", "人類", "human", "atk", "你知道我爸是誰嗎", { attrAtk: { wood: 2 } }, "我可是未成年", 6, { convert: ["heart", "wood"], selfBuff: 2 }, null],
  ["xiaole", "小樂", "討好型人格", "water", "人類", "human", "rec", "聽不見的求救", { allRec: 1.5 }, "被聽見", 5, { healPct: .35, buff: 1.3 },
    "Xiaole, a young woman with a short brown bob under a beige beret, cream knit cardigan over a white top, shy tearful smile, chain-link fence at night"],
  ["abinmom", "阿斌的媽媽", "九二一的母親", "light", "人類", "human", "hp", "這片土地上不分國籍", { allHp: 1.3, attrAtk: { light: 1.5 } }, "守護阿斌", 5, { guard: 1, buff: 1.5 },
    "a Filipina mother with long curly dark hair, wearing a light pink t-shirt with a small bunny print, warm tearful smile, cozy home at night"],
  ["granny", "算命阿婆", "看命格的算命師", "dark", "人類", "human", "bal", "天煞孤星", { attrAtk: { dark: 2 } }, "算命", 5, { convert: ["light", "dark"], buff: 1.3 },
    "an old fortune-teller grandma with grey hair, round dark sunglasses, a pale blue blouse and a bead necklace, sitting at a small fortune-telling table with candles"],
  ["waipo", "外婆", "託夢的外婆", "wood", "人類", "human", "rec", "走之前來看看你", { allRec: 1.6 }, "託夢", 5, { healPct: .5 },
    "a kind elderly grandmother with soft white curly hair, wearing a cream floral-print blouse, gentle smile, warm old house with a wall clock"],
  ["guitarist", "吉他手", "愛神祭的伴奏", "dark", "人類", "human", "atk", "伴奏", { attrAtk: { dark: 2 } }, "那一晚的歌", 5, { rowTo: "dark", selfBuff: 2 },
    "a female rock guitarist with a long black ponytail and bangs, black ornate vest over a black top, playing an electric guitar on a stage with spotlights"],
  ["miaogong", "廟公", "業鏡羅漢殿的廟公", "light", "人類", "human", "hp", "第六十一籤", { attrAtk: { light: 2 } }, "請你跟我來一下", 6, { convert: ["dark", "light"], buff: 1.3 },
    "an elderly temple keeper with short white hair, wearing a navy blue traditional Chinese button jacket, kind serious face, Taiwanese temple with incense smoke"],
  ["zhaogao", "趙大人", "中車府令", "dark", "人類", "other", "bal", "誣陷", { attrAtk: { dark: 2 } }, "讒言", 6, { convert: ["light", "dark"], selfBuff: 2 },
    "Zhao Gao, a plump middle-aged Qin dynasty court official with a black official hat and a dark brown robe, holding a bamboo scroll, sly smile, Qin palace"],
  ["cuihua", "翠花", "大牛的未婚妻", "wood", "人類", "other", "rec", "被搶走的翠花", { allRec: 1.5 }, "等大牛", 5, { healPct: .4 },
    "Cuihua, a young Qin era village woman with black hair in a simple bun, plain brown hemp clothes, tearful hopeful face, ancient Qin street"],
  ["qinwang", "秦王", "嬴政", "dark", "人類", "other", "atk", "大秦", { attrAtk: { dark: 2.5 } }, "連弩車", 8, { board: ["dddddd", "llllll", "dddddd", "llllll", "dddddd"], boardDesc: "暗符石與光符石一排一排交錯", buff: 1.3 },
    "Ying Zheng, the King of Qin, a stern middle-aged man with a black topknot crown and a black and gold patterned royal robe, commanding pose, dark palace hall"],
  ["lvyi", "綠衣女子", "微笑式神的召喚者", "wood", "人類", "sanzu", "bal", "市役所的守衛", { attrAtk: { wood: 2 } }, "微笑式神", 5, { convert: ["water", "wood"], selfBuff: 2 },
    "a young woman with a black bob with bangs and a small hair ornament, wearing a pale green kimono-style top, summoning a white smiling paper mask spirit, underworld city hall"],
  ["liangmom", "梁安恆的媽媽", "梁媽媽", "light", "人類", "other", "rec", "為了不打擾我工作", { allRec: 1.5, attrAtk: { light: 1.5 } }, "擔心你", 5, { healPct: .4, buff: 1.3 },
    "a woman with silver hair with purple streaks and thin round glasses, wearing a simple light top and apron, worried gentle face, small apartment"],
  ["gyxiaoqing", "庚寅筱晴", "杜老大的老婆", "dark", "人類", "other", "bal", "黑龍興業", { attrAtk: { dark: 2 } }, "希望能一直這樣", 5, { healPct: .2, buff: 1.5 },
    "a woman with long blonde hair under a black lace brimmed hat, black lace dress, holding a white face mask, cool elegant expression, dark mansion with a dragon emblem"],
  ["bachi", "八尺大人", "傘鬼", "fire", "鬼", "other", "atk", "紅傘", { attrAtk: { fire: 2.5 } }, "被練成蠱", 7, { nuke: 15, selfBuff: 2 },
    "Hasshaku-sama, a very tall female ghost with long straight black hair covering her face, wearing a long white dress, holding a red Japanese oil-paper umbrella, misty night alley, eerie but not gory"],
  ["shushi", "術士", "下蠱的術士", "dark", "人類", "other", "atk", "白蛛會的術士", { attrAtk: { dark: 2.5 } }, "下蠱", 7, { board: ["ddhhdd", "ddhhdd", "ddhhdd", "ddhhdd", "ddhhdd"], boardDesc: "左右兩側暗符石、中間兩直排心符石", selfBuff: 2 },
    "a sorcerer wearing a yellow hooded raincoat, sly grin, holding a rifle with a glowing purple scope, a purple eye mark glowing on his palm, rainy rooftop at night"],
  ["raincoat", "雨衣小飛俠", "白蛛會的幻術師", "dark", "人類", "other", "atk", "跟著術士行動的黃雨衣青年", { attrAtk: { dark: 1.5 } }, "迷失幻境", 6, { delay: 1, convert: ["light", "dark"] },
    "a young man wearing a yellow hooded raincoat, sly grin, holding a rifle with a glowing purple scope, a purple eye mark glowing on his palm, rainy rooftop at night"],
  ["baizhu", "白蛛會角頭", "白老大", "light", "人類", "other", "hp", "白蛛會", { allHp: 1.3, attrAtk: { light: 1.5 } }, "花這麼多錢", 6, { guard: 1, selfBuff: 2.5 },
    "a tough middle-aged gang boss with slicked-back black hair and spider-web scar patterns on his face, wearing a white suit jacket, menacing, dark warehouse"],
  ["zygao", "狀元糕老伯", "狀元糕攤", "fire", "人類", "human", "rec", "這是狀元糕", { allRec: 1.5 }, "熱騰騰的狀元糕", 5, { healPct: .3, convert: ["heart", "fire"] },
    "a kind old man with short white hair, wearing a blue striped polo shirt, selling steamed zhuangyuan rice cakes at a flea market stall with a steamer, sunny"],
  /* ---- 第四批：第六季後段～第七季（2026-11-11，依 IG 戰力天梯 S1–S7）；技能在下面「新版技能」區塊另外寫定 ---- */
  ["mazu", "媽祖", "慈悲聖母", "water", "神", "mazu", "bal", "", {}, "", 4, {}, null],   // 不進化，直接六星（使用者定）
  ["shunfeng", "順風耳", "小風", "water", "神", "mazu", "atk", "", {}, "", 5, {}, null],
  ["xieshou", "謝守", "甲級除咒師", "water", "人類", "mazu", "hp", "", {}, "", 5, {}, null],
  ["renmianyu", "人面魚", "魚仔", "water", "妖", "mazu", "bal", "", {}, "", 3, {}, null],
  ["redgirl", "紅衣小女孩", "魔神仔領袖", "dark", "妖", "mazu", "atk", "", {}, "", 5, {}, null],
  ["baifu", "白府千歲", "白千歲", "light", "神", "mazu", "atk", "", {}, "", 5, {}, null],
  ["nuwa", "女媧", "女媧娘娘", "wood", "古神", "gods", "rec", "", {}, "", 6, {}, null],
  ["isaiah", "以賽亞", "巨錘以賽亞", "fire", "魔族", "demon", "hp", "", {}, "", 5, {}, null],
  ["daogui", "刀鬼", "獨臂刀鬼", "wood", "魔族", "demon", "atk", "", {}, "", 5, {}, null],
  ["mofaweng", "魔法翁", "法術巨擘", "dark", "魔族", "demon", "bal", "", {}, "", 5, {}, null],
  ["sentinel", "哨兵古神", "克蘇魯族的哨兵神", "dark", "古神", "demon", "hp", "", {}, "", 6, {}, null],
  ["dabao4", "大寶", "覺醒祝融記憶", "fire", "半神", "fire", "atk", "", {}, "", 2, {}, null],
  /* 主角群的進化 */
  ["xiaoyu2", "小雨", "代理店長", "water", "人類", "shop", "rec", "代理店長", { allRec: 2, attrAtk: { water: 1.5 } }, "潮流韓風", 4, { healPct: .4, convert: ["heart", "water"], buff: 1.5 },
    "Xiaoyu as acting manager of the yakiniku shop: long straight black hair with blunt bangs, wearing a modern Korean-style hanbok uniform in soft colors, confident warm smile, yakiniku restaurant"],
  ["dabao2", "大寶", "托夢照相館", "fire", "人類", "fire", "atk", "托夢照相館", { attrAtk: { fire: 2.2 } }, "打薄一下就好", 4, { convert: ["heart", "fire"], buff: 2 }, null],
  ["dabao3", "大寶", "天煞孤星", "fire", "人類", "fire", "atk", "天煞孤星", { attrAtk: { fire: 2.8 }, allHp: 1.2 }, "神也好魔也好", 7, { convert: ["heart", "fire"], selfBuff: 3, buff: 1.5 },
    "Dabao in season six: two-tone blonde and dark undercut hair, a grey hoodie under a black jacket, determined sad eyes, a faint ominous starry red aura around him (the lone star curse), night street"],
  ["afu2", "阿副", "陽光手機門市", "wood", "人類", "fire", "hp", "曾來過人間", { attrAtk: { wood: 2.2 }, allHp: 1.2 }, "一拳打倒辣雞", 4, { convert: ["heart", "wood"], selfBuff: 3.5 },
    "A-Fu as a phone shop clerk: long wavy black hair, light stubble, wearing a blue polo shirt with a small shop logo, calm resolute look, bright phone store"]
];
ROWS.forEach(([id, who, title, attr, race, series, kind, leadName, leadFx, actName, cd, actFx, desc]) => {
  CARDS[id] = {
    who, title, attr, race, series, kind,
    art: `art/${id}.webp`, evo: null, stage: STAGE_OF[id] || 0,
    lead: { name: leadName, fx: leadFx }, act: { name: actName, cd, fx: actFx }, gen: desc
  };
});
})();
// 進化順序（語彤四階；小雨、大寶、阿副的進化）
[["yutong1", "yutong"], ["yutong", "yutong3"], ["yutong3", "yutong4"], ["yutong4", "yutong5"], ["xiaoyu", "xiaoyu2"], ["dabao", "dabao2"], ["dabao2", "dabao3"], ["dabao3", "dabao4"], ["afu", "afu2"]]
  .forEach(([a, b]) => { CARDS[a].evo = b; CARDS[a].stage = CARDS[a].stage || 1; });

/* =========================================================================
   戰力階級：依使用者的《黃泉燒肉店》S1–S5 戰力表（S+ 最強、D 最弱）
   表上 19 位照表；表上沒有的角色依劇情判斷（標 ※）
   星數與數值都由階級決定：數值 = 基準 × 階級倍率 × 型（攻／血／回復）× 屬性傾向
   ========================================================================= */
window.TIERS = {
  "S+": { star: 7, m: 1.7 }, "S": { star: 6, m: 1.45 }, "S-": { star: 6, m: 1.3 },
  "A": { star: 5, m: 1.15 }, "B": { star: 5, m: 1 }, "C": { star: 4, m: .94 }, "D": { star: 3, m: .9 }
};
(() => {
  const BY_WHO = {
    // 戰力表
    "路西法": "S+", "祝融": "S+", "基路伯": "S+",
    "觀音菩薩": "S", "利維坦": "S",
    "阿芙羅黛蒂": "S-", "哈索爾": "S-",
    "千里眼": "A", "鼠軍師": "A", "月老": "A", "愛染明王": "A", "華佗": "A",
    "九尾": "B",
    "語彤": "C", "陽滋公主": "C",
    "諾瓦": "D", "狐姬": "D", "七號": "D",
    // ※ 依劇情判斷
    "神差": "B",       // 埃及死神，和月老一起處理魔
    "庚寅月老": "B",   // 另一個時空的月下老人
    "辜老師": "C",     // 用靈魂核心打開穿界門
    "岳夏澤": "C",     // 月老生前，朱雀將軍
    "紅衣武士": "D", "杜先生": "D", "泡芙": "D", "吳小白": "D", "二號": "D",
    "小雨": "D", "大寶": "D", "阿副": "D", "白妹": "D", "赤坂": "D",
    "林伯伯": "D", "王柏宏": "D", "筱晴": "D", "阿副的女友": "D", "茉蒂": "D", "大牛": "D",
    "咪咪": "D", "黑糖": "D", "謎": "D", "小米": "D", "918號引渡貓": "D", "貢丸君": "D", "毛怪": "D",
    "劉大牛": "D", "梁安恆": "D", "林怡曼": "D", "鐵蛋": "D",
    // 第三批：撒旦、瘟疫照戰力表；其他依劇情
    "撒旦": "S", "瘟疫": "A", "第三王國惡魔": "C", "秦王": "C", "八尺大人": "C", "術士": "C", "雨衣小飛俠": "C",
    "辣雞": "D", "小樂": "D", "阿斌的媽媽": "D", "算命阿婆": "D", "外婆": "D", "吉他手": "D", "廟公": "D",
    "趙大人": "D", "翠花": "D", "綠衣女子": "D", "梁安恆的媽媽": "D", "庚寅筱晴": "D", "白蛛會角頭": "D", "狀元糕老伯": "D",
    // 第四批：照 S1–S7 戰力天梯（IG 2026-11-08）；人面魚不在表上，依劇情（被除魔性的魔神仔）※
    "女媧": "S+", "媽祖": "S", "白府千歲": "S-", "以賽亞": "S-", "刀鬼": "S-", "魔法翁": "S-", "哨兵古神": "S-",
    "順風耳": "A", "紅衣小女孩": "A", "謝守": "B", "人面魚": "D"
  };
  // 李國志三階：業鏡羅漢照表是 B；刀鋸使、米店老闆依劇情往下
  const BY_ID = { lee1: "D", lee2: "C", lee3: "B", lee4: "B", yutong1: "D", yutong: "D", yutong3: "C", yutong4: "C", yutong5: "B",
    xiaoyu2: "C", dabao2: "D", dabao3: "C", afu2: "C",
    dabao4: "C" };   // 覺醒大寶照天梯 C
  // 同一階級裡，進化後的卡再強一點
  const EVO_UP = { lee2: 1.06, lee3: 1.06, lee4: 1.12, yutong: 1.06, yutong3: 1.0, yutong4: 1.08, yutong5: 1.08, dabao2: 1.08, dabao3: 1.06, dabao4: 1.1 };
  const ON_CHART = new Set(["撒旦", "瘟疫", "路西法", "祝融", "基路伯", "觀音菩薩", "利維坦", "阿芙羅黛蒂", "哈索爾", "千里眼", "鼠軍師", "月老", "愛染明王", "華佗", "九尾", "語彤", "陽滋公主", "諾瓦", "狐姬", "七號",
    "女媧", "媽祖", "白府千歲", "以賽亞", "刀鬼", "魔法翁", "哨兵古神", "順風耳", "紅衣小女孩", "謝守"]);
  const KIND_ID = { lee1: "bal", lee2: "atk", lee3: "bal", lee4: "bal", xiaobai: "atk", xiaoyu: "rec", dabao: "atk", afu: "hp" };
  const KIND = { atk: [.9, 1.2, .8], hp: [1.3, .9, .9], rec: [1, .85, 1.5], bal: [1.05, 1, 1.05] };
  const BIAS = { water: [1.3, .82, 1.6], fire: [.82, 1.2, .65] };
  const BASE = [1800, 680, 330];
  Object.entries(CARDS).forEach(([id, c], k) => {
    const tier = BY_ID[id] || BY_WHO[c.who] || "D", t = TIERS[tier];
    const kind = KIND_ID[id] || c.kind || "bal", km = KIND[kind], ab = BIAS[c.attr] || [1, 1, 1];
    const j = 1 + ((k * 37) % 9 - 4) / 100, e = EVO_UP[id] || 1;   // j 每張卡微調、e 進化加成
    c.tier = tier; c.onChart = (ON_CHART.has(c.who) && !/^yutong/.test(id)) || id === "dabao4" || id === "lee4" || id === "yutong4" || id === "yutong5"; c.star = t.star;
    c.hp = Math.round(BASE[0] * t.m * km[0] * ab[0] * j * e / 10) * 10;
    c.atk = Math.round(BASE[1] * t.m * km[1] * ab[1] / j * e / 5) * 5;
    c.rec = Math.round(BASE[2] * t.m * km[2] * ab[2] * j * e / 5) * 5;
  });
  // 進化鏈：下一階的生命、攻擊、回復都至少比上一階多 6%
  Object.values(CARDS).forEach(c => {
    if (!c.evo) return;
    const n = CARDS[c.evo];
    ["hp", "atk", "rec"].forEach(k => { n[k] = Math.max(n[k], Math.round(c[k] * 1.06 / 5) * 5); });
  });
})();

/* 隊長技倍率壓縮：隊長＋戰友會相乘，原本兩張 3 倍的隊長疊起來就 9 倍，敵人一回合就倒。
   所有倍率往 1 拉近（新倍率 = 1 + (原倍率 − 1) × 0.85），強弱順序不變。 */
(() => {
  const K = .85, sq = v => Math.round((1 + (v - 1) * K) * 100) / 100;
  Object.values(CARDS).forEach(c => {
    const fx = c.lead.fx;
    ["allAtk", "allHp", "allRec", "vsDemon"].forEach(k => { if (fx[k]) fx[k] = sq(fx[k]); });
    if (fx.attrAtk) Object.keys(fx.attrAtk).forEach(a => { fx.attrAtk[a] = sq(fx.attrAtk[a]); });
    if (fx.multiAttr) fx.multiAttr.x = sq(fx.multiAttr.x);
    delete c.lead.desc;   // 說明一律依新倍率重新產生
  });
})();

/* =========================================================================
   卡片強度規則（2026-10-19 使用者定）：
   ▸ 五星以上：都能當隊長、主動技要強、CD 最長 6 → 下面逐張寫定（倍率是最終值，不再壓縮）
   ▸ 四星以下：CD 一律縮到 2～4（原 CD − 2）
   ========================================================================= */
(() => {
  const TOP = {
    cherub:    [{ allAtk: 3, allHp: 2, regen: .15, survive: 1 }, 6, { healPct: 1, guard: 2, convert: ["heart", "light"], buff: 1.5 }],
    zhurong:   [{ attrAtk: { fire: 3.5 }, allHp: 1.3, skyfall: { fire: .45 } }, 6, { boardTo: "fire", nuke: 20 }],
    lucifer:   [{ allAtk: 3.5, comboUp: .3 }, 6, { nuke: 40, buff: 2 }],
    guanyin:   [{ allAtk: 3.2, allHp: 1.4, openStrike: 60 }, 6, { nuke: 45, buff: 2 }],
    hathor:    [{ attrAtk: { fire: 3.2 }, allHp: 1.2, vsDemon: 2 }, 5, { nuke: 30, convert: ["wood", "fire"], buff: 1.5 }],
    aphrodite: [{ attrAtk: { light: 3.2 }, allRec: 2, regen: .1 }, 5, { healPct: .6, buff: 2 }],
    leviathan: [{ attrAtk: { water: 3 }, allHp: 1.3, allAs: "water" }, 6, { nuke: 35, buff: 1.8 }],
    satanc:    [{ attrAtk: { fire: 3.2 }, allHp: 1.2 }, 6, { board: ["fffddd", "fffddd", "fffddd", "fffddd", "fffddd"], boardDesc: "左半邊火符石、右半邊暗符石", buff: 2 }],
    yutong5:   [{ attrAtk: { dark: 3 }, allHp: 1.3 }, 6, { convert: ["light", "dark"], nuke: 30, buff: 1.8 }],
    lee3:      [{ allAtk: 2.7, allHp: 1.43, multiAttr: { n: 4, x: 1.43 } }, 5, { rainbow: true, buff: 1.8 }],
    lee4:      [{ allAtk: 2.7, allHp: 1.43, multiAttr: { n: 4, x: 1.68 } }, 5, { rainbow: true, buff: 2 }],
    yuelao:    [{ attrAtk: { light: 3.2, wood: 3.2 }, allHp: 1.3 }, 5, { board: ["lglglg", "lglglg", "lglglg", "lglglg", "lglglg"], boardDesc: "光符石與木符石一直排一直排交錯", buff: 1.8 }],
    huatuo:    [{ attrAtk: { wood: 3.2 }, allRec: 2, allHp: 1.3, regen: .1 }, 5, { healPct: .5, buff: 2 }],
    jiuwei:    [{ attrAtk: { water: 2.8 }, allHp: 1.3 }, 5, { guard: 2, convert: ["heart", "water"], buff: 1.5 }],
    qianliyan: [{ attrAtk: { wood: 2.8 }, allHp: 1.2 }, 5, { delay: 1, convert: ["dark", "wood"], buff: 1.8 }],
    aizen:     [{ attrAtk: { fire: 2.8 } }, 5, { convert: ["wood", "fire"], buff: 1.8 }],
    shencha:   [{ attrAtk: { light: 2.8 } }, 4, { convert: ["dark", "light"], buff: 2 }],
    rat:       [{ allAtk: 2.5 }, 5, { nuke: 15, buff: 1.5 }],
    gengyin:   [{ attrAtk: { wood: 2.8 }, allRec: 1.3 }, 5, { convert: ["water", "wood"], buff: 1.8 }],
    plaguec:   [{ attrAtk: { wood: 2.8 }, allRec: 1.5 }, 6, { board: ["gggggg", "hhhhhh", "gggggg", "hhhhhh", "gggggg"], boardDesc: "木符石與心符石一排一排交錯", buff: 1.5 }]
  };
  Object.entries(CARDS).forEach(([id, c]) => {
    if (TOP[id]) {
      const [lead, cd, act] = TOP[id];
      c.lead.fx = lead; c.act.cd = cd; c.act.fx = act;
      delete c.lead.desc; delete c.act.desc;
    } else if (c.star >= 5) {
      c.act.cd = Math.min(c.act.cd, 6);
    } else {
      c.act.cd = Math.max(2, Math.min(4, c.act.cd - 2));
      delete c.act.desc;   // data.js 手寫的說明也重新產生
    }
  });
})();

/* =========================================================================
   新版技能（2026-11-11 使用者定：第四批新卡參考神魔之塔、怪物彈珠近年的設計；舊卡維持原本技能）
   ▸ 隊長技：高倍率＋條件疊加（combo、消除屬性數）、減傷、延長轉珠、追打、無視護盾
   ▸ 主動技：自動排版（整版排成可一次消完的形狀）＋一回合大幅提升（攻擊倍率、combo 加成、全隊轉屬性）
   ▸ 倍率是最終值，不經過上面的壓縮；招式名取自劇中原句與招式
   ▸ 新欄位（game.js、tools/sim.js 都要認得）
     隊長技 comboAt {n,x} 達到 n combo 攻擊再 x 倍／dmgCut 受到傷害減少比例（雙隊長相乘）／timeAdd 每回合轉珠多幾秒
           chase n 每次攻擊後追打全體（隊長攻擊力 n 倍）／pierce 全隊攻擊無視敵人護盾
     主動技 arrange 自動排版（見 game.js ARRANGE）／comboAdd 本回合 combo 數加 n／turnAs 本回合全隊以某屬性出手、所有符石都算
           cut {x,turns} 幾回合內受到的傷害只剩 x／cleanse 解除敵人的轉珠干擾／unseal 解除全隊「封鎖攻擊」／pierceTurn 本回合無視護盾
     immune 本回合受到的傷害全部變 0／multiHit n 連續普通攻擊 n 次／vsCthulhu 對克蘇魯系敵人（敵人資料 cthulhu: true）的傷害倍率
     acts：多個主動技（各自冷卻，戰鬥中點頭像選一招；act 是第一招）；video：發招時播影片（取代發招特寫）
   ========================================================================= */
(() => {
  const V = n => `video/mazu-${n}.mp4`;
  // [隊長技, [主動技...]]；主動技 { name, cd, fx, video }
  const NEW = {
    // 媽祖：不進化、直接六星（使用者定）。四招共用一組冷卻 4 回合（shared）：安瀾（防守）、鎮瀾（全體高攻擊）、無瀾（一回合無傷）、霸極拳（連續普通攻擊 10 次）
    mazu: [{ name: "媽祖加持的手串", fx: { attrAtk: { water: 6 }, allHp: 1.6, allRec: 1.4, comboAt: { n: 5, x: 2 }, dmgCut: .4, timeAdd: 1 } },
      [{ name: "安瀾", cd: 4, fx: { cut: { x: .2, turns: 3 }, healPct: .6, delay: 1, cleanse: true, arrange: "water-heart" }, video: V("anlan") },
       { name: "鎮瀾", cd: 4, fx: { arrange: "water-all", turnAs: "water", comboAdd: 4, buff: 3, nuke: 80, pierceTurn: true }, video: V("zhenlan") },
       { name: "無瀾", cd: 4, fx: { immune: 1, healPct: .3 }, video: V("wulan") },
       { name: "霸極拳", cd: 4, fx: { multiHit: 10, pierceTurn: true }, video: V("baji") }], true],
    shunfeng: [{ name: "妖魔自治條例", fx: { attrAtk: { water: 4.5 }, comboAt: { n: 4, x: 1.8 }, timeAdd: 2 } },
      [{ name: "靜音咒", cd: 5, fx: { delay: 2, arrange: "water-cross", buff: 2.5 } }]],
    xieshou: [{ name: "甲級除咒師", fx: { attrAtk: { water: 4 }, allHp: 1.5, allRec: 1.5, regen: .08 } },
      [{ name: "醫者令・小山火", cd: 4, fx: { cleanse: true, healPct: .4, convert: ["dark", "water"], buff: 2 } }]],
    renmianyu: [{ name: "在山裡面好好修行", fx: { attrAtk: { water: 2.2 } } },
      [{ name: "魚肉好吃嗎？", cd: 3, fx: { convert: ["fire", "water"] } }]],
    redgirl: [{ name: "魔神仔領袖", fx: { attrAtk: { dark: 5 }, comboAt: { n: 5, x: 1.6 }, pierce: true } },
      [{ name: "我控制住他了", cd: 5, fx: { delay: 2, arrange: "dark-rows", buff: 2.5 } }]],
    baifu: [{ name: "只殺不度", fx: { attrAtk: { light: 5.5 }, allHp: 1.3, chase: 30, pierce: true } },
      [{ name: "霸極拳", cd: 6, fx: { arrange: "light-all", turnAs: "light", buff: 2.5, nuke: 60, pierceTurn: true } }]],
    nuwa: [{ name: "北境的金色菩提樹", fx: { attrAtk: { wood: 6 }, allHp: 1.8, allRec: 1.6, regen: .15, multiAttr: { n: 3, x: 1.8 } } },
      [{ name: "輪迴六趣", cd: 6, fx: { healPct: 1, arrange: "six", comboAdd: 4, buff: 3 } }]],
    isaiah: [{ name: "等統一魔界", fx: { attrAtk: { fire: 5.5 }, allHp: 1.4, chase: 25, dmgCut: .2 } },
      [{ name: "巨錘", cd: 6, fx: { arrange: "fire-all", turnAs: "fire", buff: 2.5, nuke: 50 } }]],
    daogui: [{ name: "我的封地要最大", fx: { attrAtk: { wood: 5.5 }, comboAt: { n: 6, x: 2.2 }, timeAdd: 1 } },
      [{ name: "獨臂刀", cd: 5, fx: { arrange: "wood-cross", comboAdd: 2, buff: 2.5, pierceTurn: true } }]],
    mofaweng: [{ name: "我要當國師", fx: { attrAtk: { dark: 5.5 }, multiAttr: { n: 3, x: 2 }, allRec: 1.3 } },
      [{ name: "法術巨擘", cd: 6, fx: { arrange: "dark-heart", turnAs: "dark", buff: 3 } }]],
    sentinel: [{ name: "不可直視", fx: { attrAtk: { dark: 5 }, allHp: 1.6, dmgCut: .3 } },
      [{ name: "最強反派一定會有第二形態", cd: 6, fx: { healPct: .4, arrange: "dark-all", selfBuff: 6 } }]],
    // 覺醒大寶：四星隊員（照天梯 C）。赤帝之火＝攻擊（對克蘇魯系特別痛）；直視古神＝解除全隊封鎖（古神戰只有他能解）
    dabao4: [{ name: "祝融轉世", fx: { attrAtk: { fire: 2.5 } } },
      [{ name: "赤帝之火", cd: 4, fx: { nuke: 40, vsCthulhu: 4, selfBuff: 3 } },
       { name: "直視古神", cd: 3, fx: { unseal: true } }]]
  };
  Object.entries(NEW).forEach(([id, [lead, acts, shared]]) => {
    const c = CARDS[id]; c.newgen = true; c.sharedCd = !!shared;   // shared：所有主動技共用一組冷卻
    c.lead = { name: lead.name, fx: lead.fx };
    c.acts = acts.map(a => ({ ...a }));
    c.act = c.acts[0];
  });
  CARDS.dabao4.shop = true;   // 覺醒大寶：古神戰要帶，照相館也能直接兌換（不用先進化，v1.4.11 使用者回報找不到）
})();

/* 技能說明：沒寫 desc 的卡片，依效果自動產生 */
(() => {
  const N = a => ATTR[a].name;
  function leadDesc(fx, attr) {
    const t = [];
    if (fx.openStrike) t.push(`每一波敵人出現時，先對全體敵人造成自身攻擊力 ${fx.openStrike} 倍的${N(attr)}屬性傷害`);
    if (fx.allAtk) t.push(`全隊攻擊力 ${fx.allAtk} 倍`);
    if (fx.attrAtk) Object.entries(fx.attrAtk).forEach(([a, x]) => t.push(`${N(a)}屬性攻擊力 ${x} 倍`));
    if (fx.allHp) t.push(`全隊生命力 ${fx.allHp} 倍`);
    if (fx.allRec) t.push(`全隊回復力 ${fx.allRec} 倍`);
    if (fx.allAs) t.push(`消除任何顏色的符石都算作${N(fx.allAs)}符石，${N(fx.allAs)}屬性成員都會出手`);
    if (fx.skyfall) Object.entries(fx.skyfall).forEach(([a, p]) => t.push(`${N(a)}符石掉落機率大幅提升（約 ${Math.round((p + (1 - p) / 6) * 100)}%）`));
    if (fx.comboUp) t.push(`每多 1 combo，傷害再多 ${Math.round(fx.comboUp * 100)}%`);
    if (fx.vsDemon) t.push(`對魔族敵人的傷害 ${fx.vsDemon} 倍`);
    if (fx.regen) t.push(`每次轉珠後回復最大生命力 ${Math.round(fx.regen * 100)}%`);
    if (fx.survive) t.push(`每場戰鬥 ${fx.survive} 次，受到致命傷害時保留 1 點生命`);
    if (fx.multiAttr) t.push(`同時消除 ${fx.multiAttr.n} 種或以上屬性符石時，全隊攻擊力再 ${fx.multiAttr.x} 倍`);
    if (fx.comboAt) t.push(`達成 ${fx.comboAt.n} combo 或以上時，全隊攻擊力再 ${fx.comboAt.x} 倍`);
    if (fx.dmgCut) t.push(`受到的傷害減少 ${Math.round(fx.dmgCut * 100)}%`);
    if (fx.timeAdd) t.push(`轉珠時間延長 ${fx.timeAdd} 秒`);
    if (fx.chase) t.push(`每次攻擊後追打全體敵人（自身攻擊力 ${fx.chase} 倍的${N(attr)}屬性傷害）`);
    if (fx.pierce) t.push("全隊攻擊無視敵人護盾");
    return t.join("；");
  }
  function actDesc(fx, attr) {
    const t = [];
    if (fx.unseal) t.push("解除全隊的「封鎖攻擊」（古神戰必備）");
    if (fx.immune) t.push(`${fx.immune} 回合內受到的傷害全部變 0`);
    if (fx.multiHit) t.push(`連續普通攻擊 ${fx.multiHit} 次（每下＝自身消除一組符石的攻擊，含隊長倍率），本回合無視敵人護盾`.replace("，本回合無視敵人護盾", ""));
    if (fx.arrange) t.push(`自動排版：${(window.ARRANGE_DESC || {})[fx.arrange] || "整理盤面"}`);
    if (fx.breakShield) t.push("破除所有敵人的護盾（屬性限定、傷害吸收）");
    if (fx.convert) t.push(`${N(fx.convert[0])}符石轉化為${N(fx.convert[1])}符石`);
    if (fx.board) t.push(`符石變成固定版面：${fx.boardDesc}`);
    if (fx.rowTo) t.push(`最下面一排符石轉化為${N(fx.rowTo)}符石`);
    if (fx.timeUp) t.push(`本回合轉珠時間延長 ${fx.timeUp} 秒`);
    if (fx.fixedDmg) t.push(`對全體敵人造成 ${fx.fixedDmg.toLocaleString("en-US")} 點固定傷害（不受屬性影響）`);
    if (fx.boardTo) t.push(`心符石以外的所有符石轉化為${N(fx.boardTo)}符石`);
    if (fx.rainbow) t.push("所有符石重新排列，六種符石各 5 粒");
    if (fx.healPct) t.push(`回復最大生命力 ${Math.round(fx.healPct * 100)}%`);
    if (fx.delay) t.push(`所有敵人的攻擊延遲 ${fx.delay} 回合`);
    if (fx.cut) t.push(`${fx.cut.turns} 回合內受到的傷害只剩 ${Math.round(fx.cut.x * 100)}%`);
    if (fx.cleanse) t.push("3 回合內敵人不能把符石變色");
    if (fx.guard) t.push(`${fx.guard} 回合內受到的傷害減半`);
    if (fx.nuke) t.push(`對全體敵人造成自身攻擊力 ${fx.nuke} 倍的${N(attr)}屬性傷害${fx.vsCthulhu ? `（對古神等克蘇魯系 ${fx.vsCthulhu} 倍）` : ""}`);
    if (fx.selfBuff) t.push(`本回合自身攻擊力 ${fx.selfBuff} 倍`);
    if (fx.buff) t.push(`本回合全隊攻擊力 ${fx.buff} 倍`);
    if (fx.comboAdd) t.push(`本回合 combo 數 +${fx.comboAdd}`);
    if (fx.turnAs) t.push(`本回合消除任何符石都算作${N(fx.turnAs)}符石，全隊以${N(fx.turnAs)}屬性出手`);
    if (fx.pierceTurn) t.push("本回合無視敵人護盾");
    return t.join("，");
  }
  // 隱藏設定（不寫進說明）：全隊都是動物時，每位動物隊長讓全隊攻擊力 7 倍，雙隊長相乘 49 倍
  ["mimi", "cat918", "gongwan", "heitang", "maoguai", "rat"].forEach(id => CARDS[id].animal = true);
  // 萌獸隊的五隻動物是二星：照相館最便宜就能買齊
  ["mimi", "cat918", "gongwan", "heitang", "maoguai"].forEach(id => {
    const c = CARDS[id]; c.star = 2; ["hp", "atk", "rec"].forEach(k => c[k] = Math.round(c[k] * .9));
  });
  // 破盾功能卡：刀鋸使李國志（光）、秦王（暗）
  CARDS.lee2.act.fx.breakShield = true; delete CARDS.lee2.act.desc;
  CARDS.qinwang.act.fx.breakShield = true; delete CARDS.qinwang.act.desc;
  Object.values(CARDS).forEach(c => {
    if (!c.lead.desc) c.lead.desc = leadDesc(c.lead.fx, c.attr);
    if (!c.act.desc) c.act.desc = actDesc(c.act.fx, c.attr);
    (c.acts || []).forEach(a => { if (!a.desc) a.desc = actDesc(a.fx, c.attr); });
  });
})();

/* 五星以上發招特寫用的去背姿勢圖（art/skill/<id>.webp）；不在名單上的先用卡面 */
window.SKILL_POSE = ["lee4", "lee3", "cherub", "zhurong", "lucifer", "guanyin", "hathor", "aphrodite", "leviathan", "satanc", "yuelao", "huatuo", "jiuwei", "qianliyan", "aizen", "shencha", "rat", "gengyin", "plaguec", "yutong5"];
