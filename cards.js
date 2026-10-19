/* =========================================================================
   黃泉燒肉店 轉珠 ‧ 第二批卡片（45 位角色）
   每列：[id, 角色, 稱號, 屬性, 種族, 星數, 系列, 型, 隊長技名, 隊長技效果, 主動技名, CD, 主動技效果, 生圖描述]
   型：atk 攻擊型、hp 生命型、rec 回復型、bal 平均型
   稱號、技能名取自劇中出現過的稱呼、事件與台詞；卡面描述只拿來生圖。
   ========================================================================= */
(() => {
const ROWS = [
  /* 黃泉燒肉店 */
  // 語彤是主角，四階進化依劇中衣著的時期：高中生 → 燒肉店 → 狐姬改造後 → 實習月老
  ["yutong1", "語彤", "呆丸高中生", "dark", "半魔", 3, "shop", "atk", "黑令旗", { attrAtk: { dark: 2 } }, "魔氣", 6, { convert: ["heart", "dark"] }, null],
  ["yutong", "語彤", "燒肉店的乾女兒", "dark", "半魔", 3, "shop", "bal", "胎記是神的印章", { attrAtk: { dark: 2 }, allRec: 1.3 }, "巧克力醬菜單", 5, { convert: ["light", "dark"], healPct: .2 },
    "Lin Yutong, a teenage girl with a short mint-green bob with dark roots and blunt bangs, round black glasses, a dark red birthmark around one eye, wearing the dark grey Huangquan Yakiniku staff shirt with a small gold embroidered shop name on the chest, standing in the warm yakiniku restaurant. No robe, no red thread"],
  ["yutong3", "語彤", "赤戀星空", "dark", "半魔", 4, "shop", "bal", "赤戀星空", { attrAtk: { dark: 2.5 } }, "暈船雷達", 7, { convert: ["heart", "dark"], buff: 1.3 }, null],
  ["yutong4", "語彤", "實習月老", "dark", "半魔", 4, "shop", "atk", "恨之歌", { attrAtk: { dark: 2.5 }, allHp: 1.2 }, "月老廟的香火", 8, { convert: ["light", "dark"], nuke: 15 }, null],
  ["baimei", "白妹", "碧落髮廊", "wood", "人類", 4, "shop", "rec", "等了幾十年", { allRec: 2 }, "百元快剪", 5, { convert: ["dark", "wood"] },
    "Bai Mei, a woman with long purple hair and big black glasses, black kimono-style barber outfit, holding scissors and a comb, old-fashioned underworld hair salon with warm lamps"],
  /* 呆丸消防隊 */
  ["akasaka", "赤坂", "消防隊長", "fire", "人類", 4, "fire", "hp", "隊長與小隊長", { attrAtk: { fire: 2 } }, "替我擋住火勢", 6, { guard: 2 },
    "Akasaka, the fire captain: dark hair with red streaks tied back, black rectangular glasses, wearing a plain white polo shirt, calm and reliable expression, fire station office at night"],
  ["samurai", "紅衣武士", "赤坂的前世", "fire", "人類", 5, "fire", "atk", "三輩子的約定", { attrAtk: { fire: 2.5 } }, "救下白狐", 8, { nuke: 18 },
    "a samurai warrior with long black hair and glasses in red lacquered Japanese armor, katana drawn, cherry blossoms and embers, a small white fox at his feet"],
  /* 人間 */
  ["linbobo", "林伯伯", "木雕師傅", "wood", "人類", 4, "human", "hp", "最好的爸爸", { attrAtk: { wood: 2 } }, "第六十一籤", 7, { healPct: .4 },
    "Uncle Lin, a middle-aged Taiwanese father with short graying hair, holding a walking cane and a wood-carving chisel beside a half-carved wooden goddess statue, warm workshop full of wood shavings"],
  ["bohong", "王柏宏", "百米冠軍", "fire", "人類", 4, "human", "atk", "跑進十秒", { attrAtk: { fire: 2 } }, "就算我跑的再快", 6, { buff: 1.8 },
    "Wang Bohong, a teenage sprinter with short spiky black hair, wearing a black zip-up athletic track jacket with white stripes, determined face, running track at dusk"],
  ["xiaoqing", "筱晴", "杜先生的未婚妻", "water", "人類", 4, "human", "rec", "巧克力牛奶", { allRec: 2 }, "醫院志工", 6, { healPct: .5 },
    "Xiaoqing, a young woman with light brown hair under a straw sun hat, gentle smile, wearing a hospital volunteer vest and holding a carton of chocolate milk, soft sunlight"],
  ["afugf", "阿副的女友", "戴紅毛帽的女孩", "wood", "人類", 4, "human", "bal", "叫了救護車", { allHp: 1.5 }, "已經叫警察了", 6, { delay: 1, healPct: .2 },
    "a young woman with a short black bob wearing a red knit beanie and a casual jacket, determined look, harbor at night with city lights"],
  ["moti", "茉蒂", "龐克女孩", "dark", "人類", 4, "human", "atk", "樂團同伴", { attrAtk: { dark: 2 } }, "我坐火車來看你", 6, { convert: ["light", "dark"] },
    "Moti, a girl with a black bob with bangs under a white knit beanie, a small lip ring, wearing a black tank top and a silver cross necklace, night street"],
  ["daniu", "大牛", "老闆生前的兄弟", "light", "人類", 4, "human", "hp", "傻兄弟", { attrAtk: { light: 2 } }, "輪迴許可", 6, { healPct: .3, delay: 1 },
    "Da Niu, a bald stocky man in a white tank top with a rugged kind face, holding a wooden reincarnation permit plaque, 1940s Taiwanese village street"],
  /* 三途川居民 */
  ["mimi", "咪咪", "917號引渡貓", "water", "貓", 4, "sanzu", "bal", "記得多喝水", { attrAtk: { water: 2 } }, "三花幫", 6, { convert: ["fire", "water"] },
    "Mimi, a girl with long straight black hair, wearing a navy-and-white sailor school uniform with a navy neckerchief, gentle sad eyes, old train station platform of the underworld. Human ears only, no cat ears, nothing in her hands"],
  ["heitang", "黑糖", "慰靈犬", "wood", "犬", 4, "sanzu", "rec", "托夢之恩", { attrAtk: { wood: 2 } }, "別吃綠色的糖", 6, { convert: ["dark", "wood"] },
    "Heitang, a black-and-white border collie dog with a white blaze on his face and white chest, tongue out happily, sitting on a stone path in the underworld. No scarf, no collar accessories"],
  ["huji", "狐姬", "萬能打工王", "fire", "妖", 5, "sanzu", "atk", "等了三輩子", { attrAtk: { fire: 2.5 } }, "百年妖狐", 7, { nuke: 15 },
    "Huji, a fox spirit girl with long dark hair, a pink cat-ear headband and a fluffy pink fox tail, pink outfit, pink fox fire floating around her, night street of lanterns"],
  ["no7", "七號", "戲之魂偶", "water", "魂偶", 4, "sanzu", "rec", "開心而哭", { attrAtk: { water: 2 } }, "推薦甜點", 6, { healPct: .35 },
    "No.7, a handsome soul-puppet young man with dark purple hair in a topknot, white shirt, one elegant mechanical arm, holding a glowing blue pendant, small theater stage with curtains"],
  ["no2", "二號", "女魂偶", "dark", "魂偶", 4, "sanzu", "bal", "對戲", { attrAtk: { dark: 2 } }, "很想很想他", 6, { buff: 1.6 },
    "No.2, a female soul puppet with a dark bob and an ornate jeweled headpiece, porcelain-smooth skin with subtle doll joints, mechanical fingers, rehearsal room with soft spotlight"],
  ["du", "杜先生", "紋身師", "dark", "人類", 5, "sanzu", "atk", "愛戀文印", { attrAtk: { dark: 2.5 } }, "一天兩次文印", 8, { convert: ["water", "dark"], buff: 1.5 },
    "Mr. Du, a middle-aged man with short grey hair and round thin-framed glasses, wearing a plain cream t-shirt, warm tired smile, a dim tattoo parlor with faint glowing red rune tattoos floating in the air"],
  ["paofu", "泡芙", "刀鋸使領班", "dark", "地府官差", 4, "sanzu", "hp", "刀鋸地獄同事", { attrAtk: { dark: 2 } }, "帶走", 6, { delay: 2 },
    "Paofu, a Black man with very short hair, wearing a red Chinese-style tunic with black trim and frog buttons (the Saw Hell foreman uniform), expressive face, blue-black hell cavern with an old steam train behind"],
  ["mi", "謎", "守宮精靈", "wood", "精靈", 4, "sanzu", "rec", "健康的守宮", { allRec: 2 }, "甘露寶瓶", 5, { healPct: .4 },
    "Mi, a small cute white gecko spirit wearing a yellow construction hard hat, standing on a sketchbook beside pencils, Gecko Plaza full of drawings"],
  ["xiaomi", "小米", "市役所櫃台", "light", "人類", 4, "sanzu", "hp", "對付奧客的專家", { allHp: 1.5 }, "還不能申請", 6, { delay: 2 },
    "Xiaomi, a young woman with a neat black bob and a call-center headset, office uniform, standing at the counter of the underworld city hall"],
  ["gu", "辜老師", "戲劇天才", "dark", "人類", 5, "sanzu", "atk", "幻想的美好", { attrAtk: { dark: 2.5 } }, "穿界門", 8, { nuke: 18 },
    "Teacher Gu, an older man with a grey goatee, dark sunglasses and a tall black top hat, burgundy coat, holding several colorful glowing soul cores, theater stage with red curtains"],
  ["cat918", "918號引渡貓", "灰色引渡貓", "water", "貓", 4, "sanzu", "bal", "隔壁的", { attrAtk: { water: 2 } }, "被圍毆", 5, { convert: ["heart", "water"] },
    "a grey British shorthair cat with round orange eyes and a collar tag numbered 918, sitting on a train station bench of the underworld"],
  ["gongwan", "貢丸君", "295號引渡貓", "dark", "貓", 4, "sanzu", "bal", "引渡", { attrAtk: { dark: 2 } }, "車站值班", 5, { convert: ["light", "dark"] },
    "Gongwan, a round black cat with half-closed eyes wearing an orange collar with a tag, sitting by a lantern on a misty underworld train platform"],
  ["maoguai", "毛怪", "下輩子還要當你的狗", "wood", "犬", 4, "sanzu", "rec", "喜歡穿圍裙的人", { allRec: 2 }, "明天的雞腿", 5, { healPct: .3 },
    "Maoguai, a black dog spirit in the form of a gentle girl with short black hair, wearing a purple kimono, sitting at a cozy yakiniku table, soft warm light"],
  /* 神明與天族 */
  ["guanyin", "觀音菩薩", "三途川最強的神", "light", "神", 5, "gods", "atk", "觀音娘娘", { allAtk: 2.5 }, "又快又狠", 9, { nuke: 30 },
    "Guanyin, a woman with silver-white and purple hair and thin glasses, wearing a sharp white suit, serene but powerful, a halo of lotus light behind her"],
  ["yuelao", "月老", "月下老人", "light", "神", 5, "gods", "bal", "讓受過傷的人再相信", { attrAtk: { light: 2.5 } }, "紅線", 7, { convert: ["dark", "light"], delay: 1 },
    "Yue Lao, a handsome young man with tousled brown hair, red and white traditional Chinese robe, red threads of fate wrapped around his hand, moonlit temple with hanging red threads"],
  ["huatuo", "華佗", "醫神", "wood", "神", 5, "gods", "rec", "忘憂舞", { allRec: 2.5, allHp: 1.2 }, "忘憂耳機", 7, { healPct: .6 },
    "Hua Tuo, the god of medicine as a hip-hop DJ: knit beanie, round dark sunglasses, gold chain, earrings, big headphones, herbal smoke and neon lights of an underground club"],
  ["yangzi", "陽滋公主", "孟婆", "water", "鬼", 5, "gods", "bal", "孟婆湯", { attrAtk: { water: 2.5 } }, "遺忘之法", 8, { delay: 3 },
    "Princess Yangzi who became Meng Po, an elegant woman with black hair in a Qin dynasty updo with silver ornaments, white and pale blue hanfu, holding a bowl of soup, misty bridge over a river"],
  ["jiuwei", "九尾", "藍色九尾狐", "water", "妖", 5, "gods", "hp", "護妹狂魔", { attrAtk: { water: 2.5 } }, "結界術", 7, { guard: 2 },
    "Jiuwei, a woman with lavender-silver hair and glasses, nine flowing blue fox tails behind her, holding a smoking incense stick, blue fox fire and barrier runes"],
  ["qianliyan", "千里眼", "千里眼將軍", "wood", "神", 4, "gods", "hp", "媽祖部將", { attrAtk: { wood: 2 } }, "Silence", 6, { delay: 2 },
    "Qianliyan, the far-seeing general: a deity wearing a green feathered mask and a green feather war robe, Taiwanese temple guardian, sea and sky behind him"],
  ["hathor", "哈索爾", "埃及愛神", "fire", "神", 5, "gods", "atk", "歐西里斯的天秤", { attrAtk: { fire: 2.5 } }, "一掌打死", 8, { nuke: 20 },
    "Hathor, the Egyptian love goddess with black bangs, a golden horned headdress with a sun disk, wide gold collar, holding the golden scales of Osiris, desert temple at sunset"],
  ["aphrodite", "阿芙羅黛蒂", "希臘愛神", "light", "神", 5, "gods", "rec", "月桂冠", { attrAtk: { light: 2 }, allRec: 1.5 }, "豎琴", 7, { healPct: .4, buff: 1.3 },
    "Aphrodite, the Greek love goddess with short dark hair and a flower-and-laurel crown, white Greek dress, holding a golden harp, marble columns and roses"],
  ["aizen", "愛染明王", "日本愛神", "fire", "神", 5, "gods", "atk", "無我境界", { attrAtk: { fire: 2.5 } }, "浮世繪", 7, { convert: ["wood", "fire"] },
    "Aizen Myoo, the Japanese love god: blond man with a golden crown and pearl necklaces, red wrathful-king Buddhist robes, painting ukiyo-e with a large brush, red flames"],
  ["shencha", "神差", "柴犬神", "light", "神", 4, "gods", "bal", "埃及死神", { attrAtk: { light: 2 } }, "排隊買和菓子", 5, { delay: 1, buff: 1.3 },
    "Shencha, a Shiba Inu-headed Egyptian god of death with a striped golden nemes headdress and a curved khopesh sword, friendly face, Egyptian pillars"],
  ["cherub", "基路伯", "智天使", "light", "天族", 5, "gods", "hp", "責任天使", { allHp: 1.8 }, "解除咫尺天涯", 8, { healPct: .7 },
    "Cherub, a man with short dark hair, wearing a white hooded robe and a gold pendant necklace, kind confident smile, soft heavenly light behind him. No wings"],
  ["zhurong", "祝融", "赤帝", "fire", "半神", 5, "gods", "atk", "半神隊長", { attrAtk: { fire: 3 }, skyfall: { fire: .45 } }, "殲滅邪神帝", 9, { nuke: 25 },
    "Zhurong, the Red Emperor demigod: long wild blond hair, burning eyes, red and gold divine armor, flames swirling, ancient war battlefield"],
  /* 魔界 */
  ["leviathan", "利維坦", "嫉妒魔王", "water", "魔族", 5, "demon", "atk", "無上戰技", { attrAtk: { water: 2.5 }, allAs: "water" }, "剪刀石頭石頭石頭", 8, { nuke: 25 },
    "Leviathan, a pale man with long silver hair with blue tips, glittery blue makeup on one cheek, black jacket, black headphones hanging around his neck, cool smile, ice crystals and a dark sea behind him"],
  ["nova", "諾瓦", "獨角鯨惡魔", "water", "魔族", 4, "demon", "bal", "鯨落", { attrAtk: { water: 2 } }, "從漫畫開始學藝術", 6, { convert: ["fire", "water"] },
    "Nova, a small demon girl with short black hair and heterochromia eyes, wearing a blue narwhal-shaped hood hat, holding a paintbrush, painting of a whale fall glowing underwater"],
  ["rat", "鼠軍師", "第二王國總參謀", "dark", "魔族", 4, "demon", "bal", "幫本軍師抬轎", { allAtk: 2 }, "麻將拳", 6, { nuke: 12 },
    "the Rat Strategist, a hamster wearing a Chinese military advisor hat with a yin-yang emblem and a little robe, riding a pink tricycle, mahjong tiles flying"],
  ["lucifer", "路西法", "傲慢魔王", "light", "天族", 5, "demon", "atk", "天族最強戰士", { allAtk: 2.5 }, "天煞孤星", 9, { nuke: 30 },
    "Lucifer, the strongest warrior of heaven turned Demon King of Pride: long white hair, stern face, golden ornate armor, huge white wings, light and shadow split"],
  /* 異時空（大秦、庚寅地球） */
  ["youshuzhang", "右庶長", "朱雀將軍", "fire", "人類", 5, "other", "atk", "楚墨宗主", { attrAtk: { fire: 2.5 } }, "去月下慶祝", 7, { buff: 2 },
    "Yue Xiaze, a young man with long messy black hair, a dirt-smudged face, wearing a dark worn Qin dynasty robe, resolute expression, torch-lit prison corridor. No armor"],
  ["liudaniu", "劉大牛", "伍長", "wood", "人類", 4, "other", "hp", "楚國沛縣人", { attrAtk: { wood: 2 } }, "快逃", 5, { delay: 1, guard: 1 },
    "Liu Daniu, a stocky Qin dynasty soldier with a topknot and a rough honest face, holding a ring of prison keys, torch-lit prison corridor"],
  ["liangan", "梁安恆", "月老借住的身體", "light", "人類", 4, "other", "rec", "難過就哭", { allRec: 2 }, "三層愛戀文印", 6, { convert: ["dark", "light"] },
    "Liang Anheng, a high school boy with messy black hair with light streaks, white school shirt, gentle smile, faint red glowing threads around his hand, school rooftop at sunset"],
  ["yiman", "林怡曼", "藍泉高中", "water", "人類", 4, "other", "rec", "神明不能說謊", { attrAtk: { water: 2 } }, "打勾勾", 6, { healPct: .35 },
    "Lin Yiman, a high school girl with long black hair and bangs, white school uniform, holding out her pinky finger for a promise, classroom window light"],
  ["tiedan", "鐵蛋", "高中生靈媒", "dark", "人類", 4, "other", "bal", "看得到鬼", { attrAtk: { dark: 2 } }, "鹽城月老廟", 6, { convert: ["light", "dark"] },
    "Tiedan, a teenage spirit-medium girl with black bangs and sharp eyes, school uniform with paper talismans, faint ghosts around her, temple at night"],
  ["gengyin", "庚寅月老", "月老爺爺", "wood", "神", 4, "other", "rec", "月下老人", { attrAtk: { wood: 2 } }, "牽線", 6, { convert: ["water", "wood"] },
    "the Gengyin Yue Lao, an old matchmaker god with long white hair and a long white beard, red and gold robe, holding a book of marriages and red threads, under the moon"]
];
const BASE = { 4: { hp: 1600, atk: 600, rec: 300 }, 5: { hp: 2300, atk: 820, rec: 380 } };
const KIND = { atk: [.9, 1.2, .8], hp: [1.3, .9, .9], rec: [1, .85, 1.5], bal: [1.05, 1, 1.05] };
// 屬性傾向 [生命, 攻擊, 回復]：水屬性血多、回復高、攻擊低；火屬性攻擊高、血少、回復低
const ATTR_BIAS = { water: [1.3, .75, 1.6], fire: [.8, 1.35, .65] };
ROWS.forEach(([id, who, title, attr, race, star, series, kind, leadName, leadFx, actName, cd, actFx, desc], k) => {
  const b = BASE[star] || BASE[4], k0 = KIND[kind], ab = ATTR_BIAS[attr] || [1, 1, 1], m = k0.map((v, n) => v * ab[n]), j = 1 + ((k * 37) % 9 - 4) / 100;   // 每張卡微調一點點，數值才不會一模一樣
  CARDS[id] = {
    who, title, attr, race, star, series, kind,
    hp: Math.round(b.hp * m[0] * j / 10) * 10, atk: Math.round(b.atk * m[1] / j / 5) * 5, rec: Math.round(b.rec * m[2] * j / 5) * 5,
    art: `art/${id}.webp`, evo: null, stage: /^yutong(\d)?$/.test(id) ? ({ yutong1: 1, yutong: 2, yutong3: 3, yutong4: 4 })[id] : 0,
    lead: { name: leadName, fx: leadFx }, act: { name: actName, cd, fx: actFx }, gen: desc
  };
});
})();
// 語彤的進化順序
[["yutong1", "yutong"], ["yutong", "yutong3"], ["yutong3", "yutong4"]].forEach(([a, b]) => { CARDS[a].evo = b; });

/* =========================================================================
   戰力階級：依使用者的《黃泉燒肉店》S1–S5 戰力表（S+ 最強、D 最弱）
   表上 19 位照表；表上沒有的角色依劇情判斷（標 ※）
   星數與數值都由階級決定：數值 = 基準 × 階級倍率 × 型（攻／血／回復）× 屬性傾向
   ========================================================================= */
window.TIERS = {
  "S+": { star: 7, m: 1.7 }, "S": { star: 6, m: 1.45 }, "S-": { star: 6, m: 1.3 },
  "A": { star: 5, m: 1.15 }, "B": { star: 5, m: 1 }, "C": { star: 4, m: .88 }, "D": { star: 3, m: .78 }
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
    "右庶長": "C",     // 月老生前，朱雀將軍
    "紅衣武士": "D", "杜先生": "D", "泡芙": "D", "吳小白": "D", "二號": "D",
    "小雨": "D", "大寶": "D", "阿副": "D", "白妹": "D", "赤坂": "D",
    "林伯伯": "D", "王柏宏": "D", "筱晴": "D", "阿副的女友": "D", "茉蒂": "D", "大牛": "D",
    "咪咪": "D", "黑糖": "D", "謎": "D", "小米": "D", "918號引渡貓": "D", "貢丸君": "D", "毛怪": "D",
    "劉大牛": "D", "梁安恆": "D", "林怡曼": "D", "鐵蛋": "D"
  };
  // 李國志三階：業鏡羅漢照表是 B；刀鋸使、米店老闆依劇情往下
  const BY_ID = { lee1: "D", lee2: "C", lee3: "B", lee4: "B", yutong1: "D", yutong: "D", yutong3: "C", yutong4: "C" };
  // 同一階級裡，進化後的卡再強一點
  const EVO_UP = { lee2: 1.06, lee3: 1.06, lee4: 1.12, yutong: 1.06, yutong3: 1.0, yutong4: 1.08 };
  const ON_CHART = new Set(["路西法", "祝融", "基路伯", "觀音菩薩", "利維坦", "阿芙羅黛蒂", "哈索爾", "千里眼", "鼠軍師", "月老", "愛染明王", "華佗", "九尾", "語彤", "陽滋公主", "諾瓦", "狐姬", "七號"]);
  const KIND_ID = { lee1: "bal", lee2: "atk", lee3: "bal", lee4: "bal", xiaobai: "atk", xiaoyu: "rec", dabao: "atk", afu: "hp" };
  const KIND = { atk: [.9, 1.2, .8], hp: [1.3, .9, .9], rec: [1, .85, 1.5], bal: [1.05, 1, 1.05] };
  const BIAS = { water: [1.3, .75, 1.6], fire: [.8, 1.35, .65] };
  const BASE = [1800, 680, 330];
  Object.entries(CARDS).forEach(([id, c], k) => {
    const tier = BY_ID[id] || BY_WHO[c.who] || "D", t = TIERS[tier];
    const kind = KIND_ID[id] || c.kind || "bal", km = KIND[kind], ab = BIAS[c.attr] || [1, 1, 1];
    const j = 1 + ((k * 37) % 9 - 4) / 100, e = EVO_UP[id] || 1;   // j 每張卡微調、e 進化加成
    c.tier = tier; c.onChart = (ON_CHART.has(c.who) && !/^yutong/.test(id)) || id === "lee4" || id === "yutong4"; c.star = t.star;
    c.hp = Math.round(BASE[0] * t.m * km[0] * ab[0] * j * e / 10) * 10;
    c.atk = Math.round(BASE[1] * t.m * km[1] * ab[1] / j * e / 5) * 5;
    c.rec = Math.round(BASE[2] * t.m * km[2] * ab[2] * j * e / 5) * 5;
  });
})();

/* 技能說明：沒寫 desc 的卡片，依效果自動產生 */
(() => {
  const N = a => ATTR[a].name;
  function leadDesc(fx) {
    const t = [];
    if (fx.allAtk) t.push(`全隊攻擊力 ${fx.allAtk} 倍`);
    if (fx.attrAtk) Object.entries(fx.attrAtk).forEach(([a, x]) => t.push(`${N(a)}屬性攻擊力 ${x} 倍`));
    if (fx.allHp) t.push(`全隊生命力 ${fx.allHp} 倍`);
    if (fx.allRec) t.push(`全隊回復力 ${fx.allRec} 倍`);
    if (fx.allAs) t.push(`消除任何顏色的符石都算作${N(fx.allAs)}符石，${N(fx.allAs)}屬性成員都會出手`);
    if (fx.skyfall) Object.entries(fx.skyfall).forEach(([a, p]) => t.push(`${N(a)}符石掉落機率大幅提升（約 ${Math.round((p + (1 - p) / 6) * 100)}%）`));
    if (fx.multiAttr) t.push(`同時消除 ${fx.multiAttr.n} 種或以上屬性符石時，全隊攻擊力再 ${fx.multiAttr.x} 倍`);
    return t.join("；");
  }
  function actDesc(fx, attr) {
    const t = [];
    if (fx.convert) t.push(`${N(fx.convert[0])}符石轉化為${N(fx.convert[1])}符石`);
    if (fx.rainbow) t.push("所有符石重新排列，六種符石各 5 粒");
    if (fx.healPct) t.push(`回復最大生命力 ${Math.round(fx.healPct * 100)}%`);
    if (fx.delay) t.push(`所有敵人的攻擊延遲 ${fx.delay} 回合`);
    if (fx.guard) t.push(`${fx.guard} 回合內受到的傷害減半`);
    if (fx.nuke) t.push(`對全體敵人造成自身攻擊力 ${fx.nuke} 倍的${N(attr)}屬性傷害`);
    if (fx.buff) t.push(`本回合全隊攻擊力 ${fx.buff} 倍`);
    return t.join("，");
  }
  Object.values(CARDS).forEach(c => {
    if (!c.lead.desc) c.lead.desc = leadDesc(c.lead.fx);
    if (!c.act.desc) c.act.desc = actDesc(c.act.fx, c.attr);
  });
})();
