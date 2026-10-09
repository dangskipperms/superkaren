const HEAD_D =
  "M500,170 C650,170 765,272 765,432 C765,562 722,672 640,742 C596,782 548,806 500,806 C452,806 404,782 360,742 C278,672 235,562 235,432 C235,272 350,170 500,170 Z";
const $ = (id) => document.getElementById(id);

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const f = (n) => n.toFixed(2);

