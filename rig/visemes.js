// The nine Rhubarb mouth shapes as rig values. X, rest, is the mood's own mouth.
//   A  M B P, lips pressed      B  S T K EE, teeth together    C  EH AE, open
//   D  AA, wide open            E  AO ER, rounded              F  OO W, puckered
//   G  F V, teeth on lip        H  L, tongue behind the teeth
const VISEME = {
  A: { mw: 50, mup: 1, mlo: 1, teethU: 0, teethL: 0, tongue: 0, pk: 0.25, tup: 0, bite: 0 },
  B: { mw: 62, mup: -6, mlo: 11, teethU: 7, teethL: 6, tongue: 0, pk: 0, tup: 0, bite: 0 },
  C: { mw: 58, mup: -11, mlo: 34, teethU: 10, teethL: 0, tongue: 0.5, pk: 0, tup: 0, bite: 0 },
  D: { mw: 64, mup: -15, mlo: 60, teethU: 11, teethL: 0, tongue: 0.8, pk: 0, tup: 0, bite: 0 },
  E: { mw: 40, mup: -11, mlo: 36, teethU: 6, teethL: 0, tongue: 0.4, pk: 0.35, tup: 0, bite: 0 },
  F: { mw: 22, mup: -10, mlo: 20, teethU: 0, teethL: 0, tongue: 0, pk: 1, tup: 0, bite: 0 },
  G: { mw: 52, mup: -8, mlo: 5, teethU: 0, teethL: 0, tongue: 0, pk: 0, tup: 0, bite: 1 },
  H: { mw: 54, mup: -11, mlo: 30, teethU: 8, teethL: 0, tongue: 0.6, pk: 0, tup: 1, bite: 0 },
};
const MOUTH_KEYS = ["mw", "mup", "mlo", "teethU", "teethL", "tongue", "pk", "tup", "bite", "mcL", "mcR", "mupL", "mupR"];
// Shapes start a little before the sound: lips get there first.
const MOUTH_LEAD = 0.035;

// What one shape asks of the mouth, coloured by the mood around it.
function shapeTarget(v, mood, loud) {
  if (v === "X") return Object.fromEntries(MOUTH_KEYS.map((k) => [k, mood[k]]));
  const t = { ...VISEME[v] };
  t.mw += (mood.mw - 56) * 0.35;
  t.mlo *= 0.7 + 0.6 * loud;
  t.mup *= 0.7 + 0.6 * loud;
  t.teethU = Math.max(t.teethU, mood.teethU * 0.4);
  t.teethL = Math.max(t.teethL, mood.teethL * 0.5);
  t.pk = Math.max(t.pk, mood.pk * 0.5);
  // the mood keeps the corners: talk while smiling, talk while sulking
  // except in a pucker: the lips gather into a ring whatever the mood
  const keep = 0.75 * (1 - 0.85 * t.pk);
  t.mcL = mood.mcL * keep;
  t.mcR = mood.mcR * keep;
  t.mupL = mood.mupL * 0.6;
  t.mupR = mood.mupR * 0.6;
  return t;
}

// The mouth at time T: blend from the shape before into the shape now.
function mouthAt(T, cues, mood, loud) {
  const tt = T + MOUTH_LEAD;
  let i = 0;
  while (i + 1 < cues.length && cues[i + 1].s <= tt) i++;
  const cur = cues[i], prev = cues[i - 1];
  const next = cues[i + 1];
  const len = (next ? next.s : cur.s + 0.3) - cur.s;
  const attack = Math.min(0.08, Math.max(0.03, len * 0.6));
  const p = prev ? clamp((tt - cur.s) / attack) : 1;
  const e = p * p * (3 - 2 * p);
  const a = shapeTarget(prev ? prev.v : "X", mood, loud);
  const b = shapeTarget(cur.v, mood, loud);
  const out = {};
  for (const k of MOUTH_KEYS) out[k] = lerp(a[k], b[k], e);
  return out;
}
