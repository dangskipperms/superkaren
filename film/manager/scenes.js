// The music video's scenes: what is on screen at T. sceneAt(T) returns one plain description:
// { pal, bg, rays, groove, cells: [{x, y, size, tint, flip, rot, op, z, mood, k, seed}], cam, fx, props, kin }

const L = SONG.lines;
const ws = (l, w) => L[l].words[w].s;
const DROP = 95.9, BACK = snap(99.05), BREAK = 112.5, BACK2 = snap(114.3), END = 122.0;
const TINTS = [
  { bg: "#ff2bd6", f: "hue-rotate(0deg) saturate(1.5)" }, { bg: "#00e5ff", f: "hue-rotate(160deg) saturate(1.8)" },
  { bg: "#b6ff00", f: "hue-rotate(250deg) saturate(1.6)" }, { bg: "#ffd200", f: "hue-rotate(300deg) saturate(2)" },
  { bg: "#7a2bff", f: "hue-rotate(90deg) saturate(1.7)" }, { bg: "#ff6a00", f: "hue-rotate(40deg) saturate(1.8) contrast(1.2)" },
];
const ROULETTE = ["delighted", "angry", "skeptical", "surprised", "contempt", "sad", "disgusted", "proud", "afraid", "amused", "smug", "grieving", "tender", "demanding"];

const one = (x = 960, y = 560, size = 1000) => [{ x, y, size }];
function grid(n, size, gap, T, t0, tintShift = 0) {
  const out = [], span = n * size + (n - 1) * gap;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const k = r * n + c;
    out.push({ x: 960 - span / 2 + size / 2 + c * (size + gap), y: 540 - span / 2 + size / 2 + r * (size + gap), size,
      tint: TINTS[(k + tintShift) % TINTS.length], pop: easeBack((T - t0 - k * 0.05) / 0.3), seed: k + 1 });
  }
  return out;
}
function orbit(T, n, rx, ry, size, speed) {
  return Array.from({ length: n }, (_, k) => {
    const a = T * speed + (k / n) * Math.PI * 2, depth = Math.sin(a);
    return { x: 960 + Math.cos(a) * rx, y: 560 + depth * ry, size: size * (0.8 + 0.25 * depth), z: depth > 0 ? 3 : 1, tint: TINTS[k % TINTS.length], seed: k + 1 };
  });
}
const kins = (T, list) => list.map((a) => kinWord(T, ...a)).join("");
const managerWords = (T, color) => kins(T, L.flatMap((l) => l.words.filter((w) => /^manager/i.test(w.w)).map((w) => [w.s, 0.9, "MANAGER", "behind", { size: 360, color }])));

function sceneAt(T) {
  const s = { pal: PAL.ice, bg: "void", groove: 0, cells: one(), cam: { s: 1, x: 0, y: 0, r: 0, fx: 960, fy: 520 }, fx: {}, props: "", kin: "" };

  if (T < 4.2) { // boot: the screen comes on, a close-up pulls back
    s.cam.s = lerp(2.3, 1.1, ramp(T, 1.0, 4.2)); s.cam.fy = 470;
    s.fx.crt = 1 - ease(T / 0.35); s.fx.glitch = T < 0.7 ? 0.6 : 0; s.fx.scan = 0.4;
    s.kin = kins(T, [[L[0].s, 1.4, "EXCUSE ME.", "stamp", { y: 880, size: 120, color: "#00e5ff", rot: -4 }],
      [1.3, 2.9, "SUPER KAREN v2.0", "type", { x: 90, y: 120, size: 44, color: "#00e5ff", align: "left" }],
      [1.9, 2.3, "LOADING ENTITLEMENT.EXE", "type", { x: 90, y: 180, size: 44, color: "#00e5ff", align: "left" }],
      [2.5, 1.7, "CALIBRATING DISAPPOINTMENT 100%", "type", { x: 90, y: 240, size: 44, color: "#ff2bd6", align: "left" }]]);
  } else if (T < 9.7) { // "Excuse me." again, closer; disappointment and a slow push
    s.bg = "grid";
    s.cam.s = 1.1 + 0.2 * easeOut((T - L[1].s) / 0.1) + 0.25 * ramp(T, L[2].s, 9.7);
    s.kin = kins(T, [[L[1].s, 1.6, "EXCUSE ME.", "stamp", { y: 860, size: 150, color: "#ff2bd6", rot: 6 }],
      [ws(2, 2) - 0.05, 0.9, "ANGRY?", "slam", { x: 1500, y: 300, size: 140, color: "#ff2a3c" }],
      [ws(2, 5) - 0.1, 2.3, "DISAPPOINTED", "behind", { size: 260, color: "#00e5ff" }]]);
  } else if (T < 16.3) { // title drop on the beats
    s.pal = PAL.hot; s.bg = "stripes"; s.groove = 1;
    s.cells = one(600, 560, 940);
    s.cam.s = 1 + 0.035 * pulse(T);
    s.fx.flash = 0.7 * Math.exp(-(T - 9.7) * 5);
    const b0 = snap(9.8);
    s.kin = kins(T, [[b0, 6.4, "SPEAK", "slam", { x: 1400, y: 300, size: 190 }],
      [b0 + BEAT_P * 2, 6.4 - BEAT_P * 2, "TO YOUR", "slam", { x: 1400, y: 470, size: 190 }],
      [b0 + BEAT_P * 4, 6.4 - BEAT_P * 4, "MANAGER", "slam", { x: 1400, y: 640, size: 220, color: "#ff2bd6" }],
      [b0 + BEAT_P * 8, 6.4 - BEAT_P * 8, "SUPER KAREN 2.0", "stamp", { x: 1400, y: 840, size: 96, color: "#00e5ff", rot: -5 }],
      [b0 + BEAT_P * 10, 6.4 - BEAT_P * 10, "THE KAREN OF THE FUTURE", "type", { x: 1400, y: 960, size: 46, color: "#fff" }]]);
  } else if (T < 24.2) { // verse 1: the coupon
    s.bg = "grid"; s.groove = 0.5;
    s.cells = one(640, 560, 960);
    s.props = coupon(T, ws(3, 3) - 0.15, ws(4, 2), ws(5, 3));
    if (T >= L[6].s) {
      s.pal = PAL.alarm; s.fx.tint = "#ff0030"; s.fx.tintK = 0.15;
      s.cam = { ...s.cam, s: 1 + 0.35 * ramp(T, L[6].s, L[6].s + 0.5), fx: 640, fy: 500 };
    }
  } else if (T < 37.9) { // hook 1: one Karen, two, four, nine, then the one who wants your manager
    s.pal = PAL.hot; s.bg = "stripes"; s.groove = 1;
    const t2 = ws(7, 1), t3 = L[8].s, t4 = L[9].s, t5 = L[10].s, t6 = ws(10, 2);
    if (T < t2) s.cells = one();
    else if (T < t3) s.cells = [{ x: 500, y: 560, size: 880, tint: TINTS[0], seed: 1 }, { x: 1420, y: 560, size: 880, tint: TINTS[1], seed: 2, flip: true, pop: easeBack((T - t2) / 0.3) }];
    else if (T < t4) s.cells = grid(2, 520, 20, T, t3);
    else if (T < t5) s.cells = grid(3, 345, 12, T, t4, beatAt(T).i);
    else {
      s.cells = one();
      s.cam = { ...s.cam, s: 1 + 0.55 * easeOut((T - t6) / 0.15), fy: 520 };
      s.cam.x = T > t6 && T < t6 + 0.5 ? wobble(T, 1, 30) * 18 : 0;
    }
    s.cam.s *= 1 + 0.03 * pulse(T);
    s.kin = managerWords(T, "#ff2bd6") + kins(T, [[t5, 1.0, "NOT YOU.", "stamp", { x: 1500, y: 280, size: 150, color: "#00e5ff", rot: 8 }],
      [t6, 1.6, "YOUR MANAGER.", "slam", { y: 880, size: 170, color: "#fff" }]]);
  } else if (T < 46.5) { // verse 2: the lawn, the dog, the HOA, the pride
    s.pal = PAL.suburb; s.bg = "suburb"; s.groove = 0.6;
    s.cells = one(720, 600, 980);
    s.rays = ramp(T, L[14].s, L[14].s + 0.4);
    s.props = (T >= L[11].s ? lawn(T, L[11].s) : "") + (T >= L[12].s - 0.2 && T < L[13].s + 0.2 ? dog(T, L[12].s - 0.2) : "")
      + (T >= L[13].s - 0.2 ? notice(T, L[13].s - 0.2, L[14].s - 0.1, "HOA NOTICE", "VIOLATION: FUN", "#ff2bd6") : "")
      + (T >= L[14].s - 0.1 ? medal(T, L[14].s - 0.1) : "");
    s.kin = kins(T, [[ws(11, 4), 1.0, "TOO LONG", "stamp", { x: 1450, y: 260, size: 130, color: "#ff2bd6", rot: -6 }],
      [ws(12, 4), 0.9, "TOO LOUD", "stamp", { x: 1450, y: 260, size: 130, color: "#ff2bd6", rot: 6 }],
      [ws(14, 3), 1.6, "VERY PROUD", "slam", { x: 1450, y: 850, size: 120, color: "#ffd200" }]]);
  } else if (T < 59.4) { // hook 2: an orbit, a mirror, a grid, then the one
    s.pal = PAL.ice; s.bg = "grid"; s.groove = 1;
    const u2 = L[16].s, u3 = L[17].s, u4 = L[18].s, u5 = ws(18, 2);
    if (T < u2) s.cells = [...orbit(T, 6, 700, 300, 260, 1.4), { x: 960, y: 560, size: 760, z: 2 }];
    else if (T < u3) s.cells = [{ x: 560, y: 560, size: 900, tint: TINTS[1], seed: 1 }, { x: 1360, y: 560, size: 900, tint: TINTS[0], flip: true, seed: 2 }];
    else if (T < u4) s.cells = grid(3, 345, 12, T, u3, beatAt(T).i * 2);
    else s.cells = one();
    s.cam.s = (T < u4 ? 1 + 0.07 * pulse(T, 9) : 1 + 0.55 * easeOut((T - u5) / 0.15));
    s.cam.x = T >= u4 ? -1500 * (1 - easeOut((T - u4) / 0.25)) : 0;
    s.fx.glitch = T >= u4 && T < u4 + 0.3 ? 1 : 0;
    s.fx.flash = T >= u3 && T < u4 ? 0.25 * pulse(T, 14) : 0;
    s.kin = managerWords(T, "#00e5ff") + kins(T, [[u4, 1.0, "NOT YOU.", "stamp", { x: 1500, y: 280, size: 150, color: "#ff2bd6", rot: -8 }],
      [u5, 1.6, "YOUR MANAGER.", "slam", { y: 880, size: 170, color: "#fff" }]]);
  } else if (T < 75.6) { // breakdown: whispered, filmed on her phone
    s.pal = PAL.acid; s.bg = "acid"; s.groove = 0.25;
    s.cells = one(960, 560, 760);
    s.fx.scan = 0.7; s.fx.tint = "#00ff60"; s.fx.tintK = 0.06;
    const rec = ramp(T, L[22].s, L[22].s + 0.3);
    s.cam.s = 1 + 0.5 * rec; s.cam.fy = 500;
    s.fx.glitch = rec * 0.5 * (Math.sin(T * 7) > 0.6 ? 1 : 0.2);
    s.props = phoneFrame(T, 59.4, T >= L[22].s ? 1 : 0) + (T < L[21].s + 0.3 ? stars(T, L[19].s, ws(20, 1) + 0.6) : "")
      + (T >= L[21].s - 0.2 && T < L[22].s ? review(T, L[21].s) : "");
  } else if (T < 85.6) { // verse 3: 8:59, closing time
    s.pal = PAL.alarm; s.bg = "grid"; s.groove = 0.7;
    s.cells = one(620, 560, 960);
    s.props = clockProp(T, L[23].s - 0.2, ws(24, 3), ws(26, 4)) + (T >= ws(24, 3) ? closedSign(T, ws(24, 3)) : "");
    const hit = Math.max(Math.exp(-Math.max(0, T - ws(25, 4)) * 5) * (T >= ws(25, 4) ? 1 : 0), Math.exp(-Math.max(0, T - ws(26, 4)) * 5) * (T >= ws(26, 4) ? 1 : 0));
    s.fx.flash = 0.45 * hit; s.fx.flashColor = "#ff2a3c";
    s.cam.x = hit * wobble(T, 3, 40) * 14; s.cam.s = 1 + 0.08 * hit;
    s.kin = kins(T, [[ws(25, 4), 1.2, "NOT MY PROBLEM", "stamp", { x: 1430, y: 800, size: 100, color: "#ffd200", rot: -5 }],
      [ws(26, 4), 1.5, "NOT MY TIME", "stamp", { x: 1430, y: 800, size: 110, color: "#ff2a3c", rot: 5 }]]);
  } else if (T < DROP) { // outro: polite, cold, corporate
    s.pal = PAL.corp; s.bg = "corp"; s.groove = 0.2;
    s.cells = one(700, 560, 1000);
    s.cam.s = lerp(1.25, 1.0, ramp(T, 85.6, DROP)); s.cam.fx = 700;
    s.props = T >= L[28].s - 0.2 ? corporate(T, L[28].s - 0.2) : "";
    s.kin = kins(T, [[ws(28, 4), 1.4, "CORPORATE", "slam", { x: 1440, y: 900, size: 110, color: "#9cc8ff" }]]);
  } else if (T < BACK) { // the music stops: a spotlight, a smile, a dead stare
    s.pal = { a: "#000", b: "#1d2329", c: "#fff", d: "#fff" };
    s.cells = one(960, 560, 1050);
    s.cam.s = lerp(1.0, 1.3, ramp(T, DROP, BACK)); s.cam.fy = 480;
    s.fx.glitch = T > BACK - 0.35 ? 1 : 0;
    s.kin = kins(T, [[L[29].s, 2.2, "HAVE A NICE DAY :)", "slam", { y: 140, size: 110, color: "#ff2bd6" }]]);
  } else if (T < BREAK) { // finale: nine Karens, every mood, on the beat
    s.pal = PAL.hot; s.bg = "stripes"; s.groove = 1;
    const b = beatAt(T).i;
    s.cells = grid(3, 345, 12, T, BACK, Math.floor(b / 4)).map((c, k) => ({ ...c, mood: ROULETTE[(k * 5 + Math.floor((b + k) / 2)) % ROULETTE.length], k: 1, lips: false }));
    s.cam.s = 1.02 + 0.05 * pulse(T, 8); s.cam.r = Math.sin(T * 0.6) * 2.5;
    s.fx.flash = T < BACK + 0.3 ? 0.8 * (1 - (T - BACK) / 0.3) : 0;
    const c0 = BACK, cl = BEAT_P * 8;
    s.kin = kins(T, ["22 EXPRESSIONS", "25 MUSCLES", "LIP-SYNCED TO THE TRUE LYRICS", "0 PIXELS DRAWN BY AI"].map((t, k) =>
      [c0 + k * cl, cl, t, "stamp", { y: 540, size: 110, color: "#fff", rot: k % 2 ? 4 : -4 }]));
  } else if (T < BACK2) { // the break: the grid falls away, one Karen remains
    s.pal = PAL.ice; s.bg = "grid";
    const u = ramp(T, BREAK, BREAK + 1.2);
    s.cells = [{ x: 960, y: 560, size: lerp(345, 1000, u), mood: "neutral", k: 1, seed: 0 }];
    s.kin = kins(T, [[BREAK + 0.4, BACK2 - BREAK, "KAREN 2.0", "behind", { size: 420, color: "#00e5ff" }]]);
  } else { // the party: an orbit of Karens around the proud one, palettes on the bar
    const bar = Math.floor(beatAt(T).i / 4);
    s.pal = [PAL.hot, PAL.ice, PAL.acid][bar % 3]; s.bg = "stripes"; s.groove = 1;
    s.cells = [...orbit(T, 8, 760, 320, 250, 1.1).map((c, k) => ({ ...c, mood: ROULETTE[(k + bar) % ROULETTE.length], k: 1, lips: false })),
      { x: 960, y: 560, size: 820, z: 2, mood: T < END - 1.2 ? "proud" : "delighted", k: 1 }];
    s.cam.r = Math.sin(T * 0.8) * 3; s.cam.s = 1 + 0.05 * pulse(T, 8);
    s.fx.flash = 0.2 * pulse(T, 16);
    s.fx.crt = T > END ? ease((T - END) / 0.6) : 0;
    s.kin = kins(T, [[BACK2, 3.6, "SUPER KAREN 2.0", "stamp", { y: 140, size: 120, color: "#fff", rot: -3 }],
      [BACK2 + 3.75, 3.6, "THE KAREN OF THE FUTURE", "slam", { y: 140, size: 100, color: "#fff" }],
      [BACK2 + 7.5, END - BACK2 - 7.5, "SPEAK TO YOUR MANAGER", "stamp", { y: 140, size: 100, color: "#ffd200", rot: 3 }]]);
  }
  return s;
}
