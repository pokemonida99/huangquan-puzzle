/* =========================================================================
   黃泉燒肉店 轉珠 ‧ 資料
   ▸ ATTR  六種符石（五屬性＋心）
   ▸ SERIES 卡片系列（試玩版只有標 ready 的卡可以上場，其餘是預定名單）
   ▸ CARDS  卡片：同一個角色的各進化階段用 evo 串起來
   ▸ STAGE  試玩關卡
   角色設定以《黃泉燒肉店》劇中出現過的稱呼與事件為準。
   ========================================================================= */

/* 版本：每次對外更新記得往上加，標題畫面與設定都會顯示 */
window.GAME_VERSION = "1.3.5";

window.ATTR = {
  water: { name: "水", color: "#3fa7ff", dark: "#0b4c8c", glyph: "水" },
  fire:  { name: "火", color: "#ff5a3c", dark: "#8c1a0b", glyph: "火" },
  wood:  { name: "木", color: "#4fd06a", dark: "#145c25", glyph: "木" },
  light: { name: "光", color: "#ffd84a", dark: "#8c6a0b", glyph: "光" },
  dark:  { name: "暗", color: "#b06bff", dark: "#43127a", glyph: "暗" },
  heart: { name: "心", color: "#ff7fb8", dark: "#8c1f55", glyph: "心" }
};
// 克制：水剋火、火剋木、木剋水，光暗互剋
window.BEATS = { water: "fire", fire: "wood", wood: "water", light: "dark", dark: "light" };

window.SERIES = [
  { id: "shop",  name: "黃泉燒肉店", sub: "如入火聚，得清涼門", color: "#C9A46A", members: ["李國志", "小雨", "語彤", "白妹"] },
  { id: "fire",  name: "呆丸消防隊", sub: "我會記得你曾來過人間", color: "#E0714A", members: ["大寶", "阿副", "赤坂", "紅衣武士"] },
  { id: "human", name: "人間", sub: "是壞人不好", color: "#8FB4D8", members: ["林伯伯", "王柏宏", "筱晴", "阿副的女友", "茉蒂", "大牛", "辣雞", "小樂", "阿斌的媽媽", "算命阿婆", "外婆", "吉他手", "廟公", "狀元糕老伯"] },
  { id: "sanzu", name: "三途川居民", sub: "返魂坂的燈還亮著", color: "#9FC6D8",
    members: ["咪咪", "黑糖", "狐姬", "七號", "二號", "杜先生", "泡芙", "謎", "小米", "辜老師", "918號引渡貓", "貢丸君", "毛怪", "綠衣女子"] },
  { id: "gods",  name: "神明與天族", sub: "讓受過傷的人再相信一次", color: "#E86A80",
    members: ["觀音菩薩", "月老", "華佗", "陽滋公主", "九尾", "千里眼", "哈索爾", "阿芙羅黛蒂", "愛染明王", "神差", "基路伯", "祝融"] },
  { id: "demon", name: "魔界", sub: "七宗罪與魔界王國", color: "#B06BFF", members: ["吳小白", "利維坦", "諾瓦", "鼠軍師", "路西法", "撒旦", "瘟疫", "第三王國惡魔"] },
  { id: "other", name: "異時空", sub: "大秦 ‧ 庚寅地球", color: "#D8B470", members: ["岳夏澤", "劉大牛", "趙大人", "翠花", "秦王", "梁安恆", "林怡曼", "鐵蛋", "庚寅月老", "梁安恆的媽媽", "庚寅筱晴", "八尺大人", "術士", "白蛛會角頭"] }
];


/*
  卡片欄位
  id / who 角色 / title 稱號 / attr 屬性 / race 種族
  art 卡面 / evo 下一階段 id / lead 隊長技 / act 主動技 {name, cd, desc, fx}
  星數、生命、攻擊、回復由 cards.js 的「戰力階級」統一算出，不寫在這裡
  lore 一句話（取自劇情）
*/
window.CARDS = {
  /* ---------------- 李國志：白李米店 → 刀鋸使 → 業鏡羅漢 ---------------- */
  lee1: {
    who: "李國志", title: "白李米店", attr: "light", race: "人類",
    art: "art/lee1.webp", evo: "lee2", stage: 1,
    lore: "七十多年前，不忍村裡百姓餓死，偷偷把米賣給窮人。",
    lead: { name: "偷賣米", desc: "光屬性攻擊力 2 倍", fx: { attrAtk: { light: 2 } } },
    act: { name: "開倉放糧", cd: 6, desc: "心符石轉化為光符石", fx: { convert: ["heart", "light"] } }
  },
  lee2: {
    who: "李國志", title: "刀鋸使", attr: "light", race: "地府官差",
    art: "art/lee2.webp", evo: "lee3", stage: 2,
    lore: "到地府第一天也去要了黑令旗，後來在刀鋸地獄當刀鋸使。",
    lead: { name: "刀鋸使聽令", desc: "全隊攻擊力 2.5 倍", fx: { allAtk: 2.5 } },
    act: { name: "刀鋸地獄", cd: 8, desc: "暗符石轉化為光符石，並對全體敵人造成自身攻擊力 20 倍的光屬性傷害", fx: { convert: ["dark", "light"], nuke: 20 } }
  },
  lee3: {
    who: "李國志", title: "業鏡羅漢", attr: "light", race: "地府官差",
    art: "art/lee3.webp", evo: "lee4", stage: 3,
    lore: "村民替他蓋了義民廟，累積六萬功德，被稱為「業鏡羅漢」。",
    lead: { name: "業鏡審判", desc: "全隊攻擊力 3 倍、生命力 1.5 倍；同時消除 4 種或以上屬性符石時，全隊攻擊力再 1.5 倍",
      fx: { allAtk: 3, allHp: 1.5, multiAttr: { n: 4, x: 1.5 } } },
    act: { name: "業鏡照心", cd: 7, fx: { rainbow: true, buff: 1.5 } }
  },

  lee4: {
    who: "李國志", title: "業鏡羅漢（禮帽）", attr: "light", race: "地府官差",
    art: "art/lee4.webp", evo: null, stage: 4,
    lore: "戴禮帽、穿西裝的燒肉店老闆。地府不允許魔存在，他以羅漢之名擔保，把語彤帶回燒肉店。",
    lead: { name: "羅漢之名擔保", desc: "全隊攻擊力 3 倍、生命力 1.5 倍；同時消除 4 種或以上屬性符石時，全隊攻擊力再 1.8 倍",
      fx: { allAtk: 3, allHp: 1.5, multiAttr: { n: 4, x: 1.8 } } },
    act: { name: "異界降臨", cd: 5, fx: { rainbow: true, buff: 1.8 } }
  },

  /* ---------------- 基礎隊員 ---------------- */
  xiaobai: {
    who: "吳小白", title: "初代の吳小白", attr: "dark", race: "魔族",
    art: "art/xiaobai.webp", evo: null,
    lore: "EP3 單曲 MV 的樂團成員，第四季以惡魔造型再登場。",
    planned: ["樂團的小白", "初代の吳小白"],
    lead: { name: "再登場", desc: "暗屬性攻擊力 2 倍", fx: { attrAtk: { dark: 2 } } },
    act: { name: "魔界獨奏", cd: 4, fx: { rowTo: "dark", buff: 1.3 } }
  },
  xiaoyu: {
    who: "小雨", title: "燒肉店店員", attr: "water", race: "人類",
    art: "art/xiaoyu.webp", evo: null,
    lore: "替每一位客人端上遺願馬卡龍。",
    planned: ["燒肉店店員", "代理店長"],
    lead: { name: "先吃遺願馬卡龍", desc: "回復力 2 倍", fx: { allRec: 2 } },
    act: { name: "遺願馬卡龍", cd: 4, fx: { healPct: .3, convert: ["heart", "water"], buff: 1.3 } }
  },
  dabao: {
    who: "大寶", title: "消防小隊長", attr: "fire", race: "人類",
    art: "art/dabao.webp", evo: null,
    lore: "總是把存下來的功德花在別人身上。",
    planned: ["消防小隊長", "托夢照相館", "天煞孤星"],
    lead: { name: "嘴賤講義氣", desc: "火屬性攻擊力 2 倍", fx: { attrAtk: { fire: 2 } } },
    act: { name: "把功德花光", cd: 4, fx: { convert: ["heart", "fire"], buff: 1.8 } }
  },
  afu: {
    who: "阿副", title: "長髮消防員", attr: "wood", race: "人類",
    art: "art/afu.webp", evo: null,
    lore: "大寶的兄弟，在 EP9 被提到打呼很大聲的「黃副」可能就是他。",
    planned: ["長髮消防員", "陽光手機門市"],
    lead: { name: "兄弟", desc: "木屬性攻擊力 2 倍", fx: { attrAtk: { wood: 2 } } },
    act: { name: "我會記得你曾來過人間", cd: 4, fx: { convert: ["heart", "wood"], selfBuff: 3 } }
  }
};

/* 試玩隊伍：頭尾都是李國志 */
window.DEMO_TEAM = ["lee4", "xiaobai", "xiaoyu", "dabao", "afu", "lee4"];

/* 推薦隊伍：選了之後每一格都還能自由換卡 */
window.PRESETS = [
  { name: "業鏡五屬隊", note: "禮帽西裝的李國志帶隊，一次消四種顏色攻擊力再加成。光剋暗：第一章", team: DEMO_TEAM },
  { name: "嫉妒魔王水隊", note: "利維坦：任何顏色都算水。血多、回復高、攻擊低。水剋火：第五章", team: ["leviathan", "nova", "mimi", "jiuwei", "yangzi", "leviathan"] },
  { name: "醫神木隊", note: "華佗：木屬性攻擊大增、回復高、每次轉珠後回血。木剋水：第四章", team: ["huatuo", "afu", "qianliyan", "heitang", "lvyi", "huatuo"] },
  { name: "小月老暗隊", note: "語彤（覺醒）：暗屬性攻擊大增、血量加成，隊友全是暗屬性。轉光為暗、全隊加攻擊的主動技。暗光互剋", team: ["yutong5", "du", "rat", "moti", "reaperc", "yutong5"] },
  { name: "赤帝火隊", note: "祝融：火珠大量掉落。攻擊高、血少、回復低。火剋木：第二章", team: ["zhurong", "dabao", "aizen", "akasaka", "huji", "zhurong"] },
  { name: "萌獸隊", note: "黑糖帶隊，咪咪、918號、貢丸君、毛怪：全是二星，照相館用最少的功德就能買齊。", team: ["heitang", "mimi", "cat918", "gongwan", "maoguai", "heitang"] }
];

window.ENEMIES = {
  bat:    { demon: true, name: "蝙蝠惡魔", attr: "fire", img: "art/enemy-bat.webp", hp: 82000, atk: 1500, cd: 2 },
  reaper: { demon: true, name: "第三王國惡魔", attr: "dark", img: "art/enemy-reaper.webp", hp: 110000, atk: 2400, cd: 3 },
  plague: { demon: true, name: "瘟疫", attr: "wood", img: "art/enemy-plague.webp", hp: 86000, atk: 2000, cd: 2,
            skills: [{ on: "attack", name: "瘟疫蔓延", convert: ["heart", "wood"], n: 3 }] },
  satan:  { demon: true, name: "撒旦", attr: "fire", img: "art/enemy-satan.webp", hp: 935000, atk: 4800, cd: 3, boss: true }
};

window.STAGE = {
  name: "第三王國入侵",
  place: "三途川",
  intro: "穿界門被打開了，撒旦帶著第三王國的軍隊闖進三途川。",
  waves: [["bat", "bat"], ["plague", "reaper"], ["satan"]]
};

/* =========================================================================
   角色檔案（卡片「故事」「資料」頁）
   文字取自棲渺拾光燈下資料館的人物側寫與分集台詞，不另外編寫。
   debut 首次登場、eps 出場集數、rel 關係、quotes [集數, 台詞]
   ========================================================================= */
window.PROFILE = {
  "李國志": {
    story: "本名李國志，生前是白李米店的老闆。七十多年前他不忍看村裡百姓餓死，偷賣米給窮人，被徵糧的軍人槍斃。到地府第一天他也去要了黑令旗，後來在刀鋸地獄當刀鋸使，直到觀音賞他業鏡王的官袍、讓他掌管黃泉燒肉店。生前幫助過的村民替他蓋了義民廟，讓他累積到六萬功德，被稱為「業鏡羅漢」。",
    aka: ["老闆", "老大", "阿志", "業鏡王"], debut: "EP1-02", eps: 28,
    rel: [["白妹", "生前的戀人"], ["小雨", "老闆與店員"], ["觀音菩薩", "賜他業鏡羅漢之名"], ["語彤", "乾爹"]],
    quotes: [["EP1-04", "白妹，我一定會回來娶你，等我"], ["EP1-15", "你終於來了"]]
  },
  "小雨": {
    story: "元小雨，因病早逝，在燒肉店打工。她替每一位客人端上遺願馬卡龍，後來當上代理店長，還被老闆發了一套她不想要的「潮流韓風」制服。第六季，她身上出現了天煞孤星的詛咒。",
    aka: ["元小雨", "咪咪的媽咪"], debut: "EP1-01", eps: 20,
    rel: [["大寶", "戀人"], ["咪咪", "主人與貓"], ["李國志", "老闆與店員"]],
    quotes: [["SP1-01", "記得盯咪咪多喝水，它腎不好"], ["角色短片-01", "我喜歡你這麼高，抬頭看著你的感覺很有安全感"]]
  },
  "大寶": {
    story: "九二一之後家裡只剩他一個人。生前是消防隊的小隊長，在山火救援中跳下直升機殉職；死後在托夢照相館工作，和小雨、咪咪成了一家人。他總是把存下來的功德花在別人身上。算命阿婆說他的命格是「天煞孤星」。",
    aka: ["小隊長", "天煞孤星"], debut: "EP1-08", eps: 22,
    rel: [["小雨", "戀人"], ["阿副", "兄弟"], ["咪咪", "爸爸與貓"], ["赤坂", "隊長與小隊長"]],
    quotes: [["EP2-08", "如果有些事不方便跟人說，可以寫信燒給我，我有空會托夢跟你聊聊"], ["EP6-08", "不要又讓我失去你們"]]
  },
  "阿副": {
    story: "長髮的消防隊員，大寶的兄弟。大寶殉職後轉職科技業並罹患憂鬱症，墜樓時被大寶花光功德救回。之後在陽光手機門市工作，也是一拳打倒辣雞的人。EP9 大寶提到隊上打呼很大聲的「黃副」，可能就是他。",
    aka: ["長髮消防員", "黃副（推測）"], debut: "EP1-08", eps: 11,
    rel: [["大寶", "兄弟"], ["阿副的女友", "戀人"], ["赤坂", "消防隊長官"]],
    quotes: [["EP1-14", "我會記得你曾來過人間"], ["角色短片-11", "傻兄弟，我來看你了"]]
  },
  "吳小白": {
    story: "EP3〈貓貓的三途川車站〉原創單曲 MV「我坐火車來看你」裡的樂團成員，和小雨、茉蒂同台。第四季〈魔界的獨角鯨〉的角色預告裡，以「初代の吳小白」的惡魔造型再登場。",
    aka: ["小白", "初代の吳小白"], debut: "MV-02", eps: 2,
    rel: [["小雨", "樂團同伴"], ["茉蒂", "樂團同伴"]],
    quotes: []
  },
  /* 敵人 */
  "蝙蝠惡魔": {
    story: "魔界第三王國的紅色蝙蝠惡魔，跟著撒旦的軍隊闖進三途川。",
    aka: [], debut: "EP4-12", eps: 1, rel: [["撒旦", "第三王國"]],
    quotes: [["EP4-12", "我們的先遣軍全滅了，你的戰力情報都亂給"]]
  },
  "第三王國惡魔": {
    story: "撒旦座下第五軍團的百夫長，死神模樣的惡魔。闖進三途川搜捕高品質靈魂，擄走了狐姬。",
    aka: ["第五軍團百夫長"], debut: "EP4-10", eps: 2, rel: [["撒旦", "效忠的魔王"], ["狐姬", "擄走的對象"]],
    quotes: [["EP4-10", "剛來就遇到百年妖狐，真幸運"]]
  },
  "瘟疫": {
    story: "魔界第三王國的總參謀，撒旦的軍師。",
    aka: ["第三王國總參謀"], debut: "EP4-12", eps: 2, rel: [["撒旦", "效忠的魔王"]],
    quotes: [["EP4-16", "我是撒旦的軍師，奴家名叫「瘟疫」，在被我打死之前，能不能告訴奴家你的名字"]]
  },
  "撒旦": {
    story: "魔界第三王國的魔王，七宗罪之「憤怒」，黑山羊外型。被辜老師邀請入侵三途川，最後被利維坦的「無上戰技」打倒，第三王國因此陷入內亂。",
    aka: ["憤怒魔王"], debut: "EP4-12", eps: 3, rel: [["利維坦", "魔王之戰"], ["辜老師", "引他入侵的人"]],
    quotes: [["EP4-15", "我不是針對生靈，我是指在座的各位，都是垃圾"], ["EP4-17", "這就是愛的力量嗎，好不甘心"]]
  }
};
