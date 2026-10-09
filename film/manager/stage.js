// The world behind and over Super Karen: backdrops, scanlines, flashes, glitch and the CRT.
// bgSVG(kind, T, pal) returns a 1920x1080 SVG. fxDraw(T, f) styles the overlay layers.

const PAL = {
  ice: { a: "#05080c", b: "#0d2a38", c: "#00e5ff", d: "#ff2bd6" },
  hot: { a: "#0b0410", b: "#3a0636", c: "#ff2bd6", d: "#00e5ff" },
  acid: { a: "#020604", b: "#0b2410", c: "#b6ff00", d: "#00ff9c" },
  suburb: { a: "#9fd3ff", b: "#e9f6ff", c: "#ff2bd6", d: "#2fa84f" },
  alarm: { a: "#100204", b: "#3a0610", c: "#ff2a3c", d: "#ffd200" },
  corp: { a: "#0c1a33", b: "#21477a", c: "#9cc8ff", d: "#ffffff" },
};

const W = 1920, HH = 1080;

function gridFloor(T, pal) {
  const horizon = 640, lines = [];
  const scroll = ((T - SONG.phase) / BEAT_P) % 1;
  for (let k = 0; k < 14; k++) {
    const z = (k + 1 - scroll) / 14;
    const y = horizon + Math.pow(z, 2.2) * (HH - horizon);
    lines.push(`<line x1="0" y1="${n2(y)}" x2="${W}" y2="${n2(y)}" stroke-width="${n2(1 + 2 * z)}"/>`);
  }
  for (let k = -14; k <= 14; k++) lines.push(`<line x1="${W / 2 + k * 40}" y1="${horizon}" x2="${W / 2 + k * 260}" y2="${HH}" stroke-width="1.5"/>`);
  return `<g stroke="${pal.c}" opacity="0.55">${lines.join("")}</g>
    <rect x="0" y="${horizon - 2}" width="${W}" height="4" fill="${pal.d}" opacity="0.9"/>
    <ellipse cx="${W / 2}" cy="${horizon}" rx="900" ry="120" fill="${pal.d}" opacity="${n2(0.18 + 0.25 * kickAt(T))}" filter="url(#bgblur)"/>`;
}

function stripes(T, pal) {
  const k = kickAt(T), shift = (T * 140) % 160;
  let s = "";
  for (let x = -400; x < W + 400; x += 160) s += `<rect x="${n2(x + shift)}" y="-200" width="70" height="1500" transform="rotate(20 ${W / 2} ${HH / 2})"/>`;
  return `<g fill="${pal.c}" opacity="${n2(0.12 + 0.35 * k)}">${s}</g>`;
}

function suburb(T, pal) {
  const houses = [[120, 300], [520, 260], [1460, 280], [1760, 250]].map(([x, h]) =>
    `<path d="M${x - 120},${700} L${x - 120},${700 - h * 0.6} L${x},${700 - h} L${x + 120},${700 - h * 0.6} L${x + 120},700 Z" fill="#dfe9f2" stroke="#7b8da0" stroke-width="3"/>
     <rect x="${x - 30}" y="${700 - h * 0.45}" width="60" height="60" fill="#ffe27a" stroke="#7b8da0" stroke-width="3"/>`).join("");
  return `<circle cx="1580" cy="190" r="${n2(80 + 8 * pulse(T))}" fill="#fff3a6"/>${houses}
    <rect x="0" y="700" width="${W}" height="380" fill="#3fbf5f"/>`;
}

function acidWave(T, pal) {
  let d = "";
  for (let k = 0; k <= 160; k++) {
    const t = T - 2 + (k / 160) * 2;
    const v = musicAt(t) * 260 * Math.sin(t * 92 + k * 0.6);
    d += `${k ? "L" : "M"}${n2((k / 160) * W)},${n2(540 + v)} `;
  }
  return `<path d="${d}" fill="none" stroke="${pal.c}" stroke-width="4" opacity="0.8" filter="url(#bgglow)"/>
    <path d="${d}" fill="none" stroke="${pal.d}" stroke-width="2" opacity="0.5" transform="translate(0,14)"/>`;
}

function rays(T, pal, on) {
  let s = "";
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2 + T * 0.4;
    s += `<path d="M960,540 L${n2(960 + Math.cos(a) * 1600)},${n2(540 + Math.sin(a) * 1600)} L${n2(960 + Math.cos(a + 0.12) * 1600)},${n2(540 + Math.sin(a + 0.12) * 1600)} Z"/>`;
  }
  return `<g fill="#ffd200" opacity="${n2(0.45 * on)}">${s}</g>`;
}

function bgSVG(kind, T, pal, extra = {}) {
  let body = "";
  if (kind === "grid") body = gridFloor(T, pal);
  if (kind === "stripes") body = stripes(T, pal) + gridFloor(T, pal);
  if (kind === "suburb") body = suburb(T, pal);
  if (kind === "acid") body = acidWave(T, pal);
  if (kind === "corp") body = `<g fill="${pal.c}" opacity="0.07">${Array.from({ length: 40 }, (_, k) => `<circle cx="${(k % 8) * 260 + 80}" cy="${Math.floor(k / 8) * 240 + 60}" r="40"/>`).join("")}</g>`;
  if (extra.rays) body = rays(T, pal, extra.rays) + body;
  return `<svg viewBox="0 0 ${W} ${HH}" width="${W}" height="${HH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bgg" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="${pal.b}"/><stop offset="1" stop-color="${pal.a}"/></radialGradient>
      <filter id="bgblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
      <filter id="bgglow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <rect width="${W}" height="${HH}" fill="${kind === "suburb" ? "url(#sky)" : "url(#bgg)"}"/>
    ${kind === "suburb" ? `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.a}"/><stop offset="1" stop-color="${pal.b}"/></linearGradient></defs><rect width="${W}" height="${HH}" fill="url(#sky)"/>` : ""}
    ${body}
  </svg>`;
}

// f: { flash 0..1, flashColor, glitch 0..1, crt -1..1 (on/off squash), scan 0..1, tint }
function fxDraw(T, f) {
  const flash = document.getElementById("flash");
  flash.style.opacity = f.flash || 0;
  flash.style.background = f.flashColor || "#fff";
  document.getElementById("scan").style.opacity = 0.18 + 0.5 * (f.scan || 0);
  const tint = document.getElementById("tint");
  tint.style.background = f.tint || "transparent";
  tint.style.opacity = f.tint ? f.tintK ?? 0.35 : 0;
  // the CRT: 0 is a full picture, 1 a dead screen; the picture squashes to a bright line on the way
  const c = f.crt || 0;
  const root = document.getElementById("picture");
  const sy = c < 0.5 ? 1 - 1.96 * c : 0.02 * (1 - (c - 0.5) * 2);
  const sx = c < 0.5 ? 1 : 1 - (c - 0.5) * 1.96;
  root.style.transform = `scale(${n2(Math.max(sx, 0.001))},${n2(Math.max(sy, 0.001))})`;
  root.style.filter = `brightness(${n2(1 + 3 * Math.min(1, c * 2))})` + glitchFilter(T, f.glitch || 0);
  document.getElementById("dead").style.opacity = c >= 1 ? 1 : 0;
}

function glitchFilter(T, g) {
  if (g <= 0) return "";
  const j = Math.sin(T * 91) * Math.sin(T * 37);
  const o = n2(4 + 18 * g * Math.abs(j));
  return ` drop-shadow(${o}px 0 0 rgba(255,0,90,${n2(0.6 * g)})) drop-shadow(-${o}px 0 0 rgba(0,240,255,${n2(0.6 * g)}))`;
}
