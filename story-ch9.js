/* =========================================================================
   第九章〈沒由來的惡夢〉（EP6-01～6-02，遠古大戰取自 EP5-17 基路伯的說明）
   「試用隊伍」：trial 裡的卡出擊時自動借用（隊長、戰友位），沒擁有也能用；其他位置照玩家自己的隊伍。
   ========================================================================= */

Object.assign(window.ENEMIES, {
  c9curse:   { demon: true, name: "遠古戰場的詛咒", attr: "dark", img: "art/enemy-c9curse.webp", hp: 80000, atk: 1500, cd: 2 },
  c9curseB:  { demon: true, name: "遠古戰場的詛咒", attr: "dark", img: "art/enemy-c9curse.webp", hp: 120000, atk: 2100, cd: 2 },
  xieshen: { demon: true, name: "邪神帝", attr: "dark", img: "art/enemy-xieshen.webp", hp: 700000, atk: 3200, cd: 3, boss: true,
             title: "克蘇魯之主", warn: "遠古戰場 ‧ 克蘇魯", quote: "狗屎",
             skills: [{ on: "spawn", name: "不可直視", absorb: 50000, turns: 2 },
                      { on: "attack", name: "降下詛咒球", convert: ["heart", "dark"], n: 4 },
                      { on: "low", name: "百種詛咒", hp: .3, cd: 1, atk: 1.5 }] }
});
["c9curse", "c9curseB", "xieshen"].forEach(k => {   // story.js 結尾的難度放寬要自己套
  const e = window.ENEMIES[k];
  e.hp = Math.round(e.hp * EASE.hp / 1000) * 1000; e.atk = Math.round(e.atk * EASE.atk / 100) * 100;
});

[
  ["路西法", "天族的大天使，天族最強戰士。遠古大戰裡，和祝融合力殲滅了邪神帝。"],
  ["祝融", "半神隊長，稱號赤帝。遠古大戰裡，和大天使路西法並肩作戰。"],
  ["邪神帝", "宇宙最惡劣的種族「克蘇魯」的首領。看著他，眼睛就會燃燒。"],
  ["大寶", "消防小隊長。這陣子又夢見了遠古大戰。"],
  ["小雨", "黃泉燒肉店的店員，現在是代理店長。"]
].forEach(([k, v]) => { window.INTRO[k] = window.INTRO[k] || v; });
Object.assign(window.VN, { "路西法": "lucifer", "祝融": "zhurong" });

window.CHAPTERS.push({
  id: "ch9", music: { battle: "battle1", boss: "boss2" }, no: "第九章", name: "沒由來的惡夢", sub: "遠古大戰", place: "大寶的夢 ‧ 遠古戰場", bg: "art/bg-ch9.webp",
  trial: ["lucifer", "zhurong"],   // 試用隊伍：隊長＝路西法、戰友＝祝融
  intro: "大寶又夢見了遠古大戰。這一章借用路西法和祝融出戰，沒有他們也能打。",
  pre: [
    ["@scene", "art/scenes/091.webp"],
    [null, "第六季開始。三途川的日式庭園，老闆問休假的語彤，怎麼還在研究卜卦。"],
    [null, "語彤說，她沒有師傅那雙靈瞳，怕幫人牽姻緣時搞錯方向。"],
    [null, "老闆說，月老剛成神的時候，也一直犯錯。"],
    ["@scene", "art/scenes/193.webp"],
    [null, "黑白的回憶裡，觀音質問剛拿到神牌就跑去印度聖域、騎聖牛南迪的月老和華佗。"],
    ["觀音菩薩", "你們可不可以成熟點", "EP6-01", "serious"],
    ["李國志", "所以你也別給自己太大的壓力，不只是人，即使是神明也會犯錯", "EP6-01", "smile"],
    ["@scene", "art/scenes/092.webp"],
    [null, "夜裡，大寶睡著了，身邊的小雨也睡得很沉。"],
    [null, "夢裡，是一片遠古戰場。"]
  ],
  waves: [
    { enemies: ["c9curse", "c9curse"], lines: [
        ["@scene", "art/scenes/194.webp"],
        [null, "夢裡，遠古戰場上，一顆顆刻滿符文的詛咒球飄在空中。"],
        [null, "很久很久以前，天族把自己的基因和地球物種融合成人類，讓人類到地下替他們採集靈魂核心的礦石。"],
        [null, "後來，宇宙最惡劣的種族「克蘇魯」也來到了地球。看著克蘇魯，眼睛就會燃燒。"]
      ] },
    { enemies: ["c9curseB", "c9curse", "c9curseB"], lines: [
        [null, "戰況對善良陣營不利時，女媧和眾古神挑選善良的人類，製造出半神物種。"],
        ["基路伯", "在邪神帝消亡前，對當初協助參戰的神靈降下100種詛咒，「咫尺天涯」便是其中一種", "EP5-17", "serious"],
        [null, "戰場盡頭，天族的大天使路西法，面對著邪神帝。"]
      ] },
    { enemies: ["xieshen"], lines: [
        ["路西法", "克蘇魯已經輸了", "EP6-02", "serious"],
        [null, "邪神帝問他，就不怕被詛咒嗎。"],
        [null, "路西法說，他可是天族的最強戰士。"],
        ["邪神帝", "狗屎", "EP6-02"],
        [null, "邪神帝降下一顆刻滿符文的詛咒球。"],
        [null, "這時，半神隊長赤帝祝融趕到了。路西法問他，沒跟大部隊一起撤退嗎？"],
        ["祝融", "可以跟大天使並肩作戰……是我身為半神隊長的光榮", "EP6-02", "serious"],
        [null, "他揮槍，衝向邪神帝。"]
      ] }
  ],
  post: [
    [null, "路西法和祝融合力，用上帝之矛殲滅了邪神帝。"],
    ["@scene", "art/scenes/092.webp"],
    [null, "半夜，大寶從夢中驚醒。旁邊的小雨還在睡。"],
    [null, "他摸著貓說："],
    ["大寶", "又是這個噩夢，小時候在大地震前也有夢到，好不安的感覺", "EP6-02"],
    ["大寶", "你們可不能再有事", "EP6-02"]
  ]
});

/* 大寶的立繪在第十章生好了（第六季同一時期的家居造型），這章也用 */
{ const ch = window.CHAPTERS.find(c => c.id === "ch9"); ch.vn = { ...(ch.vn || {}), "大寶": "dabao" }; }
