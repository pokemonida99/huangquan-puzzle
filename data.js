/* =========================================================================
   黃泉燒肉店 轉珠 ‧ 資料
   ▸ ATTR  六種符石（五屬性＋心）
   ▸ SERIES 卡片系列（試玩版只有標 ready 的卡可以上場，其餘是預定名單）
   ▸ CARDS  卡片：同一個角色的各進化階段用 evo 串起來
   ▸ STAGE  試玩關卡
   角色設定以《黃泉燒肉店》劇中出現過的稱呼與事件為準。
   ========================================================================= */

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
  { id: "shop",  name: "黃泉燒肉店", sub: "如入火聚，得清涼門", color: "#C9A46A",
    members: ["李國志", "小雨", "語彤"] },
  { id: "fire",  name: "呆丸消防隊", sub: "我會記得你曾來過人間", color: "#E0714A",
    members: ["大寶", "阿副", "赤坂"] },
  { id: "sanzu", name: "三途川居民", sub: "返魂坂的燈還亮著", color: "#9FC6D8",
    members: ["咪咪", "黑糖", "白妹", "狐姬", "七號", "杜先生"] },
  { id: "gods",  name: "神明與天族", sub: "讓受過傷的人再相信一次", color: "#E86A80",
    members: ["觀音菩薩", "月老", "華佗", "陽滋公主", "九尾"] },
  { id: "demon", name: "魔界", sub: "七宗罪與第三王國", color: "#B06BFF",
    members: ["吳小白", "利維坦", "諾瓦", "鼠軍師", "路西法"] }
];

/* 預定名單用的頭像（還沒做卡面的角色先用劇照頭像） */
window.AVATAR = {
  "語彤": "c044", "赤坂": "c012", "咪咪": "c028", "黑糖": "c025", "白妹": "c021", "狐姬": "c035",
  "七號": "c062", "杜先生": "c081", "觀音菩薩": "c005", "月老": "c030", "華佗": "c091",
  "陽滋公主": "c064", "九尾": "c097", "利維坦": "c059", "諾瓦": "c060", "鼠軍師": "c067", "路西法": "c095"
};

/*
  卡片欄位
  id / who 角色 / title 稱號 / attr 屬性 / race 種族 / star 星數
  hp atk rec / art 卡面 / evo 下一階段 id / lead 隊長技 / act 主動技 {name, cd, desc, fx}
  lore 一句話（取自劇情）
*/
window.CARDS = {
  /* ---------------- 李國志：白李米店 → 刀鋸使 → 業鏡羅漢 ---------------- */
  lee1: {
    who: "李國志", title: "白李米店", attr: "light", race: "人類", star: 4,
    hp: 1400, atk: 520, rec: 220, art: "art/lee1.webp", evo: "lee2",
    lore: "七十多年前，不忍村裡百姓餓死，偷偷把米賣給窮人。",
    lead: { name: "偷賣米", desc: "光屬性攻擊力 2 倍", fx: { attrAtk: { light: 2 } } },
    act: { name: "開倉放糧", cd: 6, desc: "心符石轉化為光符石", fx: { convert: ["heart", "light"] } }
  },
  lee2: {
    who: "李國志", title: "刀鋸使", attr: "light", race: "地府官差", star: 5,
    hp: 2200, atk: 760, rec: 300, art: "art/lee2.webp", evo: "lee3",
    lore: "到地府第一天也去要了黑令旗，後來在刀鋸地獄當刀鋸使。",
    lead: { name: "刀鋸使聽令", desc: "全隊攻擊力 2.5 倍", fx: { allAtk: 2.5 } },
    act: { name: "刀鋸地獄", cd: 8, desc: "暗符石轉化為光符石，並對全體敵人造成自身攻擊力 20 倍的光屬性傷害", fx: { convert: ["dark", "light"], nuke: 20 } }
  },
  lee3: {
    who: "李國志", title: "業鏡羅漢", attr: "light", race: "地府官差", star: 6,
    hp: 3200, atk: 1050, rec: 420, art: "art/lee3.webp", evo: null,
    lore: "村民替他蓋了義民廟，累積六萬功德，被稱為「業鏡羅漢」。",
    lead: { name: "業鏡審判", desc: "全隊攻擊力 3 倍、生命力 1.5 倍；同時消除 4 種或以上屬性符石時，全隊攻擊力再 1.5 倍",
      fx: { allAtk: 3, allHp: 1.5, multiAttr: { n: 4, x: 1.5 } } },
    act: { name: "業鏡照心", cd: 10, desc: "所有符石重新排列，六種符石各 5 粒；本回合全隊攻擊力 1.5 倍", fx: { rainbow: true, buff: 1.5 } }
  },

  /* ---------------- 基礎隊員 ---------------- */
  xiaobai: {
    who: "吳小白", title: "初代の吳小白", attr: "dark", race: "魔族", star: 4,
    hp: 1500, atk: 700, rec: 160, art: "art/xiaobai.webp", evo: null,
    lore: "EP3 單曲 MV 的樂團成員，第四季以惡魔造型再登場。",
    planned: ["樂團的小白", "初代の吳小白"],
    lead: { name: "再登場", desc: "暗屬性攻擊力 2 倍", fx: { attrAtk: { dark: 2 } } },
    act: { name: "魔界獨奏", cd: 6, desc: "心符石轉化為暗符石", fx: { convert: ["heart", "dark"] } }
  },
  xiaoyu: {
    who: "小雨", title: "燒肉店店員", attr: "water", race: "人類", star: 4,
    hp: 1700, atk: 560, rec: 520, art: "art/xiaoyu.webp", evo: null,
    lore: "替每一位客人端上遺願馬卡龍。",
    planned: ["燒肉店店員", "代理店長"],
    lead: { name: "先吃遺願馬卡龍", desc: "回復力 2 倍", fx: { allRec: 2 } },
    act: { name: "遺願馬卡龍", cd: 6, desc: "回復最大生命力 50%，並把木符石轉化為水符石", fx: { healPct: 0.5, convert: ["wood", "water"] } }
  },
  dabao: {
    who: "大寶", title: "消防小隊長", attr: "fire", race: "人類", star: 4,
    hp: 1900, atk: 680, rec: 250, art: "art/dabao.webp", evo: null,
    lore: "總是把存下來的功德花在別人身上。",
    planned: ["消防小隊長", "托夢照相館", "天煞孤星"],
    lead: { name: "嘴賤講義氣", desc: "火屬性攻擊力 2 倍", fx: { attrAtk: { fire: 2 } } },
    act: { name: "把功德花光", cd: 7, desc: "本回合全隊攻擊力 2 倍", fx: { buff: 2 } }
  },
  afu: {
    who: "阿副", title: "長髮消防員", attr: "wood", race: "人類", star: 4,
    hp: 2100, atk: 600, rec: 300, art: "art/afu.webp", evo: null,
    lore: "大寶的兄弟，在 EP9 被提到打呼很大聲的「黃副」可能就是他。",
    planned: ["長髮消防員", "陽光手機門市"],
    lead: { name: "兄弟", desc: "木屬性攻擊力 2 倍", fx: { attrAtk: { wood: 2 } } },
    act: { name: "我會記得你曾來過人間", cd: 6, desc: "所有敵人的攻擊延遲 2 回合", fx: { delay: 2 } }
  }
};

/* 試玩隊伍：頭尾都是李國志 */
window.DEMO_TEAM = ["lee3", "xiaobai", "xiaoyu", "dabao", "afu", "lee3"];

window.ENEMIES = {
  bat:    { name: "蝙蝠惡魔", attr: "fire", img: "art/enemy-bat.webp", hp: 45000, atk: 1400, cd: 2 },
  reaper: { name: "第三王國惡魔", attr: "dark", img: "art/enemy-reaper.webp", hp: 160000, atk: 2600, cd: 3 },
  plague: { name: "瘟疫", attr: "wood", img: "art/enemy-plague.webp", hp: 120000, atk: 2000, cd: 2 },
  satan:  { name: "撒旦", attr: "fire", img: "art/enemy-satan.webp", hp: 650000, atk: 4200, cd: 3, boss: true }
};

window.STAGE = {
  name: "第三王國入侵",
  place: "三途川",
  intro: "穿界門被打開了，撒旦帶著第三王國的軍隊闖進三途川。",
  waves: [["bat", "bat"], ["plague", "reaper"], ["satan"]]
};
