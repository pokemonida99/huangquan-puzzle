// 檢查劇情台詞是否都有出處（劇集資料 episodes.js 或小說 novel.md），並列出缺的立繪：node tools/check_lines.js [ch5 ch6 ...]
global.window = global; const fs = require("fs");
["data.js", "cards.js", "profiles.js", "story.js", ...fs.readdirSync(__dirname + "/..").filter(f => /^story-ch.*\.js$/.test(f)).sort()].forEach(f => require("../" + f));
const norm = s => s.replace(/[\s，。、！？「」『』…—\-～~：；,.!?"“”‘’（）()·．⋯]/g, "");
const src = norm(["src/qimiao-shiguang/episodes.js", "src/qimiao-shiguang/stills.js", "src/qimiao-shiguang/data.js", "src/huangquan-novel/src/novel.md"].map(f => fs.readFileSync(__dirname + "/../" + f, "utf8")).join(""));
const want = process.argv.slice(2);
let bad = 0;
for (const ch of CHAPTERS) {
  if (want.length && !want.includes(ch.id)) continue;
  const L = [...(ch.pre || []), ...ch.waves.flatMap(w => w.lines || []), ...(ch.post || [])];
  const vn = { ...VN, ...(ch.vn || {}) };
  let n = 0, narr = 0; const miss = [], novn = [];
  for (const l of L) {
    if (l[0] && l[0][0] === "@") continue;
    if (!l[0]) { narr++; } else { n++; if (!src.includes(norm(l[1]))) miss.push(`${l[0]}：${l[1]}（${l[2]}）`); }
    const who = l[0] || l[4]; const k = who && vn[who];
    if (k && !fs.existsSync(`${__dirname}/../art/vn/${k}-${l[3] || "normal"}.webp`)) novn.push(`${who} ${k}-${l[3] || "normal"}`);
  }
  console.log(`${ch.id} ${ch.name}：台詞 ${n} 句、旁白 ${narr} 句${miss.length ? `，找不到出處 ${miss.length} 句` : ""}${novn.length ? `，缺立繪 ${novn.length}` : ""}`);
  miss.forEach(m => console.log("  ✗ " + m)); [...new Set(novn)].forEach(m => console.log("  缺立繪 " + m));
  bad += miss.length + novn.length;
}
process.exit(bad ? 1 : 0);
