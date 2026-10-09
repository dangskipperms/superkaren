// Time helpers for the music video: the beat grid, loudness, lyrics at T. All pure in T.

const BEAT_P = 60 / SONG.bpm;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const easeOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
const easeBack = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2));
const ramp = (T, a, b) => ease((T - a) / (b - a));
const inside = (T, a, b) => T >= a && T < b;
const lerp = (a, b, t) => a + (b - a) * t;

// beat number and how far into it, from the fitted grid
function beatAt(T) {
  const x = (T - SONG.phase) / BEAT_P;
  const i = Math.floor(x);
  return { i, f: x - i, t: SONG.phase + i * BEAT_P };
}
// 1 on the beat, fading before the next one
function pulse(T, decay = 7) {
  const { f } = beatAt(T);
  return f < 0 ? 0 : Math.exp(-f * BEAT_P * decay);
}
// the time of the first beat at or after t
function snap(t) {
  return SONG.phase + Math.ceil((t - SONG.phase) / BEAT_P - 0.001) * BEAT_P;
}

function envAt(arr, T) {
  const x = T * SONG.fps, i = Math.floor(x);
  if (i < 0 || i + 1 >= arr.length) return 0;
  return lerp(arr[i], arr[i + 1], x - i);
}
const voiceAt = (T) => envAt(SONG.voice, T);
const musicAt = (T) => envAt(SONG.music, T);
const kickAt = (T) => envAt(SONG.kick, T);

// the line being sung, or the last one, and the word inside it
function lineAt(T) {
  let k = -1;
  SONG.lines.forEach((l, i) => { if (l.s - 0.15 <= T) k = i; });
  return k;
}
function wordTime(line, word) {
  return SONG.lines[line].words[word].s;
}

// a seeded noise in -1..1, smooth in T
function wobble(T, seed = 0, speed = 1) {
  const x = T * speed + seed * 17.3;
  return (Math.sin(x * 1.7) + Math.sin(x * 2.9 + 1.3) * 0.6 + Math.sin(x * 4.1 + 2.1) * 0.3) / 1.9;
}
