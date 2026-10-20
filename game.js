/* 黃泉燒肉店 轉珠試玩版 */
(() => {
// 長按不跳出瀏覽器選單（複製圖片、選取文字），也不拖曳圖片
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());
document.addEventListener("selectstart", e => e.preventDefault());
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
  if (id !== "team" && id !== "battle") restoreTrial();
  if (id === "team") renderTeam();
  if (id === "chapters") renderChapters();
  if (id === "dex") renderDex();
  if (id === "shop") renderShop();
  renderMerit();
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
/* 試用隊伍：章節設定 trial: [卡片id...]，進組隊畫面時依序借用隊長、戰友、隊員位（沒擁有也能用）；離開組隊/戰鬥後還原，不存進存檔 */
let trialSave = null;
const TRIAL_SLOTS = [0, 5, 1, 2, 3, 4];
const trialSlot = i => !!trialSave && CH.trial.some((id, k) => TRIAL_SLOTS[k] === i);
function restoreTrial() { if (trialSave) { trialSave.forEach((id, i) => team[i] = id); trialSave = null; } }
function syncTrial() {
  restoreTrial();
  if (CH.trial && CH.trial.length) { trialSave = [...team]; CH.trial.forEach((id, k) => { team[TRIAL_SLOTS[k]] = id; }); }
}
const saveTeam = () => store.set("hq-team", trialSave || team);
const prog = (p => ({ ...p, cleared: p.cleared || 0, stars: p.stars || [], chal: p.chal || [] }))(store.get("hq-progress", {}));
let cleared = Math.max(0, Math.min(CHAPTERS.length, Math.floor(+prog.cleared) || 0));   // 已通關到第幾章（夾在合理範圍）
const saveProg = () => store.set("hq-progress", { ...prog, cleared });

/* ---------------- 收集：擁有的卡、功德（地府的貨幣）、三星評價、挑戰關 ---------------- */
// 開局贈送：業鏡五屬隊整隊（李國志、小白、小雨、大寶、阿副）＋嫉妒魔王水隊整隊（利維坦、諾瓦、咪咪、九尾、陽滋公主）
const GIFT_TEAM = PRESETS.find(p => p.name === "嫉妒魔王水隊").team;
const START_OWNED = [...new Set([...DEMO_TEAM, ...Object.keys(CARDS).filter(id => CARDS[id].who === "李國志"), "yutong1", ...GIFT_TEAM])];   // 李國志四階都算擁有
const owned = new Set((() => {
  const saved = store.get("hq-owned", null), set = new Set(Array.isArray(saved) ? saved : START_OWNED);
  CHAPTERS.slice(0, cleared).forEach(ch => (ch.unlock || []).forEach(id => set.add(id)));   // 舊存檔：已通關的章節補發角色
  if (!Array.isArray(saved)) team.forEach(id => set.add(id));                                // 舊存檔：原本編好的隊伍不拿走
  START_OWNED.forEach(id => set.add(id));                                                    // 開局贈送的業鏡五屬隊、水隊、李國志四階，舊存檔也補發
  return [...set].filter(id => CARDS[id]);
})());
const saveOwned = () => store.set("hq-owned", [...owned]);
saveOwned();
team.forEach((id, i) => { if (!owned.has(id)) team[i] = DEMO_TEAM[i]; });
let merit = store.get("hq-merit", 0);
function addMerit(n) { merit += n; store.set("hq-merit", merit); renderMerit(); }
// 開局贈送 888 功德（每個存檔只送一次，舊存檔也補送）
if (!store.get("hq-gift888", false)) { merit += 888; store.set("hq-merit", merit); store.set("hq-gift888", true); }
function renderMerit() { $$(".merit-chip").forEach(el => el.innerHTML = `功德 <b>${fmt(merit)}</b>`); }
const PRICE = { 2: 20, 3: 40, 4: 80, 5: 150, 6: 240, 7: 360 };      // 托夢照相館：依星數
const EVO_COST = { 3: 50, 4: 100, 5: 180, 6: 260, 7: 380 };   // 進化：依進化後的星數
const REWARD = { first: 150, again: 40, star: 30, chalFirst: 100, chalAgain: 40 };
const buyable = id => !owned.has(id) && !(CARDS[id].stage > 1);   // 進化階段只能靠進化取得
const GODS = new Set(SERIES.find(s => s.id === "gods").members);
const CHAL_TURNS = [10, 10, 12, 12, 14];
let chal = null;   // 目前選的挑戰關：{ idx } 或 null
// 挑戰關限制三選一，依章節輪替
function chalDef(idx) {
  const kind = ["star3", "turns", "nogod"][idx % 3];
  if (kind === "star3") return { kind, label: "只能用 3 星卡（敵人生命 25%、攻擊 60%）", bad: id => CARDS[id].star > 3, weak: { hp: .25, atk: .6 } };
  if (kind === "nogod") return { kind, label: "不能帶神明與天族的角色", bad: id => GODS.has(CARDS[id].who) };
  const turns = CHAL_TURNS[idx] || 14;
  return { kind, label: `${turns} 回合內過關`, turns };
}
function chalCheck() {   // 出擊前檢查：回傳不符合的說明，空字串表示通過
  if (!chal) return "";
  const d = chalDef(chal.idx);
  if (!d.bad) return "";
  const bad = [...new Set(team.filter(d.bad).map(id => CARDS[id].who))];
  return bad.length ? `隊伍裡有不符合條件的卡：${bad.join("、")}` : "";
}
function setChalTag() {
  const el = $(".chal-tag"); if (!el) return;
  const d = chal && chalDef(chal.idx);
  el.hidden = !d;
  if (d) el.textContent = `挑戰 ‧ ${d.label}${d.turns ? `（${(B && B.turns) || 0} / ${d.turns}）` : ""}`;
}
function trackTurn(groups) {   // 每次轉珠後記錄回合數與最高 combo（三星評價用）
  if (!groups.length) return;
  B.turns = (B.turns || 0) + 1; B.maxCombo = Math.max(B.maxCombo || 0, groups.length);
  setChalTag();
}
function chalExpired() {   // 挑戰關限回合：用完還沒過關就失敗
  const d = chal && chalDef(chal.idx);
  if (!d || !d.turns || B.turns <= d.turns) return false;
  B.busy = true; music.stop(.8); sfx.lose(); vibe(300);
  modal(`<div class="result"><h3>挑戰失敗</h3><p>超過 ${d.turns} 回合了。</p>
    <div class="row"><button class="btn" data-goto="team">換隊伍</button><button class="btn gold" data-goto="again">重新挑戰</button></div></div>`);
  return true;
}

/* ---------------- 章節選單 ---------------- */
function renderChapters() {
  $(".ch-list").innerHTML = CHAPTERS.map((ch, i) => {
    const st = i < cleared ? "done" : i === cleared ? "open" : "lock", n = prog.stars[i] || 0;
    const d = chalDef(i);
    return `<div class="ch-item"><button class="ch-card ${st}" data-ch="${i}" style="background-image:linear-gradient(90deg,#000d 30%,#0004),url(${ch.bg})">
      <span class="ch-no">${ch.no}</span><b>${ch.name}</b><span class="ch-sub">${ch.sub} ‧ ${ch.place}</span>
      <span class="ch-intro">${ch.intro}</span>
      <span class="ch-st">${st === "done" ? `已通關 <i class="rate">${"★".repeat(n)}${"☆".repeat(3 - n)}</i>` : st === "open" ? "挑戰" : "🔒 通關上一章後開放"}</span></button>
      ${st === "done" ? `<button class="ch-chal ${prog.chal[i] ? "got" : ""}" data-chal="${i}"><b>⚔ 挑戰關</b>${d.label}<em>${prog.chal[i] ? "已完成" : `獎勵 ${REWARD.chalFirst} 功德`}</em></button>` : ""}</div>`;
  }).join("");
  $$(".ch-card").forEach(b => b.onclick = () => {
    const i = +b.dataset.ch;
    if (i > cleared) { b.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 250 }); vibe(40); return; }
    CH = CHAPTERS[i]; chal = null; go("team");
  });
  $$(".ch-chal").forEach(b => b.onclick = () => { CH = CHAPTERS[+b.dataset.chal]; chal = { idx: +b.dataset.chal }; go("team"); });
}
function leaderFx() { return [CARDS[team[0]].lead.fx, CARDS[team[5]].lead.fx]; }
const allAnimal = () => team.every(id => CARDS[id].animal);   // 隱藏：全隊動物，每位隊長攻擊 7 倍（雙隊長 49 倍）
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
  syncTrial();
  $(".stage-place").textContent = CH.place;
  $(".stage-name").textContent = `${CH.no}　${CH.name}${chal ? "　挑戰關" : ""}`;
  const cb = $(".chal-box"), cd = chal && chalDef(chal.idx), cmsg = chalCheck();
  cb.hidden = !chal;
  if (chal) cb.innerHTML = `<b>⚔ 挑戰條件：${cd.label}</b><span class="${cmsg ? "bad" : "ok"}">${cd.turns ? "過關回合數會計算" : cmsg ? "✘ " + cmsg : "✔ 隊伍符合條件"}</span>
    <small>${prog.chal[chal.idx] ? `已完成，再次過關 ${REWARD.chalAgain} 功德` : `首次過關 ${REWARD.chalFirst} 功德`}；劇情自動略過</small>`;
  $(".stage-intro").textContent = CH.intro;
  $(".stage-card").style.backgroundImage = `linear-gradient(120deg, rgba(120,30,40,.35), rgba(30,20,40,.6)), url(${CH.bg})`;
  $(".stage-waves").innerHTML = CH.waves.map((w, i) =>
    `<span>第 ${i + 1} 波 ‧ ${w.enemies.map(k => ENEMIES[k].name).join("、")}</span>`).join("");
  const lacking = p => [...new Set(p.team.filter(id => !owned.has(id)).map(id => CARDS[id].who))];
  // 這一章的王是什麼屬性；推薦隊伍的隊長屬性剋它就標出來
  const bossE = CH.waves.flatMap(w => w.enemies).map(k => ENEMIES[k]).find(e => e.boss);
  if (bossE) $(".stage-waves").insertAdjacentHTML("beforeend", `<span class="boss-attr" style="${attrVars(bossE.attr)}">王：${bossE.name}（${ATTR[bossE.attr].name}屬性）</span>`);
  const beatsBoss = p => bossE && BEATS[CARDS[p.team[0]].attr] === bossE.attr;
  $(".presets").innerHTML = `<div class="pre-title">推薦隊伍</div>` + PRESETS.map((p, i) => {
    const miss = lacking(p);
    return `<button class="pre ${p.team.join() === team.join() ? "on" : ""} ${miss.length ? "lack" : ""}" data-p="${i}"><b>${p.name}</b><small>${p.note}</small>
      ${beatsBoss(p) ? `<i class="pre-beat">剋制本章的王</i>` : ""}${miss.length ? `<em>尚未獲得：${miss.join("、")}</em>` : ""}</button>`;
  }).join("");
  $$(".pre").forEach(b => b.onclick = () => {
    if (lacking(PRESETS[+b.dataset.p]).length) { b.animate([{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "none" }], { duration: 250 }); vibe(30); return; }
    PRESETS[+b.dataset.p].team.forEach((id, k) => { if (trialSlot(k)) return; team[k] = id; if (trialSave) trialSave[k] = id; });
    saveTeam(); vibe(20); renderTeam();
  });
  const roles = ["隊長", "隊員", "隊員", "隊員", "隊員", "戰友"];
  $(".team-slots").innerHTML = team.map((id, i) => {
    const c = CARDS[id];
    return `<div class="slot ${i === 0 || i === 5 ? "lead" : ""} ${trialSlot(i) ? "trial" : ""}" data-i="${i}"><div class="role">${roles[i]}</div>
      ${iconHTML(id)}<div class="nm">${c.title}<br>${c.who}</div><div class="swap">${trialSlot(i) ? "試用" : "更換"}</div></div>`;
  }).join("");
  const atk = team.reduce((s, id) => s + CARDS[id].atk, 0);
  $(".team-sum").innerHTML = `<div>生命力 <b>${fmt(teamHp())}</b></div><div>攻擊力 <b>${fmt(atk)}</b></div><div>回復力 <b>${fmt(teamRec())}</b></div>`;
  $(".team-lead").innerHTML = [0, 5].map(i => {
    const c = CARDS[team[i]];
    return `<div class="ls">${i ? "戰友" : "隊長"}技能 <b>${c.lead.name}</b>：${c.lead.desc}</div>`;
  }).join("");
  $$(".slot").forEach(s => s.onclick = () => {
    if (trialSlot(+s.dataset.i)) { s.animate([{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "none" }], { duration: 250 }); vibe(30); return; }
    openPicker(+s.dataset.i);
  });
}
/* 換卡：依系列列出擁有的卡片 */
function openPicker(slot) {
  const roles = ["隊長", "隊員", "隊員", "隊員", "隊員", "戰友"], d = chal && chalDef(chal.idx);
  const groups = SERIES.map(s => ({ s, ids: s.members.flatMap(who => cardsOf(who)).filter(id => owned.has(id)) })).filter(g => g.ids.length);
  modal(`<h3>選擇${roles[slot]}</h3><div class="picker">${groups.map(({ s, ids }) => `<div class="pk-head" style="color:${s.color}">${s.name}</div>
    <div class="pk-grid">${ids.map(id =>
      `<button class="pk ${team[slot] === id ? "cur" : ""} ${d && d.bad && d.bad(id) ? "off" : ""}" data-id="${id}">${iconHTML(id)}<span>${CARDS[id].who}</span></button>`).join("")}</div>`).join("")}</div>
    <p class="hint">${d && d.bad ? `挑戰條件「${d.label}」：變暗的卡不能帶。` : "沒看到想要的角色？通關章節可以解鎖，也能到托夢照相館用功德兌換。"}</p>
    <div class="row"><button class="btn" data-close>取消</button><button class="btn" id="pk-info">卡片資料</button></div>`);
  $$(".pk").forEach(b => b.onclick = () => {
    team[slot] = b.dataset.id; if (trialSave) trialSave[slot] = b.dataset.id; saveTeam();
    vibe(15); closeModal(); renderTeam();
  });
  $("#pk-info").onclick = () => showCard(team[slot]);
}
$("#go-battle").onclick = () => {
  const bad = chalCheck();
  if (bad) {
    modal(`<h3>不符合挑戰條件</h3><p>「${chalDef(chal.idx).label}」</p><p class="unlock">${bad}</p><div class="row"><button class="btn gold" data-close>回去換隊伍</button></div>`);
    vibe(40); return;
  }
  go("battle"); setChalTag(); startBattle(!!chal);
};

/* ================================================================
   劇情對話框
   ================================================================ */
// 說話的人用哪張圖：有立繪用立繪（依表情），沒有就用卡面；敵人用敵人圖
function portraitOf(who, expr) {
  if (!who) return null;
  const ids = Object.keys(CARDS).filter(id => CARDS[id].who === who);
  const foe = Object.values(ENEMIES).find(x => x.name === who);
  if (foe && !VN[who]) return { src: foe.img, attr: foe.attr, kind: "enemy" };   // 撒旦、辣雞等：劇情裡用敵人圖（邊緣融入畫面）
  if (ids.length) {
    const c = CARDS[who === "李國志" ? "lee4" : who === "語彤" ? "yutong1" : ids[0]];
    const key = (CH.vn && CH.vn[who]) || VN[who];   // 有些章節換造型（例：語彤第四季穿漢服）
    return { src: key ? `art/vn/${key}-${expr || "normal"}.webp` : c.art, fallback: c.art, attr: c.attr, kind: key ? "vn" : "card", key };
  }
  const e = Object.values(ENEMIES).find(x => x.name === who);
  return e ? { src: e.img, attr: e.attr, kind: "enemy" } : null;
}
// 已經介紹過的人物（每次開始一章時清空）
const introSeen = new Set(store.get("hq-intro", []));
const saveIntro = () => store.set("hq-intro", [...introSeen]);
// 劇情裡的特殊行：["@scene", 圖檔或 null] 換場景劇照；["@clear"] 換地點（舞台清空）；["@intro", 角色] 人物登場卡；旁白行第 5 欄可指定站上舞台的角色
function dialog(source) {
  return new Promise(done => {
    if (!source || !source.length) return done();
    // 第一次說話、還沒介紹過的角色，自動在台詞前插一張登場卡
    const lines = [];
    source.forEach(l => {
      if (l[0] === "@intro") { if (introSeen.has(l[1])) return; introSeen.add(l[1]); saveIntro(); }
      else if (l[0] && l[0][0] !== "@" && INTRO[l[0]] && !introSeen.has(l[0])) { introSeen.add(l[0]); saveIntro(); lines.push(["@intro", l[0]]); }
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
      if (who === "@scene" || who === "@clear") {   // 換場景劇照（或只換地點）：舞台上的人全部退場，免得不同地方的人看起來像在對話
        slot.l = slot.r = null; last = "r";
        $$(".vn", D).forEach(x => { x.classList.remove("on", "off", "in"); x.querySelector("img").removeAttribute("src"); });
        if (who === "@scene") {
          const sc = $(".dlg-scene", D);
          if (text) { $("img", sc).src = text; $(".dlg-scene-bg", D).style.backgroundImage = `url(${text})`; sc.classList.remove("on"); void sc.offsetWidth; sc.classList.add("on"); D.classList.add("has-scene"); }
          else { sc.classList.remove("on"); D.classList.remove("has-scene"); }
        }
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
      const actor = who || lines[i][4];   // 旁白行可帶第 5 欄：讓沒有台詞的角色（例：貓）站上舞台
      const p = portraitOf(actor, expr);
      D.classList.toggle("narr", !who); D.classList.remove("ready");
      $(".dlg-name", D).textContent = who || "";
      $(".dlg-ep", D).textContent = ep || "";
      if (p) {
        D.style.cssText = attrVars(p.attr);
        let side = slot.l === actor ? "l" : slot.r === actor ? "r" : (last === "l" ? "r" : "l");
        const v = $(".vn-" + side, D), img = $("img", v), entering = slot[side] !== actor;
        slot[side] = actor; last = side;
        img.onerror = () => { if (p.fallback && img.getAttribute("src") !== p.fallback) { img.src = p.fallback; v.classList.remove("vn-pic"); v.classList.add("card"); } };
        if (img.getAttribute("src") !== p.src) img.src = p.src;
        // 立繪的頭都對齊在同一個基準高度（935px）；有帽子、頭飾的圖比較高，依實際高度放大，臉才一樣大
        const fit = () => v.style.setProperty("--vs", (p.kind === "vn" && img.naturalHeight ? img.naturalHeight / 935 : 1) * (VN_SCALE[p.key] || VN_SCALE[actor] || 1));
        if (img.complete) fit(); img.onload = fit;
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
  B.guard = 0; B.turns = 0; B.maxCombo = 0; setChalTag();
  B.survive = leaderFx().reduce((a, fx) => a + (fx.survive || 0), 0);
  renderParty(); updateHp();
  initBoard();
  $(".field-bg").style.backgroundImage = `url(${CH.bg})`;
  $(".enemies").innerHTML = "";
  $(".wave-tag").textContent = `${CH.no}　${CH.name}`;
  $("#battle").classList.remove("boss-field");
  B.busy = true; board.classList.add("locked");
  const b = B;
  preloadChapter();
  (async () => {
    try {
      if (!skipStory) { music.play("title"); await dialog(CH.pre); }
      if (B !== b) return;
      await loadWave(0);
      if (B === b && !B.over && tutWanted()) await tutorialRun(b);
      if (B !== b || B.over) return;
      B.busy = false; board.classList.remove("locked");
    } catch (err) { if (B === b) throw err; }   // 玩家按 ✕ 離開後，殘留的流程不報錯
  })();
}
/* 進戰鬥前先把這一章會用到的圖拉進快取（不等載完） */
const preloaded = [];
function preloadChapter() {
  const srcs = new Set([CH.bg]);
  CH.waves.forEach(w => (w.enemies || []).forEach(k => ENEMIES[k] && srcs.add(ENEMIES[k].img)));
  [CH.pre, CH.post, ...CH.waves.map(w => w.lines)].forEach(ls => (ls || []).forEach(l => {
    if (l[0] === "@scene") { if (l[1]) srcs.add(l[1]); return; }
    const who = l[0] === "@intro" ? l[1] : (l[0] || l[4]);
    if (!who || who[0] === "@") return;
    const p = portraitOf(who, l[0] === "@intro" ? null : l[3]);
    if (p) srcs.add(p.src);
  }));
  srcs.forEach(src => { if (!src) return; const im = new Image(); im.src = src; preloaded.push(im); });
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
  if (!B) return;
  const b = B;
  B.wave = w; B.target = null;
  const wave = CH.waves[w];
  if (wave.lines) { $(".enemies").innerHTML = ""; await dialog(wave.lines); }
  if (B !== b) return;
  const weak = (chal && chalDef(chal.idx).weak) || { hp: 1, atk: 1 };   // 「只能用 3 星卡」挑戰關的敵人比較弱
  B.enemies = wave.enemies.map(k => ({ ...ENEMIES[k], key: k, hp: Math.round(ENEMIES[k].hp * weak.hp), hpNow: Math.round(ENEMIES[k].hp * weak.hp), atk: Math.round(ENEMIES[k].atk * weak.atk), cdNow: ENEMIES[k].cd, skills: ENEMIES[k].skills || [] }));
  B.enemies.forEach(e => { const sp = e.skills.find(s => s.on === "spawn"); if (sp) e.shield = { ...sp, ...(sp.shield || {}) }; });
  $(".wave-tag").textContent = `${CH.name}　${w + 1} / ${CH.waves.length}`;
  const box = $(".enemies");
  box.innerHTML = B.enemies.map((e, i) => `
    <div class="enemy ${e.boss ? "boss lurk" : ""}" data-i="${i}" style="${attrVars(e.attr)}">
      <span class="ecd">CD <b>${e.cdNow}</b></span>
      ${e.shield ? `<span class="eshield"><i>🛡</i><b></b></span>` : ""}
      <img class="pic" src="${e.img}" alt="${e.name}">
      <div class="ehp"><i></i></div>
      <div class="ename"><span class="a">${ATTR[e.attr].glyph}</span>${e.name}</div>
    </div>`).join("");
  $$(".enemy", box).forEach(el => el.onclick = () => {
    const i = +el.dataset.i;
    B.target = B.target === i ? null : i;
    showSkillTip(B.target === null ? null : B.enemies[i]);
    $$(".enemy").forEach((x, j) => x.classList.toggle("target", j === B.target));
  });
  if (w === 0 && tutWanted()) tutPrepEnemies();
  const boss = B.enemies.find(e => e.boss);
  if (boss) await bossIntro(boss, $(".enemy.boss"));
  $$(".enemy.boss.lurk").forEach(x => x.classList.remove("lurk"));   // 雙王：第二隻跟著現身
  if (!B) return;
  else { music.play((CH.music && CH.music.battle) || "battle1"); banner(`第 ${w + 1} 波`); sfx.wave(); }
  B.enemies.forEach((e, i) => { if (e.shield) { updateEnemy(i); } });
  const sh = B.enemies.find(e => e.shield);
  if (sh) { await sleep(300); banner(sh.shield.name); }
  if (w === 0 && allAnimal()) { await sleep(300); banner("動物大團結！"); vibe([30, 40, 30]); await sleep(600); }
  await openStrike();
}
/* 進場攻擊（觀音的隊長技）：每一波敵人一出現，隊長／戰友先打全體一下 */
async function openStrike() {
  if (!B) return;
  for (const i of [0, 5]) {
    const c = CARDS[team[i]], n = c.lead.fx.openStrike;
    if (!n || !alive().length) continue;
    await sleep(500);
    if (!B) return;
    banner(c.lead.name);
    sfx.skill(); vibe([30, 40, 60]); flash("rgba(255,240,200,.5)", 350);
    const el = $$(".party .icon")[i];
    el.classList.remove("atk"); void el.offsetWidth; el.classList.add("atk");
    await Promise.all(alive().map(t => hitEnemy(t, c.atk * n, c.attr, el)));
  }
  // 進場就把這一波全打倒了：直接換下一波或過關
  if (!alive().length) {
    await sleep(600);
    if (!B) return;
    if (B.wave + 1 < CH.waves.length) await loadWave(B.wave + 1);
    else await win();
  }
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
  if (!B) return;
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
  music.play((CH.music && CH.music.boss) || "boss1", .2);
  await sleep(600);
  veil.remove(); el.classList.remove("reveal");
}
function enemyEl(i) { return $$(".enemy")[i]; }
function updateEnemy(i) {
  const e = B.enemies[i], el = enemyEl(i);
  $(".ehp i", el).style.width = Math.max(0, e.hpNow / e.hp * 100) + "%";
  $(".ecd b", el).textContent = e.cdNow;
  if (e.hpNow <= 0) el.classList.add("dead");
  const sd = $(".eshield", el);
  if (sd) {
    sd.style.display = e.shield ? "" : "none";
    if (e.shield) $("b", sd).textContent = e.shield.only ? ATTR[e.shield.only].name + "限定" : "吸收";
    if (e.shield) $("i", sd).textContent = "🛡" + e.shield.turns;
  }
  el.classList.toggle("shielded", !!e.shield);
  el.classList.toggle("rage", !!e.rage);
}
/* ---------------- 敵人技能：參數都寫在敵人資料的 skills 裡 ---------------- */
function skillText(s) {
  if (s.on === "spawn") {
    const head = s.name ? `「${s.name}」` : "";
    if (s.shield && s.shield.only) return `${head}出場時只受${ATTR[s.shield.only].name}屬性傷害，持續 ${s.turns} 回合（可用破盾技能破除）`;
    return `${head}出場時單次傷害低於 ${fmt(s.absorb)} 會被完全吸收，持續 ${s.turns} 回合（可用破盾技能破除）`;
  }
  if (s.on === "attack") return `「${s.name}」攻擊後把 ${s.n} 顆${ATTR[s.convert[0]].name}符石變成${ATTR[s.convert[1]].name}符石`;
  if (s.on === "low") return `「${s.name}」生命力低於 ${Math.round(s.hp * 100)}% 時狂暴：攻擊間隔變 ${s.cd} 回合、攻擊力 ${s.atk} 倍`;
  return "";
}
function showSkillTip(e) {
  $$(".skilltip").forEach(x => x.remove());
  if (!e || !e.skills || !e.skills.length) return;
  const d = document.createElement("div");
  d.className = "skilltip";
  d.innerHTML = `<b>${e.name}</b>` + e.skills.map(s => `<p>${skillText(s)}</p>`).join("");
  $(".field").appendChild(d);
  setTimeout(() => d.remove(), 5000);
}
function enemyShieldTurn(e) {
  if (!e.shield) return;
  if (--e.shield.turns <= 0) { e.shield = null; banner("護盾消失"); }
}
async function enemyRage(e, i) {
  const s = e.skills.find(x => x.on === "low");
  if (!s || e.rage || e.hpNow <= 0 || e.hpNow / e.hp > s.hp) return;
  e.rage = true; e.cd = Math.min(e.cd, s.cd); e.cdNow = Math.min(e.cdNow, s.cd); e.atk = Math.round(e.atk * s.atk);
  updateEnemy(i); banner(s.name); flash("rgba(220,0,0,.45)", 500); sfx.rumble && sfx.rumble(1); vibe([80, 40, 80]);
  await sleep(500);
}
async function enemyConvert(e) {
  for (const s of e.skills.filter(x => x.on === "attack")) {
    const pool = grid.flat().filter(o => o.attr === s.convert[0]);
    if (!pool.length) continue;
    banner(s.name);
    pool.sort(() => Math.random() - .5).slice(0, s.n).forEach(o => setAttr(o, s.convert[1]));
    await sleep(500);
  }
}
const alive = () => B.enemies.map((e, i) => i).filter(i => B.enemies[i].hpNow > 0);

/* ---------------- 特效 ---------------- */
function banner(text) {
  const d = document.createElement("div");
  d.className = "banner"; d.textContent = text;
  $(".field").appendChild(d); setTimeout(() => d.remove(), 1500);
}
/* 五星以上發招特寫：去背的發招姿勢圖（art/skill/<id>.webp，還沒畫的先用卡面）＋招式名稱 */
async function cutIn(id) {
  const c = CARDS[id], A = ATTR[c.attr], d = document.createElement("div");
  const pose = (window.SKILL_POSE || []).includes(id);
  d.className = "cutin" + (pose ? " pose" : "");
  d.style.setProperty("--ac", A.color); d.style.setProperty("--ad", A.dark);
  d.innerHTML = `<div class="ci-band"></div><img src="${pose ? `art/skill/${id}.webp` : c.art}" alt="">
    <div class="ci-text"><small>${c.title.replace(/（.*?）/, "")} ${c.who}</small><b>${c.act.name}</b></div>`;
  $(".field").appendChild(d);
  sfx.skill(); vibe([20, 30, 20, 30, 60]);
  if (window.playVoice) playVoice(id);
  await sleep(1300);
  d.classList.add("out"); setTimeout(() => d.remove(), 300);
  await sleep(150);
}
function centerOf(el, rel) {
  const a = el.getBoundingClientRect(), b = rel.getBoundingClientRect();
  return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
}
function floatText(x, y, text, attr, cls = "") {
  const d = document.createElement("div");
  d.className = "dmg " + cls; d.textContent = text;
  if (cls.includes("weak")) { const w = document.createElement("small"); w.textContent = "弱點"; d.appendChild(w); }
  d.style.cssText = `left:${x}px;top:${y}px;${attrVars(attr)}`;
  $(".fx-layer").appendChild(d); setTimeout(() => d.remove(), 1000);
}
async function shoot(fromEl, toEl, attr) {
  const layer = $(".fx-layer");
  const field = $(".field");
  const a = centerOf(fromEl, field), b = centerOf(toEl, field);
  const s = document.createElement("div");
  s.className = `shot shot-${attr}`; s.style.cssText = `${attrVars(attr)};left:${a.x}px;top:${a.y}px`;
  layer.appendChild(s);
  s.animate([{ left: a.x + "px", top: a.y + "px" }, { left: b.x + "px", top: b.y * .8 + "px" }],
    { duration: 260, easing: "ease-in", fill: "forwards" });
  await sleep(260);   // 不等 animation.finished：分頁在背景時動畫會暫停
  s.remove();
}
/* 命中特效：敵人閃白＋往後彈（打擊感），依屬性在敵人身上爆出不同特效；傷害越大越誇張 */
function impact(el, attr, lv) {
  const pic = $(".pic", el), field = $(".field"), layer = $(".fx-layer");
  const r = pic.getBoundingClientRect(), fr = field.getBoundingClientRect(), k = Math.min(lv, 4);
  const p = { x: r.left - fr.left + r.width / 2, y: r.top - fr.top + r.height * .62 };   // 敵人圖靠下對齊，打在身體中段
  pic.animate([{ filter: "brightness(3) saturate(0)", transform: `translate(${4 * k}px, ${-2 * k}px) scale(${1 - .03 * k}, ${1 + .02 * k})` },
    { filter: `brightness(1.4) drop-shadow(0 0 12px ${ATTR[attr].color})`, transform: `translate(${-3 * k}px, 0) scale(1.02)`, offset: .35 },
    { filter: "none", transform: "none" }], { duration: 260 + 40 * k, easing: "cubic-bezier(.2,.8,.3,1)" });
  if (k >= 3) shake(field, 2 + k);
  if (k >= 3) vibe(15 + 10 * k);
  const box = document.createElement("div");
  box.className = `imp imp-${attr} lv${k}`;
  box.style.cssText = `${attrVars(attr)};left:${p.x}px;top:${p.y}px`;
  const parts = { water: 8, fire: 9, wood: 7, light: 6, dark: 5, heart: 4 }[attr] + k * 2;
  let h = `<b class="ring"></b><b class="core"></b>`;
  if (attr === "light") h += `<b class="pillar"></b>`;
  if (attr === "dark") h += `<b class="claw"></b><b class="claw c2"></b><b class="claw c3"></b>`;
  if (attr === "wood") h += `<b class="slash"></b>`;
  for (let i = 0; i < parts; i++) {
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * (30 + k * 18);
    const dy = attr === "fire" ? -Math.abs(Math.sin(a) * d) - 20 : attr === "water" ? Math.sin(a) * d * .6 + 30 : Math.sin(a) * d;
    h += `<i style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${dy.toFixed(0)}px;--r:${(Math.random() * 540 - 270).toFixed(0)}deg;--s:${(.6 + Math.random() * .8).toFixed(2)};animation-delay:${(Math.random() * 60).toFixed(0)}ms"></i>`;
  }
  box.innerHTML = h;
  layer.appendChild(box); setTimeout(() => box.remove(), 900);
}
function showCombo(n, sky) {
  const c = $(".combo");
  c.innerHTML = `${n}<small>COMBO</small>${sky ? "<small class=\"sky-tag\">天降</small>" : ""}`;
  c.classList.toggle("sky", !!sky);
  c.classList.remove("show"); void c.offsetWidth; c.classList.add("show");
}

/* ---------------- 盤面 ---------------- */
// 落珠：隊長／戰友有「某屬性掉落機率提升」時（例：祝融的火符石），先依機率決定要不要掉那個屬性
function randAttr() {
  if (tut.fall && tut.fall.length) return tut.fall.shift();   // 教學：落珠照預設順序
  const sky = {};   // 隊長與戰友同一張卡時不疊加，取較高的機率
  for (const fx of leaderFx()) if (fx.skyfall) for (const [a, p] of Object.entries(fx.skyfall)) sky[a] = Math.max(sky[a] || 0, p);
  for (const [a, p] of Object.entries(sky)) if (Math.random() < p) return a;
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
function initBoard(layout) {
  board.innerHTML = "";
  const attrs = layout ? layout.map(row => [...row].map(ch => TUT_ATTR[ch])) : noMatchLayout(() => randAttr());
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
  // 手指要進到新格子中心約 35% 半徑內才算移過去
  const b = board.getBoundingClientRect(), w = b.width / COLS, h = b.height / ROWS;
  const dx = e.clientX - (b.left + (c + .5) * w), dy = e.clientY - (b.top + (r + .5) * h);
  if (Math.hypot(dx, dy) > Math.min(w, h) * .35) return;
  // 一次走一格；跨太遠時先沿較長的那一軸走，兩軸一樣長才走斜角
  while (drag && (drag.r !== r || drag.c !== c)) {
    const dr = r - drag.r, dc = c - drag.c;
    const nr = drag.r + (Math.abs(dr) >= Math.abs(dc) ? Math.sign(dr) : 0), nc = drag.c + (Math.abs(dc) >= Math.abs(dr) ? Math.sign(dc) : 0);
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
  drag.limit = MOVE_TIME + (B.timeUp || 0) * 1000; B.timeUp = 0;   // 主動技「延長轉珠時間」只作用一次
  $(".timer").classList.add("on");
  const tick = now => {
    if (!drag) return;
    const left = 1 - (now - drag.t0) / drag.limit;
    $(".timer-fill").style.width = Math.max(0, left * 100) + "%";
    if (left * MOVE_TIME <= 1500) {   // 最後 1.5 秒：邊框閃紅，每秒滴答一聲
      if (!board.classList.contains("danger")) { board.classList.add("danger"); drag.tick = 0; }
      const k = Math.floor((1500 - left * MOVE_TIME) / 1000) + 1;
      if (k > drag.tick) { drag.tick = k; sfx.tick(); }
    }
    if (left <= 0) { endDrag(); return; }
    timerRAF = requestAnimationFrame(tick);
  };
  timerRAF = requestAnimationFrame(tick);
}
function endDrag() {
  if (!drag) return;
  cancelAnimationFrame(timerRAF);
  $(".timer").classList.remove("on");
  board.classList.remove("danger");
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
  for (let round = 0; ; round++) {
    const groups = findGroups();
    if (!groups.length) break;
    for (const g of groups) {
      g.sky = round > 0;   // 第一輪是玩家自己消的，之後都是落珠後自動成立的天降
      all.push(g);
      g.cells.forEach(([r, c]) => { grid[r][c].el.classList.add("pop"); burst(r, c, g.attr, all.length); });
      showCombo(all.length, g.sky);
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
  const b = B;
  try { await playerTurnInner(); } catch (err) { if (B === b) throw err; }   // 中途離開戰鬥不報錯
}
async function playerTurnInner() {
  const b = B;
  B.busy = true; board.classList.add("locked");
  const groups = await resolveBoard();
  if (B !== b) return;
  trackTurn(groups);
  if (chalExpired()) return;
  if (groups.length) await attack(groups);
  if (B !== b) return;
  const regen = leaderFx().reduce((a, fx) => a + (fx.regen || 0), 0);   // 基路伯、阿芙羅黛蒂：每次轉珠後回復
  if (groups.length && regen && B.hp < B.hpMax) {
    const heal = B.hpMax * regen; B.hp += heal; updateHp(); sfx.heal();
    const hb = $(".hpbar").getBoundingClientRect(), fb = $(".field").getBoundingClientRect();
    floatText(hb.left - fb.left + hb.width / 2, hb.top - fb.top - 34, "+" + fmt(heal), "heart", "heal");
  }
  $(".combo").classList.remove("show");
  if (groups.length) { B.buff = 1; B.selfBuff = {}; }   // 沒消除就保留主動技的加成到下一次
  if (groups.length) { B.cd = B.cd.map(v => Math.max(0, v - 1)); updateParty(); }
  if (await checkWave()) return;
  await enemyTurn();
  if (B !== b || B.over) return;   // 輸了／離開：盤面維持鎖定
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
  if (allAnimal()) m *= 7 * 7;
  return m;
}
function typeMul(a, d) { return BEATS[a] === d ? 2 : BEATS[d] === a && a !== "light" && a !== "dark" ? .5 : 1; }

async function attack(groups) {
  B.allShown = false;
  const comboUp = leaderFx().reduce((a, fx) => a + (fx.comboUp || 0), 0);   // 路西法：combo 加成更高
  const combo = groups.length, comboMul = 1 + (combo - 1) * (.25 + comboUp);
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
    const raw = c.atk * base * comboMul * leaderMul(c.attr, groups) * B.buff * ((B.selfBuff && B.selfBuff[i]) || 1);
    if (toAll && !B.allShown) { B.allShown = true; banner("全體攻擊"); }
    const targets = toAll ? alive() : [B.target != null && B.enemies[B.target].hpNow > 0 ? B.target : alive()[0]];
    partyEls[i].classList.remove("atk"); void partyEls[i].offsetWidth; partyEls[i].classList.add("atk");
    await Promise.all(targets.map(t => hitEnemy(t, raw, c.attr, partyEls[i])));
    await sleep(90);
  }
  await sleep(250);
}
async function hitEnemy(t, raw, attr, fromEl) {
  if (!B) return;
  const e = B.enemies[t], el = enemyEl(t);
  await shoot(fromEl, $(".pic", el), attr);
  if (!B) return;
  const vd = e.demon ? leaderFx().reduce((a, fx) => a * (fx.vsDemon || 1), 1) : 1;   // 哈索爾：打魔族加倍
  const tm = typeMul(attr, e.attr) * vd;
  let dmg = Math.round(raw * tm), block = "";
  if (e.shield) {
    if (e.shield.only && attr !== e.shield.only) block = "無效";
    else if (e.shield.absorb && dmg < e.shield.absorb) block = "吸收";
  }
  if (block) dmg = 0;
  e.hpNow -= dmg;
  const p = centerOf($(".pic", el), $(".field"));
  const lv = dmg / e.hp < .12 ? 1 : dmg / e.hp < .3 ? 2 : 3;   // 傷害量級：小／中／大
  floatText(p.x + (Math.random() * 40 - 20), p.y - 20 + Math.random() * 30, block || fmt(dmg), attr, block ? "lv1" : `lv${lv}${tm > 1 ? " weak" : ""}`);
  if (block) { el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); }
  else impact(el, attr, lv + (tm > 1 ? 1 : 0));
  sfx.hit(tm > 1 && !block, block ? null : attr);
  updateEnemy(t);
  await enemyRage(e, t);
}
async function checkWave() {
  if (!B) return true;
  if (alive().length) return false;
  await sleep(500);
  if (!B) return true;
  if (B.wave + 1 < CH.waves.length) {
    await loadWave(B.wave + 1);
    await sleep(600);
    if (!B || B.over) return true;
    B.busy = false; board.classList.remove("locked");
    return true;
  }
  await win(); return true;
}
async function enemyTurn() {
  B.saved = false;
  for (const i of alive()) {
    const e = B.enemies[i];
    e.cdNow--;
    if (e.cdNow <= 0) {
      const el = enemyEl(i);
      el.classList.remove("atk"); void el.offsetWidth; el.classList.add("atk");
      await sleep(250);
      const dmg = B.saved ? 0 : Math.round(e.atk * (B.guard > 0 ? .5 : 1));   // 剛保命過，這回合後面的攻擊都擋下
      B.hp -= dmg; updateHp();
      if (e.boss) { quake(16, 500); flash("rgba(200,0,0,.4)", 400); }
      else quake(6, 240);
      const hb = $(".hpbar").getBoundingClientRect(), fb = $(".field").getBoundingClientRect();
      floatText(hb.left - fb.left + hb.width / 2, hb.top - fb.top - 34, "-" + fmt(dmg), e.attr);
      if (e.boss) { sfx.slam(); vibe([120, 40, 200]); } else { sfx.hurt(); vibe([60, 40, 90]); }
      e.cdNow = e.cd;
      await sleep(350);
      if (B.hp > 0) await enemyConvert(e);
    }
    enemyShieldTurn(e);
    updateEnemy(i);
    if (B.hp <= 0 && B.survive > 0) {   // 基路伯：致命傷時保留 1 點生命
      B.survive--; B.hp = 1; B.saved = true; updateHp();
      banner(leaderFx().find(fx => fx.survive) ? [0, 5].map(k => CARDS[team[k]]).find(c => c.lead.fx.survive).lead.name : "");
      flash("rgba(255,255,255,.7)", 500); sfx.heal(); await sleep(600);
    }
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
  const b = B;
  try { await castSkillInner(i); } catch (err) { if (B === b) throw err; }
}
async function castSkillInner(i) {
  const c = CARDS[team[i]], fx = c.act.fx;
  B.cd[i] = c.act.cd; updateParty();
  B.busy = true; board.classList.add("locked");
  if (c.star >= 5) await cutIn(team[i]);
  else { banner(c.act.name); sfx.skill(); vibe([20, 30, 20, 30, 60]); await sleep(500); }
  if (fx.breakShield && B.enemies.some(e => e.hpNow > 0 && e.shield)) {
    B.enemies.forEach((e, k) => { if (e.shield) { e.shield = null; updateEnemy(k); } });
    banner("破盾！"); sfx.sword && sfx.sword(); await sleep(400);
  }
  if (fx.convert) {
    const [from, to] = fx.convert;
    grid.flat().filter(o => o.attr === from).forEach(o => setAttr(o, to));
  }
  if (fx.board) {   // 固定版面：照字母排出整個盤面（w 水、f 火、g 木、l 光、d 暗、h 心）
    const M = { w: "water", f: "fire", g: "wood", l: "light", d: "dark", h: "heart" };
    grid.forEach((row, r) => row.forEach((o, c) => setAttr(o, M[fx.board[r][c]])));
  }
  if (fx.rowTo) grid[ROWS - 1].forEach(o => setAttr(o, fx.rowTo));
  if (fx.timeUp) B.timeUp = (B.timeUp || 0) + fx.timeUp;
  if (fx.boardTo) grid.flat().filter(o => o.attr !== "heart" && o.attr !== fx.boardTo).forEach(o => setAttr(o, fx.boardTo));
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
  if (fx.selfBuff) { B.selfBuff = B.selfBuff || {}; B.selfBuff[i] = (B.selfBuff[i] || 1) * fx.selfBuff; }
  if (fx.healPct) { B.hp += B.hpMax * fx.healPct; updateHp(); }
  if (fx.guard) { B.guard = Math.max(B.guard, fx.guard); $(".hpbar").classList.add("guarded"); }
  if (fx.delay) { B.enemies.forEach(e => e.cdNow += fx.delay); alive().forEach(updateEnemy); }
  if (fx.fixedDmg) {   // 固定傷害：不受屬性與倍率影響
    for (const t of alive()) {
      const e = B.enemies[t], el = enemyEl(t);
      e.hpNow -= fx.fixedDmg;
      const p = centerOf($(".pic", el), $(".field"));
      floatText(p.x, p.y - 20, fmt(fx.fixedDmg), c.attr);
      el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit");
      updateEnemy(t);
    }
    sfx.hit(true);
    await sleep(500);
    if (await checkWave()) return;
  }
  if (fx.nuke) {
    const el = $$(".party .icon")[i];
    await Promise.all(alive().map(t => hitEnemy(t, c.atk * fx.nuke, c.attr, el)));
    await sleep(400);
    if (await checkWave()) return;
  }
  if (!B || B.over) return;
  B.busy = false; board.classList.remove("locked");
}

/* ---------------- 結算 ---------------- */
async function win() {
  if (!B) return;
  B.over = true; B.busy = true; board.classList.add("locked");
  music.stop(.4);
  sfx.win(); vibe([40, 60, 40, 60, 120]);
  banner("過關");
  await sleep(1400);
  music.play("title");
  if (!chal) await dialog(CH.post);
  showResult();
}
/* 結算：星數、功德、新加入的角色、挑戰關獎勵 */
function showResult() {
  const idx = CHAPTERS.indexOf(CH), next = CHAPTERS[idx + 1];
  if (chal) {
    const d = chalDef(idx), first = !prog.chal[idx], gain = first ? REWARD.chalFirst : REWARD.chalAgain;
    prog.chal[idx] = true; saveProg(); addMerit(gain);
    modal(`<div class="result"><h3>挑戰成功</h3><p>「${CH.name}」‧ ${d.label}</p>
      <p class="merit-gain">功德 +${gain}${first ? "（首次）" : ""}</p>
      <div class="row"><button class="btn" data-goto="chapters">回章節</button><button class="btn gold" data-goto="again">再打一次</button></div></div>`);
    return;
  }
  const first = idx >= cleared;
  const goalT = CH.waves.length * 5, hpRate = B.hp / B.hpMax;
  const rules = [[`回合數 ${B.turns} ／ ${goalT} 以內`, B.turns <= goalT], [`剩餘血量 ${Math.round(hpRate * 100)}%（需 50% 以上）`, hpRate >= .5], [`最高 ${B.maxCombo} combo（需 6 以上）`, B.maxCombo >= 6]];
  const n = Math.max(1, rules.filter(r => r[1]).length), prev = prog.stars[idx] || 0;
  const joined = (CH.unlock || []).filter(id => !owned.has(id));
  joined.forEach(id => owned.add(id)); saveOwned();
  const gain = (first ? REWARD.first : REWARD.again) + REWARD.star * Math.max(0, n - prev);
  prog.stars[idx] = Math.max(prev, n); cleared = Math.max(cleared, idx + 1); saveProg(); addMerit(gain);
  modal(`<div class="result"><h3>${CH.no} 通關</h3><p>「${CH.name}」</p>
    <div class="rate big">${"★".repeat(n)}${"☆".repeat(3 - n)}</div>
    <ul class="rules">${rules.map(([t, ok]) => `<li class="${ok ? "ok" : ""}">${ok ? "✔" : "✘"} ${t}</li>`).join("")}</ul>
    <p class="merit-gain">功德 +${gain}${n > prev && prev ? `（星數提升 +${REWARD.star * (n - prev)}）` : ""}</p>
    ${joined.length ? `<div class="joined"><div class="j-title">新加入的角色</div><div class="j-grid">${joined.map(id => `<div class="j">${iconHTML(id)}<span>${CARDS[id].who}</span></div>`).join("")}</div></div>` : ""}
    ${first && next ? `<p class="unlock">${next.no}「${next.name}」開放了</p>` : ""}${!next ? `<p class="unlock">主線劇情全部通關，謝謝你玩到最後。</p>` : ""}
    <div class="row"><button class="btn" data-goto="chapters">回章節</button>${next ? `<button class="btn gold" data-goto="next">下一章</button>` : `<button class="btn gold" data-goto="again">再打一次</button>`}</div></div>`);
}
function lose() {
  B.over = true; B.busy = true; board.classList.add("locked"); music.stop(.8); sfx.lose(); vibe(300);
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
    <div class="set-row"><div>轉珠教學<small>重新看一次轉珠操作說明</small></div><button class="btn mini" id="replay-tut">重看</button></div>
    <div class="set-row"><div>清除存檔<small>通關進度、角色、功德、隊伍全部歸零（音效設定保留）</small></div><button class="btn mini danger" id="wipe-save">清除</button></div>
    <p class="hint">黃泉燒肉店 轉珠 v${GAME_VERSION}</p>
    <div class="row"><button class="btn gold" data-close>完成</button></div>`);
  $("#wipe-save").onclick = () => {
    modal(`<h3>清除存檔？</h3><p>通關進度、擁有的角色、功德、隊伍與看過的劇情介紹都會刪除，回到剛開始的狀態。這個動作不能復原。</p>
      <div class="row"><button class="btn" data-close>取消</button><button class="btn gold danger" id="wipe-yes">確定清除</button></div>`);
    $("#wipe-yes").onclick = () => {
      try { Object.keys(localStorage).filter(k => k.startsWith("hq-") && k !== "hq-settings").forEach(k => localStorage.removeItem(k)); } catch (e) {}
      location.reload();
    };
  };
  $("#replay-tut").onclick = () => {
    closeModal(); tut.force = true; CH = CHAPTERS[0];
    go("battle"); startBattle(true);
  };
  $$(".switch[data-k]").forEach(b => b.onclick = () => {
    SET[b.dataset.k] = !SET[b.dataset.k]; saveSet();
    b.classList.toggle("on", SET[b.dataset.k]);
    if (b.dataset.k === "vibe" && SET.vibe) vibe([30, 40, 30]);
    if (b.dataset.k === "sound" && SET.sound) sfx.pop(3);
    if (b.dataset.k === "music") music.refresh();
  });
}
document.addEventListener("click", e => { if (e.target.closest("[data-settings]") && !(B && B.busy)) settingsDialog(); });

/* ================================================================
   新手轉珠教學（第一章第 1 波；localStorage "hq-tutorial" 記錄看過了）
   做法：固定盤面＋疊一層提示；敵人 HP 放大、CD 拉長（不會死也不攻擊）；
   拖曳判定不動，只在盤面外層用 capture 擋掉「不是從指定符石開始」的按下
   ================================================================ */
const TUT_ATTR = { W: "water", F: "fire", G: "wood", L: "light", D: "dark", H: "heart" };
const TUT_STEPS = [
  { from: [3, 2], to: [4, 2], expect: 1, fall: "GLWGGHGDHWWF", title: "① 拖動符石",
    text: "按住發亮的符石，往下拖到虛線框。<b>3 顆同色連成一排</b>就會消除！",
    praise: "消除成功！連線消除，就能攻擊敵人。",
    layout: ["WFGLDH", "GLDHWF", "DHWFGL", "WFWLDH", "WWFHWF"] },
  { from: [2, 1], to: [2, 2], expect: 2, fall: "FHLWDGGGGHFL", title: "② 連鎖 Combo",
    text: "這一拖，<b>同時消除兩組</b>！Combo 越多，傷害越高。",
    praise: "2 Combo！傷害比剛才高。",
    layout: ["FGLDHW", "DGWFGL", "FFGFFW", "DHWDGL", "FGLDHW"] }
];
const TUT_PAGES = [
  { title: "③ 小知識：回復", html: `<img class="tut-orb" src="art/orb-heart.webp" alt=""> 消除<b>心符石</b>可以回血，回復力越高補越多。` },
  { title: "③ 小知識：全體攻擊", html: `一次連 <b>5 顆以上</b>同色，會打<b>全體敵人</b>。` },
  { title: "③ 小知識：屬性相剋", html: `<b>水剋火、火剋木、木剋水</b>，光暗互剋。打中被剋制的屬性，傷害 <b>2 倍</b>。
    <div class="tut-rel">${["water", "fire", "wood", "water"].map(a => `<img class="tut-orb" src="art/orb-${a}.webp" alt="">`).join("<i>›</i>")}<span></span>
    <img class="tut-orb" src="art/orb-light.webp" alt=""><i>⇄</i><img class="tut-orb" src="art/orb-dark.webp" alt=""></div>` }
];
const tut = { fall: null, combos: 0, force: false, start: null, skipped: false, next: false };
const tutWanted = () => CH.id === "ch1" && (tut.force || !store.get("hq-tutorial", false));
{ const _showCombo = showCombo; showCombo = n => { tut.combos = Math.max(tut.combos, n); _showCombo(n); }; }

function tutPrepEnemies() {
  $("#battle").classList.add("tutorial");
  B.enemies.forEach(e => { e.hp *= 100; e.hpNow = e.hp; e.cdNow = e.cd = 999; });
}
function tutRestoreEnemies() {
  $("#battle").classList.remove("tutorial");
  if (!B || !B.enemies) return;
  B.enemies.forEach((e, i) => {
    const o = ENEMIES[e.key]; e.hp = o.hp; e.hpNow = o.hp; e.cd = o.cd; e.cdNow = o.cd;
    if (enemyEl(i)) { enemyEl(i).classList.remove("dead"); updateEnemy(i); }
  });
}
function tutRect(el) {
  const a = $("#app").getBoundingClientRect(), r = el.getBoundingClientRect();
  return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height };
}
function tutCell(r, c) {
  const b = tutRect(board), w = b.w / COLS, h = b.h / ROWS;
  return { x: b.x + c * w, y: b.y + r * h, w, h };
}
async function tutorialRun(b) {
  tut.skipped = false;
  const root = document.createElement("div");
  root.id = "tut";
  const f = tutRect($(".field")), bw = tutRect($(".board-wrap"));
  root.innerHTML = `<div class="tut-field" style="left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px"><div class="tut-card"></div></div>
    <div class="tut-block" style="left:${bw.x}px;top:${bw.y}px;width:${bw.w}px;height:${bw.h}px"></div>
    <i class="tut-ring from"></i><i class="tut-ring to"></i><div class="tut-finger">👆</div>`;
  $("#app").appendChild(root);
  const card = $(".tut-card", root), blocker = $(".tut-block", root), ringA = $(".from", root), ringB = $(".to", root), finger = $(".tut-finger", root);
  const cd0 = [...B.cd];
  let anim = null;
  const alive_ = () => B === b && !tut.skipped;
  const wait = async fn => { while (alive_() && !fn()) await sleep(80); return alive_(); };
  const place = (el, r) => Object.assign(el.style, { display: "block", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
  const showCard = (title, html, btn) => {
    tut.next = false;
    card.innerHTML = `<div class="tut-top"><small>轉珠教學</small><b>${title}</b><button class="tut-skip">略過教學</button></div>
      <p>${html}</p>${btn ? `<button class="tut-next">${btn}</button>` : `<p class="tut-hint"></p>`}`;
    $(".tut-skip", card).onclick = () => { tut.skipped = true; };
    const n = $(".tut-next", card); if (n) n.onclick = () => { tut.next = true; };
    card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop");
  };
  const hint = t => { const h = $(".tut-hint", card); if (h) { h.textContent = t; h.animate([{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "none" }], { duration: 240 }); } };
  const hideGuide = () => { ringA.style.display = ringB.style.display = finger.style.display = "none"; if (anim) anim.cancel(); anim = null; };
  const guide = (from, to) => {
    const a = tutCell(...from), z = tutCell(...to);
    place(ringA, a); place(ringB, z);
    finger.style.display = "block";
    const p = r => `translate(${r.x + r.w * .4}px, ${r.y + r.h * .45}px)`;
    if (anim) anim.cancel();
    anim = finger.animate([{ transform: p(a) + " scale(1.15)", offset: 0 }, { transform: p(a) + " scale(.9)", offset: .2 },
      { transform: p(z) + " scale(.9)", offset: .7 }, { transform: p(z) + " scale(1.15)", offset: .85 }, { transform: p(a) + " scale(1.15)", offset: 1, opacity: 0 }],
      { duration: 2200, iterations: Infinity });
  };
  const cleanup = done => {
    hideGuide(); root.remove(); tut.start = null; tut.fall = null;
    $$(".party .icon").forEach(el => el.classList.remove("tut-hl"));
    if (B !== b) return;
    tutRestoreEnemies();
    B.cd = cd0; updateParty();
    if (done) store.set("hq-tutorial", true);
    tut.force = false;
    initBoard();
  };

  // 前兩步：照指示拖
  for (let k = 0; k < TUT_STEPS.length; k++) {
    const st = TUT_STEPS[k];
    blocker.style.display = "none";
    for (;;) {
      if (!alive_()) return cleanup(false);
      initBoard(st.layout);
      showCard(st.title, st.text);
      guide(st.from, st.to);
      tut.start = st.from; tut.combos = 0; tut.fall = [...st.fall].map(ch => TUT_ATTR[ch]);
      B.busy = false; board.classList.remove("locked");
      if (!await wait(() => B.busy)) return cleanup(false);     // 等玩家拖完開始結算
      tut.start = null;
      if (!await wait(() => !B.busy)) return cleanup(false);   // 等這回合結束
      tut.fall = null;
      if (tut.combos >= st.expect) break;
      hint("不是這樣拖喔，照著手指再試一次");
      await sleep(900);
    }
    hideGuide();
    showCard("太棒了", st.praise);
    await sleep(1500);
  }
  // 第三步：小知識（蓋住盤面，不用操作）
  B.busy = true; board.classList.add("locked");
  initBoard();
  blocker.style.display = "block";
  for (let k = 0; k < TUT_PAGES.length; k++) {
    showCard(TUT_PAGES[k].title, TUT_PAGES[k].html, "下一步");
    if (!await wait(() => tut.next)) return cleanup(false);
  }
  // 第四步：主動技能
  B.cd[0] = 0; updateParty();
  const icon = $$(".party .icon")[0];
  icon.classList.add("tut-hl");
  B.busy = false;
  showCard("④ 主動技能", "隊員頭像<b>發光、顯示 OK</b> 時，點一下就能發動主動技能。點點看發光的頭像吧！", "完成教學");
  if (!await wait(() => tut.next)) return cleanup(false);
  await wait(() => !B.busy);   // 若剛好在放技能，等它放完
  cleanup(true);
}
document.querySelector(".board-wrap").addEventListener("pointerdown", e => {
  if (!tut.start || !B) return;
  const { r, c } = cellAt(e.clientX, e.clientY);
  if (r === tut.start[0] && c === tut.start[1]) return;
  e.stopPropagation();
  const h = $(".tut-hint"); if (h) { h.textContent = "請從發亮的符石開始拖喔"; h.animate([{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "none" }], { duration: 240 }); }
  const ring = $("#tut .tut-ring.from"); if (ring) ring.animate([{ transform: "scale(1.25)" }, { transform: "none" }], { duration: 300 });
}, true);

/* ---------------- 對話框 ---------------- */
function modal(html, kind = "") { $(".modal-box").innerHTML = html; $("#modal").className = "modal on " + kind; }
function closeModal() { $("#modal").className = "modal"; }
$("#modal").addEventListener("click", e => {
  if ((e.target.id === "modal" && !(B && B.over)) || e.target.closest("[data-close]")) closeModal();   // 結算視窗只能按按鈕
  const g = e.target.closest("[data-goto]");
  if (g) {
    closeModal();
    const to = g.dataset.goto;
    if (to === "again") startBattle(true);
    else if (to === "next") { CH = CHAPTERS[CHAPTERS.indexOf(CH) + 1]; chal = null; B = null; go("team"); }
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
  $(".dex-tabs button.on")?.scrollIntoView({ inline: "center", block: "nearest" });   // 選到的分頁捲到看得到
  const s = DEX_TABS.find(x => x.id === dexSeries);
  $(".dex-head").innerHTML = `<b style="--sc:${s.color}">${s.id === "enemy" ? s.name : s.name + "系列"}</b><span>${s.sub}</span>`;
  if (s.id === "enemy") {
    // 依章節出場順序列出，同名的敵人（強化版）只列一次
    const seen = new Set(), keys = [...CHAPTERS.flatMap(ch => ch.waves.flatMap(w => w.enemies)), ...Object.keys(ENEMIES)]
      .filter(k => ENEMIES[k] && !seen.has(ENEMIES[k].name) && seen.add(ENEMIES[k].name));
    $(".dex-grid").innerHTML = keys.map(k => [k, ENEMIES[k]]).map(([k, e]) => `<div class="dcard" data-enemy="${k}" style="${attrVars(e.attr)}">
      <img src="${e.img}" alt="${e.name}"><div class="cap"><small>${e.boss ? "BOSS" : "敵人"}</small>${e.name}</div></div>`).join("");
    $$(".dcard[data-enemy]").forEach(el => el.onclick = () => showEnemy(el.dataset.enemy));
    return;
  }
  $(".dex-grid").innerHTML = s.members.map(who => {
    const ids = cardsOf(who);
    return ids.map(id => { const c = CARDS[id]; return `<div class="dcard ${owned.has(id) ? "" : "unowned"}" data-id="${id}" style="${attrVars(c.attr)}">
      <img src="${c.art}" alt="${c.who}">${owned.has(id) ? "" : `<span class="own-tag">未獲得<small>${buyable(id) ? PRICE[c.star] + " 功德" : "進化取得"}</small></span>`}<span class="dtier tier t${c.tier.replace("+", "p").replace("-", "m")}">${c.tier}</span><div class="cap"><small>${c.title}</small>${c.who}<div class="st">${stars(c.star)}</div></div></div>`; }).join("");
  }).join("");
  $$(".dcard[data-id]").forEach(el => el.onclick = () => showCard(el.dataset.id));
}

/* 托夢照相館：用功德兌換還沒獲得的角色 */
function renderShop() {
  const groups = SERIES.map(s => ({ s, ids: s.members.flatMap(who => cardsOf(who)).filter(buyable).sort((a, b) => CARDS[a].star - CARDS[b].star) })).filter(g => g.ids.length);
  $(".shop-grid").innerHTML = groups.length ? groups.map(({ s, ids }) => `<div class="pk-head" style="color:${s.color}">${s.name}</div>
    <div class="dex-grid inner">${ids.map(id => { const c = CARDS[id]; return `<div class="dcard shopc" data-id="${id}" style="${attrVars(c.attr)}">
      <img src="${c.art}" alt="${c.who}"><span class="own-tag price ${merit >= PRICE[c.star] ? "" : "poor"}">${PRICE[c.star]}<small>功德</small></span>
      <div class="cap"><small>${c.title}</small>${c.who}<div class="st">${stars(c.star)}</div></div></div>`; }).join("")}</div>`).join("")
    : `<p class="hint">所有角色都收集齊了。</p>`;
  $$(".shopc").forEach(el => el.onclick = () => showCard(el.dataset.id));
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
      `<div data-evo="${x}" class="${x === id ? "cur" : ""} ${owned.has(x) ? "" : "dim"}">${iconHTML(x)}</div>`).join("")}
      ${!c.evo ? `<span class="plan">已是最終進化</span>`
        : owned.has(c.evo) ? `<span class="plan">下一階已獲得</span>`
        : owned.has(id) ? `<button class="btn gold evo-btn" id="do-evo">進化<small>${EVO_COST[CARDS[c.evo].star]} 功德</small></button>`
        : `<span class="plan">需先獲得這一階</span>`}</div>`;
  } else if (c.planned) {
    evo = `<div class="evo plan">進化路線：${c.planned.join(" › ")}（立繪製作中）</div>`;
  }
  const skill = `<div class="stats"><div>生命力<b>${fmt(c.hp)}</b></div><div>攻擊力<b>${fmt(c.atk)}</b></div><div>回復力<b>${fmt(c.rec)}</b></div></div>
    <div class="skill"><span class="k">隊長技能</span> <b>${c.lead.name}</b><br>${c.lead.desc}</div>
    <div class="skill"><span class="k">主動技能</span> <b>${c.act.name}</b><span class="cdv">CD ${c.act.cd}</span><br>${c.act.desc}</div>${evo}
    ${buyable(id) ? `<div class="buy"><button class="btn gold" id="do-buy">用 ${PRICE[c.star]} 功德兌換</button></div>` : !owned.has(id) ? `<p class="hint">還沒獲得，要從前一階進化才能取得。</p>` : ""}
    <p class="hint own-msg" id="own-msg"></p>`;
  cardShell({
    attr: c.attr, art: c.art, star: stars(c.star), title: c.title, name: c.who, race: c.race,
    topRight: `<span class="tier t${c.tier.replace("+", "p").replace("-", "m")}" title="${c.onChart ? "依戰力表" : "依劇情判斷"}">戰力 ${c.tier}${c.onChart ? "" : "<small>※</small>"}</span>`,
    tabs: [{ id: "skill", label: "能力", html: skill },
           { id: "story", label: "背景故事", html: storyHTML(c.who, c.lore) },
           { id: "info", label: "角色資料", html: infoHTML(c.who) }]
  });
  $$("[data-evo]").forEach(el => el.onclick = () => showCard(el.dataset.evo));
  const short = (need) => { $("#own-msg").textContent = `功德不足，還差 ${need - merit}`; vibe(40); };
  if ($("#do-buy")) $("#do-buy").onclick = () => {
    const p = PRICE[c.star];
    if (merit < p) return short(p);
    addMerit(-p); owned.add(id); saveOwned(); sfx.pick(); vibe([30, 40, 60]);
    showCard(id); renderDex(); renderShop();
  };
  if ($("#do-evo")) $("#do-evo").onclick = async () => {
    const cost = EVO_COST[CARDS[c.evo].star];
    if (merit < cost) return short(cost);
    addMerit(-cost); owned.add(c.evo); saveOwned(); renderDex(); renderShop();
    const f = document.createElement("div"); f.className = "evo-flash"; $("#app").appendChild(f);
    sfx.evo(); vibe([30, 40, 30, 40, 30, 40, 150]);
    await sleep(480); showCard(c.evo); await sleep(800); f.remove();
  };
}
function showEnemy(k) {
  const e = ENEMIES[k];
  const sk = (e.skills || []).map(s => `<div class="skill"><span class="k">技能</span> ${skillText(s)}</div>`).join("");
  const skill = `<div class="stats"><div>生命力<b>${fmt(e.hp)}</b></div><div>攻擊力<b>${fmt(e.atk)}</b></div><div>攻擊間隔<b>${e.cd} 回合</b></div></div>
    <div class="skill"><span class="k">屬性</span> <b>${ATTR[e.attr].name}</b><br>${ATTR[Object.keys(BEATS).find(a => BEATS[a] === e.attr)].name}屬性對牠造成 2 倍傷害</div>
    ${sk}
    ${CHAPTERS.filter(ch => ch.waves.some(w => w.enemies.includes(k))).map(ch => `<div class="skill"><span class="k">出沒</span> <b>${ch.no}「${ch.name}」</b><br>${ch.place}，第 ${ch.waves.findIndex(w => w.enemies.includes(k)) + 1} 波</div>`).join("")}`;
  cardShell({
    attr: e.attr, art: e.img, star: e.boss ? "BOSS" : "", title: e.title || (CHAPTERS.find(ch => ch.waves.some(w => w.enemies.includes(k))) || {}).name || "", name: e.name, race: "魔族",
    tabs: [{ id: "skill", label: "能力", html: skill },
           { id: "story", label: "背景故事", html: storyHTML(e.name) },
           { id: "info", label: "角色資料", html: infoHTML(e.name) }]
  });
}

renderTeam();
$$(".ver").forEach(el => el.textContent = GAME_VERSION);

/* ---------------- 片頭：點一下進入（同時解鎖聲音）→ 拔刀斬出 Logo → 標題 ---------------- */
(() => {
  const sp = $("#splash");
  for (let k = 0; k < 26; k++) {   // 往上飄的火星
    const e = document.createElement("i");
    e.style.cssText = `left:${Math.random() * 100}%;animation-delay:${(Math.random() * 6).toFixed(2)}s;animation-duration:${(4 + Math.random() * 4).toFixed(2)}s;--sz:${(2 + Math.random() * 3).toFixed(1)}px`;
    $(".sp-embers", sp).appendChild(e);
  }
  /* 先下載「一開始就會用到」的東西：片頭、標題、符石、初始隊伍、第一章的圖與配樂。
     載完（或最多等 15 秒）才顯示「點一下進入」；其他章節之後在背景慢慢抓。 */
  const gate = $(".sp-gate b"), bar = document.createElement("div");
  bar.className = "sp-load"; bar.innerHTML = "<i></i><span>載入中 0%</span>";
  $(".sp-gate", sp).appendChild(bar);
  const ch1 = CHAPTERS[0];
  const linesOf = ch => [ch.pre, ch.post, ...ch.waves.map(w => w.lines || [])].flat();
  const imgsOf = ch => [ch.bg, ...ch.waves.flatMap(w => w.enemies).map(k => ENEMIES[k].img),
    ...linesOf(ch).filter(l => l[0] === "@scene" && l[1]).map(l => l[1]),
    ...linesOf(ch).filter(l => l[0] && l[0][0] !== "@" && VN[l[0]]).map(l => `art/vn/${VN[l[0]]}-${l[3] || "normal"}.webp`)];
  const ESSENTIAL = [...new Set([
    "art/emblem.webp", "art/vn/lee-normal.webp", "art/vn/yutong-normal.webp", "art/bg-battle.webp",
    ...["water", "fire", "wood", "light", "dark", "heart"].map(a => `art/orb-${a}.webp`),
    ...team.map(id => CARDS[id].art), ...imgsOf(ch1),
    "audio/title.m4a", `audio/${(ch1.music && ch1.music.battle) || "battle1"}.m4a`
  ])];
  const loadOne = url => /\.m4a$/.test(url)
    ? fetch(url).then(r => r.blob()).catch(() => {})
    : new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = url; });
  let done = 0, ready = false;
  const showReady = () => { if (ready) return; ready = true; bar.classList.add("done"); gate.classList.add("on");
    // 進得去之後，其餘章節的圖在背景慢慢抓
    setTimeout(() => CHAPTERS.slice(1).forEach(ch => imgsOf(ch).forEach(u => { const im = new Image(); im.src = u; })), 1500); };
  (async () => {
    const q = [...ESSENTIAL];
    const worker = async () => { while (q.length) { await loadOne(q.shift()); done++; $("i", bar).style.width = `${done / ESSENTIAL.length * 100}%`; $("span", bar).textContent = `載入中 ${Math.round(done / ESSENTIAL.length * 100)}%`; } };
    await Promise.all([1, 2, 3, 4, 5].map(worker));
    showReady();
  })();
  setTimeout(showReady, 15000);   // 網路太慢也不要卡死
  let stage = 0;
  const finish = () => {
    if (stage === 2) return; stage = 2;
    sp.classList.add("out");
    setTimeout(() => { sp.classList.remove("active", "out"); go("title"); }, 600);
  };
  sp.addEventListener("click", async () => {
    if (stage === 1) { finish(); return; }   // 演出中再點一下就略過
    if (stage || !ready) return;
    stage = 1;
    music.unlock();
    sp.classList.add("go");
    sfx.sword(); vibe(15);
    await sleep(420); if (stage !== 1) return;
    sp.classList.add("cut");
    sfx.logoHit(); vibe([40, 30, 80]);
    $("#app").animate([{ transform: "translate(6px,-4px)" }, { transform: "translate(-6px,4px)" }, { transform: "translate(3px,0)" }, { transform: "none" }], { duration: 320 });
    await sleep(2900); finish();
  });
})();
})();
