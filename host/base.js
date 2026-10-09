// The adult host's inputs, palette and drawing helpers. Plain globals, no state.
// Values are FACS action units (0..1), plus gaze, head turn and mouth extras.
//   au1 inner brow up     au2 outer brow up    au4 brows down and together
//   au5 upper lid up      au6 cheek raise      au7 lids tighten
//   au9 nose wrinkle      au10 upper lip up    au12 lip corners up (smile)
//   au14 dimple           au15 corners down    au17 chin raise
//   au18 pucker           au20 lips stretch    au23 lips tighten
//   au24 lips press       au26 jaw drop
//   part lips apart, tongue, tup tongue tip up, bite lower lip under teeth

const HOST_BASE = {
  yaw: 0, pitch: 0, roll: 0, hx: 0, hy: 0, breath: 0,
  gx: 0, gy: 0, pupil: 1, closeL: 0, closeR: 0,
  au1L: 0, au1R: 0, au2L: 0, au2R: 0, au4: 0, au5: 0,
  au6L: 0, au6R: 0, au7L: 0, au7R: 0, au9: 0,
  au10L: 0, au10R: 0, au12L: 0, au12R: 0, au14L: 0, au14R: 0, au15L: 0, au15R: 0,
  au17: 0, au18: 0, au20: 0, au23: 0, au24: 0, au26: 0,
  part: 0, tongue: 0, tup: 0, bite: 0,
};
const SIDED = ["au1", "au2", "au6", "au7", "au10", "au12", "au14", "au15", "close"];

// {au12: .6} means both sides; {au12L: .6} one side.
function hostParams(o) {
  const p = { ...HOST_BASE };
  for (const [k, v] of Object.entries(o || {})) {
    if (SIDED.includes(k)) (p[k + "L"] = v), (p[k + "R"] = v);
    else p[k] = v;
  }
  return p;
}

const H = {
  skin: "#dfa888", shadow: "#b06f57", line: "#8a4f3d",
  lipUp: "#a3625a", lipLo: "#b5766b", hair: "#2a201c", hairLit: "#57443a",
  brow: "#2e221c", iris: "#5d4128", irisDark: "#2a1c12", white: "#f1eae3",
  knit: "#3a4048", knitLit: "#4c535c", knitRib: "#30353c",
};

const n2 = (v) => (Math.round(v * 100) / 100).toString();
const pt = (x, y) => `${n2(x)},${n2(y)}`;
const mix = (a, b, t) => a + (b - a) * t;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// a curve from a to c through b at its middle, sampled
function through(a, b, c, steps) {
  const ctl = [2 * b[0] - (a[0] + c[0]) / 2, 2 * b[1] - (a[1] + c[1]) / 2];
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * ctl[0] + t * t * c[0], u * u * a[1] + 2 * u * t * ctl[1] + t * t * c[1]]);
  }
  return out;
}

// The mouth's geometry in its own frame, shared by the mouth and the cheek folds.
const MOUTH = { y: 620, sx: 1.42, sy: 1.12 };
function mouthCorner(p, side) {
  const a12 = p["au12" + side], a15 = p["au15" + side], a14 = p["au14" + side];
  const w = 33 + 11 * a12 + 8 * p.au20 - 12 * p.au18 - 3 * p.au23 + 2 * a14;
  const y = -16 * a12 + 13 * a15 + 3 * p.au20 - a14 + 6 * p.au26;
  return [side === "L" ? -w : w, y];
}
