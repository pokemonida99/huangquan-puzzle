// 平衡模擬：node tools/sim.js
// 「普通回合」＝4 combo：隊伍主色 2 組、次色 1 組、第三色或心 1 組，每組 3 顆（Fable 建議的假設）
global.window = global;
require("../data.js"); require("../cards.js"); require("../story.js");
require("fs").readdirSync(require("path").join(__dirname, "..")).filter(f => /^story-ch.*\.js$/.test(f)).sort().forEach(f => require("../" + f));   // 各章獨立檔
const BEATS = window.BEATS;
const typeMul = (a, d) => BEATS[a] === d ? 2 : BEATS[d] === a && a !== "light" && a !== "dark" ? .5 : 1;
function turnDamage(team, enemy, combos = 4) {
  const L = [CARDS[team[0]].lead.fx, CARDS[team[5]].lead.fx];
  const cnt = {}; team.forEach(id => { const a = CARDS[id].attr; cnt[a] = (cnt[a] || 0) + 1; });
  const order = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
  // 有「消除 4 種屬性」加成的隊長（五屬隊），普通回合就是消 4 種不同顏色
  const rainbow = L.some(fx => fx.multiAttr);
  const pick = rainbow ? [order[0], order[1], order[2], order[3]] : [order[0], order[0], order[1] || order[0], order[2] || "heart"];
  const groups = pick.map(a => a || "heart").slice(0, combos).map(attr => ({ attr, n: 3 }));
  const kinds = new Set(groups.filter(g => g.attr !== "heart").map(g => g.attr)).size;
  const comboUp = L.reduce((a, fx) => a + (fx.comboUp || 0), 0);
  const comboMul = 1 + (groups.length - 1) * (.25 + comboUp);
  let total = 0;
  team.forEach(id => {
    const c = CARDS[id], asAll = L.some(fx => fx.allAs === c.attr);
    const mine = groups.filter(g => g.attr === c.attr || asAll);
    if (!mine.length) return;
    let m = 1;
    L.forEach(fx => { if (fx.allAtk) m *= fx.allAtk; if (fx.attrAtk && fx.attrAtk[c.attr]) m *= fx.attrAtk[c.attr]; if (fx.multiAttr && kinds >= fx.multiAttr.n) m *= fx.multiAttr.x; });
    const vd = enemy.demon ? L.reduce((a, fx) => a * (fx.vsDemon || 1), 1) : 1;
    total += c.atk * mine.length * comboMul * m * typeMul(c.attr, enemy.attr) * vd;
  });
  return total;
}
function teamHp(team) { let hp = team.reduce((s, id) => s + CARDS[id].hp, 0); [0, 5].forEach(i => { const f = CARDS[team[i]].lead.fx; if (f.allHp) hp *= f.allHp; }); return hp; }
const TEAMS = {
  "初始隊（李國志×2）": DEMO_TEAM,
  ...Object.fromEntries(PRESETS.slice(1).map(p => [p.name, p.team])),
  "月老帶木隊": ["yuelao", "afu", "qianliyan", "heitang", "lvyi", "yuelao"],
  "全 D 卡隊": ["yutong1", "xiaobai", "xiaoyu", "dabao", "afu", "lee1"],
  "路西法雙隊長（最強）": ["lucifer", "guanyin", "cherub", "hathor", "aphrodite", "lucifer"]
};
module.exports = { turnDamage, teamHp, TEAMS };
if (require.main === module) {
  for (const ch of CHAPTERS) {
    const bosses = ch.waves.flatMap(w => w.enemies).map(k => ENEMIES[k]).filter(e => e.boss);
    const boss = bosses.length > 1 ? { ...bosses[0], name: bosses.map(b => b.name).join("＋"), hp: bosses.reduce((a, b) => a + b.hp, 0), atk: bosses.reduce((a, b) => a + b.atk, 0) / bosses.length } : bosses[0];   // 雙王：血量相加（逐一打），攻擊取平均
    const mobs = ch.waves.filter(w => !w.enemies.some(k => ENEMIES[k].boss));
    console.log(`\n${ch.no}〈${ch.name}〉 王：${boss.name}（${boss.attr}） 血 ${boss.hp}，每 ${boss.cd} 回合打 ${boss.atk}`);
    for (const [name, t0] of Object.entries(TEAMS)) {
      const t = [...t0]; (ch.trial || []).forEach((id, k) => { t[[0, 5, 1, 2, 3, 4][k]] = id; });   // 試用隊伍：借用的卡覆蓋隊長、戰友位
      const d = turnDamage(t, boss), hp = teamHp(t);
      const mobTurns = mobs.map(w => Math.max(...w.enemies.map(k => Math.ceil(ENEMIES[k].hp / Math.max(1, turnDamage(t, ENEMIES[k]))))));
      console.log(`  ${name.padEnd(12, "　")} 打王 ${String(Math.ceil(boss.hp / d)).padStart(3)} 回合（每回合 ${Math.round(d)}）｜小怪波 ${mobTurns.join("+")} 回合｜血量 ${Math.round(hp)}，扛王 ${Math.floor(hp / boss.atk)} 下`);
    }
  }
}
