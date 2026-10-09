// A talking face from window.TALK (made by tools/talk.py): moods on the words,
// mouth on the sounds, head and brows on the stresses, eyes on the pauses.
const TK = window.TALK;
const TAU = Math.PI * 2;

TK.moods.forEach((m, i) => (i === 0 ? go(0, 0, m.pose) : go(Math.max(0, m.s - 0.25), 0.45, m.pose)));
BLINKS.push(...TK.blinks);

const loudAt = (T) => {
  const x = T * TK.fps, i = Math.floor(x);
  const a = TK.energy[i] || 0, b = TK.energy[i + 1] || 0;
  return lerp(a, b, x - i);
};

// a pulse that rises fast and dies slowly, for each stressed word
const pulse = (d, rise, fall) => (d < 0 ? 0 : d < rise ? d / rise : Math.exp(-(d - rise) / fall));
const stressAt = (T, lag) => TK.stress.reduce((k, e) => Math.max(k, e.k * pulse(T - e.t - lag, 0.08, 0.25)), 0);

function glanceAt(T) {
  for (const g of TK.glances) {
    if (T < g.a || T > g.b) continue;
    const w = clamp((T - g.a) / 0.12) * clamp((g.b - T) / 0.12);
    return [g.gx * w, g.gy * w];
  }
  return [0, 0];
}

// subtitles: one sentence at a time, each word lit as it is said
const LINES = [];
TK.moods.forEach((m, i) => {
  let ws = TK.words.filter((w) => w.seg === i);
  if (!ws.length) ws = [{ w: m.text, s: m.s, e: m.e }];
  let line = [];
  ws.forEach((w) => {
    line.push(w);
    if (/[.?!]$/.test(w.w)) (LINES.push(line), (line = []));
  });
  if (line.length) LINES.push(line);
});
let shown = "";

function subs(T, ink) {
  const line = LINES.find((l, i) => T >= l[0].s - 0.15 && T < (LINES[i + 1] ? LINES[i + 1][0].s - 0.15 : l[l.length - 1].e + 0.8));
  const html = line ? line.map((w) => `<span class="w${T >= w.s ? " on" : ""}">${w.w}</span>`).join(" ") : "";
  if (html !== shown) ($("subs").innerHTML = html), (shown = html);
  $("subs").style.color = ink;
  const m = [...TK.moods].reverse().find((m) => T >= m.s - 0.25) || TK.moods[0];
  $("mood").textContent = "MOOD · " + m.pose.toUpperCase();
  $("mood").style.color = ink;
}

// a mood's own tell: a tear while sad, a bead of sweat while worried
function tells(s, T) {
  const sad = TK.moods.find((m) => m.pose === "sad");
  const tw = sad ? clamp((T - sad.s) / 0.7) : 0, tf = sad ? clamp((T - sad.s - 0.7) / 1.1) : 0;
  $("tear").setAttribute("transform", `translate(${f(372 - tf * 14)},${f(462 + s.lL + 10 + tf * 120)}) scale(${f(0.3 + tw * 0.6)})`);
  setOpacity("tear", sad ? clamp(tw * 3) * clamp((sad.e + 0.6 - T) / 0.3) : 0);
  const wo = TK.moods.find((m) => m.pose === "worried");
  const sw = wo ? clamp((T - wo.s) / (wo.e - wo.s + 0.4)) : 0;
  $("sweat").setAttribute("transform", `translate(${f(705 - sw * 6)},${f(300 + sw * 140)}) scale(${f(0.6 + clamp(sw * 4) * 0.4)})`);
  setOpacity("sweat", wo ? clamp(sw * 6) * clamp((wo.e + 0.5 - T) / 0.3) : 0);
}

function draw(T) {
  const s = poseAt(T);
  const loud = loudAt(T);
  Object.assign(s, mouthAt(T, TK.mouth, s, loud));
  s.laugh *= 0.35;

  // stresses lift the brows, then the head nods into the word
  const k = stressAt(T, 0), nod = stressAt(T, 0.06);
  s.bLin -= 10 * k; s.bRin -= 10 * k; s.bLout -= 6 * k; s.bRout -= 6 * k;
  s.hy += 8 * nod; s.faceY += 3 * nod;

  // a speaker never holds still: slow sway, a lift on loud syllables
  s.hr += 1.8 * Math.sin(TAU * 0.27 * T);
  s.hx += 6 * Math.sin(TAU * 0.19 * T + 1);
  s.hy -= 5 * loud;

  // eyes: glances in the pauses, tiny saccades in between
  const [gx, gy] = glanceAt(T);
  const beat = Math.floor(T / 0.9);
  s.gx += gx + (((beat * 37) % 7) - 3) * 1.1;
  s.gy += gy + (((beat * 53) % 5) - 2) * 0.9;

  const ink = renderFace(s, T, blinkAt(T));
  tells(s, T);
  subs(T, ink);
}
