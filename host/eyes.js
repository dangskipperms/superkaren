// The eyes and brows of the adult host. Each takes the face's params and offset.

function brow(side, p, fx, fy, uid) {
  const s = side === "L" ? 1 : -1;
  const X = (x) => (s > 0 ? x : 1000 - x);
  const a1 = p["au1" + side], a2 = p["au2" + side], a4 = p.au4;
  const head = [X(467 + 12 * a4), 421 - 26 * a1 + 15 * a4];
  const peak = [X(424 + 4 * a4), 408 - 8 * a1 - 20 * a2 + 8 * a4];
  const tail = [X(381), 420 - 15 * a2 + 3 * a4 + 7 * a1];
  const pts = through(head, peak, tail, 16);
  const top = [], bot = [];
  pts.forEach((q, i) => {
    const t = i / 16;
    const th = t < 0.5 ? mix(15, 10.5, t * 2) : mix(10.5, 3.5, (t - 0.5) * 2);
    const r = pts[Math.min(i + 1, 16)], l = pts[Math.max(i - 1, 0)];
    let nx = -(r[1] - l[1]), ny = r[0] - l[0];
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    if (ny > 0) (nx = -nx), (ny = -ny);
    top.push([q[0] + nx * th * 0.55 + fx, q[1] + ny * th * 0.55 + fy]);
    bot.push([q[0] - nx * th * 0.45 + fx, q[1] - ny * th * 0.45 + fy]);
  });
  const d = "M" + top.map((q) => pt(...q)).join(" L") + " L" + bot.reverse().map((q) => pt(...q)).join(" L") + " Z";
  return `<path d="${d}" fill="${H.brow}" filter="url(#${uid}b1)"/>`;
}

function eye(side, p, fx, fy, uid) {
  const s = side === "L" ? 1 : -1;
  const cx = (s > 0 ? 432 : 568) + fx, cy = 462 + fy;
  const far = s > 0 ? Math.max(0, -p.yaw) : Math.max(0, p.yaw);
  const sx = 1 - 0.3 * far;
  const a5 = p.au5, a6 = p["au6" + side], a7 = p["au7" + side];
  const close = cl(p["close" + side]);
  const open = 1 + 0.4 * a5 - 0.35 * a7 - 0.15 * a6;
  let hu = 15 * open - Math.max(0, p.gy) * 5 + Math.max(0, -p.gy) * 3;
  let hl = 9 * (1 - 0.75 * a6 - 0.45 * a7) + 2 * a5;
  hu = mix(hu, -hl * 0.55, close);
  hl = mix(hl, hl * 0.55, close);
  const xi = s * 33, xo = -s * 33;
  const innerDrop = 6 * p.au4 - 4 * p["au1" + side]; // anger presses the inner lid, sorrow lifts it
  const U = `M${pt(xi, 3)} C${pt(xi * 0.55, -hu / 0.75 + innerDrop)} ${pt(xo * 0.55, -hu / 0.75)} ${pt(xo, -2)}`;
  const Lr = `C${pt(xo * 0.55, hl / 0.75)} ${pt(xi * 0.5, hl / 0.75)} ${pt(xi, 3)}`;
  const L = `M${pt(xi, 3)} C${pt(xi * 0.5, hl / 0.75)} ${pt(xo * 0.55, hl / 0.75)} ${pt(xo, -2)}`;
  const ap = `${U} ${Lr} Z`;
  const ix = p.gx * 13, iy = p.gy * 7;
  const id = `${uid}ap${side}`;
  const crease = `M${pt(xi * 0.8, -Math.max(hu, 0) - 3)} C${pt(xi * 0.4, -(Math.max(hu, 2) + 12) / 0.75)} ${pt(xo * 0.5, -(Math.max(hu, 2) + 13) / 0.75)} ${pt(xo * 1.05, -Math.max(hu, 0) * 0.5 - 7)}`;
  const feet = a6 + 0.3 * p["au12" + side];
  const fold = hl + 9 + 3 * a6;
  return `<g transform="translate(${pt(cx, cy)}) scale(${n2(sx * 1.1)},1.1)">
    <ellipse cx="${-s * 4}" cy="-20" rx="44" ry="20" fill="${H.shadow}" opacity="0.35" filter="url(#${uid}b6)"/>
    <clipPath id="${id}"><path d="${ap}"/></clipPath>
    <path d="${ap}" fill="url(#${uid}sclera)"/>
    <g clip-path="url(#${id})">
      <circle cx="${n2(ix)}" cy="${n2(iy)}" r="15.5" fill="url(#${uid}iris)"/>
      <circle cx="${n2(ix)}" cy="${n2(iy)}" r="15.5" fill="none" stroke="${H.irisDark}" stroke-width="2.2" opacity="0.8"/>
      <circle cx="${n2(ix)}" cy="${n2(iy)}" r="${n2(5.6 * p.pupil)}" fill="#120c0a"/>
      <circle cx="${n2(ix - 5)}" cy="${n2(iy - 6)}" r="2.8" fill="#fff" opacity="0.9"/>
      <path d="${U}" fill="none" stroke="#2a1d1a" stroke-width="9" opacity="0.22"/>
    </g>
    <path d="${L}" fill="none" stroke="${H.line}" stroke-width="1.4" opacity="0.55"/>
    <path d="${U}" fill="none" stroke="#24180f" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M${pt(xo, -2)} q${n2(-s * 5)},-2 ${n2(-s * 8)},-6" fill="none" stroke="#24180f" stroke-width="2.4" stroke-linecap="round"/>
    <path d="${crease}" fill="none" stroke="${H.line}" stroke-width="1.8" opacity="0.5"/>
    <path d="M${pt(xi * 0.6, fold)} Q0,${n2(fold + 5)} ${pt(xo * 0.75, fold - 3)}" fill="none" stroke="${H.line}" stroke-width="1.3" opacity="${n2(0.18 + 0.4 * a6)}"/>
    <g opacity="${n2(cl(feet) * 0.75)}" stroke="${H.line}" stroke-width="1.3" fill="none" stroke-linecap="round">
      <path d="M${pt(xo - s * 6, -4)} l${n2(-s * 12)},-6"/><path d="M${pt(xo - s * 7, 1)} l${n2(-s * 13)},0"/><path d="M${pt(xo - s * 6, 6)} l${n2(-s * 11)},6"/>
    </g>
  </g>`;
}
