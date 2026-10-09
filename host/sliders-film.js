// The slider film: Super Karen runs every expression, her sliders rising and falling with it.
// filmDraw(T) is a pure function of time. Its stage is host/stage.js.

// one beat per expression: sliders up, hold, back down, a breath of rest
const BEAT = { up: 0.7, hold: 0.9, down: 0.6, rest: 0.25 };
const BEAT_LEN = BEAT.up + BEAT.hold + BEAT.down + BEAT.rest;
const FILM_INTRO = 1.4, FILM_OUTRO = 1.2;
const FILM_LIST = Object.entries(EXPRESSIONS).filter(([k]) => k !== "neutral");
const FILM_DURATION = FILM_INTRO + FILM_LIST.length * BEAT_LEN + FILM_OUTRO;

function filmBeat(T) {
  const i = Math.floor((T - FILM_INTRO) / BEAT_LEN);
  if (T < FILM_INTRO || i >= FILM_LIST.length) return { i: -1, env: 0 };
  const u = T - FILM_INTRO - i * BEAT_LEN;
  const env = u < BEAT.up ? ease(u / BEAT.up) : u < BEAT.up + BEAT.hold ? 1 : ease(1 - (u - BEAT.up - BEAT.hold) / BEAT.down);
  return { i, env };
}

function filmDraw(T) {
  const { i, env } = filmBeat(T);
  const mix = i < 0 ? {} : FILM_LIST[i][1].mix;
  const full = hostParams(mix), base = hostParams({});
  const p = {};
  for (const k of Object.keys(base)) p[k] = base[k] + (full[k] - base[k]) * env;
  stageDraw(T, p, i < 0 ? "Super Karen" : FILM_LIST[i][1].label, i < 0 ? 1 : env,
    i < 0 ? `${FILM_LIST.length} expressions` : `${i + 1} / ${FILM_LIST.length}`);
}
