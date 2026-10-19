// 從棲渺拾光資料館產生新角色的「故事／資料」：node tools/gen_profiles.js > profiles.js
// 文字直接取自資料館（人物側寫 about，沒有側寫的用分集資料的角色說明），不另外編寫
global.window = global;
require("../src/qimiao-shiguang/data.js"); require("../src/qimiao-shiguang/episodes.js");
require("../data.js"); require("../cards.js");
const S = window.SITE, chars = Object.fromEntries(window.EPI.characters.map(c => [c.name, c]));
const want = new Set(Object.values(window.CARDS).map(c => c.who).concat(["辣雞", "林伯伯", "王柏宏", "小米", "月老", "老闆"]));
const out = {};
for (const who of want) {
  if (window.PROFILE[who]) continue;
  const c = chars[who]; if (!c) continue;
  const p = S.profiles[who];
  const rel = S.relations.filter(r => (r.a === who || r.b === who)).map(r => [r.a === who ? r.b : r.a, r.label]).map(([n, l]) => [n === "老闆" ? "李國志" : n, l]);
  out[who] = {
    story: p ? p.about : c.role + "。",
    aka: (c.aka || []).filter(a => !/[？?（(]/.test(a)),
    debut: c.eps[0], eps: c.eps.length,
    rel: rel.slice(0, 4),
    quotes: (c.lines || []).slice(0, 2)
  };
}
console.log("/* 由 tools/gen_profiles.js 產生，請勿手改。來源：棲渺拾光燈下資料館 */\nObject.assign(window.PROFILE, " + JSON.stringify(out, null, 1) + ");");
