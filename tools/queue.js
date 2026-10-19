// 產生生圖佇列：node tools/queue.js > work/queue.json
// 卡片用 cards.js 的 gen 描述，參考圖用資料館的頭像與劇照
global.window = global; require("../data.js"); require("../cards.js"); require("../src/qimiao-shiguang/episodes.js");
const fs = require("fs"), path = require("path");
const G = "src/qimiao-shiguang/assets";
const byName = Object.fromEntries(window.EPI.characters.map(c => [c.name, c]));
const refsOf = who => {
  const c = byName[who]; if (!c) return [];
  const r = [c.img];
  (c.gal || []).slice(0, 2).forEach(g => r.push(g[0]));
  return r.map(x => path.join(G, x.replace(/^assets\//, "")));
};
const CARD = "Style: photorealistic cinematic game card character art, vertical 3:4 portrait, waist-up, character centered and fully inside the frame with headroom (no cropped head or hands), dramatic rim lighting, rich atmospheric background, Taiwanese afterlife fantasy (Huangquan underworld). Match the reference photos exactly: same face, hairstyle, hair color, age, outfit and accessories. Do not invent costumes, armor, wings, props or accessories that are not in the reference photos or named above. Head, shoulders and body face the same direction toward the camera; no twisted neck. Absolutely no text, no letters, no subtitles, no watermark, no logo, no card frame.";
const MON = "Style: dark fantasy game monster card art, photorealistic cinematic, vertical 3:4, the whole figure centered and fully inside the frame (nothing cropped), dramatic rim light, plain very dark smoky background with soft vignette so the figure can be cut out. Absolutely no text, no letters, no subtitles, no watermark, no frame.";
const q = [];
for (const [id, c] of Object.entries(window.CARDS)) if (c.gen && !/^yutong\d/.test(id)) q.push({ name: id, prompt: `Card art of ${c.gen}. ${CARD}`, refs: refsOf(c.who) });
const enemies = [
  ["enemy-moqi", "A swirling cloud of purple demonic qi (resentment) with a faint furious ghostly face inside it, violet sparks and wisps, floating.", []],
  ["enemy-yutong", "Lin Yutong turned into a demon after drowning: a teenage girl with a wet short mint-green bob with dark roots, round black glasses, a dark red birthmark around one eye, wearing an orange-red sports t-shirt with black sleeves and navy shorts exactly like the reference, eyes glowing violet, tears, purple demonic qi erupting around her like flames, standing in the underworld city hall at night. Tragic, not gory.", ["src/qimiao-shiguang/assets/ep/ep2-15.jpg", "src/qimiao-shiguang/assets/ep/ep3-01.jpg", "src/qimiao-shiguang/assets/c/c044.jpg"]],
  ["enemy-lajigang", "A thuggish shaved-head high school boy wearing an orange and black sports t-shirt like the bald boy in the background of the reference, sneering and cracking his knuckles, standing beside a school swimming pool at night. Do not copy the face of the boy in the front.", ["src/qimiao-shiguang/assets/g/c045-1.jpg"]],
  ["enemy-laji2", "Laji, an arrogant teenage bully with a black bowl cut in a dark navy athletic track jacket with white stripes and a thick gold chain necklace, shouting with a twisted angry face and grabbing forward with one hand, harbor at night with orange dock lights. Keep his face and hair from the reference.", refsOf("辣雞")],
  ["enemy-laji", "Chen Leji nicknamed Laji, an arrogant spoiled rich teenage boy with a black bowl cut, dark navy athletic track jacket with white stripes and a thick gold chain necklace exactly like the reference, sneering, his hands stained with red flower petals swirling around him, wrecked sports car behind in the dark. Keep his face and hair from the reference.", refsOf("辣雞")]
];
for (const [name, p, refs] of enemies) q.push({ name, prompt: `${p} ${MON}`, refs });
const BG = "Vertical 9:16 game battle background, no people, cinematic photorealistic, darker at the bottom third, no text, no watermark.";
q.push({ name: "bg-ch1", prompt: `${BG} The Sanzu River underworld city hall at night: an old Taiwanese-Japanese colonial style government building with a service counter hall, paper lanterns, violet demonic smoke seeping across the floor, red threads hanging in the air.`, refs: [] });
q.push({ name: "bg-ch2", prompt: `${BG} The Saw Hell of the Taiwanese underworld: a blue-black cavern with rusty giant saw blades and chains, an old wooden steam-train carriage glowing with dim lamplight at the entrance, red flower petals drifting.`, refs: [] });
console.log(JSON.stringify(q, null, 1));
