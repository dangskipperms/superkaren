// Super Karen's performance in the music video: a mood per line, special moves, the groove,
// her idle life and the lip-sync. karen(T, opts) returns her muscle values at T.

const KAREN_MOODS = {
  ...Object.fromEntries(Object.entries(EXPRESSIONS).map(([k, e]) => [k, e.mix])),
  disappointed: { au1: 0.6, au4: 0.25, au15: 0.5, au17: 0.4, au12R: 0.2, au14R: 0.4, closeL: 0.3, closeR: 0.3, pitch: 0.1 },
  demanding: { au4: 0.65, au5: 0.4, au7: 0.3, au23: 0.4, au10: 0.2, pitch: 0.08 },
  smug: { au12L: 0.15, au12R: 0.5, au14R: 0.6, au2R: 0.35, closeL: 0.25, closeR: 0.25, pitch: -0.2 },
  fakeSmile: { au12: 0.85, au6: 0.15, au23: 0.4, au24: 0.2, au2: 0.3, au5: 0.2, pitch: -0.08 },
  whisper: { au4: 0.25, au7: 0.4, au24: 0.25, closeL: 0.35, closeR: 0.35, gx: -0.35, pitch: 0.12, pupil: 0.85 },
  cool: { closeL: 0.4, closeR: 0.4, au24: 0.25, au12R: 0.25, pitch: -0.12 },
  curious: { au1: 0.25, au2: 0.4, au5: 0.2, roll: 3 },
};

// [line, mood, strength], and word-level switches as [line, word, mood, strength]
const LINE_MOODS = [
  [0, "irritated", 0.55], [1, "irritated", 0.85], [2, "disappointed", 0.9],
  [3, "smug", 0.9], [4, "skeptical", 0.9], [5, "contempt", 1], [6, "demanding", 1],
  [7, "demanding", 1], [8, "angry", 0.8], [9, "demanding", 1], [10, "contempt", 1],
  [11, "disgusted", 0.8], [12, "irritated", 1], [13, "smug", 1], [14, "proud", 1.1],
  [15, "demanding", 1], [16, "angry", 0.85], [17, "demanding", 1], [18, "contempt", 1],
  [19, "whisper", 1], [20, "whisper", 1], [21, "thinking", 0.9], [22, "determined", 1],
  [23, "fakeSmile", 0.8], [24, "surprised", 0.8], [25, "angry", 0.9], [26, "angry", 1.1],
  [27, "fakeSmile", 1], [28, "determined", 0.9], [29, "fakeSmile", 1.1],
];
const WORD_MOODS = [
  [2, 2, "angry", 0.7], [2, 3, "disappointed", 0.9], [10, 2, "angry", 1], [18, 2, "angry", 1],
];
// moods between the lines
const GAP_MOODS = [[1.3, "curious", 0.7], [9.7, "cool", 1], [37.0, "cool", 0.8], [74.2, "cool", 0.6], [85.2, "neutral", 1], [97.6, "neutral", 1]];

const MOOD_KEYS = (() => {
  const keys = [];
  for (const [l, m, k] of LINE_MOODS) keys.push({ t: Math.max(0, SONG.lines[l].s - 0.2), m, k });
  for (const [l, w, m, k] of WORD_MOODS) keys.push({ t: wordTime(l, w) - 0.1, m, k });
  for (const [t, m, k] of GAP_MOODS) keys.push({ t, m, k });
  keys.push({ t: SONG.lines[29].e + 0.5, m: "neutral", k: 1 });
  return keys.sort((a, b) => a.t - b.t);
})();

function scaled(name, k) {
  const out = {};
  for (const [key, v] of Object.entries(KAREN_MOODS[name] || {})) out[key] = v * k;
  return hostParams(out);
}
function blend(a, b, e) {
  const out = {};
  for (const key of Object.keys(a)) out[key] = a[key] + (b[key] - a[key]) * e;
  return out;
}

// the mood at T, eased over 0.3s into each new key
function moodAt(T) {
  let i = -1;
  while (i + 1 < MOOD_KEYS.length && MOOD_KEYS[i + 1].t <= T) i++;
  if (i < 0) return scaled("neutral", 1);
  const cur = MOOD_KEYS[i], prev = MOOD_KEYS[i - 1];
  const b = scaled(cur.m, cur.k);
  if (!prev) return b;
  return blend(scaled(prev.m, prev.k), b, ramp(T, cur.t, cur.t + 0.3));
}

// special moves, each a short added curve
const word = (l, w) => wordTime(l, w);
const MOVES = [
  { kind: "shake", s: word(2, 5), d: 1.5 },
  { kind: "roll", s: word(5, 0), d: 1.0 },
  { kind: "side", s: word(10, 0), d: 0.9 }, { kind: "side", s: word(18, 0), d: 0.9 },
  { kind: "lean", s: word(10, 2), d: 1.4 }, { kind: "lean", s: word(18, 2), d: 1.4 },
  { kind: "chin", s: word(14, 0), d: 1.8 },
  { kind: "lean", s: word(26, 0), d: 1.5 },
  { kind: "roll", s: word(28, 3), d: 1.0 },
  { kind: "wink", s: 121.2, d: 0.7 },
  ...SONG.lines.flatMap((l) => l.words.filter((w) => /^manager/i.test(w.w)).map((w) => ({ kind: "nod", s: w.s, d: 0.5 }))),
];

function applyMoves(T, p) {
  for (const m of MOVES) {
    const u = (T - m.s) / m.d;
    if (u < 0 || u > 1) continue;
    const bell = Math.sin(Math.PI * u);
    if (m.kind === "shake") p.yaw += 0.32 * Math.sin(u * Math.PI * 6) * (1 - u);
    if (m.kind === "roll") {
      p.gx = lerp(-0.4, 0.5, ease(u)) * bell + p.gx * (1 - bell);
      p.gy = -1 * bell + p.gy * (1 - bell);
      p.closeL += 0.2 * bell; p.closeR += 0.2 * bell;
      p.pitch -= 0.08 * bell; p.roll += 3 * bell;
    }
    if (m.kind === "side") { p.gx += 0.9 * bell; p.yaw -= 0.3 * bell; p.au2L += 0.4 * bell; }
    if (m.kind === "lean") { p.pitch += 0.15 * bell; p.au4 += 0.2 * bell; }
    if (m.kind === "chin") { p.pitch -= 0.2 * bell; p.roll -= 3 * bell; }
    if (m.kind === "wink") { p.closeL = Math.max(p.closeL, bell); p.au12L += 0.4 * bell; p.au6L += 0.4 * bell; }
    if (m.kind === "nod") p.pitch += 0.14 * Math.exp(-u * 5) * Math.sin(Math.min(1, u * 4) * Math.PI);
  }
  return p;
}

// opts: groove 0..1 (beat bob), mood (a mood name to force), k, seed (clones drift apart), lips (false: mouth shut)
function karen(T, opts = {}) {
  let p = opts.mood ? scaled(opts.mood, opts.k ?? 1) : moodAt(T);
  p = applyMoves(T, p);
  const g = opts.groove ?? 0;
  if (g) {
    const { i, f } = beatAt(T);
    const pl = pulse(T, 6);
    p.hy += 9 * g * pl;
    p.pitch += 0.07 * g * pl;
    p.roll += 2.5 * g * (i % 2 ? 1 : -1) * ease(Math.min(1, f * 3));
  }
  p = hostLife(T + (opts.seed || 0) * 3.7, p);
  if (opts.lips !== false) p = withMouth(p, mouthFromCues(T, SONG.cues, voiceAt(T)));
  return p;
}
