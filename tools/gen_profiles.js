// 從棲渺拾光資料館產生新角色的「故事／資料」：node tools/gen_profiles.js > profiles.js
// 文字直接取自資料館（人物側寫 about，沒有側寫的用分集資料的角色說明），不另外編寫
global.window = global;
require("../src/qimiao-shiguang/data.js"); require("../src/qimiao-shiguang/episodes.js");
require("../data.js"); require("../cards.js");
const S = window.SITE, chars = Object.fromEntries(window.EPI.characters.map(c => [c.name, c]));
const want = new Set(Object.values(window.CARDS).map(c => c.who).concat(["辣雞", "林伯伯", "王柏宏", "小米", "月老", "老闆"]));
const out = {};
const ALIAS = { "哨兵古神": "古神" };   // 遊戲卡名 → 資料館人物名
const prev = (() => { const P = window.PROFILE; window.PROFILE = {}; try { require("../profiles.js"); } catch (e) {} const o = window.PROFILE; window.PROFILE = P; return o; })();
for (const who of want) {
  if (window.PROFILE[who]) continue;
  const src = ALIAS[who] || who;
  const c = chars[src];
  if (!c) { if (prev[who]) out[who] = prev[who]; continue; }   // 資料館改名或拿掉的（例：岳夏澤），沿用上一版
  const p = S.profiles[src];
  const rel = S.relations.filter(r => (r.a === src || r.b === src)).map(r => [r.a === src ? r.b : r.a, r.label]).map(([n, l]) => [n === "老闆" ? "李國志" : n, l]);
  out[who] = {
    story: p ? p.about : c.role + "。",
    aka: (c.aka || []).filter(a => !/[？?（(]/.test(a)),
    debut: c.eps[0], eps: c.eps.length,
    rel: rel.slice(0, 4),
    quotes: (c.lines || []).slice(0, 2)
  };
}
console.log("/* 由 tools/gen_profiles.js 產生，請勿手改。來源：棲渺拾光燈下資料館 */\nObject.assign(window.PROFILE, " + JSON.stringify(out, null, 1) + ");");
