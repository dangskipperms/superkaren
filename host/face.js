// The adult host: a pure function from muscle values to one SVG.
// hostSVG(p, uid, opts) returns markup. Nothing is kept between calls.
// Loads after host/base.js, host/eyes.js, host/mouth.js, host/head.js.
// opts.bg false leaves the backdrop out, for an overlay.

function hostDefs(uid) {
  const blur = (n) => `<filter id="${uid}b${n}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${n}"/></filter>`;
  return `<defs>
    <radialGradient id="${uid}bg" cx="0.42" cy="0.38" r="0.8"><stop offset="0" stop-color="#56636c"/><stop offset="1" stop-color="#1a2026"/></radialGradient>
    <radialGradient id="${uid}sclera" cx="0.5" cy="0.65" r="0.7"><stop offset="0.5" stop-color="${H.white}"/><stop offset="1" stop-color="#d6c2b6"/></radialGradient>
    <radialGradient id="${uid}iris" cx="0.45" cy="0.42" r="0.6"><stop offset="0" stop-color="#9a7046"/><stop offset="0.55" stop-color="${H.iris}"/><stop offset="1" stop-color="${H.irisDark}"/></radialGradient>
    <linearGradient id="${uid}lipU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#984d45"/><stop offset="1" stop-color="${H.lipUp}"/></linearGradient>
    <linearGradient id="${uid}lipL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.lipLo}"/><stop offset="1" stop-color="#a65d52"/></linearGradient>
    <linearGradient id="${uid}teeth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfc4b6"/><stop offset="0.5" stop-color="#eee7dd"/><stop offset="1" stop-color="#d9cfc2"/></linearGradient>
    <linearGradient id="${uid}skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9b597"/><stop offset="0.55" stop-color="${H.skin}"/><stop offset="1" stop-color="#c88a6d"/></linearGradient>
    <linearGradient id="${uid}knit" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="${H.knitLit}"/><stop offset="1" stop-color="#262a30"/></linearGradient>
    <linearGradient id="${uid}hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2d26"/><stop offset="1" stop-color="#1c1512"/></linearGradient>
    ${blur(1)}${blur(3)}${blur(6)}${blur(12)}${blur(22)}
    <filter id="${uid}stub" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="soft"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 -2.6 1.5" result="dots"/>
      <feComposite in="dots" in2="soft" operator="in"/>
    </filter>
  </defs>`;
}

function hostSVG(p, uid = "h", opts = {}) {
  const fx = p.yaw * 22, fy = p.pitch * 10;
  const jaw = p.au26;
  // the jaw drops: the lower face stretches down, the chin narrows a touch
  const J = (x, y) => {
    const w = cl((y - 600) / 132);
    return pt(500 + (x - 500) * (1 - 0.05 * jaw * w), y + 30 * jaw * w);
  };
  const outline = (pts) => "M" + J(...pts[0]) + pts.slice(1).map((c) => " C" + c.map((q) => J(...q)).join(" ")).join("") + " Z";
  const face = outline(FACE_PATH);
  const stub = outline(STUB_PATH);
  const mcx = 500 + fx * 1.1, mcy = MOUTH.y + fy;
  const corner = (s) => {
    const c = mouthCorner(p, s);
    return [mcx + c[0] * MOUTH.sx, mcy + c[1] * MOUTH.sy];
  };
  const fold = (s, c, a12, a10) =>
    `<path d="M${pt(500 + s * 34 + fx * 1.25, 562 + fy)} C${pt(500 + s * (58 + 8 * a12) + fx, 582 + fy)} ${pt(500 + s * (64 + 10 * a12) + fx, 608 + fy)} ${pt(c[0] + s * 8, c[1] + 14)}" fill="none" stroke="${H.line}" stroke-width="2.2" stroke-linecap="round" opacity="${n2(cl(0.05 + 0.55 * a12 + 0.3 * a10 + 0.25 * p.au9))}" filter="url(#${uid}b1)"/>`;
  const forehead = Math.max(p.au1L, p.au1R, (p.au2L + p.au2R) / 2);
  const bx = p.hx * 0.3, by = -p.breath * 6;
  return `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  ${hostDefs(uid)}
  ${opts.bg === false ? "" : `<rect width="1000" height="1000" fill="url(#${uid}bg)"/>`}
  <g transform="translate(${n2(bx)},${n2(by)})">${hostBody(uid)}</g>

  <g transform="translate(${n2(p.hx)},${n2(p.hy)}) rotate(${n2(p.roll)},500,770)">
    ${hostEars(fx)}
    <path d="${face}" fill="url(#${uid}skin)"/>
    <clipPath id="${uid}face"><path d="${face}"/></clipPath>
    <g clip-path="url(#${uid}face)">
      <ellipse cx="${n2(680 - fx * 2)}" cy="480" rx="80" ry="280" fill="${H.shadow}" opacity="0.45" filter="url(#${uid}b22)"/>
      <ellipse cx="${n2(392 + fx)}" cy="${n2(596 - 6 * p.au6L)}" rx="30" ry="12" fill="${H.shadow}" opacity="0.2" filter="url(#${uid}b6)" transform="rotate(-25,392,596)"/>
      <ellipse cx="${n2(612 + fx)}" cy="${n2(596 - 6 * p.au6R)}" rx="30" ry="12" fill="${H.shadow}" opacity="0.28" filter="url(#${uid}b6)" transform="rotate(25,612,596)"/>
      <ellipse cx="${n2(405 + fx)}" cy="${n2(530 - 8 * p.au6L)}" rx="34" ry="14" fill="#fff" opacity="${n2(0.06 + 0.12 * p.au6L)}" filter="url(#${uid}b12)"/>
      <ellipse cx="${n2(595 + fx)}" cy="${n2(530 - 8 * p.au6R)}" rx="34" ry="14" fill="#fff" opacity="${n2(0.03 + 0.08 * p.au6R)}" filter="url(#${uid}b12)"/>
      <path d="${stub}" fill="#5a443b" opacity="0.13" filter="url(#${uid}b12)"/>
      <path d="${stub}" fill="#000" filter="url(#${uid}stub)" opacity="0.32"/>
      <ellipse cx="${n2(472 + fx * 0.5)}" cy="355" rx="70" ry="30" fill="#fff" opacity="0.13" filter="url(#${uid}b22)"/>
      <ellipse cx="${n2(500 + fx)}" cy="${n2(712 + 30 * jaw)}" rx="28" ry="9" fill="#fff" opacity="0.12" filter="url(#${uid}b6)"/>
      <path d="M352,306 C392,282 450,270 500,268 C560,270 612,282 650,306" fill="none" stroke="${H.shadow}" stroke-width="18" opacity="0.35" filter="url(#${uid}b12)"/>
      <path d="M418,${n2(752 + 30 * jaw)} C440,${n2(735 + 30 * jaw)} 560,${n2(735 + 30 * jaw)} 582,${n2(752 + 30 * jaw)}" fill="none" stroke="${H.shadow}" stroke-width="14" opacity="0.4" filter="url(#${uid}b6)"/>
    </g>

    <g opacity="${n2(cl(forehead) * 0.6)}" fill="none" stroke="${H.line}" stroke-width="1.5" stroke-linecap="round" filter="url(#${uid}b1)">
      <path d="M${pt(430 + fx, 382 + fy)} Q${pt(500 + fx, 372 + fy - 6 * p.au1L)} ${pt(570 + fx, 382 + fy)}"/>
      <path d="M${pt(440 + fx, 364 + fy)} Q${pt(500 + fx, 354 + fy - 6 * p.au1L)} ${pt(560 + fx, 364 + fy)}"/>
      <path d="M${pt(452 + fx, 347 + fy)} Q${pt(500 + fx, 339 + fy)} ${pt(548 + fx, 347 + fy)}"/>
    </g>
    <g opacity="${n2(p.au4 * 0.7)}" fill="none" stroke="${H.line}" stroke-width="1.6" stroke-linecap="round" filter="url(#${uid}b1)">
      <path d="M${pt(491 + fx, 424 + fy)} q-2,10 0,22"/><path d="M${pt(509 + fx, 424 + fy)} q2,10 0,22"/>
    </g>

    ${eye("L", p, fx, fy, uid)}
    ${eye("R", p, fx, fy, uid)}
    ${brow("L", p, fx, fy, uid)}
    ${brow("R", p, fx, fy, uid)}
    ${hostNose(p, fx, fy, uid)}
    ${fold(-1, corner("L"), p.au12L, p.au10L)}
    ${fold(1, corner("R"), p.au12R, p.au10R)}
    ${mouth(p, fx, fy, uid)}
    ${hostHair(fx, uid)}
  </g>
</svg>`;
}
