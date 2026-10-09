// Each keyframe moves the listed params from where they are to the target.
const KF = [];
const go = (t, d, pose, ease = "power3.inOut") =>
  KF.push({ t, d, set: { ...NEUTRAL, ...POSES[pose] }, ease });
const nudge = (t, d, set, ease = "power2.inOut") => KF.push({ t, d, set, ease });

// blink times, filled by whoever performs
const BLINKS = [];

// parts lag behind or lead the beat: brows lead, mouth trails, hair follows through
const GROUP = (k) =>
  k.startsWith("b") && k !== "blush" && !k.startsWith("bg") ? { delay: -0.04 }
  : /^(mw|mc|mup|mlo|teeth|tongue|pk|tup|bite)/.test(k) ? { delay: 0.05 }
  : /^(hx|hy|hr|squash|shrug|zoom)$/.test(k) ? { delay: 0.03 }
  : k === "tuft" ? { delay: 0.1, ease: "elastic.out(1,0.35)", dur: 0.9 }
  : { delay: 0 };

const EASES = {};
const easeFn = (name) => (EASES[name] ||= gsap.parseEase(name));

function poseAt(T) {
  const out = {};
  for (const k of Object.keys(NEUTRAL)) {
    const g = GROUP(k);
    let v = NEUTRAL[k];
    for (const kf of KF) {
      if (!(k in kf.set)) continue;
      const t0 = kf.t + g.delay;
      if (T < t0) break;
      const d = g.dur && kf.d > 0 ? Math.max(kf.d, g.dur) : kf.d;
      const p = d <= 0 ? 1 : clamp((T - t0) / d);
      const e = easeFn(g.ease || kf.ease)(p);
      const to = kf.set[k];
      v = Array.isArray(v) ? v.map((x, i) => lerp(x, to[i], e)) : lerp(v, to, e);
    }
    out[k] = v;
  }
  return out;
}
// Note: each transition starts from the value reached by the previous one at
// the moment it starts; keyframes on a param never overlap in time, so the
// running value above is exact.

function blinkAt(T) {
  let b = 0;
  for (const t of BLINKS) {
    const d = T - t;
    if (d < 0 || d > 0.26) continue;
    b = Math.max(b, d < 0.08 ? d / 0.08 : d < 0.11 ? 1 : 1 - (d - 0.11) / 0.15);
  }
  return b;
}
