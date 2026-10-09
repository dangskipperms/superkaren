// The adult host's mouth: lips, cavity, teeth, tongue, and the creases around it.

function mouth(p, fx, fy, uid) {
  const jaw = p.au26, part = p.part;
  const side = (k) => [p[k + "L"], p[k + "R"]];
  const [s15L, s15R] = side("au15"), [s14L, s14R] = side("au14"), [s10L, s10R] = side("au10");
  const CL = mouthCorner(p, "L"), CR = mouthCorner(p, "R");
  const thin = 1 - 0.55 * p.au24 - 0.3 * p.au23;
  const tU = 8.5 * thin * (1 + 0.45 * p.au18), tL = 12 * thin * (1 + 0.35 * p.au18);
  const upL = -1 - 7 * s10L - 3 * part, upR = -1 - 7 * s10R - 3 * part;
  const up = (upL + upR) / 2;
  const lo = Math.max(up + 0.2, 1 + 34 * jaw + 5 * part - 3 * p.au17 - 2 * p.bite);
  const half = (c, ym) => `C${pt(c[0] * 0.55, mix(c[1], ym, 0.85))} ${pt(c[0] * 0.25, ym)} ${pt(0, ym)}`;
  const back = (c, ym) => `C${pt(c[0] * 0.25, ym)} ${pt(c[0] * 0.55, mix(c[1], ym, 0.85))} ${pt(c[0], c[1])}`;
  const innerU = `M${pt(...CL)} ${half(CL, upL)} ${back(CR, upR)}`;
  const innerL = `M${pt(...CL)} ${half(CL, lo)} ${back(CR, lo)}`;
  const cav = `M${pt(...CL)} ${half(CL, upL)} ${back(CR, upR)} C${pt(CR[0] * 0.55, mix(CR[1], lo, 0.85))} ${pt(CR[0] * 0.25, lo)} ${pt(0, lo)} C${pt(CL[0] * 0.25, lo)} ${pt(CL[0] * 0.55, mix(CL[1], lo, 0.85))} ${pt(...CL)} Z`;
  const pk = (x, y) => pt(x * (1 - 0.3 * p.au18), y);
  const dip = up - tU + 1, peakL = upL - tU - 2.5, peakR = upR - tU - 2.5;
  const outerU = `M${pt(...CL)} C${pt(CL[0] * 0.6, CL[1] - 1.5)} ${pk(-15, peakL)} ${pk(-9, peakL)} C${pk(-5, peakL)} ${pt(-2, dip)} ${pt(0, dip)} C${pt(2, dip)} ${pk(5, peakR)} ${pk(9, peakR)} C${pk(15, peakR)} ${pt(CR[0] * 0.6, CR[1] - 1.5)} ${pt(...CR)}`;
  const upperBody = `${outerU} C${pt(CR[0] * 0.55, mix(CR[1], upR, 0.85))} ${pt(CR[0] * 0.25, upR)} ${pt(0, upR)} C${pt(CL[0] * 0.25, upL)} ${pt(CL[0] * 0.55, mix(CL[1], upL, 0.85))} ${pt(...CL)} Z`;
  const bot = lo + tL;
  const outerL = `M${pt(...CL)} C${pt(CL[0] * 0.75, CL[1] + tL * 0.8 + (lo - CL[1]) * 0.7)} ${pt(CL[0] * 0.35, bot)} ${pt(0, bot)} C${pt(CR[0] * 0.35, bot)} ${pt(CR[0] * 0.75, CR[1] + tL * 0.8 + (lo - CR[1]) * 0.7)} ${pt(...CR)}`;
  const lowerBody = `${outerL} C${pt(CR[0] * 0.55, mix(CR[1], lo, 0.85))} ${pt(CR[0] * 0.25, lo)} ${pt(0, lo)} C${pt(CL[0] * 0.25, lo)} ${pt(CL[0] * 0.55, mix(CL[1], lo, 0.85))} ${pt(...CL)} Z`;
  const gap = lo - up;
  const lowTeeth = 4 + 31 * jaw;
  const tY = p.tup > 0 ? mix(lo - 9, 3, p.tup) : lo - 9 + 8 * (1 - p.tongue);
  const cid = `${uid}cav`;
  const mx = 500 + fx * 1.1, my = MOUTH.y + fy;
  const marL = s15L, marR = s15R;
  return `<g transform="translate(${pt(mx, my)}) scale(${MOUTH.sx},${MOUTH.sy})">
    <ellipse cx="0" cy="${n2(bot + 9)}" rx="24" ry="${n2(5 + 3 * p.au17)}" fill="${H.shadow}" opacity="${n2(0.35 + 0.35 * p.au17)}" filter="url(#${uid}b3)"/>
    <clipPath id="${cid}"><path d="${cav}"/></clipPath>
    <path d="${cav}" fill="#2a1315"/>
    <g clip-path="url(#${cid})">
      <ellipse cx="0" cy="${n2(tY)}" rx="${n2(20 - 5 * p.tup)}" ry="${n2(10 - 3 * p.tup)}" fill="#ae4f55"/>
      <path d="M-30,-16 L30,-16 L30,${n2(1.5 + p.bite * (lo - 1))} Q0,${n2(5.5 + p.bite * (lo - 1))} -30,${n2(1.5 + p.bite * (lo - 1))} Z" fill="url(#${uid}teeth)"/>
      <path d="M-26,${n2(lowTeeth)} Q0,${n2(lowTeeth - 3)} 26,${n2(lowTeeth)} L26,${n2(lowTeeth + 18)} L-26,${n2(lowTeeth + 18)} Z" fill="url(#${uid}teeth)" opacity="0.92"/>
    </g>
    <path d="${upperBody}" fill="url(#${uid}lipU)"/>
    <path d="${lowerBody}" fill="url(#${uid}lipL)"/>
    <ellipse cx="-2" cy="${n2(lo + tL * 0.45)}" rx="11" ry="2.6" fill="#fff" opacity="0.12" filter="url(#${uid}b1)"/>
    <path d="${innerU}" fill="none" stroke="#4d2321" stroke-width="1.7" opacity="${n2(1 - cl(gap / 4) * 0.6)}"/>
    <path d="${outerU}" fill="none" stroke="#9a4f45" stroke-width="0.8" opacity="0.5"/>
    <circle cx="${n2(CL[0])}" cy="${n2(CL[1])}" r="1.6" fill="#5a2a24" opacity="0.35"/>
    <circle cx="${n2(CR[0])}" cy="${n2(CR[1])}" r="1.6" fill="#5a2a24" opacity="0.35"/>
    <g fill="none" stroke="${H.line}" stroke-linecap="round" stroke-width="1.5">
      <path d="M${pt(CL[0] - 3, CL[1] + 2)} q-4,${n2(8 + 6 * marL)} -2,${n2(14 * marL + 2)}" opacity="${n2(marL * 0.7)}"/>
      <path d="M${pt(CR[0] + 3, CR[1] + 2)} q4,${n2(8 + 6 * marR)} 2,${n2(14 * marR + 2)}" opacity="${n2(marR * 0.7)}"/>
      <path d="M${pt(CL[0] - 3, CL[1] - 4)} q-3,4 0,8" opacity="${n2(s14L * 0.8)}"/>
      <path d="M${pt(CR[0] + 3, CR[1] - 4)} q3,4 0,8" opacity="${n2(s14R * 0.8)}"/>
    </g>
  </g>`;
}
