// Lip-sync for the adult host: Rhubarb's mouth cues in, muscle values out.
// The mouth shape owns the jaw and lips. The mood keeps the corners, so she can sneer while she talks.

const SPEECH_KEYS = ["au26", "part", "au18", "bite", "tup", "au24", "au23", "au20", "tongue"];
const LIP_LEAD = 0.035; // lips get there a hair before the sound
const ATTACK = 0.07;

function shapeMix(v) {
  return hostParams((MOUTH_SHAPES[v] || MOUTH_SHAPES.X).mix);
}

// cues: [{s, v}] sorted. loud 0..1 scales the jaw. Returns only SPEECH_KEYS, or null at rest.
function mouthFromCues(T, cues, loud = 0.6) {
  const t = T + LIP_LEAD;
  let lo = 0, hi = cues.length - 1;
  if (!cues.length || t < cues[0].s) return null;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cues[mid].s <= t) lo = mid;
    else hi = mid - 1;
  }
  const cur = cues[lo], prev = cues[lo - 1];
  if (cur.v === "X" && (!prev || prev.v === "X")) return null;
  const k = prev ? Math.min(1, (t - cur.s) / ATTACK) : 1;
  const e = k * k * (3 - 2 * k);
  const a = shapeMix(prev ? prev.v : "X"), b = shapeMix(cur.v);
  const gain = 0.75 + 0.5 * loud;
  const out = {};
  for (const key of SPEECH_KEYS) out[key] = (a[key] + (b[key] - a[key]) * e) * (key === "au26" ? gain : 1);
  return out;
}

// Lay a mouth over a face: the mood's corners stay, a little softened.
function withMouth(p, m) {
  if (!m) return p;
  const q = { ...p };
  for (const key of SPEECH_KEYS) q[key] = Math.max(m[key], key === "au24" || key === "au23" ? 0 : p[key] * 0.3);
  for (const s of ["L", "R"]) {
    q["au12" + s] = p["au12" + s] * 0.8;
    q["au15" + s] = p["au15" + s] * 0.8;
  }
  return q;
}
