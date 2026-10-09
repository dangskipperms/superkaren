// The reaction film: Super Karen listens to a narration and reacts, her sliders following.
// REACT (written by tools/react.py) holds the cues, each pinned to a word Whisper heard.
// A cue blends from wherever her face is to its mood. reactDraw(T) is pure in T.

const FILM_DURATION = REACT.duration;

// a mood is an expression, a shade, or one muscle by its slider name
function reactMood(name) {
  const e = EXPRESSIONS[name] || SHADES[name];
  if (e) return e;
  const m = FILM_MUSCLES.find(([k]) => k === name);
  return { label: m[1], mix: { [name]: m[3] === undefined ? 1 : m[3] } };
}

function reactLabel(c) {
  const label = reactMood(c.mood).label;
  return c.k < 1 ? `${label} · ${Math.round(c.k * 100)}%` : label;
}

// her face at full cue c, a mood scaled by k from her rest
function reactTarget(c) {
  const full = hostParams(reactMood(c.mood).mix), base = hostParams({});
  const p = {};
  for (const k of Object.keys(base)) p[k] = base[k] + (full[k] - base[k]) * c.k;
  return p;
}

const REACT_TARGETS = REACT.cues.map(reactTarget);

// the face at T: each cue starts from where the one before had got to
function reactParams(T) {
  let from = hostParams({}), i = -1, env = 0;
  for (let j = 0; j < REACT.cues.length && REACT.cues[j].t <= T; j++) {
    if (j > 0) {
      const c = REACT.cues[j - 1], u = ease((REACT.cues[j].t - c.t) / c.ramp);
      const was = {};
      for (const k of Object.keys(from)) was[k] = from[k] + (REACT_TARGETS[j - 1][k] - from[k]) * u;
      from = was;
    }
    i = j;
  }
  if (i < 0) return { p: from, i, env };
  env = ease((T - REACT.cues[i].t) / REACT.cues[i].ramp);
  const p = {};
  for (const k of Object.keys(from)) p[k] = from[k] + (REACT_TARGETS[i][k] - from[k]) * env;
  return { p, i, env };
}

function filmDraw(T) {
  const { p, i, env } = reactParams(T);
  const n = REACT.cues.length;
  stageDraw(T, p, i < 0 ? "Super Karen" : reactLabel(REACT.cues[i]), i < 0 ? 1 : env,
    i < 0 ? `${n} reactions` : `${i + 1} / ${n}`);
}
