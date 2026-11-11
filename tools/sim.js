// 平衡模擬：node tools/sim.js
// 「普通回合」＝4 combo：隊伍主色 2 組、次色 1 組、第三色或心 1 組，每組 3 顆（Fable 建議的假設）
// 新版隊長技（2026-11-11）：comboAt 依普通回合的 combo 數判斷（新版隊伍假設 5 combo，延長轉珠的隊長再 +1）；追打 chase、減傷 dmgCut 都算進去
// 古神戰（章節有 seal）：逐回合模擬封鎖與大寶「赤帝之火」解除，見 sealRun()
global.window = global;
require("../data.js"); require("../cards.js"); require("../story.js");
require("fs").readdirSync(require("path").join(__dirname, "..")).filter(f => /^story-ch.*\.js$/.test(f)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8))).forEach(f => require("../" + f));   // 各章獨立檔
const BEATS = window.BEATS;
const typeMul = (a, d) => BEATS[a] === d ? 2 : BEATS[d] === a && a !== "light" && a !== "dark" ? .5 : 1;
const leads = team => [CARDS[team[0]].lead.fx, CARDS[team[5]].lead.fx];
function normalCombos(team) {   // 新版隊長的隊伍比較會轉：5 combo；每有一位延長轉珠的隊長 +1
  const L = leads(team);
  const newgen = [team[0], team[5]].some(id => CARDS[id].newgen);
  return (newgen ? 5 : 4) + L.filter(fx => fx.timeAdd).length;
}
function turnDamage(team, enemy, combos = normalCombos(team), only = null) {   // only：只算這幾格的人出手（封鎖中只有大寶）
  const L = leads(team);
  const cnt = {}; team.forEach(id => { const a = CARDS[id].attr; cnt[a] = (cnt[a] || 0) + 1; });
  const order = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
  // 有「消除 n 種屬性」加成的隊長（五屬隊），普通回合就是消 n 種不同顏色
  const rainbow = L.some(fx => fx.multiAttr);
  const pick = rainbow ? [order[0], order[1], order[2], order[3], order[0], order[1]] : [order[0], order[0], order[1] || order[0], order[2] || "heart", order[0], order[1] || "heart"];
  const groups = pick.map(a => a || "heart").slice(0, combos).map(attr => ({ attr, n: 3 }));
  const kinds = new Set(groups.filter(g => g.attr !== "heart").map(g => g.attr)).size;
  const comboUp = L.reduce((a, fx) => a + (fx.comboUp || 0), 0);
  const comboMul = 1 + (groups.length - 1) * (.25 + comboUp);
  let total = 0;
  team.forEach((id, slot) => {
    if (only && !only.includes(slot)) return;
    const c = CARDS[id], asAll = L.some(fx => fx.allAs === c.attr);
    const mine = groups.filter(g => g.attr === c.attr || asAll);
    if (!mine.length) return;
    let m = 1;
    L.forEach(fx => {
      if (fx.allAtk) m *= fx.allAtk; if (fx.attrAtk && fx.attrAtk[c.attr]) m *= fx.attrAtk[c.attr];
      if (fx.multiAttr && kinds >= fx.multiAttr.n) m *= fx.multiAttr.x;
      if (fx.comboAt && groups.length >= fx.comboAt.n) m *= fx.comboAt.x;
    });
    const vd = enemy.demon ? L.reduce((a, fx) => a * (fx.vsDemon || 1), 1) : 1;
    total += c.atk * mine.length * comboMul * m * typeMul(c.attr, enemy.attr) * vd;
  });
  [0, 5].forEach(k => { const c = CARDS[team[k]]; if (only && !only.includes(k)) return; if (c.lead.fx.chase) total += c.atk * c.lead.fx.chase * typeMul(c.attr, enemy.attr); });   // 追打
  return total;
}
function teamHp(team) { let hp = team.reduce((s, id) => s + CARDS[id].hp, 0); [0, 5].forEach(i => { const f = CARDS[team[i]].lead.fx; if (f.allHp) hp *= f.allHp; }); return hp; }
const dmgCut = team => leads(team).reduce((a, fx) => a * (1 - (fx.dmgCut || 0)), 1);
/* 古神戰：開場封鎖；大寶 CD 到了就發「赤帝之火」解除（同回合可攻擊），王攻擊後再封鎖。回傳打完全部波次的回合數（打不過回傳 Infinity） */
function sealRun(team, ch) {
  const un = id => (CARDS[id].acts || [CARDS[id].act]).find(a => a.fx.unseal);
  const dab = team.findIndex(id => un(id));
  const atkAct = dab >= 0 ? CARDS[team[dab]].acts.find(a => a.fx.nuke) : null;
  let sealed = false, cd = 0, cdA = atkAct ? atkAct.cd : 0, turns = 0;
  for (const w of ch.waves) {
    const es = w.enemies.map(k => ({ ...ENEMIES[k], hpNow: ENEMIES[k].hp, cdNow: ENEMIES[k].cd }));
    if (es.some(e => (e.skills || []).some(s => s.seal))) sealed = true;   // 古神那一波才封鎖
    while (es.some(e => e.hpNow > 0)) {
      if (++turns > 80) return Infinity;
      let boost = 1;
      if (sealed && dab >= 0 && cd <= 0) { sealed = false; cd = un(team[dab]).cd; }   // 直視古神：解除封鎖（同回合可攻擊）
      if (!sealed && atkAct && cdA <= 0) {   // 赤帝之火：對克蘇魯系特別痛
        const c = CARDS[team[dab]], f = atkAct.fx; cdA = atkAct.cd;
        es.filter(e => e.hpNow > 0).forEach(e => e.hpNow -= c.atk * f.nuke * (e.cthulhu ? f.vsCthulhu || 1 : 1) * typeMul(c.attr, e.attr));
        boost = f.selfBuff ? 1 + (f.selfBuff - 1) / 6 : 1;   // 大寶自己 3 倍，攤到全隊約 1.3 倍
      }
      const live = es.filter(e => e.hpNow > 0);   // 封鎖中只有大寶出手
      live.forEach(e => e.hpNow -= turnDamage(team, e, undefined, sealed ? [dab] : null) * boost / live.length);
      cd = Math.max(0, cd - 1); cdA = Math.max(0, cdA - 1);
      for (const e of es.filter(x => x.hpNow > 0)) if (--e.cdNow <= 0) { e.cdNow = e.cd; e.hits = (e.hits || 0) + 1; const sk = (e.skills || []).find(s => s.seal); if (sk && e.hits % (sk.every || 1) === 0) sealed = true; }
    }
  }
  return turns;
}
const TEAMS = {
  "初始隊（李國志×2）": DEMO_TEAM,
  ...Object.fromEntries(PRESETS.slice(1).map(p => [p.name, p.team])),
  "月老帶木隊": ["yuelao", "afu", "qianliyan", "heitang", "lvyi", "yuelao"],
  "全 D 卡隊": ["yutong1", "xiaobai", "xiaoyu", "dabao", "afu", "lee1"],
  "路西法雙隊長（最強舊卡）": ["lucifer", "guanyin", "cherub", "hathor", "aphrodite", "lucifer"],
  "女媧木隊（新卡）": ["nuwa", "daogui", "huatuo", "qianliyan", "afu", "nuwa"],
  "以賽亞火隊（新卡）": ["isaiah", "dabao4", "zhurong", "aizen", "hathor", "isaiah"],
  "觀音隊＋大寶": ["guanyin", "aizen", "dabao4", "yutong5", "hathor", "guanyin"],
  "女媧木隊＋大寶（新卡）": ["nuwa", "dabao4", "daogui", "huatuo", "qianliyan", "nuwa"],
  "魔法翁暗隊＋大寶（新卡）": ["mofaweng", "dabao4", "redgirl", "sentinel", "yutong5", "mofaweng"]
};
module.exports = { turnDamage, teamHp, TEAMS, sealRun, dmgCut };
if (require.main === module) {
  const only = process.argv[2];
  for (const ch of CHAPTERS) {
    if (only && ch.id !== only) continue;
    const bosses = ch.waves.flatMap(w => w.enemies).map(k => ENEMIES[k]).filter(e => e.boss);
    const boss = bosses.length > 1 ? { ...bosses[0], name: bosses.map(b => b.name).join("＋"), hp: bosses.reduce((a, b) => a + b.hp, 0), atk: bosses.reduce((a, b) => a + b.atk, 0) / bosses.length } : bosses[0];   // 雙王／兩形態：血量相加（逐一打），攻擊取平均
    const mobs = ch.waves.filter(w => !w.enemies.some(k => ENEMIES[k].boss));
    console.log(`\n${ch.no}〈${ch.name}〉 王：${boss.name}（${boss.attr}） 血 ${boss.hp}，每 ${boss.cd} 回合打 ${boss.atk}${ch.seal ? "　※封鎖攻擊" : ""}`);
    for (const [name, t0] of Object.entries(TEAMS)) {
      const t = [...t0]; (ch.trial || []).forEach((id, k) => { t[[0, 5, 1, 2, 3, 4][k]] = id; });   // 試用隊伍：借用的卡覆蓋隊長、戰友位
      const d = turnDamage(t, boss), hp = teamHp(t), cut = dmgCut(t);
      const mobTurns = mobs.map(w => Math.max(...w.enemies.map(k => Math.ceil(ENEMIES[k].hp / Math.max(1, turnDamage(t, ENEMIES[k]))))));
      const seal = ch.seal ? `｜封鎖下全章 ${sealRun(t, ch)} 回合` : "";
      console.log(`  ${name.padEnd(12, "　")} 打王 ${String(Math.ceil(boss.hp / d)).padStart(3)} 回合（每回合 ${Math.round(d)}）｜小怪波 ${mobTurns.join("+")} 回合｜血量 ${Math.round(hp)}，扛王 ${Math.floor(hp / (boss.atk * cut))} 下${seal}`);
    }
    if (ch.seal) {   // 沒帶大寶
      const t = [...TEAMS["路西法雙隊長（最強舊卡）"]];
      console.log(`  （沒帶覺醒大寶的路西法隊：封鎖下全章 ${sealRun(t, ch)} 回合）`);
    }
  }
}
