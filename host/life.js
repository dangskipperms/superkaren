// The adult host's idle life, shared by every film. Same T, same frame.

// blinks on a fixed seeded schedule, so every render is the same film
const BLINKS = (() => {
  let s = 7, t = 0.9;
  const out = [];
  while (t < 200) {
    out.push(t);
    s = (s * 16807) % 2147483647;
    t += 2.2 + (s / 2147483647) * 3.5;
  }
  return out;
})();

// Her life between moods: seeded blinks, breath, a drifting gaze and head. Pure in T.
function hostLife(T, p) {
  let blink = 0;
  for (const b of BLINKS) {
    const x = (T - b) / 0.16;
    if (x >= 0 && x < 1) blink = Math.sin(x * Math.PI);
  }
  const q = { ...p };
  q.closeL = Math.max(q.closeL, blink);
  q.closeR = Math.max(q.closeR, blink);
  q.breath = Math.sin(T * 1.6);
  q.gx += Math.sin(T * 0.53) * 0.08;
  q.gy += Math.sin(T * 0.41 + 2) * 0.05;
  q.hx += Math.sin(T * 0.37) * 3 + Math.sin(T * 0.91) * 1.5;
  q.hy += Math.sin(T * 0.29 + 1) * 2 + q.breath * 1.5;
  q.roll += Math.sin(T * 0.23) * 0.8;
  return q;
}
