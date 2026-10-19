// 依初始隊（李國志雙隊長五屬隊）的普通回合傷害，算出各章敵人血量：node tools/tune.js
const { turnDamage } = require("./sim.js");
const T_BOSS = { ch1: 5, ch2: 7, ch3: 8, ch4: 9, ch5: 11 };   // 王要打幾回合
const T_MOB = 1.4;                                              // 小怪約 1～2 回合
const team = DEMO_TEAM, out = {};
for (const ch of CHAPTERS) for (const w of ch.waves) for (const k of w.enemies) {
  if (out[k]) continue;
  const e = ENEMIES[k], d = turnDamage(team, e) / w.enemies.length * (e.boss ? 1 : 1);   // 一波多隻時傷害分散
  const t = e.boss ? T_BOSS[ch.id] : T_MOB;
  out[k] = Math.round(d * t / 1000) * 1000;
}
console.log(JSON.stringify(out));
