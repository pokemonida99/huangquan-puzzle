/* 黃泉燒肉店 轉珠試玩版 */
(() => {
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ROWS = 5, COLS = 6, MOVE_TIME = 5000;
const ORB_TYPES = ["water", "fire", "wood", "light", "dark", "heart"];
const fmt = n => Math.round(n).toLocaleString("en-US");
const stars = n => "★".repeat(n);
const attrVars = a => `--c:${ATTR[a].color};--cd:${ATTR[a].dark}`;

const { SET, saveSet, canVibe, vibe, sfx, music } = HQ;

/* ---------------- 畫面切換 ---------------- */
function go(id) {
  $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  if (id !== "battle") music.play("title");
  if (id === "team") renderTeam();
  if (id === "chapters") renderChapters();
  if (id === "dex") renderDex();
}
document.addEventListener("click", e => {
  if (e.target.closest("button")) sfx.click();
  const b = e.target.closest("[data-go]");
  if (b) go(b.dataset.go);
});

/* ---------------- 共用：卡片頭像 ---------------- */
function iconHTML(id, extra = "") {
  const c = CARDS[id];
  return `<div class="icon" style="${attrVars(c.attr)}"><img src="${c.art}" alt="${c.who}">
    <span class="attr">${ATTR[c.attr].glyph}</span><span class="stars">${stars(c.star)}</span>${extra}</div>`;
}

/* ---------------- 隊伍 ---------------- */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const team = (t => Array.isArray(t) && t.length === 6 && t.every(id => CARDS[id]) ? t : [...DEMO_TEAM])(store.get("hq-team"));
let CH = CHAPTERS[0];
let cleared = store.get("hq-progress", { cleared: 0 }).cleared || 0;   // 已通關到第幾章

/* ---------------- 章節選單 ---------------- */
function renderChapters() {
  $(".ch-list").innerHTML = CHAPTERS.map((ch, i) => {
    const st = i < cleared ? "done" : i === cleared ? "open" : "lock";
    return `<button class="ch-card ${st}" data-ch="${i}" style="background-image:linear-gradient(90deg,#000d 30%,#0004),url(${ch.bg})">
      <span class="ch-no">${ch.no}</span><b>${ch.name}</b><span class="ch-sub">${ch.sub} ‧ ${ch.place}</span>
      <span class="ch-intro">${ch.intro}</span>
      <span class="ch-st">${st === "done" ? "已通關" : st === "open" ? "挑戰" : "🔒 通關上一章後開放"}</span></button>`;
  }).join("");
  $$(".ch-card").forEach(b => b.onclick = () => {
    const i = +b.dataset.ch;
    if (i > cleared) { b.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 250 }); vibe(40); return; }
    CH = CHAPTERS[i]; go("team");
  });
}
function leaderFx() { return [CARDS[team[0]].lead.fx, CARDS[team[5]].lead.fx]; }
function teamHp() {
  let hp = team.reduce((s, id) => s + CARDS[id].hp, 0);
  leaderFx().forEach(fx => { if (fx.allHp) hp *= fx.allHp; });
  return Math.round(hp);
}
function teamRec() {
  let r = team.reduce((s, id) => s + CARDS[id].rec, 0);
  leaderFx().forEach(fx => { if (fx.allRec) r *= fx.allRec; });
  return r;
}
function renderTeam() {
  $(".stage-place").textContent = CH.place;
  $(".stage-name").textContent = `${CH.no}　${CH.name}`;
  $(".stage-intro").textContent = CH.intro;
  $(".stage-card").style.backgroundImage = `linear-gradient(120deg, rgba(120,30,40,.35), rgba(30,20,40,.6)), url(${CH.bg})`;
  $(".stage-waves").innerHTML = CH.waves.map((w, i) =>
    `<span>第 ${i + 1} 波 ‧ ${w.enemies.map(k => ENEMIES[k].name).join("、")}</span>`).join("");
  $(".presets").innerHTML = `<div class="pre-title">推薦隊伍</div>` + PRESETS.map((p, i) =>
    `<button class="pre ${p.team.join() === team.join() ? "on" : ""}" data-p="${i}"><b>${p.name}</b><small>${p.note}</small></button>`).join("");
  $$(".pre").forEach(b => b.onclick = () => {
    PRESETS[+b.dataset.p].team.forEach((id, k) => team[k] = id);
    store.set("hq-team", team); vibe(20); renderTeam();
  });
  const roles = ["隊長", "隊員", "隊員", "隊員", "隊員", "戰友"];
  $(".team-slots").innerHTML = team.map((id, i) => {
    const c = CARDS[id];
    return `<div class="slot ${i === 0 || i === 5 ? "lead" : ""}" data-i="${i}"><div class="role">${roles[i]}</div>
      ${iconHTML(id)}<div class="nm">${c.title}<br>${c.who}</div><div class="swap">更換</div></div>`;
  }).join("");
  const atk = team.reduce((s, id) => s + CARDS[id].atk, 0);
  $(".team-sum").innerHTML = `<div>生命力 <b>${fmt(teamHp())}</b></div><div>攻擊力 <b>${fmt(atk)}</b></div><div>回復力 <b>${fmt(teamRec())}</b></div>`;
  $(".team-lead").innerHTML = [0, 5].map(i => {
    const c = CARDS[team[i]];
    return `<div class="ls">${i ? "戰友" : "隊長"}技能 <b>${c.lead.name}</b>：${c.lead.desc}</div>`;
  }).join("");
  $$(".slot").forEach(s => s.onclick = () => openPicker(+s.dataset.i));
}
/* 換卡：依系列列出全部卡片 */
function openPicker(slot) {
  const roles = ["隊長", "隊員", "隊員", "隊員", "隊員", "戰友"];
  modal(`<h3>選擇${roles[slot]}</h3><div class="picker">${SERIES.map(s => `<div class="pk-head" style="color:${s.color}">${s.name}</div>
    <div class="pk-grid">${s.members.flatMap(who => cardsOf(who)).map(id =>
      `<button class="pk ${team[slot] === id ? "cur" : ""}" data-id="${id}">${iconHTML(id)}<span>${CARDS[id].who}</span></button>`).join("")}</div>`).join("")}</div>
    <div class="row"><button class="btn" data-close>取消</button><button class="btn" id="pk-info">卡片資料</button></div>`);
  $$(".pk").forEach(b => b.onclick = () => {
    team[slot] = b.dataset.id; store.set("hq-team", team);
    vibe(15); closeModal(); renderTeam();
  });
  $("#pk-info").onclick = () => showCard(team[slot]);
}
$("#go-battle").onclick = () => { go("battle"); startBattle(); };

/* ================================================================
   劇情對話框
   ================================================================ */
// 說話的人用哪張圖：有立繪用立繪（依表情），沒有就用卡面；敵人用敵人圖
function portraitOf(who, expr) {
  if (!who) return null;
  const ids = Object.keys(CARDS).filter(id => CARDS[id].who === who);
  if (ids.length) {
    const c = CARDS[who === "李國志" ? "lee4" : who === "語彤" ? "yutong1" : ids[0]];
    return { src: VN[who] ? `art/vn/${VN[who]}-${expr || "normal"}.webp` : c.art, fallback: c.art, attr: c.attr, kind: VN[who] ? "vn" : "card" };
  }
  const e = Object.values(ENEMIES).find(x => x.name === who);
  return e ? { src: e.img, attr: e.attr, kind: "enemy" } : null;
}
// 已經介紹過的人物（每次開始一章時清空）
const introSeen = new Set();
// 劇情裡的特殊行：["@scene", 圖檔或 null] 換場景劇照；["@intro", 角色] 人物登場卡
function dialog(source) {
  return new Promise(done => {
    if (!source || !source.length) return done();
    // 第一次說話、還沒介紹過的角色，自動在台詞前插一張登場卡
    const lines = [];
    source.forEach(l => {
      if (l[0] === "@intro") { if (introSeen.has(l[1])) return; introSeen.add(l[1]); }
      else if (l[0] && l[0][0] !== "@" && INTRO[l[0]] && !introSeen.has(l[0])) { introSeen.add(l[0]); lines.push(["@intro", l[0]]); }
      lines.push(l);
    });
    if (!lines.length) return done();
    const D = $("#dialog"), txt = $(".dlg-text", D);
    $(".dlg-scene", D).classList.remove("on"); D.classList.remove("has-scene", "intro");
    const slot = { l: null, r: null };   // 舞台左右各站一個人
    let i = 0, timer = 0, full = "", last = "r";
    $$(".vn", D).forEach(v => { v.className = v.className.replace(/ (on|off|vn-pic|card|enemy|in)/g, ""); $("img", v).removeAttribute("src"); });
    const finish = () => { clearInterval(timer); timer = 0; txt.textContent = full; D.classList.add("ready"); };
    const close = () => { clearInterval(timer); D.classList.remove("on"); D.onclick = null; setTimeout(done, 150); };
    const show = () => {
      const [who, text, ep, expr] = lines[i];
      D.classList.remove("intro");
      if (who === "@scene") {   // 換場景劇照，接著直接顯示下一行
        const sc = $(".dlg-scene", D);
        if (text) { $("img", sc).src = text; $(".dlg-scene-bg", D).style.backgroundImage = `url(${text})`; sc.classList.remove("on"); void sc.offsetWidth; sc.classList.add("on"); D.classList.add("has-scene"); }
        else { sc.classList.remove("on"); D.classList.remove("has-scene"); }
        i++; if (i >= lines.length) close(); else show();
        return;
      }
      if (who === "@intro") {   // 人物登場卡
        const p = portraitOf(text), c = INTRO[text] || "";
        const card = Object.values(CARDS).find(x => x.who === text);
        $(".dlg-intro", D).innerHTML = `<small>人物登場</small><div class="di-pic"><img src="${p ? (p.fallback || p.src) : ""}" alt=""></div>
          <b>${text}</b>${card ? `<em>${card.title}</em>` : ""}<p>${c}</p>`;
        if (p) D.style.cssText = attrVars(p.attr);
        D.classList.add("intro", "ready"); clearInterval(timer); timer = 0;
        $(".dlg-intro", D).classList.remove("pop"); void D.offsetWidth; $(".dlg-intro", D).classList.add("pop");
        sfx.pick();
        return;
      }
      const p = portraitOf(who, expr);
      D.classList.toggle("narr", !who); D.classList.remove("ready");
      $(".dlg-name", D).textContent = who || "";
      $(".dlg-ep", D).textContent = ep || "";
      if (p) {
        D.style.cssText = attrVars(p.attr);
        let side = slot.l === who ? "l" : slot.r === who ? "r" : (last === "l" ? "r" : "l");
        const v = $(".vn-" + side, D), img = $("img", v), entering = slot[side] !== who;
        slot[side] = who; last = side;
        img.onerror = () => { if (p.fallback && img.getAttribute("src") !== p.fallback) { img.src = p.fallback; v.classList.remove("vn-pic"); v.classList.add("card"); } };
        if (img.getAttribute("src") !== p.src) img.src = p.src;
        v.style.setProperty("--vs", (VN_SCALE[who] || 1));
        v.classList.toggle("vn-pic", p.kind === "vn"); v.classList.toggle("card", p.kind === "card"); v.classList.toggle("enemy", p.kind === "enemy");
        if (entering) { v.classList.remove("in"); void v.offsetWidth; v.classList.add("in"); }
        $$(".vn", D).forEach(x => { const s = x.classList.contains("vn-l") ? "l" : "r"; x.classList.toggle("on", !!slot[s] && s === side); x.classList.toggle("off", !!slot[s] && s !== side); });
      } else {
        $$(".vn", D).forEach(x => { x.classList.remove("on"); if (x.querySelector("img").getAttribute("src")) x.classList.add("off"); });
      }
      full = who ? `「${text}」` : text;
      let n = 0; txt.textContent = "";
      clearInterval(timer);
      timer = setInterval(() => { n += 1; txt.textContent = full.slice(0, n); if (n >= full.length) finish(); }, 32);
    };
    D.onclick = e => {
      if (e.target.closest(".dlg-skip")) { e.stopPropagation(); close(); return; }
      if (timer) { finish(); return; }
      i++; sfx.swap();
      if (i >= lines.length) close(); else show();
    };
    D.classList.add("on"); show();
  });
}

/* ================================================================
   戰鬥
   ================================================================ */
let B = null;            // 戰鬥狀態
let grid = [];           // grid[r][c] = {attr, el}
let cell = 0;            // 一格的像素寬
const board = $(".board");

function startBattle(skipStory) {
  B = {
    hpMax: teamHp(), hp: teamHp(), rec: teamRec(),
    wave: 0, enemies: [], target: null, buff: 1, busy: false,
    cd: team.map(id => CARDS[id].act.cd)
  };
  B.guard = 0;
  renderParty(); updateHp();
  initBoard();
  $(".field-bg").style.backgroundImage = `url(${CH.bg})`;
  $(".enemies").innerHTML = "";
  $(".wave-tag").textContent = `${CH.no}　${CH.name}`;
  $("#battle").classList.remove("boss-field");
  B.busy = true; board.classList.add("locked");
  const b = B;
  (async () => {
    if (!skipStory) { introSeen.clear(); music.play("title"); await dialog(CH.pre); }
    if (B !== b) return;
    await loadWave(0);
    B.busy = false; board.classList.remove("locked");
  })();
}

function renderParty() {
  $(".party").innerHTML = team.map((id, i) => iconHTML(id, `<span class="cd">${B.cd[i] || "OK"}</span>`)).join("");
  $$(".party .icon").forEach((el, i) => {
    el.dataset.i = i;
    el.classList.toggle("ready", B.cd[i] <= 0);
    el.onclick = () => skillDialog(i);
  });
}
function updateParty() {
  $$(".party .icon").forEach((el, i) => {
    el.classList.toggle("ready", B.cd[i] <= 0);
    $(".cd", el).textContent = B.cd[i] > 0 ? B.cd[i] : "OK";
  });
}
function updateHp() {
  B.hp = Math.max(0, Math.min(B.hpMax, B.hp));
  const p = B.hp / B.hpMax * 100;
  $(".hp-fill").style.width = p + "%";
  $(".hp-fill").classList.toggle("low", p < 30);
  $(".hp-txt").textContent = `${fmt(B.hp)} / ${fmt(B.hpMax)}`;
}

/* ---------------- 敵人 ---------------- */
async function loadWave(w) {
  B.wave = w; B.target = null;
  const wave = CH.waves[w];
  if (wave.lines) { $(".enemies").innerHTML = ""; await dialog(wave.lines); }
  B.enemies = wave.enemies.map(k => ({ ...ENEMIES[k], key: k, hpNow: ENEMIES[k].hp, cdNow: ENEMIES[k].cd }));
  $(".wave-tag").textContent = `${CH.name}　${w + 1} / ${CH.waves.length}`;
  const box = $(".enemies");
  box.innerHTML = B.enemies.map((e, i) => `
    <div class="enemy ${e.boss ? "boss lurk" : ""}" data-i="${i}" style="${attrVars(e.attr)}">
      <span class="ecd">CD <b>${e.cdNow}</b></span>
      <img class="pic" src="${e.img}" alt="${e.name}">
      <div class="ehp"><i></i></div>
      <div class="ename"><span class="a">${ATTR[e.attr].glyph}</span>${e.name}</div>
    </div>`).join("");
  $$(".enemy", box).forEach(el => el.onclick = () => {
    const i = +el.dataset.i;
    B.target = B.target === i ? null : i;
    $$(".enemy").forEach((x, j) => x.classList.toggle("target", j === B.target));
  });
  const boss = B.enemies.find(e => e.boss);
  if (boss) { await bossIntro(boss, $(".enemy.boss")); return; }
  music.play("battle");
  banner(`第 ${w + 1} 波`);
  sfx.wave();
}

/* ---------------- 撒旦登場：暗場、地鳴、三聲重擊、咆哮現身 ---------------- */
function quake(px, ms) {
  const k = [];
  for (let n = 0; n < 10; n++) {
    const f = 1 - n / 10;
    k.push({ transform: `translate(${(Math.random() * 2 - 1) * px * f}px, ${(Math.random() * 2 - 1) * px * f}px) rotate(${(Math.random() * 2 - 1) * px * f * .08}deg)` });
  }
  k.push({ transform: "none" });
  $("#app").animate(k, { duration: ms, easing: "linear" });
}
function flash(color, ms = 400) {
  const d = document.createElement("div");
  d.className = "flash"; d.style.background = color; d.style.animationDuration = ms + "ms";
  $("#app").appendChild(d); setTimeout(() => d.remove(), ms);
}
async function bossIntro(boss, el) {
  const bt = $("#battle");
  music.stop(1.2);
  const veil = document.createElement("div");
  veil.className = "boss-veil";
  veil.innerHTML = `<div class="warn"><span>WARNING</span><span>${boss.warn || "BOSS"}</span><span>WARNING</span></div>
    <div class="boss-title"><small>${boss.title || ""}</small><b class="${boss.name.length > 3 ? "long" : ""}">${boss.name}</b>
    ${boss.quote ? `<q>${boss.quote}</q>` : ""}</div>`;
  bt.appendChild(veil);
  await sleep(300);
  sfx.rumble(2.8);
  bt.classList.add("tremor");
  vibe([40, 160, 40, 160, 40, 160]);
  for (const [k, px] of [[.6, 6], [.8, 10], [1, 14]]) {
    await sleep(800);
    sfx.boom(k); quake(px, 380); flash("rgba(160,0,0,.45)", 380); vibe(70 + px * 4);
  }
  await sleep(500);
  bt.classList.remove("tremor");
  // 現身
  sfx.roar();
  el.classList.remove("lurk"); el.classList.add("reveal");
  veil.classList.add("show-title");
  quake(22, 900); flash("rgba(255,60,20,.75)", 600); vibe([250, 60, 400]);
  bt.classList.add("boss-field");
  await sleep(2600);
  veil.classList.add("out");
  music.play("boss", .2);
  await sleep(600);
  veil.remove(); el.classList.remove("reveal");
}
function enemyEl(i) { return $$(".enemy")[i]; }
function updateEnemy(i) {
  const e = B.enemies[i], el = enemyEl(i);
  $(".ehp i", el).style.width = Math.max(0, e.hpNow / e.hp * 100) + "%";
  $(".ecd b", el).textContent = e.cdNow;
  if (e.hpNow <= 0) el.classList.add("dead");
}
const alive = () => B.enemies.map((e, i) => i).filter(i => B.enemies[i].hpNow > 0);

/* ---------------- 特效 ---------------- */
function banner(text) {
  const d = document.createElement("div");
  d.className = "banner"; d.textContent = text;
  $(".field").appendChild(d); setTimeout(() => d.remove(), 1500);
}
function centerOf(el, rel) {
  const a = el.getBoundingClientRect(), b = rel.getBoundingClientRect();
  return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
}
function floatText(x, y, text, attr, cls = "") {
  const d = document.createElement("div");
  d.className = "dmg " + cls; d.textContent = text;
  d.style.cssText = `left:${x}px;top:${y}px;${attrVars(attr)}`;
  $(".fx-layer").appendChild(d); setTimeout(() => d.remove(), 1000);
}
async function shoot(fromEl, toEl, attr) {
  const layer = $(".fx-layer");
  const field = $(".field");
  const a = centerOf(fromEl, field), b = centerOf(toEl, field);
  const s = document.createElement("div");
  s.className = "shot"; s.style.cssText = `${attrVars(attr)};left:${a.x}px;top:${a.y}px`;
  layer.appendChild(s);
  s.animate([{ left: a.x + "px", top: a.y + "px" }, { left: b.x + "px", top: b.y * .8 + "px" }],
    { duration: 260, easing: "ease-in", fill: "forwards" });
  await sleep(260);   // 不等 animation.finished：分頁在背景時動畫會暫停
  s.remove();
}
function showCombo(n) {
  const c = $(".combo");
  c.innerHTML = `${n}<small>COMBO</small>`;
  c.classList.remove("show"); void c.offsetWidth; c.classList.add("show");
}

/* ---------------- 盤面 ---------------- */
// 落珠：隊長／戰友有「某屬性掉落機率提升」時（例：祝融的火符石），先依機率決定要不要掉那個屬性
function randAttr() {
  for (const fx of leaderFx()) if (fx.skyfall) for (const [a, p] of Object.entries(fx.skyfall)) if (Math.random() < p) return a;
  return ORB_TYPES[Math.floor(Math.random() * 6)];
}
// 符石：圖片＋一道定時掃過的反光（每顆的時間錯開）
function orbInner(attr) { return `<i style="--img:url(art/orb-${attr}.webp);--gd:${(Math.random() * 6).toFixed(2)}s"></i>`; }
function makeOrb(attr) {
  const el = document.createElement("div");
  el.className = "orb " + attr;
  el.style.cssText = attrVars(attr);
  el.innerHTML = orbInner(attr);
  board.appendChild(el);
  return { attr, el };
}
function place(o, r, c, instant) {
  if (instant) o.el.style.transition = "none";
  o.el.style.transform = `translate(${c * 100}%, ${r * 100}%)`;
  if (instant) { void o.el.offsetWidth; o.el.style.transition = ""; }
}
function setAttr(o, attr) {
  o.attr = attr; o.el.className = "orb " + attr;
  o.el.style.cssText = attrVars(attr) + ";transform:" + o.el.style.transform;
  o.el.innerHTML = orbInner(attr);
  o.el.classList.add("morph"); setTimeout(() => o.el.classList.remove("morph"), 450);
}
function initBoard() {
  board.innerHTML = "";
  const attrs = noMatchLayout(() => randAttr());
  grid = attrs.map((row, r) => row.map((a, c) => { const o = makeOrb(a); place(o, r, c, true); return o; }));
}
function noMatchLayout(pick) {
  const g = [];
  for (let r = 0; r < ROWS; r++) {
    g.push([]);
    for (let c = 0; c < COLS; c++) {
      let a, tries = 0;
      do { a = pick(r, c); tries++; } while (tries < 40 && (
        (c >= 2 && g[r][c - 1] === a && g[r][c - 2] === a) ||
        (r >= 2 && g[r - 1][c] === a && g[r - 2][c] === a)));
      g[r].push(a);
    }
  }
  return g;
}

/* ---------------- 拖曳轉珠 ---------------- */
let drag = null;
function cellAt(x, y) {
  const b = board.getBoundingClientRect();
  const c = Math.max(0, Math.min(COLS - 1, Math.floor((x - b.left) / (b.width / COLS))));
  const r = Math.max(0, Math.min(ROWS - 1, Math.floor((y - b.top) / (b.height / ROWS))));
  return { r, c };
}
board.addEventListener("pointerdown", e => {
  if (!B || B.busy || drag) return;
  const { r, c } = cellAt(e.clientX, e.clientY);
  board.setPointerCapture(e.pointerId);
  const o = grid[r][c];
  o.el.classList.add("held");
  drag = { r, c, o, moved: false, t0: 0, id: e.pointerId };
  moveHeld(e);
  sfx.pick(); vibe(8);
});
board.addEventListener("pointermove", e => {
  if (!drag || e.pointerId !== drag.id) return;
  moveHeld(e);
  const { r, c } = cellAt(e.clientX, e.clientY);
  if (r === drag.r && c === drag.c) return;
  // 一次只走一格（含斜角），跨太遠時沿路逐格交換
  while (drag && (drag.r !== r || drag.c !== c)) {
    const nr = drag.r + Math.sign(r - drag.r), nc = drag.c + Math.sign(c - drag.c);
    const other = grid[nr][nc];
    grid[drag.r][drag.c] = other; place(other, drag.r, drag.c);
    grid[nr][nc] = drag.o; drag.r = nr; drag.c = nc;
    sfx.swap(); vibe(6);
    if (!drag.moved) { drag.moved = true; startTimer(); }
  }
});
function moveHeld(e) {
  const b = board.getBoundingClientRect();
  const w = b.width / COLS, h = b.height / ROWS;
  const x = Math.max(-w / 2, Math.min(b.width - w / 2, e.clientX - b.left - w / 2));
  const y = Math.max(-h / 2, Math.min(b.height - h / 2, e.clientY - b.top - h / 2));
  drag.o.el.style.transform = `translate(${x}px, ${y}px)`;
}
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
let timerRAF = 0;
function startTimer() {
  drag.t0 = performance.now();
  $(".timer").classList.add("on");
  const tick = now => {
    if (!drag) return;
    const left = 1 - (now - drag.t0) / MOVE_TIME;
    $(".timer-fill").style.width = Math.max(0, left * 100) + "%";
    if (left <= 0) { endDrag(); return; }
    timerRAF = requestAnimationFrame(tick);
  };
  timerRAF = requestAnimationFrame(tick);
}
function endDrag() {
  if (!drag) return;
  cancelAnimationFrame(timerRAF);
  $(".timer").classList.remove("on");
  $(".timer-fill").style.width = "100%";
  const d = drag; drag = null;
  d.o.el.classList.remove("held");
  place(d.o, d.r, d.c);
  if (d.moved) playerTurn();
}

/* ---------------- 消除與落珠 ---------------- */
function findGroups() {
  const m = grid.map(row => row.map(() => false));
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS - 2; c++) {
    const a = grid[r][c].attr;
    if (grid[r][c + 1].attr === a && grid[r][c + 2].attr === a) m[r][c] = m[r][c + 1] = m[r][c + 2] = true;
  }
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS - 2; r++) {
    const a = grid[r][c].attr;
    if (grid[r + 1][c].attr === a && grid[r + 2][c].attr === a) m[r][c] = m[r + 1][c] = m[r + 2][c] = true;
  }
  // 相連的同色消除格算同一個 combo
  const seen = grid.map(row => row.map(() => false)), groups = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!m[r][c] || seen[r][c]) continue;
    const a = grid[r][c].attr, cells = [], st = [[r, c]]; seen[r][c] = true;
    while (st.length) {
      const [y, x] = st.pop(); cells.push([y, x]);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dy, dx]) => {
        const ny = y + dy, nx = x + dx;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && m[ny][nx] && !seen[ny][nx] && grid[ny][nx].attr === a) {
          seen[ny][nx] = true; st.push([ny, nx]);
        }
      });
    }
    groups.push({ attr: a, n: cells.length, cells });
  }
  // 由下往上消，比較有連鎖感
  return groups.sort((g1, g2) => Math.max(...g2.cells.map(x => x[0])) - Math.max(...g1.cells.map(x => x[0])));
}
/* 消除特效：閃光圈＋向外噴的碎光 */
const fxBoard = document.createElement("div");
fxBoard.className = "board-fx";
board.parentNode.appendChild(fxBoard);
function burst(r, c, attr, combo) {
  const x = (c + .5) / COLS * 100, y = (r + .5) / ROWS * 100;
  const ring = document.createElement("i");
  ring.className = "ring"; ring.style.cssText = `left:${x}%;top:${y}%;${attrVars(attr)}`;
  fxBoard.appendChild(ring); setTimeout(() => ring.remove(), 500);
  const n = 7 + Math.min(combo, 6);
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, d = 26 + Math.random() * 40;
    const p = document.createElement("i");
    p.className = "spark";
    p.style.cssText = `left:${x}%;top:${y}%;${attrVars(attr)};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--s:${(.5 + Math.random() * .8).toFixed(2)}`;
    fxBoard.appendChild(p); setTimeout(() => p.remove(), 600);
  }
}
function shake(el, px) {
  el.animate([{ transform: `translate(${px}px, ${-px / 2}px)` }, { transform: `translate(${-px}px, ${px / 2}px)` },
    { transform: `translate(${px / 2}px, 0)` }, { transform: "none" }], { duration: 180 });
}
async function resolveBoard() {
  const all = [];
  for (;;) {
    const groups = findGroups();
    if (!groups.length) break;
    for (const g of groups) {
      all.push(g);
      g.cells.forEach(([r, c]) => { grid[r][c].el.classList.add("pop"); burst(r, c, g.attr, all.length); });
      showCombo(all.length);
      if (all.length >= 5) shake(board.parentNode, Math.min(2 + all.length * .4, 6));
      sfx.pop(all.length); vibe(Math.min(18 + all.length * 4, 45));
      await sleep(230);
    }
    await sleep(120);
    // 落珠
    for (const g of groups) g.cells.forEach(([r, c]) => { if (grid[r][c]) { grid[r][c].el.remove(); grid[r][c] = null; } });
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = ROWS - 1; r >= 0; r--) if (grid[r][c]) col.push(grid[r][c]);
      let missing = ROWS - col.length;
      for (let k = 0; k < missing; k++) {
        const o = makeOrb(randAttr()); place(o, -1 - k, c, true); col.push(o);
      }
      col.forEach((o, i) => { const r = ROWS - 1 - i; grid[r][c] = o; o.el.classList.add("fall"); place(o, r, c); });
    }
    await sleep(330);
    $$(".orb.fall").forEach(el => { el.classList.remove("fall"); el.classList.add("land"); });
    sfx.drop();
    await sleep(80);
    $$(".orb.land").forEach(el => el.classList.remove("land"));
  }
  return all;
}

/* ---------------- 回合 ---------------- */
async function playerTurn() {
  B.busy = true; board.classList.add("locked");
  const groups = await resolveBoard();
  if (groups.length) await attack(groups);
  $(".combo").classList.remove("show");
  B.buff = 1;
  if (groups.length) { B.cd = B.cd.map(v => Math.max(0, v - 1)); updateParty(); }
  if (await checkWave()) return;
  await enemyTurn();
  B.busy = false; board.classList.remove("locked");
}

function leaderMul(attr, groups) {
  let m = 1;
  const kinds = new Set(groups.filter(g => g.attr !== "heart").map(g => g.attr)).size;
  leaderFx().forEach(fx => {
    if (fx.allAtk) m *= fx.allAtk;
    if (fx.attrAtk && fx.attrAtk[attr]) m *= fx.attrAtk[attr];
    if (fx.multiAttr && kinds >= fx.multiAttr.n) m *= fx.multiAttr.x;
  });
  return m;
}
function typeMul(a, d) { return BEATS[a] === d ? 2 : BEATS[d] === a && a !== "light" && a !== "dark" ? .5 : 1; }

async function attack(groups) {
  const combo = groups.length, comboMul = 1 + (combo - 1) * .25;
  const partyEls = $$(".party .icon");
  // 回復
  const hearts = groups.filter(g => g.attr === "heart");
  if (hearts.length) {
    const base = hearts.reduce((s, g) => s + 1 + (g.n - 3) * .25, 0);
    const heal = B.rec * base * comboMul;
    B.hp += heal; updateHp();
    const hb = $(".hpbar").getBoundingClientRect(), fb = $(".field").getBoundingClientRect();
    floatText(hb.left - fb.left + hb.width / 2, hb.top - fb.top - 34, "+" + fmt(heal), "heart", "heal");
    sfx.heal();
  }
  // 攻擊：每位成員依自己的屬性出手
  for (let i = 0; i < team.length; i++) {
    const c = CARDS[team[i]];
    // 利維坦的隊長技：任何顏色的符石都算作水符石
    const asAll = leaderFx().some(fx => fx.allAs === c.attr);
    const mine = groups.filter(g => g.attr === c.attr || asAll);
    if (!mine.length || !alive().length) continue;
    const base = mine.reduce((s, g) => s + 1 + (g.n - 3) * .25, 0);
    const toAll = mine.some(g => g.n >= 5);
    const raw = c.atk * base * comboMul * leaderMul(c.attr, groups) * B.buff;
    const targets = toAll ? alive() : [B.target != null && B.enemies[B.target].hpNow > 0 ? B.target : alive()[0]];
    partyEls[i].classList.remove("atk"); void partyEls[i].offsetWidth; partyEls[i].classList.add("atk");
    await Promise.all(targets.map(t => hitEnemy(t, raw, c.attr, partyEls[i])));
    await sleep(90);
  }
  await sleep(250);
}
async function hitEnemy(t, raw, attr, fromEl) {
  const e = B.enemies[t], el = enemyEl(t);
  await shoot(fromEl, $(".pic", el), attr);
  const tm = typeMul(attr, e.attr), dmg = Math.round(raw * tm);
  e.hpNow -= dmg;
  const p = centerOf($(".pic", el), $(".field"));
  floatText(p.x + (Math.random() * 40 - 20), p.y - 20 + Math.random() * 30, fmt(dmg), attr, tm > 1 ? "big" : "");
  el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit");
  sfx.hit(tm > 1);
  updateEnemy(t);
}
async function checkWave() {
  if (alive().length) return false;
  await sleep(500);
  if (B.wave + 1 < CH.waves.length) {
    await loadWave(B.wave + 1);
    await sleep(600);
    B.busy = false; board.classList.remove("locked");
    return true;
  }
  await win(); return true;
}
async function enemyTurn() {
  for (const i of alive()) {
    const e = B.enemies[i];
    e.cdNow--;
    if (e.cdNow <= 0) {
      const el = enemyEl(i);
      el.classList.remove("atk"); void el.offsetWidth; el.classList.add("atk");
      await sleep(250);
      const dmg = Math.round(e.atk * (B.guard > 0 ? .5 : 1));
      B.hp -= dmg; updateHp();
      if (e.boss) { quake(16, 500); flash("rgba(200,0,0,.4)", 400); }
      else quake(6, 240);
      const hb = $(".hpbar").getBoundingClientRect(), fb = $(".field").getBoundingClientRect();
      floatText(hb.left - fb.left + hb.width / 2, hb.top - fb.top - 34, "-" + fmt(dmg), e.attr);
      if (e.boss) { sfx.slam(); vibe([120, 40, 200]); } else { sfx.hurt(); vibe([60, 40, 90]); }
      e.cdNow = e.cd;
      await sleep(350);
    }
    updateEnemy(i);
    if (B.hp <= 0) { lose(); return; }
  }
  if (B.guard > 0) { B.guard--; $(".hpbar").classList.toggle("guarded", B.guard > 0); }
}

/* ---------------- 主動技能 ---------------- */
function skillDialog(i) {
  if (B.busy || drag) return;
  const c = CARDS[team[i]], ready = B.cd[i] <= 0;
  modal(`<h3>${c.title} ${c.who}</h3>
    <div class="skill"><span class="k">主動技能</span><span class="cdv">CD ${c.act.cd}</span><br><b>${c.act.name}</b><br>${c.act.desc}</div>
    <p class="hint">${ready ? "" : `還要 ${B.cd[i]} 回合才能發動`}</p>
    <div class="row"><button class="btn" data-close>返回</button>${ready ? `<button class="btn gold" id="cast">發動</button>` : ""}</div>`);
  if (ready) $("#cast").onclick = () => { closeModal(); castSkill(i); };
}
async function castSkill(i) {
  const c = CARDS[team[i]], fx = c.act.fx;
  B.cd[i] = c.act.cd; updateParty();
  banner(c.act.name);
  sfx.skill(); vibe([20, 30, 20, 30, 60]);
  B.busy = true; board.classList.add("locked");
  await sleep(500);
  if (fx.convert) {
    const [from, to] = fx.convert;
    grid.flat().filter(o => o.attr === from).forEach(o => setAttr(o, to));
  }
  if (fx.rainbow) {
    const pool = ORB_TYPES.flatMap(a => Array(5).fill(a));
    for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
    // 盡量排成沒有現成連線的盤面
    let best = pool, n = 0;
    for (let t = 0; t < 300; t++) {
      for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
      grid.flat().forEach((o, idx) => o.attr = pool[idx]);
      if (!findGroups().length) { best = [...pool]; n = 1; break; }
    }
    grid.flat().forEach((o, idx) => setAttr(o, (n ? best : pool)[idx]));
  }
  if (fx.buff) B.buff *= fx.buff;
  if (fx.healPct) { B.hp += B.hpMax * fx.healPct; updateHp(); }
  if (fx.guard) { B.guard = Math.max(B.guard, fx.guard); $(".hpbar").classList.add("guarded"); }
  if (fx.delay) { B.enemies.forEach(e => e.cdNow += fx.delay); alive().forEach(updateEnemy); }
  if (fx.nuke) {
    const el = $$(".party .icon")[i];
    await Promise.all(alive().map(t => hitEnemy(t, c.atk * fx.nuke, c.attr, el)));
    await sleep(400);
    if (await checkWave()) return;
  }
  B.busy = false; board.classList.remove("locked");
}

/* ---------------- 結算 ---------------- */
async function win() {
  music.stop(.4);
  sfx.win(); vibe([40, 60, 40, 60, 120]);
  banner("過關");
  await sleep(1400);
  music.play("title");
  await dialog(CH.post);
  const idx = CHAPTERS.indexOf(CH), first = idx >= cleared;
  cleared = Math.max(cleared, idx + 1); store.set("hq-progress", { cleared });
  const next = CHAPTERS[idx + 1];
  modal(`<div class="result"><h3>${CH.no} 通關</h3><p>「${CH.name}」</p>
    ${first && next ? `<p class="unlock">${next.no}「${next.name}」開放了</p>` : ""}${!next ? `<p class="unlock">主線劇情全部通關，謝謝你玩到最後。</p>` : ""}
    <div class="row"><button class="btn" data-goto="chapters">回章節</button>${next ? `<button class="btn gold" data-goto="next">下一章</button>` : `<button class="btn gold" data-goto="again">再打一次</button>`}</div></div>`);
}
function lose() {
  B.busy = true; music.stop(.8); sfx.lose(); vibe(300);
  modal(`<div class="result"><h3>全隊陣亡</h3><p>如入火聚，得清涼門。再試一次吧。</p>
    <div class="row"><button class="btn" data-goto="team">換隊伍</button><button class="btn gold" data-goto="again">重新挑戰</button></div></div>`);
}
$("#quit").onclick = () => {
  modal(`<h3>離開戰鬥？</h3><p>這一場的進度不會保留。</p>
    <div class="row"><button class="btn" data-close>繼續</button><button class="btn gold" data-goto="team">離開</button></div>`);
};

/* ---------------- 設定 ---------------- */
function settingsDialog() {
  const row = (k, label, note, ok = true) => `<div class="set-row"><div>${label}<small>${note}</small></div>
    <button class="switch ${SET[k] && ok ? "on" : ""}" data-k="${k}" ${ok ? "" : "disabled"} aria-label="${label}"></button></div>`;
  modal(`<h3>設定</h3>
    ${row("music", "配樂", "標題、戰鬥與王關的背景音樂")}
    ${row("sound", "音效", "轉珠、消除、攻擊與技能的聲音")}
    ${row("vibe", "震動", canVibe ? "消除、受傷、發動技能時手機會震動" : "這支手機的瀏覽器不支援震動（iPhone 的瀏覽器都不支援）", canVibe)}
    <div class="row"><button class="btn gold" data-close>完成</button></div>`);
  $$(".switch[data-k]").forEach(b => b.onclick = () => {
    SET[b.dataset.k] = !SET[b.dataset.k]; saveSet();
    b.classList.toggle("on", SET[b.dataset.k]);
    if (b.dataset.k === "vibe" && SET.vibe) vibe([30, 40, 30]);
    if (b.dataset.k === "sound" && SET.sound) sfx.pop(3);
    if (b.dataset.k === "music") music.refresh();
  });
}
document.addEventListener("click", e => { if (e.target.closest("[data-settings]") && !(B && B.busy)) settingsDialog(); });

/* ---------------- 對話框 ---------------- */
function modal(html, kind = "") { $(".modal-box").innerHTML = html; $("#modal").className = "modal on " + kind; }
function closeModal() { $("#modal").className = "modal"; }
$("#modal").addEventListener("click", e => {
  if (e.target.id === "modal" || e.target.closest("[data-close]")) closeModal();
  const g = e.target.closest("[data-goto]");
  if (g) {
    closeModal();
    const to = g.dataset.goto;
    if (to === "again") startBattle(true);
    else if (to === "next") { CH = CHAPTERS[CHAPTERS.indexOf(CH) + 1]; B = null; go("team"); }
    else { B = null; go(to); }
  }
});

/* ================================================================
   圖鑑
   ================================================================ */
const DEX_TABS = [...SERIES, { id: "enemy", name: "敵人", sub: "主線劇情裡的對手", color: "#c8443a" }];
let dexSeries = SERIES[0].id;
function cardsOf(who) { return Object.keys(CARDS).filter(id => CARDS[id].who === who).sort((a, b) => (CARDS[a].stage || 0) - (CARDS[b].stage || 0)); }
function renderDex() {
  $(".dex-tabs").innerHTML = DEX_TABS.map(s => `<button data-s="${s.id}" class="${s.id === dexSeries ? "on" : ""}">${s.name}</button>`).join("");
  $$(".dex-tabs button").forEach(b => b.onclick = () => { dexSeries = b.dataset.s; renderDex(); });
  const s = DEX_TABS.find(x => x.id === dexSeries);
  $(".dex-head").innerHTML = `<b style="--sc:${s.color}">${s.id === "enemy" ? s.name : s.name + "系列"}</b><span>${s.sub}</span>`;
  if (s.id === "enemy") {
    $(".dex-grid").innerHTML = Object.entries(ENEMIES).map(([k, e]) => `<div class="dcard" data-enemy="${k}" style="${attrVars(e.attr)}">
      <img src="${e.img}" alt="${e.name}"><div class="cap"><small>${e.boss ? "BOSS" : "敵人"}</small>${e.name}</div></div>`).join("");
    $$(".dcard[data-enemy]").forEach(el => el.onclick = () => showEnemy(el.dataset.enemy));
    return;
  }
  $(".dex-grid").innerHTML = s.members.map(who => {
    const ids = cardsOf(who);
    return ids.map(id => { const c = CARDS[id]; return `<div class="dcard" data-id="${id}" style="${attrVars(c.attr)}">
      <img src="${c.art}" alt="${c.who}"><span class="dtier tier t${c.tier.replace("+", "p").replace("-", "m")}">${c.tier}</span><div class="cap"><small>${c.title}</small>${c.who}<div class="st">${stars(c.star)}</div></div></div>`; }).join("");
  }).join("");
  $$(".dcard[data-id]").forEach(el => el.onclick = () => showCard(el.dataset.id));
}

/* 卡片詳情：一頁式。上半立繪，下半用「能力／故事／資料」切換，不需要捲動 */
let cardTab = "skill";
function storyHTML(who, extra = "") {
  const p = PROFILE[who];
  if (!p) return `<p class="story">${extra}</p>`;
  return `${extra ? `<p class="story lore">${extra}</p>` : ""}<p class="story">${p.story}</p>`;
}
function infoHTML(who) {
  const p = PROFILE[who];
  if (!p) return "";
  const row = (k, v) => v ? `<div class="kv"><span>${k}</span><div>${v}</div></div>` : "";
  return row("別名", p.aka.join("、")) +
    row("首次登場", p.debut) + row("出場集數", p.eps + " 集") +
    row("關係", p.rel.map(([n, l]) => `<em>${n}</em>${l}`).join("　")) +
    (p.quotes.length ? `<div class="kv"><span>台詞</span><div>${p.quotes.map(([ep, q]) => `<q>${q}</q><small>${ep}</small>`).join("")}</div></div>` : "");
}
function cardShell({ attr, art, star, topRight, title, name, race, tabs, foot }) {
  const tabBtns = tabs.map(t => `<button data-tab="${t.id}" class="${t.id === cardTab ? "on" : ""}">${t.label}</button>`).join("");
  const panes = tabs.map(t => `<div class="pane ${t.id === cardTab ? "on" : ""}" data-pane="${t.id}">${t.html}</div>`).join("");
  modal(`<div class="cardfull" style="${attrVars(attr)}">
    <div class="cf-art"><img src="${art}" alt="${name}">
      <div class="cv-top"><span class="a">${ATTR[attr].glyph}</span><span class="st">${star}</span>${topRight || ""}<button class="cf-x" data-close>✕</button></div>
      <div class="cv-name"><span class="race">${race}</span><small>${title}</small><b>${name}</b></div></div>
    <div class="cf-panel"><div class="cf-tabs">${tabBtns}</div><div class="cf-body">${panes}</div>${foot || ""}</div>
  </div>`, "full");
  $$(".cf-tabs button").forEach(b => b.onclick = () => {
    cardTab = b.dataset.tab;
    $$(".cf-tabs button").forEach(x => x.classList.toggle("on", x === b));
    $$(".pane").forEach(x => x.classList.toggle("on", x.dataset.pane === cardTab));
  });
}
function showCard(id) {
  const c = CARDS[id];
  const chain = cardsOf(c.who);
  let evo = "";
  if (chain.length > 1) {
    evo = `<div class="evo">${chain.map((x, k) => (k ? `<span class="arrow">›</span>` : "") +
      `<div data-evo="${x}" class="${x === id ? "cur" : ""}">${iconHTML(x)}</div>`).join("")}
      ${c.evo ? `<button class="btn gold evo-btn" id="do-evo">進化</button>` : `<span class="plan">已是最終進化</span>`}</div>`;
  } else if (c.planned) {
    evo = `<div class="evo plan">進化路線：${c.planned.join(" › ")}（立繪製作中）</div>`;
  }
  const skill = `<div class="stats"><div>生命力<b>${fmt(c.hp)}</b></div><div>攻擊力<b>${fmt(c.atk)}</b></div><div>回復力<b>${fmt(c.rec)}</b></div></div>
    <div class="skill"><span class="k">隊長技能</span> <b>${c.lead.name}</b><br>${c.lead.desc}</div>
    <div class="skill"><span class="k">主動技能</span> <b>${c.act.name}</b><span class="cdv">CD ${c.act.cd}</span><br>${c.act.desc}</div>${evo}`;
  cardShell({
    attr: c.attr, art: c.art, star: stars(c.star), title: c.title, name: c.who, race: c.race,
    topRight: `<span class="tier t${c.tier.replace("+", "p").replace("-", "m")}" title="${c.onChart ? "依戰力表" : "依劇情判斷"}">戰力 ${c.tier}${c.onChart ? "" : "<small>※</small>"}</span>`,
    tabs: [{ id: "skill", label: "能力", html: skill },
           { id: "story", label: "背景故事", html: storyHTML(c.who, c.lore) },
           { id: "info", label: "角色資料", html: infoHTML(c.who) }]
  });
  $$("[data-evo]").forEach(el => el.onclick = () => showCard(el.dataset.evo));
  if (c.evo) $("#do-evo").onclick = async () => {
    const f = document.createElement("div"); f.className = "evo-flash"; $("#app").appendChild(f);
    sfx.evo(); vibe([30, 40, 30, 40, 30, 40, 150]);
    await sleep(480); showCard(c.evo); await sleep(800); f.remove();
  };
}
function showEnemy(k) {
  const e = ENEMIES[k];
  const skill = `<div class="stats"><div>生命力<b>${fmt(e.hp)}</b></div><div>攻擊力<b>${fmt(e.atk)}</b></div><div>攻擊間隔<b>${e.cd} 回合</b></div></div>
    <div class="skill"><span class="k">屬性</span> <b>${ATTR[e.attr].name}</b><br>${ATTR[Object.keys(BEATS).find(a => BEATS[a] === e.attr)].name}屬性對牠造成 2 倍傷害</div>
    ${CHAPTERS.filter(ch => ch.waves.some(w => w.enemies.includes(k))).map(ch => `<div class="skill"><span class="k">出沒</span> <b>${ch.no}「${ch.name}」</b><br>${ch.place}，第 ${ch.waves.findIndex(w => w.enemies.includes(k)) + 1} 波</div>`).join("")}`;
  cardShell({
    attr: e.attr, art: e.img, star: e.boss ? "BOSS" : "", title: e.title || (CHAPTERS.find(ch => ch.waves.some(w => w.enemies.includes(k))) || {}).name || "", name: e.name, race: "魔族",
    tabs: [{ id: "skill", label: "能力", html: skill },
           { id: "story", label: "背景故事", html: storyHTML(e.name) },
           { id: "info", label: "角色資料", html: infoHTML(e.name) }]
  });
}

renderTeam();
music.play("title");
})();
