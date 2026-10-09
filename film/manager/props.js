// The music video's props, drawn in SVG on the 1920x1080 frame. Each enters at its own t0.

const FONT = `font-family="Helvetica Neue, Arial Narrow, Impact, sans-serif" font-stretch="condensed" font-weight="900"`;

// slides in from dx, pops to scale, leaves at t1 if given
function enter(T, t0, t1, dx = 0, dy = 0) {
  const a = easeBack((T - t0) / 0.45);
  const b = t1 ? 1 - ease((T - t1) / 0.35) : 1;
  return { k: Math.max(0, Math.min(a, b)), x: dx * (1 - a) + (t1 ? (1 - b) * 900 : 0), y: dy * (1 - a) };
}

function coupon(T, t0, tStamp, tFlick) {
  const e = enter(T, t0, null, 700, 0);
  const fl = ease((T - tFlick) / 0.5);
  const tr = `translate(${n2(1380 + e.x + fl * 900)},${n2(470 - fl * 300)}) rotate(${n2(-6 + fl * 160)}) scale(${n2(e.k)})`;
  const s = ease((T - tStamp) / 0.12), sk = 1 + 1.6 * (1 - s);
  const stamp = T >= tStamp ? `<g transform="rotate(-14) scale(${n2(sk)})" opacity="${n2(s)}">
      <rect x="-230" y="-58" width="460" height="116" rx="10" fill="none" stroke="#ff2a3c" stroke-width="12"/>
      <text x="0" y="36" text-anchor="middle" font-size="104" fill="#ff2a3c" ${FONT}>EXPIRED</text></g>` : "";
  return `<g transform="${tr}">
    <rect x="-300" y="-170" width="600" height="340" rx="16" fill="#fff6d6" stroke="#222" stroke-width="6" stroke-dasharray="22 12"/>
    <text x="0" y="-60" text-anchor="middle" font-size="64" fill="#222" ${FONT}>COUPON</text>
    <text x="0" y="40" text-anchor="middle" font-size="120" fill="#ff2bd6" ${FONT}>10% OFF</text>
    <text x="0" y="120" text-anchor="middle" font-size="30" fill="#555" font-family="Courier New, monospace">VALID UNTIL 03/2019</text>
    ${stamp}</g>`;
}

function lawn(T, t0) {
  const g = ease((T - t0) / 1.2);
  let s = "";
  for (let k = 0; k < 90; k++) {
    const x = k * 22 + 4, h = (60 + ((k * 37) % 50)) * (1 + 1.5 * g);
    const sway = Math.sin(T * 3 + k * 0.7) * 10 * g;
    s += `<path d="M${x},1080 Q${n2(x + sway * 0.5)},${n2(1080 - h * 0.5)} ${n2(x + sway)},${n2(1080 - h)} L${x + 10},1080 Z"/>`;
  }
  return `<g fill="#2fa84f" stroke="#1d7a36" stroke-width="2">${s}</g>`;
}

function dog(T, t0) {
  const e = enter(T, t0, null, -600, 0);
  const bark = pulse(T, 9);
  const woof = [0, 1, 2].map((k) => {
    const u = ((T - t0) / BEAT_P + k / 3) % 1;
    return `<text x="${n2(250 + u * 260)}" y="${n2(560 - u * 220)}" font-size="${n2(60 + 50 * u)}" fill="#ff2bd6" opacity="${n2(1 - u)}" ${FONT}>WOOF</text>`;
  }).join("");
  return `<g transform="translate(${n2(e.x)},0)" opacity="${n2(Math.min(1, e.k))}">
    <g transform="translate(220,820) scale(${n2(1 + 0.06 * bark)})" fill="#2a2018">
      <ellipse cx="0" cy="0" rx="120" ry="60"/><circle cx="110" cy="-60" r="52"/>
      <path d="M90,-110 L70,-170 L130,-115 Z"/><rect x="-100" y="30" width="24" height="90"/><rect x="60" y="30" width="24" height="90"/>
      <path d="M-115,-20 Q-170,-80 -150,-110" stroke="#2a2018" stroke-width="16" fill="none"/>
      <path d="M140,-50 L${n2(185 + 15 * bark)},${n2(-40 + 20 * bark)} L140,-30 Z" fill="#c33"/>
    </g>${woof}</g>`;
}

function notice(T, t0, t1, title, line, color) {
  const e = enter(T, t0, t1, 0, 500);
  return `<g transform="translate(1440,${n2(520 + e.y)}) rotate(4) scale(${n2(e.k)})">
    <rect x="-280" y="-200" width="560" height="400" fill="#fff" stroke="#222" stroke-width="5"/>
    <rect x="-280" y="-200" width="560" height="90" fill="${color}"/>
    <text x="0" y="-135" text-anchor="middle" font-size="56" fill="#fff" ${FONT}>${title}</text>
    <text x="0" y="-30" text-anchor="middle" font-size="40" fill="#222" ${FONT}>${line}</text>
    ${[40, 80, 120, 160].map((y) => `<rect x="-220" y="${y}" width="${n2(440 - (y % 80))}" height="12" fill="#ccc"/>`).join("")}
  </g>`;
}

function medal(T, t0) {
  const e = enter(T, t0, null, 0, -700);
  const spin = Math.cos((T - t0) * 5) ;
  return `<g transform="translate(1450,${n2(470 + e.y)}) scale(${n2(e.k)})">
    <path d="M-60,-300 L-20,-110 L20,-110 L60,-300 Z" fill="#ff2bd6"/>
    <g transform="scale(${n2(Math.max(0.15, Math.abs(spin)))},1)">
      <circle r="150" fill="#ffd200" stroke="#b88a00" stroke-width="12"/>
      <text y="-10" text-anchor="middle" font-size="64" fill="#7a5a00" ${FONT}>#1</text>
      <text y="56" text-anchor="middle" font-size="38" fill="#7a5a00" ${FONT}>HOA MEMBER</text>
    </g></g>`;
}

function stars(T, t0, t1) {
  let s = "";
  for (let k = 0; k < 5; k++) {
    const show = easeBack((T - t0 - k * 0.12) / 0.4);
    const fall = k ? ease((T - t1 - (k - 1) * 0.1) / 0.8) : 0;
    const x = 640 + k * 160, y = 150 + fall * 1100;
    s += `<g transform="translate(${x},${n2(y)}) rotate(${n2(fall * 140 * (k % 2 ? 1 : -1))}) scale(${n2(0.75 * Math.max(0, show))})">
      <path d="M0,-80 L23,-26 L80,-24 L36,12 L50,70 L0,38 L-50,70 L-36,12 L-80,-24 L-23,-26 Z" fill="${k ? "none" : "#b6ff00"}" stroke="#b6ff00" stroke-width="7"/></g>`;
  }
  return s;
}

function review(T, t0) {
  const text = "★☆☆☆☆  Asked for the manager. They sent a human. Unacceptable.";
  const n = Math.max(0, Math.min(text.length, Math.floor((T - t0) * 28)));
  const cursor = Math.floor(T * 3) % 2 ? "▍" : "";
  const e = enter(T, t0 - 0.2, null, 0, 300);
  return `<g transform="translate(960,${n2(150 + e.y)}) scale(${n2(e.k)})">
    <rect x="-760" y="-70" width="1520" height="130" rx="18" fill="#03130a" stroke="#b6ff00" stroke-width="4"/>
    <text x="-720" y="18" font-size="44" fill="#b6ff00" font-family="Courier New, monospace" font-weight="700">${text.slice(0, n)}${cursor}</text></g>`;
}

function phoneFrame(T, t0, rec) {
  const e = enter(T, t0, null, 0, 900);
  const dot = Math.floor(T * 2) % 2 ? 1 : 0.2;
  const secs = Math.max(0, Math.floor(T - t0));
  return `<g transform="translate(0,${n2(e.y)})">
    <rect x="610" y="20" width="700" height="1040" rx="70" fill="none" stroke="#111" stroke-width="40"/>
    <rect x="610" y="20" width="700" height="1040" rx="70" fill="none" stroke="#b6ff00" stroke-width="4"/>
    ${rec ? `<circle cx="700" cy="110" r="16" fill="#ff2a3c" opacity="${dot}"/>
    <text x="728" y="124" font-size="40" fill="#fff" ${FONT}>REC 00:${String(secs).padStart(2, "0")}</text>` : ""}
    ${rec > 0 ? [[650, 160, 1, 1], [1270, 160, -1, 1], [650, 1000, 1, -1], [1270, 1000, -1, -1]].map(([x, y, sx, sy]) =>
      `<path d="M${x},${y + sy * 60} L${x},${y} L${x + sx * 60},${y}" fill="none" stroke="#fff" stroke-width="6" opacity="${n2(rec)}"/>`).join("") : ""}
  </g>`;
}

function clockProp(T, t0, tFlip, tBreak) {
  const e = enter(T, t0, null, 800, 0);
  const flip = ease((T - tFlip) / 0.25);
  const brk = Math.max(0, (T - tBreak) / 0.6);
  const txt = T < tFlip + 0.12 ? "8:59" : "9:00";
  const sq = T < tFlip ? 1 : Math.abs(Math.cos(flip * Math.PI));
  return `<g transform="translate(${n2(1430 + e.x)},440) scale(${n2(e.k)}) rotate(${n2(brk * 8 * Math.sin(T * 40))})">
    <rect x="-330" y="-150" width="660" height="300" rx="24" fill="#1a0306" stroke="#ff2a3c" stroke-width="6"/>
    <text x="0" y="90" text-anchor="middle" font-size="250" fill="#ff2a3c" font-family="Courier New, monospace" font-weight="700" transform="scale(1,${n2(sq)})">${txt}</text>
    <text x="0" y="200" text-anchor="middle" font-size="44" fill="#ffd200" ${FONT}>${T < tFlip ? "STILL OPEN" : "CLOSING TIME"}</text></g>`;
}

function closedSign(T, t0) {
  const e = enter(T, t0, null, 0, -600);
  const sw = Math.sin((T - t0) * 6) * 18 * Math.exp(-(T - t0) * 1.2);
  return `<g transform="translate(1430,${n2(820 + e.y)}) rotate(${n2(sw)}) scale(${n2(e.k)})">
    <path d="M-120,-150 L0,-230 L120,-150" fill="none" stroke="#ccc" stroke-width="5"/>
    <rect x="-220" y="-150" width="440" height="160" rx="16" fill="#ff2a3c"/>
    <text x="0" y="-40" text-anchor="middle" font-size="110" fill="#fff" ${FONT}>CLOSED</text></g>`;
}

function corporate(T, t0) {
  const e = enter(T, t0, null, 700, 0);
  const ring = Math.abs(Math.sin(T * 30)) * (Math.floor(T * 2) % 2);
  const dots = ".".repeat(1 + (Math.floor(T * 3) % 3));
  return `<g transform="translate(${n2(1440 + e.x)},470) scale(${n2(e.k)})">
    <rect x="-200" y="-300" width="400" height="600" rx="50" fill="#0c1a33" stroke="#9cc8ff" stroke-width="6"/>
    <circle cy="-120" r="80" fill="#21477a"/><text y="-95" text-anchor="middle" font-size="80" fill="#9cc8ff" ${FONT}>HQ</text>
    <text y="40" text-anchor="middle" font-size="46" fill="#fff" ${FONT}>CALLING</text>
    <text y="100" text-anchor="middle" font-size="58" fill="#9cc8ff" ${FONT}>CORPORATE${dots}</text>
    <g transform="translate(0,210) rotate(${n2(ring * 12)})"><circle r="56" fill="#2fbf5f"/>
      <path d="M-24,-16 Q-24,22 18,26 L26,14 L12,4 L4,12 Q-8,8 -10,-6 L-2,-14 L-12,-28 Z" fill="#fff"/></g></g>`;
}
