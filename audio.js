/* =========================================================================
   黃泉燒肉店 轉珠 ‧ 聲音
   配樂與音效全部用 WebAudio 即時合成，沒有音檔。
   ▸ SET / saveSet / vibe  設定（音效、配樂、震動）與震動
   ▸ sfx.xxx()             音效
   ▸ music.play(名稱)      配樂：title 標題、battle 戰鬥、boss 撒旦
   ========================================================================= */
(() => {
const SET = { sound: true, music: true, vibe: true };
try { Object.assign(SET, JSON.parse(localStorage.getItem("hq-settings") || "{}")); } catch (e) {}
function saveSet() { try { localStorage.setItem("hq-settings", JSON.stringify(SET)); } catch (e) {} }
const canVibe = "vibrate" in navigator;
function vibe(p) { if (SET.vibe && canVibe) try { navigator.vibrate(p); } catch (e) {} }

/* ---------------- 音訊底層 ---------------- */
let A, master, sfxBus, revIn, noiseBuf;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function ac() {
  if (!A) {
    // iPhone：把網頁聲音當成「播放媒體」，側邊靜音開關打開時也聽得到（Safari 17 以上）
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    A = new (window.AudioContext || window.webkitAudioContext)();
    const comp = A.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = A.createGain(); master.gain.value = .8;
    master.connect(comp).connect(A.destination);
    sfxBus = A.createGain(); sfxBus.gain.value = .7; sfxBus.connect(master);
    // 殘響：用衰減的雜訊當脈衝響應
    const conv = A.createConvolver(), len = A.sampleRate * 2.4, ir = A.createBuffer(2, len, A.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    conv.buffer = ir;
    revIn = A.createGain(); revIn.gain.value = .9;
    revIn.connect(conv).connect(master);
    noiseBuf = A.createBuffer(1, A.sampleRate * 2, A.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) A.suspend(); else A.resume();
    });
  }
  if (A.state === "suspended" && !document.hidden) A.resume();
  return A;
}
// out：接到某條 bus（乾聲）＋殘響（濕聲）
function out(node, bus, wet = 0) {
  node.connect(bus.dry || bus);
  if (wet) { const g = A.createGain(); g.gain.value = wet; node.connect(g).connect(bus.wet || revIn); }
}
function env(g, t, vol, attack, dur, curve = "exp") {
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
}
let distCurve;
function dist() {
  if (!distCurve) {
    distCurve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; distCurve[i] = Math.tanh(x * 3.2); }
  }
  const w = A.createWaveShaper(); w.curve = distCurve; return w;
}

/* ---------------- 樂器 ---------------- */
const I = {
  // 太鼓：低頻掃頻＋悶雜訊
  taiko(bus, t, vol = .7, pitch = 1) {
    const o = A.createOscillator(), g = A.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(150 * pitch, t); o.frequency.exponentialRampToValueAtTime(48 * pitch, t + .22);
    env(g, t, vol, .004, .5); o.connect(g); out(g, bus, .25); o.start(t); o.stop(t + .55);
    const n = A.createBufferSource(), f = A.createBiquadFilter(), gn = A.createGain();
    n.buffer = noiseBuf; f.type = "lowpass"; f.frequency.value = 900 * pitch;
    env(gn, t, vol * .5, .002, .12); n.connect(f).connect(gn); out(gn, bus, .2); n.start(t); n.stop(t + .15);
  },
  snare(bus, t, vol = .25) {
    const n = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    n.buffer = noiseBuf; f.type = "bandpass"; f.frequency.value = 2200; f.Q.value = .8;
    env(g, t, vol, .002, .16); n.connect(f).connect(g); out(g, bus, .3); n.start(t); n.stop(t + .2);
    const o = A.createOscillator(), go = A.createGain();
    o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(160, t + .08);
    env(go, t, vol * .6, .002, .1); o.connect(go); out(go, bus); o.start(t); o.stop(t + .12);
  },
  hat(bus, t, vol = .06, open = false) {
    const n = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    n.buffer = noiseBuf; f.type = "highpass"; f.frequency.value = 7000;
    env(g, t, vol, .001, open ? .18 : .045); n.connect(f).connect(g); out(g, bus); n.start(t); n.stop(t + .2);
  },
  bass(bus, t, m, dur, vol = .22, drive = false) {
    const o = A.createOscillator(), o2 = A.createOscillator(), f = A.createBiquadFilter(), g = A.createGain();
    o.type = "sawtooth"; o2.type = "square"; o.frequency.value = mtof(m); o2.frequency.value = mtof(m - 12);
    f.type = "lowpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(drive ? 1600 : 900, t); f.frequency.exponentialRampToValueAtTime(drive ? 260 : 180, t + dur);
    env(g, t, vol, .006, dur);
    const mix = A.createGain(); mix.gain.value = .5;
    o.connect(f); o2.connect(mix).connect(f);
    if (drive) { const w = dist(); f.connect(w).connect(g); } else f.connect(g);
    out(g, bus); o.start(t); o2.start(t); o.stop(t + dur + .02); o2.stop(t + dur + .02);
  },
  // 和聲墊：兩個微微走音的鋸齒波，慢起音
  pad(bus, t, ms, dur, vol = .05, bright = 1400) {
    ms.forEach(m => [-6, 6].forEach(det => {
      const o = A.createOscillator(), f = A.createBiquadFilter(), g = A.createGain();
      o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = det;
      f.type = "lowpass"; f.frequency.value = bright;
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol / ms.length, t + dur * .3);
      g.gain.linearRampToValueAtTime(.0001, t + dur);
      o.connect(f).connect(g); out(g, bus, .6); o.start(t); o.stop(t + dur + .02);
    }));
  },
  // 古箏：撥弦，快速衰減，帶一點泛音
  pluck(bus, t, m, vol = .08) {
    [[1, 1], [2, .35], [3, .12]].forEach(([h, a]) => {
      const o = A.createOscillator(), g = A.createGain();
      o.type = h === 1 ? "triangle" : "sine"; o.frequency.value = mtof(m) * h;
      env(g, t, vol * a, .003, .6 / h + .15); o.connect(g); out(g, bus, .45); o.start(t); o.stop(t + .9);
    });
  },
  // 二胡：鋸齒波過帶通濾波，起音滑音＋顫音
  erhu(bus, t, m, dur, vol = .12) {
    const o = A.createOscillator(), bp = A.createBiquadFilter(), lp = A.createBiquadFilter(), g = A.createGain();
    const lfo = A.createOscillator(), lg = A.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(mtof(m - .6), t); o.frequency.exponentialRampToValueAtTime(mtof(m), t + .05);
    lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(mtof(m) * .012, t + Math.min(.25, dur * .5));
    lfo.connect(lg).connect(o.frequency);
    bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = .9;
    lp.type = "lowpass"; lp.frequency.value = 3800;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .04);
    g.gain.setValueAtTime(vol, t + dur * .75); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .08);
    o.connect(bp).connect(lp).connect(g); out(g, bus, .5);
    o.start(t); lfo.start(t); o.stop(t + dur + .1); lfo.stop(t + dur + .1);
  },
  // 銅管重音：濾波器張開再收
  brass(bus, t, ms, dur, vol = .12) {
    ms.forEach(m => {
      const o = A.createOscillator(), f = A.createBiquadFilter(), g = A.createGain();
      o.type = "sawtooth"; o.frequency.value = mtof(m);
      f.type = "lowpass"; f.Q.value = 2;
      f.frequency.setValueAtTime(250, t); f.frequency.exponentialRampToValueAtTime(2600, t + .06); f.frequency.exponentialRampToValueAtTime(700, t + dur);
      env(g, t, vol / ms.length * 1.6, .02, dur); o.connect(f).connect(g); out(g, bus, .35); o.start(t); o.stop(t + dur + .02);
    });
  },
  // 銅鑼：不和諧的正弦泛音＋長尾巴
  gong(bus, t, vol = .3) {
    [1, 1.47, 2.09, 2.56, 3.2, 4.1].forEach((r, k) => {
      const o = A.createOscillator(), g = A.createGain();
      o.frequency.value = 92 * r; env(g, t, vol / (k + 1.5), .01, 3.2 - k * .3);
      o.connect(g); out(g, bus, .7); o.start(t); o.stop(t + 3.3);
    });
    const n = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    n.buffer = noiseBuf; f.type = "bandpass"; f.frequency.value = 3000; f.Q.value = .5;
    env(g, t, vol * .4, .005, 1.8); n.connect(f).connect(g); out(g, bus, .8); n.start(t); n.stop(t + 1.9);
  },
  riser(bus, t, dur, vol = .12) {
    const n = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    n.buffer = noiseBuf; f.type = "bandpass"; f.Q.value = 4;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5000, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur); g.gain.linearRampToValueAtTime(.0001, t + dur + .05);
    n.connect(f).connect(g); out(g, bus, .5); n.start(t); n.stop(t + dur + .1);
  }
};

/* ---------------- 配樂 ----------------
   每首歌 8 小節循環，一小節 16 格（十六分音符）。
   旋律寫成 [音高, 長度(格)]，音高 0 是休止。 */
const mel = arr => { const o = []; let s = 0; arr.forEach(([m, l]) => { if (m) o.push([s, m, l]); s += l; }); return o; };
const SONGS = {
  /* 標題：慢板，古箏琶音＋和聲墊，後半段二胡輕輕進來 */
  title: {
    bpm: 72, vol: .5,
    chords: [[62, 65, 69], [58, 62, 65], [57, 60, 65], [60, 64, 67], [62, 65, 69], [58, 62, 65], [55, 58, 62], [57, 61, 64]],
    roots: [38, 34, 41, 36, 38, 34, 31, 33],
    lead: mel([[0, 64], [0, 16], [69, 6], [72, 2], [74, 8], [72, 6], [69, 2], [67, 8], [65, 6], [67, 2], [69, 16], [64, 8]]),
    step(b, t, i, bar, s, loop) {
      const ch = this.chords[bar];
      if (i === 0) { I.pad(b, t, ch, this.len * 16, .06, 900); I.bass(b, t, this.roots[bar], this.len * 14, .1); }
      if (i % 2 === 0) I.pluck(b, t, ch[[0, 1, 2, 1, 2, 0, 1, 2][i / 2]] + (i >= 8 ? 12 : 0), .07);
      this.leadAt(b, t, s, .07);
    }
  },
  /* 戰鬥：D 小調，太鼓＋古箏十六分音符＋二胡主旋律 */
  battle: {
    bpm: 132, vol: .45,
    chords: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64], [62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]],
    roots: [38, 34, 36, 33, 38, 34, 36, 33],
    lead: mel([[69, 4], [74, 4], [72, 2], [69, 2], [67, 4],
               [65, 6], [67, 2], [69, 4], [72, 4],
               [67, 4], [76, 4], [74, 2], [72, 2], [67, 4],
               [69, 8], [73, 4], [76, 4],
               [74, 4], [77, 4], [76, 2], [74, 2], [69, 4],
               [70, 4], [74, 4], [77, 4], [74, 4],
               [76, 4], [79, 4], [77, 2], [76, 2], [72, 4],
               [74, 2], [73, 2], [69, 12]]),
    step(b, t, i, bar, s, loop) {
      const ch = this.chords[bar], r = this.roots[bar];
      if ([0, 6, 8, 11].includes(i) || (bar === 7 && i >= 12)) I.taiko(b, t, i === 0 ? .75 : .5);
      if (i === 4 || i === 12) I.snare(b, t, .2);
      if (i % 2 === 0) I.hat(b, t, .04, i % 4 === 2);
      if (i % 2 === 0) I.bass(b, t, r + (i === 6 || i === 14 ? 12 : 0), .16, .16);
      I.pluck(b, t, ch[[0, 1, 2, 1][i % 4]] + ((i >> 2) & 1 ? 12 : 0), .045);
      if (i === 0) I.pad(b, t, ch.map(m => m - 12), this.len * 16, .045);
      if (loop > 0 || bar >= 4) this.leadAt(b, t, s, .11);
      if (bar === 7 && i === 8) I.riser(b, t, this.len * 8, .06);
    }
  },
  /* 王關：C 小調，加了拿坡里和弦（降 D）的壓迫感；重太鼓、破音貝斯、銅管重音、銅鑼 */
  boss: {
    bpm: 148, vol: .5,
    chords: [[60, 63, 67], [60, 63, 67], [56, 60, 63], [55, 59, 62], [60, 63, 67], [61, 65, 68], [56, 60, 63], [55, 59, 62]],
    roots: [36, 36, 32, 31, 36, 37, 32, 31],
    lead: mel([[72, 8], [75, 4], [74, 4],
               [72, 4], [67, 4], [68, 4], [67, 4],
               [68, 4], [72, 4], [75, 4], [77, 4],
               [79, 8], [77, 2], [75, 2], [74, 4],
               [72, 4], [75, 4], [79, 4], [84, 4],
               [85, 8], [84, 4], [80, 4],
               [79, 4], [77, 4], [75, 4], [74, 4],
               [71, 4], [74, 4], [67, 8]]),
    step(b, t, i, bar, s, loop) {
      const ch = this.chords[bar], r = this.roots[bar];
      if (bar === 0 && i === 0) I.gong(b, t, .3);
      if ([0, 3, 6, 8, 10, 12, 14].includes(i)) I.taiko(b, t, i % 8 === 0 ? .9 : .55, i % 8 === 0 ? .8 : 1);
      if (bar === 7 && i >= 8) I.taiko(b, t, .35 + (i - 8) * .07, 1.2);
      if (i === 4 || i === 12) I.snare(b, t, .26);
      I.hat(b, t, .025);
      if (i % 4 !== 1) I.bass(b, t, r, .12, .2, true);
      if (i === 0) I.brass(b, t, ch.map(m => m - 12), .55, .16);
      if (i === 10) I.brass(b, t, ch.map(m => m - 12), .25, .12);
      if (i === 0) I.pad(b, t, ch, this.len * 16, .05, 1100);
      if (loop > 0 || bar >= 4) this.leadAt(b, t, s, .13);
      if (bar === 3 && i === 8) I.riser(b, t, this.len * 8, .07);
    }
  }
};
Object.values(SONGS).forEach(song => {
  song.leadAt = function (b, t, s, vol) {
    for (const [st, m, l] of this.lead) if (st === s) I.erhu(b, t, m, l * this.len * .95, vol);
  };
});

const music = { want: null, cur: null, bus: null, step: 0, loop: 0, next: 0, timer: 0 };
function makeBus(vol) {
  const dry = A.createGain(), wet = A.createGain();
  dry.gain.value = vol; wet.gain.value = vol;
  dry.connect(master); wet.connect(revIn);
  return { dry, wet, set(v, sec) { [dry, wet].forEach(g => { g.gain.cancelScheduledValues(A.currentTime); g.gain.setValueAtTime(g.gain.value, A.currentTime); g.gain.linearRampToValueAtTime(v, A.currentTime + sec); }); } };
}
function tick() {
  const song = SONGS[music.cur];
  if (!song) return;
  while (music.next < A.currentTime + .15) {
    const s = music.step, bar = s >> 4, i = s & 15;
    try { song.step(music.bus, music.next, i, bar, s, music.loop); } catch (e) {}
    music.next += song.len;
    music.step = (s + 1) % 128;
    if (!music.step) music.loop++;
  }
}
music.play = function (name, fade = .6) {
  music.want = name;
  if (!SET.music || !A || music.cur === name) return;
  music.stop(fade);
  const song = SONGS[name];
  song.len = 60 / song.bpm / 4;
  music.cur = name; music.bus = makeBus(.0001); music.bus.set(song.vol, fade);
  music.step = 0; music.loop = 0; music.next = A.currentTime + .08;
  clearInterval(music.timer); music.timer = setInterval(tick, 25); tick();
};
music.stop = function (fade = .5) {
  if (music.bus) { const b = music.bus; b.set(.0001, fade); setTimeout(() => { b.dry.disconnect(); b.wet.disconnect(); }, fade * 1000 + 3000); }
  clearInterval(music.timer); music.cur = null; music.bus = null;
};
// 第一次觸碰後才能出聲（瀏覽器規定），那時再開始想播的歌
// 解鎖聲音：必須在使用者「點擊／手指放開」的當下呼叫（iPhone 只認這兩種）
let silentTag;
function silentWav() {   // 0.5 秒的無聲 wav
  const n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = (o, t) => [...t].forEach((c, i) => b[o + i] = c.charCodeAt(0));
  w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, "data"); v.setUint32(40, n, true);
  b.fill(128, 44);
  let bin = ""; b.forEach(x => bin += String.fromCharCode(x));
  return "data:audio/wav;base64," + btoa(bin);
}
music.unlock = function () {
  try {
    ac();
    if (A.state !== "running") A.resume();
    // 播一個極短的空白聲音，讓 iPhone 真正啟動音訊
    const src = A.createBufferSource(); src.buffer = A.createBuffer(1, 1, 22050); src.connect(A.destination); src.start(0);
    // 舊版 iPhone 沒有 audioSession：同時播一段無聲的 <audio>，讓靜音開關不擋網頁聲音
    if (!navigator.audioSession && !silentTag) {
      silentTag = document.createElement("audio");
      silentTag.src = silentWav(); silentTag.loop = true; silentTag.setAttribute("playsinline", "");
      silentTag.play().catch(() => { silentTag = null; });
    }
    if (music.want && !music.cur) music.play(music.want);
  } catch (e) {}
};
["touchend", "click", "keydown"].forEach(ev => document.addEventListener(ev, () => music.unlock(), true));
music.refresh = function () { if (SET.music) { const w = music.want; music.cur = null; if (A && w) music.play(w); } else { const w = music.want; music.stop(.3); music.want = w; } };

/* ---------------- 音效 ---------------- */
function tone({ f0, f1 = f0, dur = .12, type = "sine", vol = .3, delay = 0, attack = .005, wet = .15 }) {
  const t = A.currentTime + delay, o = A.createOscillator(), g = A.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, vol, attack, dur); o.connect(g); out(g, sfxBus, wet); o.start(t); o.stop(t + dur + .02);
}
function noise({ dur = .15, vol = .3, freq = 1200, q = 1, type = "bandpass", f1, delay = 0, wet = .1 }) {
  const t = A.currentTime + delay, src = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
  src.buffer = noiseBuf; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(freq, t);
  if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  src.connect(f).connect(g); out(g, sfxBus, wet); src.start(t); src.stop(t + dur + .02);
}
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];   // 五聲音階，combo 越多越高
const SFX = {
  click() { tone({ f0: 900, f1: 700, dur: .06, type: "triangle", vol: .16, wet: 0 }); },
  pick() { tone({ f0: 520, f1: 780, dur: .08, type: "triangle", vol: .2 }); },
  tick() { tone({ f0: 1500, f1: 1100, dur: .05, type: "square", vol: .09, wet: 0 }); },
  swap() { tone({ f0: 1300 + Math.random() * 200, dur: .035, vol: .07, wet: 0 }); noise({ dur: .03, vol: .05, freq: 4000, q: 3, wet: 0 }); },
  drop() { tone({ f0: 300, f1: 150, dur: .1, vol: .18, wet: 0 }); },
  pop(n) {   // 消除：清脆的玻璃碎裂＋往上爬的音階
    const f = 523.25 * Math.pow(2, SCALE[Math.min(n - 1, SCALE.length - 1)] / 12);
    tone({ f0: f, dur: .25, type: "triangle", vol: .28, wet: .35 });
    tone({ f0: f * 2, dur: .18, vol: .14, delay: .01, wet: .35 });
    tone({ f0: f * 3.01, dur: .1, vol: .06, delay: .015 });
    noise({ dur: .12, vol: .22, freq: 5200, q: .8, type: "highpass" });
    noise({ dur: .08, vol: .18, freq: 900, f1: 300, q: 2 });
  },
  hit(big) {
    noise({ dur: big ? .22 : .14, vol: big ? .42 : .28, freq: 1800, f1: 200, q: 1.2 });
    tone({ f0: big ? 180 : 240, f1: 60, dur: .16, type: "square", vol: big ? .2 : .12 });
  },
  hurt(heavy) {
    noise({ dur: heavy ? .6 : .35, vol: heavy ? .6 : .45, freq: 600, f1: 60, q: .7, type: "lowpass", wet: .3 });
    tone({ f0: heavy ? 90 : 110, f1: 32, dur: heavy ? .6 : .35, type: "sawtooth", vol: heavy ? .35 : .25 });
  },
  heal() { [0, 4, 7, 12].forEach((k, i) => tone({ f0: 784 * Math.pow(2, k / 12), dur: .32, vol: .12, delay: i * .06, wet: .5 })); },
  skill() {
    noise({ dur: .5, vol: .2, freq: 300, f1: 6000, q: 2, wet: .4 });
    [0, 7, 12, 19].forEach((k, i) => tone({ f0: 440 * Math.pow(2, k / 12), dur: .5, type: "triangle", vol: .14, delay: i * .07, wet: .5 }));
  },
  wave() { const t = A.currentTime; I.taiko(sfxBus, t, .8); I.taiko(sfxBus, t + .18, .6); I.gong(sfxBus, t + .36, .18); },
  win() { [0, 4, 7, 12, 16, 19, 24].forEach((k, i) => tone({ f0: 523 * Math.pow(2, k / 12), dur: .6, type: "triangle", vol: .16, delay: i * .09, wet: .5 })); },
  lose() { [12, 8, 5, 0].forEach((k, i) => tone({ f0: 220 * Math.pow(2, k / 12), dur: .7, vol: .2, delay: i * .24, wet: .5 })); },
  evo() { noise({ dur: 1, vol: .25, freq: 200, f1: 8000, q: 3, wet: .5 }); [0, 4, 7, 11, 12, 16, 19, 24].forEach((k, i) => tone({ f0: 392 * Math.pow(2, k / 12), dur: .6, vol: .12, delay: .15 + i * .08, wet: .5 })); },
  /* ---- 撒旦登場 ---- */
  rumble(dur = 3) {   // 地鳴：越來越大的低頻雜訊
    const t = A.currentTime, src = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    src.buffer = noiseBuf; src.loop = true; f.type = "lowpass"; f.frequency.setValueAtTime(80, t); f.frequency.linearRampToValueAtTime(260, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.9, t + dur); g.gain.linearRampToValueAtTime(.0001, t + dur + .3);
    src.connect(f).connect(g); out(g, sfxBus, .2); src.start(t); src.stop(t + dur + .4);
    const o = A.createOscillator(), go = A.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(32, t); o.frequency.linearRampToValueAtTime(44, t + dur);
    go.gain.setValueAtTime(.0001, t); go.gain.exponentialRampToValueAtTime(.5, t + dur); go.gain.linearRampToValueAtTime(.0001, t + dur + .3);
    o.connect(go); out(go, sfxBus); o.start(t); o.stop(t + dur + .4);
  },
  boom(k = 1) {   // 一聲心跳般的重擊
    const t = A.currentTime;
    I.taiko(sfxBus, t, .9 * k, .6); I.taiko(sfxBus, t + .02, .7 * k, .4);
    noise({ dur: .5, vol: .4 * k, freq: 200, f1: 40, type: "lowpass", wet: .5 });
  },
  roar() {   // 山羊魔王的咆哮：破音的低頻掃頻＋嘶吼雜訊
    const t = A.currentTime;
    [55, 58.3, 82.4].forEach((f, k) => {
      const o = A.createOscillator(), w = dist(), g = A.createGain(), lp = A.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + .4); o.frequency.exponentialRampToValueAtTime(f * .7, t + 2);
      lp.type = "lowpass"; lp.frequency.value = 1400;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35 / (k + 1), t + .12); g.gain.exponentialRampToValueAtTime(.0001, t + 2.1);
      o.connect(w).connect(lp).connect(g); out(g, sfxBus, .6); o.start(t); o.stop(t + 2.2);
    });
    noise({ dur: 1.8, vol: .5, freq: 900, f1: 200, q: 1.5, wet: .6 });
    I.gong(sfxBus, t + .05, .45);
  },
  slam() { SFX.hurt(true); const t = A.currentTime; I.taiko(sfxBus, t, 1, .5); }
};
const sfx = new Proxy(SFX, { get: (o, k) => (...a) => { if (!SET.sound) return; try { ac(); o[k](...a); } catch (e) {} } });

window.HQ = { SET, saveSet, canVibe, vibe, sfx, music };
})();
